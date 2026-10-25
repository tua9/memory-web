import { Link, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";

interface LoginRequiredProps {
    gameTitle: string;
}

// Ván chơi được chấm và lưu ở backend nên tạm thời cần đăng nhập; chế độ khách sẽ được bổ sung sau
export const LoginRequired = ({ gameTitle }: LoginRequiredProps) => {
    const location = useLocation();

    return (
        <>
            <Header />
            <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f6fcf8] px-4 py-10 font-sans text-[#121c2a]">
                <section className="w-full max-w-md rounded-[28px] border border-[#e3ebe6] bg-white p-8 text-center shadow-[0px_8px_30px_rgba(0,0,0,0.05)]">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#a7e3ca] bg-[#d7f1e4]">
                        <img src="/profile-mascot.svg" alt="" className="h-16 w-14 object-contain" />
                    </div>
                    <h1 className="mt-5 text-[24px] font-extrabold text-[#0d631b]">Đăng nhập để chơi {gameTitle}</h1>
                    <p className="mt-2 text-[14px] leading-relaxed text-[#40493d]">
                        Kết quả, EXP và chuỗi ngày chơi của bạn được lưu vào tài khoản. Chế độ chơi thử cho khách sẽ sớm có.
                    </p>
                    <div className="mt-6 flex flex-col gap-2.5">
                        {/* Truyền trang hiện tại để đăng nhập xong quay lại đúng trò chơi */}
                        <Link
                            to="/login"
                            state={{ from: location }}
                            className="flex h-12 items-center justify-center rounded-full bg-[#2e7d32] text-[15px] font-bold text-white shadow-md transition hover:bg-[#236527]"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/register"
                            className="flex h-11 items-center justify-center rounded-full border border-[#e3ebe6] text-[14px] font-bold text-[#2e7d32] transition hover:bg-[#f3f8f4]"
                        >
                            Tạo tài khoản mới
                        </Link>
                        <Link to="/games" className="mt-1 text-[13px] font-semibold text-[#667085] hover:underline">
                            Quay lại trang chọn trò chơi
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
};
