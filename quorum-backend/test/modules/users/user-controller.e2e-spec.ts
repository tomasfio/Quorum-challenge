import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { UserRepository } from '../../../src/modules/users/user.repository';
import { RoleRepository } from '../../../src/modules/roles/role.repository';
import { PermissionRepository } from '../../../src/modules/permissions/permission.repository';
import { InMemoryUserRepository } from '../../helpers/in-memory-user.repository';
import { InMemoryRoleRepository } from '../../helpers/in-memory-role.repository';
import { InMemoryPermissionRepository } from '../../helpers/in-memory-permission.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/role.guards';

const mockGuard = { canActivate: () => true };

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let inMemoryRepo: InMemoryUserRepository;
  let inMemoryRoleRepo: InMemoryRoleRepository;
  let inMemoryPermissionRepo: InMemoryPermissionRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserRepository)
      .useClass(InMemoryUserRepository)
      .overrideProvider(RoleRepository)
      .useClass(InMemoryRoleRepository)
      .overrideProvider(PermissionRepository)
      .useClass(InMemoryPermissionRepository)
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
        user: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
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

    inMemoryRepo = moduleFixture.get(UserRepository) as InMemoryUserRepository;
    inMemoryRoleRepo = moduleFixture.get(RoleRepository) as InMemoryRoleRepository;
    inMemoryPermissionRepo = moduleFixture.get(PermissionRepository) as InMemoryPermissionRepository;

    inMemoryRoleRepo.seed({ name: 'EDITOR' });
    inMemoryRoleRepo.seed({ name: 'ADMIN' });
  });

  beforeEach(async () => {
    await inMemoryRepo.clear();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /users', () => {
    it('should create a user and return 201 with user data (no password)', async () => {
      const body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123',
        roles: ['EDITOR'],
        permissions: [],
      };

      const res = await request(app.getHttpServer())
        .post('/users')
        .send(body)
        .expect(201);

      expect(res.body).toMatchObject({
        name: body.name,
        email: body.email,
        roles: body.roles,
        permissions: body.permissions,
      });
      expect(res.body.id).toBeDefined();
      expect(typeof res.body.id).toBe('string');
      expect(res.body.password).toBeUndefined();
    });

    it('should reject when email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test',
          email: 'not-an-email',
          password: 'SecurePass123',
          roles: ['EDITOR'],
        })
        .expect(400);
    });

    it('should reject when password is too short', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test',
          email: 'test2@example.com',
          password: 'short',
          roles: ['EDITOR'],
        })
        .expect(400);
    });

    it('should reject when password is not strong (no uppercase, lowercase, number)', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test',
          email: 'other@example.com',
          password: '12345678',
          roles: ['EDITOR'],
        })
        .expect(400);
    });

    it('should reject duplicate email', async () => {
      const existingUser = inMemoryRepo.seed({ name: 'First', email: 'dup@example.com', password: 'SecurePass123', roles: ['EDITOR'] });
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Second',
          email: existingUser.email,
          password: 'SecurePass123',
          roles: ['EDITOR'],
        })
        .expect(409);
    });

    it('should reject when role is not valid', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test',
          email: 'test3@example.com',
          password: 'SecurePass123',
          roles: ['INVALID'],
        })
        .expect(404);
    });

    it('should reject when permission is not valid', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test',
          email: 'test4@example.com',
          password: 'SecurePass123',
          roles: ['EDITOR'],
          permissions: ['INVALID'],
        })
        .expect(404);
    });

    it('should reject when role is admin', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test',
          email: 'test5@example.com',
          password: 'SecurePass123',
          roles: ['ADMIN'],
        })
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('should return all users with roles and permissions', async () => {
      const existingUser = inMemoryRepo.seed({ name: 'First', email: 'dup@example.com', password: 'SecurePass123', roles: ['EDITOR'], permissions: [] });
      const existingUser2 = inMemoryRepo.seed({ name: 'Second', email: 'dup2@example.com', password: 'SecurePass123', roles: ['EDITOR'], permissions: ['read'] });
      const existingUser3 = inMemoryRepo.seed({ name: 'Third', email: 'dup3@example.com', password: 'SecurePass123', roles: [], permissions: [] });

      const res = await request(app.getHttpServer())
        .get('/users')
        .expect(200);
      expect(res.body).toBeDefined();
      expect(res.body.length).toBe(3);
      expect(res.body.map((user: UserResponseDto) => user.id)).toEqual([existingUser.id, existingUser2.id, existingUser3.id]);
      expect(res.body[0].roles).toEqual(['EDITOR']);
      expect(res.body[0].permissions).toEqual([]);
      expect(res.body[1].roles).toEqual(['EDITOR']);
      expect(res.body[1].permissions).toEqual(['read']);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id with roles and permissions', async () => {
      const existingUser = inMemoryRepo.seed({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'SecurePass123',
        roles: ['EDITOR'],
        permissions: ['read', 'write'],
      });

      const res = await request(app.getHttpServer())
        .get(`/users/${existingUser.id}`)
        .expect(200);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBe(existingUser.id);
      expect(res.body.name).toBe('Existing User');
      expect(res.body.email).toBe('existing@example.com');
      expect(res.body.roles).toEqual(['EDITOR']);
      expect(res.body.permissions).toEqual(['read', 'write']);
    });

    it('should return 404 if user not found', async () => {
      await request(app.getHttpServer())
        .get('/users/999')
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user and return 200 with user data (including roles and permissions)', async () => {
      const existingUser = inMemoryRepo.seed({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'SecurePass123',
        roles: ['EDITOR'],
        permissions: [],
      });
      inMemoryPermissionRepo.seed({ name: 'write' });

      const body = {
        name: 'Updated User',
        email: 'updated@example.com',
        roles: ['EDITOR'],
        permissions: ['write'],
      };
      const res = await request(app.getHttpServer())
        .patch(`/users/${existingUser.id}`)
        .send(body)
        .expect(200);
      expect(res.body).toMatchObject({
        name: body.name,
        email: body.email,
        roles: body.roles,
        permissions: body.permissions,
      });
    });

    it('should return 404 if user not found', async () => {
      await request(app.getHttpServer())
        .patch('/users/999')
        .send({ name: 'Updated User', email: 'updated@example.com', roles: ['EDITOR'], permissions: [] })
        .expect(404);
    });

    it('should return 400 if email is invalid', async () => {
      const existingUser = inMemoryRepo.seed({ name: 'Existing User', email: 'existing@example.com', password: 'SecurePass123', roles: ['EDITOR'] });

      await request(app.getHttpServer())
        .patch(`/users/${existingUser.id}`)
        .send({ email: 'not-an-email', name: 'Existing User', roles: ['EDITOR'], permissions: [] })
        .expect(400);
    });

    it('should return 403 if role is admin', async () => {
      const existingUser = inMemoryRepo.seed({ name: 'Existing User', email: 'existing@example.com', password: 'SecurePass123', roles: ['ADMIN'] });
      await request(app.getHttpServer())
        .patch(`/users/${existingUser.id}`)
        .send({ name: 'Updated User', email: 'updated@example.com', roles: ['ADMIN'], permissions: ['EDITOR'] })
        .expect(403);
    });

    it('should return 400 if permission is not valid', async () => {
      await request(app.getHttpServer())
        .patch('/users/999')
        .send({ name: 'Updated User', email: 'updated@example.com', roles: ['EDITOR'], permissions: ['INVALID'] })
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user and return 204', async () => {
      const toDelete = inMemoryRepo.seed({ name: 'To Delete', email: 'todelete@example.com', roles: ['EDITOR'], permissions: [] });
      await request(app.getHttpServer())
        .delete(`/users/${toDelete.id}`)
        .expect(204);
    });

    it('should return 404 if user not found', async () => {
      await request(app.getHttpServer())
        .delete('/users/999')
        .expect(404);
    });

    it('should return 400 if user is admin', async () => {
      const existingUser = inMemoryRepo.seed({ name: 'Existing User', email: 'existing@example.com', password: 'SecurePass123', roles: ['ADMIN'], permissions: [] });
      await request(app.getHttpServer())
        .delete(`/users/${existingUser.id}`)
        .expect(403);
    });
  });
});