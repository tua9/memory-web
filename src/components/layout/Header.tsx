import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { label: "Phương pháp", href: "#methods" },
    { label: "Trò chơi", href: "/games" },
];

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, isAuthenticated } = useAuthStore();

    return (
        <header className="sticky top-0 z-50 border-b border-[#E3EBE6] bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 md:px-[120px]">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 z-50">
                    <img 
                        src="/src/assets/memio/Logo/Memio.svg" 
                        alt="Memio Logo" 
                        className="h-8 w-auto object-contain"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-10 md:flex">
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

                {/* Desktop CTA */}
                <div className="hidden items-center gap-4 md:flex">
                    {!isAuthenticated ? (
                        <>
                            <Link
                                to="/login"
                                className="text-[16px] font-semibold text-[#1F2937] hover:text-[#2E7D32] transition"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-full bg-[#2E7D32] px-6 py-2.5 text-[16px] font-semibold text-white transition hover:bg-[#236527]"
                            >
                                Đăng ký
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 rounded-full border border-[#E3EBE6] bg-[#F8FBF8] px-4 py-2 text-sm font-semibold text-[#2E7D32]">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF8EF] text-xs font-bold text-[#2E7D32]">
                                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                            <span>{user?.username || 'User'}</span>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="z-50 p-2 md:hidden text-[#1F2937]"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-expanded={isMenuOpen}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Nav Overlay */}
                <div
                    className={cn(
                        "fixed inset-0 z-40 bg-white pt-[80px] px-5 transition-transform duration-300 ease-in-out md:hidden",
                        isMenuOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    <nav className="flex flex-col gap-6 text-center">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-xl font-medium text-[#1F2937]"
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
                                    className="w-full rounded-full border border-[#E3EBE6] py-3 text-lg font-semibold text-[#1F2937]"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full rounded-full bg-[#2E7D32] py-3 text-lg font-semibold text-white"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        ) : (
                            <div className="text-lg font-semibold text-[#2E7D32]">
                                Xin chào, {user?.username || 'User'}
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};
