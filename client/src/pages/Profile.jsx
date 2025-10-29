import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { ME } from '../graphql/queries'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!){
    updateUser(id: $id, input: $input){ id username email role }
  }
`

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!){
    deleteUser(id: $id)
  }
`

export default function Profile(){
  const navigate = useNavigate()
  const { data, loading, error } = useQuery(ME)
  const [updateUser] = useMutation(UPDATE_USER)
  const [deleteUser] = useMutation(DELETE_USER)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [message, setMessage] = useState(null)

  if (loading) return <div>Loading...</div>
  if (error) return <Alert variant="danger">{error.message}</Alert>
  if (!data?.me) return <Alert variant="warning">Not signed in</Alert>

  const me = data.me

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleUpdate = async (e) => {
    e.preventDefault()
    try{
      setMessage(null)
      const input = {}
      if (form.username) input.username = form.username
      if (form.email) input.email = form.email
      if (form.password) input.password = form.password
      await updateUser({ variables: { id: me.id, input } })
      setMessage({ type: 'success', text: 'Profile updated. Refreshing...' })
      // refetch: simplest is to reload
      setTimeout(()=>window.location.reload(), 700)
    }catch(err){
      setMessage({ type: 'danger', text: err.message })
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete your account? This is irreversible.')) return
    try{
      await deleteUser({ variables: { id: me.id } })
      // clear local token and logout cookie by hitting logout endpoint
      try { localStorage.removeItem('authToken') } catch(e){}
      await fetch('http://localhost:4000/graphql', {
        method: 'POST', credentials: 'include', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ query: 'mutation { logout }' })
      })
      navigate('/')
      window.location.reload()
    }catch(err){
      setMessage({ type: 'danger', text: err.message })
    }
  }

  return (
    <div className="d-flex justify-content-center mt-4">
      <Card style={{ maxWidth: 720, width: '100%' }}>
        <Card.Body>
          <h3 className="mb-3">My Profile</h3>
          {message && <Alert variant={message.type}>{message.text}</Alert>}
          <div className="mb-3">
            <strong>Username:</strong> {me.username}
          </div>
          <div className="mb-3">
            <strong>Email:</strong> {me.email}
          </div>
          <div className="mb-3">
            <strong>Role:</strong> {me.role}
          </div>

          <hr />

          <h5>Edit profile</h5>
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-2">
              <Form.Label>Username</Form.Label>
              <Form.Control name="username" value={form.username} onChange={handleChange} placeholder={me.username} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" value={form.email} onChange={handleChange} placeholder={me.email} type="email" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New password (leave blank to keep)</Form.Label>
              <Form.Control name="password" value={form.password} onChange={handleChange} type="password" />
            </Form.Group>
            <div className="d-flex">
              <Button type="submit" variant="primary" className="me-2">Save changes</Button>
              <Button variant="danger" onClick={handleDelete}>Delete my account</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
