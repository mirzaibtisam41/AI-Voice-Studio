import { CircleAlert, CircleCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const TONES = {
  error: {
    Icon: CircleAlert,
    className: 'border-danger/40 bg-danger/10 text-danger *:[svg]:text-danger',
  },
  success: {
    Icon: CircleCheck,
    className:
      'border-success/40 bg-success/10 text-success *:[svg]:text-success',
  },
};

export function FormAlert({ tone = 'error', children }) {
  if (!children) return null;

  const { Icon, className } = TONES[tone];

  return (
    <Alert
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('items-start', className)}
    >
      <Icon />
      <AlertDescription className="text-inherit">{children}</AlertDescription>
    </Alert>
  );
}
