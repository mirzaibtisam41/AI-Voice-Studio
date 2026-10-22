'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { InputWithIcon } from '@/features/auth/InputWithIcon';

export function PasswordInput(props) {
  const [isVisible, setIsVisible] = useState(false);
  const ToggleIcon = isVisible ? EyeOff : Eye;

  return (
    <InputWithIcon
      icon={Lock}
      type={isVisible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((current) => !current)}
          className="flex size-8 items-center justify-center rounded-md text-ink-3 transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ToggleIcon className="size-4" aria-hidden="true" />
        </button>
      }
      {...props}
    />
  );
}
