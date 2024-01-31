import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {

    //TODO: create tweet

    const user = await User.findOne({ _id: req.user._id })
    // console.log(user)

    if (!user) {
        throw new APIError(404, "User not found")
    }

    const { tweetContent } = req.body;

    if (tweetContent.trim() === '') {
        throw new APIError(401, "Tweet can't be empty")
    }

    const tweet = await Tweet.create({
        owner: user._id,
        content: tweetContent
    })

    if (!tweet) {
        throw new APIError(401, "Something went wrong while uploading tweet.")
    }

    return res
        .status(200)
        .json(new APIResponse(201, tweet, "Tweet is uploaded/added."))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    const user = await User.findOne({ _id: userId })

    if (!user) {
        throw new APIError("User does not exist.")
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: user._id
            }
        },
    ])

    if (!tweets) {
        return new APIError(404, "Something went wrong while fetching tweets.")
    }

    if (tweets.length === 0) {
        return res
            .status(201)
            .json(new APIResponse(201, null, "No Tweets found"))
    }

    return res
        .status(201)
        .json(new APIResponse(201, tweets, "All tweets fetched successfully."))

})

const updateTweet = asyncHandler(async (req, res) => {

    const user = await User.findOne({ _id: req.user._id })

    if (!user) {
        throw new APIError(401, "Kindly login first.")
    }

    const { tweetId } = req.params;

    const prevTweet = await Tweet.findOne({ _id: tweetId })

    if (!prevTweet) {
        throw new APIError(404, "Tweet does not exist")
    }

    const isOwner = prevTweet.owner.equals(user._id)

    if (!isOwner) {
        throw new APIError(401, "not authorized.")
    }

    const { tweetContent } = req.body
    if (tweetContent.trim() === '') {
        throw new APIError(401, "Tweet can't be empty")
    }

    const tweet = await Tweet.findByIdAndUpdate(prevTweet, {
        $set: {
            content: tweetContent
        }
    }, { new: true })

    return res
        .status(201)
        .json(new APIResponse(201, tweet, "Tweet updated successfully."))

})

const deleteTweet = asyncHandler(async (req, res) => {

    const user = await User.findOne({ _id: req.user._id })

    if (!user) {
        throw new APIError(401, "Kindly login first.")
    }

    const { tweetId } = req.params;

    const tweet = await Tweet.findOne({ _id: tweetId })

    if (!tweet) {
        throw new APIError(201, "Tweet Does not exist.")
    }

    const isOwner = tweet.owner.equals(user._id)

    if (!isOwner) {
        throw new APIError(401, "not authorized.")
    }

    const deleteTweet = await Tweet.findByIdAndDelete(tweet._id)

    if (!deleteTweet) {
        throw new APIError(401, "Something went wrong while deleting tweet.")
    }

    return res
        .status(201)
        .json(new APIResponse(201, deleteTweet, "tweet has been deleted."))
})

const getAllTweets = asyncHandler(async (req, res) => {

    const { page, limit, sortBy, sortType } = req.query;

    if (!(sortType === "desc" || sortType === "asc")) {
        throw new APIError(401, "incorrect query, check sorting order.");
    }

    const allTweetsAggregation = Tweet.aggregate([
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
        {
            $sort: {
                [sortBy]: sortType === 'desc' ? -1 : 1
            }
        },
        {
            $limit: parseInt(limit)
        },
    ])

    const paginatedTweets = await Tweet.aggregatePaginate(allTweetsAggregation, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortType === 'desc' ? -1 : 1 },
        customLabels: {
            docs: 'tweets',
            totalDocs: 'totalTweets'
        }
    });

    if (!paginatedTweets) {
        throw new APIError(400, "Something went wrong while loading tweets.")
    }

    return res
        .status(200)
        .json(new APIResponse(200, paginatedTweets, "fetched all tweets."))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets
}