import * as React from 'react';
import { cn } from '@/lib/utils';

function Table({ className, ...props }) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-[13px]', className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return <thead className={cn('border-b', className)} {...props} />;
}

function TableBody({ className, ...props }) {
  return (
    <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  );
}

function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn('border-b transition-colors hover:bg-accent/40', className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        'h-10 px-3 text-left align-middle text-[11px] font-semibold tracking-wider whitespace-nowrap text-ink-3 uppercase',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }) {
  return <td className={cn('px-3 py-3 align-middle', className)} {...props} />;
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
