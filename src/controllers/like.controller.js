import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { CheckExist } from "../utils/CheckExist.js"

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

    const likeExist = await Like.find({ video: video._id, likedBy: req.user })

    if (likeExist.length === 0) {
        const like = await Like.create({
            video: video,
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
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}