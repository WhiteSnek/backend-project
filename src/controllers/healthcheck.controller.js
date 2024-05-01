import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import mongoose from "mongoose"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    const check = await mongoose.connection.db.admin().ping();
    if(!check) throw new ApiError(400, "Database connection failed")
    return res.status(200).json(new ApiResponse(200,{},"Everything is okay"))
})

export {
    healthcheck
    }
    