interface IPGeolocationResponse {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export async function getLocationByIP(): Promise<IPGeolocationResponse | null> {
  try {
    // Utiliser ipapi.co qui est gratuit et fiable
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('Erreur lors de la géolocalisation par IP');
    }
    
    const data = await response.json();
    
    if (data.latitude && data.longitude) {
      return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        city: data.city,
        country: data.country_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erreur géolocalisation IP:', error);
    return null;
  }
}

// Coordonnées par défaut (Paris)
export const DEFAULT_LOCATION = {
  latitude: 48.8566,
  longitude: 2.3522,
  city: 'Paris',
  country: 'France'
};
