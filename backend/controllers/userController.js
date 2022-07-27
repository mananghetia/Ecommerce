const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const ApiFeatures = require("../utils/apiFeatures")
const Errorhandler = require("../utils/errorhandler")
const userModel = require("../models/userModel")
const sendToken = require("../utils/jwtToken")
const sendEmail = require("../utils/sendEmail")
const crypto = require("crypto")
const cloudinary = require("cloudinary")

//Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale"
    })
    const { name, email, password } = req.body
    const user = await userModel.create({
        name, email, password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    })
    sendToken(user, 201, res)
})

//Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password)
        return next(new Errorhandler("Please Enter E-mail and Password", 400))

    const user = await userModel.findOne({ email }).select("+password")
    if (!user)
        return next(new Errorhandler("Invalid E-mail or Password"), 401)

    const isPasswordMatched = await user.comparePassword(password)

    if (!isPasswordMatched)
        return next(new Errorhandler("Invalid E-mail or Password"), 401)

    sendToken(user, 200, res)

})

//Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logged Out"
    })
})

//Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findOne({ email: req.body.email })
    if (!user) {
        return next(new Errorhandler("User not found"), 404)
    }
    //Get Reset Password Token
    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`
    // const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`//for running from localhost

    const message = `Your Password reset token is :-\n\n${resetPasswordUrl}\n\nIf you have not requested this email then, please ignore it.`

    try {
        await sendEmail({
            email: user.email,
            subject: `E-commerce Password Recovery`, //name of website
            message
        })
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordDate = undefined
        await user.save({ validateBeforeSave: false })
        return next(new Errorhandler(error.message, 500))
    }
})

//Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await userModel.findOne({
        resetPasswordToken,
        resetPasswordDate: { $gt: Date.now() }
    })

    if (!user) {
        return next(new Errorhandler("Reset Password Token is invalid or has been expired"), 400)
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new Errorhandler("Password doesn't match"), 400)
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordDate = undefined
    await user.save()

    sendToken(user, 200, res)
})

//Get User Details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findById(req.user.id)
    res.status(200).json({
        success: true,
        user
    })
})

//Update User Password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findById(req.user.id).select("+password")

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

    if (!isPasswordMatched)
        return next(new Errorhandler("Old Password is incorrect"), 400)

    if (req.body.newPassword !== req.body.confirmPassword)
        return next(new Errorhandler("Password doesn't match"), 400)
    user.password = req.body.newPassword
    await user.save()
    sendToken(user, 200, res)
})

//Update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    if (req.body.avatar !== "") {
        const user = await userModel.findById(req.user.id);

        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }

    const user = await userModel.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        user
    })
})

//Get all users --Admin
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    const users = await userModel.find()

    res.status(200).json({
        success: true,
        users
    })
})

//Get single user --Admin
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findById(req.params.id)

    if (!user) {
        return next(new Errorhandler(`Error does not exist with id: ${req.params.id}`))
    }
    res.status(200).json({
        success: true,
        user
    })
})

//Update User Role --Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await userModel.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    if (!user) {
        return next(new Errorhandler(`User does not exist with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
})

//Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await userModel.findByIdAndUpdate(req.params.id)

    if (!user) {
        return next(new Errorhandler(`User does not exist with id: ${req.params.id}`))
    }

    const imageId = user.avatar.public_id

    await cloudinary.v2.uploader.destroy(imageId)

    await user.remove()

    res.status(200).json({
        success: true,
        message: "User Deleted Successfully"
    })
})


