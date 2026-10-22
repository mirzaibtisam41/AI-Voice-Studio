'use client';

import { Search, Star } from 'lucide-react';
import { Chip } from '@/components/ui/ChoiceChips';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { LIBRARY_FILTERS, LIBRARY_SORTS } from '@/mocks/library';

export function LibraryToolbar({
  type,
  onTypeChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  favoritesOnly,
  onFavoritesOnlyChange,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div
        role="group"
        aria-label="Filter by type"
        className="flex flex-wrap gap-2"
      >
        {LIBRARY_FILTERS.map((filter) => (
          <Chip
            key={filter.value}
            selected={type === filter.value}
            onClick={() => onTypeChange(filter.value)}
          >
            {filter.label}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search library..."
            aria-label="Search library"
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger aria-label="Sort by" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIBRARY_SORTS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'size-10',
            favoritesOnly && 'border-amber/50 text-amber',
          )}
          aria-pressed={favoritesOnly}
          aria-label="Show favorites only"
          title="Show favorites only"
          onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
        >
          <Star className={cn(favoritesOnly && 'fill-current')} />
        </Button>
      </div>
    </div>
  );
}
