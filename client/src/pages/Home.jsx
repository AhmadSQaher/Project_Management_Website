import React from 'react'
import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <Container className="text-center" style={{ paddingTop: '6rem' }}>
      <h1>Welcome to Team Projects</h1>
      <p className="lead">Manage teams and projects with a simple interface.</p>
      <div className="d-flex justify-content-center mt-4">
        <Button as={Link} to="/login" variant="primary" className="me-2">Login</Button>
        <Button as={Link} to="/register" variant="outline-primary">Register</Button>
      </div>
    </Container>
  )
}
