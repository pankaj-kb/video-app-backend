import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortType } = req.query;

    if (!(sortType === "desc" || sortType === "asc")) {
        throw new APIError(401, "incorrect query, check sorting order.");
    }

    const allVideosAggregation = Video.aggregate([
        {
            $match: { isPublished: true }
        },

        {
            $lookup: {
                from: "users",
                as: "owner",
                foreignField: "_id",
                localField: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $arrayElemAt: ["$owner", 0] },
            },
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
    ]);

    const paginatedVideos = await Video.aggregatePaginate(allVideosAggregation, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortType === 'desc' ? -1 : 1 },
        customLabels: {
            docs: 'videos',
            totalDocs: 'totalVideos'
        }
    });

    if (!paginatedVideos) {
        throw new APIError(400, "Something went wrong while loading videos.");
    }

    return res
        .status(200).
        json(new APIResponse(200, paginatedVideos, "Fetched all the videos."))
});

const getAllVideosWithQuery = asyncHandler(async (req, res) => {
    const { page, limit, query, sortBy, sortType } = req.query

    console.log("req.query: ", req.query)

    if (!(sortType === "desc" || sortType === "asc")) {
        throw new APIError(401, "Incorrect query");
    }


    const allVideosAggregation = Video.aggregate([
        {
            $match: {
                isPublished: true,
                $or: [
                    {
                        title: { $regex: query, $options: 'i' }
                    },
                    {
                        description: { $regex: query, $options: 'i' }
                    }
                ]
            }
        },

        {
            $lookup: {
                from: "users",
                as: "owner",
                foreignField: "_id",
                localField: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $arrayElemAt: ["$owner", 0] },
            },
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
    ]);

    const paginatedVideos = await Video.aggregatePaginate(allVideosAggregation, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortType === 'desc' ? -1 : 1 },
        customLabels: {
            docs: 'videos',
            totalDocs: 'totalVideos'
        }
    });

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
        .json(new APIResponse(200, paginatedVideos, "all Videos with matching query fetched"));
})

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

    const videoAggregation = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                as: "owner",
                localField: "owner",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $arrayElemAt: ["$owner", 0] }
            }
        },
    ])

    const aggregatedVideo = videoAggregation[0];

    return res
        .status(201)
        .json(new APIResponse(201, aggregatedVideo, "Video Fetched Successfully."))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // add validation that video. is owned by logged in user.

    const user = await User.findOne({ _id: req.user._id })

    if (!user) {
        throw new APIError(401, "Kindly login first.")
    }

    const foundVideo = await Video.findById(videoId)

    if (!foundVideo) {
        throw new APIError(404, "Video not found/exist.")
    }

    const isOwner = foundVideo.owner.equals(user._id)
    if (!isOwner) {
        throw new APIError(401, "not authorized.")
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

    // add validation that comment. is owned by logged in user.

    const user = await User.findOne({ _id: req.user._id })

    if (!user) {
        throw new APIError(401, "Kindly login first.")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new APIError(404, "Video not found/exist.")
    }

    const isOwner = video.owner.equals(user._id)

    if (!isOwner) {
        throw new APIError(401, "not authorized.")
    }

    // console.log(video)
    const deleteVideo = await Video.findByIdAndDelete(video)
    // console.log(deleteVideo)

    return res
        .status(201)
        .json(new APIResponse(201, deleteVideo, "Video Deleted Successfully."))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    // add validation that comment. is owned by logged in user.
    const { videoId } = req.params

    const user = await User.findOne({ _id: req.user._id })

    if (!user) {
        throw new APIError(401, "Kindly login first.")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new APIError(404, "Video not found/exist.")
    }

    const isOwner = video.owner.equals(user._id)

    if (!isOwner) {
        throw new APIError(401, "not authorized.")
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
    getAllVideosWithQuery,
    getAllVideosByUser,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}