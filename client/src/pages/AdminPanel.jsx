import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Form, Button, Row, Col, Card, Table, Spinner, Modal } from 'react-bootstrap'
import { TEAMS, PROJECTS, USERS } from '../graphql/queries'
import {
  REGISTER,
  UPDATE_USER,
  DELETE_USER,
  CREATE_TEAM,
  CREATE_PROJECT,
  UPDATE_PROJECT_ASSIGN,
  ASSIGN_MEMBER,
  DELETE_TEAM,
  DELETE_PROJECT
} from '../graphql/mutations'

export default function AdminPanel(){
  const { data: udata, loading: uLoading, error: uError, refetch: refetchUsers } = useQuery(USERS, { fetchPolicy: 'no-cache' });
  const { data: tdata, loading: tLoading, error: tError, refetch: refetchTeams } = useQuery(TEAMS, { fetchPolicy: 'no-cache' });
  const { data: pdata, loading: pLoading, error: pError, refetch: refetchProjects } = useQuery(PROJECTS, { fetchPolicy: 'no-cache' });
  
  const [register] = useMutation(REGISTER, { onCompleted: () => refetchUsers() });
  const [createTeam] = useMutation(CREATE_TEAM, { onCompleted: () => refetchTeams() });
  const [createProject] = useMutation(CREATE_PROJECT, { onCompleted: () => refetchProjects() });
  const [assign] = useMutation(ASSIGN_MEMBER, { onCompleted: () => refetchTeams() });
  const [updateUser] = useMutation(UPDATE_USER, { onCompleted: () => refetchUsers() });
  const [deleteUser] = useMutation(DELETE_USER, { onCompleted: () => refetchUsers() });
  const [updateProjectAssign] = useMutation(UPDATE_PROJECT_ASSIGN, { onCompleted: () => { refetchProjects(); refetchTeams(); } });
  const [deleteTeam] = useMutation(DELETE_TEAM, { onCompleted: () => { refetchTeams(); refetchProjects(); } });
  const [deleteProject] = useMutation(DELETE_PROJECT, { onCompleted: () => { refetchProjects(); refetchTeams(); } });

  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'Member' })
  const [teamForm, setTeamForm] = useState({ name: '', description: '', slogan: '' })
  const [projectForm, setProjectForm] = useState({ name: '', description: '', teamId: '' })

  const handleCreateUser = (e) => {
    e.preventDefault()
    register({ variables: { input: userForm } })
    setUserForm({ username: '', email: '', password: '', role: 'Member' })
  }

  const handleCreateTeam = (e) => {
    e.preventDefault()
    createTeam({ variables: { input: teamForm } })
    setTeamForm({ name: '', description: '', slogan: '' })
  }

  const handleCreateProject = (e) => {
    e.preventDefault()
    createProject({ variables: { input: { ...projectForm, teamId: projectForm.teamId || null } } })
    setProjectForm({ name: '', description: '', teamId: '' })
  }

  const handleAssign = (e) => {
    e.preventDefault()
    const teamId = e.target.teamId.value
    const userId = e.target.userId.value
    if (teamId && userId) {
      assign({ variables: { teamId, userId } })
      e.target.reset()
    }
  }

  const [showEdit, setShowEdit] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({ username: '', email: '', password: '', role: 'Member' })

  const openEdit = (u) => {
    setEditingUser(u)
    setEditForm({ username: u.username || '', email: u.email || '', password: '', role: u.role || 'Member' })
    setShowEdit(true)
  }

  const handleEditSave = async (e) => {
    e.preventDefault()
    if (!editingUser) return
    const input = { username: editForm.username, email: editForm.email }
    if (editForm.password) input.password = editForm.password
    if (editForm.role) input.role = editForm.role
    try{
      await updateUser({ variables: { id: editingUser.id, input } })
      setShowEdit(false)
      setEditingUser(null)
    }catch(err){
      console.error(err)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return
    try{
      await deleteUser({ variables: { id } })
    }catch(err){
      console.error(err)
    }
  }

  const handleAssignExistingProject = async (e) => {
    e.preventDefault()
    const projectId = e.target.projectId.value
    const teamId = e.target.teamIdAssign.value || null
    if (!projectId) return
    try{
      await updateProjectAssign({ variables: { id: projectId, teamId } })
      e.target.reset()
    }catch(err){
      console.error(err)
    }
  }

  if (uLoading || tLoading || pLoading) return (
    <div className="d-flex justify-content-center mt-5">
      <Spinner animation="border" />
    </div>
  )

  // Show errors (e.g., unauthorized) instead of hanging spinner
  if (uError || tError || pError) {
    const err = uError || tError || pError
    const msg = err?.message || 'Failed to load admin data.'
    return (
      <div className="mt-4">
        <Card className="m-4 p-3">
          <h5>Error</h5>
          <p>{msg}</p>
          {msg.includes('Unauthorized') && (
            <p className="text-muted">You must be an admin to view this page.</p>
          )}
        </Card>
      </div>
    )
  }

  return (
    <>
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Form onSubmit={handleEditSave}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Username</Form.Label>
              <Form.Control value={editForm.username} onChange={e=>setEditForm({...editForm, username: e.target.value})} required aria-label="Edit username" />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control value={editForm.email} onChange={e=>setEditForm({...editForm, email: e.target.value})} type="email" required aria-label="Edit email" />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Password (leave blank to keep)</Form.Label>
              <Form.Control value={editForm.password} onChange={e=>setEditForm({...editForm, password: e.target.value})} type="password" aria-label="Edit password" />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Role</Form.Label>
              <Form.Select value={editForm.role} onChange={e=>setEditForm({...editForm, role: e.target.value})} aria-label="Edit role">
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>

    <div>
      <h2 className="mb-4">Admin Panel</h2>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header><strong>Create User</strong></Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreateUser}>
                <Form.Group className="mb-2">
                  <Form.Label>Username</Form.Label>
                  <Form.Control 
                    value={userForm.username} 
                    onChange={e=>setUserForm({...userForm, username: e.target.value})} 
                    required
                    aria-label="Username"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    value={userForm.email} 
                    onChange={e=>setUserForm({...userForm, email: e.target.value})} 
                    type="email" 
                    required
                    aria-label="Email"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    value={userForm.password} 
                    onChange={e=>setUserForm({...userForm, password: e.target.value})} 
                    type="password" 
                    required
                    aria-label="Password"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select 
                    value={userForm.role} 
                    onChange={e=>setUserForm({...userForm, role: e.target.value})}
                    aria-label="User role"
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </Form.Select>
                </Form.Group>
                <Button type="submit">Create User</Button>
              </Form>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header><strong>Create Team</strong></Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreateTeam}>
                <Form.Group className="mb-2">
                  <Form.Label>Team Name</Form.Label>
                  <Form.Control 
                    value={teamForm.name} 
                    onChange={e=>setTeamForm({...teamForm, name: e.target.value})} 
                    required
                    aria-label="Team name"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control 
                    as="textarea"
                    value={teamForm.description} 
                    onChange={e=>setTeamForm({...teamForm, description: e.target.value})}
                    aria-label="Team description"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Slogan (Optional)</Form.Label>
                  <Form.Control 
                    value={teamForm.slogan} 
                    onChange={e=>setTeamForm({...teamForm, slogan: e.target.value})}
                    aria-label="Team slogan"
                  />
                </Form.Group>
                <Button type="submit">Create Team</Button>
              </Form>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header><strong>Create Project</strong></Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreateProject}>
                <Form.Group className="mb-2">
                  <Form.Label>Project Name</Form.Label>
                  <Form.Control 
                    value={projectForm.name} 
                    onChange={e=>setProjectForm({...projectForm, name: e.target.value})} 
                    required
                    aria-label="Project name"
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control 
                    as="textarea"
                    value={projectForm.description} 
                    onChange={e=>setProjectForm({...projectForm, description: e.target.value})}
                    aria-label="Project description"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Assign to Team (Optional)</Form.Label>
                  <Form.Select 
                    value={projectForm.teamId} 
                    onChange={e=>setProjectForm({...projectForm, teamId: e.target.value})}
                    aria-label="Select team"
                  >
                    <option value="">-- Unassigned --</option>
                    {tdata.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Form.Select>
                </Form.Group>
                <Button type="submit">Create Project</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header><strong>All Users</strong></Card.Header>
            <Card.Body>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {udata.users.map(u => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(u)}>Edit</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDeleteUser(u.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header><strong>All Teams</strong></Card.Header>
            <Card.Body>
              {tdata.teams.length === 0 ? (
                <p className="text-muted">No teams yet</p>
              ) : (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Team Name</th>
                        <th>Members</th>
                        <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tdata.teams.map(t => (
                      <tr key={t.id}>
                        <td>{t.name}</td>
                        <td>{t.members.map(m => m.username).join(', ') || 'None'}</td>
                        <td>
                          <Button size="sm" variant="outline-danger" onClick={async ()=>{
                            if (!window.confirm('Delete this team? This will unassign projects from the team.')) return
                            try{ await deleteTeam({ variables: { id: t.id } }) }catch(err){ console.error(err) }
                          }}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header><strong>Assign Member to Team</strong></Card.Header>
            <Card.Body>
              <Form onSubmit={handleAssign}>
                <Form.Group className="mb-2">
                  <Form.Label>Team</Form.Label>
                  <Form.Select name="teamId" required aria-label="Select team">
                    <option value="">-- Select Team --</option>
                    {tdata.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>User</Form.Label>
                  <Form.Select name="userId" required aria-label="Select user">
                    <option value="">-- Select User --</option>
                    {udata.users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                  </Form.Select>
                </Form.Group>
                <Button type="submit">Assign Member</Button>
              </Form>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header><strong>Assign Existing Project to Team</strong></Card.Header>
            <Card.Body>
              <Form onSubmit={handleAssignExistingProject}>
                <Form.Group className="mb-2">
                  <Form.Label>Project</Form.Label>
                  <Form.Select name="projectId" required aria-label="Select project">
                    <option value="">-- Select Project --</option>
                    {pdata.projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.team?.name || 'Unassigned'})</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Assign to Team (optional)</Form.Label>
                  <Form.Select name="teamIdAssign" aria-label="Assign team">
                    <option value="">-- Unassigned --</option>
                    {tdata.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Form.Select>
                </Form.Group>
                <Button type="submit">Assign Project</Button>
              </Form>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header><strong>All Projects</strong></Card.Header>
            <Card.Body>
              {pdata.projects.length === 0 ? (
                <p className="text-muted">No projects yet</p>
              ) : (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>Team</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pdata.projects.map(p => {
                      const label = p.status === 'COMPLETED' ? 'Completed' : p.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending'
                      return (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.team?.name || 'Unassigned'}</td>
                          <td>{label}</td>
                          <td>
                            <Button size="sm" variant="outline-danger" onClick={async ()=>{
                              if (!window.confirm('Delete this project? This action cannot be undone.')) return
                              try{ await deleteProject({ variables: { id: p.id } }) }catch(err){ console.error(err) }
                            }}>Delete</Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
    </>
  )
}
