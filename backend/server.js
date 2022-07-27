const app = require("./app")
const cloudinary = require("cloudinary")
const connectDatabase = require("./config/database")

//Handling Uncaught Exception 
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`)
    console.log("Shutting down the Server due to Uncaught Promise Rejection")
    process.exit(1)
})

//Accessing .env variable using Dotenv
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "backend/config/config.env" })
}

//Connecting to Database
connectDatabase()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

//Server binding and listening 
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
})
//Unhandled Promise Rejections (like false database URI)
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`)
    console.log("Shutting down the Server due to Unhandled Promise Rejection")
    server.close(() => {
        process.exit(1)
    })
})