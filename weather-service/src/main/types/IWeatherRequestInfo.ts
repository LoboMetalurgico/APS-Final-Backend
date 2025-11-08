export interface IRequestWeatherInfo {
  action: 'getWeatherInfo';
  data: {
    location?: string;
    coords?: {
      lat: number;
      lon: number;
    };
  };
}
