import type { IRoute } from "./Route";
import Login from "../components/Auth/Login/Login";
import Register from "../components/Auth/Register/Register";
import StudentHome from "../pages/Student/Home/HomePage";
import VocabularyPage from "../pages/Student/Vocabulary";
import Quiz from "../components/Vocabulary/Quiz";
import Stat from "../components/Vocabulary/Stats";
import SuggestSection from "../components/Vocabulary/Suggestion";
import PracticeSection from "../components/Vocabulary/Practice";
import ListTestFull from "../components/Test/ListTestFull";
import FullTestPage from "../pages/Student/FullTest/FullTestPage";
import ProfilePage from "../pages/Student/Profile/Index";
import FlashCards from "../components/Vocabulary/FlashCard";
import LearningPathPage from "../pages/Student/LearningPath";
import ForgotPasswordPage from "../components/Auth/ForgotPasswordPage";
import LearningAnalysis from "../pages/Student/LearningAnalysis";
import GrammarPage from "../components/Practice/Grammar";
import QuestionCard from "../components/Practice/TOEIC/Part1/QuestionCard";
import PracticeList from "../components/PracticeList";
import SkillTabsWithParts from "../components/PracticeList/SkillPracticePage";
import PracticeSession from "../components/Practice/PracticeSession";
import PracticeResult from "../components/Practice/PracticeResult";
const PublicRoute: IRoute[] = [

    // student routes
    { path: "/home", component: StudentHome },

    // profile
    { path: "/my-learning", component: LearningAnalysis },
    { path: "/profile", component: ProfilePage },

    // practice
    { path: "/practice/toeic/listening/part1", component: QuestionCard, layout: null },

    // 1. Practice Home (Danh sách kỹ năng/phần thi)
    { path: "/practice/list", component: SkillTabsWithParts },

    // 2. Practice Session (Màn hình làm bài - Ẩn layout header/footer)
    { path: "/practice/session/:sessionId", component: PracticeSession, layout: null },

    // 3. Practice Result (Màn hình kết quả sau khi nộp bài)
    { path: "/practice/result/:sessionId", component: PracticeResult },

    // 4. Practice History (Lịch sử làm bài)
    { path: "/practice/history", component: PracticeList },


    { path: "/full-test", component: ListTestFull },
    { path: "/test", component: FullTestPage, layout: null },

    { path: "/practice/grammar", component: GrammarPage },
    { path: "/learning-path", component: LearningPathPage },
    {
        path: "/vocabulary", component: VocabularyPage,
        children: [
            { path: "flash-card", component: FlashCards },
            { path: "quiz", component: Quiz },
            { path: "practice", component: PracticeSection },
            { path: "suggestion", component: SuggestSection },
            { path: "stats", component: Stat },
        ]
    },

    // auth routes  
    { path: "/login", component: Login, layout: null },
    { path: "/register", component: Register, layout: null },
    { path: "/forgot", component: ForgotPasswordPage, layout: null }
];

export { PublicRoute };