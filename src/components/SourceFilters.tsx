'use client';

import { ImageSource } from '@/app/page';

interface SourceFiltersProps {
  activeSources: ImageSource[];
  onToggleSource: (source: ImageSource) => void;
  sourceLabels: Record<ImageSource, string>;
}

const SOURCE_ICONS: Record<ImageSource, string> = {
  google: '🔍',
  bing: '🔎',
  flickr: '📷',
  unsplash: '📸',
  zillow: '🏠',
  redfin: '🏡',
};

const SOURCE_DESCRIPTIONS: Record<ImageSource, string> = {
  google: 'Google Images',
  bing: 'Bing Image Search',
  flickr: 'Flickr photos',
  unsplash: 'High-quality free photos',
  zillow: 'Real estate listings',
  redfin: 'Property photos',
};

export default function SourceFilters({ activeSources, onToggleSource, sourceLabels }: SourceFiltersProps) {
  const allSources: ImageSource[] = ['google', 'bing', 'flickr', 'unsplash', 'zillow', 'redfin'];

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-[var(--muted)] mb-3">Search Sources</h3>
      <div className="flex flex-wrap gap-2">
        {allSources.map((source) => {
          const isActive = activeSources.includes(source);
          return (
            <button
              key={source}
              onClick={() => onToggleSource(source)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-[var(--accent)]/20 border border-[var(--accent)] text-[var(--accent)]'
                  : 'bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]'
              }`}
              title={SOURCE_DESCRIPTIONS[source]}
            >
              <span>{SOURCE_ICONS[source]}</span>
              <span>{sourceLabels[source]}</span>
              {isActive && <span className="text-xs">✓</span>}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-[var(--muted)] mt-3">
        Note: Real estate sources (Zillow, Redfin) work best with specific addresses.
      </p>
    </div>
  );
}
