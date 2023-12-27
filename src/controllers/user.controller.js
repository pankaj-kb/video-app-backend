import { asyncHandler } from "../utils/asyncHandler.js"
import { APIError } from "../utils/APIError.js"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { APIResponse } from "../utils/APIResponse.js"
import fs from "fs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new APIError(500, "Something wrong with white Generating Refresha and access tokens.")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
    // console.log(req.body)

    if (
        [fullName, email, username, password].some((field) => field.trim() === "")
    ) {
        throw new APIError(400, "All fields are required")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    // console.log(req.files)

    // const coverImageLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage)
        && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    const existedUser = await User.findOne(
        {
            $or: [{ username }, { email }]
        }
    )

    if (existedUser) {
        fs.unlinkSync(avatarLocalPath)
        fs.unlinkSync(coverImageLocalPath)
        throw new APIError(409, "User exists, email and username exists")
    }

    if (!avatarLocalPath) {
        throw new APIError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new APIError(400, "Avatar is not uploaded.")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // console.log(user);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new APIError(500,
            "something went wrong while registering the user.")
    }

    return res.status(201).json(
        new APIResponse(200, createdUser, "User is created/registerd successfully.")
    )
})

const loginUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;

    console.log({ "username": username, "email": email })

    // if (!username && !email) {
    //     throw new APIError(400, "username or email is required")
    // }

    if (!(username || email)) {
        throw new APIError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new APIError(401, "User does not exist, kindly check username or email")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new APIError(404, "Password is incorrect")
    }

    const { accessToken, refreshToken } = await
        generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new APIResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            },
                "User Logged in Successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new APIResponse(200, {}, "User is logged out successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new APIError(500, "Something wrong with refresh token.")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new APIError(401, "Invalid refresh token.")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new APIError(401, "Refresh token is expired or invalid/used.")
        }

        const options = {
            httpOnly: true,
            secure: true
        }


        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("newRefreshToken", newRefreshToken, options)
            .json(
                new APIResponse(200, {
                    accessToken, newRefreshToken
                }, "Access token refreshed."
                )
            )
    } catch (error) {
        throw new APIError(401, error?.message || "invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new APIError(400, "invalid Password")
    }

    user.password = newPassword

    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new APIResponse(200, {}, "Password has been changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    // if (!req.user) {
    //     throw new APIError(400, "No user found")
    // }
    return res
        .status(200)
        .json(200, req.user, "Current user is fetched Successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new APIError(200, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new APIResponse(200, user, "Account details updated successfully."))
})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new APIError(400, "Avatar file is missing.")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (avatar.url) {
        throw new APIError(400, "Error while uploading avatar.")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                avatar: req.user.avatar
            },
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new APIResponse(200, user, "Avatar is updated successfully"))
})

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new APIError(400, "Cover-Image file is missing.")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new APIError(400, "Error while uploading avatar.")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                coverImage: req.user?.coverImage
            },
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new APIResponse(200, user, "Cover-Image is updated successfully"))

})

const getUserChannelProfile = asyncHandler(async (req, res) => {

    const { username } = req.params

    if (!username?.trim) {
        throw new APIError(400, "Username is missing")
    }
    // aggregation pipeline

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },

        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subsribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $con: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                subsribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1
            }
        }
    ])

    console.log(channel);

    if (!channel?.length) {
        throw new APIError(404, "Channel does not exist")
    }

    return res
        .status(200)
        .json(new APIResponse(200, channel[0], "User channel successfully"))
})

const getWatchHistory = asyncHandler(async (req, res) => {

    const user = await User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1
                                        }
                                    }
                                ]
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
            }
        ]
    )

    return res
        .status(200)
        .json(
            new APIResponse(200, user[0].watchHistory,
                "Watch history fetched successfully."
            )
        )

})

const subscribeToChannel = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new APIError(400, "kindly login to subscribe")
    }

    const { username } = req.params

    if (!username) {
        throw new APIError(401, "Channel not found.")
    }

    // check if channel/user exist in database

    const channelExist = await User.findOne({ username })
    console.log(channelExist)

    if (!channelExist) {
        throw new APIError(401, "Channel Does not exist.")
    }

    // extract User _id i.e channel ID from channel Exist.

    const channel = channelExist._id;
    console.log(channel)

    // subscribe to channel

    const subscriber = await Subscription.create({
        subscriber: user,
        channel: channel
    })

    if (!subscriber) {
        throw new APIError(500,
            "Something went wrong while subscribing to channel")
    }

    return res.status(201).json(new APIResponse(200, "User successfully subscribed to channel"))
})

const checkChannelExist = asyncHandler(async (req, res) => {

    const { username } = req.params

    if (!username) {
        throw new APIError(400, "username not found")
    }

    const channelCheck = await User.findOne({ username })
    console.log(channelCheck);

    if (!channelCheck) {
        throw new APIError(401, "Channel not found using username in DB")
    }

    const channel = channelCheck._id
    console.log(channel);

    return res
    .status(200)
    .json(201, channel, "Channel Fetched successfully")

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    subscribeToChannel,
    checkChannelExist
}