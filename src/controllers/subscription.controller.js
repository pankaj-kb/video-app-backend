import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from "mongoose"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

    const channel = await User.findById(channelId)

    const user = req.user._id;

    if (!channel) {
        throw new APIError(404, "Channel/User Does not exist.")
    }

    const subscription = await Subscription.find({
        subscriber: user, channel: channel
    })

    if (subscription.length === 0) {
        const subscribe = await Subscription.create({
            subscriber: user,
            channel: channel
        })

        if (!subscribe) {
            throw new APIError(401, "Something went wrong while Subscribing to channel.")
        }

        return res
            .status(201)
            .json(new APIResponse(201, subscribe, "Channel has been Subscribed successfully."))
    }

    const unSubscribe = await Subscription.findByIdAndDelete(subscription)

    if (!unSubscribe) {
        throw new APIError(401, "Something went wrong while unsubscribing to channel.")
    }

    return res
        .status(200)
        .json(new APIResponse(200, unSubscribe, "Channel has been unsubscribed."))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {

    const { channelId } = req.params

    const isValidObjectId = mongoose.Types.ObjectId.isValid(channelId);
    if (!isValidObjectId) {
        throw new APIError(400, 'Invalid channelId');
    }

    const channel = User.findById(channelId)

    if (!channel) {
        throw new APIError(404, "Channel/User does not exist.")
    }

    // const subscribers = await Subscription.aggregate([
    //     {
    //         $match: {
    //             channel: channel._id
    //         }
    //     }

    // ])

    // Manual Approach

    const subscribers = await Subscription.find({
        channel: channelId
    })


    if (subscribers.length === 0) {
        return res.status(200).json(new APIResponse(200, subscribers, "No subscribers found."))
    }

    return res
        .status(200)
        .json(new APIResponse(200, subscribers, "Subscribers list fetched."))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}