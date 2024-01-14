import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { CheckExist } from "../utils/CheckExist.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const userId = req.user?._id

    // approaching using CheckExist utility class.
    // const video = new CheckExist(Video, videoId)
    // console.log(video.document)

    const video = await Video.findOne({ _id: videoId })

    if (!video) {
        throw new APIError(404, "Video Does not exist.")
    }

    const likeExist = await Like.find({ video: video._id, likedBy: userId })

    if (likeExist.length === 0) {
        const like = await Like.create({
            video: video._id,
            likedBy: userId
        })
        if (!like) {
            throw new APIError(401, "Something went wrong while liking the videos.")
        }

        return res
            .status(201)
            .json(new APIResponse(201, like, "Liked the video Successfully."))
    }

    const unlike = await Like.findByIdAndDelete(likeExist)

    if (!unlike) {
        throw new APIError(401, "Something went wrong while unliking the video.")
    }

    return res
        .status(200)
        .json(new APIResponse(200, unlike, "removed like successfully."))

})

// create controller function to get all the likes count and likeby

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user._id
    const comment = await Comment.findById({ _id: commentId })

    if (!comment) {
        throw new APIError(404, "Comment does not exist.")
    }

    const likeExist = await Like.find({ comment: commentId, likedBy: userId })

    if (likeExist.length === 0) {
        const like = await Like.create({
            comment: comment._id,
            likedBy: userId
        })

        if (!like) {
            throw new APIError(401, "Something went wrong while liking the comment.")
        }

        return res
            .status(201)
            .json(new APIResponse(201, like, "Liked the Comment Successfully."))
    }

    const unlike = await Like.findByIdAndDelete(likeExist)

    if (!unlike) {
        throw new APIError(401, "Something went wrong while removing like.")
    }

    return res
        .status(200)
        .json(new APIResponse(200, unlike, "removed like successfully."))

})

const toggleTweetLike = asyncHandler(async (req, res) => {

    const { tweetId } = req.params
    const userId = req.user._id

    const tweet = await Tweet.findById({ _id: tweetId })

    if (!tweet) {
        throw new APIError(404, "Tweet does not exist.")
    }

    const likeExist = await Like.find({ tweet: tweet._id, likedBy: userId })

    if (likeExist.length === 0) {
        const like = await Like.create({
            tweet: tweet._id,
            likedBy: userId
        })

        if (!like) {
            throw new APIError(401, "Something went wrong while liking the tweet.")
        }

        return res
            .status(201)
            .json(new APIResponse(201, like, "Liked the Tweet Successfully."))
    }

    const unlike = await Like.findByIdAndDelete(likeExist)

    if (!unlike) {
        throw new APIError(401, "Something went wrong while removing like.")
    }

    return res
        .status(200)
        .json(new APIResponse(200, unlike, "removed like successfully."))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {

    const user = req.user

    // const likedVideos = await Like.aggregate(
    //     [
    //         {
    //             $match: {
    //                 likedBy: new mongoose.Types.ObjectId(user._id)
    //             }
    //         }
    //     ]
    // )

    // Classic Approach
    
    const likedVideos = await Like.find({ likedBy: user._id })

    if (likedVideos.length === 0) {
        return res
            .status(200)
            .json(new APIResponse(200, null, "No Videos Found."))
    }

    return res
        .status(201)
        .json(new APIResponse(201, likedVideos, "Successfully fetched all the liked Videos."))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}