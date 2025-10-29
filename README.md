# Team & Project Management System (MERN + GraphQL)

COMP308 Lab Assignment - Team/Project Management using Express, Apollo Server GraphQL, MongoDB, React, and Vite.

## Features

### Backend (Apollo Server + Express + MongoDB)
- **GraphQL API** with queries and mutations for Users, Teams, and Projects
- **JWT Authentication** with HTTPOnly cookies
- **Role-based authorization** (Admin, Member)
- **MongoDB** with Mongoose models and Schema.Types.ObjectId refs
- **CRUD operations** for managing users, teams, and projects

### Frontend (React + Vite + Apollo Client)
- **Login functionality** with secure JWT authentication
- **Member features:**
  - View team details
  - View assigned projects
  - Update project status
- **Admin features:**
  - Create users
  - Create teams
  - Assign projects to teams
  - List all teams and projects
  - List all members in a team
- **Responsive UI** with React-Bootstrap
- **Accessibility** features (ARIA labels, keyboard navigation)

## Quick Start

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (running locally on `mongodb://localhost:27017` or use MongoDB Atlas)

### 1. Server Setup

```powershell
cd server
npm install
```

Create `.env` file from the example:
```powershell
cp .env.example .env
```

Edit `.env` and set your MongoDB URI and JWT secret:
```
MONGO_URI=mongodb://localhost:27017/team_projects_db
JWT_SECRET=your_super_secret_key_here
PORT=4000
```

Seed the database with an initial admin user:
```powershell
npm run seed
```
This creates: `admin@example.com` / `password`

Start the server:
```powershell
npm run dev
```
Server runs at: `http://localhost:4000/graphql`

### 2. Client Setup

Open a new terminal:

```powershell
cd client
npm install
npm run dev
```
Client runs at: `http://localhost:5173`

## Usage

1. Open browser to `http://localhost:5173`
2. Click **Login** and use: `admin@example.com` / `password`
3. As **Admin**, you can:
   - Create users (Admin Panel)
   - Create teams (Admin Panel)
   - Create projects and assign to teams (Admin Panel)
   - Assign members to teams (Admin Panel)
4. As **Member**, you can:
   - View teams and projects (Dashboard)
   - Update project status

## Models

### User
- Username
- Email
- Password (hashed with bcrypt)
- Role (Admin, Member)

### Team
- Team name
- Description
- Members (Array of User ObjectId refs)
- Created date
- Status (Active/Inactive)
- Slogan (custom field)

### Project
- Project name
- Description
- Team (reference to Team)
- Start date
- End date
- Status (In Progress, Completed, Pending)

## Technology Stack

**Backend:**
- Express.js
- Apollo Server (GraphQL)
- MongoDB + Mongoose
- JWT + bcrypt
- Cookie-parser
- CORS

**Frontend:**
- React 18
- Vite
- Apollo Client
- React Router
- React-Bootstrap
- Bootstrap 5

## Scripts

### Server
- `npm run dev` - Start with nodemon (auto-restart on changes)
- `npm start` - Production start
- `npm run seed` - Create initial admin user

### Client
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
AhmadQaher_COMP308Lab2_Ex1/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Team.js
│   │   │   └── Project.js
│   │   ├── schema/
│   │   │   ├── typeDefs.js
│   │   │   └── resolvers.js
│   │   ├── utils/
│   │   │   ├── auth.js
│   │   │   └── hash.js
│   │   ├── index.js
│   │   └── seed.js
│   ├── package.json
│   └── .env.example
└── client/
    ├── src/
    │   ├── components/
    │   │   └── MainNav.jsx
    │   ├── graphql/
    │   │   └── queries.js
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── AdminPanel.jsx
    │   ├── App.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── apolloClient.js
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## License

MIT
