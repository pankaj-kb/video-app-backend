// require('dotenv').config({ path: `./env` })
import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import { app } from './app.js';
dotenv.config({
    path: './env'
})

const PORT = process.env.PORT || 8000;

// console.log(PORT)



connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.error(error)
            throw error;
        })
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at PORT:${PORT}`)
        })
    })
    .catch((err) => {
        console.error("DB connection failed", err)
    })











/* Approach with same file
import express from "express";
const app = express()


    (async () => {
        try {
            await mongoose.connect(`${process.env.MONGODBURI}/${DB_NAME}`)
            app.on("error", (error) => {
                console.error(error)
                throw error;
            })

            app.listen(process.env.PORT, () => {
                console.log(`App is listening on ${process.env.PORT}`)
            })

        } catch (error) {
            console.error("Error in DB connection: ", error)
            throw error;
        }
    })()

*/
