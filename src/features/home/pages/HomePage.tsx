import { useAuth } from '@/app/providers/AuthProvider';

export const HomePage = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-[#f8fbf8] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-[500px] bg-white rounded-[24px] p-8 shadow-sm border border-[#e3ebe6] text-center">
                <div className="w-16 h-16 bg-[#eaf8ef] text-[#2e7d32] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    ✓
                </div>
                <h1 className="text-[26px] font-bold text-[#1f2937] mb-2">
                    Chào mừng bạn đã trở lại!
                </h1>
                <p className="text-[14px] text-[#667085] mb-6">
                    Bạn đã đăng nhập thành công vào hệ thống Memio.
                </p>

                {user && (
                    <div className="bg-[#f8faf9] p-4 rounded-xl border border-[#e3ebe6] text-left mb-6 text-xs space-y-1 text-[#1f2937]">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Username:</strong> {user.username}</p>
                        <p><strong>XP:</strong> {user.total_xp}</p>
                        <p><strong>Level:</strong> {user.current_level}</p>
                    </div>
                )}

                <button
                    onClick={logout}
                    className="h-11 px-6 bg-[#2e7d32] hover:bg-[#236527] text-white font-semibold text-[14px] rounded-[12px] transition-colors"
                >
                    Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default HomePage;
