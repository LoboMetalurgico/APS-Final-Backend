import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', quiet: true, override: false });

export interface UVNow {
  time: string;
  uvi: number;
}

export interface UVIndexResponse {
  ok: boolean;
  latitude: number;
  longitude: number;
  now: UVNow;
}

export interface UVProcessed {
  uvi: number;
  level: string;
  description: string;
}

const cache: Map<string, { data: UVProcessed; timestamp: number }> = new Map();
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutos

const UV_API_URL = process.env.UV_API_URL || 'https://currentuvindex.com/api/v1/uvi';

/**
 * Classifica o índice UV segundo a escala da OMS (WHO)
 */
export function classifyUV(uvi: number): UVProcessed {
  let level = '';
  let description = '';

  if (uvi < 3) {
    level = 'Baixo';
    description = 'Nível seguro. É possível ficar ao ar livre sem proteção.';
  } else if (uvi < 6) {
    level = 'Moderado';
    description = 'Use óculos de sol e protetor solar se for ficar muito tempo ao sol.';
  } else if (uvi < 8) {
    level = 'Alto';
    description = 'Evite exposição prolongada. Use chapéu, protetor solar e óculos de sol.';
  } else if (uvi < 11) {
    level = 'Muito Alto';
    description = 'Reduza o tempo ao sol entre 10h e 16h. Proteção é essencial.';
  } else {
    level = 'Extremo';
    description = 'Evite sair sem proteção. Fique em locais cobertos sempre que possível.';
  }

  return { uvi, level, description };
}

/**
 * Verifica se está de noite (antes do nascer ou após o pôr do sol)
 */
function isNightTime(lat: number, lon: number): boolean {
  try {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const declination = 23.44 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
    const hourAngle = Math.acos(
      -Math.tan((lat * Math.PI) / 180) * Math.tan((declination * Math.PI) / 180)
    );

    const daylightHours = (2 * hourAngle * 24) / (2 * Math.PI);
    const localNoon = 12 - lon / 15;
    const sunrise = localNoon - daylightHours / 2;
    const sunset = localNoon + daylightHours / 2;

    const localHour = now.getUTCHours() + lon / 15;
    return localHour < sunrise || localHour > sunset;
  } catch {
    return false;
  }
}

export async function getUVIndex(
  latitude: number,
  longitude: number
): Promise<UVProcessed> {
  const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const now = Date.now();

  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data;
  }

  if (isNightTime(latitude, longitude)) {
    const result = classifyUV(0);
    cache.set(cacheKey, { data: result, timestamp: now });
    return result;
  }

  const endpoint = `${UV_API_URL}?latitude=${latitude}&longitude=${longitude}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Erro ao buscar índice UV: ${response.status} ${response.statusText}`);
  }

  const uvResponse: UVIndexResponse = await response.json();

  const uvi = uvResponse?.now?.uvi ?? 0;
  const result = classifyUV(uvi);

  cache.set(cacheKey, { data: result, timestamp: now });

  return result;
}
