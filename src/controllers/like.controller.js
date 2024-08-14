import mongoose, {isValidObjectId, Model} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model"
import { Tweet } from "../models/tweet.model.js"
import { response } from "express"

const toggleLike = async (Model, resourceId, userId) => {

    // The toggleLike Function

    //The function takes three parameters: a Model (like Video or Post), a resourceId (the ID of the resource being liked), and a userID (the ID of the user who is liking or unliking the resource).
    if(isValidObjectId(userId) || !isValidObjectId(resourceId)){
        throw new ApiError(400, "Invalid resourceId and userId")
    }

    // Check if the Resource is Already Liked

    const model = Model.modelName;

    const isLiked = await Like.findOne({
        [model.toLowerCase()]: resourceId,  // It gets the name of the model (e.g., "Video") and converts it to lowercase to match the field names in your database.
        likedBy: userId //It checks if there is already a like record for this resource by this user. If a record is found, it means the user has already liked it.
    })

    // Toggle the Like Status

    let respnse
    try {
        if(!isLiked){  //If the user hasn't liked the resource yet (!isLiked), it creates a new like record.
            response = await Like.create(
                {
                    [model.toLowerCase()]: resourceId,
                    likedBy: userId
                }
            )
        }
        else{ // If the user has already liked the resource (isLiked), it deletes the like record
            respnse = await Like.deleteOne(
                {
                    [model.toLowerCase()]: resourceId,
                    likedBy: userId
                }
            )
        }
    }
    catch (error) {
        throw new ApiError (500, error?.message|| "Something went wrong in Togglelike")
    }

    //Count the Total Likes
     //It uses the countDocuments function to count how many likes the resource currently has.
    const totalLikes = await Like.countDocuments(
        {
            [model.toLowerCase()]: resourceId,
        }
    )
    // it returns an object containing the response (responce), whether the resource was already liked (isLiked), and the total number of likes (totalLikes)
    return {
        response, isLiked, totalLikes
    }

}

    const toggleVideoLike = asyncHandler(async (req, res) => {
        const {videoId} = req.params
        //TODO: toggle like on video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }

    //toggleLike: It calls the toggleLike function to handle the like/unlike logic
    const { isLiked, totalLikes} = await toggleLike(
        Video, videoId, req.user?._id
    )// It gets the videoId from the request parameters and passes it along with the Video model and the user's ID (req.user?._id) to the toggleLike function.
  
    return res
    .status(200)
    .json(
        new ApiResponse(
            200, {totalLikes}, !isLiked? "Video Liked successfully": "Video Liked removed successfullt=y"
    )
  ) 

})


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid commentId")
    }

    const {response, isLiked, totalLikes} = await toggleLike(
        Comment, commentId, req.user?._id
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, {totalLikes}, !isLiked? "Comment Liked successfully":"Comment Liked removed successfully"
        )
    )


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if (!tweetId){
        throw new ApiError(400, "Invalid tweetId")
    }

    const {response, isLiked, totalLikes} = await toggleLike(
        Tweet, tweetId, req.user?._id
    )

    return res
    .status(200)
    .json(200, {totalLikes}, !isLiked? "Tweet Liked successfully": "Tweet Disliked Successfully")

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    //Getting the User ID

    const userId = req.user?._id //The req.user?._id means it will get the user ID if the user exists in the request. If not, it returns undefined

    if(isValidObjectId(userId)){
        throw new ApiError(400, "Invalid uderId")
    }

    //Querying the Database for Liked Videos

    const likedVideo = await Like.aggregate(
        [   
            {   //Matching Likes by User and Checking for Video Existence
                $match:{
                    $and:[
                        {       //likedBy matches the userID
                            likedBy: new mongoose.Types.ObjectId(`$userId`)
                        },
                        {  //The video field exists, ensuring that it is linked to a video
                            video: {$exists: true}
                        }
                    ]
                }
            },
            {
                $lookup: { // Looking Up Video Details
                    //This step connects the Like documents to the corresponding Video documents
                    // It finds videos whose _id matches the video field in the Like collection.
                    from: "videos",
                    localField:"video",
                    foreignField:"_id",
                    as: "video",
                    pipeline: [
                                {   //Looking Up Video Owner Details
                                    $lookup: {
                                    //the code looks up the owner of each video by finding the corresponding user in the users collection    
                                        from:"users",
                                        localField:"owner",
                                        foreignField:"_id",
                                        as:"owner",
                                        pipeline: [
                                            { //It only retrieves specific fields: fullname, username, and avatar
                                                $projects: {
                                                    fullName: 1,
                                                    username: 1,
                                                    avatar: 1,
                                                }
                                            }
                                        ]
                                    }
                                },
                                { // Combining Owner Details into Video Object
                                  //This part takes the first owner record from the lookup results and adds it to the video object. 
                                  //It ensures that the video object now contains information about its owner
                                    $addFields: {
                                        owner: {
                                            $first: "$owner",
                                        }
                                    }

                                }
                                
                    ]
                }
            },
            { //Combining Video Details into the Main Result
                //This step combines the video details (including the owner information) into a single field called details
                // This makes it easier to work with the final result
                    $addFields:{
                        details:{
                            $first: "$video"
                        }
                    }
            }
        ])
        return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideo, "Successfully fetched liked videos")
        )
    
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}