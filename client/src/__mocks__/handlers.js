import { http, HttpResponse } from 'msw';
import {
  mockJob,
  mockContact,
  mockTask,
  mockNote,
  mockTranslationResult,
  mockAdzunaResult,
} from '../test-utils/mockData.js';

export const handlers = [
  // Auth
  http.post('/api/v1/users/login/', () =>
    HttpResponse.json({ token: 'test-token-abc123', email: 'test@example.com' })
  ),
  http.post('/api/v1/users/create/', () =>
    HttpResponse.json({ token: 'test-token-abc123', email: 'test@example.com' }, { status: 201 })
  ),
  http.post('/api/v1/users/logout/', () =>
    HttpResponse.json({})
  ),

  // Jobs
  http.get('/api/v1/jobs/', () => HttpResponse.json([mockJob])),
  http.post('/api/v1/jobs/', () => HttpResponse.json(mockJob, { status: 201 })),
  http.get('/api/v1/jobs/:jobId/', () => HttpResponse.json(mockJob)),
  http.put('/api/v1/jobs/:jobId/', () => HttpResponse.json(mockJob)),
  http.delete('/api/v1/jobs/:jobId/', () => new HttpResponse(null, { status: 204 })),

  // Tasks
  http.get('/api/v1/tasks/', () => HttpResponse.json([mockTask])),
  http.post('/api/v1/tasks/', () => HttpResponse.json(mockTask, { status: 201 })),
  http.put('/api/v1/tasks/:taskId/', () => HttpResponse.json({ ...mockTask, completed: true })),
  http.delete('/api/v1/tasks/:taskId/', () => new HttpResponse(null, { status: 204 })),

  // Notes
  http.get('/api/v1/notes/', () => HttpResponse.json([mockNote])),
  http.post('/api/v1/notes/', () => HttpResponse.json(mockNote, { status: 201 })),
  http.delete('/api/v1/notes/:noteId/', () => new HttpResponse(null, { status: 204 })),

  // Contacts
  http.get('/api/v1/contacts/', () => HttpResponse.json([mockContact])),
  http.post('/api/v1/contacts/', () => HttpResponse.json(mockContact, { status: 201 })),
  http.delete('/api/v1/contacts/:contactId/', () => new HttpResponse(null, { status: 204 })),

  // Adzuna
  http.get('/api/v1/adzuna/search/', () =>
    HttpResponse.json({ count: 1, results: [mockAdzunaResult] })
  ),

  // Translator
  http.post('/api/v1/translate/', () => HttpResponse.json(mockTranslationResult)),
];
