import type { CrudFilterConfig, FilterConfig } from "../../type"; // Giả sử bạn có export FilterConfig từ type
import { useEffect, useState } from "react";
import { Input, Select, Space, DatePicker } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export const CrudFilter: React.FC<CrudFilterConfig> = ({ filters, values, onChange, extra }) => {
    const [optionsMap, setOptionsMap] = useState<Record<string, any[]>>({});
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
        filters.forEach(async (filter) => {
            if (filter.type === "select" && filter.api) {
                // Có thể thêm loading state ở đây nếu muốn
                setLoadingMap(prev => ({ ...prev, [filter.name]: true }));
                try {
                    const data = await filter.api();
                    setOptionsMap(prev => ({
                        ...prev,
                        [filter.name]: data
                    }));
                } finally {
                    setLoadingMap(prev => ({ ...prev, [filter.name]: false }));
                }
            }
        });
    }, [filters]);

    // Hàm render input dựa trên type
    const renderInput = (f: any) => {
        switch (f.type) {
            case 'input':
                return (
                    <Input
                        key={f.name}
                        style={{ width: f.width }}
                        value={values[f.name]}
                        onChange={e => onChange((v) => ({ ...v, [f.name]: e.target.value }))}
                        placeholder={f.placeholder} 
                    />
                );

            case 'select':
                return (
                    <Select
                        key={f.name}
                        loading={loadingMap[f.name]}
                        style={{ width: f.width }}
                        value={values[f.name]}
                        options={f.options ?? optionsMap[f.name]}
                        placeholder={f.placeholder}
                        allowClear // Nên có allowClear cho select filter
                        onChange={e => onChange((p) => ({ ...p, [f.name]: e }))} 
                    />
                );

            case 'rangeDate':
                return (
                    <RangePicker
                        key={f.name}
                        style={{ width: f.width }}
                        value={
                            values[f.name] && values[f.name].length === 2
                                ? [dayjs(values[f.name][0]), dayjs(values[f.name][1])]
                                : null
                        }
                        onChange={(_, dateStrings) => {
                            onChange((prev) => ({ 
                                ...prev, 
                                [f.name]: dateStrings[0] ? dateStrings : undefined 
                            }));
                        }}
                        placeholder={Array.isArray(f.placeholder) ? f.placeholder : [f.placeholder, f.placeholder]}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Space wrap>
                {filters.map((f) => renderInput(f))}
            </Space>

            {extra && <div>{extra}</div>}
        </div>
    );
};