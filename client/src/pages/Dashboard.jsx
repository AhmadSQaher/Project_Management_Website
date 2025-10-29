import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { Card, Row, Col, Button, Spinner, Badge, Alert } from 'react-bootstrap'
import { TEAMS, PROJECTS } from '../graphql/queries'

import { UPDATE_PROJECT_STATUS } from '../graphql/mutations'

export default function Dashboard(){
  const { data: tdata, loading: tloading } = useQuery(TEAMS)
  const { data: pdata, loading: ploading, refetch } = useQuery(PROJECTS)
  const [error, setError] = useState(null)
  const [updateStatus, { loading: updating }] = useMutation(UPDATE_PROJECT_STATUS, {
    onCompleted: () => {
      setError(null)
      refetch()
    },
    onError: (e) => {
      setError(e.message || 'Failed to update project status')
    }
  })

  if (tloading || ploading) return (
    <div className="d-flex justify-content-center mt-5">
      <Spinner animation="border" />
    </div>
  )
  const teams = tdata?.teams || []
  const projects = pdata?.projects || []

  return (
    <div>
      <h3 className="mb-4">Teams</h3>
      {teams.length === 0 ? (
        <p className="text-muted">No teams yet. Admins can create teams.</p>
      ) : (
        <Row>
          {teams.map(t => (
            <Col key={t.id} md={4} className="mb-3">
              <Card className="team-card">
                <Card.Body>
                  <Card.Title className="mb-1">{t.name}</Card.Title>
                  <Card.Subtitle className="mb-2 muted-small">{t.slogan || 'No slogan'}</Card.Subtitle>
                  <Card.Text className="muted-small">{t.description}</Card.Text>
                  <div>
                    <strong>Members:</strong>
                    {t.members.length === 0 ? (
                      <p className="text-muted">No members</p>
                    ) : (
                      <ul className="mb-0">
                        {t.members.map(m => <li key={m.id}>{m.username}</li>)}
                      </ul>
                    )}
                  </div>
                  <div className="mt-2">
                    <Badge bg={t.status === 'Active' ? 'success' : 'secondary'}>{t.status}</Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <h3 className="mt-5 mb-4">Projects</h3>
      {projects.length === 0 ? (
        <p className="text-muted">No projects yet. Admins can create projects.</p>
      ) : (
        <Row>
          {projects.map(p => (
            <Col key={p.id} md={6} className="mb-3">
              <Card className="project-card">
                <Card.Body>
                  <Card.Title>{p.name}</Card.Title>
                  <Card.Subtitle className="mb-2 muted-small">
                    Team: <strong>{p.team?.name || 'Unassigned'}</strong>
                  </Card.Subtitle>
                  <Card.Text className="muted-small">{p.description}</Card.Text>
                  <div>
                    <strong>Status:</strong>{' '}
                    {(() => {
                      const mapLabel = (s) => s === 'COMPLETED' ? 'Completed' : s === 'IN_PROGRESS' ? 'In Progress' : 'Pending'
                      const mapVariant = (s) => s === 'COMPLETED' ? 'success' : s === 'IN_PROGRESS' ? 'primary' : 'secondary'
                      return (
                        <Badge bg={mapVariant(p.status)}>{mapLabel(p.status)}</Badge>
                      )
                    })()}
                  </div>
                  <div className="project-actions">
                    {error && <Alert variant="danger">{error}</Alert>}
                    {p.status !== 'COMPLETED' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={async () => {
                            try{
                              await updateStatus({ variables: { id: p.id, status: 'IN_PROGRESS' } })
                            }catch(e){
                            }
                          }}
                          disabled={updating}
                        >
                          {updating ? 'Updating...' : 'Mark In Progress'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={async () => {
                            try{
                              await updateStatus({ variables: { id: p.id, status: 'COMPLETED' } })
                            }catch(e){
                            }
                          }}
                          disabled={updating}
                        >
                          {updating ? 'Updating...' : 'Mark Completed'}
                        </Button>
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
