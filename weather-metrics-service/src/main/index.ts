import { IAirQualityApiResponse, IRequestWeatherMetrics } from './types';
import { calculateIQAr, descIQAr, getUVIndex } from './utils';
import { ArunaClient, IMessage } from 'arunacore-api';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true, override: true });

const ARUNACORE_HOST = process.env.ARUNACORE_HOST || 'localhost';
const ARUNACORE_PORT = Number(process.env.ARUNACORE_PORT) || 3000;

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
const BASE_WEATHER_API_URL = process.env.BASE_WEATHER_API_URL || 'https://api.example.com/metrics';

const arunaCore = new ArunaClient({
  id: 'aps-final-weather-metrics-service',
  host: ARUNACORE_HOST,
  port: ARUNACORE_PORT,
});

arunaCore.on('request', async (message: IMessage) => {
  const content = message.content as IRequestWeatherMetrics;
  if (content.action !== 'getWeatherMetrics') return;

  try {
    const { lat, lon } = content.data.coords;

    const queryParam = `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const response = await fetch(
      `${BASE_WEATHER_API_URL}/air_pollution?${queryParam}&appid=${WEATHER_API_KEY}`
    );

    if (!response.ok) {
      await message.reply!({ error: 'Erro ao buscar informações de qualidade do ar.' });
      console.error('Erro na resposta da API:', response.status, response.statusText);
      return;
    }

    const weatherInfo: IAirQualityApiResponse = await response.json();
    if (!weatherInfo.list?.length) {
      await message.reply!({ error: 'Nenhum dado de qualidade do ar encontrado.' });
      return;
    }

    const components = weatherInfo.list[0].components;
    const iqAr = calculateIQAr(components);

    const uvData = await getUVIndex(lat, lon);

    await message.reply!({
      data: {
        iqAr,
        description: descIQAr(iqAr.category),
        uvData
      },
    });
  } catch (error) {
    await message.reply!({ error: 'Erro ao processar a solicitação de métricas climáticas.' });
    console.error('Erro ao buscar informações de qualidade do ar / UV:', error);
  }
});

arunaCore.connect().then(() => {
  console.log('Conectado a ArunaCore com sucesso.')
}).catch((error) => {
  console.error('Erro ao conectar ao ArunaCore:', error)
});
