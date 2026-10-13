import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Moon, Sun, Cards, House } from "@phosphor-icons/react";
import { Suspense, useEffect } from "react";
import { useTheme } from "../lib/theme";
import { PageSkeleton } from "./ui";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-10 place-items-center rounded-[var(--radius-ui)] text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
      aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
    >
      {theme === "dark" ? <Sun size="1.25rem" weight="bold" /> : <Moon size="1.25rem" weight="bold" />}
    </button>
  );
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-[var(--radius-ui)] px-3 h-10 text-sm font-medium transition-colors ${
    isActive ? "text-accent bg-accent-soft" : "text-ink-soft hover:text-ink hover:bg-surface-muted"
  }`;

export default function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">
        Bỏ qua đến nội dung
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-sm font-bold text-accent-ink">C2</span>
            <span className="hidden sm:inline">Chương 2</span>
          </Link>
          <nav className="flex items-center gap-1" aria-label="Điều hướng chính">
            <NavLink to="/" end className={navClass}>
              <House size="1.125rem" weight="bold" aria-hidden />
              <span>Chủ đề</span>
            </NavLink>
            <NavLink to="/on-tap" className={navClass}>
              <Cards size="1.125rem" weight="bold" aria-hidden />
              <span>Ôn tập</span>
            </NavLink>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main id="main" className="flex-1">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-page flex-col gap-2 px-4 py-8 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <p>Nội dung trích từ bộ tài liệu Chương 2. Tiến độ lưu trên trình duyệt của bạn.</p>
          <Link to="/on-tap" className="hover:text-ink">Ôn tập và câu chưa có đáp án</Link>
        </div>
      </footer>
    </div>
  );
}
