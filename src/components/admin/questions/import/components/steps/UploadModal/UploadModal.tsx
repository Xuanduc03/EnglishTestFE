import React, { useState } from 'react';
import { Upload, Button, Card, Divider, Alert, Typography, Modal } from 'antd';
import {
  InboxOutlined,
  FileZipOutlined,
  FileExcelOutlined,
  AudioOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { ImportQuestionService } from '../../../services/ImportQuestion.service';
import type { PreviewZipResponse } from '../../../types/PreviewData.type';
import './UploadModal.scss';

const { Dragger } = Upload;
const { Title, Paragraph } = Typography;

interface UploadStepProps {
  open: boolean;                          // 👈 thêm
  onClose: () => void;                    // 👈 thêm
  onNext: (file: File, previewData: PreviewZipResponse) => void;
  onLoading?: (loading: boolean) => void;
}

/**
 *  Upload Step Component step 1 : người dùng upload file zip
 * @param OnNext -> chạy bước tiếp previe với data trả về
 * @param onLoading -> đồng bộ trạng thái loading với main nếu cần
 * @returns Json của be truyền sang step preview
 */

const UploadQuestionModal: React.FC<UploadStepProps> = ({ open, onClose, onNext, onLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (info: any) => {
    const selectedFile = info.file.originFileObj || info.file;

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate format
    if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
      Modal.error({
        title: 'Định dạng file không hợp lệ',
        content: 'Vui lòng chọn file có đuôi .zip',
      });
      setFile(null);
      return;
    }

    // Validate size (200MB)
    const maxSize = 200 * 1024 * 1024; // 200MB in bytes
    if (selectedFile.size > maxSize) {
      Modal.error({
        title: 'File quá lớn',
        content: 'Kích thước file không được vượt quá 200MB',
      });
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handlePreview = async () => {
    if (!file) return;

    setLoading(true);
    onLoading?.(true); // Sync main nếu cần

    const formData = new FormData();
    formData.append('zipFile', file);

    try {
      const previewData = await ImportQuestionService.uploadFileQuestion(file);
      onNext(file! ,previewData);
    } catch (error: any) {
      Modal.error({
        title: 'Lỗi kiểm tra dữ liệu',
        content: error.message || 'Không thể preview file ZIP',
      });
    } finally {
      setLoading(false);
      onLoading?.(false);
    }
  };

  const handleClose = () => {
    if (loading) return;        // tránh đóng khi đang upload
    setFile(null);              // reset state
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={900}
      destroyOnClose
      title="Import câu hỏi từ ZIP"
      className="upload-question-modal"
    >
      <div className="upload-question-modal__content">
        <Card className="upload-question-modal__card">
          <div className="upload-question-modal__header">
            <FileZipOutlined className="upload-question-modal__header-icon" />
            <Title level={3} className="upload-question-modal__header-title">
              Upload ZIP Questions
              <Paragraph type="secondary">
                Chọn file ZIP chứa file Excel và các file media (audio, image)
              </Paragraph>
            </Title>

          </div>

          <Dragger
            name="zipFile"
            multiple={false}
            accept=".zip"
            beforeUpload={() => false}
            onChange={handleFileChange}
            fileList={
              file ? [{ uid: '-1', name: file.name, status: 'done' }] : []
            }
            className="upload-question-modal__dragger"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click hoặc kéo file ZIP vào đây
            </p>
            <p className="ant-upload-hint">
              Hỗ trợ file ZIP chứa Excel + Media. Tối đa 200MB
            </p>
          </Dragger>

          <Divider />

          <Alert
            className="upload-question-modal__alert"
            message="Cấu trúc file ZIP"
            description={
              <div className="upload-question-modal__zip-structure">
                <Paragraph>
                  <strong>Bắt buộc:</strong>
                  <ul>
                    <li><FileExcelOutlined /> data.xlsx - File Excel chứa câu hỏi</li>
                    <li><AudioOutlined /> audio/ - Folder chứa file âm thanh</li>
                    <li><FileImageOutlined /> images/ - Folder chứa hình ảnh</li>
                  </ul>
                </Paragraph>
                <Paragraph type="secondary">
                  Tên file media trong Excel phải khớp với tên file trong ZIP
                </Paragraph>
              </div>
            }
            type="info"
            showIcon
          />

          <div className="upload-question-modal__action">
            <Button
              type="primary"
              size="large"
              disabled={!file}
              loading={loading}
              onClick={handlePreview}
              icon={<CheckCircleOutlined />}
            >
              Kiểm tra dữ liệu
            </Button>
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default UploadQuestionModal;