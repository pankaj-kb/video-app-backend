import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {

    // TODO: total video views, total subscribers, total videos count
    // total likes etc.

    // total videos count.
    // const totalVideos = await Video.find({ owner: user._id })

    // const stats = {
    //     totalVideos: totalVideos.length,
    //     statsAggregation,
    // }

    const user = await User.findOne({ _id: req.user._id })

    if (!user) {
        throw new APIError(404, "Kindly login to see stats.")
    }

    const statsAggregation = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "allVideos"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$allVideos"
                },
                totalSubscribers: {
                    $size: "$subscribers"
                }
            }
        },
        {
            $project: {
                allVideos: 1,
                totalVideos: 1,
                subscribers: 1,
                totalSubscribers: 1
            }
        }
    ])

    return res
        .status(200)
        .json(new APIResponse(200, statsAggregation, "User Stats retrieved successfully."))

})

const getChannelVideos = asyncHandler(async (req, res) => {

    const user = req.user._id

    if(!user) {
        throw new APIError(401, "Kindly login First.")
    }

    try {

        const allVideos = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(user._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    as: "allVideos"
                }
            },
            {
              $addFields: {
                totalCount: {
                    $size: "$allVideos"
                }
              }  
            },
            {
                $project:{
                    allVideos: 1,
                    totalCount: 1
                }
            }
        ])

        return res
        .status(200)
        .json(new APIResponse(200, allVideos, "all videos are fetched successfully."))
        
    } catch (error) {
        throw new APIError(404, error)
    }


})

export {
    getChannelStats,
    getChannelVideos
}