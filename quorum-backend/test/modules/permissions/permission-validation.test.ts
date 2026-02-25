import { PermissionRepository } from 'src/modules/permissions/permission.repository';
import { PermissionValidation } from 'src/modules/permissions/permission.validation';

describe('PermissionValidation', () => {
  let validator: PermissionValidation;
  let repo: jest.Mocked<PermissionRepository>;

  beforeEach(() => {
    repo = {
      findByName: jest.fn(),
      findById: jest.fn(),
    } as any;

    validator = new PermissionValidation(repo);
  });

  it('[validateCreate] should fail if permission name is already taken', async () => {
    repo.findByName.mockResolvedValue({ id: 1, name: 'read' } as any);

    await expect(
      validator.validateCreate({ name: 'read' } as any),
    ).rejects.toThrow('The permission name is already taken');
  });

  it('[validateCreate] should pass if permission name is not taken', async () => {
    repo.findByName.mockResolvedValue(null);

    await expect(
      validator.validateCreate({ name: 'write' } as any),
    ).resolves.not.toThrow();
  });

  it('[validateUpdate] should fail if new name is already taken by another permission', async () => {
    repo.findByName.mockResolvedValue({ id: 2, name: 'delete' } as any);

    await expect(
      validator.validateUpdate(1, { name: 'delete' } as any),
    ).rejects.toThrow('The permission name is already taken');
  });

  it('[validateUpdate] should pass if same permission keeps its name', async () => {
    repo.findByName.mockResolvedValue({ id: 1, name: 'read' } as any);

    await expect(
      validator.validateUpdate(1, { name: 'read' } as any),
    ).resolves.not.toThrow();
  });

  it('[validateUpdate] should pass if name is not taken', async () => {
    repo.findByName.mockResolvedValue(null);

    await expect(
      validator.validateUpdate(1, { name: 'newpermission' } as any),
    ).resolves.not.toThrow();
  });

  it('[validateDelete] should fail if permission does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(validator.validateDelete(999)).rejects.toThrow(
      'The permission does not exist',
    );
  });

  it('[validateDelete] should pass if permission exists', async () => {
    repo.findById.mockResolvedValue({ id: 1, name: 'read' } as any);

    await expect(validator.validateDelete(1)).resolves.not.toThrow();
  });
});
