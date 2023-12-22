import { asyncHandler } from "../utils/asyncHandler.js"
import { APIError } from "../utils/APIError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { APIResponse } from "../utils/APIResponse.js"
import fs from "fs"


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

    const { email, username, password } = req.body;

    if (!email || !username) {
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

export {
    registerUser,
    loginUser,
    logoutUser
}