import React from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { Spinner } from 'react-bootstrap'
import { ME } from './graphql/queries'

export default function ProtectedRoute({ children, requireAdmin = false }){
  const { data, loading } = useQuery(ME)
  
  if (loading) return (
    <div className="d-flex justify-content-center mt-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  )
  
  const user = data?.me
  if (!user) return <Navigate to="/login" replace />
  if (requireAdmin && user.role !== 'Admin') return <Navigate to="/" replace />
  
  return children
}
