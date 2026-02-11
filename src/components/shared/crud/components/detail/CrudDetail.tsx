import { Drawer, Descriptions, Tag, Typography, Skeleton, Badge } from 'antd';
import dayjs from 'dayjs';
import type { DetailFieldConfig, FormFieldConfig } from '../../type';

interface CrudDetailProps<T> {
  open: boolean;
  record?: T | null;
  fields: FormFieldConfig[];
  auditFields?: DetailFieldConfig<T>[];
  onClose: () => void;
  title?: string;
  loading?: boolean;
}

export const CrudDetail = <T extends Record<string, any>>({
  open,
  record,
  fields,
  onClose,
  auditFields,
  loading,
  title = "Chi tiết thông tin"
}: CrudDetailProps<T>) => {

  // Helper render chung
  const renderCommonValue = (value: any, type?: string) => {
    if (value === null || value === undefined) return <Typography.Text type="secondary">---</Typography.Text>;

    switch (type) {
      case 'date': return dayjs(value).format('DD/MM/YYYY HH:mm:ss');
      case 'boolean': return value ? <Badge status="success" text="Yes" /> : <Badge status="error" text="No" />;
      case 'tag':
        if (Array.isArray(value)) return value.map((v: any, i) => <Tag key={i} color="blue">{v.name || v}</Tag>);
        return <Tag>{value}</Tag>;
      default: return String(value);
    }
  };
  return (
    <Drawer title={title} placement="right" onClose={onClose} open={open} width={600}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        record && (
          <Descriptions column={1} bordered size="small" layout="horizontal">

            {/* 1. HIỂN THỊ CÁC FIELD CHÍNH (Từ Form Config) */}
            {fields.map((field) => {
              if (field.type === 'password' || field.hidden) return null;
              return (
                <Descriptions.Item key={field.name} label={field.label}>
                  {renderCommonValue(record[field.name], field.type === 'switch' ? 'boolean' : 'text')}
                </Descriptions.Item>
              )
            })}

            {/* 2. HIỂN THỊ CÁC FIELD HỆ THỐNG (Từ Audit Config) - DYNAMIC */}
            {auditFields && auditFields.length > 0 && (
              <>
                <div style={{ margin: '16px 0 8px', fontWeight: 'bold', color: '#1890ff' }}>Thông tin hệ thống</div>

                {/* ID luôn hiện hoặc tùy config */}
                <Descriptions.Item label="ID Hệ thống">
                  <Typography.Text copyable code>{record.id}</Typography.Text>
                </Descriptions.Item>

                {auditFields.map((audit) => {
                  // Check điều kiện ẩn
                  if (audit.hidden && audit.hidden(record)) return null;

                  return (
                    <Descriptions.Item key={audit.name} label={audit.label}>
                      {/* Nếu có hàm render riêng thì dùng, ko thì dùng render mặc định */}
                      {audit.render
                        ? audit.render(record[audit.name], record)
                        : renderCommonValue(record[audit.name], audit.type)}
                    </Descriptions.Item>
                  );
                })}
              </>
            )}

          </Descriptions>
        )
      )}
    </Drawer>
  );
};