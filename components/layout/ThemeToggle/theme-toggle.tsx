'use client';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

type CompProps = {};

export default function ThemeToggle({}: CompProps) {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative border border-zinc-300 bg-slate-100 dark:bg-zinc-900"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      type="button"
    >
      <SunIcon
        className={`absolute h-[1.2rem] w-[1.2rem] text-foreground transition-all duration-300 ${
          isDark
            ? 'rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <MoonIcon
        className={`absolute h-[1.2rem] w-[1.2rem] text-foreground transition-all duration-300 ${
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
