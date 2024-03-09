import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();
// const allowedOrigins = ['http://localhost:5173', 'http://192.168.1.2:5173'];
// setting cors
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    origin: allowedOrigins,
    credentials: true
}))

// Config
app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ extended: true, limit: "20kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// importing /router

import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import healhcheckRouter from "./routes/healthcheck.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import searchRouter from "./routes/search.routes.js"
import viewRouter from "./routes/view.routes.js"

// routes


app.get("/", (req, res) => {
    res.send("<h1>Server running</h1>");
})

// Health-Check Router

app.use("/api/v1/healthcheck", healhcheckRouter)

// User Route

app.use("/api/v1/users", userRouter)

// Video Route

app.use("/api/v1/video", videoRouter)

// Subscription Route

app.use("/api/v1/subscription", subscriptionRouter)

// Tweet Route

app.use("/api/v1/tweet", tweetRouter)

// Comment Route

app.use("/api/v1/comment", commentRouter)

// Like Route

app.use("/api/v1/like", likeRouter)

// Playlist Route

app.use("/api/v1/playlist", playlistRouter)

// Dashboard Route

app.use("/api/v1/dashboard", dashboardRouter)

// Search Route

app.use("/api/v1/search", searchRouter)

// View Router

app.use("/api/v1/view", viewRouter)

export { app }