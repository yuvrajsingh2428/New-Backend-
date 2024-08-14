import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { content } = req.body //The content holds the text of the tweet that the user wants to create.

    if( content?.trim()===""){ //The code checks if the content is either missing or consists only of whitespace.
        throw new ApiError(400, "Content is missing")
    }
    // Creating the Tweet
    try {
        await Tweet.create( { //This line attempts to create a new tweet in the database using the Tweet.create method.
            content: content,  //The tweet's content is set to the value of content
            owner: req.user?._id,
        })
    }
    //Error Handling
    catch(error){
        throw new ApiError(500, "Something went wrong while creating tweet")
    }

    //Sending a Success Response
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Tweet uploaded successfully")
    )


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "invalid userId")
    }
    
    const tweets = await Tweet.aggregate([
        {  //Matching the User's Tweets
            $match: {         //The $match stage filters the tweets in the Tweet collection to only include those where the owner field matches the provided userID
                owner: new mongoose.Types.ObjectId(`${userId}`)
            }
        },
        {  //Looking Up User Details
            $lookup:{
                from: "users",
                localField:"owner",
                foreignField:"_id",
                as:"details",
                pipeline:[
                    {
                        $project: {
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        { // Counting Likes for Each Tweet
            $lookup:{
                from: "likes",
                localField: "_id",  // It uses the tweet’s _id as the link between the two collections
                foreignField: "tweet",
                as: "NumLikes",
            }
        }, // Adding Fields
        {
            $addFields:{  //$addFields stage modifies the document by setting the details field to the first element in the array (since $lookup returns an array)
                details:{
                    $first: "$details"
                },
                likes: {   //: It also adds a likes field to each tweet
                    $size:"$numLikes" //representing the number of likes by calculating the size of the NumLikes array.
                }
            }
        },
    ]) //Handling No Tweets Found
    if (!tweets.length){
        throw new ApiError(400, "Tweets not found")
    }
    //Sending the Response
    return res
    .res(200)
    .json( 
        new ApiResponse(200, tweets, " Tweets fetched successfully")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const {content} = req.body

    if(!content?.trim() === ""){
        throw new ApiError(400, "Empty tweet not allowed")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400," Invalid userId")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId, 
        {
            $set: {
                content,
            }
            
        },
        {new: true}
    )
    if(!tweet){
        throw new ApiError(400, "Something went wrong while updating tweet")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if(isValidObjectId(!tweetId)){
        throw new ApiError(400, "Invalid tweetId")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if(!tweet){
        throw new ApiError(500, "Something went wrong while deleting the tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet deleted successfully")
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}