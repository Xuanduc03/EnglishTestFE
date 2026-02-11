import type { PaginationParams } from "../../../components/shared/crud/type";
import type { RoleDto } from "../Roles/role.type";

export interface UserListDto {
  id: string;
  email: string;
  fullname: string;
  phone?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  lastLogin?: string;
  roles: RoleDto[];
}

export interface UserUpdateDto {
  id: string;
  email: string;
  fullname: string;
  phone?: string;
  isActive?: boolean;
  roleIds?: string[];
}

// Định nghĩa cấu trúc trả về từ API
export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    meta: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UserParams extends PaginationParams {
  keyword?: string;
  roleIds?: string[];        // KHỚP BE
  isActive?: boolean;
  isEmailVerified?: boolean;
  includeDeleted?: boolean;
}