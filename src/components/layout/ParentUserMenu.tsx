import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, ChevronDown, Gamepad2, Loader2, LogOut, Sparkles, User } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/authStore";

export const ParentUserMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLElement | null)[]>([]);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    setLogoutError(null);
    if (returnFocus) trigger.current?.focus();
  };

  const focusItem = (index: number) => {
    const list = items.current.filter((item): item is HTMLElement => item !== null);
    list[(index + list.length) % list.length]?.focus();
  };

  // Đóng khi click ngoài hoặc bấm Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openAt = (index: number) => {
    setOpen(true);
    requestAnimationFrame(() => focusItem(index));
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAt(0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openAt(-1);
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = items.current.filter(Boolean);
    const index = list.indexOf(document.activeElement as HTMLElement);
    const moves: Record<string, number> = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: -1 };
    if (event.key in moves) {
      event.preventDefault();
      focusItem(moves[event.key]);
    } else if (event.key === "Tab") {
      close(false);
    }
  };

  const onLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      setOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError((error as { message?: string }).message || "Đăng xuất thất bại. Vui lòng kiểm tra mạng và thử lại.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const name = user?.username || "Phụ huynh";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="user-menu" ref={root} data-open={open}>
      <button
        ref={trigger}
        type="button"
        id="parent-menu-button"
        className="user-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="parent-menu-panel"
        onClick={() => (open ? close(false) : setOpen(true))}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="user-menu__avatar" aria-hidden="true">{initial}</span>
        <span className="user-menu__name">{name}</span>
        <ChevronDown size={16} aria-hidden="true" className="user-menu__chevron" />
      </button>

      <div
        id="parent-menu-panel"
        role="menu"
        aria-labelledby="parent-menu-button"
        className="user-menu__panel"
        inert={!open}
        onKeyDown={onMenuKeyDown}
      >
        <div className="user-menu__who">
          <span className="user-menu__avatar user-menu__avatar--large" aria-hidden="true">{initial}</span>
          <span className="user-menu__id">
            <strong>{name}</strong>
            {user?.email && <span>{user.email}</span>}
          </span>
        </div>

        <div className="user-menu__stats" aria-live="polite">
          <p className="user-menu__level">
            <span>Tài khoản phụ huynh</span>
            <span className="rounded-full bg-[#EAF8EF] px-2 py-0.5 text-xs font-semibold text-[#1F6B2A]">Đã kết nối</span>
          </p>
          <p className="user-menu__streak" data-done={true}>
            Đồng hành rèn luyện trí nhớ cùng con
          </p>
        </div>

        <Link
          ref={(element) => { items.current[0] = element; }}
          to="/parent/profile"
          viewTransition
          role="menuitem"
          className="user-menu__item"
          onClick={() => close(false)}
        >
          <User size={16} aria-hidden="true" />
          Hồ sơ phụ huynh
        </Link>

        <Link
          ref={(element) => { items.current[1] = element; }}
          to="/parent/child-profile"
          viewTransition
          role="menuitem"
          className="user-menu__item"
          onClick={() => close(false)}
        >
          <Sparkles size={16} aria-hidden="true" />
          Xem hồ sơ của con
        </Link>

        <Link
          ref={(element) => { items.current[2] = element; }}
          to="/parent"
          viewTransition
          role="menuitem"
          className="user-menu__item"
          onClick={() => close(false)}
        >
          <BarChart3 size={16} aria-hidden="true" />
          Tiến độ của con
        </Link>

        <Link
          ref={(element) => { items.current[3] = element; }}
          to="/parent/room"
          viewTransition
          role="menuitem"
          className="user-menu__item"
          onClick={() => close(false)}
        >
          <Gamepad2 size={16} aria-hidden="true" />
          Phòng chơi cùng con
        </Link>

        <button
          ref={(element) => { items.current[4] = element; }}
          type="button"
          role="menuitem"
          className="user-menu__item user-menu__item--danger"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <LogOut size={16} aria-hidden="true" />}
          {isLoggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
        </button>

        {logoutError && (
          <p role="alert" className="user-menu__error">{logoutError}</p>
        )}
      </div>
    </div>
  );
};

