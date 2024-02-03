import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    const userid = req.user._id;
    if (!content) {
      throw new ApiError(404, "Tweets cannot be empty");
    }
    const creatTweet = await Tweet.create({
      owner: userid,
      content: content,
    });

    if (!creatTweet) {
      throw new ApiError(500, "Unable to create tweet");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { createTweet }, "Successfully created tweet")
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while creating tweet"
    );
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      throw new ApiError(401, "You do not have permission to read tweet");
    }
    const allTweets = await Tweet.findOne({
      owner: new mongoose.Types.ObjectId(userId),
    });
    if (!allTweets) {
      throw new ApiError(404, "No Tweet available");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { allTweets }, "Tweet fetched successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while fetching tweets"
    );
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const ownerDetails = await Tweet.findOne({
      owner: new mongoose.Types.ObjectId(userId),
    }).select("-content");

    if (!ownerDetails) {
      throw new ApiError(404, "User not found");
    }
    const updateTweet = await tweetId.updateOne(
      { _id: tweetId },
      { $set: { content: content } }
    );
    if (!updateTweet) {
      throw new ApiError(500, "Unable to update tweet");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { updateTweet }, "Tweet updated successfully")
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Something went wrong while updating the tweet"
    );
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user._id;
    const qwnerDetails = await Tweet.findOne({
      owner: new mongoose.Types.ObjectId(userId),
    }).select("-content");
    if (!ownerDetails) {
      throw new ApiError(401, "User is not authenticated");
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deletedTweet) {
      throw new ApiError(500, "Unable to delete tweet");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { deletedTweet }, "Tweet deleted successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while deleting the tweet"
    );
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
