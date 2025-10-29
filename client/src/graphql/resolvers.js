// Simple local resolvers for client-only fields. This file is intentionally
// small. You can expand it to use Apollo's cache APIs or reactive vars.

let _isSidebarOpen = false

const resolvers = {
  Query: {
    isSidebarOpen() {
      return _isSidebarOpen
    }
  },
  Mutation: {
    toggleSidebar() {
      _isSidebarOpen = !_isSidebarOpen
      return _isSidebarOpen
    }
  }
}

export default resolvers
