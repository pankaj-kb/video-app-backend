import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

// setting cors
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// Config
app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ extended: true, limit: "20kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// importing /router

import userRouter from "./routes/user.routes.js"

// routes

app.use("/api/v1/users", userRouter)

app.get("/", (req, res) => {
    res.send("<h1>Server running</h1>");
})

export { app }