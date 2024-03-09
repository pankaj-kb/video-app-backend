import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { View } from "../models/view.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addView = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if (!videoId) throw new APIError(401, "Kindly provide VideoId");

    const video = await Video.findOne({ _id: videoId })

    if (!video) throw new APIError(404, "Video Does not exist.")

    const createView = await View.create({
        video: video,
        viewer: req.user._id,
    })

    if (!createView) throw new APIError(401, "Something went wrong while adding view to video.")

    const updateVideo = await Video.findByIdAndUpdate(
        videoId,
        { $push: { views: createView._id } },
        { new: true }
    );

    if (!updateVideo) throw new APIError(401, "Something went wrong while updating video view array.")

    const addToWatchHistory = await User.findByIdAndUpdate(
        req.user._id,
        { $push: { watchHistory: video } },
        { new: true }
    );

    if (!addToWatchHistory) throw new APIError(401, "Something went wrong while updating watch-history.")

    return res
        .status(200)
        .json(new APIResponse(200, createView, "Video view updated successfully."))

})

const getWatchHistory = asyncHandler(async (req, res) => {

    const { page, limit, sortBy, sortType } = req.query;

    if (!(sortType === "desc" || sortType === "asc")) {
        throw new APIError(401, "incorrect query, check sorting order.");
    }

    const allViewsAggregation = View.aggregate([
        {
            $match: { viewer: req.user._id }
        },
        {
            $sort: {
                createdAt: sortType === 'desc' ? -1 : 1
            }
        },
        {
            $group: {
                _id: "$video",
                latestView: { $first: "$$ROOT" }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "latestView.video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $addFields: {
                video: { $arrayElemAt: ["$video", 0] },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "video.owner",
                foreignField: "_id",
                as: "video.owner",
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
                "video.owner": { $arrayElemAt: ["$video.owner", 0] },
            },
        },
        {
            $sort: {
                "latestView.createdAt": sortType === 'desc' ? -1 : 1
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit)
        },
    ]);


    const watchHistoryPagination = await View.aggregatePaginate(allViewsAggregation, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortType === 'desc' ? -1 : 1 },
        customLabels: {
            docs: 'videos',
            totalDocs: 'totalVideos'
        }
    })
    if (!watchHistoryPagination) {
        throw new APIError(400, "Something went wrong while loading videos.");
    }

    return res
        .status(200).
        json(new APIResponse(200, watchHistoryPagination, "Fetched all the videos."))
});


export {
    addView,
    getWatchHistory
}