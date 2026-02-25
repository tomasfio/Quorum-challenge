import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthGuard } from '@nestjs/passport';
import { AppModule } from '../../../src/app.module';
import { RoleRepository } from '../../../src/modules/roles/role.repository';
import { PermissionRepository } from '../../../src/modules/permissions/permission.repository';
import { InMemoryRoleRepository } from '../../helpers/in-memory-role.repository';
import { InMemoryPermissionRepository } from '../../helpers/in-memory-permission.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { RolesGuard } from 'src/common/guards/role.guards';
import { ROLE_ADMIN } from 'src/shared/constants/role.constants';

const mockGuard = { canActivate: () => true };

describe('RoleController (e2e)', () => {
  let app: INestApplication;
  let inMemoryRoleRepo: InMemoryRoleRepository;
  let inMemoryPermissionRepo: InMemoryPermissionRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RoleRepository)
      .useClass(InMemoryRoleRepository)
      .overrideProvider(PermissionRepository)
      .useClass(InMemoryPermissionRepository)
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
        role: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
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

    inMemoryRoleRepo = moduleFixture.get(RoleRepository) as InMemoryRoleRepository;
    inMemoryPermissionRepo = moduleFixture.get(PermissionRepository) as InMemoryPermissionRepository;
  });

  beforeEach(async () => {
    await inMemoryRoleRepo.clear();
    await inMemoryPermissionRepo.clear();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /roles', () => {
    it('should return all roles', async () => {
      const r1 = inMemoryRoleRepo.seed({ name: 'EDITOR' });
      const r2 = inMemoryRoleRepo.seed({ name: 'VIEWER' });

      const res = await request(app.getHttpServer())
        .get('/roles')
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.length).toBe(2);
      expect(res.body.map((r: { id: number }) => r.id)).toEqual([r1.id, r2.id]);
    });

    it('should return empty array when no roles', async () => {
      const res = await request(app.getHttpServer())
        .get('/roles')
        .expect(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /roles/:id', () => {
    it('should return a role by id', async () => {
      const existing = inMemoryRoleRepo.seed({ name: 'EDITOR' });

      const res = await request(app.getHttpServer())
        .get(`/roles/${existing.id}`)
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.id).toBe(existing.id);
      expect(res.body.name).toBe('EDITOR');
    });

    it('should return 404 if role not found', async () => {
      await request(app.getHttpServer())
        .get('/roles/99999')
        .expect(404);
    });
  });

  describe('POST /roles', () => {
    it('should create a role and return 201 with role data', async () => {
      const body = { name: 'EDITOR', permissions: [] };

      const res = await request(app.getHttpServer())
        .post('/roles')
        .send(body)
        .expect(201);

      expect(res.body).toMatchObject({ name: body.name });
      expect(res.body.id).toBeDefined();
      expect(typeof res.body.id).toBe('number');
    });

    it('should create a role with permissions when permission names exist', async () => {
      inMemoryPermissionRepo.seed({ name: 'read' });
      inMemoryPermissionRepo.seed({ name: 'write' });

      const res = await request(app.getHttpServer())
        .post('/roles')
        .send({ name: 'EDITOR', permissions: ['read', 'write'] })
        .expect(201);

      expect(res.body.name).toBe('EDITOR');
      expect(res.body.id).toBeDefined();
      expect(res.body.permissions).toBeDefined();
      expect(Array.isArray(res.body.permissions)).toBe(true);
      expect(res.body.permissions.length).toBe(2);
    });

    it('should reject when name is empty', async () => {
      await request(app.getHttpServer())
        .post('/roles')
        .send({ name: '', permissions: [] })
        .expect(400);
    });

    it('should reject duplicate role name', async () => {
      inMemoryRoleRepo.seed({ name: 'EDITOR' });
      await request(app.getHttpServer())
        .post('/roles')
        .send({ name: 'EDITOR', permissions: [] })
        .expect(409);
    });

    it('should reject when creating role with name ADMIN', async () => {
      inMemoryRoleRepo.seed({ name: ROLE_ADMIN });
      await request(app.getHttpServer())
        .post('/roles')
        .send({ name: ROLE_ADMIN, permissions: [] })
        .expect(409);
    });
  });

  describe('PATCH /roles/:id', () => {
    it('should update a role and return 200 with role data', async () => {
      const existing = inMemoryRoleRepo.seed({ name: 'EDITOR' });
      const body = { name: 'VIEWER', permissions: [] };

      const res = await request(app.getHttpServer())
        .patch(`/roles/${existing.id}`)
        .send(body)
        .expect(200);

      expect(res.body).toMatchObject({ name: body.name });
    });

    it('should return 404 if role not found', async () => {
      await request(app.getHttpServer())
        .patch('/roles/99999')
        .send({ name: 'VIEWER', permissions: [] })
        .expect(404);
    });

    it('should reject when name is empty', async () => {
      const existing = inMemoryRoleRepo.seed({ name: 'EDITOR' });
      await request(app.getHttpServer())
        .patch(`/roles/${existing.id}`)
        .send({ name: '', permissions: [] })
        .expect(400);
    });
  });

  describe('DELETE /roles/:id', () => {
    it('should delete a role and return 204', async () => {
      const toDelete = inMemoryRoleRepo.seed({ name: 'VIEWER' });
      await request(app.getHttpServer())
        .delete(`/roles/${toDelete.id}`)
        .expect(204);
    });

    it('should return 404 if role not found', async () => {
      await request(app.getHttpServer())
        .delete('/roles/99999')
        .expect(404);
    });
  });
});
