import { Col, Form, Input, InputNumber, Row, Select, Switch } from "antd";
import type { FormFieldConfig } from "../../type";
import { useEffect, useState } from "react";

// --- 1. COMPONENT CON: Xử lý riêng cho Select có Dependency ---
const DependencySelect = ({ field }: { field: FormFieldConfig }) => {
  const form = Form.useFormInstance(); // Lấy instance form hiện tại

  const dependencyValue = Form.useWatch(field.dependency!, form);

  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dependencyValue) {
      setOptions([]);
      form.setFieldValue(field.name, undefined); 
      return;
    }

    if (field.api) {
      setLoading(true);
      form.setFieldValue(field.name, undefined);
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
    if (f.type === 'custom' && f.renderInput) {
      return f.renderInput({});
    }
    if (f.dependency && f.type === 'select') {
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
            placeholder={f.placeholder}
            disabled={f.disabled}
            filterOption={(input, option) =>
              (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <Row gutter={[16, 0]}>
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
              dependencies={f.dependencies} // Antd dependencies (để re-render khi field khác đổi)
              initialValue={f.defaultValue}
            >
              {renderField(f)}
            </Form.Item>
          </Col>
        );
      })}
    </Row>
  );
};