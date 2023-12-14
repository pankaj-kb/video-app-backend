// require('dotenv').config({ path: `./env` })
import dotenv from 'dotenv'
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
}) 

connectDB()











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
