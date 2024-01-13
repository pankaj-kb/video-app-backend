import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

//TODO: get all videos based on query, sort, pagination

const getAllVideos = asyncHandler(async (req, res) => {
    const { page, limit, query, sortBy, sortType } = req.query

    const searchQuery = query;

    if (!(sortType === "desc" || sortType === "asc")) {
        throw new APIError(401, "Incorrect query");
    }

    const allVideosAggregation = [
        {
            $match: {
                $or: [{
                    title: {
                        $regex: new RegExp(searchQuery, 'i')
                    }
                },
                {
                    description: {
                        $regex: new RegExp(searchQuery, 'i')
                    }
                }
                ]
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

        //  Add project to display owner info
        // {
        //     $addFields: {
        //         owner: {
        //             $arrayElemAt: ["$owner", 0]
        //         }
        //     }
        // }

    ]

    const paginatedVideos = await Video.aggregatePaginate(allVideosAggregation, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortType === 'desc' ? -1 : 1 },
        customLabels: {
            docs: 'videos',
            totalDocs: 'totalVideos'
        }
    })

    if (!paginatedVideos) {
        throw new APIError(400, "Something went wrong while loading videos.")
    }

    if (paginatedVideos.totalVideos === 0) {
        return res
            .status(400)
            .json(new APIResponse(400, "No Videos Found."))
    }

    return res
        .status(200)
        .json(new APIResponse(200, paginatedVideos, "all Videos fetched"));
})

// get all videos by the user without the query like the userpage

// TOdo: Automate pagination here as well.

const getAllVideosByUser = asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortType, username } = req.query

    if (!username || username.trim() === "") {
        console.error("Error: Kindly add username", req.query);
        throw new APIError(401, "Kindly add username");
    }

    const checkUserExist = await User.findOne({ username })

    if (!checkUserExist) {
        throw new APIError(400, "User does not exist")
    }

    if (!(sortType === "desc" || sortType === "asc")) {
        throw new APIError(401, "Incorrect query");
    }

    const userIdObject = new mongoose.Types.ObjectId(checkUserExist);

    const allVideosbyUser = [
        {
            $match: {
                owner: userIdObject
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
        // TODO: fix issues with this 
        // {
        //     $addFields: {
        //         owner: {
        //             $arrayElemAt: ["$owner", 0]
        //         }
        //     }
        // }
    ]

    const paginatedVideos = await Video.aggregatePaginate(allVideosbyUser, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortType === 'desc' ? -1 : 1 },
        customLabels: {
            docs: 'videos',
            totalDocs: 'totalVideos'
        }
    })

    if (!paginatedVideos) {
        throw new APIError(400, "Something went wrong while loading videos.")
    }

    if (paginatedVideos.totalVideos === 0) {
        return res
            .status(201)
            .json(new APIResponse(201, "No videos from User"))
    }

    return res
        .status(200)
        .json(new APIResponse(200, paginatedVideos, "all Videos fetched"));
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
        owner: req.user._id,
        isPublished: true
    })

    if (!video) {
        throw new APIError(500, "Something went wrong while uplading the video")
    }

    return res.status(201).json(
        new APIResponse(200, video, "Video is uploaded successfully.")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // console.log(req.params)
    // console.log(videoId);

    // if (videoId) {
    //     throw new APIError(401, "Kindly provide videoID.")
    // }

    const video = await Video.findById(videoId)
    // console.log(video)

    if (!video) {
        throw new APIError(404, "Video not found/exist.")
    }

    return res
        .status(201)
        .json(new APIResponse(201, video, "Video Fetched Successfully."))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const foundVideo = await Video.findById(videoId)
    // console.log(video)

    if (!foundVideo) {
        throw new APIError(404, "Video not found/exist.")
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

    const video = await Video.findByIdAndUpdate(foundVideo, {
        $set: {
            videoFile: videoFile,
            thumbnailFile: thumbnailFile,
        }
    },
        { new: true }
    )

    return res
        .status(201)
        .json(new APIResponse(201, video, "Video Fetched Successfully."))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video = await Video.findById(videoId)

    if (!video) {
        throw new APIError(404, "Video not found/exist.")
    }
    console.log(video)
    const deleteVideo = await Video.findByIdAndDelete(video)
    console.log(deleteVideo)

    return res
        .status(201)
        .json(new APIResponse(201, deleteVideo, "Video Deleted Successfully."))
})

// Change publish status of Video.
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if (!video) {
        throw new APIError(404, "Video not found/exist.")
    }

    const updateVideo = await Video.findByIdAndUpdate(videoId, {

        $set: {
            isPublished: !video.isPublished
        }
    },
        {
            new: true
        })

    if (!updateVideo) {
        throw new APIError(404, "Something went wrong while chaning status")
    }

    return res
        .status(200)
        .json(new APIResponse(200, updateVideo, "Stauts changed Successfully."))

    // Test this.
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
