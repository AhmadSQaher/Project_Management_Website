import React from 'react'
import { Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <Container className="text-center">
      <div className="hero">
        <h1>Welcome to Team Projects</h1>
        <p className="lead">Collaborate with your team — track progress, update status, and keep work moving.</p>
        <div className="d-flex justify-content-center mt-4">
          <Button as={Link} to="/login" variant="primary" className="me-2">Login</Button>
          <Button as={Link} to="/register" variant="outline-primary">Register</Button>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-8 offset-md-2">
          <div className="card team-card p-3">
            <div className="card-body">
              <h4 className="card-title">Simple & Focused</h4>
              <p className="muted-small">A lightweight project management interface for small teams and classroom projects. Designed for clarity and speed.</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
