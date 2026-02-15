import { useState, useCallback } from 'react';
import { useGraphStore } from '../store/graphStore';

export default function GraphHeader() {
  const setSearchQuery = useGraphStore((s) => s.setSearchQuery);
  const setIsSearching = useGraphStore((s) => s.setIsSearching);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (inputValue.trim()) {
        setSearchQuery(inputValue.trim());
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 2000);
      } else {
        setSearchQuery('');
        setIsSearching(false);
      }
    },
    [inputValue, setSearchQuery, setIsSearching]
  );

  return (
    <>
      <header className="absolute top-10 left-10 z-20 max-w-xs">
        <h1 className="text-4xl text-forest tracking-tight leading-none italic">
          Neural Map
        </h1>
        <p className="text-sm font-sans font-light tracking-[0.1em] text-text-muted uppercase mt-2">
          Real-time cognitive topology
        </p>
      </header>

      <div className="absolute top-10 right-10 z-20 flex items-center gap-4">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            className="bg-transparent border-b border-border focus:border-forest outline-hidden px-2 py-1 text-sm font-sans font-light w-48 transition-all duration-500 focus:w-64 placeholder:text-text-muted/50"
            placeholder="Search consciousness..."
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <span className="material-symbols-outlined absolute right-0 bottom-1 text-text-muted text-sm scale-75">
            search
          </span>
        </form>
      </div>
    </>
  );
}
