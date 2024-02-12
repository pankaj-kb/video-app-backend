import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { View } from "../models/view.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addView = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if (!videoId) throw new APIError(401, "Kindly provide VideoId");

    const video = await Video.findOne({ _id: videoId })

    if (!video) throw new APIError(404, "Video Does not exist.")

    const createView = await View.create({
        video: video,
        viewer: req.user._id,
    })

    if (!createView) throw new APIError(401, "Something went wrong while adding view to video.")

    const updateVideo = await Video.findByIdAndUpdate(
        videoId,
        { $push: { views: createView._id } },
        { new: true }
    );

    if (!updateVideo) throw new APIError(401, "Something went wrong while updating video view array.")

    return res
        .status(200)
        .json(new APIResponse(200, createView, "Video view updated successfully."))

})

const getWatchHistory = asyncHandler(async (req, res) => {




    return res
        .status(200)
        .json(new APIResponse(200, {}, "Watch History Fetched."))
})

export {
    addView,
    getWatchHistory
}