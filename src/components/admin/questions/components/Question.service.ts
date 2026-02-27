import { api, apiUpload } from "../../../../configs/axios-custom";
import type { QuestionGroupDetailDto, QuestionListDto, SaveSingleQuestionDto, SingleQuestionDetailDto } from "../../questions/components/Quesion.config";

// Định nghĩa kiểu trả về cho danh sách phân trang
interface PaginatedResult<T> {
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const questionService = {
  // ================= GET (READ) =================

  // Lấy danh sách (có lọc, phân trang)
  getAll: async (params: any): Promise<PaginatedResult<QuestionListDto>> => {
    try {
      const queryParams: any = {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        keyword: params.search,
      };

      // Thêm các tham số lọc
      if (params.categoryId) queryParams.categoryId = params.categoryId;
      if (params.difficultyId && params.difficultyId !== 'all') {
        queryParams.difficultyId = params.difficultyId;
      }

      // Map status filter to IsActive
      if (params.status === 'active') {
        queryParams.isActive = true;
      } else if (params.status === 'inactive') {
        queryParams.isActive = false;
      }

      // Thêm sort params
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

      if (params.questionType && params.questionType !== 'all') {
        queryParams.questionType = params.questionType;
      }
      if (params.createFrom) queryParams.createFrom = params.createFrom;
      if (params.createTo) queryParams.createTo = params.createTo;


      const response = await api.get("/api/questions", {
        params: queryParams,
        paramsSerializer: {
          indexes: null
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      return {
        items: [],
        meta: {
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          total: 0,
          totalPages: 0,
        }
      };
    }
  },


  getSingleQuestion: async (id: string) => {
    const res = await api.get(`/api/questions/single/${id}`);
    return res.data;
  },

  getGroupQuestion: async (groupId: string) => {
    const res = await api.get(`/api/questions/group/${groupId}`);
    return res.data;
  },

  // ================= CREATE (WRITE) =================

  createSingle: async (data: FormData): Promise<string> => {
    const response = await api.post(
      "api/questions/singles",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },


  createGroup: async (data: FormData): Promise<string> => {
    const response = await api.post("api/questions/groups", data,
      {
        headers
          : {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // ================= UPDATE (WRITE) =================

  updateSingle: async (id: string, data: any): Promise<void> => {
    await apiUpload.put(`/api/questions/singles/${id}`, data);
  },

  updateGroup: async (id: string, data: any): Promise<void> => {
    await apiUpload.put(`/api/questions/groups/${id}`, data);
  },

  // ================= DELETE =================

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/questions/singles/${id}`);
  },


};