import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const filter = {};
    if (query) {
        // You can customize this part based on your search requirements
        filter.$or = [
            { title: { $regex: query, $options: 'i' } }, // Case-insensitive title search
            { description: { $regex: query, $options: 'i' } } // Case-insensitive description search
        ];
    }
    if (userId) {
        filter.owner = userId;
    }

    // Construct the sort object based on sortBy and sortType parameters
    const sort = {};
    if (sortBy) {
        sort[sortBy] = sortType === 'desc' ? -1 : 1;
    }

    // Fetch videos from the database based on filter, sort, and pagination
    const videos = await Video.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    // Get total count of videos matching the filter (for pagination)
    const totalCount = await Video.countDocuments(filter);

    // Construct response object with videos and pagination info
    const response = {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
        videos
    };

    // Send back the response
    return res.status(200).json(new ApiResponse(200, response, "Videos fetched successfully"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoLocalPath = req.files?.videoFile[0]?.path;
    if(!videoLocalPath) throw new ApiError(400,"Video file is required")
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if(!thumbnailLocalPath) throw new ApiError(400,"Thumbnail is required")
    const videoPath = await uploadOnCloudinary(videoLocalPath);
    if(!videoPath) throw new ApiError(500,"Error uploading video")
    const thumbnailPath = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnailPath) throw new ApiError(500,"Error uploading thumbnail")
    const video = await Video.create({
        videoFile: videoPath.url,
        thumbnail: thumbnailPath.url,
        title,
        description,
        duration: videoPath.duration,
        views: 0,
        owner: new mongoose.Types.ObjectId(req.user._id)
    })
    if(!video) throw new ApiError(400,"Error uploading video")
    return res.status(200).json(new ApiResponse(200,video,"Video uploaded successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            email: 1
                        }
                    }
                ]
            }
        }
    ])
    if(!video) throw new ApiError("Video not found")
    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const user = req.user;
    const {title,description} = req.body;
    if(!title || !description) throw new ApiError(400,"Title and description is required")
    const thumbnailLocalPath = req.file?.path;
    if(!thumbnailLocalPath) throw new ApiError(400,"Thumbnail is required")
    const thumbnailPath = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnailPath) throw new ApiError(500,"Error uploading thumbnail")
    const video = await Video.findByIdAndUpdate(videoId,{
        $set: {
            title,
            description,
            thumbnail: thumbnailPath.url,
        }
    },{new: true})
    if(!video) throw new ApiError(400,"Error updating details")
    return res.status(200).json(new ApiResponse(200, video, "Details updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video = await Video.findByIdAndDelete(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    return res.status(200).json(new ApiResponse(200, video, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if(!video) throw new ApiError("Error finding video")
    video.isPublished = !video.isPublished;
    const updatedVideo = await video.save()
    if(!updatedVideo) throw new ApiError("Error toggling status")
    return res.status(200).json(new ApiResponse(200, updatedVideo, "Status toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}