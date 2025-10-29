import { gql } from '@apollo/client'

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!){
    login(email: $email, password: $password){
      token
      user { id username email role }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: CreateUserInput!){
    register(input: $input){ id username email role }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!){
    updateUser(id: $id, input: $input){ id username email role }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!){ deleteUser(id: $id) }
`;

export const CREATE_TEAM = gql`
  mutation CreateTeam($input: CreateTeamInput!){ createTeam(input: $input){ id name } }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!){ createProject(input: $input){ id name } }
`;

export const UPDATE_PROJECT_ASSIGN = gql`
  mutation UpdateProjectAssign($id: ID!, $teamId: ID){
    updateProject(id: $id, teamId: $teamId){ id name team { id name } }
  }
`;

export const ASSIGN_MEMBER = gql`
  mutation AddMember($teamId: ID!, $userId: ID!){ addMemberToTeam(teamId: $teamId, userId: $userId){ id name } }
`;

export const DELETE_TEAM = gql`mutation DeleteTeam($id: ID!){ deleteTeam(id: $id) }`;
export const DELETE_PROJECT = gql`mutation DeleteProject($id: ID!){ deleteProject(id: $id) }`;

export const UPDATE_PROJECT_STATUS = gql`
  mutation UpdateProjectStatus($id: ID!, $status: ProjectStatus!){ updateProjectStatus(id: $id, status: $status){ id status } }
`;

export default {
  LOGIN,
  REGISTER,
  UPDATE_USER,
  DELETE_USER,
  CREATE_TEAM,
  CREATE_PROJECT,
  UPDATE_PROJECT_ASSIGN,
  ASSIGN_MEMBER,
  DELETE_TEAM,
  DELETE_PROJECT,
  UPDATE_PROJECT_STATUS
}
