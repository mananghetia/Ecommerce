const Errorhandler = require("../utils/errorhandler")

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal Server Error"

    //Invalid MongoDB ID error
    if (err.name === "CastError") {
        const message = `Resource Not Found, Invalid Format : ${err.path} `
        err = new Errorhandler(message, 400)
    }

    //Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`
        err = new Errorhandler(message, 400)
    }

    //Wrong JWT error
    if (err.name === "JsonWebTokenError") {
        const message = 'Json Web Token is invalid, try again'
        err = new Errorhandler(message, 400)
    }

    //JWT Expire error
    if (err.name === "JsonWebExpiredError") {
        const message = 'Json Web Token is Expired, try again'
        err = new Errorhandler(message, 400)
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}