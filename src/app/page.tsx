'use client';

import { useState } from 'react';
import ImageGrid from '@/components/ImageGrid';
import SearchForm from '@/components/SearchForm';
import SourceFilters from '@/components/SourceFilters';

export interface ImageResult {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  source: string;
  sourceUrl: string;
  width?: number;
  height?: number;
}

export type ImageSource = 'google' | 'bing' | 'flickr' | 'unsplash' | 'zillow' | 'redfin';

const SOURCE_LABELS: Record<ImageSource, string> = {
  google: 'Google Images',
  bing: 'Bing Images',
  flickr: 'Flickr',
  unsplash: 'Unsplash',
  zillow: 'Zillow',
  redfin: 'Redfin',
};

export default function Home() {
  const [images, setImages] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<string | null>(null);
  const [activeSources, setActiveSources] = useState<ImageSource[]>(['google', 'bing', 'flickr', 'unsplash']);
  const [selectedSource, setSelectedSource] = useState<ImageSource | 'all'>('all');

  const handleSearch = async (location: string, coordinates?: { lat: number; lng: number }) => {
    setLoading(true);
    setError(null);
    setImages([]);
    setSearchedLocation(location);

    try {
      const params = new URLSearchParams({
        location,
        sources: activeSources.join(','),
        safeSearch: 'true',
      });
      
      if (coordinates) {
        params.set('lat', coordinates.lat.toString());
        params.set('lng', coordinates.lng.toString());
      }

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setImages(data.images || []);
    } catch (err) {
      setError('Failed to search for images. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = selectedSource === 'all' 
    ? images 
    : images.filter(img => img.source === selectedSource);

  const sourceCounts = images.reduce((acc, img) => {
    acc[img.source] = (acc[img.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📍</span>
            <h1 className="text-xl font-bold">Location Images</h1>
          </div>
          <div className="text-sm text-[var(--muted)]">
            Aggregate images from any location
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <SearchForm onSearch={handleSearch} loading={loading} />
        </div>

        {/* Source Filters */}
        <div className="mb-6">
          <SourceFilters
            activeSources={activeSources}
            onToggleSource={(source) => {
              setActiveSources(prev => 
                prev.includes(source) 
                  ? prev.filter(s => s !== source)
                  : [...prev, source]
              );
            }}
            sourceLabels={SOURCE_LABELS}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="card bg-red-500/10 border-red-500/50 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin text-4xl mb-4">🔄</div>
            <p className="text-[var(--muted)]">Searching for images of {searchedLocation}...</p>
          </div>
        )}

        {/* Results */}
        {!loading && images.length > 0 && (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">
                  {filteredImages.length} images found for "{searchedLocation}"
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  From {Object.keys(sourceCounts).length} sources
                </p>
              </div>

              {/* Source Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSource('all')}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedSource === 'all'
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]'
                  }`}
                >
                  All ({images.length})
                </button>
                {Object.entries(sourceCounts).map(([source, count]) => (
                  <button
                    key={source}
                    onClick={() => setSelectedSource(source as ImageSource)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedSource === source
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]'
                    }`}
                  >
                    {SOURCE_LABELS[source as ImageSource] || source} ({count})
                  </button>
                ))}
              </div>
            </div>

            {/* Image Grid */}
            <ImageGrid images={filteredImages} />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && images.length === 0 && searchedLocation && (
          <div className="text-center py-16">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-[var(--muted)]">No images found for "{searchedLocation}"</p>
            <p className="text-sm text-[var(--muted)] mt-2">Try a different location or enable more sources</p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !searchedLocation && (
          <div className="text-center py-16">
            <span className="text-6xl mb-6 block">🏠</span>
            <h2 className="text-2xl font-bold mb-4">Find images of any location</h2>
            <p className="text-[var(--muted)] max-w-md mx-auto">
              Enter an address, city, or landmark to aggregate images from Google, Bing, Flickr, 
              real estate sites, and more. All results are filtered for safe content.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-sm text-[var(--muted)]">
          Images are sourced from public APIs and are subject to their respective terms of service.
        </div>
      </footer>
    </div>
  );
}
