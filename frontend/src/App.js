import './App.css'
import React from 'react'
import { useEffect, useState } from "react"
import Header from "./component/layout/Header/Header.js"
import Footer from "./component/layout/Footer/Footer.js"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import WebFont from "webfontloader"
import Home from "./component/Home/Home.js"
import ProductDetails from "./component/Product/ProductDetails.js"
import Products from "./component/Product/Products.js"
import Search from "./component/Product/Search.js"
import LoginSignUp from "./component/User/LoginSignUp.js"
import store from "./store"
import { loadUser } from './actions/userAction'
import { useSelector } from "react-redux"
import UserOptions from "./component/layout/Header/UserOptions.js"
import Profile from "./component/User/Profile.js"
import ProtectedRoute from "./component/Route/ProtectedRoute.js"
import UpdateProfile from "./component/User/UpdateProfile.js"
import UpdatePassword from "./component/User/UpdatePassword.js"
import ForgotPassword from "./component/User/ForgotPassword.js"
import ResetPassword from "./component/User/ResetPassword.js"
import Cart from "./component/Cart/Cart.js"
import Shipping from "./component/Cart/Shipping.js"
import ConfirmOrder from "./component/Cart/ConfirmOrder.js"
import axios from "axios"
import Payment from "./component/Cart/Payment.js"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import OrderSuccess from "./component/Cart/OrderSuccess.js"
import MyOrders from "./component/Order/MyOrders.js"
import OrderDetails from "./component/Order/OrderDetails.js"
import Dashboard from "./component/Admin/Dashboard.js"
import ProductList from "./component/Admin/ProductList.js"
import NewProduct from "./component/Admin/NewProduct.js"
import UpdateProduct from "./component/Admin/UpdateProduct.js"
import OrderList from "./component/Admin/OrderList.js"
import ProcessOrder from "./component/Admin/ProcessOrder.js"
import UsersList from "./component/Admin/UsersList.js"
import UpdateUser from "./component/Admin/UpdateUser.js"
import ProductReviews from "./component/Admin/ProductReviews.js"
import Contact from "./component/layout/Contact/Contact.js"
import About from "./component/layout/About/About.js"
import NotFound from "./component/layout/Not Found/NotFound.js"


function App() {
  const { isAuthenticated, user } = useSelector((state) => state.user)
  const [stripeApiKey, setStripeApiKey] = useState("")

  async function getStripeApiKey() {
    const { data } = await axios.get("/api/v1/stripeapikey")
    setStripeApiKey(data.stripeApiKey)
  }
  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Roboto", "Droid Sans", "Chilanka"]
      }
    })
    store.dispatch(loadUser())
    getStripeApiKey()
  }, [])
  window.addEventListener("contextmenu", (e) => e.preventDefault())//for disable rightclick
  return (
    <Router>
      <Header />
      {isAuthenticated && <UserOptions user={user} />}
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/product/:id" element={<ProductDetails />} />
        <Route exact path="/products" element={<Products />} />
        <Route path="/products/:keyword" element={<Products />} />
        <Route exact path="/search" element={<Search />} />
        <Route exact path="/login" element={<LoginSignUp />} />
        <Route exact path="/account" element={
          <ProtectedRoute element={<Profile />} />
        } />
        <Route exact path="/me/update" element={
          <ProtectedRoute element={<UpdateProfile />} />
        } />
        <Route exact path="/password/update" element={
          <ProtectedRoute element={<UpdatePassword />} />
        } />
        <Route exact path="/password/forgot" element={<ForgotPassword />} />
        <Route exact path="/password/reset/:token" element={<ResetPassword />} />
        <Route exact path="/cart" element={<Cart />} />
        <Route exact path="/shipping" element={
          <ProtectedRoute element={<Shipping />} />
        } />
        <Route exact path="/order/confirm" element={
          <ProtectedRoute element={<ConfirmOrder />} />
        } />
        {stripeApiKey && <Route exact path="/process/payment" element={
          <ProtectedRoute element={<Elements stripe={loadStripe(stripeApiKey)}><Payment /></Elements>} />
        } />}
        <Route exact path="/success" element={
          <ProtectedRoute element={<OrderSuccess />} />
        } />
        <Route exact path="/orders" element={
          <ProtectedRoute element={<MyOrders />} />
        } />
        <Route exact path="/order/:id" element={
          <ProtectedRoute element={<OrderDetails />} />
        } />
        <Route exact path="/admin/dashboard" element={
          <ProtectedRoute isAdmin={true} element={<Dashboard />} />
        } />
        <Route exact path="/admin/products" element={
          <ProtectedRoute isAdmin={true} element={<ProductList />} />
        } />
        <Route exact path="/admin/product" element={
          <ProtectedRoute isAdmin={true} element={<NewProduct />} />
        } />
        <Route exact path="/admin/product/:id" element={
          <ProtectedRoute isAdmin={true} element={<UpdateProduct />} />
        } />
        <Route exact path="/admin/orders" element={
          <ProtectedRoute isAdmin={true} element={<OrderList />} />
        } />
        <Route exact path="/admin/order/:id" element={
          <ProtectedRoute isAdmin={true} element={<ProcessOrder />} />
        } />
        <Route exact path="/admin/users" element={
          <ProtectedRoute isAdmin={true} element={<UsersList />} />
        } />
        <Route exact path="/admin/user/:id" element={
          <ProtectedRoute isAdmin={true} element={<UpdateUser />} />
        } />
        <Route exact path="/admin/reviews" element={
          <ProtectedRoute isAdmin={true} element={<ProductReviews />} />
        } />
        <Route exact path="/contact" element={<Contact />} />
        <Route exact path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App
