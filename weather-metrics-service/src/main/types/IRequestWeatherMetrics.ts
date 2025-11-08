export interface IRequestWeatherMetrics {
  action: 'getWeatherMetrics';
  data: {
    coords: { lat: number; lon: number };
  };
}
