import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    const { page, limit, sortBy, sortType } = req.query

    if (!(sortType === "desc" || sortType === "asc")) {
        throw new APIError(401, "incorrect query, check sorting order.");
    }

    const video = await Video.findOne({ _id: videoId })

    if (!video) {
        throw new APIError(404, "Video not found/exist.")
    }

    const commentList = Comment.aggregate([
        {
            $match: { video: video._id }
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
    ])

    const paginatedComments = await Comment.aggregatePaginate(commentList, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortType === 'desc' ? -1 : 1 },
        customLabels: {
            docs: 'comments',
            totalDocs: 'totalComments'
        }
    })

    if (!paginatedComments) {
        throw new APIError(400, "Something went wrong while fetching comments.")
    }

    if (paginatedComments.totalComments === 0) {
        return res
            .status(200)
            .json(new APIResponse(200, null, "No Comments Found."))
    }

    return res
        .status(200)
        .json(new APIResponse(200, paginatedComments, "All Comments fetched successfully."))
})

const getTweetComments = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { page, limit, sortBy, sortType } = req.query

    if (!(sortType === "desc" || sortType === "asc")) {
        throw new APIError(401, "incorrect query, check sorting order.");
    }

    const tweet = await Tweet.findOne({ _id: tweetId })

    if (!tweet) {
        throw new APIError(404, "Tweet not found/exist.")
    }

    const commentList = Comment.aggregate([
        {
            $match: { tweet: tweet._id }
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
    ])

    const paginatedComments = await Comment.aggregatePaginate(commentList, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortType === 'desc' ? -1 : 1 },
        customLabels: {
            docs: 'comments',
            totalDocs: 'totalComments'
        }
    })

    if (!paginatedComments) {
        throw new APIError(400, "Something went wrong while fetching comments.")
    }

    if (paginatedComments.totalComments === 0) {
        return res
            .status(200)
            .json(new APIResponse(200, null, "No Comments Found."))
    }

    return res
        .status(200)
        .json(new APIResponse(200, paginatedComments, "All Comments fetched successfully."))
})

const getCommentReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const comment = await Comment.findOne({ _id: commentId })

    if (!comment) {
        throw new APIError(404, "Comment not found/exist.")
    }

    const commentList = await Comment.aggregate([
        {
            $match: {
                comment: commentId
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
    ])


    return res
        .status(200)
        .json(new APIResponse(200, commentList, "All Comments fetched successfully."))
})

const addCommentToVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    const video = await Video.findOne({ _id: videoId })

    if (!video) {
        throw new APIError(404, "Video not found/exist.")
    }

    const { commentText } = req.body

    if (!commentText) {
        throw new APIError(401, "Comment is required.")
    }

    const owner = await User.findOne({ _id: req.user._id })

    if (!owner) {
        throw new APIError(401, "Kindly login first to add comment.")
    }

    const addComment = await Comment.create({
        commentText: commentText,
        video: videoId,
        owner: owner._id
    })

    if (!addComment) {
        throw new APIError(401, "Something went wrong while adding comment.")
    }

    return res
        .status(200)
        .json(new APIResponse(201, addComment, "Comment added successfully."))
})

const addCommentToTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params
    console.log(tweetId)
    const tweet = await Tweet.findOne({ _id: tweetId })
    console.log(tweet)

    if (!tweet) {
        throw new APIError(404, "Tweet not found/exist.")
    }

    const { commentText } = req.body

    if (!commentText) {
        throw new APIError(401, "Comment is required.")
    }

    const owner = await User.findOne({ _id: req.user._id })

    if (!owner) {
        throw new APIError(401, "Kindly login first to add comment.")
    }

    const addComment = await Comment.create({
        commentText: commentText,
        tweet: tweetId,
        owner: owner._id
    })

    if (!addComment) {
        throw new APIError(401, "Something went wrong while adding comment.")
    }

    return res
        .status(200)
        .json(new APIResponse(201, addComment, "Comment added successfully."))
})

const addCommentToComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params

    const comment = await Comment.findOne({ _id: commentId })

    if (!comment) {
        throw new APIError(404, "Comment not found/exist.")
    }

    const { commentText } = req.body

    if (!commentText) {
        throw new APIError(401, "Comment is required.")
    }

    const owner = await User.findOne({ _id: req.user._id })

    if (!owner) {
        throw new APIError(401, "Kindly login first to add comment.")
    }

    const addComment = await Comment.create({
        commentText: commentText,
        comment: commentId,
        owner: owner._id
    })

    if (!addComment) {
        throw new APIError(401, "Something went wrong while adding comment.")
    }

    return res
        .status(200)
        .json(new APIResponse(201, addComment, "Comment added successfully."))
})

const updateComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const { commentText } = req.body;

    const user = await User.findOne({ _id: req.user._id })

    if (!user) {
        throw new APIError(401, "Kindly login First.")
    }

    const prevCommment = await Comment.findOne({ _id: commentId })

    const isOwner = prevCommment.owner.equals(user._id);

    if (!isOwner) {
        throw new APIError(401, "not authorized.")
    }

    if (!prevCommment) {
        throw new APIError(401, "Comment not found/exist.")
    }

    if (commentText.trim() === '') {
        throw new APIError(401, "Comment can't be empty.")
    }

    const updateComment = await Comment.findByIdAndUpdate(prevCommment, {
        $set: {
            commentText: commentText
        }
    }, { new: true })

    return res
        .status(201)
        .json(new APIResponse(201, updateComment, "Comment Updated Successfully."))
})

const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;

    const user = await User.findOne({ _id: req.user._id })

    if (!user) {
        throw new APIError(401, "Kindly login First.")
    }

    const comment = await Comment.findOne({ _id: commentId })

    const isOwner = comment.owner.equals(user._id);

    if (!isOwner) {
        throw new APIError(401, "Not authorized.")
    }

    if (!comment) {
        throw new APIError(404, "Comment does not exist.")
    }

    const deleteComment = await Comment.findByIdAndDelete(comment)

    if (!deleteComment) {
        throw new APIError(401, "Something went wrong while deleting comment.")
    }

    return res
        .status(201)
        .json(new APIResponse(201, deleteComment, "Comment deleted successfully."))

})

export {
    getVideoComments,
    getTweetComments,
    getCommentReplies,
    addCommentToVideo,
    addCommentToTweet,
    addCommentToComment,
    updateComment,
    deleteComment
}