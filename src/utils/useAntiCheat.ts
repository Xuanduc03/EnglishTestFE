import { useEffect, useState } from 'react';
import { message, Modal } from 'antd';

interface UseAntiCheatProps {
  maxWarnings?: number;
  onForceSubmit: () => void;
  isTestCompleted: boolean;
}

export const useAntiCheat = ({
  maxWarnings = 3,
  onForceSubmit,
  isTestCompleted,
}: UseAntiCheatProps) => {
  const [warningCount, setWarnings] = useState(0);

  useEffect(() => {
    if (isTestCompleted) return;

    // ---------------------------------------------------------
    // 1. THEO DÕI CHUYỂN TAB / RỜI KHỎI TRÌNH DUYỆT
    // ---------------------------------------------------------
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings((prev) => {
          const newCount = prev + 1;
          if (newCount >= maxWarnings) {
            Modal.error({
              title: 'VI PHẠM QUY CHẾ THI',
              content: `Bạn đã rời khỏi màn hình bài thi quá ${maxWarnings} lần. Hệ thống tự động nộp bài!`,
              okText: 'Đóng',
              onOk: () => onForceSubmit(),
            });
          } else {
            Modal.warning({
              title: 'CẢNH BÁO GIAN LẬN',
              content: `Bạn vừa chuyển tab hoặc rời khỏi màn hình bài thi. Lần vi phạm: ${newCount}/${maxWarnings}. Quá số lần sẽ tự động nộp bài!`,
              okText: 'Tôi đã hiểu',
            });
          }
          return newCount;
        });
      }
    };

    // ---------------------------------------------------------
    // 2. KHÓA BÀN PHÍM (F12, Ctrl+C, Ctrl+V, PrintScreen...)
    // ---------------------------------------------------------
    const handleKeyDown = (e: KeyboardEvent) => {
      // Danh sách các phím bị cấm
      const forbiddenKeys = [ 'PrintScreen'];
      
      // Cấm Ctrl + C, Ctrl + V, Ctrl + U (Xem source), Ctrl + P (In), Ctrl + S (Lưu trang)
      const isForbiddenShortcut =
        e.ctrlKey && ['c', 'v', 'u', 'p', 's'].includes(e.key.toLowerCase());
        
      // Cấm Ctrl + Shift + I (Mở DevTools)
      const isDevTools = e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i';

      if (forbiddenKeys.includes(e.key) || isForbiddenShortcut || isDevTools) {
        e.preventDefault();
        message.error('Hành động này bị cấm trong phòng thi!', 2);
      }
    };

    // ---------------------------------------------------------
    // 3. KHÓA CHUỘT (Chuột phải, Kéo thả text)
    // ---------------------------------------------------------
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Gắn Event Listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    // Cleanup khi hoàn thành bài thi hoặc unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [isTestCompleted, maxWarnings, onForceSubmit]);

  return { warningCount };
};