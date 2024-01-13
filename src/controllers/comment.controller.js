import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page, limit, sortBy, sortType } = req.query
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
                as: "commentsBy",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            commentBy: {
                                _id: 1,
                                username: 1,
                                email: 1,
                                fullName: 1,
                                avatar: 1,
                            }
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        },
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

    const { videoId } = req.params

    const video = await Video.findOne({ _id: videoId })

    if (!video) {
        throw new APIError(404, "Video not found/exist.")
    }

    const { comment } = req.body

    if (!comment) {
        throw new APIError(401, "Comment is required.")
    }

    const owner = await User.findById(req.user?._id)

    if (!owner) {
        throw new APIError(401, "Kindly login first to add comment.")
    }

    const addComment = await Comment.create({
        comment: comment,
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

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { comment } = req.body;

    const prevCommment = await Comment.findOne({ _id: commentId })

    console.log(prevCommment);

    if (!prevCommment) {
        throw new APIError(401, "Comment not found/exist.")
    }

    if (comment.trim() === '') {
        throw new APIError(401, "Comment can't be empty.")
    }

    const updateComment = await Comment.findByIdAndUpdate(prevCommment, {
        $set: {
            comment: comment
        }
    }, { new: true })

    return res
        .status(201)
        .json(new APIResponse(201, updateComment, "Comment Updated Successfully."))
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