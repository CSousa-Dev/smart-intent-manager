/**
 * Intents API Integration Tests
 */

import request from 'supertest';
import { app } from '../../src/app';
import { getDatabase } from '../../src/infrastructure/database/DatabaseConnection';
import Database from 'better-sqlite3';

describe('Intents API Integration Tests', () => {
  let db: Database.Database;
  let createdIntentId: string;

  beforeAll(() => {
    db = getDatabase();
  });

  afterAll(() => {
    db.close();
  });

  beforeEach(() => {
    // Limpa a tabela antes de cada teste
    db.exec('DELETE FROM intents');
  });

  describe('POST /api/intent', () => {
    it('should create an intent successfully', async () => {
      const response = await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-001',
          label: 'greeting',
          description: 'Greeting intent',
          status: 'ACTIVE',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.clientId).toBe('client-001');
      expect(response.body.data.label).toBe('greeting');
      expect(response.body.data.description).toBe('Greeting intent');
      expect(response.body.data.status).toBe('ACTIVE');
      expect(response.body.data.createdAt).toBeDefined();

      createdIntentId = response.body.data.id;
    });

    it('should create intent with SUGGESTED status', async () => {
      const response = await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-001',
          label: 'suggested-intent',
          description: 'Suggested intent',
          status: 'SUGGESTED',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('SUGGESTED');
    });

    it('should return validation error for missing clientId', async () => {
      const response = await request(app)
        .post('/api/intent')
        .send({
          label: 'greeting',
          description: 'Description',
          status: 'ACTIVE',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return validation error for missing label', async () => {
      const response = await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-001',
          description: 'Description',
          status: 'ACTIVE',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return validation error for invalid status', async () => {
      const response = await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-001',
          label: 'greeting',
          description: 'Description',
          status: 'INVALID',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return conflict error when intent already exists', async () => {
      // Cria primeiro intent
      await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-001',
          label: 'greeting',
          description: 'Description',
          status: 'ACTIVE',
        })
        .expect(201);

      // Tenta criar duplicado
      const response = await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-001',
          label: 'greeting',
          description: 'Another description',
          status: 'ACTIVE',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return error when trying to create with INACTIVE status', async () => {
      const response = await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-001',
          label: 'greeting',
          description: 'Description',
          status: 'INACTIVE',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/intent?clientId=X', () => {
    beforeEach(async () => {
      // Cria intents para teste
      await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-001',
          label: 'greeting',
          description: 'Greeting intent',
          status: 'ACTIVE',
        });

      await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-001',
          label: 'farewell',
          description: 'Farewell intent',
          status: 'SUGGESTED',
        });

      await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-002',
          label: 'greeting',
          description: 'Greeting intent',
          status: 'ACTIVE',
        });
    });

    it('should list all intents for a client', async () => {
      const response = await request(app)
        .get('/api/intent?clientId=client-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.items).toBeInstanceOf(Array);
      expect(response.body.data.items.length).toBe(2);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.items[0].clientId).toBe('client-001');
      expect(response.body.data.items[1].clientId).toBe('client-001');
    });

    it('should return empty array when client has no intents', async () => {
      const response = await request(app)
        .get('/api/intent?clientId=client-999')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });

    it('should return error when clientId is missing', async () => {
      const response = await request(app)
        .get('/api/intent')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/intent/all', () => {
    beforeEach(async () => {
      // Cria intents para teste
      await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-001',
          label: 'greeting',
          description: 'Greeting intent',
          status: 'ACTIVE',
        });

      await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-002',
          label: 'farewell',
          description: 'Farewell intent',
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
      expect(response.body.data.total).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/intent/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-001',
          label: 'greeting',
          description: 'Greeting intent',
          status: 'ACTIVE',
        });

      createdIntentId = response.body.data.id;
    });

    it('should get intent by id', async () => {
      const response = await request(app)
        .get(`/api/intent/${createdIntentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdIntentId);
      expect(response.body.data.clientId).toBe('client-001');
      expect(response.body.data.label).toBe('greeting');
    });

    it('should return 404 for non-existent intent', async () => {
      const response = await request(app)
        .get('/api/intent/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/intent/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-001',
          label: 'greeting',
          description: 'Old description',
          status: 'SUGGESTED',
        });

      createdIntentId = response.body.data.id;
    });

    it('should update intent label', async () => {
      const response = await request(app)
        .put(`/api/intent/${createdIntentId}`)
        .send({
          label: 'updated-greeting',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.label).toBe('updated-greeting');
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should update intent description', async () => {
      const response = await request(app)
        .put(`/api/intent/${createdIntentId}`)
        .send({
          description: 'New description',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('New description');
    });

    it('should update intent status', async () => {
      const response = await request(app)
        .put(`/api/intent/${createdIntentId}`)
        .send({
          status: 'ACTIVE',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ACTIVE');
    });

    it('should promote SUGGESTED to ACTIVE', async () => {
      const response = await request(app)
        .put(`/api/intent/${createdIntentId}`)
        .send({
          status: 'ACTIVE',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ACTIVE');
    });

    it('should update all fields at once', async () => {
      const response = await request(app)
        .put(`/api/intent/${createdIntentId}`)
        .send({
          label: 'farewell',
          description: 'Updated description',
          status: 'ACTIVE',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.label).toBe('farewell');
      expect(response.body.data.description).toBe('Updated description');
      expect(response.body.data.status).toBe('ACTIVE');
    });

    it('should return 404 for non-existent intent', async () => {
      const response = await request(app)
        .put('/api/intent/non-existent-id')
        .send({
          label: 'updated-label',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return conflict error when label already exists for same client', async () => {
      // Cria outro intent
      await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-001',
          label: 'farewell',
          description: 'Farewell intent',
          status: 'ACTIVE',
        });

      // Tenta atualizar para label duplicado
      const response = await request(app)
        .put(`/api/intent/${createdIntentId}`)
        .send({
          label: 'farewell',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/intent/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/intent')
        .send({
          clientId: 'client-001',
          label: 'greeting',
          description: 'Greeting intent',
          status: 'ACTIVE',
        });

      createdIntentId = response.body.data.id;
    });

    it('should delete intent successfully', async () => {
      const response = await request(app)
        .delete(`/api/intent/${createdIntentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Intent deleted successfully');

      // Verifica que o intent foi removido do banco
      const intent = db.prepare('SELECT * FROM intents WHERE id = ?').get(createdIntentId);
      expect(intent).toBeUndefined();
    });

    it('should return 404 for non-existent intent', async () => {
      const response = await request(app)
        .delete('/api/intent/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

