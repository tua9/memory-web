import { useLayoutEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { Check, LoaderCircle, RotateCcw, RotateCw, Send } from 'lucide-react';
import { dashboardApi, type ApiCoachChatMessage, type ApiCoachPlan, type ApiSavedCoachPlan } from '../api/dashboard.api';
import { FOLLOW_UP_PROMPTS, QUICK_PROMPTS } from './tools/quickPrompts';
import { WeekPlan } from './WeekPlan';

// Backend nhận tối đa 8 tin, bắt đầu và kết thúc bằng tin của người dùng
const MAX_MESSAGES = 8;
const MAX_MESSAGE_LENGTH = 1200;
const KEEP_ON_SCREEN = 20;

type ChatMessage = ApiCoachChatMessage & { plan?: ApiCoachPlan | null };

const errorMessage = (error: unknown) =>
    typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Chưa gửi được yêu cầu. Vui lòng thử lại.';

// Cắt còn 8 tin gần nhất; nếu tin đầu là của trợ lý thì bỏ, để hội thoại luôn mở đầu bằng người dùng
const toRequestMessages = (conversation: ChatMessage[]): ApiCoachChatMessage[] => {
    const recent = conversation.slice(-MAX_MESSAGES).map(({ role, content }) => ({ role, content }));
    if (recent[0]?.role === 'assistant') recent.shift();
    return recent;
};

const toPlan = ({ goal, minutesPerDay, sessions }: ApiCoachPlan): ApiCoachPlan => ({
    goal,
    minutesPerDay,
    sessions: sessions.map(({ day, minutes, gameName, level, targetAccuracy, tip }) => ({ day, minutes, gameName, level, targetAccuracy, tip })),
});

interface CoachChatProps {
    savedPlan: ApiSavedCoachPlan | null;
    onApply: (plan: ApiCoachPlan) => Promise<void>;
    inputRef: RefObject<HTMLInputElement | null>;
    // Báo cho hộp chat nổi khi có trả lời mới (để hiện chấm chưa đọc lúc hộp đang đóng)
    onReply?: () => void;
}

export const CoachChat = ({ savedPlan, onApply, inputRef, onReply }: CoachChatProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [applying, setApplying] = useState<number | null>(null);
    const [appliedIndex, setAppliedIndex] = useState<number | null>(null);
    const [applyError, setApplyError] = useState<string | null>(null);
    const threadRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const thread = threadRef.current;
        if (!thread) return;
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        thread.scrollTo({ top: thread.scrollHeight, behavior });
    }, [messages, isSending, error, applyError]);

    // Lộ trình đang bàn: bản nháp gần nhất trong chat, nếu chưa có thì lộ trình đã lưu
    const latestDraft = messages.findLast((message) => message.plan)?.plan ?? null;
    const planInContext = latestDraft ?? (savedPlan ? toPlan(savedPlan) : null);

    const sendMessage = async (content: string) => {
        const userMessage = content.trim();
        if (!userMessage || isSending) return;

        const last = messages.at(-1);
        const isRetry = last?.role === 'user' && last.content === userMessage;
        const conversation = isRetry ? messages : [...messages, { role: 'user' as const, content: userMessage }];
        setMessages(conversation.slice(-KEEP_ON_SCREEN));
        setDraft('');
        // Ô nhập không bị khoá lúc chờ trả lời, nên giữ focus ở đó để gõ tiếp (kể cả khi vừa bấm nút gợi ý)
        inputRef.current?.focus({ preventScroll: true });
        setError(null);
        setIsSending(true);

        try {
            const { data } = await dashboardApi.chatWithCoach(toRequestMessages(conversation), planInContext);
            setMessages((current) => [...current, { role: 'assistant' as const, content: data.reply, plan: data.plan }].slice(-KEEP_ON_SCREEN));
            onReply?.();
        } catch (requestError) {
            setError(errorMessage(requestError));
        } finally {
            setIsSending(false);
        }
    };

    const apply = async (plan: ApiCoachPlan, index: number) => {
        setApplying(index);
        setApplyError(null);
        try {
            await onApply(plan);
            setAppliedIndex(index);
        } catch (requestError) {
            setApplyError(errorMessage(requestError));
        } finally {
            setApplying(null);
        }
    };

    const reset = () => {
        setMessages([]);
        setError(null);
        setApplyError(null);
        setAppliedIndex(null);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void sendMessage(draft);
    };

    const last = messages.at(-1);
    const prompts = messages.length === 0 ? QUICK_PROMPTS : last?.plan ? FOLLOW_UP_PROMPTS : [];

    return (
        <div className="coach-chat">
            {messages.length > 0 && (
                <button type="button" className="coach-chat__reset" onClick={reset} disabled={isSending}>
                    <RotateCcw size={14} aria-hidden="true" /> Trò chuyện mới
                </button>
            )}

            <div className="coach-chat__thread" ref={threadRef} aria-live="polite" aria-relevant="additions text">
                {messages.length === 0 && (
                    <p className="coach-chat__welcome">
                        Cho huấn luyện viên biết bạn có bao nhiêu phút mỗi ngày, muốn tập ngày nào và muốn giỏi game nào.
                        Lộ trình sẽ hiện ngay tại đây để bạn xem trước khi áp dụng.
                    </p>
                )}
                {messages.map((message, index) => (
                    <div className={`coach-msg coach-msg--${message.role}`} key={`${index}-${message.role}`}>
                        <p className="coach-msg__bubble">
                            <span className="sr-only">{message.role === 'assistant' ? 'Huấn luyện viên: ' : 'Bạn: '}</span>
                            {message.content}
                        </p>
                        {message.plan && (
                            <div className="coach-draft">
                                <div className="coach-draft__head">
                                    <p className="coach-draft__goal">{message.plan.goal}</p>
                                    <p className="coach-draft__meta">
                                        {message.plan.sessions.length} buổi · tối đa {message.plan.minutesPerDay} phút mỗi ngày
                                    </p>
                                </div>
                                <WeekPlan sessions={message.plan.sessions} />
                                {appliedIndex === index ? (
                                    <p className="coach-draft__applied">
                                        <Check size={15} aria-hidden="true" /> Đã áp dụng
                                        <Link to="/dashboard">Xem lộ trình</Link>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn--brand coach-draft__apply"
                                        onClick={() => message.plan && void apply(message.plan, index)}
                                        disabled={applying !== null}
                                    >
                                        {applying === index
                                            ? <><LoaderCircle size={16} className="coach-spin" aria-hidden="true" /> Đang áp dụng…</>
                                            : savedPlan ? 'Thay lộ trình hiện tại' : 'Áp dụng lộ trình'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {isSending && (
                    <p className="coach-typing" role="status">
                        <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
                        <span className="sr-only">Huấn luyện viên đang soạn trả lời</span>
                    </p>
                )}
                {(error || applyError) && (
                    <div className="coach-chat__error" role="alert">
                        <span>{error ?? applyError}</span>
                        {error && last?.role === 'user' && (
                            <button type="button" onClick={() => void sendMessage(last.content)} disabled={isSending}>
                                <RotateCw size={14} aria-hidden="true" /> Thử lại
                            </button>
                        )}
                    </div>
                )}
            </div>

            {prompts.length > 0 && !isSending && (
                <div className="coach-chat__prompts" role="group" aria-label="Gợi ý nhanh">
                    {prompts.map((prompt) => (
                        <button key={prompt} type="button" onClick={() => void sendMessage(prompt)}>
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            <form className="coach-chat__form" onSubmit={submit}>
                <label className="sr-only" htmlFor="coach-chat-input">Nhắn cho huấn luyện viên</label>
                <input
                    id="coach-chat-input"
                    ref={inputRef}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    maxLength={MAX_MESSAGE_LENGTH}
                    placeholder={planInContext ? 'Muốn đổi gì trong lộ trình?' : 'Ví dụ: 20 phút mỗi ngày, tập Thứ 2 đến Thứ 6'}
                />
                <button type="submit" aria-label="Gửi" disabled={isSending || !draft.trim()}>
                    <Send size={17} aria-hidden="true" />
                </button>
            </form>
        </div>
    );
};
