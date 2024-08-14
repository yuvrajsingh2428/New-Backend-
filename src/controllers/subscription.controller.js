import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channelId")
    }

    //Find existing subscription
    const checkSubscribedorNot = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user?._id
    })

    //If a subscription exists, delete it and return a response indicating successful unsubscription.
    if(checkSubscribedorNot){
        await Subscription.deleteOne({
            channel: channelId,
            subscriber: req.user._id
        })
        return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Unsubscribed successfully")
        )
    } else {
        //If not subscribed: Create a new subscription, then find and return the newly created subscription data.
        const newSubscription = await Subscription.create({
            channel: channelId,
            subscriber: req.user._id
        })

        if(!newSubscription){
            throw new ApiError(400, "Something went while saving the subscription data")
        }

        const subscriptionData = await Subscription.findById(newSubscription._id)

        if(!subscriptionData){
            throw new ApiError(401, "Data not found")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, subscriptionData, "Data added successfully")
        )
    }


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(400, "Invlid channelId")
    }

    //Use aggregation to match subscriptions for the given channelId and group by the subscriber field to get a list of subscribers
    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: "$subscriber"
            }
        }
    ])
    if(!subscribers){
        throw new ApiError(401, "subscribers not found")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(200, subscribers, "subscribers fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId){
        throw new ApiError(400, "Invalid subscriberId")
    }

// Use aggregation to match subscriptions for the given subscriberId and group by the channel field to get a list of channels.
    const subscribedChannel = await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(subscriberId)

            }
        },
        {
            $group:{
                _id: "$channel"
            }
        }
    ])
    if(!subscribedChannel){
        throw new ApiError(300, "Subscribed channel not")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribedChannel, "subscribed channel found successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}