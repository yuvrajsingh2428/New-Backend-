import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    // Validate the videoId
    let getAllComments;
    try{
        getAllComments = Comment.aggregate([
            {    //This stage filters the comments to only include those associated with the specific videoId.
                $match: {
                    video: new mongoose.Types.ObjectId(videoId)
                }
            },

            //Look Up User Details for Each Comment

            {  //$lookup: Joins the comments with the users collection to get details about the user who made each comment
                $lookup: {
                    from: "users",
                    localField:"owner",
                    foreignField:"_id",
                    as: "details",
                    pipeline: [ //pipeline: Only specific fields like fullname, avatar, and username are selected
                        {
                            $project:{
                                fullname:1,
                                avatar: 1,
                                username: 1
                            }
                        }
                    ]
                }
                
            },

            //Look Up Likes for Each Comment

            { //$lookup: Joins the comments with the likes collection to count how many likes each comment received.
                $lookup: {
                    from: "likes",
                    localField: "owner",
                    foreignField:"likedBy",
                    as: "likes",
                    pipeline: [
                        { //$match: Filters only the documents where the comment field exists in the likes collection.
                            $match: { 
                                comment:{
                                    $exists: true
                                }
                            }
                        }
                    ]
                }
            },

            // Add User Details and Likes Count to Each Comment

            { //$addFields: Adds the first user’s details to the comment and counts the number of likes it received.
                $addFields:{
                    details:{ //details: Adds the user information as a field called details
                        $first: "$details"
                    }
                }
            },
            {
                $addFields:{
                    likes:{
                        $size: "$likes"
                    }
                }
            }, 

            //Handle Pagination:

            { //$skip: Skips a certain number of comments based on the current page (e.g., if you’re on page 2, it skips the first 10 comments).
                $skip: (page - 1) * limit
            },
            { //$limit: Limits the number of comments returned to the specified limit (e.g., 10 comments per page).
                $limit: parseInt(limit)
            }

        ])

    }  // Execute the Aggregation Pipeline:
    catch(error){
        throw new ApiError(500, "Something went wrong while fetching comments!")
    }

    //Paginate the Results
    const result = await Comment.aggregatePaginate(getAllComments, {page, limit})

    //  Check if Comments Exist

    if (result.docs.length == 0){ // If no comments are found, it returns a response indicating that no comments were found.
        return res.status(200).json(new ApiResponse(200, [], " No Comments Found"))
    }

    // Return the Paginated Comments
    return res
    .status(200)
    .json(         //Sends back the paginated comments along with a success message
        new ApiResponse(200, result.docs, "Comments fetched Successfully!")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params //This is taken from the URL parameters to identify the video to which the comment will be added.

    const {content} = req.body //This is the actual text of the comment, taken from the request body.

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }
    //The code creates a new comment in the database using the Comment.create method.
    const comment = await Comment.create(
        {
        content,              //content: The actual text of the comment
        video: videoId,       //video: The ID of the video the comment is associated with.
        owner: req.user?._id  //owner: The ID of the user who made the comment (assumed to be stored in req.user?._id
        } 
    )
    if (!comment){
        throw new ApiError(400, "Something wrong while adding comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment added successfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params //This is taken from the URL parameters to identify which comment needs to be updated.
    const {content} = req.body //This is the new content of the comment, taken from the request body

    if(content?.trim()===""){
        throw new ApiError(400, "Empty comment not allowed.")
    }
    
    if(!isValidObjectId(commentId)){  //checks if the commentId is a valid MongoDB ObjectID
        throw new ApiError(400, "Invalid commentId")
    }

    // The code attempts to find the comment by its ID and update its content with the new text provided
    const comment = await Comment.findByIdAndUpdate(commentId, 
        { //The ID of the comment that needs to be updated
            content //The new content of the comment
        },
        {new: true} // This option returns the updated document instead of the old one
    )
    if(!comment){
        throw new ApiError(400, "Something went wrong while updating comment")
    }

    return res
    .status(200)
    .json(200, comment, "comment updated successfully")
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params

    if (isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid CommentID")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(200, comment, "Comment deleted successfully")

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }