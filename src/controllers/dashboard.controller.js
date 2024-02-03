import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"
import { Like } from "../models/like.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const { username } = req.params;
    console.log("From stats Username: ", username)
    let user;

    if (username) {
        user = await User.findOne({ username: username });
    } else {
        user = await User.findOne(req.user._id);
    }

    if (!user) {
        throw new APIError(401, "User not found.");
    }

    const userVideos = await Video.find({ owner: user._id });
    const userComments = await Comment.find({ owner: user._id });
    const userTweets = await Tweet.find({ owner: user._id });


    const totalVideoLikes = await Like.countDocuments({ video: { $in: userVideos } });
    const totalCommentLikes = await Like.countDocuments({ comment: { $in: userComments } });
    const totalTweetLikes = await Like.countDocuments({ tweet: { $in: userTweets } });

    const totalLikes = totalCommentLikes + totalTweetLikes + totalVideoLikes

    const userStatsAggregation = await User.aggregate([
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
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "allTweets",
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "owner",
                as: "allComments"
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
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "likedBy",
                as: "likedVideos",
                pipeline: [
                    {
                        $match: {
                            video: { $exists: true }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$allVideos"
                },
                totalComments: {
                    $size: "$allComments"
                },
                totalTweets: {
                    $size: "$allTweets"
                },
                videoViews: {
                    $sum: "$allVideos.views"
                },
                totalSubscribers: {
                    $size: "$subscribers"
                },
                channelsSubscribedTo: {
                    $size: "$subscribedTo"
                },
                likedVideosCount: {
                    $size: "$likedVideos"
                },
            }
        },
        {
            $project: {
                totalVideos: 1,
                totalComments: 1,
                totalTweets: 1,
                videoViews: 1,
                totalSubscribers: 1,
                channelsSubscribedTo: 1,
                likedVideosCount: 1,
                likedVideos: 1,
                allVideos: 1,
                allTweets: 1,
                // username: 1,
                // avatar: 1,
                // fullName: 1,
                // totalLikes: 1
            }
        }
    ])

    return res
        .status(200)
        .json(new APIResponse(200, { userStatsAggregation, totalLikes }, "User Stats retrieved successfully."))

})

const getChannelVideos = asyncHandler(async (req, res) => {

    const user = req.user._id

    if (!user) {
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
                $project: {
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