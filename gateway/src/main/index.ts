import express from 'express';
import dotenv from 'dotenv';
import { ArunaClient } from 'arunacore-api';

dotenv.config({ path: '.env.local', quiet: true, override: false });

const PORT = Number(process.env.SERVER_PORT) || 3010;
const HOST = process.env.SERVER_IP || 'localhost';
const ARUNACORE_HOST = process.env.ARUNACORE_HOST || 'localhost';
const ARUNACORE_PORT = Number(process.env.ARUNACORE_PORT) || 3000;

const arunaCore = new ArunaClient({
  id: 'aps-final-gateway',
  host: ARUNACORE_HOST,
  port: ARUNACORE_PORT,
});

const app = express();
app.use(express.json());

interface CityData {
  city: string;
  temperature: number;
  humidity: number;
  uvIndex: number;
  condition: '☀️ Ensolarado' | '🌧️ Chuvoso' | '☁️ Nublado' |'🌫️ Neblina';
  windSpeed: number;
  windDirection: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' |'NW';
  airQuality: {
    'pm2_5': number;
    'pm10': number;
    'o3': number;
    'no2': number;
    'so2': number;
    'co': number;
  }
}

app.get('/', (req, res) => {
  res.sendStatus(401);
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.get('/location', async (req, res) => {
  const location: string | undefined = req.query.location as string | undefined;
  const lat: string | undefined = req.query.lat as string | undefined;
  const lon: string | undefined = req.query.lon as string | undefined;

  let coords: { lat: number; lon: number } | undefined = undefined;
  if (lat && lon) {
    coords = { lat: Number(lat), lon: Number(lon) };
  }
  
  if (!location && !coords) {
    return res.status(400).json({ error: 'Parâmetros inválidos. Forneça \'location\' ou \'lat\' e \'lon\'.' });
  }

  const data = await arunaCore.request({
    action: 'getCityInfo',
    data: location ? { location } : { coords },
  }, { target: { id: 'aps-final-geo-service' } });

  const content = data.content as { error?: string, data: any } | undefined;

  if (content && content.error) {
    return res.status(500).json({ error: content.error });
  }

  if (!content || content.data == null) {
    return res.status(404).json({ error: 'Local não encontrado.' });
  }

  return res.json(content.data);
});

app.get('/fetchLocationData', async (req, res) => {
  const { lat, lon } = req.query;
  if ((!lat || !lon) || (isNaN(Number(lat)) || isNaN(Number(lon)))) {
    return res.status(400).json({ error: 'Parâmetros inválidos. Forneça "lat" e "lon".' });
  }

  const weatherData = await arunaCore.request({
    action: 'getWeatherInfo',
    data: {
      coords: {
        lat: Number(lat),
        lon: Number(lon),
      },
    },
  }, { target: { id: 'aps-final-weather-service' } });

  const content = weatherData.content as { error?: string, data: any } | undefined;

  if (content && content.error) {
    return res.status(500).json({ error: content.error });
  }

  if (!content || content.data == null) {
    return res.status(404).json({ error: 'Dados meteorológicos não encontrados.' });
  }

  return res.json(content.data);
});

arunaCore.connect().then(() => {
  console.log('Conectado a ArunaCore com sucesso.');
}).catch((error) => {
  console.error('Erro ao conectar a ArunaCore:', error);
});

app.listen(PORT, HOST, () => {
	console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
