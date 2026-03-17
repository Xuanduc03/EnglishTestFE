// AddQuestionModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import { DynamicSidebar } from "./QuestionTypeSidebar/QuestionSidebar";
import "./AddQuestionModal.scss";
import { EditorRenderer } from "./QuestionEditor/editor.registry";
import type { EditorKey, EditorSubmitPayload } from "./QuestionEditor/editor.type";
import { questionService } from "../components/Question.service";
import { categorieservice } from "../../../../pages/Admin/Categories/category.service";
import { toast } from "react-toastify";
import type { SingleQuestionDetailDto, QuestionGroupDetailDto } from "../components/Quesion.config";
import { mapGroupDtoToEditorData, mapSingleDtoToEditorData } from "./QuestionEditor/TOEIC/helper/QuestionMapper";
import { buildGroupFormData, buildSingleFormData } from "./QuestionEditor/TOEIC/helper/BuildForm";


// Định nghĩa kiểu dữ liệu cho EditingQuestion
type EditingQuestion =
  | { type: 'single'; data: SingleQuestionDetailDto }
  | { type: 'group'; data: QuestionGroupDetailDto }
  | null;

type Props = {
  open: boolean;
  editingQuestion?: EditingQuestion;
  onClose: () => void;
  onSubmitSuccess?: (id: string) => void;
  initialCategoryId?: string | null;
};


const mapCategoryIdToEditorKey = (
  categoryId: string,
  categories: Array<{ id: string; name: string; code?: string }>
): EditorKey => {
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) return "TOEIC_PART_1";

  // Ưu tiên dùng code nếu có
  const code = (category as any).code?.toUpperCase() ?? "";
  const name = category.name?.toLowerCase() ?? "";

  // ── Dùng code trước (chính xác hơn) ─────────────────────
  if (code) {
    if (code === "PART 1") return "TOEIC_PART_1";
    if (code === "PART 2") return "TOEIC_PART_2";
    if (code === "PART 3") return "TOEIC_PART_3";
    if (code === "PART 4") return "TOEIC_PART_4";
    if (code === "PART 5") return "TOEIC_PART_5";
    if (code === "PART 6") return "TOEIC_PART_6";
    if (code === "PART 7") return "TOEIC_PART_7";
    if (code.startsWith("IELTS_L")) return "IELTS_LISTENING";
    if (code.startsWith("IELTS_R")) return "IELTS_READING";
    if (code.startsWith("IELTS_W")) return "TOEIC_WRITING";
    if (code.startsWith("IELTS_SP")) return "TOEIC_SPEAKING";
    if (code === "WRITING") return "TOEIC_WRITING";
    if (code === "SPEAKING") return "TOEIC_SPEAKING";
  }

  // ── Fallback dùng name ───────────────────────────────────
  if (name.includes("section")) return "IELTS_LISTENING";
  if (name.includes("passage")) return "IELTS_READING";
  if (name.includes("part 1") && !name.includes("ielts")) return "TOEIC_PART_1";
  if (name.includes("part 2") && !name.includes("ielts")) return "TOEIC_PART_2";
  if (name.includes("part 3") && !name.includes("ielts")) return "TOEIC_PART_3";
  if (name.includes("part 4") && !name.includes("ielts")) return "TOEIC_PART_4";
  if (name.includes("part 5")) return "TOEIC_PART_5";
  if (name.includes("part 6")) return "TOEIC_PART_6";
  if (name.includes("part 7")) return "TOEIC_PART_7";
  if (name.includes("viết") || name.includes("writing")) return "TOEIC_WRITING";
  if (name.includes("nói") || name.includes("speaking")) return "TOEIC_SPEAKING";

  return "TOEIC_PART_1";
};

const mapEditorKeyToCategoryId = (key: EditorKey, categories: Array<{ id: string, name: string }>): string => {
  const nameMap: Partial<Record<EditorKey, string[]>> = {
    TOEIC_PART_1: ["part 1"],
    TOEIC_PART_2: ["part 2"],
    TOEIC_PART_3: ["part 3"],
    TOEIC_PART_4: ["part 4"],
    TOEIC_PART_5: ["part 5"],
    TOEIC_PART_6: ["part 6"],
    TOEIC_PART_7: ["part 7"],
    TOEIC_WRITING: ["viết", "writing"],
    TOEIC_SPEAKING: ["nói", "speaking"],
    IELTS_LISTENING: ["section 1"],  // default Section 1
    IELTS_READING: ["passage 1"],  // default Passage 1
  };
  const keywords = nameMap[key] ?? [];
  const found = categories.find(c =>
    keywords.some(k => c.name.toLowerCase().includes(k))
  );
  return found?.id ?? "";
};

const AddQuestionModal: React.FC<Props> = ({
  open,
  onClose,
  editingQuestion,
  onSubmitSuccess,
  initialCategoryId
}) => {
  const [editorKey, setEditorKey] = useState<EditorKey>("TOEIC_PART_1");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    code?: string;
  }>>([]);
  const [difficulties, setDifficulties] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [presetCategoryId, setPresetCategoryId] = useState<string>("");

  // Check an toàn
  const isEdit = !!editingQuestion && !!editingQuestion.data;

  const initialEditorData = useMemo(() => {
    if (!isEdit || !editingQuestion) return undefined;

    console.log('🔍 editingQuestion:', editingQuestion); // ✅ Debug

    let result;
    if (editingQuestion.type === "single") {
      result = mapSingleDtoToEditorData(editingQuestion.data);
    } else {
      result = mapGroupDtoToEditorData(editingQuestion.data);
    }

    return result;
  }, [isEdit, editingQuestion]);


  useEffect(() => {
    if (!open) return;

    if (isEdit && editingQuestion && categories.length > 0) {
      const key = mapCategoryIdToEditorKey(editingQuestion.data.categoryId, categories);
      setEditorKey(key);
    }
    else if (!isEdit && initialCategoryId && categories.length > 0) {
      const key = mapCategoryIdToEditorKey(initialCategoryId, categories);
      setEditorKey(key);
    }
    else if (!isEdit) {
      setEditorKey("TOEIC_PART_1");
    }
  }, [open, isEdit, editingQuestion, categories, initialCategoryId]);

  // lấy danh mục
  const loadData = async () => {
    if (categories.length > 0 && difficulties.length > 0) return;
    try {
      setLoading(true);
      const [resSkill, resLevel] = await Promise.all([
        categorieservice.getSelectCategory("skill"),
        categorieservice.getSelectCategory("level"),
      ]);

      // ← giữ lại code để map chính xác
      const categoriesData = resSkill.map((x: any) => ({
        id: x.value,
        name: x.label.replace(" (SKILL)", ""),
        code: x.code ?? x.label.replace(" (SKILL)", "").toUpperCase(),
      }));

      const difficultiesData = resLevel.map((x: any) => ({
        id: x.value,
        name: x.label.replace(" (LEVEL)", ""),
      }));

      setCategories(categoriesData);
      setDifficulties(difficultiesData);
    } catch (err) {
      console.error("Load data failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Load Data khi Modal mở
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const handleSave = async (data: EditorSubmitPayload) => {
    setSaving(true);
    try {
      let formData: FormData;

      // ✅ Adapter: object → FormData
      if (data.payload instanceof FormData) {

        formData = data.payload;
      } else {
        formData =
          data.mode === "single"
            ? buildSingleFormData(data.payload)
            : buildGroupFormData(data.payload);
      }

      let id: string | undefined;

      if (isEdit && editingQuestion) {
        if (data.mode === "single") {
          await questionService.updateSingle(editingQuestion.data.id, formData);
        } else {
          await questionService.updateGroup(editingQuestion.data.id, formData);
        }

        id = editingQuestion.data.id;

        toast.success(
          data.mode === "single"
            ? "Cập nhật câu hỏi thành công!"
            : "Cập nhật nhóm câu hỏi thành công!"
        );
      } else {
        id =
          data.mode === "single"
            ? await questionService.createSingle(formData)
            : await questionService.createGroup(formData);

        toast.success(
          data.mode === "single"
            ? "Tạo câu hỏi thành công!"
            : "Tạo nhóm câu hỏi thành công!"
        );
      }

      if (id) {
        onSubmitSuccess?.(id);
      }
      onClose();
    } catch (err: any) {
      console.error("Save failed:", err);
      toast.error(
        err.response?.data?.message || err.message || "Có lỗi xảy ra"
      );
    } finally {
      setSaving(false);
    }
  };


  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* HEADER */}
        <div className="modal-header">
          <div className="modal-title">
            {isEdit ? "Chỉnh sửa câu hỏi" : "Thêm mới câu hỏi"}
          </div>
          <div className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>

        <div className="modal-body">
          {/* SIDEBAR */}
          <DynamicSidebar
            activeEditorKey={editorKey}
            onSelectEditor={(key) => {
              if (!isEdit) {
                setEditorKey(key);
                const catId = mapEditorKeyToCategoryId(key, categories);
                setPresetCategoryId(catId);
              }
            }}
            disabled={isEdit}
          />

          {/* MAIN CONTENT */}
          <main className="main-content">
            {loading ? (
              <div className="loading-container">
                <i className="fa-solid fa-spinner fa-spin"></i>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <EditorRenderer
                editorKey={editorKey}
                editorProps={{
                  categories,
                  difficulties,
                  onSave: handleSave,
                  onCancel: onClose,
                  saving,
                  initialData: initialEditorData,
                  isEdit,
                  presetCategoryId,
                }}
              />

            )}
          </main>
        </div>

        {/* LOADING OVERLAY */}
        {saving && (
          <div className="saving-overlay">
            <div className="saving-spinner">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <p>Đang xử lý...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddQuestionModal;