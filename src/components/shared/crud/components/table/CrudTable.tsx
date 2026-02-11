import { Table, Tree, type TableProps } from "antd";
import type { CrudTableConfig } from "../../type"; // Giả sử type có thêm RowSelectionConfig

// Thêm type cho rowSelection (tùy chỉnh từ AntD)
interface RowSelectionConfig<T> {
  type?: 'checkbox' | 'radio'; // Default 'checkbox' cho multi
  selectedRowKeys: React.Key[]; // From parent state
  onChange: (selectedRowKeys: React.Key[], selectedRows: T[]) => void; // Callback
  getCheckboxProps?: (record: T) => { disabled: boolean }; // Optional disable row
}

export const CrudTable = <T extends object> ({
  viewMode,
  data,
  loading,
  tableConfig,
  treeConfig,
  rowSelectionConfig, // Thêm prop optional cho select
}: CrudTableConfig<T> & { rowSelectionConfig?: RowSelectionConfig<T> }) => { // Extend type

  const tableProps: TableProps<T> = {
    columns: tableConfig?.columns,
    dataSource: data,
    loading: loading,
    rowKey: tableConfig?.rowKey || 'id',
    onChange: tableConfig?.onChange,
    pagination: tableConfig?.pagination || {
      pageSize: 10,
      showTotal: (t: number) => `Tổng ${t} items`,
    },
    scroll: tableConfig?.scroll || { x: 1000 },
  };

  // Thêm rowSelection nếu prop provided
  if (rowSelectionConfig) {
    tableProps.rowSelection = {
      type: rowSelectionConfig.type || 'checkbox', // Default multi
      selectedRowKeys: rowSelectionConfig.selectedRowKeys,
      onChange: rowSelectionConfig.onChange,
      getCheckboxProps: rowSelectionConfig.getCheckboxProps,
    };
  }

  return (
    <div style={{ padding: viewMode === 'table' ? 0 : 24 }}>
      {viewMode === "table" ? (
        <Table<T> {...tableProps} />
      ) : (
        <Tree
          showIcon
          showLine={{ showLeafIcon: false }}
          defaultExpandAll
          treeData={treeConfig?.buildTreeData(data) || []}
        />
      )}
    </div>
  );
};