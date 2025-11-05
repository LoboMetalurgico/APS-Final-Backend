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

app.get('/city', async (req, res) => {
  const city: string | undefined = req.query.city as string | undefined;
  const lat: string | undefined = req.query.lat as string | undefined;
  const lon: string | undefined = req.query.lon as string | undefined;

  let coords: { lat: number; lon: number } | undefined = undefined;
  if (lat && lon) {
    coords = { lat: Number(lat), lon: Number(lon) };
  }
  
  if (!city && !coords) {
    return res.status(400).json({ error: 'Parâmetros inválidos. Forneça "city" ou "coords".' });
  }

  const data = await arunaCore.request({
    action: 'getCityInfo',
    data: city ? { city } : { coords },
  }, { target: { id: 'aps-final-geo-service' } }).then((response: any) => {
    return response;
  });

  const content = data.content;

  if (!content) {
    return res.status(404).json({ error: 'Cidade não encontrada.' });
  }

  if (content.error) {
    return res.status(500).json({ error: content.error });
  }

  return res.json(content.data);
});

app.get('/fetchCityData', (req, res) => {
  res.json({ data: 'Sample City Data' });
});

arunaCore.connect().then(() => {
  console.log('Conectado a ArunaCore com sucesso.');
}).catch((error) => {
  console.error('Erro ao conectar ao ArunaCore:', error);
});

app.listen(PORT, HOST, () => {
	console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
