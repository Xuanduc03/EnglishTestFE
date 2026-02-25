import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, InputNumber, Switch, message } from 'antd';
import type { CategoryDto } from '../../../pages/Admin/Categories/category.config';
import './SkillList.scss';
import { PracticeService } from '../../Practice/Services/practice.service';
import type { CreatePracticeRequest } from '../../Practice/Types/practice.type';
import PracticeList from '..';

export const SKILL_PARENT_ID = '9bcaa771-ca9e-45dd-9405-910e6a068631';

interface PracticeItem {
    id: string | number;
    title: string;
    subtitle?: string;
    correctRate?: number;
    questionCount: number;
    participants: number;
    isFree?: boolean;
    hasExplanation?: boolean;
    status?: 'not-started' | 'in-progress' | 'completed';
    difficulty?: 'easy' | 'medium' | 'hard';
    timeEstimate?: string;
    partId?: string;
}

export default function SkillTabsWithParts() {
    const navigate = useNavigate();
    const [skills, setSkills] = useState<CategoryDto[]>([]);
    const [activeSkill, setActiveSkill] = useState<CategoryDto | null>(null);
    const [activePart, setActivePart] = useState<CategoryDto | null>(null);
    const [loading, setLoading] = useState(false);

    // Practice config modal
    const [configModalVisible, setConfigModalVisible] = useState(false);
    const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
    const [practiceConfig, setPracticeConfig] = useState({
        questionsPerPart: 10,
        isTimed: false,
        timeLimitMinutes: 15
    });

    /** Load skill tree */
    useEffect(() => {
        const loadSkills = async () => {
            try {
                setLoading(true);

                const skills = await PracticeService.getByCodeType(
                    "SKILL",
                    SKILL_PARENT_ID
                );

                setSkills(skills);
                setActiveSkill(skills[0] ?? null);

            } catch (err) {
                console.error(err);
                message.error("Không thể tải danh sách kỹ năng");
            } finally {
                setLoading(false);
            }
        };

        loadSkills();
    }, []);

    // Generate practice items from parts
    const generatePracticeItemsFromParts = (): PracticeItem[] => {
        if (!activeSkill || !activeSkill.children || activeSkill.children.length === 0) {
            return [];
        }

        return activeSkill.children.map(part => {
            // Map part number from name (e.g., "Part 1" -> 1)
            const partNumber = parseInt(part.name.replace(/\D/g, '')) || 0;

            // Estimate questions based on TOEIC standard
            const questionEstimates: Record<number, number> = {
                1: 6,    // Part 1: 6 questions
                2: 25,   // Part 2: 25 questions
                3: 39,   // Part 3: 39 questions (13 conversations × 3)
                4: 30,   // Part 4: 30 questions (10 talks × 3)
                5: 30,   // Part 5: 30 questions
                6: 16,   // Part 6: 16 questions (4 passages × 4)
                7: 54    // Part 7: 54 questions
            };

            const estimatedQuestions = questionEstimates[partNumber] || 0;
            const participants = 100 + partNumber * 50; // Mock data

            // Time estimate based on part
            const timeEstimates: Record<number, string> = {
                1: '3 phút',
                2: '12 phút',
                3: '20 phút',
                4: '15 phút',
                5: '15 phút',
                6: '16 phút',
                7: '40 phút'
            };

            return {
                id: part.id,
                title: part.name,
                subtitle: `${activeSkill.name} • ${part.code}`,
                correctRate: 0,
                questionCount: estimatedQuestions,
                participants: participants,
                isFree: true,
                hasExplanation: true,
                status: 'not-started' as const,
                difficulty: 'medium' as const,
                timeEstimate: timeEstimates[partNumber],
                partId: part.id
            };
        });
    };

    // Handle start practice
    const handleStartTest = (partId: string | number) => {
        setSelectedPartId(partId as string);
        setConfigModalVisible(true);
    };

    // Confirm and start practice
    const handleConfirmStart = async () => {
        if (!selectedPartId) return;

        try {
            setLoading(true);

            const request: CreatePracticeRequest = {
                partIds: [selectedPartId],
                questionsPerPart: practiceConfig.questionsPerPart,
                isTimed: practiceConfig.isTimed,
                timeLimitMinutes: practiceConfig.isTimed ? practiceConfig.timeLimitMinutes : undefined
            };

            const session = await PracticeService.startPractice(request);

            message.success('Đã tạo bài luyện tập!');
            navigate(`/practice/session/${session.sessionId}`);
        } catch (error: any) {
            console.error('Start practice error:', error);
            message.error(error?.response?.data?.message || 'Không thể tạo bài luyện tập');
        } finally {
            setLoading(false);
            setConfigModalVisible(false);
        }
    };

    if (loading) {
        return (
            <div className="skill-tabs-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Đang tải danh sách kỹ năng...</p>
                </div>
            </div>
        );
    }

    if (!activeSkill) {
        return (
            <div className="skill-tabs-container">
                <div className="no-skills">
                    <p>Không có kỹ năng nào để hiển thị</p>
                </div>
            </div>
        );
    }

    const practiceItems = generatePracticeItemsFromParts();

    return (
        <div className="skill-tabs-container">
            {/* Skill Tabs */}
            <div className="skill-tabs">
                {skills.map(skill => (
                    <button
                        key={skill.id}
                        className={skill.id === activeSkill.id ? 'active' : ''}
                        onClick={() => {
                            setActiveSkill(skill);
                            if (skill.children && skill.children.length > 0) {
                                setActivePart(skill.children[0]);
                            } else {
                                setActivePart(null);
                            }
                        }}
                    >
                        {skill.name}
                    </button>
                ))}
            </div>

            {/* Parts Grid */}
            {/* <div className="parts-grid">
                {activeSkill.children && activeSkill.children.length > 0 ? (
                    activeSkill.children.map(part => (
                        <div
                            key={part.id}
                            className={`part-card ${part.id === activePart?.id ? 'active' : ''}`}
                            onClick={() => setActivePart(part)}
                        >
                            <h3>{part.name}</h3>
                            <p>{part.description || 'Luyện tập kỹ năng'}</p>
                        </div>
                    ))
                ) : (
                    <div className="no-parts">
                        <p>{activeSkill.name} chưa có phần luyện tập nào</p>
                    </div>
                )}
            </div> */}

            {/* Practice List */}
            <PracticeList
                activePart={activePart}
                activeSkill={activeSkill}
                tests={practiceItems}
                loading={loading}
                onStartTest={handleStartTest}
                onViewExplanation={(id: any) => {
                    console.log('View explanation for part:', id);
                    // Navigate to explanation page
                }}
            />

            {/* Practice Config Modal */}
            <Modal
                title="Cấu hình bài luyện tập"
                open={configModalVisible}
                onOk={handleConfirmStart}
                onCancel={() => setConfigModalVisible(false)}
                okText="Bắt đầu"
                cancelText="Hủy"
                confirmLoading={loading}
            >
                <div style={{ padding: '20px 0' }}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                            Số câu hỏi:
                        </label>
                        <InputNumber
                            min={5}
                            max={50}
                            value={practiceConfig.questionsPerPart}
                            onChange={(value) => setPracticeConfig(prev => ({
                                ...prev,
                                questionsPerPart: value || 10
                            }))}
                            style={{ width: '100%' }}
                        />
                        <span style={{ fontSize: 12, color: '#888', marginTop: 4, display: 'block' }}>
                            Số câu hỏi bạn muốn luyện tập
                        </span>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                            <Switch
                                checked={practiceConfig.isTimed}
                                onChange={(checked) => setPracticeConfig(prev => ({
                                    ...prev,
                                    isTimed: checked
                                }))}
                                style={{ marginRight: 8 }}
                            />
                            Giới hạn thời gian
                        </label>
                    </div>

                    {practiceConfig.isTimed && (
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                Thời gian (phút):
                            </label>
                            <InputNumber
                                min={5}
                                max={120}
                                value={practiceConfig.timeLimitMinutes}
                                onChange={(value) => setPracticeConfig(prev => ({
                                    ...prev,
                                    timeLimitMinutes: value || 15
                                }))}
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}