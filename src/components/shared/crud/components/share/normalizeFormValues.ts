import type { FormFieldConfig } from "../../type";

export function normalizeFormValues<T>(
  values: Record<string, any>,
  fields: FormFieldConfig[]
): Partial<T> {
  const normalized: any = { ...values };

  fields.forEach(field => {
    const value = normalized[field.name];
    if (value === undefined || value === null) return;

    if (field.type === "select") {
      if (field.mode === 'multiple') {
        // Đảm bảo luôn là mảng
        normalized[field.name] = Array.isArray(value) ? value : [value];
      } else {
        // Single select → lấy phần tử đầu nếu lỡ là mảng
        normalized[field.name] = Array.isArray(value) ? value[0] : value;
      }
    }

    if (field.type === "switch") {
      normalized[field.name] = Boolean(value);
    }
  });

  return normalized as Partial<T>;
}