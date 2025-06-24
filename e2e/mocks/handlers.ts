import { http, HttpResponse } from 'msw';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Types for API requests
interface TodoRequest {
  title: string;
  description: string;
  status: string;
  priority: string;
}

interface NoteRequest {
  title: string;
  content: string;
  category?: string;
  tags: string[];
  isPinned?: boolean;
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

let notes: Array<{
  id: number;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: 1,
    title: 'Welcome to Notes',
    content: 'This is your first note. You can create, edit, and organize your notes here.',
    category: 'Getting Started',
    tags: ['welcome', 'tutorial'],
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Meeting Notes',
    content: 'Important points from today\'s meeting:\n- Review project timeline\n- Discuss budget allocation\n- Schedule follow-up',
    category: 'Work',
    tags: ['meeting', 'important'],
    isPinned: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
];

let nextId = 2;
let nextNoteId = 3;

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

  // Notes endpoints
  http.get(`${API_URL}/notes`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const isPinned = url.searchParams.get('isPinned');
    
    let filteredNotes = [...notes];
    
    if (search) {
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category) {
      filteredNotes = filteredNotes.filter(note => note.category === category);
    }
    
    if (isPinned !== null) {
      filteredNotes = filteredNotes.filter(note => note.isPinned === (isPinned === 'true'));
    }
    
    return HttpResponse.json(filteredNotes);
  }),

  http.get(`${API_URL}/notes/categories`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const categories = [...new Set(notes.map(note => note.category).filter(Boolean))];
    return HttpResponse.json(categories);
  }),

  http.get(`${API_URL}/notes/tags`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const tags = [...new Set(notes.flatMap(note => note.tags))];
    return HttpResponse.json(tags);
  }),

  http.get(`${API_URL}/notes/recent`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');
    
    const recentNotes = [...notes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
    
    return HttpResponse.json(recentNotes);
  }),

  http.get(`${API_URL}/notes/:id`, ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = Number(params.id);
    const note = notes.find(n => n.id === id);
    
    if (!note) {
      return HttpResponse.json(
        { message: 'Note not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(note);
  }),

  http.post(`${API_URL}/notes`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json() as NoteRequest;
    const newNote = {
      id: nextNoteId++,
      title: body.title,
      content: body.content,
      category: body.category,
      tags: body.tags || [],
      isPinned: body.isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    notes.push(newNote);
    return HttpResponse.json(newNote, { status: 201 });
  }),

  http.put(`${API_URL}/notes/:id`, async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = Number(params.id);
    const body = await request.json() as Partial<NoteRequest>;
    const index = notes.findIndex(n => n.id === id);
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Note not found' },
        { status: 404 }
      );
    }
    
    notes[index] = {
      ...notes[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    return HttpResponse.json(notes[index]);
  }),

  http.delete(`${API_URL}/notes/:id`, ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = Number(params.id);
    notes = notes.filter(n => n.id !== id);
    
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_URL}/notes/:id/toggle-pin`, ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.includes('mock-access-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = Number(params.id);
    const index = notes.findIndex(n => n.id === id);
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Note not found' },
        { status: 404 }
      );
    }
    
    notes[index] = {
      ...notes[index],
      isPinned: !notes[index].isPinned,
      updatedAt: new Date().toISOString(),
    };
    
    return HttpResponse.json(notes[index]);
  }),
];