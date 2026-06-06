import { cn } from '@/lib/utils';

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-brown-soft">
        {label}
      </span>
      {children}
    </label>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <div>
        <h1 className="font-oswald text-3xl font-bold uppercase text-brown">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-brown-soft">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-2xl bg-pink/10 px-4 py-3 text-sm text-pink">
      {message}
    </div>
  );
}

export function pickError(e: unknown, fallback: string): string {
  const ax = e as { response?: { data?: { error?: string } } };
  return ax.response?.data?.error ?? fallback;
}
