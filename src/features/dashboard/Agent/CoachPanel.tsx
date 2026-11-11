import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit } from 'lucide-react';
import { GAME_META } from '@/features/shared-game/registry';
import type { ApiCoachAnalysis, ApiSavedCoachPlan } from '../api/dashboard.api';
import { CoachChat } from './CoachChat';
import { SavedCoachPlan } from './SavedCoachPlan';
import { BlockState } from '../components/BlockState';
import type { Request } from '../hooks/useOverview';

const SKILL_LABELS: Record<ApiCoachAnalysis['skillLevel'], string> = {
    new: 'Bắt đầu',
    early: 'Đang làm quen',
    building: 'Đang xây nền',
    steady: 'Vững vàng',
    advanced: 'Thành thạo',
};

const percent = (accuracy: number | null) => accuracy === null ? 'Chưa có dữ liệu' : `${Math.round(accuracy * 100)}%`;

interface CoachPanelProps {
    request: Request<ApiCoachAnalysis>;
    onRetry: () => void;
}

export const CoachPanel = ({ request, onRetry }: CoachPanelProps) => {
    const [savedPlan, setSavedPlan] = useState<ApiSavedCoachPlan | null | undefined>();

    return (
    <section className="panel span-12 coach" aria-labelledby="coach-title">
        <div className="panel__head coach__head">
            <div className="coach__title">
                <BrainCircuit aria-hidden="true" size={22} />
                <h2 id="coach-title">Huấn luyện viên AI</h2>
            </div>
            <span className="coach__privacy">Gemini xử lý chat và tiến độ trên máy chủ Google</span>
        </div>
        <BlockState request={request} onRetry={onRetry}>
            {(analysis) => {
                const focusGame = analysis.focusGame ? GAME_META[analysis.focusGame] : null;
                const strongestGame = analysis.strongestGame ? GAME_META[analysis.strongestGame] : null;
                return (
                    <>
                        <div className="coach__overview">
                            <div>
                                <p className="coach__level">{SKILL_LABELS[analysis.skillLevel]}</p>
                                <p className="coach__summary">
                                    {analysis.totalPlayed === 0
                                        ? 'Chơi vài ván đầu tiên để bắt đầu nhận phân tích phù hợp với bạn.'
                                        : analysis.totalPlayed < 3
                                            ? `Độ chính xác hiện tại là ${percent(analysis.overallAccuracy)}. Nhận định còn sơ bộ; chơi thêm để lộ trình sát hơn.`
                                            : `Độ chính xác chung ${percent(analysis.overallAccuracy)} qua ${analysis.totalPlayed} ván${focusGame ? ` · nên ưu tiên ${focusGame.label}` : ''}.`}
                                </p>
                            </div>
                            <div className="coach__highlights">
                                <p><span>{analysis.totalPlayed < 3 ? 'Đang nổi bật' : 'Điểm mạnh'}</span>{strongestGame ? strongestGame.label : 'Đang tìm hiểu'}</p>
                                <p><span>Cần luyện thêm</span>{focusGame ? focusGame.label : 'Chưa đủ dữ liệu'}</p>
                            </div>
                        </div>

                        <div className="coach__content">
                            <section className="coach__plan" aria-labelledby="coach-plan-title">
                                <h3 id="coach-plan-title">{savedPlan ? 'Lộ trình đang lưu' : 'Lộ trình tuần này'}</h3>
                                {savedPlan ? (
                                    <SavedCoachPlan plan={savedPlan} />
                                ) : (
                                    <ol>
                                        {analysis.plan.map((step, index) => {
                                            const game = GAME_META[step.gameName];
                                            const label = step.focus === 'maintain'
                                                ? 'Duy trì điểm mạnh'
                                                : step.focus === 'review' ? 'Ôn lại và tự kiểm tra' : 'Luyện tập trọng tâm';
                                            return (
                                                <li key={`${step.day}-${step.gameName}`}>
                                                    <div>
                                                        <p className="coach__session">{`Buổi ${index + 1} · Ngày ${step.day}`}</p>
                                                        <h4>{label}: {game.label} · cấp {step.level}</h4>
                                                        <p>{step.tip}</p>
                                                        <p className="coach__target">Mục tiêu: đúng ít nhất {step.targetAccuracy}%</p>
                                                    </div>
                                                    <Link to={game.route} className="coach__play" aria-label={`Mở trò chơi ${game.label}`}>
                                                        Mở trò chơi <ArrowRight size={16} aria-hidden="true" />
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                )}
                            </section>

                            <section className="coach__games" aria-labelledby="coach-games-title">
                                <h3 id="coach-games-title">Năng lực theo trò</h3>
                                <ul>
                                    {analysis.games.map((game) => (
                                        <li key={game.gameName}>
                                            <span>{GAME_META[game.gameName].label}</span>
                                            <span>{percent(game.accuracy)}</span>
                                            {game.played ? (
                                                <span className="coach__game-detail">
                                                    <strong>{game.bestLevel ? `Kỷ lục cấp ${game.bestLevel}` : `Đã mở cấp ${game.unlockedLevel}`}</strong>
                                                    <small>{game.played} ván · {game.perfect} hoàn hảo</small>
                                                </span>
                                            ) : <span>Chưa chơi</span>}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                        <CoachChat onSavedPlanChange={setSavedPlan} />
                    </>
                );
            }}
        </BlockState>
      </section>
    );
};
