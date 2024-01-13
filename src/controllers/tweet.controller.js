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

    const {tweetContent} = req.body;

    if (tweetContent.trim() === '') {
        throw new APIError(401, "Tweet can't be empty")
    }

    return res
    .status(200)
    .json(new APIResponse(201, tweetContent, "Tweet is uploaded/added."))
    
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}