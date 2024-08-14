import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { response } from "express"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(400, "User not found")
    }

    //TODO: create playlist

    // take data from the from the frontend
    // add validation
    // store all data  in an object
    // create new playlists field in database which is an array
    // push the created playlist into the playlists array
    // after than dave the user
    // send the object as a response to frontend

    if (!name){
        throw new ApiError(401, "playlistName must be required")
    }

    if(!description){
        throw new ApiError(400, "Playlist description is required")
    }
    const createPlaylistDetails = {
        name, 
        description, 
        owner: user._id
    }

    //Creates a playlist object and saves it to the database
    const playlist = new Playlist(createPlaylistDetails)
    await playlist.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist created")
    )

})


const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    //This function retrieves all playlists owned by a specific user
    if(!userId){
        throw new ApiError(400, "userId not found")
    }

    const user = await User.findById(userId).select("-password -refreshToken")

    if(!user){
        throw new ApiError(400, "User not found")
    }

    //Fetches the user and their playlists from the database

    const playlists = await Playlist.find({owner: userId})

    if(!playlists){
        throw new ApiError(400, "Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "playlists fetched successfully")
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!playlistId){
        throw new ApiError(401, "Invalid playlistId")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "playlist fetched successfully")
    )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId){
        throw new ApiError(400, "playlistId not found")
    }

    if(!videoId){
        throw new ApiError(400, "videoId not found")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "Playlist not found in database")
    }

    const response = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )
    if(!response){
        throw new ApiError(400, "Something went wrong while adding video to playlist ")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, response, "Video successfully added to playlist")
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!isValidObjectId(playlistId)  && !isValidObjectId(videoId)){
        throw new ApiError(401, "Invalid playlistId and videoId ")
    }
    
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(401, "Playlist not found")
    }

    const reponse =  Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: {
                    $in:[`${videoId}`]
                }
            }
        },
        { new:true }
    )
    if(!response){
        throw new ApiError(400, "Something went wrong while removing video from the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, response, "Video removed from playlist successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError("Invalid playlistId")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "playlist not found")
        
    }

    const response = await Playlist.findByIdAndDelete(playlistId)

    if(!response){
        throw new ApiError(500, "Something went wrong while deleting playlist")
        
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, response, "Playlist deleted successfully")
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(401, "Invalid playlistId")
    }
    if(name?.trim() === "" && description?.trim() === ""){
        throw new ApiError(401, "name and description is required")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
            {  
                $set: {name, description}  //set is used to Updating Fields eg. $set: { playlistName: "New Playlist Name" }
            },
            {new: true}
    )
    if(!playlist){
        throw new ApiError(400, "Error while updating the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}