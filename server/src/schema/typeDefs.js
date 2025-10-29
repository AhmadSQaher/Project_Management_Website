const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date

  enum UserRole { Admin Member }
  enum TeamStatus { Active Inactive }
  enum ProjectStatus { IN_PROGRESS COMPLETED PENDING }

  type User {
    id: ID!
    username: String!
    email: String!
    role: UserRole!
    createdAt: Date
    updatedAt: Date
  }

  type Team {
    id: ID!
    name: String!
    description: String
    members: [User]
    createdAt: Date
    status: TeamStatus
    slogan: String
  }

  type Project {
    id: ID!
    name: String!
    description: String
    team: Team
    startDate: Date
    endDate: Date
    status: ProjectStatus
    createdAt: Date
  }

  type AuthPayload {
    token: String
    user: User
  }

  input CreateUserInput {
    username: String!
    email: String!
    password: String!
    role: UserRole = Member
  }

  input UpdateUserInput {
    username: String
    email: String
    password: String
    role: UserRole
  }

  input CreateTeamInput {
    name: String!
    description: String
    memberIds: [ID]
    slogan: String
  }

  input CreateProjectInput {
    name: String!
    description: String
    teamId: ID
    startDate: Date
    endDate: Date
  }

  type Query {
    me: User
    users: [User]
    user(id: ID!): User
    teams: [Team]
    team(id: ID!): Team
    projects: [Project]
    project(id: ID!): Project
  }

  type Mutation {
    register(input: CreateUserInput!): User
    login(email: String!, password: String!): AuthPayload
    logout: Boolean

  updateUser(id: ID!, input: UpdateUserInput!): User
  deleteUser(id: ID!): Boolean

    createTeam(input: CreateTeamInput!): Team
    updateTeam(id: ID!, name: String, description: String, memberIds: [ID], status: TeamStatus, slogan: String): Team
    deleteTeam(id: ID!): Boolean

    createProject(input: CreateProjectInput!): Project
    updateProject(id: ID!, name: String, description: String, teamId: ID, startDate: Date, endDate: Date, status: ProjectStatus): Project
    deleteProject(id: ID!): Boolean
    updateProjectStatus(id: ID!, status: ProjectStatus!): Project

    addMemberToTeam(teamId: ID!, userId: ID!): Team
    removeMemberFromTeam(teamId: ID!, userId: ID!): Team
  }
`;

module.exports = typeDefs;
