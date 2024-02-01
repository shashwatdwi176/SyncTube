import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;
  try {
    const conditions = { subscriber: userId, channel: channelId };
    const subscribed = await Subscription.findOne(conditions);
    if (!subscribed) {
      const createSubscription = await Subscription.create(conditions);
      return res
        .status(200)
        .json(new ApiResponse(200, { createSubscription }, "subscribed"));
    } else {
      const deleteSubscription =
        await Subscription.findOneAndDelete(conditions);
      return res
        .status(200)
        .json(
          new ApiResponse(200, { deleteSubscription }, "Subscription Removed5 ")
        );
    }
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "Something went wrong while adding or removing subscription"
    );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  try {
    const { subscriberId } = req.params;
    const subscribber = await Subscription.find({
      channel: new mongoose.Types.ObjectId(subscriberId),
    });
    return res
      .status(200)
      .json(200, { subscribber }, "Subscriber list fetched successfully");
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "Something went wrong while fetching the subscriber list"
    );
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const { channelId } = req.params;
  try {
    const subscribed = await Subscription.find({
      subscriber: new mongoose.Types.ObjectId(channelId),
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { subscribed },
          "Channel Subscribed list fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "Something went wrong while fetching the channel subscribed list"
    );
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
