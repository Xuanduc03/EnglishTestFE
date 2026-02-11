import React, { useState } from "react";
import { SIDEBAR_CONFIG } from "./sidebar.config";
import "./QuestionSidebar.scss";
import type { EditorKey, SidebarItem } from "../QuestionEditor/editor.type";

interface Props {
  onSelectEditor: (editorKey: EditorKey, type: "single" | "group") => void;
  activeEditorKey?: EditorKey;
  disabled?: boolean;
}

export const DynamicSidebar: React.FC<Props> = ({
  onSelectEditor,
  activeEditorKey,
  disabled = false
}) => {
  if (disabled) return null;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(["toeic", "toeic-listening"])
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderItem = (
    item: SidebarItem,
    level: number = 0
  ): React.ReactNode => {
    const hasChildren = !!item.children?.length;
    const isExpanded = expandedIds.has(item.id);
    const isLeaf = !!item.editorKey;
    const isActive = isLeaf && item.editorKey === activeEditorKey;

    const handleClick = () => {
      if (disabled) return;

      if (hasChildren) {
        toggleExpand(item.id);
        return;
      }

      if (item.editorKey && item.type) {
        onSelectEditor(item.editorKey, item.type);
      }
    };

    return (
      <div key={item.id} className="sidebar-item-wrapper">
        <div
          className={`sidebar-item level-${level} 
            ${isActive ? "active" : ""} 
            ${hasChildren ? "has-children" : ""}
            ${disabled ? "disabled" : ""}
          `}
          onClick={handleClick}
          style={{
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <div className="item-left">
            {hasChildren && (
              <i
                className={`fa-solid fa-chevron-${isExpanded ? "down" : "right"
                  } expand-icon`}
              />
            )}

            {item.icon && (
              <i
                className={item.icon}
                style={{ marginLeft: hasChildren ? 0 : 16 }}
              />
            )}

            <span className="item-label">{item.label}</span>
          </div>

          {isLeaf && (
            <span className="item-type-badge">
              {item.type === "group" ? "Nhóm" : "Đơn"}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="sidebar-children">
            {item.children!.map((child) =>
              renderItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="dynamic-sidebar">
      <div className="sidebar-header">
        <i className="fa-solid fa-layer-group" />
        <span>Loại câu hỏi</span>
      </div>

      <div className="sidebar-content">
        {SIDEBAR_CONFIG.map((item) => renderItem(item))}
      </div>
    </aside>
  );
};
