import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { APIError } from "../utils/ApiError.js"
import { APIResponse } from "../utils/ApiResponse.js"
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

    if (allVideos.length === 0) {
        return res
            .status(400)
            .json(new APIResponse(400, "No Videos Found."))
    }

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
        [title, description].some((field) => field.trim() === "")
    ) {
        throw new APIError(400, "kindly add title and description")
    }

    const videoFilePath = req.files?.videoFile[0]?.path;
    const thumbnailFilePath = req.files?.thumbnailFile[0]?.path;

    // create alternate method to upload thumbnail or fetch it from cloudinary

    const videoFile = await uploadOnCloudinary(videoFilePath)

    const thumbnailFile = await uploadOnCloudinary(thumbnailFilePath)

    if (!videoFile) {
        throw new APIError(400, "Video is not uploaded.")
    }

    if (!thumbnailFile) {
        throw new APIError(400, "Thumbnail is not uploaded.")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        time: videoFile.duration,
        thumbnail: thumbnailFile.url,
        owner: req.user,
        isPublished: true
    }).select("-api_key")

    if (!video) {
        throw new APIError(500, "Something went wrong while uplading the video")
    }

    return res.status(201).json(
        new APIResponse(200, video, "Video is uploaded successfully.")
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
