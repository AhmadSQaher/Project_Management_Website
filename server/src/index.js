require('dotenv').config();
const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const connectDB = require('./config/db');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./schema/resolvers');
const { verifyToken, COOKIE_NAME } = require('./utils/auth');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/team_projects_db';

async function start() {
  await connectDB(MONGO_URI);

  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => {
      const cookieToken = req.cookies && req.cookies[COOKIE_NAME];
      let headerToken = null;
      const authHeader = req.headers && req.headers.authorization;
      if (authHeader && typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
        headerToken = authHeader.slice(7).trim();
      }
      const token = cookieToken || headerToken;
      const user = token ? verifyToken(token) : null;
      return { req, res, user };
    }
  });

  await server.start();
  server.applyMiddleware({ app, cors: false });

  const httpServer = http.createServer(app);
  httpServer.listen({ port: PORT }, () => {
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

start().catch(err => {
  console.error('Failed to start server', err);
});
