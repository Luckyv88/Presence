import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
dotenv.config();

import connectDB from './src/lib/db.js';
import swaggerUi from 'swagger-ui-express';
import authRoute from './src/routes/authRoute.js';
import friendRoute from './src/routes/friend.routes.js';
import streamRoute from './src/routes/stream.route.js';
import { initSocket } from './src/socket/index.js';

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middlewares
app.use(cors({
  origin: 'https://presences-5a8n.onrender.com', 
  // your frontend URL
  credentials: true,               // allow cookies
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/friends', friendRoute);
app.use('/api/stream', streamRoute);

// Swagger for production
if (process.env.NODE_ENV === 'production') {
  const swaggerDocument = JSON.parse(
    fs.readFileSync('./src/swagger/swagger-output.json', 'utf-8')
  );
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Create HTTP server and attach Socket.io
const server = createServer(app);
initSocket(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
