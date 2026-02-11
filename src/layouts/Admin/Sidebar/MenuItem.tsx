import React from 'react';

import {
  HomeOutlined,
  FileTextOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  FolderOpenOutlined,
  BookOutlined,
  DatabaseOutlined,
  QuestionCircleOutlined,
  SoundOutlined,
  ReadOutlined,
  EditOutlined,
  AudioOutlined,
  BarChartOutlined,
  TagsOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import type { MenuItem } from '../../../types/sidebar';



// Helper function to create menu items
function getItem(
  label: string,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[],
  permission?: string[]
): MenuItem {
  return {
    key,
    label,
    icon,
    children,
  };
}

// Menu items cho IELTS/TOEIC Admin
export const menuItems: MenuItem[] = [
  // Dashboard
  getItem(
    'Dashboard',
    '/admin/dashboard',
    <HomeOutlined />,
    undefined,
    ['view_dashboard']
  ),

  // ========== QUẢN LÝ ĐỀ THI ==========
  getItem('Quản lý đề thi', 'exam-management', <FileTextOutlined />, [
    getItem(
      'Danh sách đề thi',
      '/admin/exams',
      <FileTextOutlined />,
      undefined,
      ['view_exams']
    ),
    getItem(
      'Cấu trúc đề thi',
      '/admin/exams/section',
      <EditOutlined />,
      undefined,
      ['manage_exams']
    ),
    getItem(
      'Đề thi theo kỳ',
      '/admin/exams/type',
      <GlobalOutlined />,
      [
        getItem('TOEIC Tests', '/admin/exams/type/toeic', <SoundOutlined />),
        getItem('IELTS Tests', '/admin/exams/type/ielts', <ReadOutlined />),
      ],
      ['view_exams']
    ),
  ]),

  // ========== NGÂN HÀNG CÂU HỎI ==========
  getItem('Ngân hàng câu hỏi', 'question-bank', <QuestionCircleOutlined />, [
    getItem(
      'Tất cả câu hỏi',
      '/admin/questions',
      <BookOutlined />,
      undefined,
      ['view_questions']
    ),
    // getItem(
    //   'TOEIC Questions',
    //   'toeic-questions',
    //   <SoundOutlined />,
    //   [
    //     getItem('Part 1: Photographs', '/admin/questions/toeic/part1', <SoundOutlined />),
    //     getItem('Part 2: Q&A', '/admin/questions/toeic/part2', <SoundOutlined />),
    //     getItem('Part 3: Conversations', '/admin/questions/toeic/part3', <SoundOutlined />),
    //     getItem('Part 4: Talks', '/admin/questions/toeic/part4', <SoundOutlined />),
    //     getItem('Part 5: Grammar', '/admin/questions/toeic/part5', <SoundOutlined />),
    //     getItem('Part 6: Text Completion', '/admin/questions/toeic/part6', <SoundOutlined />),
    //     getItem('Part 7: Reading', '/admin/questions/toeic/part7', <SoundOutlined />),
    //   ],
    //   ['view_questions']
    // ),
    // getItem(
    //   'IELTS Questions',
    //   'ielts-questions',
    //   <ReadOutlined />,
    //   [
    //     getItem('Listening', '/admin/questions/ielts/listening', <SoundOutlined />),
    //     getItem('Reading', '/admin/questions/ielts/reading', <ReadOutlined />),
    //     getItem('Writing', '/admin/questions/ielts/writing', <EditOutlined />),
    //     getItem('Speaking', '/admin/questions/ielts/speaking', <AudioOutlined />),
    //   ],
    //   ['view_questions']
    // ),
    // getItem(
    //   'Question Groups',
    //   '/admin/question-groups',
    //   <FolderOpenOutlined />,
    //   undefined,
    //   ['view_questions']
    // ),
  ]),

  // ========== QUẢN LÝ HỌC VIÊN ==========
  // getItem('Quản lý học viên', 'student-management', <TeamOutlined />, [
  //   getItem(
  //     'Danh sách học viên',
  //     '/admin/students',
  //     <UserOutlined />,
  //     undefined,
  //     ['view_students']
  //   ),
  //   getItem(
  //     'Lớp học',
  //     '/admin/classes',
  //     <TeamOutlined />,
  //     undefined,
  //     ['view_classes']
  //   ),
  //   getItem(
  //     'Kết quả thi',
  //     '/admin/results',
  //     <TrophyOutlined />,
  //     undefined,
  //     ['view_results']
  //   ),
  //   getItem(
  //     'Tiến độ học tập',
  //     '/admin/progress',
  //     <FundOutlined />,
  //     undefined,
  //     ['view_progress']
  //   ),
  // ]),

  // ========== MEDIA & TÀI NGUYÊN ==========
  // getItem('Tài nguyên học liệu', 'resources', <FolderOpenOutlined />, [
  //   getItem(
  //     'Audio Files',
  //     '/admin/media/audio',
  //     <SoundOutlined />,
  //     undefined,
  //     ['manage_media']
  //   ),
  //   getItem(
  //     'Images',
  //     '/admin/media/images',
  //     <FileTextOutlined />,
  //     undefined,
  //     ['manage_media']
  //   ),
  //   getItem(
  //     'Video Guides',
  //     '/admin/media/videos',
  //     <VideoCameraOutlined />,
  //     undefined,
  //     ['manage_media']
  //   ),
  //   getItem(
  //     'Từ vựng',
  //     '/admin/vocabulary',
  //     <BookOutlined />,
  //     undefined,
  //     ['manage_vocabulary']
  //   ),
  // ]),

  // ========== DANH MỤC HỆ THỐNG ==========
  getItem('Danh mục', 'categories', <DatabaseOutlined />, [
    getItem(
      'Quản lý Categories',
      '/admin/categories',
      <TagsOutlined />,
      undefined,
      ['manage_categories']
    ),
    getItem(
      'Chứng chỉ',
      '/admin/categories/exam-types',
      <GlobalOutlined />,
      undefined,
      ['view_categories']
    ),
    getItem(
      'Kỹ năng',
      '/admin/categories/skills',
      <SoundOutlined />,
      undefined,
      ['view_categories']
    ),
    getItem(
      'Chủ đề',
      '/admin/categories/topics',
      <BookOutlined />,
      undefined,
      ['view_categories']
    ),
    getItem(
      'Mức độ học tập',
      '/admin/categories/levels',
      <BarChartOutlined />,
      undefined,
      ['view_categories']
    ),
    getItem(
      'Loại câu hỏi',
      '/admin/categories/question-types',
      <QuestionCircleOutlined />,
      undefined,
      ['view_categories']
    ),
  ]),

  // ========== BÁO CÁO & THỐNG KÊ ==========
  // getItem('Báo cáo & Thống kê', 'reports', <BarChartOutlined />, [
  //   getItem(
  //     'Thống kê tổng quan',
  //     '/admin/reports/overview',
  //     <FundOutlined />,
  //     undefined,
  //     ['view_reports']
  //   ),
  //   getItem(
  //     'Kết quả theo đề',
  //     '/admin/reports/exam-results',
  //     <TrophyOutlined />,
  //     undefined,
  //     ['view_reports']
  //   ),
  //   getItem(
  //     'Phân tích câu hỏi',
  //     '/admin/reports/question-analytics',
  //     <BarChartOutlined />,
  //     undefined,
  //     ['view_reports']
  //   ),
  //   getItem(
  //     'Tiến độ học viên',
  //     '/admin/reports/student-progress',
  //     <UserOutlined />,
  //     undefined,
  //     ['view_reports']
  //   ),
  // ]),

  // ========== QUẢN TRỊ HỆ THỐNG ==========
  getItem('Quản trị hệ thống', 'system', <SettingOutlined />, [
    getItem(
      'Người dùng',
      '/admin/system/users',
      <UserOutlined />,
      undefined,
      ['manage_users']
    ),
    getItem(
      'Vai trò & Quyền',
      '/admin/system/roles',
      <TeamOutlined />,
      undefined,
      ['manage_roles']
    ),
    getItem(
      'Giáo viên',
      '/admin/system/teachers',
      <UserOutlined />,
      undefined,
      ['manage_teachers']
    ),
    getItem(
      'Cấu hình',
      '/admin/system/settings',
      <SettingOutlined />,
      undefined,
      ['manage_settings']
    ),
  ]),
];