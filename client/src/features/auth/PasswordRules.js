import { Check, X } from 'lucide-react';
import { PASSWORD_RULES } from '@/features/auth/authValidation';
import { cn } from '@/lib/utils';

export function PasswordRules({ id, password }) {
  return (
    <ul
      id={id}
      aria-label="Password requirements"
      className="flex flex-col gap-1"
    >
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        const Icon = passed ? Check : X;

        return (
          <li
            key={rule.id}
            className={cn(
              'flex items-center gap-2 text-[12.5px]',
              passed ? 'text-success' : 'text-ink-3',
            )}
          >
            <Icon className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
            {rule.label}
            <span className="sr-only">{passed ? 'met' : 'not met'}</span>
          </li>
        );
      })}
    </ul>
  );
}
