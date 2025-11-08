export interface AirQualityCoord {
  lon: number;
  lat: number;
}

export interface AirQualityMain {
  aqi: number;
}

export interface AirQualityComponents {
  co: number;
  no: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  nh3: number;
}

export interface AirQualityItem {
  main: AirQualityMain;
  components: AirQualityComponents;
  dt: number;
}

export interface IAirQualityApiResponse {
  coord: AirQualityCoord;
  list: AirQualityItem[];
}
