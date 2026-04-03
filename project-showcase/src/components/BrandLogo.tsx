import Link from 'next/link';

type BrandLogoProps = {
  href?: string;
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ href = '/', compact = false, className = '' }: BrandLogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <span
        className="relative block h-8 w-8 rounded-full"
        style={{ background: 'radial-gradient(circle at 30% 30%, #ff8ea3 0%, #e11d48 60%, #9f1239 100%)' }}
        aria-hidden="true"
      >
        <span className="absolute -top-1 left-3 h-2 w-2 rounded-full bg-lime-400" />
        <span className="absolute top-2 left-2 h-1.5 w-1.5 rounded-full bg-white/70" />
        <span className="absolute top-4 right-2 h-1 w-1 rounded-full bg-white/60" />
      </span>
      <span className="font-headline text-2xl font-bold tracking-tight uppercase">
        {compact ? 'Cherry Soda' : 'Cherry Soda Co.'}
      </span>
    </div>
  );

  return (
    <Link href={href} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fizzyo-purple/70 rounded-md">
      {content}
    </Link>
  );
}