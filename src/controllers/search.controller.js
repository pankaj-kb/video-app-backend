import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js"
// import { Playlist } from "../models/playlist.model.js";
import { APIResponse } from "../utils/APIResponse.js"
import mongoose from "mongoose"


const search = asyncHandler(async (req, res) => {
    const { query } = req.query;

    const userResults = await User.aggregate([
        {
            $match: {
                $or: [
                    { fullName: { $regex: query, $options: 'i' } },
                    { username: { $regex: query, $options: 'i' } },
                ],
            },
        },
        {
            $project: {
                _id: 1,
                username: 1,
                email: 1,
                fullName: 1,
                avatar: 1,
            },
        },
    ]);

    const videoResults = await Video.aggregate([
        {
            $match: {
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                ],
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
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
            },
        },
        {
            $addFields: {
                owner: { $arrayElemAt: ["$owner", 0] },
            },
        },
    ]);

    const tweetResults = await Tweet.aggregate([
        {
            $match: {
                content: { $regex: query, $options: 'i' },
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
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
            },
        },
        {
            $addFields: {
                owner: { $arrayElemAt: ["$owner", 0] },
            },
        },
    ]);

    return res.status(200).json(new APIResponse(200, { userResults, videoResults, tweetResults }, "Search results fetched successfully"));
});

export { search };
