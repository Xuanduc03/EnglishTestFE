import { useState, useCallback } from "react";
import { message } from "antd";
import type { ICrudService, PaginationParams } from "../type";
import { toast } from "react-toastify";

export function useCrud<T extends { id?: string | number }>(
  service: ICrudService<T>,
  options?: {
    defaultPageSize?: number;
    manualFetch?: boolean; // Có tự động fetch khi mount không
  }
) {
  // --- STATE ---
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<{ open: boolean; record?: T | null }>({
    open: false,
    record: null,
  });
  // State quản lý Modal
  const [modal, setModal] = useState<{ open: boolean; record?: T | null }>({
    open: false,
    record: null,
  });

  // state sort
  const [sorter, setSorter] = useState<{ field: string; order: string }>({
    field: '',
    order: '' // 'ascend' | 'descend' | ''
  });

  // State quản lý Filter & Pagination
  const [filters, setFilters] = useState<any>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: options?.defaultPageSize || 10,
    total: 0,
  });

  // --- ACTIONS ---

  // 1. Fetch Data (Hỗ trợ phân trang)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Gom params: filter hiện tại + phân trang hiện tại
      const params: PaginationParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
        sortBy: sorter.field,
        sortOrder: sorter.order === 'ascend' ? 'asc' : (sorter.order === 'descend' ? 'desc' : undefined)
      };

      const res = await service.getAll(params);
      const response = res as any;

      if (response.data.items && Array.isArray(response.data.items)) {
        setData(response.data.items);

        setPagination((prev) => ({
          ...prev,
          total: response.data.meta?.total || 0
        }));
      }
      else if (Array.isArray(response?.data)) {
        setData(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.length
        }));
      }
      else {
        // Fallback: nếu API trả về khác cấu trúc thì set rỗng
        console.warn("API response format không khớp:", res);
        setData([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  }, [service, filters, pagination.current, pagination.pageSize, sorter]);

  // 2. Handle Pagination Change (Dùng cho Table onChange)
  const handleTableChange = (newPagination: any, newFilters: any, newSorter: any) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));

    if (newSorter.order) {
      setSorter({
        field: newSorter.field as string,
        order: newSorter.order
      });
    } else {
      // Nếu người dùng hủy sort (click lần 3)
      setSorter({ field: '', order: '' });
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id: string | number) => {
    try {
      setLoading(true);
      await service.delete(id);
      toast.success("Xóa thành công!");
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại!");
    } finally {
      setLoading(false);
    }
  };


  // 4. Helper mở Modal Create
  const openCreateModal = () => {
    setModal({ open: true, record: null });
  };

  // 5. Helper mở Modal Edit
  const openEditModal = async (record: T) => {
    if (record.id) {
        try {
            setLoading(true); 
            const res = await service.getById(record.id);
            const data = res.data || res; // Tùy cấu trúc trả về của BE
            setModal({ open: true, record: data });
        } catch (error) {
            console.error("Lỗi lấy chi tiết:", error);
            toast.error("Không thể lấy thông tin chi tiết");
        } finally {
            setLoading(false);
        }
    } else {
        // Fallback nếu ko có ID (hiếm gặp)
        setModal({ open: true, record });
    }
  };

  // 6. Helper đóng Modal
  const closeModal = () => {
    setModal({ open: false, record: null });
  };

  // handle get detail 
  const handleGetDetail = async (id: string | number) => {
    try {
      setDetailLoading(true);
      setDetail({ open: true, record: null });

      const data = await service.getById(id);

      // Update lại dữ liệu thật sau khi API trả về
      const recordData = data.data || data;

      setDetail({ open: true, record: recordData });

    } catch (error) {
      console.error(error);
      // Nếu lỗi thì đóng lại
      setDetail({ open: false, record: null });
    } finally {
      setDetailLoading(false);
    }
  }

  return {
    // Data States
    data,
    loading,

    // Filter & Pagination States
    filters,
    setFilters,
    pagination,
    setPagination,

    // Modal States & Actions
    modal,
    setModal, // Vẫn giữ setModal gốc nếu muốn custom sâu
    openCreateModal,
    openEditModal,
    closeModal,
    handleGetDetail,
    detailLoading,

    // CRUD Actions
    fetchData,
    handleDelete,
    setDetail,
    detail,
    handleTableChange
  };
}