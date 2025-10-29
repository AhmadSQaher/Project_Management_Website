import React from 'react'
import { Navbar, Container, Nav, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { ME } from '../graphql/queries'

export default function MainNav(){
  const navigate = useNavigate()
  const { data } = useQuery(ME)

  const handleLogout = async () => {
    try{
      await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'mutation { logout }' })
      })
      // Also remove any locally stored auth token used for Authorization header
      try { localStorage.removeItem('authToken') } catch (e) { /* ignore */ }
      navigate('/login')
      window.location.reload()
    }catch(err){
      console.error(err)
    }
  }

  return (
    <Navbar expand="lg" className="mb-3" aria-label="Main navigation">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <div style={{ width: 36, height: 36, background: 'var(--brand-red)', borderRadius: 6, marginRight: 8 }} aria-hidden="true" />
          <div style={{ fontWeight: 700, color: 'var(--brand-white)' }}>Team Projects</div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            {data?.me?.role === 'Admin' && <Nav.Link as={Link} to="/admin">Admin Panel</Nav.Link>}
          </Nav>
          <Nav>
            {data?.me ? (
              <>
                <Navbar.Text className="me-2 text-white">Signed in as: <strong>{data.me.username}</strong> <span className="text-muted">({data.me.role})</span></Navbar.Text>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <Button as={Link} to="/login" variant="primary" size="sm">Login</Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
