import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page, limit, sortBy, sortType} = req.query
    const video = await Video.findOne({ _id: videoId })

    if (!video) {
        throw new APIError(404, "Video not found/exist.")
    }

    const commentList = [
        {
            $match: {
                video: video._id
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
                as: "commentsBy"
            }
        }
        // Add projection to show comment owner
    ]

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

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}