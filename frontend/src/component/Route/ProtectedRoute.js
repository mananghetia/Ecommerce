import React, { Fragment } from "react"
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
const ProtectedRoute = ({ isAdmin, element }) => {
    const { loading, isAuthenticated, user } = useSelector((state) => state.user)
    if (loading !== false)
        return <></>
    if (isAuthenticated === false) {
        return <Navigate to="/login" />
    }
    if (isAdmin === true && user.role !== "admin") {
        return <Navigate to="/login" />
    }
    return (
        <>
            {element}
        </>
    )
}

export default ProtectedRoute