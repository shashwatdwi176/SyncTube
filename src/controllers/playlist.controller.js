import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const { videoId } = req.params;
  const { userId } = req.user._id;
  try {
    if (!name) {
      throw new ApiError(404, "Playlist name is required");
    }
    const createPlaylist = await playlist.create({
      name,
      description,
      videos: videoId,
      owner: userId,
    });
    if (!createPlaylist) {
      throw new ApiError(500, "Unable to create playlist");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { createPlaylist },
          "Playlist created successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Playlist not created something went wrong"
    );
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    const allPlaylists = await Playlist.find({
      owner: new mongoose.Types.ObjectId(userId),
    });
    if (!allPlaylists) {
      throw new ApiError(401, "No Playlists found");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { allPlaylists }, "Playlist fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while fetching the playlist");
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  try {
    const allPlaylistsById = await Playlist.find({
      _id: new mongoose.Types.ObjectId(playlistId),
    });
    if (!allPlaylistsById) {
      throw new ApiError(401, "No playlist found");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { allPlaylistsById },
          "Playlist fetched successfully by id"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while fetching the playlist by id"
    );
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  try {
    const addToPlaylist = await Playlist.updateOne(
      {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
      {
        $push: { videos: videoId },
      }
    );

    if (!addToPlaylist) {
      throw new ApiError(500, "Unable to update playlist");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { addToPlaylist }, "Playlist updated successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong whie updating the playlist");
  } 
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  try {
    const removeVideoFromPlaylistRequest = await Playlist.updateOne(
        {
            _id: new mongoose.Types.ObjectId(playlistId)
        },
        {
            $pull: {
                videos: new mongoose.Types.ObjectId(videoId)
            }
        }
    )
    if(!removeVideoFromPlaylistRequest){
        throw new ApiError(500,"Unable to update playlist")
    }
  } catch (error) {
    throw new ApiError(500 ,error?.message ||"Something went wrong while updating the playlist")
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  try {
    const deletePlaylistRequest = await Playlist.findByIdAndDelete(
      new mongoose.Types.ObjectId(playlistId)
    );
    if (!deletePlaylistRequest)
      throw new ApiError(500, "Unbale to deleted playlist");
    return res
      .status(200)
      .json(new ApiResponse(200, { deletePlaylistRequest }, "Playlist deleted successfully"));
  } catch (error) {
    throw new ApiError(400, error.message || "Something went wrong while deleting playlist");
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  try {
    if (!name){
        throw new ApiError(404,"Name is required")
    }
    const updatePlaylist =await Playlist.updateOne(
        {
            _id: new mongoose.Types.ObjectId(playlistId)
        },{
            $set: {
                name: name,
                description: description
            }
        }
    )

    if (!updatePlaylist){
        throw new ApiError(500,"Unable to update the playlist")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{updatePlaylist},"Playlist updated successfully"))
  } catch (error) {
    throw new ApiError(500,error?.message  || "Something went wrong while updating the playlist")
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
