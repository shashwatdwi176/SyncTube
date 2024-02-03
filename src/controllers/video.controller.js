import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFile, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortType == "desc" ? -1 : 1;
  }
  let baseQuery = {};
  if (query) {
    baseQuery.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  try {
    const result = await Video.aggregate([
      {
        $match: {
          ...basequery,
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $sort: sortOptions,
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: parseInt(limit),
      },
    ]);
    console.log(result);
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "Videos fetched successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while fetching videos"
    );
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    const userid = req.user._id;
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailFileLocalPath = req.files?.thumbnail?.[0]?.path;
    if (!videoFileLocalPath) {
      throw new ApiError(400, "Video file required");
    }
    if (!thumbnailFileLocalPath) {
      throw new ApiError(400, "Thumbnail required");
    }
    const uploadVideoOnCloudinary =
      await uploadOnCloudinary(videoFileLocalPath);
    const uploadThumbnailCloudinary = await uploadOnCloudinary(
      thumbnailFileLocalPath
    );

    if (!uploadVideoOnCloudinary || !uploadThumbnailCloudinary) {
      throw new ApiError(400, "Error in uploading on cloudinary");
    }

    const videoPublish = await Video.create({
      videoFile: uploadVideoOnCloudinary.url,
      thumbnail: uploadThumbnailCloudinary.url,
      title,
      description,
      duration: uploadVideoOnCloudinary.duration,
      cloudinaryVideoID: uploadVideoOnCloudinary.public_id,
      cloudinaryThumbnailID: uploadThumbnailCloudinary.public_id,
      owner: userid,
    });

    if (!videoPublish) {
      throw new ApiError(500, "Error in uploading on database");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { videoPublish }, "Video uploaded successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while uploading video");
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  try {
    const { videoId } = req.params;
    const videoUrl = await Video.findById(videoId);
    if (!videoUrl) {
      throw new ApiError(404, "Video not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { videoUrl }, "Video fetched successfully"));
  } catch (error) {
    throw new ApiError(
      404,
      error?.message || "Something went wrong while fetching the video"
    );
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  try {
    const { title, description } = req.body;
    const localFilePathOfThumbnail = req.file.path;
    if (!localFilePathOfThumbnail) {
      throw new ApiError(404, "File not found");
    }
    const uploadCloud = await uploadOnCloudinary(localFilePathOfThumbnail);

    if (!uploadCloud.url) {
      throw new ApiError(500, "Unable to upload on cloudinary");
    }
    const public_id_video = await Video.findById(videoId);
    const deleteFileServer = await deleteFile(
      public_id_video.cloudinaryThumbnailID
    );

    const uploadFileOnServer = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          thumbnail: uploadCloud.url,
          cloudinaryThumbnailID: uploadClou.public_id,
          title: title,
          description: description,
        },
      },
      {
        new: true,
      }
    );
    if (!uploadFileOnServer) {
      throw new ApiError(500, "Unable to update video on server");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { uploadFileOnServer },
          "Video updated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while upating the video"
    );
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  try {
    const public_id_video = await Video.findById(
      new mongoose.Types.ObjectId(videoId)
    );

    if (!public_id_video) {
      throw new ApiError(404, "Video not found");
    }

    const cloudinaryVideoID = public_id_video.get("cloudinaryVideoID");

    const deleteFileServer = await deleteFile(cloudinaryVideoID);

    if (!deleteFileServer.result || deleteFileServer.result !== "ok") {
      throw new ApiError(500, "Unable to delete file on cloudinary");
    }

    const uploadfileonServer = await Video.findByIdAndDelete(videoId);

    if (!uploadfileonServer) {
      throw new ApiError(500, "Unable to delete video on server");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { uploadfileonServer },
          "Video deleted successfully"
        )
      );
  } catch (error) {}
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  try {
    const { videoId } = req.params;
    const toggel = await Video.findOneAndUpdate({ _id: videoId }, [
      { $set: { isPublished: { $not: "$isPublished" } } },
    ]);
    return res.status(200).json(new ApiResponse(200, { toggel }, "Updated"));
  } catch (e) {
    throw new ApiError(400, e?.message || "Unable to update video");
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
