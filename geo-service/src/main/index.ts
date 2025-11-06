import { ArunaClient, IMessage } from 'arunacore-api';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true, override: true });

const ARUNACORE_HOST = process.env.ARUNACORE_HOST || 'localhost';
const ARUNACORE_PORT = Number(process.env.ARUNACORE_PORT) || 3000;

const GEO_API_KEY = process.env.GEO_API_KEY || '';
const BASE_GEO_API_URL = process.env.BASE_GEO_API_URL || 'https://api.example.com/geo';

const arunaCore = new ArunaClient({
  id: 'aps-final-geo-service',
  host: ARUNACORE_HOST,
  port: ARUNACORE_PORT,
});

interface RequestCityInfo {
  action: 'getCityInfo';
  data: {
    location?: string;
    coords?: {
      lat: number;
      lon: number;
    };
  };
}

interface CityInfoAPIResponse {
  name: string;
  local_names?: { [key: string]: string };
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

arunaCore.on('request', async (message: IMessage) => {
  if ((message.content as RequestCityInfo).action !== 'getCityInfo') return;

  const requestData = (message.content as RequestCityInfo).data;
  if (!requestData.location && !requestData.coords) {
    await message.reply!({ error: 'Parâmetro location ou coords é obrigatório.' });
    return;
  }

  try {
    const queryParam = requestData.location
      ? `q=${encodeURIComponent(requestData.location)},br`
      : `lat=${encodeURIComponent(requestData.coords!.lat)}&lon=${encodeURIComponent(requestData.coords!.lon)}`;
    const response = await fetch(`${BASE_GEO_API_URL}/${requestData.location ? 'direct' : 'reverse'}?${queryParam}&appid=${GEO_API_KEY}`);
    if (!response.ok) {
      await message.reply!({ error: 'Erro ao buscar informações do local.' });
      console.error('Erro na resposta da API:', response);
      return;
    }
    let cityInfo: CityInfoAPIResponse = await response.json();

    if (!cityInfo || (Array.isArray(cityInfo) && cityInfo.length === 0)) {
      await message.reply!({ data: null });
      return;
    }

    cityInfo = Array.isArray(cityInfo) ? cityInfo[0] : cityInfo;

    if (cityInfo.local_names) {
      delete cityInfo.local_names;
    }

    await message.reply!({ data: cityInfo });
  } catch (error) {
    console.error('Erro ao buscar informações do local:', error);
    await message.reply!({ error: 'Erro ao buscar informações do local.' });
  }
});

arunaCore.connect().then(() => {
  console.log('Conectado a ArunaCore com sucesso.');
}).catch((error) => {
  console.error('Erro ao conectar a ArunaCore:', error);
});
