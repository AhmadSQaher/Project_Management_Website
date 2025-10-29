import { gql } from '@apollo/client'

// Client-side (local) schema extensions. Keep this file minimal —
// add local-only types/fields here when you need client state managed
// by Apollo (reactive vars, local resolvers, etc.).
export const typeDefs = gql`
  extend type Query {
    # Example local field you can query from the client
    isSidebarOpen: Boolean!
  }

  extend type Mutation {
    toggleSidebar: Boolean!
  }
`

export default typeDefs
