import React, { useEffect, useState } from 'react';
import { Card, Tree, Input, Spin, Empty } from 'antd';
import {
  SearchOutlined,
  DownOutlined,
  ReadOutlined,
  CustomerServiceOutlined,
  EditOutlined,
  AudioOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { categorieservice } from '../../../../pages/Admin/Categories/category.service';
import { toast } from 'react-toastify';

import './CategorySidebar.scss';

const { DirectoryTree } = Tree;

interface Props {
  onSelect: (keys: any, info: any) => void;
}

export const CategorySidebar: React.FC<Props> = ({ onSelect }) => {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getIcon = (code: string) => {
    const c = code?.toUpperCase();
    if (c === 'LISTENING') return <CustomerServiceOutlined />;
    if (c === 'READING') return <ReadOutlined />;
    if (c === 'WRITING') return <EditOutlined />;
    if (c === 'SPEAKING') return <AudioOutlined />;
    return <FileTextOutlined />;
  };

  const transformToTreeData = (items: any[]): any[] =>
    items.map(item => ({
      title: item.name,
      key: item.id,
      icon: getIcon(item.code),
      children: item.children?.length
        ? transformToTreeData(item.children)
        : [],
      isLeaf: (!item.children || item.children.length === 0) && item.childrenCount === 0,
      dataRef: item,
    }));

  const fetchData = async () => {
    setLoading(true);
    try {
      const rootSkillId = '9bcaa771-ca9e-45dd-9405-910e6a068631';
      const res = await categorieservice.getByCodeType('SKILL', rootSkillId);
      setTreeData(res?.length ? transformToTreeData(res) : []);
    } catch (error) {
      toast.error('Không tải được cấu trúc đề thi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card
      title="Cấu trúc đề thi"
      size="small"
      className="category-sidebar"
      styles={{ body : { padding: 0} }}
    >
      <div className="category-sidebar__search">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm Part/Skill..."
          allowClear
        />
      </div>

      <div className="category-sidebar__content">
        {loading ? (
          <div className="category-sidebar__loading">
            <Spin tip="Đang tải..." />
          </div>
        ) : treeData.length > 0 ? (
          <DirectoryTree
            defaultExpandAll
            multiple={false}
            showIcon
            treeData={treeData}
            onSelect={onSelect}
            switcherIcon={<DownOutlined />}
          />
        ) : (
          <Empty
            description="Chưa có dữ liệu"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    </Card>
  );
};
