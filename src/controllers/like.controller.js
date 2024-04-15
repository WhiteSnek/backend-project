import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const user = req.user._id;
    const likeExists = await Like.exists({
        likedBy: user,
        video: videoId
    })
    if(likeExists){
        await Like.deleteOne({
            likedBy: user,
            video: videoId
        })
        return res.status(200).json(new ApiResponse(200, {}, "Deleted from Liked videos"))
    }
    else{
        const likedVideo = await Like.create({
            likedBy: user,
            video: videoId
        })
        return res.status(200).json(new ApiResponse(200, likedVideo, "Added to Liked videos"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const user = req.user._id;
    const likeExists = await Like.exists({
        likedBy: user,
        comment: commentId
    })
    if(likeExists){
        await Like.deleteOne({
            likedBy: user,
            comment: commentId
        })
        return res.status(200).json(new ApiResponse(200, {}, "Deleted from Liked comments"))
    }
    else{
        const likedComment = await Like.create({
            likedBy: user,
            comment: commentId
        })
        return res.status(200).json(new ApiResponse(200, likedComment, "Added to Liked comments"))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const user = req.user._id;
    const likeExists = await Like.exists({
        likedBy: user,
        tweet: tweetId
    })
    if(likeExists){
        await Like.deleteOne({
            likedBy: user,
            tweet: tweetId
        })
        return res.status(200).json(new ApiResponse(200, {}, "Deleted from Liked tweets"))
    }
    else{
        const likedTweet = await Like.create({
            likedBy: user,
            tweet: tweetId
        })
        return res.status(200).json(new ApiResponse(200, likedTweet, "Added to Liked tweets"))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const user = req.user._id;
    const likedVideos = await Like.aggregate([{
        $match: {
            likedBy: new mongoose.Types.ObjectId(req.user._id)
        }
    },
    {
        $lookup: {
            from: 'users',
            localField: 'likedBy',
            foreignField: '_id',
            as: 'likedBy',
            pipeline: [{
                $project: {
                    username: 1,
                    fullname: 1,
                    email: 1,
                }
            }]
        },
        
    },
    {
        $lookup: {
            from: 'videos',
            localField: 'video',
            foreignField: '_id',
            as: 'video',
            pipeline: [{
                $project: {
                    title: 1,
                    videoFile: 1,
                    description: 1,
                }
            }]
        }
    },
    {
        $project: {
            likedBy: 1,
            video: 1
        }
    }
])
    return res.status(200).json(new ApiResponse(200,likedVideos,"Videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}