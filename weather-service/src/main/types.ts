export interface Coord {
  lon: number;
  lat: number;
}

export interface WeatherItem {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface MainInfo {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

export interface Wind {
  speed: number;
  deg: number;
  gust?: number;
}

export interface Rain {
  '1h'?: number;
  '3h'?: number;
}

export interface Clouds {
  all: number;
}

export interface SysInfo {
  type?: number;
  id?: number;
  country: string;
  sunrise: number;
  sunset: number;
}

export interface WeatherApiResponse {
  coord: Coord;
  weather: WeatherItem[];
  base: string;
  main: MainInfo;
  visibility: number;
  wind: Wind;
  rain?: Rain;
  clouds: Clouds;
  dt: number;
  sys: SysInfo;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}
