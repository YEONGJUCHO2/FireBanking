import Link from "next/link";
import { signOut } from "@/src/features/auth/actions/signOut";

type AppHeaderLink = {
  href: string;
  label: string;
};

type AppHeaderProps = {
  links?: AppHeaderLink[];
};

export function AppHeader({ links = [] }: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <Link href="/dashboard" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
        Fire Banking
      </Link>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            {link.label}
          </Link>
        ))}
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            로그아웃
          </button>
        </form>
      </div>
    </header>
  );
}
