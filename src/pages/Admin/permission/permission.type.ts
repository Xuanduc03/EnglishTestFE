// src/pages/Admin/Permission/permission.type.ts

export interface PermissionDto {
  id: string;
  name: string;
  description?: string;
  module?: string; // Quan trọng để group/filter
}

// Params gửi lên API (khớp với GetPermissionsQuery)
export interface PermissionParams {
  module?: string;
}

export interface CreatePermissionDto {
  name: string;
  module: string;
  description?: string;
}

export interface UpdatePermissionDto {
  name?: string;
  module?: string;
  description?: string;
}