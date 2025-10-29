import React, { useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import { Form, Button, Alert, Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const LOGIN = gql`
  mutation Login($email: String!, $password: String!){
    login(email: $email, password: $password){
      token
      user { id username email role }
    }
  }
`;

export default function Login(){
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [login, { loading }] = useMutation(LOGIN, { fetchPolicy: 'no-cache' })

  const handle = async (e) => {
    e.preventDefault()
    try{
      setError(null)
      const result = await login({ variables: { email, password } })
      // Persist token so subsequent requests can use Authorization header
      const token = result?.data?.login?.token;
      if (token) localStorage.setItem('authToken', token);
      navigate('/dashboard')
      window.location.reload()
    }catch(err){
      setError(err.message)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <Card style={{ maxWidth: 480, width: '100%' }}>
        <Card.Body>
          <h3 className="text-center mb-4">Login</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handle}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                type="email" 
                required 
                aria-label="Email address"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                type="password" 
                required 
                aria-label="Password"
              />
            </Form.Group>
            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
          <div className="mt-3 text-muted text-center">
            <small>Initial admin: admin@example.com / password</small>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
