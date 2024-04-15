import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const videoComments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },{
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $lookup:{
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount:{
                    $size: "$likes"
                },
                // owner:{
                //     $first: "$owner"
                // },
                isLiked:{
                    $cond: {
                        if: {$in: [req.user?._id, "$likes.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    username: 1,
                    avatar: 1,
                },
                isLiked: 1,
            }
        }
    ])
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }
    const comments = await Comment.aggregatePaginate(
        videoComments,
        options
    )
    if(!comments) throw new ApiError(400, "Error fetching comments")
    return res.status(200).json(new ApiResponse(200, comments, "Video comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {video} = req.params;
    const user = req.user;
    if(!user) throw new ApiError(400, "Error fetching user")
    if(!content?.trim()) throw new ApiError(400, "Add some content")
    const comment = await Comment.create({
        content,
        video: new mongoose.Types.ObjectId(video),
        owner: new mongoose.Types.ObjectId(req.user._id)
    })
    if(!comment) throw new ApiError(400, "Error in adding comment")
    return res.status(200).json(new ApiResponse(200,comment,"Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body
    if(!content?.trim()) throw new ApiError(400, "Add some content")
    const comment = await Comment.findByIdAndUpdate(commentId,{
        $set: {
            content
        },
        
    },{new: true})
    return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    const comment = await Comment.findByIdAndDelete(commentId);
    return res.status(200).json(new ApiResponse(200,{},"Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }