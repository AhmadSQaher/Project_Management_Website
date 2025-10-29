import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { Form, Button, Alert, Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import { REGISTER } from '../graphql/mutations'

export default function Register(){
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Member')
  const [error, setError] = useState(null)
  const [register, { loading }] = useMutation(REGISTER)

  const handle = async (e) => {
    e.preventDefault()
    try{
      setError(null)
      await register({ variables: { input: { username, email, password, role } } })
      navigate('/login')
    }catch(err){
      setError(err.message)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <Card style={{ maxWidth: 480, width: '100%' }}>
        <Card.Body>
          <h3 className="text-center mb-4">Register</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handle}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control value={username} onChange={e=>setUsername(e.target.value)} required aria-label="Username" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control value={email} onChange={e=>setEmail(e.target.value)} type="email" required aria-label="Email" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control value={password} onChange={e=>setPassword(e.target.value)} type="password" required aria-label="Password" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select value={role} onChange={e=>setRole(e.target.value)} aria-label="Select role">
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit" className="w-100" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
