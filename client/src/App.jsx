import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import client from './apolloClient'
import MainNav from './components/MainNav'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import ProtectedRoute from './ProtectedRoute'
import { Container } from 'react-bootstrap'

export default function App(){
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <MainNav />
        <Container>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/me" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminPanel/></ProtectedRoute>} />
          </Routes>
        </Container>
      </BrowserRouter>
    </ApolloProvider>
  )
}
