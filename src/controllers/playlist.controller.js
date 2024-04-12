import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || !description) throw new ApiError(400,"Name and description is required")
    //TODO: create playlist
    const playlist = await Playlist.create({
        name,
        description,
        owner: new mongoose.Types.ObjectId(req.user._id)
    })
    if(!playlist) throw new ApiError(400,"Error creating playlist");
    return res.status(200).json(new ApiResponse(200, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const playlists = await Playlist.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from: 'videos',
                localField: 'videos',
                foreignField: '_id',
                as: 'videos'
            }
        },
    ])
    return res.status(200).json(new ApiResponse(200,playlists,"User playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId);
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const addVideo = await Playlist.findByIdAndUpdate(playlistId,{
        $addToSet: {
            videos: new mongoose.Types.ObjectId(videoId)
        }
    },{new:true})
    return res.status(200).json(new ApiResponse(200,addVideo,"Video added successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const removeVideo = await Playlist.findByIdAndUpdate(playlistId,{
        $pullAll: {
            videos: [new mongoose.Types.ObjectId(videoId)]
        }
    },{new:true})
    return res.status(200).json(new ApiResponse(200,removeVideo,"Video added successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const delPlaylist = await Playlist.findByIdAndDelete(playlistId)
    return res.status(200).json(new ApiResponse(200, delPlaylist,"Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    const updated = await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name,
            description
        }
    },{new: true})
    return res.status(200).json(new ApiResponse(200, updated, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}