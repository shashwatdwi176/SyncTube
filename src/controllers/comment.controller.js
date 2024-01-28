import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const allComments = await Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId), //matching raw video id to video id in database
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: parseInt(limit, 10),
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, { allComments }, "Success"));
  } catch (err) {
    throw new ApiError(400, err?.message || "Comments  not fetched");
  }
});

const addComment = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;

    const userId = req.user._id;
    const { videoId } = req.params;

    if (!content) {
      throw new ApiError(404, "Comment Required");
    }

    const addComments = Comment.create({
      content: content,
      owner: new mongoose.Types.ObjectId(userId),
      video: new mongoose.Types.ObjectId(videoId),
    });

    if (!addComments) {
      throw new ApiError(500, "Something went wrong while adding comments");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { addComments: addComments }, "Success"));
  } catch (error) {
    throw new ApiError(400, error?.message || "Comments not added");
  }
});

const updateComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!commentId?.trim() || isValidObjectId(commentId)) {
      throw new ApiError(400, "Comment id is required or invalid");
    }

    const content = req.body?.content?.trim();

    if (!content) {
      throw new ApiError(400, "Comment is required to update");
    }

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          content,
        },
      },

      {
        new: true,
      }
    );

    if (!comment) {
      throw new ApiError(500, "Something went wrong while updating comment");
    }

    res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment updated successfully"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Comment not updated");
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      throw new ApiError(400, "Comment doesnot exist");
    }

    const updateComment = await Comment.deleteOne({
      _id: commentId,
    });
    return res
      .status(200)
      .json(
        new ApiResponse(200, { updateComment }, "Comment deleted successfully")
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Comment not deleted");
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
