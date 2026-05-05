import Link from "next/link";
import { signOut } from "@/src/features/auth/actions/signOut";
import { BrandLockup } from "@/components/fire-banking";

type AppHeaderLink = {
  href: string;
  label: string;
};

type AppHeaderProps = {
  links?: AppHeaderLink[];
};

export function AppHeader({ links = [] }: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-4 px-5 pb-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/dashboard" className="w-fit">
        <BrandLockup compact />
      </Link>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-bold text-fb-trust hover:text-fb-trust-strong"
          >
            {link.label}
          </Link>
        ))}
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm font-semibold text-fb-ink-3 underline-offset-4 hover:text-fb-ink hover:underline"
          >
            로그아웃
          </button>
        </form>
      </div>
    </header>
  );
}
