import { ArunaClient, IMessage } from 'arunacore-api';
import { WeatherApiResponse } from './types';
import { degToCompass } from './utils';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true, override: false });

const ARUNACORE_HOST = process.env.ARUNACORE_HOST || 'localhost';
const ARUNACORE_PORT = Number(process.env.ARUNACORE_PORT) || 3000;

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
const BASE_WEATHER_API_URL = process.env.BASE_WEATHER_API_URL || 'https://api.example.com/weather';

const arunaCore = new ArunaClient({
  id: 'aps-final-weather-service',
  host: ARUNACORE_HOST,
  port: ARUNACORE_PORT,
});

interface RequestWeatherInfo {
  action: 'getWeatherInfo';
  data: {
    coords: {
      lat: number;
      lon: number;
    };
  };
}

arunaCore.on('request', async (message: IMessage) => {
  if ((message.content as RequestWeatherInfo).action !== 'getWeatherInfo') return;
  const requestData = (message.content as RequestWeatherInfo).data;

  try {
    const queryParam = `lat=${encodeURIComponent(requestData.coords.lat)}&lon=${encodeURIComponent(requestData.coords.lon)}`;
    const response = await fetch(`${BASE_WEATHER_API_URL}/weather?${queryParam}&appid=${WEATHER_API_KEY}&units=metric`);
    if (!response.ok) {
      await message.reply!({ error: 'Erro ao buscar informações do clima.' });
      console.error('Erro na resposta da API:', response);
      return;
    }
    const weatherInfo: WeatherApiResponse = await response.json();

    const parsedWeatherInfo = {
      name: weatherInfo.name,
      temperature: weatherInfo.main.temp,
      humidity: weatherInfo.main.humidity,
      condition: weatherInfo.weather[0].main,
      windSpeed: weatherInfo.wind.speed,
      windDirection: degToCompass(weatherInfo.wind.deg),
    };

    await message.reply!({ data: parsedWeatherInfo });
  } catch (error) {
    await message.reply!({ error: 'Erro ao processar a solicitação de clima.' });
    console.error('Erro ao buscar informações do clima:', error);
  }
});

arunaCore.connect().then(() => {
  console.log('Conectado a ArunaCore com sucesso.');
}).catch((error) => {
  console.error('Erro a conectar ao ArunaCore:', error);
});
