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

    const channel = await User.findOne({ _id: channelId })

    if (!channel) {
        throw new APIError(404, "User does not exist.")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channel._id
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'subscriber',
                foreignField: '_id',
                as: 'subscriberInfo'
            }
        },
        {
            $project: {
                _id: 1,
                subscriberInfo: {
                    _id: 1,
                    username: 1,
                    email: 1,
                    fullName: 1,
                    avatar: 1,
                }
            }
        }

    ])

    // Manual Approach

    // const subscribers = await Subscription.find({
    //     channel: channelId
    // })


    if (subscribers.length === 0) {
        return res
        .status(200)
        .json(new APIResponse(200, null, "No subscribers found."))
    }

    return res
        .status(200)
        .json(new APIResponse(200, subscribers, "Subscribers list fetched."))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // using approach to rename the var before use as it is changed in router.
    const { channelId: subscriberId } = req.params

    const user = await User.findOne({ _id: subscriberId })

    if (!user) {
        throw new APIError(404, "User does not exist.")
    }

    const subscribedToList = await Subscription.aggregate([
        {
            $match: {
                subscriber: user._id
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscriptionList"
            }
        },
        {
            $project: {
                _id: 1,
                subscriptionList: {
                    _id: 1,
                    username: 1,
                    email: 1,
                    fullName: 1,
                    avatar: 1,
                }
            }
        }
    ])

    // Adding manual approach for practice.

    // const subscribedToList = await Subscription.find({
    //     subscriber: user._id
    // })

    if(subscribedToList.length === 0) {
        return res
        .status(200)
        .json(new APIResponse(201, null, "No channels Subscribed !"))
    }

    return res
        .status(200)
        .json(new APIResponse(200, subscribedToList, "Channel List fetched."))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}