import { Note, CreateNoteDto, UpdateNoteDto, NoteFilters } from '@/types/note';

const notes: Note[] = [];
let nextId = 1;

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const notesService = {
  async getNotes(filters?: NoteFilters): Promise<Note[]> {
    await delay(300);
    
    let filteredNotes = [...notes];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredNotes = filteredNotes.filter(note =>
        note.title.toLowerCase().includes(search) ||
        note.content.toLowerCase().includes(search) ||
        note.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    if (filters?.category) {
      filteredNotes = filteredNotes.filter(note => note.category === filters.category);
    }

    if (filters?.tags && filters.tags.length > 0) {
      filteredNotes = filteredNotes.filter(note =>
        filters.tags!.some(tag => note.tags.includes(tag))
      );
    }

    if (filters?.isPinned !== undefined) {
      filteredNotes = filteredNotes.filter(note => note.isPinned === filters.isPinned);
    }

    return filteredNotes;
  },

  async getNote(id: number): Promise<Note | null> {
    await delay(200);
    return notes.find(note => note.id === id) || null;
  },

  async createNote(data: CreateNoteDto): Promise<Note> {
    await delay(500);
    
    const newNote: Note = {
      id: nextId++,
      ...data,
      isPinned: data.isPinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    notes.push(newNote);
    return newNote;
  },

  async updateNote(id: number, data: UpdateNoteDto): Promise<Note> {
    await delay(500);
    
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex === -1) {
      throw new Error('Note not found');
    }
    
    const updatedNote: Note = {
      ...notes[noteIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    notes[noteIndex] = updatedNote;
    return updatedNote;
  },

  async deleteNote(id: number): Promise<void> {
    await delay(300);
    
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex === -1) {
      throw new Error('Note not found');
    }
    
    notes.splice(noteIndex, 1);
  },

  async togglePin(id: number): Promise<Note> {
    await delay(200);
    
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex === -1) {
      throw new Error('Note not found');
    }
    
    const updatedNote: Note = {
      ...notes[noteIndex],
      isPinned: !notes[noteIndex].isPinned,
      updatedAt: new Date().toISOString(),
    };
    
    notes[noteIndex] = updatedNote;
    return updatedNote;
  },

  // Get all unique categories
  async getCategories(): Promise<string[]> {
    await delay(100);
    
    const categories = new Set<string>();
    notes.forEach(note => {
      if (note.category) {
        categories.add(note.category);
      }
    });
    
    return Array.from(categories).sort();
  },

  // Get all unique tags
  async getTags(): Promise<string[]> {
    await delay(100);
    
    const tags = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tags.add(tag));
    });
    
    return Array.from(tags).sort();
  },

  // Get recently updated notes
  async getRecentNotes(limit: number = 5): Promise<Note[]> {
    await delay(200);
    
    return [...notes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  },
};