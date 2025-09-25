export interface Location {
  filename: string;
  location: string;
  province: string;
  country: string;
  date: string;
  time: string;
  coordinates: [number, number];
  short?: string;
  height?: number; 
  difficulty?: string; 
  recommended?: boolean; 
  hike_distance_km?: number;
  elevation_gain_m?: number; 
  nearest_city?: string; 
}


export interface MapMarkerProps {
  location: Location;
  onMarkerClick: (location: Location) => void;
  isSelected?: boolean;
}