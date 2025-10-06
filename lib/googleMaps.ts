let googleMapsLoadPromise: Promise<void> | null = null;

export function loadGoogleMapsOnce(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  // If already loaded, resolve immediately
  if (window.google && (window as any).google.maps) {
    return Promise.resolve();
  }

  // Reuse existing in-flight promise
  if (googleMapsLoadPromise) {
    return googleMapsLoadPromise;
  }

  const apiKey = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string) || '';
  googleMapsLoadPromise = new Promise<void>((resolve, reject) => {
    if (!apiKey) {
      reject(new Error('Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local'));
      return;
    }

    // If a script tag already exists, don't append another one
    const existing = document.querySelector('script[data-gmaps-loader="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps API - check your API key and billing')));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&v=weekly`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-gmaps-loader', 'true');
    script.onload = () => {
      if (window.google && (window as any).google.maps) {
        resolve();
      } else {
        reject(new Error('Google Maps API loaded but not available'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Google Maps API - check your API key and billing'));
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}


