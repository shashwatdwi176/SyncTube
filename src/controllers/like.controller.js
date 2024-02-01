import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user.id.toString();

    try {
        const condition = {LikedBy: userId, video: videoId};
        const comment = await Like.findOne(condition);

        if (!comment){
            const createLike = await Like.create(condition);

            return res.status(200)
            .json(new ApiResponse(200 , {createLike},"Video liked successully"))
        }else{
            const removeLike = await Like.findOneAndDelete(condition);

            return res.status(200)
            .json(new ApiResponse(200,{removeLike},"Liked removed successfully"));
        }
        
    } catch (error) {
        
    }throw new ApiError(400, error?.message || "Something went wrong while creating or removing video like")
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    
    const userId = req.user._id.toString();
    try {
        const condition = {LikedBy: userId, comment: commentId};
        const comment = await Like.findOne(condition);
        if (!comment){
            const createLike = await Like.create(condition);
            return res
            .status(200)
            .json(new ApiResponse(200, { createLike} , "Comment liked successfully"));
        }else{
            const removeLike = await Like.findOneAndDelete(condition);

            return res
            .status(200)
            .json(new ApiResponse(200,{removeLike},"Comment liked removed successfully"))
        }
    } catch (error) {
        throw new ApiError(400, error?.message || "Something went wrong while creating or removing comment like")
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user._id;
    const tweetidstr = userId.toString();

    try {
        const condition = {LkedBy: tweetidstr , tweet: tweetId};
        const like = await Like.findOne(condition);

        if (!like){
            const createLike = await Like.create(condition);
            return res
            .status(200)
            .json(new ApiResponse(200, {createLike}, "Tweet liked Successfully"));
        }
        else{
            const removeLike = await Like.findOneAndDelete(condition);
            return res.status(200)
            .json(new ApiResponse(200, {removeLike},"Tweet liked removed successfully"))
        }
    } catch (error) {
        throw new ApiError(400, error?.message || "Something went wrong while creating or removing tweet like")
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    try {
        const allLiked = await like.find({
            LikedBy: userId,
            video : {$exists: true},
        })

        return res.status(200)
        .json(new ApiResponse(200,{allLiked},"Successfully fetched all liked videos"))
    } catch (error) {
        throw new ApiError(400, error?.message || "Liked videos are not fetched")
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}