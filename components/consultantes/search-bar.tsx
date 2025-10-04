'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  defaultValue?: string;
}

export function SearchBar({ defaultValue }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(defaultValue || '');

  function handleSearch(value: string) {
    setSearchValue(value);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }

      router.push(`/consultantes?${params.toString()}`);
    });
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <Input
        type="search"
        placeholder="Buscar consultantes por nombre, email o motivo..."
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-4"
      />
      {isPending && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}
