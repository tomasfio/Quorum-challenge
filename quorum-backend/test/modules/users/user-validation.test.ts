import { UserRepository } from "src/modules/users/user.repository";
import { UsersValidation } from "src/modules/users/user.validation";

describe('UsersValidation', () => {
    let validator: UsersValidation;
    let repo: jest.Mocked<UserRepository>;
  
    beforeEach(() => {
      repo = {
        findByEmail: jest.fn(),
        getUserById: jest.fn(),
      } as any;
  
      validator = new UsersValidation(repo);
    });
  
    it('[validateCreate] should fail if email is already taken', async () => {
        repo.findByEmail.mockResolvedValue({ id: '1' } as any);
  
      await expect(
        validator.validateCreate({ email: 'a@test.com', password: 'Abc12345' } as any),
      ).rejects.toThrow('The email is already in use');
    });

    it('[validateCreate] should fail if password is not strong', async () => {
        await expect(
            validator.validateCreate({ email: 'a@test.com', password: '1234567' } as any),
        ).rejects.toThrow('The password must be at least 8 characters, uppercase, lowercase and numbers');
    });

    it('[validateCreate] should pass if password is strong and email is not taken', async () => {
        repo.findByEmail.mockResolvedValue(null);

        await expect(
            validator.validateCreate({ email: 'a@test.com', password: 'Abc12345' } as any),
        ).resolves.not.toThrow();
    });

    it('[validateDelete] should fail if user does not exist', async () => {
        await expect(
            validator.validateDelete('1'),
        ).rejects.toThrow('The user does not exist');
    });

    it('[validateDelete] should pass if user exists', async () => {
        repo.getUserById.mockResolvedValue({ id: '1' } as any);

        await expect(
            validator.validateDelete('1'),
        ).resolves.not.toThrow();
    });

    it('[validateUpdate] should fail if email is already taken', async () => {
        repo.findByEmail.mockResolvedValue({ id: '2' } as any);
        await expect(
            validator.validateUpdate('1', { email: 'a@test.com' } as any),
        ).rejects.toThrow('The email is already in use');
    });

    it('[validateUpdate] should pass if email is not taken', async () => {
        repo.findByEmail.mockResolvedValue(null);

        await expect(
            validator.validateUpdate('1', { email: 'a@test.com' } as any),
        ).resolves.not.toThrow();
    });
  });