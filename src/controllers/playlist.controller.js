import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {

    const { name, description } = req.body

    const user = await User.findOne({ _id: req.user._id })

    if ([name, description].some((field) => field.trim() === '')) {
        throw new APIError(400, "All fields are required.")
    }

    const checkExist = await Playlist.findOne({ name: name })

    if (checkExist) {
        throw new APIError(400, "playlist with the same name already exist.")
    }

    const playlist = await Playlist.create({
        owner: user._id,
        name: name,
        description: description
    })

    if (!playlist) {
        throw new APIError(401, "Something went wrong while creating playlist.")
    }

    return res
        .status(200)
        .json(new APIResponse(200, playlist, "playlist created successfully."))

})

const getUserPlaylists = asyncHandler(async (req, res) => {

    const { userId } = req.params

    const user = await User.findOne({ _id: userId })

    if (!user) {
        throw new APIError(404, "User does not exist.")
    }

    const userPlaylists = await Playlist.find({
        owner: user._id
    })

    if (userPlaylists.length === 0) {
        return res
            .status(200)
            .json(new APIResponse(200, null, "User has no playlists."))
    }

    return res
        .status(200)
        .json(new APIResponse(200, userPlaylists, "User playlists fetched successfully."))


})

const getPlaylistById = asyncHandler(async (req, res) => {

    const { playlistId } = req.params

    const validate = isValidObjectId(playlistId)

    if (!validate) {
        throw new APIError(401, "not a valid playlist id.")
    }

    const playlist = await Playlist.findOne({ _id: playlistId })

    // console.log(playlist);

    if (!playlist) {
        throw new APIError(404, "Playlist does not exist.")
    }

    return res
        .status(200)
        .json(new APIResponse(200, playlist, "Playlist successfully fetched."))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {

    const { playlistId, videoId } = req.params

    if ([playlistId, videoId].some((field) => field.trim() === '' || !isValidObjectId(field))) {
        throw new APIError(401, "not a valid playlistId or videoId")
    }

    const playlist = await Playlist.findOne({ _id: playlistId })
    // console.log(playlist)
    const video = await Video.findOne({ _id: videoId })
    // console.log(video)

    if (!playlist) {
        throw new APIError(404, "Playlist does not exist.")
    }

    if (!video) {
        throw new APIError(404, "Video does not exist.")
    }

    const checkExist = await Playlist.findOne({
        _id: playlist._id,
        videos: video._id
    });

    if (checkExist) {
        throw new APIError(401, "Video already exists inside playlist.");
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        { _id: playlist._id },
        { $push: { videos: video } },
        { new: true }
    )
    if (!updatePlaylist) {
        throw new APIError(401, "Something went wrong while adding video to playlist.")
    }

    return res
        .status(200)
        .json(new APIResponse(200, updatePlaylist, "Video added to playlist."))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    
    const { playlistId, videoId } = req.params

    if ([playlistId, videoId].some((field) => field.trim() === '' || !isValidObjectId(field))) {
        throw new APIError(401, "not a valid playlistId or videoId")
    }

    const playlist = await Playlist.findOne({ _id: playlistId })
    // console.log(playlist);
    const video = await Video.findOne({ _id: videoId })
    // console.log(video);

    if (!playlist) {
        throw new APIError(404, "Playlist does not exist.")
    }

    if (!video) {
        throw new APIError(404, "Video does not exist.")
    }

    const checkExist = await Playlist.findOne({
        _id: playlist._id,
        videos: video._id
    })

    if (!checkExist) {
        throw new APIError(404, "Video does not exist inside Playlist.")
    }

    const updatePlaylist = await Playlist.findByIdAndUpdate(
        { _id: playlist._id },
        { $pull: { videos: video._id } },
        { new: true }
    )

    if (!updatePlaylist) {
        throw new APIError(401, "There was some issue while removing video from playlist.")
    }

    return res
        .status(200)
        .json(new APIResponse(200, updatePlaylist, "Playlist has beeen updated."))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}