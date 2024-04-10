import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const comments =await Comment.find(
        {video: videoId}
    )
    if(!comments) throw new ApiError(400, "Error fetching comments")
    return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"))
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
        video,
        owner: user
    })
    if(!comment) throw new ApiError(400, "Error in adding comment")
    return res.status(200).json(new ApiResponse(200,comment,"Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }