import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const videoData = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "Likes",
          localField: "_id",
          foreignField: "video",
          as: "Likes",
        },
      },

      {
        $addFields: {
          likes: {
            $size: {
              $ifNull: ["$likes", []],
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalViews: {
            $sum: "$views",
          },
          totalVideos: {
            $sum: 1,
          },

          totalLikes: {
            $sum: "$likes",
          },
        },
      },
      {
        $project: {
          _id: 0,
          owner: 0,
        },
      },
    ]);
    return res.status(200)
    .json(new ApiResponse(200, { videoData}, "Success"));
  } catch (error) {
    throw new ApiError(400, error.message);
  }
});


const getChannelVideos = asyncHandler(async (req, res) => {
  
    const {userId} = req.params
    try {
        const allVideos = await Video.find({
            owner: new mongoose.Types.ObjectId(userId),
        }).count();

        if (!allVideos){
            throw new ApiError(404,"No video available");
        }
        return res
        .status(200)
        .json(new ApiResponse(200, {allVideos},"Success"));
    } catch (error) {
        throw new ApiError(400, error?.message || "Some error occurred while fetching the videos")
    }
});

export { getChannelStats, getChannelVideos };
