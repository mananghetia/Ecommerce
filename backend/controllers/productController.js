const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const productModel = require("../models/productModel")
const ApiFeatures = require("../utils/apiFeatures")
const Errorhandler = require("../utils/errorhandler")
const cloudinary = require("cloudinary")
//Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    let images = []
    // Adding Images to Cloudinary
    if (typeof req.body.images === "string") {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    const imagesLinks = []

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        })

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        })
    }

    req.body.images = imagesLinks
    req.body.user = req.user.id

    const product = await productModel.create(req.body)

    res.status(201).json({
        success: true,
        product,
    })
})
//Get All Products
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = 8
    const ProductCount = await productModel.countDocuments()
    let apiFeature = new ApiFeatures(productModel.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage)

    const products = await apiFeature.query
    apiFeature = new ApiFeatures(productModel.find(), req.query)
        .search()
        .filter()
    const filteredProductsCount = await apiFeature.query.count()
    res.status(200).json({
        success: true,
        ProductCount,
        resultPerPage,
        filteredProductsCount,
        products
    })
})

// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
    const products = await productModel.find()

    res.status(200).json({
        success: true,
        products,
    })
})

//Get Product Details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    const product = await productModel.findById(req.params.id)
    if (!product) {
        return next(new Errorhandler("Product Not Found", 404))
    }
    res.status(200).json({
        success: true,
        product
    })
})

//Update Product -- Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await productModel.findById(req.params.id)
    if (!product) {
        return next(new Errorhandler("Product Not Found", 404))
    }

    // Cloudinary 
    let images = []

    if (typeof req.body.images === "string") {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    if (images !== undefined) {
        // Deleting Images From Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id)
        }

        const imagesLinks = []

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            })

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            })
        }

        req.body.images = imagesLinks
    }

    product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true,
        product
    })
})

//Delete Product -- Admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await productModel.findById(req.params.id)
    if (!product) {
        return next(new Errorhandler("Product Not Found", 404))
    }
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id)
    }
    await productModel.findById(req.params.id).remove()
    res.status(200).json({
        success: true,
        message: "Product Deleted Successfully"
    })
})

//Create New Review or Update the Review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await productModel.findById(productId)

    if (!product) {
        return next(new Errorhandler(`Product does not exist with id: ${productId}`))
    }

    const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id.toString())

    if (isReviewed) {
        product.reviews.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating,
                    rev.comment = comment
            }
        })
    }
    else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let avg = 0
    product.reviews.forEach(rev => {
        avg += rev.rating
    })
    product.ratings = avg / product.reviews.length

    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
        product
    })
})


//Get All Reviews of a Product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await productModel.findById(req.query.id)
    if (!product) {
        return next(new Errorhandler("Product not Found", 404))
    }
    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

//Delete Review 
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    let product = await productModel.findById(req.query.productId)
    if (!product) {
        return next(new Errorhandler("Product Not Found", 404))
    }
    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString())

    let avg = 0
    reviews.forEach(rev => {
        avg += rev.rating
    })
    const ratings = (reviews.length ? (avg / reviews.length) : 0)
    const numOfReviews = reviews.length

    product = await productModel.findByIdAndUpdate(req.query.productId, { reviews, ratings, numOfReviews }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        message: "Product Deleted Successfully",
        product
    })
})
