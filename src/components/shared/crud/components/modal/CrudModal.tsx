import { Form, Modal } from "antd";
import { useEffect, useState } from "react";
import { FormRenderer } from "../formRender/FormRenderer"; // Đảm bảo bạn đã import đúng component này
import type { ICrudModalConfig } from "../../type";
import { toast } from "react-toastify";
import { normalizeFormValues } from "../share/normalizeFormValues";

export const CrudModal = <T extends { id?: string | number }>
  ({ open, record, fields, service, onClose, onSuccess, width = 600 }
    : ICrudModalConfig<T>) => {

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 1. Xử lý dữ liệu khi mở Modal
  useEffect(() => {
    if (open) {
      if (record) {
        const formData = { ...record } as any;
        if (Array.isArray(formData.roles)) {
          formData.roleIds = formData.roles.map((r: any) => r.id);
        }

        delete formData.password;
        delete formData.roles;

        form.setFieldsValue(formData);
      } else {
        form.resetFields();
      }
    }
  }, [open, record, form]);

  const handleSubmit = async () => {
    try {
      const rawValues = await form.validateFields();

      const values = normalizeFormValues(rawValues, fields);

      setSubmitting(true);
      
      if (record?.id) {
        // UPDATE
        await service.update(record.id, values);
        toast.success("Cập nhật thành công");
      } else {
        await service.create(values);
        toast.success("Tạo mới thành công");
      }

      onSuccess(); // Reload bảng
      onClose();   // Đóng modal
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }

      console.error("Submit Error:", error);
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={record ? "Cập nhật dữ liệu" : "Thêm mới dữ liệu"}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={submitting}
      width={width}
      maskClosable={false}
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        disabled={submitting}
      >
        <FormRenderer fields={fields} />
      </Form>
    </Modal>
  );
};