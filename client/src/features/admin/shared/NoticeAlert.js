import { Info, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const TONES = {
  info: { Icon: Info, className: 'border-blue/40 bg-blue/10 text-blue' },
  warning: {
    Icon: TriangleAlert,
    className: 'border-warning/40 bg-warning/10 text-warning',
  },
};

export function NoticeAlert({ tone = 'info', className, children }) {
  const { Icon, className: toneClassName } = TONES[tone];

  return (
    <Alert role="status" className={cn(toneClassName, className)}>
      <Icon />
      <AlertDescription className="text-inherit">{children}</AlertDescription>
    </Alert>
  );
}
