import mongoose from "mongoose";
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
        $limit: parseInt(limit,10),
      }
    ]);

    return res.status(200)
    .json(new ApiResponse(200, {allComments}, "Success"));
  } catch (err) {
    throw new ApiError(400, err?.message || "Comments  not fetched")
  }
});

const addComment = asyncHandler(async (req, res) => {
  try {
    const {content} = req.body;

    const userId = req.user._id;
    const {videoId} = req.params;

    if (!content){
        throw new ApiError(404, "Comment Required")
    }

    const addComments = Comment.create({
        content: content,
        owner: new mongoose.Types.ObjectId(userId),
        video: new mongoose.Types.ObjectId(videoId),
    });

    if (!addComments){
        throw new ApiError(500, "Something went wrong while adding comments");
    }
    return res
    .status(200)
    .json(new ApiResponse(200, {addComments: addComments}, "Success"))
  } catch (error) {
    throw new ApiError(400, error?.message || "Comments not added")
  }
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
