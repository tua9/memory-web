import { LearningIllustrationSection } from "../components/LearningIllustration";
import { LoginFormSection } from "../components/LoginForm";
import type { ReactElement } from 'react';

export const LoginPage = (): ReactElement => {
    return (
        <main className="relative min-h-screen w-full bg-[#f8fbf8] text-[#1f2937] flex flex-col justify-between overflow-x-hidden">
            {/* Background Pastel Shapes */}
            <div className="absolute top-[60px] left-[40px] w-[170px] h-[170px] bg-[#ddf2e4b2] rounded-full pointer-events-none" />
            <div className="absolute top-[40px] right-[80px] w-[110px] h-[110px] bg-[#f4c95d47] rounded-full pointer-events-none" />
            <div className="absolute bottom-[40px] right-[40px] w-[150px] h-[150px] bg-[#f6d7c747] rounded-full pointer-events-none" />

            {/* Header Bar */}
            <header className="relative z-10 w-full max-w-[1280px] mx-auto px-8 py-6 flex items-center justify-between">
                <a href="/" className="flex items-center gap-3">
                    <img
                        className="w-11 h-11"
                        alt="Memio m"
                        src="https://c.animaapp.com/ici9nV0T/img/memio-m.svg"
                    />
                    <span className="text-[22px] font-bold text-[#2e7d32] tracking-tight">
                        Memio
                    </span>
                </a>

                <div className="flex items-center gap-4">
                    <span className="hidden sm:inline text-[13px] text-[#667085]">
                        Chưa có tài khoản?
                    </span>
                    <a
                        href="/register"
                        className="h-10 px-5 flex items-center justify-center bg-white rounded-[14px] border border-[#e3ebe6] text-[#2e7d32] font-semibold text-[14px] shadow-sm hover:bg-[#eaf8ef] transition-colors"
                    >
                        Đăng ký
                    </a>
                </div>
            </header>

            {/* Main Content Area: Left Illustration + Right Form */}
            <div className="relative z-10 w-full max-w-[1280px] mx-auto px-8 py-4 flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 my-auto">
                <div className="-ml-8 lg:-ml-32"></div>
                <LearningIllustrationSection />

                <LoginFormSection />
            </div>

            {/* Bottom padding space */}
            <div className="py-4" />
        </main>
    );
};

export const LoginDesktop = LoginPage;
export default LoginPage;
