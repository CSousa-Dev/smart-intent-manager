/**
 * Intents API Integration Tests
 */

import request from 'supertest';
import { app } from '../../src/app';
import { getDatabase } from '../../src/infrastructure/database/DatabaseConnection';
import Database from 'better-sqlite3';
import { TenantApiService } from '../../src/infrastructure/services/TenantApiService';
import { TenantId } from '../../src/domain/value-objects/TenantId';
import { Tenant } from '../../src/domain/entities/Tenant';

// Mock do TenantApiService para os testes
jest.mock('../../src/infrastructure/services/TenantApiService', () => {
  return {
    TenantApiService: jest.fn().mockImplementation(() => {
      return {
        findById: jest.fn().mockImplementation(async (id: TenantId) => {
          // Simula que tenant-001 e tenant-002 existem
          const tenantIdValue = id.getValue();
          if (tenantIdValue === 'tenant-001') {
            return Tenant.reconstitute('tenant-001', 'Tenant 001');
          }
          if (tenantIdValue === 'tenant-002') {
            return Tenant.reconstitute('tenant-002', 'Tenant 002');
          }
          return null;
        }),
        exists: jest.fn().mockImplementation(async (id: TenantId) => {
          // Simula que tenant-001 e tenant-002 existem
          const tenantIdValue = id.getValue();
          return tenantIdValue === 'tenant-001' || tenantIdValue === 'tenant-002';
        }),
      };
    }),
  };
});

describe('Intents API Integration Tests', () => {
  let db: Database.Database;
  let createdDefaultIntentId: string;
  let createdTenantIntentId: string;

  beforeAll(() => {
    db = getDatabase();
  });

  afterAll(() => {
    db.close();
  });

  beforeEach(() => {
    // Limpa as tabelas antes de cada teste
    db.exec('DELETE FROM tenant_intent_exclusions');
    db.exec('DELETE FROM tenant_intents');
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

  describe('POST /api/intent/tenant', () => {
    it('should create a tenant intent successfully', async () => {
      const response = await request(app)
        .post('/api/intent/tenant')
        .send({
          tenantIds: ['tenant-001'],
          label: 'tenant-greeting',
          description: 'Tenant greeting intent',
          status: 'ACTIVE',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.label).toBe('tenant-greeting');
      expect(response.body.data.isDefault).toBe(false);
      expect(response.body.data.tenantIds).toEqual(['tenant-001']);

      createdTenantIntentId = response.body.data.id;
    });

    it('should create a tenant intent with multiple tenantIds', async () => {
      const response = await request(app)
        .post('/api/intent/tenant')
        .send({
          tenantIds: ['tenant-001', 'tenant-002'],
          label: 'multi-tenant-intent',
          description: 'Intent for multiple tenants',
          status: 'ACTIVE',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tenantIds).toHaveLength(2);
      expect(response.body.data.tenantIds).toContain('tenant-001');
      expect(response.body.data.tenantIds).toContain('tenant-002');
    });

    it('should return error when tenantIds is empty', async () => {
      const response = await request(app)
        .post('/api/intent/tenant')
        .send({
          tenantIds: [],
          label: 'greeting',
          description: 'Description',
          status: 'ACTIVE',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error when tenant does not exist', async () => {
      const response = await request(app)
        .post('/api/intent/tenant')
        .send({
          tenantIds: ['non-existent-tenant'],
          label: 'greeting',
          description: 'Description',
          status: 'ACTIVE',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/intent?tenantId=X', () => {
    beforeEach(async () => {
      // Cria intenção default
      await request(app)
        .post('/api/intent/default')
        .send({
          label: 'default-greeting',
          description: 'Default greeting',
          status: 'ACTIVE',
        });

      // Cria intenção específica de tenant
      await request(app)
        .post('/api/intent/tenant')
        .send({
          tenantIds: ['tenant-001'],
          label: 'tenant-greeting',
          description: 'Tenant greeting',
          status: 'ACTIVE',
        });
    });

    it('should list intents for a tenant', async () => {
      const response = await request(app)
        .get('/api/intent?tenantId=tenant-001')
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
        .post('/api/intent/tenant')
        .send({
          tenantIds: ['tenant-001'],
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

    it('should link intent to tenant', async () => {
      const response = await request(app)
        .post(`/api/intent/${createdDefaultIntentId}/link`)
        .send({
          tenantId: 'tenant-001',
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

    it('should exclude intent from tenant', async () => {
      const response = await request(app)
        .post(`/api/intent/${createdDefaultIntentId}/exclude`)
        .send({
          tenantId: 'tenant-001',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
