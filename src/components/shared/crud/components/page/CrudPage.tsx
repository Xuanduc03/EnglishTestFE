import { useEffect, useMemo, useState } from "react";
import type { CrudConfig } from "../../type";
import { useCrud } from "../../hook/useCrud";
import { Button, Popconfirm, Space } from "antd";
import { AppstoreOutlined, DeleteOutlined, EditOutlined, EyeOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { CrudModal } from "../modal/CrudModal";
import { StatCards } from "../StatCard/StatCards";
import { CrudFilter } from "../filter/CrudFilter";
import { CrudTable } from "../table/CrudTable";
import { CrudHeader } from "../header/CrudHeader";
import './CrudPage.scss'
import { CrudDetail } from "../detail/CrudDetail";
import { toast } from "react-toastify";

export const CrudPage = <T extends { id?: string | number }>
  ({ config, ...props }: { config: CrudConfig<T> }) => {
  const crud = useCrud(config.service);
  const [currentViewMode, setCurrentViewMode] = useState(config.viewMode || 'table');
  const [draftFilters, setDraftFilters] = useState(crud.filters);


  useEffect(() => {
    crud.fetchData();
  }, [
    JSON.stringify(crud.filters),
    crud.pagination.current,
    crud.pagination.pageSize
  ]);

  const tableColumnsWithActions = useMemo(() => {
    if (config.viewMode === 'tree' || !config.tableConfig?.columns) return [];

    // Nếu config đã có cột action/actions custom thì KHÔNG thêm cột mặc định
    const hasCustomActions = config.tableConfig.columns.some(
      (col: any) => col.key === 'actions' || col.key === 'action'
    );

    if (hasCustomActions) {
      return config.tableConfig.columns;
    }

    const actionColumn = {
      title: "Hành động",
      key: "action",
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: T) => (
        <Space className="action-buttons">
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "green" }} />}
            onClick={() => record.id && crud.handleGetDetail(record.id)}
          />
          {/* Nút cập nhật */}
          <Button
            className="action-btn edit-btn"
            type="text"
            icon={<EditOutlined />}
            onClick={() => crud.setModal({ open: true, record })}
          />

          {/* Nút xóa */}
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            description="Hành động này không thể hoàn tác"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={async () => {
              if (record.id) {
                await crud.handleDelete(record?.id);
              }
            }}
          >
            <Button
              className="action-btn delete-btn"
              type="text"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }

    return [...config.tableConfig.columns, actionColumn];
  }, [config.tableConfig?.columns, config.viewMode, crud]);

  const viewModeSwitcher = useMemo(() => {
    // Chỉ hiện nếu config có cả tableConfig và treeConfig
    if (config.tableConfig && config.treeConfig) {
      return (
        <div className="view-mode-switcher">
          <button
            className={`view-mode-btn ${currentViewMode === 'table' ? 'active' : ''}`}
            onClick={() => setCurrentViewMode('table')}
            title="Chế độ bảng"
          >
            <UnorderedListOutlined className="view-icon" />
          </button>
          <button
            className={`view-mode-btn ${currentViewMode === 'tree' ? 'active' : ''}`}
            onClick={() => setCurrentViewMode('tree')}
            title="Chế độ cây"
          >
            <AppstoreOutlined className="view-icon" />
          </button>
        </div>
      );
    }
    return null;
  }, [config.tableConfig, config.treeConfig, currentViewMode]);

  return (
    <div className="crud-page">
      {/* Header */}
      <div className="crud-header-section">
        <CrudHeader
          title={config.title}
          subtitle={config.subtitle}
          onRefresh={crud.fetchData}
          createButtonText={config.createButtonText}
          onCreate={() => crud.setModal({ open: true, record: null })}
        />
      </div>

      {/* Stats */}
      {config.stats && (
        <div className="stats-section">
          <StatCards stats={config.stats(crud.data, crud.meta)} />
        </div>
      )}

      {/* Filter */}
      {config.filters && (
        <div className="filter-section">
          <p>Tìm kiếm thông tin</p>
          <CrudFilter
            filters={config.filters}
            values={draftFilters}
            onChange={setDraftFilters}
            extra={
              <Space>
                {viewModeSwitcher}

                <Button
                  type="primary"
                  onClick={() => {
                    crud.setFilters(draftFilters);
                    crud.setPagination(p => ({ ...p, current: 1 }));
                  }}
                >
                  Tìm kiếm
                </Button>

                <Button
                  onClick={() => {
                    setDraftFilters({});
                    crud.setFilters({});
                    crud.setPagination(p => ({ ...p, current: 1 }));
                  }}
                >
                  Reset
                </Button>
              </Space>
            }
          />

        </div>
      )}

      {/* Content - Table/Tree */}
      <div className="content-section">
        {crud.loading && crud.data.length === 0 ? (
          <div className="loading-overlay">
            <div className="loading-spinner">
              {/* Có thể thêm spinner component ở đây */}
            </div>
          </div>
        ) : crud.data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3 className="empty-title">Không có dữ liệu</h3>
            <p className="empty-description">
              {config.title ? `Chưa có ${config.title.toLowerCase()} nào` : "Không tìm thấy dữ liệu phù hợp"}
            </p>
            <Button
              type="primary"
              onClick={() => crud.setModal({ open: true, record: null })}
              style={{ marginTop: 16 }}
            >
              Tạo mới
            </Button>
          </div>
        ) : (
          <CrudTable<T>
            viewMode={currentViewMode}
            data={crud.data}
            loading={crud.loading}
            tableConfig={{
              ...config.tableConfig!,
              columns: tableColumnsWithActions,
              onChange: crud.handleTableChange,
              pagination: {
                current: crud.pagination.current,
                pageSize: crud.pagination.pageSize,
                total: crud.pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,

              }
            }}
            treeConfig={config.treeConfig}
          />
        )}
      </div>

      {/* Modal */}
      <CrudModal<T>
        open={crud.modal.open}
        record={crud.modal.record}
        fields={config.formFields}
        service={config.service}
        onClose={() => crud.setModal({ open: false, record: null })}
        onSuccess={() => {
          crud.fetchData();
          crud.setModal({ open: false, record: null });
        }}
      />


      <CrudDetail<T>
        open={crud.detail.open}
        record={crud.detail.record}
        fields={config.formFields}
        auditFields={config.auditFields}
        onClose={() => crud.setDetail({ open: false, record: null })}
        loading={crud.detailLoading}
      />
    </div>
  );
};