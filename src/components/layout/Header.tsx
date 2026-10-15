import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { label: "Phương pháp", href: "/#methods" },
    { label: "Trò chơi", href: "/games" },
];

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, isAuthenticated } = useAuthStore();

    return (
        <header className="sticky top-0 z-50 bg-[#F8FBF8]/95 backdrop-blur-md">
            <div className="mx-auto flex h-[96px] max-w-[1440px] items-center justify-between px-5 md:px-[120px]">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 z-50">
                    <img 
                        src="/src/assets/memio/Logo/Memio.svg" 
                        alt="Memio Logo" 
                        className="h-[44px] w-auto object-contain"
                    />
                </Link>

                {/* Desktop Nav & Actions */}
                <div className="hidden items-center gap-10 md:flex">
                    <nav className="flex items-center gap-10">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-[16px] font-medium text-[#1F2937] transition hover:text-[#2E7D32]"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-6">
                        {!isAuthenticated ? (
                            <>
                                <Link
                                    to="/login"
                                    className="text-[16px] font-medium text-[#1F2937] transition hover:text-[#2E7D32]"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex h-[56px] items-center justify-center rounded-[16px] bg-[#2E7D32] px-8 text-[16px] font-semibold text-white transition hover:bg-[#236527]"
                                >
                                    Đăng ký
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-3 rounded-[16px] border border-[#E3EBE6] bg-white px-5 py-3 text-[15px] font-semibold text-[#2E7D32]">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF8EF] text-sm font-bold text-[#2E7D32]">
                                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                                <span>{user?.username || 'User'}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Right Buttons */}
                <div className="flex items-center gap-3 md:hidden">
                    <Link
                        to="/games"
                        className="inline-flex h-[44px] items-center justify-center rounded-[14px] bg-[#2E7D32] px-5 text-[15px] font-semibold text-white"
                    >
                        Bắt đầu
                    </Link>
                    <button
                        className="flex h-[44px] w-[44px] items-center justify-center rounded-[14px] border border-[#E3EBE6] bg-white text-[#1F2937]"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-expanded={isMenuOpen}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile Nav Overlay */}
                <div
                    className={cn(
                        "fixed inset-0 top-[96px] z-40 bg-[#F8FBF8] px-6 py-8 transition-transform duration-300 ease-in-out md:hidden",
                        isMenuOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    <nav className="flex flex-col gap-6 text-left">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-[18px] font-medium text-[#1F2937]"
                            >
                                {link.label}
                            </a>
                        ))}
                        <hr className="border-[#E3EBE6]" />
                        {!isAuthenticated ? (
                            <div className="flex flex-col gap-4 mt-2">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex h-[48px] w-full items-center justify-center rounded-[14px] border border-[#E3EBE6] bg-white text-[16px] font-semibold text-[#1F2937]"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex h-[48px] w-full items-center justify-center rounded-[14px] bg-[#2E7D32] text-[16px] font-semibold text-white"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        ) : (
                            <div className="text-[16px] font-semibold text-[#2E7D32]">
                                Xin chào, {user?.username || 'User'}
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};
