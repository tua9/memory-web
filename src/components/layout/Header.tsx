const NAV_LINKS = [
    { label: "Phương pháp", href: "#" },
    { label: "Trò chơi", href: "#" },
    { label: "Đăng nhập", href: "#" },
];

export const Header = () => {
    return (
        <header className="sticky top-0 z-50 border-b border-[#e0eee6] bg-white/90 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
                {/* Logo */}
                <a href="/" className="flex items-center gap-2.5 no-underline">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a7a4a] text-white shadow-sm">
                        <span className="text-lg font-extrabold leading-none">M</span>
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-[#1a7a4a]">
                        Memio
                    </span>
                </a>

                {/* Nav */}
                <nav className="hidden items-center gap-8 md:flex">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-sm font-medium text-[#202b39] no-underline transition hover:text-[#1a7a4a]"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* CTA */}
                <button
                    type="button"
                    className="rounded-xl bg-[#1a7a4a] px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#15633c] active:scale-95"
                >
                    Đăng ký
                </button>
            </div>
        </header>
    );
};
