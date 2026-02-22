import { NextResponse } from 'next/server';

interface ImageResult {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  source: string;
  sourceUrl: string;
  width?: number;
  height?: number;
}

// Search Unsplash (free, no API key required for demo)
async function searchUnsplash(query: string): Promise<ImageResult[]> {
  try {
    // Using Unsplash Source for demo (no API key needed)
    // In production, use the official API with an access key
    const images: ImageResult[] = [];
    
    // Generate placeholder results from Unsplash Source
    for (let i = 0; i < 10; i++) {
      const seed = `${query}-${i}`;
      images.push({
        id: `unsplash-${seed}`,
        url: `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}&sig=${i}`,
        thumbnail: `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}&sig=${i}`,
        title: `${query} - Unsplash Photo ${i + 1}`,
        source: 'unsplash',
        sourceUrl: `https://unsplash.com/s/photos/${encodeURIComponent(query)}`,
        width: 800,
        height: 600,
      });
    }
    
    return images;
  } catch (error) {
    console.error('Unsplash search failed:', error);
    return [];
  }
}

// Search Flickr (public API, no key required for basic search)
async function searchFlickr(query: string, lat?: number, lng?: number): Promise<ImageResult[]> {
  try {
    const params = new URLSearchParams({
      method: 'flickr.photos.search',
      api_key: process.env.FLICKR_API_KEY || 'demo',
      text: query,
      safe_search: '1', // Safe search
      content_type: '1', // Photos only
      media: 'photos',
      per_page: '20',
      format: 'json',
      nojsoncallback: '1',
      extras: 'url_m,url_l,url_o',
    });

    if (lat && lng) {
      params.set('lat', lat.toString());
      params.set('lon', lng.toString());
      params.set('radius', '10'); // 10km radius
    }

    // If no API key, return demo results
    if (!process.env.FLICKR_API_KEY) {
      return generateDemoResults(query, 'flickr', 8);
    }

    const res = await fetch(`https://api.flickr.com/services/rest/?${params}`);
    const data = await res.json();

    if (!data.photos?.photo) return [];

    return data.photos.photo.map((photo: Record<string, string>) => ({
      id: `flickr-${photo.id}`,
      url: photo.url_l || photo.url_m || `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`,
      thumbnail: photo.url_m || `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`,
      title: photo.title || `Photo from ${query}`,
      source: 'flickr',
      sourceUrl: `https://www.flickr.com/photos/${photo.owner}/${photo.id}`,
    }));
  } catch (error) {
    console.error('Flickr search failed:', error);
    return generateDemoResults(query, 'flickr', 5);
  }
}

// Search Bing Images (requires API key)
async function searchBing(query: string): Promise<ImageResult[]> {
  if (!process.env.BING_SEARCH_KEY) {
    return generateDemoResults(query, 'bing', 8);
  }

  try {
    const res = await fetch(
      `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(query)}&count=20&safeSearch=Strict`,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.BING_SEARCH_KEY,
        },
      }
    );

    const data = await res.json();
    
    if (!data.value) return [];

    return data.value.map((img: Record<string, unknown>) => ({
      id: `bing-${img.imageId || Math.random().toString(36)}`,
      url: img.contentUrl as string,
      thumbnail: img.thumbnailUrl as string,
      title: img.name as string,
      source: 'bing',
      sourceUrl: img.hostPageUrl as string,
      width: img.width as number,
      height: img.height as number,
    }));
  } catch (error) {
    console.error('Bing search failed:', error);
    return [];
  }
}

// Search Google Custom Search (requires API key)
async function searchGoogle(query: string): Promise<ImageResult[]> {
  if (!process.env.GOOGLE_SEARCH_KEY || !process.env.GOOGLE_SEARCH_CX) {
    return generateDemoResults(query, 'google', 10);
  }

  try {
    const params = new URLSearchParams({
      key: process.env.GOOGLE_SEARCH_KEY,
      cx: process.env.GOOGLE_SEARCH_CX,
      q: query,
      searchType: 'image',
      safe: 'active',
      num: '10',
    });

    const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);
    const data = await res.json();

    if (!data.items) return [];

    return data.items.map((item: Record<string, unknown>) => ({
      id: `google-${Math.random().toString(36)}`,
      url: item.link as string,
      thumbnail: (item.image as Record<string, string>)?.thumbnailLink || item.link as string,
      title: item.title as string,
      source: 'google',
      sourceUrl: (item.image as Record<string, string>)?.contextLink || '',
      width: (item.image as Record<string, number>)?.width,
      height: (item.image as Record<string, number>)?.height,
    }));
  } catch (error) {
    console.error('Google search failed:', error);
    return [];
  }
}

// Generate demo results when API keys aren't configured
function generateDemoResults(query: string, source: string, count: number): ImageResult[] {
  const images: ImageResult[] = [];
  const themes = ['house', 'building', 'street', 'neighborhood', 'architecture', 'property', 'home', 'exterior'];
  
  for (let i = 0; i < count; i++) {
    const theme = themes[i % themes.length];
    const width = 800 + (i % 3) * 100;
    const height = 600 + (i % 4) * 50;
    
    images.push({
      id: `${source}-demo-${i}-${Date.now()}`,
      url: `https://picsum.photos/seed/${query}-${source}-${i}/${width}/${height}`,
      thumbnail: `https://picsum.photos/seed/${query}-${source}-${i}/400/300`,
      title: `${query} - ${theme} (Demo)`,
      source,
      sourceUrl: `https://picsum.photos`,
      width,
      height,
    });
  }
  
  return images;
}

// Zillow/Redfin would require web scraping or partnerships
// For demo, we'll return placeholder results
async function searchRealEstate(query: string, source: 'zillow' | 'redfin'): Promise<ImageResult[]> {
  // In production, this would use web scraping or official APIs
  // For now, return demo results
  return generateDemoResults(query, source, 6);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const sourcesParam = searchParams.get('sources') || 'google,bing,flickr,unsplash';
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;

  if (!location) {
    return NextResponse.json({ error: 'Location is required' }, { status: 400 });
  }

  const sources = sourcesParam.split(',');
  const searchPromises: Promise<ImageResult[]>[] = [];

  // Queue up searches for each source
  if (sources.includes('google')) {
    searchPromises.push(searchGoogle(location));
  }
  if (sources.includes('bing')) {
    searchPromises.push(searchBing(location));
  }
  if (sources.includes('flickr')) {
    searchPromises.push(searchFlickr(location, lat, lng));
  }
  if (sources.includes('unsplash')) {
    searchPromises.push(searchUnsplash(location));
  }
  if (sources.includes('zillow')) {
    searchPromises.push(searchRealEstate(location, 'zillow'));
  }
  if (sources.includes('redfin')) {
    searchPromises.push(searchRealEstate(location, 'redfin'));
  }

  try {
    const results = await Promise.all(searchPromises);
    const allImages = results.flat();

    // Shuffle results to mix sources
    const shuffled = allImages.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      images: shuffled,
      count: shuffled.length,
      sources: sources.filter(s => results[sources.indexOf(s)]?.length > 0),
    });
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
