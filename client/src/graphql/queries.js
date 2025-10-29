import { gql } from '@apollo/client';

export const ME = gql`
  query Me {
    me { id username email role }
  }
`;

export const TEAMS = gql`
  query Teams { 
    teams { 
      id name description slogan status createdAt
      members { id username email } 
    } 
  }
`;

export const PROJECTS = gql`
  query Projects { 
    projects { 
      id name description status startDate endDate createdAt
      team { id name } 
    } 
  }
`;
