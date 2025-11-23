/**
 * Intents API Integration Tests
 */

import request from 'supertest';
import { app } from '../../src/app';
import { getDatabase } from '../../src/infrastructure/database/DatabaseConnection';
import Database from 'better-sqlite3';

describe('Intents API Integration Tests', () => {
  let db: Database.Database;
  let createdDefaultIntentId: string;
  let createdClientIntentId: string;

  beforeAll(() => {
    db = getDatabase();
  });

  afterAll(() => {
    db.close();
  });

  beforeEach(() => {
    // Limpa as tabelas antes de cada teste
    db.exec('DELETE FROM client_intent_exclusions');
    db.exec('DELETE FROM client_intents');
    db.exec('DELETE FROM intents');
  });

  describe('POST /api/intent/default', () => {
    it('should create a default intent successfully', async () => {
      const response = await request(app)
        .post('/api/intent/default')
        .send({
          label: 'greeting',
          description: 'Greeting intent',
          status: 'ACTIVE',
          synonyms: ['marcar', 'agendar'],
          examplePhrases: ['Quero marcar', 'Posso agendar?'],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.label).toBe('greeting');
      expect(response.body.data.description).toBe('Greeting intent');
      expect(response.body.data.status).toBe('ACTIVE');
      expect(response.body.data.isDefault).toBe(true);
      expect(response.body.data.synonyms).toEqual(['marcar', 'agendar']);
      expect(response.body.data.examplePhrases).toEqual(['Quero marcar', 'Posso agendar?']);
      expect(response.body.data.createdAt).toBeDefined();

      createdDefaultIntentId = response.body.data.id;
    });

    it('should create default intent with SUGGESTED status', async () => {
      const response = await request(app)
        .post('/api/intent/default')
        .send({
          label: 'suggested-intent',
          description: 'Suggested intent',
          status: 'SUGGESTED',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('SUGGESTED');
      expect(response.body.data.isDefault).toBe(true);
    });

    it('should return validation error for missing label', async () => {
      const response = await request(app)
        .post('/api/intent/default')
        .send({
          description: 'Description',
          status: 'ACTIVE',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return conflict error when intent already exists', async () => {
      // Cria primeiro intent
      await request(app)
        .post('/api/intent/default')
        .send({
          label: 'greeting',
          description: 'Description',
          status: 'ACTIVE',
        })
        .expect(201);

      // Tenta criar duplicado
      const response = await request(app)
        .post('/api/intent/default')
        .send({
          label: 'greeting',
          description: 'Another description',
          status: 'ACTIVE',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/intent/client', () => {
    it('should create a client intent successfully', async () => {
      const response = await request(app)
        .post('/api/intent/client')
        .send({
          clientId: 'client-001',
          label: 'client-greeting',
          description: 'Client greeting intent',
          status: 'ACTIVE',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.label).toBe('client-greeting');
      expect(response.body.data.isDefault).toBe(false);

      createdClientIntentId = response.body.data.id;
    });
  });

  describe('GET /api/intent?clientId=X', () => {
    beforeEach(async () => {
      // Cria intenção default
      await request(app)
        .post('/api/intent/default')
        .send({
          label: 'default-greeting',
          description: 'Default greeting',
          status: 'ACTIVE',
        });

      // Cria intenção específica de cliente
      await request(app)
        .post('/api/intent/client')
        .send({
          clientId: 'client-001',
          label: 'client-greeting',
          description: 'Client greeting',
          status: 'ACTIVE',
        });
    });

    it('should list intents for a client', async () => {
      const response = await request(app)
        .get('/api/intent?clientId=client-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.items.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.total).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/intent/all', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/intent/default')
        .send({
          label: 'greeting-1',
          description: 'Greeting 1',
          status: 'ACTIVE',
        });

      await request(app)
        .post('/api/intent/client')
        .send({
          clientId: 'client-001',
          label: 'greeting-2',
          description: 'Greeting 2',
          status: 'SUGGESTED',
        });
    });

    it('should list all intents', async () => {
      const response = await request(app)
        .get('/api/intent/all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.items.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/intent/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/intent/default')
        .send({
          label: 'greeting',
          description: 'Greeting intent',
          status: 'ACTIVE',
        });

      createdDefaultIntentId = response.body.data.id;
    });

    it('should get intent by id', async () => {
      const response = await request(app)
        .get(`/api/intent/${createdDefaultIntentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdDefaultIntentId);
      expect(response.body.data.label).toBe('greeting');
      expect(response.body.data.isDefault).toBe(true);
    });

    it('should return 404 for non-existent intent', async () => {
      const response = await request(app)
        .get('/api/intent/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/intent/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/intent/default')
        .send({
          label: 'greeting',
          description: 'Old description',
          status: 'SUGGESTED',
        });

      createdDefaultIntentId = response.body.data.id;
    });

    it('should update intent label', async () => {
      const response = await request(app)
        .put(`/api/intent/${createdDefaultIntentId}`)
        .send({
          label: 'updated-greeting',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.label).toBe('updated-greeting');
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should update intent synonyms and examplePhrases', async () => {
      const response = await request(app)
        .put(`/api/intent/${createdDefaultIntentId}`)
        .send({
          synonyms: ['marcar', 'agendar'],
          examplePhrases: ['Quero marcar', 'Posso agendar?'],
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.synonyms).toEqual(['marcar', 'agendar']);
      expect(response.body.data.examplePhrases).toEqual(['Quero marcar', 'Posso agendar?']);
    });
  });

  describe('DELETE /api/intent/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/intent/default')
        .send({
          label: 'greeting',
          description: 'Greeting intent',
          status: 'ACTIVE',
        });

      createdDefaultIntentId = response.body.data.id;
    });

    it('should delete intent successfully', async () => {
      const response = await request(app)
        .delete(`/api/intent/${createdDefaultIntentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Intent deleted successfully');

      // Verifica que o intent foi removido do banco
      const intent = db.prepare('SELECT * FROM intents WHERE id = ?').get(createdDefaultIntentId);
      expect(intent).toBeUndefined();
    });
  });

  describe('POST /api/intent/:id/link', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/intent/default')
        .send({
          label: 'default-intent',
          description: 'Default intent',
          status: 'ACTIVE',
        });

      createdDefaultIntentId = response.body.data.id;
    });

    it('should link intent to client', async () => {
      const response = await request(app)
        .post(`/api/intent/${createdDefaultIntentId}/link`)
        .send({
          clientId: 'client-001',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/intent/:id/exclude', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/intent/default')
        .send({
          label: 'default-intent',
          description: 'Default intent',
          status: 'ACTIVE',
        });

      createdDefaultIntentId = response.body.data.id;
    });

    it('should exclude intent from client', async () => {
      const response = await request(app)
        .post(`/api/intent/${createdDefaultIntentId}/exclude`)
        .send({
          clientId: 'client-001',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
