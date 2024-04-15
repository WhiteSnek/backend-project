import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const user = req.user._id;
    const subscribed = await Subscription.exists({
        subscriber: user,
        channel: new mongoose.Types.ObjectId(channelId)
    })
    if(subscribed){
        await Subscription.deleteOne({
            subscriber: user,
            channel: new mongoose.Types.ObjectId(channelId)
        })
        return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed"))
    }
    else{
        const subscription = await Subscription.create({
            subscriber: user,
            channel: new mongoose.Types.ObjectId(channelId)
        })
        return res.status(200).json(new ApiResponse(200, subscription, "Subscription added"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribers = await Subscription.find(new mongoose.Types.ObjectId(channelId))
    if(!subscribers) throw new ApiError(400, "Can't show subscribers")
    return res.status(200).json(new ApiResponse(200, subscribers, "All subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const subscribedTo = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'channel',
                foreignField: '_id',
                as: 'channel',
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                        }
                    }
                ]
            }
        }
    ])
    if(!subscribedTo) throw new ApiError(400, "Can't show subscribed channels")
    return res.status(200).json(new ApiResponse(200, subscribedTo, "All subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}