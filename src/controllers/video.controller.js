import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { APIError, ApiError } from "../utils/ApiError.js"
import { APIResponse, ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

//TODO: get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType } = req.query

    const searchQuery = query;

    if (!(sortType === "desc" || sortType === "asc")) {
        throw new APIError(401, "Incorrect query");
    }

    const allVideos = await Video.aggregate([
        {
            $match: {
                title: {
                    $regex: new RegExp(searchQuery, 'i')
                }
            }
        },
        {
            $sort: {
                [sortBy]: sortType === 'desc' ? -1 : 1
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit)
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerInfo"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }

    ])

    return res
        .status(200)
        .json(new APIResponse(200, allVideos, "all Videos fetched"));
})

const getAllVideosByUser = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const searchQuery = query;

    if (userId.length === 0) {
        throw new APIError(401, "kindly add userId")
    }

    const checkUserExist = await User.findById(userId)

    if (!checkUserExist) {
        throw new APIError(400, "User does not exist")
    }

    if (!(sortType === "desc" || sortType === "asc")) {
        throw new APIError(401, "Incorrect query");
    }

    const allVideosbyUser = await Video.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(userId),
                title: {
                    $regex: new RegExp(searchQuery, 'i')
                }
            }
        },
        {
            $sort: {
                [sortBy]: sortType === 'desc' ? -1 : 1
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit)
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerInfo"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }

    ])

    return res
        .status(200)
        .json(new APIResponse(200, allVideosbyUser, "all Videos fetched"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description } = req.body

    if (
        [title, description]
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    getAllVideosByUser,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
