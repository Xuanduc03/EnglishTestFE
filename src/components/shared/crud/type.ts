import type { TreeDataNode } from "antd";
import type { ColumnsType, TablePaginationConfig, TableProps } from "antd/es/table";
import type React from "react";


/**
 *  Interface type dùng chung để khởi tạo màn quản trị Form render
 * @param {T : string | number} Các đối tượng dùng chung để khởi tạo
 */
export interface CrudConfig<T extends { id?: string | number }> {
  title?: string;
  subtitle?: string;
  description?: string;
  service: ICrudService<T>;

  auditFields?: DetailFieldConfig<T>[];
  formFields: FormFieldConfig[];
  filters?: FilterConfig[];
  stats?: (data: T[]) => StatCardConfig[];

  viewMode?: 'table' | 'tree';
  tableConfig?: CrudTableConfig<T>['tableConfig'];
  treeConfig?: CrudTableConfig<T>['treeConfig'];
  manualFetch?: boolean;
  createButtonText?: string;      // Tùy chỉnh chữ nút tạo (VD: "Thêm học viên")
  headerExtra?: React.ReactNode;


  rowSelectionConfig?: RowSelectionConfig<T>;
  onBulkActions?: (selected: T[]) => void; // Callback bulk (e.g., delete selected)
  errorHandler?: (error: Error) => void;
}

/**
 * Interface triển khai các service dùng chung
 */
export interface ICrudService<T> {
  getAll: (params: PaginationParams) => Promise<PaginatedResult<T> | T[]>;
  getById: (id: string | number) => Promise<T | any>;
  create: (data: Partial<T>) => Promise<any>;
  update: (id: string | number, data: Partial<T>) => Promise<any>;
  delete: (id: string | number) => Promise<void>;
  bulkDelete?: (ids: (string|number)[]) => Promise<void>;
}

/**
 * interface triển khai header
 */
export interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  onCreate?: () => void;
  createButtonText?: string;
  extra?: React.ReactNode;
}

export interface CrudTableConfig<T extends object = any> {
  viewMode: 'table' | 'tree',
  data: T[];
  loading?: boolean;

  tableConfig?: {
    rowKey: string | ((record: T) => string);
    columns: ColumnsType<T>;
    pagination?: TablePaginationConfig | false;
    scroll?: { x?: number | string, y?: number | string };
    onChange?: (pagination: any, filters: any, sorter: any) => void;
    expandable?: TableProps<T>['expandable'];
  };
  treeConfig?: {
    buildTreeData: (data: T[]) => TreeDataNode[];
    defaultExpandAll?: boolean;
  };
}

// form field config
export type FormFieldType =
  | 'input'
  | 'textarea'
  | 'number'
  | 'select'
  | 'autocomplete'
  | 'switch'
  | 'password'
  | 'date'
  | 'disable'
  | 'hidden';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  defaultValue?: any;
  hidden?: boolean;
  dependency?: string;
  initialValue?: any; // giá trị khởi tạo khi dependency thay đổi
  mode?: 'single' | 'multiple';     // select 1 hay nhiều
  valueType?: 'string' | 'array';   // dữ liệu backend cần
  options?: { label: string, value: any }[]; // select tinh
  api?: (params?: any) => Promise<any[]> // select dong
  rules?: any[]; //antd mo rong
  colSpan?: number; // layout
  dependencies?: string[];
}

export interface FilterOption {
  label: string;
  value: string | number | boolean;
  color?: string;
}

export interface FilterConfig {
  name: string;
  type: 'input' | 'select'  | 'rangeDate';
  width: string;
  defaultValue?: any;
  initialValue?: any;
  placeholder?: string | [string, string];
  options?: FilterOption[];
  api?: () => Promise<any[]>;
}

export interface CrudFilterConfig {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  extra: any;
  onReset?: () => void;
}

// Stat chỉ là dữ liệu hiển thị
export interface StatCardConfig {
  title: string;
  value: number | string;
  color?: string;
  icon?: React.ReactElement;
}

// declare interface crud modal props 
export interface ICrudModalConfig<T extends { id?: string | number }> {
  open: boolean;
  record?: T | null;       // Nếu có record là Edit, null là Create
  fields: FormFieldConfig[];
  service: ICrudService<T>; // Service xử lý API
  onClose: () => void;
  onSuccess: () => void;
  width?: number;
  title?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  meta?: any;
  sortBy?: string;
  sortDesc?: boolean;
  [key: string]: any; // Cho phép thêm các filter khác
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface DetailFieldConfig<T = any> {
  name: string;      // Tên field trong data (VD: 'createdAt')
  label: string;     // Nhãn hiển thị (VD: 'Ngày tạo')
  type?: 'text' | 'date' | 'tag' | 'json' | 'boolean' | 'image';
  color?: string;    // Màu (nếu type là tag)
  render?: (value: any, record: T) => React.ReactNode;
  hidden?: (record: T) => boolean; // Logic ẩn hiện động
}


// Add: Type cho multi-select (checkbox column)
export interface RowSelectionConfig<T> {
  type?: 'checkbox' | 'radio';
  selectedRowKeys: React.Key[];
  onChange: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  getCheckboxProps?: (record: T) => { disabled: boolean };
}