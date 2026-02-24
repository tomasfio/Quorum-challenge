import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';


export const HasRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const HasPermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
