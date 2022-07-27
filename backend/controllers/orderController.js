const orderModel = require("../models/orderModel")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const productModel = require("../models/productModel")
const Errorhandler = require("../utils/errorhandler")

//Create new Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body
    const order = await orderModel.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user
    })

    res.status(201).json({
        success: true,
        order
    })
})

//Get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id).populate("user", "name email")
    if (!order) {
        return next(new Errorhandler("Order not found with this ID", 404))
    }
    res.status(200).json({
        success: true,
        order
    })
})

//Get Logged In user's order
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await orderModel.find({ user: req.user._id })
    res.status(200).json({
        success: true,
        orders
    })
})

//Get All order --Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await orderModel.find()

    let totalAmount = 0
    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

//update Order Status --Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id)

    if (!order) {
        return next(new Errorhandler("Order not found with this ID", 404))
    }

    if (order.orderStatus === "Delivered") {
        return next(new Errorhandler("You have already delivered this order", 404))
    }

    if (req.body.status === "Shipped") {
        order.orderItems.forEach(async (order) => {
            await updateStock(order.product, order.quantity)
        })
    }

    order.orderStatus = req.body.status
    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now()
    }

    await order.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
        order
    })
})

async function updateStock(id, quantity) {
    const product = await productModel.findById(id)
    product.stock -= quantity
    await product.save({ validateBeforeSave: false })
}

//Delete Order --Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id)
    if (!order) {
        return next(new Errorhandler("Order not found with this ID", 404))
    }

    await order.remove()
    res.status(200).json({
        success: true,
        message: "Order Deleted successfully"
    })
})