import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthGuard } from '@nestjs/passport';
import { AppModule } from '../../../src/app.module';
import { PermissionRepository } from '../../../src/modules/permissions/permission.repository';
import { InMemoryPermissionRepository } from '../../helpers/in-memory-permission.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { RolesGuard } from 'src/common/guards/role.guards';

const mockGuard = { canActivate: () => true };

describe('PermissionController (e2e)', () => {
  let app: INestApplication;
  let inMemoryRepo: InMemoryPermissionRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PermissionRepository)
      .useClass(InMemoryPermissionRepository)
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
        permission: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();

    inMemoryRepo = moduleFixture.get(PermissionRepository) as InMemoryPermissionRepository;
  });

  beforeEach(async () => {
    await inMemoryRepo.clear();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /permissions', () => {
    it('should return all permissions', async () => {
      const p1 = inMemoryRepo.seed({ name: 'read' });
      const p2 = inMemoryRepo.seed({ name: 'write' });

      const res = await request(app.getHttpServer())
        .get('/permissions')
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.length).toBe(2);
      expect(res.body.map((p: { id: number }) => p.id)).toEqual([p1.id, p2.id]);
    });

    it('should return empty array when no permissions', async () => {
      const res = await request(app.getHttpServer())
        .get('/permissions')
        .expect(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /permissions/:id', () => {
    it('should return a permission by id', async () => {
      const existing = inMemoryRepo.seed({ name: 'read' });

      const res = await request(app.getHttpServer())
        .get(`/permissions/${existing.id}`)
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.id).toBe(existing.id);
      expect(res.body.name).toBe('read');
    });

    it('should return 404 if permission not found', async () => {
      await request(app.getHttpServer())
        .get('/permissions/99999')
        .expect(404);
    });
  });

  describe('POST /permissions', () => {
    it('should create a permission and return 201 with permission data', async () => {
      const body = { name: 'read' };

      const res = await request(app.getHttpServer())
        .post('/permissions')
        .send(body)
        .expect(201);

      expect(res.body).toMatchObject(body);
      expect(res.body.id).toBeDefined();
      expect(typeof res.body.id).toBe('number');
    });

    it('should reject when name is empty', async () => {
      await request(app.getHttpServer())
        .post('/permissions')
        .send({ name: '' })
        .expect(400);
    });

    it('should reject duplicate permission name', async () => {
      inMemoryRepo.seed({ name: 'read' });
      await request(app.getHttpServer())
        .post('/permissions')
        .send({ name: 'read' })
        .expect(409);
    });
  });

  describe('PATCH /permissions/:id', () => {
    it('should update a permission and return 200 with permission data', async () => {
      const existing = inMemoryRepo.seed({ name: 'read' });
      const body = { name: 'read:all' };

      const res = await request(app.getHttpServer())
        .patch(`/permissions/${existing.id}`)
        .send(body)
        .expect(200);

      expect(res.body).toMatchObject(body);
    });

    it('should return 404 if permission not found', async () => {
      await request(app.getHttpServer())
        .patch('/permissions/99999')
        .send({ name: 'write' })
        .expect(404);
    });

    it('should reject when name is empty', async () => {
      const existing = inMemoryRepo.seed({ name: 'read' });
      await request(app.getHttpServer())
        .patch(`/permissions/${existing.id}`)
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('DELETE /permissions/:id', () => {
    it('should delete a permission and return 204', async () => {
      const toDelete = inMemoryRepo.seed({ name: 'read' });
      await request(app.getHttpServer())
        .delete(`/permissions/${toDelete.id}`)
        .expect(204);
    });

    it('should return 404 if permission not found', async () => {
      await request(app.getHttpServer())
        .delete('/permissions/99999')
        .expect(404);
    });
  });
});
