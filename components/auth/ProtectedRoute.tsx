"use client"

import type React from "react"
import { Route, Redirect } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

const ProtectedRoute: React.FC<any> = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useAuth()

  return (
    <Route {...rest} render={(props) => (isAuthenticated ? <Component {...props} /> : <Redirect to="/auth/login" />)} />
  )
}

export default ProtectedRoute
