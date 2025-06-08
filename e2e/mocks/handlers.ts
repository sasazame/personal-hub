import { http, HttpResponse } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Types for API requests
interface TodoRequest {
  title: string;
  description: string;
  status: string;
  priority: string;
}

// Mock data
let todos = [
  {
    id: 1,
    title: 'Sample Todo 1',
    description: 'This is a sample todo',
    status: 'TODO',
    priority: 'HIGH',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let nextId = 2;

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockUser,
      });
    }
    
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as { username: string; email: string; password: string };
    
    return HttpResponse.json({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        ...mockUser,
        username: body.username,
        email: body.email,
      }
    });
  }),

  http.post(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  http.get(`${API_URL}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(mockUser);
    }
    
    return HttpResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }),

  // Todo endpoints
  http.get(`${API_URL}/todos`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({ content: todos });
  }),

  http.post(`${API_URL}/todos`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json() as TodoRequest;
    const newTodo = {
      id: nextId++,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    todos.push(newTodo);
    return HttpResponse.json(newTodo, { status: 201 });
  }),

  http.put(`${API_URL}/todos/:id`, async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = Number(params.id);
    const body = await request.json() as TodoRequest;
    const index = todos.findIndex(t => t.id === id);
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Todo not found' },
        { status: 404 }
      );
    }
    
    todos[index] = {
      ...todos[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    return HttpResponse.json(todos[index]);
  }),

  http.delete(`${API_URL}/todos/:id`, ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = Number(params.id);
    todos = todos.filter(t => t.id !== id);
    
    return new HttpResponse(null, { status: 204 });
  }),
];