'use client';

import { useState } from 'react';

interface SearchFormProps {
  onSearch: (location: string, coordinates?: { lat: number; lng: number }) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [location, setLocation] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() && !useCurrentLocation) return;

    if (useCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSearch(location || 'Current Location', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Fallback to just the text search
          onSearch(location);
        }
      );
    } else {
      onSearch(location);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setUseCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSearch('Current Location', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setUseCurrentLocation(false);
        }
      );
    }
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm text-[var(--muted)] mb-2">
              Enter a location, address, or landmark
            </label>
            <input
              type="text"
              className="input text-lg"
              placeholder="e.g., 123 Main St, New York, NY or Eiffel Tower, Paris"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={loading || (!location.trim() && !useCurrentLocation)}
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block mr-2">⏳</span>
                Searching...
              </>
            ) : (
              <>
                🔍 Search Images
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleUseCurrentLocation}
            disabled={loading}
          >
            📍 Use My Location
          </button>
        </div>
      </form>

      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <p className="text-sm text-[var(--muted)]">
          💡 <strong>Tips:</strong> Try specific addresses for real estate images, or landmarks/city names for general photos.
          All results are filtered for safe content.
        </p>
      </div>
    </div>
  );
}
