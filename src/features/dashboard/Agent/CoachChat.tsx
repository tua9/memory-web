import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { BookmarkPlus, Bot, Check, ChevronDown, LoaderCircle, MessageCircle, RotateCw, Send } from 'lucide-react';
import { dashboardApi, type ApiCoachChatMessage, type ApiSavedCoachPlan } from '../api/dashboard.api';
import { QUICK_PROMPTS } from './tools/quickPrompts';
import { SavedCoachPlan } from './SavedCoachPlan';

const MAX_MESSAGES = 8;
const MAX_MESSAGE_LENGTH = 1200;
const errorMessage = (error: unknown) =>
    typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Chưa gửi được yêu cầu. Vui lòng thử lại.';

interface CoachChatProps {
    onSavedPlanChange: (plan: ApiSavedCoachPlan | null) => void;
}

export const CoachChat = ({ onSavedPlanChange }: CoachChatProps) => {
    const [messages, setMessages] = useState<ApiCoachChatMessage[]>([]);
    const [draft, setDraft] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedPlan, setSavedPlan] = useState<ApiSavedCoachPlan | null>(null);
    const [savedMessageContent, setSavedMessageContent] = useState<string | null>(null);
    const [planError, setPlanError] = useState<string | null>(null);
    const [savingIndex, setSavingIndex] = useState<number | null>(null);
    const threadRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dashboardApi.getCoachPlan()
            .then(({ data }) => {
                setSavedPlan(data.savedPlan);
                onSavedPlanChange(data.savedPlan);
            })
            .catch((requestError: unknown) => setPlanError(errorMessage(requestError)));
    }, [onSavedPlanChange]);

    useLayoutEffect(() => {
        const thread = threadRef.current;
        if (!thread) return;

        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        thread.scrollTo({ top: thread.scrollHeight, behavior });
    }, [messages, isSending, error]);

    const sendMessage = async (content: string, previousMessages: ApiCoachChatMessage[]) => {
        const userMessage = content.trim();
        if (!userMessage || isSending) return;

        const isRetry = previousMessages.at(-1)?.role === 'user' && previousMessages.at(-1)?.content === userMessage;
        const conversation = isRetry
            ? previousMessages
            : [...previousMessages, { role: 'user' as const, content: userMessage }];
        setMessages(conversation.slice(-20));
        setDraft('');
        setError(null);
        setIsSending(true);

        try {
            const requestMessages = conversation.slice(-MAX_MESSAGES);
            const { data } = await dashboardApi.chatWithCoach(requestMessages);
            setMessages((current) => [...current, { role: 'assistant' as const, content: data.reply }].slice(-20));
        } catch (requestError) {
            setError(errorMessage(requestError));
        } finally {
            setIsSending(false);
        }
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void sendMessage(draft, messages);
    };

    const savePlan = async (content: string, index: number) => {
        if (!window.confirm('AI sẽ phân tích đoạn chat để tạo lộ trình cập nhật. Lộ trình đang lưu sẽ bị thay thế.')) return;

        setSavingIndex(index);
        setPlanError(null);
        try {
            const conversation = messages
                .slice(0, index + 1)
                .slice(-MAX_MESSAGES);
            if (conversation[0]?.role === 'assistant') conversation.shift();
            const { data: planDraft } = await dashboardApi.generateCoachPlan(conversation.slice(-(MAX_MESSAGES - 1)));
            const { data } = await dashboardApi.saveCoachPlan(planDraft.plan);
            setSavedPlan(data.savedPlan);
            onSavedPlanChange(data.savedPlan);
            setSavedMessageContent(content);
        } catch (requestError) {
            setPlanError(errorMessage(requestError));
        } finally {
            setSavingIndex(null);
        }
    };

    const lastMessage = messages.at(-1);

    return (
        <details className="coach-chat">
            <summary>
                <MessageCircle className="coach-chat__summary-icon" size={19} aria-hidden="true" />
                <span className="coach-chat__summary-copy">
                    <strong>Chat cùng Huấn luyện viên AI</strong>
                    <span>Điều chỉnh lộ trình theo mục tiêu và thời gian của bạn</span>
                </span>
                <ChevronDown className="coach-chat__chevron" size={18} aria-hidden="true" />
            </summary>
            <div className="coach-chat__body">
                <p className="coach-chat__hint">Chọn gợi ý hoặc nhập yêu cầu của bạn để bắt đầu.</p>
                <div className="coach-chat__quick-prompts" role="group" aria-label="Gợi ý nhanh">
                    {QUICK_PROMPTS.map((prompt) => (
                        <button key={prompt} type="button" onClick={() => void sendMessage(prompt, messages)} disabled={isSending}>
                            {prompt}
                        </button>
                    ))}
                </div>
                {savedPlan && (
                    <section className="coach-chat__saved-plan" aria-labelledby="coach-saved-plan-title">
                        <h3 id="coach-saved-plan-title">Lộ trình đang lưu</h3>
                        <SavedCoachPlan plan={savedPlan} />
                    </section>
                )}
                {planError && <p className="coach-chat__plan-error" role="alert">{planError}</p>}
                <div className="coach-chat__thread" ref={threadRef} aria-live="polite" aria-relevant="additions text">
                    {messages.length === 0 ? (
                        <div className="coach-chat__welcome">
                            <Bot size={20} aria-hidden="true" />
                            <p>Ví dụ: “Tôi có 15 phút mỗi ngày, hãy lập lịch luyện ghi nhớ số trong tuần này.”</p>
                        </div>
                    ) : messages.map((message, index) => (
                        <div className={`coach-chat__message-wrap coach-chat__message-wrap--${message.role}`} key={`${index}-${message.role}`}>
                            <p className={`coach-chat__message coach-chat__message--${message.role}`}>
                                <span className="coach-chat__speaker">
                                    {message.role === 'assistant' ? 'Huấn luyện viên' : 'Bạn'}
                                </span>
                                {message.content}
                            </p>
                            {message.role === 'assistant' && (
                                <button
                                    className="coach-chat__save"
                                    type="button"
                                    onClick={() => void savePlan(message.content, index)}
                                    disabled={savingIndex !== null || savedPlan?.content === message.content || savedMessageContent === message.content}
                                >
                                    {savingIndex === index
                                        ? <><LoaderCircle size={14} aria-hidden="true" /> Đang cập nhật…</>
                                        : savedPlan?.content === message.content || savedMessageContent === message.content
                                            ? <><Check size={14} aria-hidden="true" /> Đã lưu</>
                                            : <><BookmarkPlus size={14} aria-hidden="true" /> Lưu lộ trình</>}
                                </button>
                            )}
                        </div>
                    ))}
                    {isSending && (
                        <p className="coach-chat__status" role="status">
                            <LoaderCircle size={16} aria-hidden="true" />
                            Đang xây dựng gợi ý…
                        </p>
                    )}
                    {error && (
                        <div className="coach-chat__error" role="alert">
                            <span>{error}</span>
                            {lastMessage?.role === 'user' && (
                                <button type="button" onClick={() => void sendMessage(lastMessage.content, messages)} disabled={isSending}>
                                    <RotateCw size={14} aria-hidden="true" /> Thử lại
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <form className="coach-chat__form" onSubmit={submit}>
                    <label className="sr-only" htmlFor="coach-chat-input">Yêu cầu lập lộ trình</label>
                    <input
                        id="coach-chat-input"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        maxLength={MAX_MESSAGE_LENGTH}
                        placeholder="Hỏi về lịch tập hoặc game bạn muốn cải thiện…"
                        disabled={isSending}
                    />
                    <button type="submit" aria-label="Gửi yêu cầu" disabled={isSending || !draft.trim()}>
                        <Send size={17} aria-hidden="true" />
                    </button>
                </form>
            </div>
        </details>
    );
};
