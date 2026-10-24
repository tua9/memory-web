import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, Loader2, Gamepad2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/features/auth/api/auth.api";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { label: "Phương pháp", href: "/#methods" },
    { label: "Trò chơi", href: "/games" },
];

export const Header = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const { user, isAuthenticated, logout } = useAuthStore();

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        if (isUserMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isUserMenuOpen]);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await authApi.logout();
        } catch (error) {
            console.error("Lỗi khi gọi API đăng xuất:", error);
        } finally {
            logout();
            setIsLoggingOut(false);
            setIsUserMenuOpen(false);
            navigate("/login");
        }
    };

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
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    aria-expanded={isUserMenuOpen}
                                    className="flex items-center gap-3 rounded-[16px] border border-[#E3EBE6] bg-white px-4 py-2.5 text-[15px] font-semibold text-[#1F2937] transition-all hover:border-[#2E7D32]/40 hover:shadow-sm cursor-pointer select-none"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF8EF] text-sm font-bold text-[#2E7D32] ring-2 ring-[#2E7D32]/10">
                                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[14px] font-semibold text-[#1F2937] leading-tight">
                                            {user?.username || 'User'}
                                        </span>
                                        {user?.current_level !== undefined && (
                                            <span className="text-[11px] font-medium text-[#2E7D32] leading-tight">
                                                Cấp {user.current_level}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={cn(
                                            "text-[#667085] transition-transform duration-200 ml-1",
                                            isUserMenuOpen && "rotate-180 text-[#2E7D32]"
                                        )}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 top-[calc(100%+10px)] w-[260px] rounded-[20px] border border-[#E3EBE6] bg-white p-2 shadow-[0_16px_36px_rgba(31,77,51,0.12)] z-50">
                                        {/* User Info Header */}
                                        <div className="px-3 py-2.5">
                                            <p className="text-[14px] font-bold text-[#1F2937] truncate">
                                                {user?.username || 'User'}
                                            </p>
                                            {user?.email && (
                                                <p className="text-[12px] text-[#667085] truncate mt-0.5">
                                                    {user.email}
                                                </p>
                                            )}
                                            {user?.total_xp !== undefined && (
                                                <div className="mt-2 flex items-center gap-1.5 rounded-[10px] bg-[#EAF8EF] px-2.5 py-1 text-[11px] font-semibold text-[#2E7D32]">
                                                    <Sparkles size={12} />
                                                    <span>{user.total_xp.toLocaleString()} EXP</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="my-1.5 h-px bg-[#E3EBE6]" />

                                        {/* Quick Link */}
                                        <Link
                                            to="/games"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-[14px] font-medium text-[#1F2937] hover:bg-[#F8FBF8] hover:text-[#2E7D32] transition-colors"
                                        >
                                            <Gamepad2 size={16} className="text-[#2E7D32]" />
                                            <span>Kho trò chơi</span>
                                        </Link>

                                        <div className="my-1.5 h-px bg-[#E3EBE6]" />

                                        {/* Logout Button */}
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className="flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-[14px] font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            {isLoggingOut ? (
                                                <Loader2 size={16} className="animate-spin text-[#DC2626]" />
                                            ) : (
                                                <LogOut size={16} />
                                            )}
                                            <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                                        </button>
                                    </div>
                                )}
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
                            <div className="flex flex-col gap-4 mt-2">
                                <div className="flex items-center gap-3 rounded-[16px] border border-[#E3EBE6] bg-white p-3.5 shadow-xs">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF8EF] text-base font-bold text-[#2E7D32]">
                                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[15px] font-bold text-[#1F2937] truncate">
                                            {user?.username || 'User'}
                                        </span>
                                        {user?.email && (
                                            <span className="text-[12px] text-[#667085] truncate">
                                                {user.email}
                                            </span>
                                        )}
                                        {user?.total_xp !== undefined && (
                                            <span className="text-[11px] font-semibold text-[#2E7D32] mt-0.5">
                                                Cấp {user.current_level ?? 1} • {user.total_xp.toLocaleString()} EXP
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        handleLogout();
                                    }}
                                    disabled={isLoggingOut}
                                    className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#FCA5A5] bg-[#FEF2F2] text-[15px] font-semibold text-[#DC2626] transition-colors hover:bg-[#FEE2E2] cursor-pointer disabled:opacity-50"
                                >
                                    {isLoggingOut ? (
                                        <Loader2 size={18} className="animate-spin text-[#DC2626]" />
                                    ) : (
                                        <LogOut size={18} />
                                    )}
                                    <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                                </button>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};
