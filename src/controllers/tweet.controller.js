import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    const tweet = await Tweet.create({
        content,
        owner: new mongoose.Types.ObjectId(req.user._id)
    })
    if(!tweet) throw new ApiError(400, "Error creating tweet");
    return res.status(200).json(new ApiResponse(200,tweet,"Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const user = req.params.userId;
    if (!user) {
        throw new ApiError(400, "User ID is required");
    }
    const tweets = await Tweet.find({
        owner: new mongoose.Types.ObjectId(user)
    })
    if(!tweets) throw new ApiError(400, "Error fetching user tweets");
    return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const tweetId = req.params.tweetId;
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }
    const {content} = req.body;
    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    const tweet = await Tweet.findByIdAndUpdate(tweetId,{
        $set: {
            content
        }
    },{new: true})
    if(!tweet) throw new ApiError(400,"Error updating tweet")
    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const tweetId = req.params.tweetId;
    if(!mongoose.Types.ObjectId.isValid(tweetId)) throw new ApiError(400,"Invalid tweetId")
    await Tweet.findByIdAndDelete(tweetId);
    return res.status(200).json(new ApiResponse(200,{},"Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}