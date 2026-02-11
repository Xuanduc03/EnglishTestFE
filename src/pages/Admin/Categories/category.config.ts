/**
 * Category DTOs TypeScript Interfaces
 * Mapped from C# DTOs in App.Application.DTOs
 */

export interface CategoryDto {
  id: string;
  codeType: string;
  code?: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  childrenCount: number;
  children?: CategoryDto[];
}

export interface CategoryTreeDto {
  id: string;
  codeType: string;
  code?: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  level: number;
  children?: CategoryTreeDto[];
}

export interface CategoryDetailDto {
  id: string;
  codeType: string;
  code?: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  parent?: CategoryDto;
  children?: CategoryDto[];
}

export interface CodeTypeDto {
  codeType: string;
  count: number;
  activeCount: number;
  inactiveCount: number;
}

export interface CreateCategoryDto {
  codeType: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  deactivateChildren?: boolean;
}

// Additional helper types
export type CategoryStatus = 'Hoạt động' | 'Không hoạt động';

export interface CategoryFilters {
  codeType?: string;
  search?: string;
  isActive?: boolean;
  parentId?: string;
}

export interface CategoryFormData extends Omit<CreateCategoryDto, 'codeType'> {
  codeType?: string;
}

// Tree node type for Ant Design Tree component
export interface CategoryTreeNode {
  key: string;
  title: string;
  value: string;
  children?: CategoryTreeNode[];
  disabled?: boolean;
  isLeaf?: boolean;
}

export interface CategoryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;     // SEARCH
  codeType?: string;    // FILTER
  isActive?: boolean;     // FILTER
}