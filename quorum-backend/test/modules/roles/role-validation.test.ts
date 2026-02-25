import { RoleRepository } from 'src/modules/roles/role.repository';
import { RoleValidation } from 'src/modules/roles/role.validation';

describe('RoleValidation', () => {
  let validator: RoleValidation;
  let repo: jest.Mocked<RoleRepository>;

  beforeEach(() => {
    repo = {
      findByName: jest.fn(),
      findById: jest.fn(),
    } as any;

    validator = new RoleValidation(repo);
  });

  it('[validateCreate] should fail if role name is already taken', async () => {
    repo.findByName.mockResolvedValue({ id: 1, name: 'ADMIN' } as any);

    await expect(
      validator.validateCreate({ name: 'ADMIN', permissions: [] } as any),
    ).rejects.toThrow('The role name is already taken');
  });

  it('[validateCreate] should pass if role name is not taken', async () => {
    repo.findByName.mockResolvedValue(null);

    await expect(
      validator.validateCreate({ name: 'EDITOR', permissions: [] } as any),
    ).resolves.not.toThrow();
  });

  it('[validateUpdate] should fail if role is admin', async () => {
    repo.findById.mockResolvedValue({ id: 1, name: 'ADMIN' } as any);

    await expect(
      validator.validateUpdate(1, { name: 'ADMIN2', permissions: [] } as any),
    ).rejects.toThrow('The role admin is not allowed to be modified');
  });

  it('[validateUpdate] should fail if new name is already taken by another role', async () => {
    repo.findById.mockResolvedValue({ id: 1, name: 'EDITOR' } as any);
    repo.findByName.mockResolvedValue({ id: 2, name: 'VIEWER' } as any);

    await expect(
      validator.validateUpdate(1, { name: 'VIEWER', permissions: [] } as any),
    ).rejects.toThrow('The role name is already taken');
  });

  it('[validateUpdate] should pass if same role keeps its name', async () => {
    repo.findById.mockResolvedValue({ id: 1, name: 'EDITOR' } as any);
    repo.findByName.mockResolvedValue({ id: 1, name: 'EDITOR' } as any);

    await expect(
      validator.validateUpdate(1, { name: 'EDITOR', permissions: [] } as any),
    ).resolves.not.toThrow();
  });

  it('[validateUpdate] should pass if name is not taken', async () => {
    repo.findById.mockResolvedValue({ id: 1, name: 'EDITOR' } as any);
    repo.findByName.mockResolvedValue(null);

    await expect(
      validator.validateUpdate(1, { name: 'NEWNAME', permissions: [] } as any),
    ).resolves.not.toThrow();
  });

  it('[validateDelete] should fail if role is admin', async () => {
    repo.findById.mockResolvedValue({ id: 1, name: 'ADMIN' } as any);

    await expect(validator.validateDelete(1)).rejects.toThrow(
      'The role admin is not allowed to be modified',
    );
  });

  it('[validateDelete] should fail if role does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(validator.validateDelete(999)).rejects.toThrow(
      'The role does not exist',
    );
  });

  it('[validateDelete] should pass if role exists and is not admin', async () => {
    repo.findById.mockResolvedValue({ id: 2, name: 'EDITOR' } as any);

    await expect(validator.validateDelete(2)).resolves.not.toThrow();
  });
});
