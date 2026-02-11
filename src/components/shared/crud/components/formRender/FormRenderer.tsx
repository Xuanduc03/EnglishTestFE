import { Col, Form, Input, InputNumber, Row, Select, Switch } from "antd";
import type { FormFieldConfig } from "../../type";
import { useEffect, useState } from "react";

// --- 1. COMPONENT CON: Xử lý riêng cho Select có Dependency ---
const DependencySelect = ({ field }: { field: FormFieldConfig }) => {
  const form = Form.useFormInstance(); // Lấy instance form hiện tại

  // Hook này sẽ re-render component mỗi khi field 'dependency' thay đổi
  const dependencyValue = Form.useWatch(field.dependency!, form);

  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Nếu field cha chưa có giá trị -> Reset options và value
    if (!dependencyValue) {
      setOptions([]);
      form.setFieldValue(field.name, undefined); // Reset giá trị ô hiện tại
      return;
    }

    // Nếu có giá trị field cha và có hàm API
    if (field.api) {
      setLoading(true);
      // Reset giá trị cũ để user phải chọn lại
      form.setFieldValue(field.name, undefined);

      // Gọi API với tham số là giá trị của field cha
      field.api(dependencyValue)
        .then((data) => {
          setOptions(data);
        })
        .finally(() => setLoading(false));
    }
  }, [dependencyValue, field.api, field.name, form]);

  return (
    <Select
      placeholder={field.label}
      options={options}
      loading={loading}
      disabled={!dependencyValue}
      allowClear
    />
  );
};

// --- 2. COMPONENT CHÍNH ---
export const FormRenderer = ({ fields }: { fields: FormFieldConfig[] }) => {
  const [optionsMap, setOptionsMap] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fields.forEach(async (field) => {
      if (field.type === "select" && field.api && !field.dependency) {
        const data = await field.api();
        setOptionsMap(prev => ({
          ...prev,
          [field.name]: data
        }));
      }
    });
  }, [fields]);

  // Render từng kiểu field
  const renderField = (f: FormFieldConfig) => {

    if (f.dependency) {
      return <DependencySelect field={f} />;
    }

    // Các case thông thường
    switch (f.type) {
      case 'input':
        return <Input disabled={f.disabled} />;

      case 'textarea':
        return <Input.TextArea rows={3} />;

      case 'number':
        return <InputNumber style={{ width: '100%' }} />;

      case 'switch':
        return <Switch />;

      case 'select':
        return (
          <Select
            mode={f.mode === 'multiple' ? 'multiple' : undefined}
            options={f.options ?? optionsMap[f.name]}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '')
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <Row gutter={[0, 16]}>
      {fields.map(f => {
        if (f.hidden) return null;

        const rules = f.required
          ? [{ required: true, message: `${f.label} là bắt buộc` }]
          : f.rules;

        return (
          <Col span={24} key={f.name}>
            <Form.Item
              name={f.name}
              label={f.label}
              rules={rules}
              valuePropName={f.type === 'switch' ? 'checked' : 'value'}
              style={{ marginBottom: 0 }}
            >
              {renderField(f)}
            </Form.Item>
          </Col>
        );
      })}
    </Row>
  );
};