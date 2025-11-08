export interface ICityData {
  location: string;
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  windDirection: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' |'NW';
  airQuality: {
    index: number;
    description: string;
    mainPollutant: string;
    category: 'Boa' | 'Moderada' | 'Ruim' | 'Muito Ruim' | 'Péssima';
  }
  uvData: {
    uvi: number;
    level: 'Baixo' | 'Moderado' | 'Alto' | 'Muito Alto' | 'Extremo';
    description: string;
  }
}
