import type { PaginationParams } from "../../../components/shared/crud/type";

export interface Permission {
  id: string;
  name: string;
  description?: string;
  module?: string;
}

export interface RoleDto {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface RoleDetail {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  userCount: number;
  permissions: Permission[];  
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissionIds?: string[];
}


export interface AssignPermissionsPayload {
  permissionIds: string[];
}

export interface SelectRoleDto {
  lable: string;
  value: string;
}


export interface RoleParams extends PaginationParams {
  keyword?: string;
  isActive?: boolean;
}