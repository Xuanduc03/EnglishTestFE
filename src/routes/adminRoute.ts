import type { IRoute } from "./Route";
import AdminLayout from "../layouts/Admin/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard/Dashboard";
import Users from "../pages/Admin/Users";
import CategoryManager from "../pages/Admin/Categories";
import RolePermissionMananger from "../pages/Admin/RolePermission";
import { ExamTypeManager, LevelManager, QuestionTypeManager, SkillManager, TopicManager } from "../pages/Admin/Categories/CategoryPages";
import QuestionManager from "../pages/Admin/Questions/QuestionManager";
import ExamPage from "../pages/Admin/Exams/ExamManagerPage";
import ExamStructurePage from "../pages/Admin/Exams/ExamStructure";
import ScoreTablesPage from "../pages/Admin/ScoreTables";

const AdminRoute: IRoute[] = [
  { path: "/admin", component: Dashboard, layout: AdminLayout },
  { path: "/admin/dashboard", component: Dashboard, layout: AdminLayout },

  //  // Exams
  { path: '/admin/exams', component: ExamPage, layout: AdminLayout },
  { path: '/admin/exams/:id/structure', component: ExamStructurePage, layout: AdminLayout },
  { path: '/admin/exams/score', component: ScoreTablesPage, layout: AdminLayout },
  // { path: '/admin/exams/ielts', component: IELTSExams },

  // // Questions
  { path: '/admin/questions', component: QuestionManager, layout: AdminLayout },
  // { path: '/admin/questions/toeic/part1', component: TOEICPart1 },
  // { path: '/admin/questions/toeic/part2', component: TOEICPart2 },
  // // ... part 3-7
  // { path: '/admin/questions/ielts/listening', component: IELTSListening },
  // { path: '/admin/questions/ielts/reading', component: IELTSReading },
  // { path: '/admin/questions/ielts/writing', component: IELTSWriting },
  // { path: '/admin/questions/ielts/speaking', component: IELTSSpeaking },
  // { path: '/admin/question-groups', component: QuestionGroups },

  // // Students
  // { path: '/admin/students', component: StudentList },
  // { path: '/admin/classes', component: ClassList },
  // { path: '/admin/results', component: Results },
  // { path: '/admin/progress', component: Progress },

  // // Resources
  // { path: '/admin/media/audio', component: AudioManager },
  // { path: '/admin/media/images', component: ImageManager },
  // { path: '/admin/media/videos', component: VideoManager },
  // { path: '/admin/vocabulary', component: Vocabulary },

  // Categories
  { path: '/admin/categories', component: CategoryManager, layout: AdminLayout },

  // 2. Các màn con (Dùng component đã import)
  { path: '/admin/categories/exam-types', component: ExamTypeManager, layout: AdminLayout },
  { path: '/admin/categories/skills', component: SkillManager, layout: AdminLayout },
  { path: '/admin/categories/topics', component: TopicManager, layout: AdminLayout },
  { path: '/admin/categories/question-types', component: QuestionTypeManager, layout: AdminLayout },
  { path: '/admin/categories/levels', component: LevelManager, layout: AdminLayout },

  // // Reports
  // { path: '/admin/reports/overview', component: ReportOverview },
  // { path: '/admin/reports/exam-results', component: ExamResults },
  // { path: '/admin/reports/question-analytics', component: QuestionAnalytics },
  // { path: '/admin/reports/student-progress', component: StudentProgress },

  // // System
  { path: "/admin/system/users", component: Users, layout: AdminLayout },
  { path: '/admin/system/roles', component: RolePermissionMananger, layout: AdminLayout },
  // { path: '/admin/system/teachers', component: TeacherManagement },
  // { path: '/admin/system/settings', component: Settings },
];

export { AdminRoute };


