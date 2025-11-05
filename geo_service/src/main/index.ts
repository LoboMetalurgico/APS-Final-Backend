import { ArunaClient, IMessage } from 'arunacore-api';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true, override: false });

const ARUNACORE_HOST = process.env.ARUNACORE_HOST || 'localhost';
const ARUNACORE_PORT = Number(process.env.ARUNACORE_PORT) || 3000;
const ARUNACORE_ID = process.env.ARUNACORE_ID || 'aps-final-geo-service';

const GEO_API_KEY = process.env.GEO_API_KEY || '';
const BASE_GEO_API_URL = process.env.BASE_GEO_API_URL || 'https://api.example.com/geo';

const arunaCore = new ArunaClient({
  id: ARUNACORE_ID,
  host: ARUNACORE_HOST,
  port: ARUNACORE_PORT,
});

interface RequestCityInfo {
  action: 'getCityInfo';
  data: {
    city?: string;
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
  if (!requestData.city && !requestData.coords) {
    await message.reply!({ error: 'Parâmetro city ou coords é obrigatório.' });
    return;
  }

  try {
    const queryParam = requestData.city
      ? `q=${encodeURIComponent(requestData.city)},br`
      : `lat=${encodeURIComponent(requestData.coords!.lat)}&lon=${encodeURIComponent(requestData.coords!.lon)}`;
    const response = await fetch(`${BASE_GEO_API_URL}/${requestData.city ? 'direct' : 'reverse'}?${queryParam}&appid=${GEO_API_KEY}`);
    if (!response.ok) {
      await message.reply!({ error: 'Erro ao buscar informações da cidade.' });
      console.error('Erro na resposta da API:', response);
      return;
    }
    let cityInfo = await response.json();

    if (!cityInfo || (Array.isArray(cityInfo) && cityInfo.length === 0)) {
      await message.reply!({ error: 'Cidade não encontrada.' });
      return;
    }

    cityInfo = Array.isArray(cityInfo) ? cityInfo[0] : cityInfo;

    if (cityInfo.local_names) {
      delete cityInfo.local_names;
    }

    await message.reply!({ data: cityInfo });
  } catch (error) {
    console.error('Erro ao buscar informações da cidade:', error);
    await message.reply!({ error: 'Erro ao buscar informações da cidade.' });
  }
});

arunaCore.connect().then(() => {
  console.log('Conectado a ArunaCore com sucesso.');
}).catch((error) => {
  console.error('Erro ao conectar ao ArunaCore:', error);
});
