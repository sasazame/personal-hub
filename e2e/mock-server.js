const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data store
let todos = [];
let users = [];
let nextTodoId = 1;
let nextUserId = 1;

// Add default test user
users.push({
  id: nextUserId++,
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Middleware to check auth
const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  // For testing, any Bearer token is valid
  next();
};

// Auth routes
app.post('/api/v1/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  const user = {
    id: nextUserId++,
    username,
    email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  users.push({ ...user, password });
  res.json({ message: 'User registered successfully', user });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    user: userWithoutPassword,
    accessToken: `mock-token-${user.id}`,
    refreshToken: `mock-refresh-${user.id}`,
  });
});

app.get('/api/v1/auth/me', checkAuth, (req, res) => {
  // For testing, return the first user or a mock user
  const user = users[0] || {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.post('/api/v1/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Todo routes
app.get('/api/v1/todos', checkAuth, (req, res) => {
  res.json({ content: todos });
});

app.post('/api/v1/todos', checkAuth, (req, res) => {
  const todo = {
    id: nextTodoId++,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  todos.push(todo);
  res.status(201).json(todo);
});

app.put('/api/v1/todos/:id', checkAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  
  todos[index] = {
    ...todos[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  
  res.json(todos[index]);
});

app.delete('/api/v1/todos/:id', checkAuth, (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(t => t.id !== id);
  res.status(204).send();
});

// Start server
const PORT = process.env.MOCK_SERVER_PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Mock server stopped');
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Mock server stopped');
  });
});