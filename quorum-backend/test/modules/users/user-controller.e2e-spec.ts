import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { UserRepository } from '../../../src/modules/users/user.repository';
import { InMemoryUserRepository } from '../../helpers/in-memory-user.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let inMemoryRepo: InMemoryUserRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserRepository)
      .useClass(InMemoryUserRepository)
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
        user: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      })
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
      };

      const res = await request(app.getHttpServer())
        .post('/users')
        .send(body)
        .expect(201);

      expect(res.body).toMatchObject({
        name: body.name,
        email: body.email,
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
        })
        .expect(400);
    });

    it('should reject duplicate email', async () => {
      const existingUser = inMemoryRepo.seed({ name: 'First', email: 'dup@example.com', password: 'SecurePass123' });
      await request(app.getHttpServer())
        .post('/users')
        .send({ 
          name: 'Second', 
          email: existingUser.email, 
          password: 'SecurePass123' })
          .expect(409);
    });
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const existingUser = inMemoryRepo.seed({ name: 'First', email: 'dup@example.com', password: 'SecurePass123' });
      const existingUser2 = inMemoryRepo.seed({ name: 'Second', email: 'dup2@example.com', password: 'SecurePass123' });
      const existingUser3 = inMemoryRepo.seed({ name: 'Third', email: 'dup3@example.com', password: 'SecurePass123' });

      const res = await request(app.getHttpServer())
        .get('/users')
        .expect(200);
      expect(res.body).toBeDefined();
      expect(res.body.length).toBe(3);
      expect(res.body.map((user: UserResponseDto) => user.id)).toEqual([existingUser.id, existingUser2.id, existingUser3.id]);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const existingUser = inMemoryRepo.seed({ name: 'Existing User', email: 'existing@example.com', password: 'SecurePass123' });

      const res = await request(app.getHttpServer())
        .get(`/users/${existingUser.id}`)
        .expect(200);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBe(existingUser.id);
      expect(res.body.name).toBe('Existing User');
      expect(res.body.email).toBe('existing@example.com');
    });

    it('should return 404 if user not found', async () => {
      await request(app.getHttpServer())
        .get('/users/999')
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user and return 200 with user data', async () => {
      const existingUser = inMemoryRepo.seed({ name: 'Existing User', email: 'existing@example.com', password: 'SecurePass123' });

      const body = {
        name: 'Updated User',
        email: 'updated@example.com',
      };
      const res = await request(app.getHttpServer())
        .patch(`/users/${existingUser.id}`)
        .send(body)
        .expect(200);
      expect(res.body).toMatchObject(body);
    });

    it('should return 404 if user not found', async () => {
      await request(app.getHttpServer())
        .patch('/users/999')
        .send({ name: 'Updated User', email: 'updated@example.com' })
        .expect(404);
    });

    it('should return 400 if email is invalid', async () => {
      const existingUser = inMemoryRepo.seed({ name: 'Existing User', email: 'existing@example.com', password: 'SecurePass123' });

      await request(app.getHttpServer())
        .patch(`/users/${existingUser.id}`)
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user and return 204', async () => {
      const toDelete = inMemoryRepo.seed({ name: 'To Delete', email: 'todelete@example.com' });
      await request(app.getHttpServer())
        .delete(`/users/${toDelete.id}`)
        .expect(204);
    });

    it('should return 404 if user not found', async () => {
      await request(app.getHttpServer())
        .delete('/users/999')
        .expect(404);
    });
  });
});
