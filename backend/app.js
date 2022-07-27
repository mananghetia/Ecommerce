//Accessing .env variable using Dotenv
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "backend/config/config.env" })
}

const express = require("express")
const app = express()
app.use(express.json()) // for parsing application/json 

const cookieParser = require("cookie-parser")
app.use(cookieParser())

const bodyparser = require("body-parser")
const fileUpload = require("express-fileupload")
app.use(bodyparser.urlencoded({ extended: true }))
app.use(fileUpload())

//Route Imports
const productRoute = require("./routes/productRoute")
const userRoute = require("./routes/userRoute")
const orderRoute = require("./routes/orderRoute")
const paymentRoute = require("./routes/paymentRoute")
app.use("/api/v1", productRoute)
app.use("/api/v1", userRoute)
app.use("/api/v1", orderRoute)
app.use("/api/v1", paymentRoute)

//for production
const path = require("path")
app.use(express.static(path.join(__dirname, "../frontend/build")))
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"))
})


//Middleware for Errors
const errorMiddleware = require('./middleware/error')
app.use(errorMiddleware)
module.exports = app