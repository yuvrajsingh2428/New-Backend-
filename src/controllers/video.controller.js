import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    let getAllVideo;   //getAllVideo will store the result of the video query
    
    try {
        getAllVideo = Video.aggregate([
            { // Random sampling of video
                $sample: {
                    size: parseInt(limit)
                }
            },
            { //Joining with User Details:
                $lookup: {    //The $lookup stage joins the video data with user data from the "users" collection.
                    from:"users",        
                    localField:"owner",  //It matches the owner field in the video with the _id field in the "users" collection.
                    foreignField:"_id",
                    as: "details",
                    pipeline: [
                        {
                            $project: {
                                fullname: 1,
                                avatar: 1,
                                username: 1,
                            }
                        }
                    ]
                }
            },
            {  //Simplifying the User Details:
                $addFields: {
                    details: {
                        $first: "$details"
                    }
                }
            }

        ])
    }   
    catch(error) {
        throw new ApiError (
            500,
            "Something went wrong while fetching videos"
        )
    }

    const result = await Video.aggregatePaginate(getAllVideo, { page, limit})
    
    //Check if Any Videos Were Found
    if (result.docs.length == 0){             //result.docs contains the list of videos that were found
        return res
        .status(200)
        .json(  //If no videos were found (length == 0), the code returns a response with a message "No Video Found."
            new ApiResponse (200, [], "No video found")
        ) //200, indicating that the request was successful, but the content is an empty array ([]).
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, result.docs, "Video fetched successfully")
    )

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!title){
        throw new ApiError(400, "Tittle is required")
    }

    if(!description){
        throw new ApiError(400, "Description is required")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.file?.thumbnail[0]?.path

    if(!videoFileLocalPath){
        throw new ApiError (400, "video is required")
    }

    if(!thumbnailLocalPath){
        throw new ApiError (400, "thumbnail is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoFile){
        throw new ApiError (400, "videoFile link is required")
    }
    if(!thumbnail){
        throw new ApiError (400, "Thumbnail link is required")
    }

    const video = await User.create({
        title,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url || "",   // we have not checked above that coverimage is uploaded or not so checking here if not uploaded return empty
        description,
        duration: videoFile.duration,
        isPublished: true,
        owner: req.user?._id,
    })

    if (!video) {
        throw new ApiError(
            500,
            "Something went wrong while uploading the video."
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video published succesfully."));


    

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!isValidObjectId(videoId)) { //isValidObjectId is a function that returns true if the ID is valid and false otherwise.
        throw new ApiError(400, "Invalid Video id")
    }

    const response = await Video.findById(videoId)

    if (!response){
        throw new ApiError(400, "Failed to get the video details")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, response, "Video details fetched successfully")
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    
    const {title, description} = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid VideoID.");
    }

    const thumbnailLocalPath = req.file?.path
    
    if(!title && !description && !thumbnailLocalPath){
        throw new ApiError(400, "Title, description and thumbnail file is necessary")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail.url){
        throw new ApiError(400, "Error while uploading on thumbnail")
    }

    const video = await  Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,  
                description, 
                thumbnail: thumbnail.url
            }
        }, {new: true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "title, description and thumbnail updated successfully"
        ))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }

        // Delete the video from the database

    const deleteVideoFile = await Video.findByIdAndDelete(videoId)

    if(!deleteVideoFile){
        throw new ApiError(400, "error while deleting video from cloudinary")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            null,
            "Video file is deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid user")
    }
    
    const video = await Video.findById(videoId)  //This line searches for the video in the database using the videoId.

    if(!video){
        throw new ApiError(400, "Video not found")
    }

    video.isPublished = !video.isPublished  //If isPublished was true, it becomes false, and if it was false, it becomes true.
    
    await video.save({   //This saves the updated video back to the database.
        validateBeforeSave: false
    })

    return res
    .status(200)
    .json( 200, video, "Published toggled successfully" )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}