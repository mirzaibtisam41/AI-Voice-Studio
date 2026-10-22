import { Suspense } from 'react';
import { PlaygroundView } from '@/features/playground/PlaygroundView';

export const metadata = { title: 'Real-Time Playground' };

export default function PlaygroundPage() {
  return (
    <Suspense>
      <PlaygroundView />
    </Suspense>
  );
}
