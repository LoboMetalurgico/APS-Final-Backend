export interface IRequestCityInfo {
  action: 'getCityInfo';
  data: {
    location?: string;
    coords?: {
      lat: number;
      lon: number;
    };
  };
}
