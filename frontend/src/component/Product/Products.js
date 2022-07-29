import React, { Fragment, useEffect, useState } from 'react'
import "./Products.css"
import { useDispatch, useSelector } from 'react-redux'
import { clearErrors, getProduct } from '../../actions/productAction'
import Loader from '../layout/Loader/Loader'
import ProductCard from '../Home/ProductCard'
import MetaData from '../layout/MetaData'
import { useParams } from 'react-router-dom'
import Pagination from "react-js-pagination"
import Slider from "@material-ui/core/Slider"
import Typography from '@material-ui/core/Typography'
import { useAlert } from "react-alert"
import { categories } from './ProductCategory'
import { BiCategoryAlt } from "react-icons/bi"
//for Rating
const marks = [
    {
        value: 0,
        label: '0',
    },
    {
        value: 1,
        label: '1',
    },
    {
        value: 2,
        label: '2',
    },
    {
        value: 3,
        label: '3',
    },
    {
        value: 4,
        label: '4',
    },
    {
        value: 5,
        label: '5'
    }
]
//for product
const priceMarks = [
    {
        value: 0,
        scaledValue: 0,
        label: "0"
    },
    {
        value: 25,
        scaledValue: 1000,
        label: ""
    },
    {
        value: 50,
        scaledValue: 5000,
        label: "5k"
    },
    {
        value: 75,
        scaledValue: 10000,
        label: ""
    },
    {
        value: 100,
        scaledValue: 50000,
        label: "50k"
    },
    {
        value: 125,
        scaledValue: 100000,
        label: ""
    },
    {
        value: 150,
        scaledValue: 1000000,
        label: "10L"
    },
    {
        value: 175,
        scaledValue: 1000000,
        label: ""
    },
    {
        value: 200,
        scaledValue: 10000000,
        label: "10Cr"
    },
]
const scaleValues = (valueArray) => {
    return [scale(valueArray[0]), scale(valueArray[1])]
}
const scale = (value) => {
    if (value === undefined) {
        return undefined
    }
    const previousMarkIndex = Math.floor(value / 25)
    const previousMark = priceMarks[previousMarkIndex]
    const remainder = value % 25
    if (remainder === 0) {
        return previousMark.scaledValue
    }
    const nextMark = priceMarks[previousMarkIndex + 1]
    const increment = (nextMark.scaledValue - previousMark.scaledValue) / 25
    return remainder * increment + previousMark.scaledValue
}
//
const Products = () => {

    const dispatch = useDispatch()
    const { loading, error, products, resultPerPage, filteredProductsCount } = useSelector(
        state => state.products
    )
    const alert = useAlert()
    const [currentPage, setCurrentPage] = useState(1)
    const [category, setCategory] = useState("")
    const [ratings, setRatings] = useState([0, 5])


    const [value, setValue] = useState([25, 50])
    const [price, setPrice] = useState(scaleValues(value))
    const handleChange = (event, newValue) => {
        setValue(newValue)
        setPrice(scaleValues(newValue))
    }
    const setCurrentPageNo = (e) => {
        setCurrentPage(e)
    }
    const keyword = useParams().keyword
    let count = filteredProductsCount
    const doSearch = () => {
        dispatch(getProduct(keyword, currentPage, price, category, ratings))
    }
    useEffect(() => {
        if (error) {
            alert.error(error)
            dispatch(clearErrors)
        }
        doSearch()
    }, [dispatch, keyword, currentPage, category, alert, error])


    return (
        <Fragment>
            {loading ? <Loader /> :
                (<Fragment>
                    <MetaData title="PRODUCTS -- ECOMMERCE" />
                    <div className="filterBox">

                        <fieldset>
                            <Typography component="legend">
                                ₹_Price_₹
                            </Typography>
                            <Slider
                                style={{ maxWidth: 170 }}
                                value={value}
                                min={0}
                                step={1}
                                max={200}
                                marks={priceMarks}
                                scale={scaleValues}
                                onChange={handleChange}
                                aria-labelledby="non-linear-slider"
                            />
                            <span className='category-link' onClick={() => doSearch()}>₹Range: {JSON.stringify(scaleValues(value))}</span>
                        </fieldset>

                        <fieldset>
                            <Typography style={{ display: 'flex', alignItems: 'center' }} component="legend">
                                <BiCategoryAlt />
                                _Category_
                                <BiCategoryAlt />
                            </Typography>
                            <ul className="categoryBox">
                                {categories.map((category) => (
                                    <li
                                        className="category-link"
                                        key={category}
                                        onClick={() => setCategory(category)}
                                    >
                                        {category}
                                    </li>
                                ))}
                            </ul>
                        </fieldset>

                        <fieldset>
                            <Typography component="legend">★_Ratings_★</Typography>
                            <Slider
                                value={ratings}
                                onChange={(e, newRating) => {
                                    setRatings(newRating)
                                }}
                                style={{ maxWidth: 170 }}
                                aria-labelledby="range-slider"
                                marks={marks}
                                min={0}
                                max={5}
                            />
                        </fieldset>
                        <div className='searchBtn'>
                            <button onClick={() => doSearch()}>Search</button>
                        </div>
                    </div>
                    <h2 className="productsHeading">Products</h2>
                    <div className="products">
                        {products &&
                            products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                    </div>
                    {resultPerPage < count && (
                        <div className="paginationBox">
                            <Pagination
                                activePage={currentPage}
                                itemsCountPerPage={resultPerPage}
                                totalItemsCount={count}
                                onChange={setCurrentPageNo}
                                nextPageText="Next"
                                prevPageText="Prev"
                                firstPageText="1st"
                                lastPageText="Last"
                                itemClass="page-item"
                                linkClass="page-link"
                                activeClass="pageItemActive"
                                activeLinkClass="pageLinkActive"
                            />
                        </div>
                    )}
                </Fragment>)
            }
        </Fragment>
    )
}

export default Products