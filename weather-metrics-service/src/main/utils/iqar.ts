import { AirQualityComponents } from '../types';

export type IQArCategory = 'Boa' | 'Moderada' | 'Ruim' | 'Muito Ruim' | 'Péssima';

export interface IQArResult {
  mainPollutant: string;
  index: number;
  category: IQArCategory;
}

export function calculateIQAr(components: AirQualityComponents): IQArResult {
  const limites: Record<string, { range: [number, number][], iq: [number, number][] }> = {
    pm10: {
      range: [
        [0, 50], [51, 100], [101, 150], [151, 250], [251, 600]
      ],
      iq: [
        [0, 40], [41, 80], [81, 120], [121, 200], [201, 300]
      ]
    },
    pm2_5: {
      range: [
        [0, 25], [26, 50], [51, 75], [76, 125], [126, 250]
      ],
      iq: [
        [0, 40], [41, 80], [81, 120], [121, 200], [201, 300]
      ]
    },
    o3: {
      range: [
        [0, 100], [101, 130], [131, 160], [161, 200], [201, 800]
      ],
      iq: [
        [0, 40], [41, 80], [81, 120], [121, 200], [201, 300]
      ]
    },
    co: {
      range: [
        [0, 9000], [9001, 11000], [11001, 13000], [13001, 15000], [15001, 30000]
      ],
      iq: [
        [0, 40], [41, 80], [81, 120], [121, 200], [201, 300]
      ]
    },
    no2: {
      range: [
        [0, 100], [101, 240], [241, 320], [321, 1130], [1131, 2260]
      ],
      iq: [
        [0, 40], [41, 80], [81, 120], [121, 200], [201, 300]
      ]
    },
    so2: {
      range: [
        [0, 20], [21, 40], [41, 365], [366, 800], [801, 1600]
      ],
      iq: [
        [0, 40], [41, 80], [81, 120], [121, 200], [201, 300]
      ]
    }
  };

  const calculateIndex = (pollutant: string, value: number): number => {
    const { range, iq } = limites[pollutant];
    for (let i = 0; i < range.length; i++) {
      const [cLow, cHigh] = range[i];
      const [iLow, iHigh] = iq[i];
      if (value >= cLow && value <= cHigh) {
        return iLow + ((value - cLow) * (iHigh - iLow)) / (cHigh - cLow);
      }
    }
    return 300; // acima do limite → Péssima
  };

  const indexes: Record<string, number> = {};
  for (const pollutant of Object.keys(limites)) {
    const value = (components as any)[pollutant];
    if (value !== undefined) {
      indexes[pollutant] = calculateIndex(pollutant, value);
    }
  }

  const [mainPollutant, index] = Object.entries(indexes).reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    ['', 0]
  );

  let category: IQArCategory;
  if (index <= 40) category = 'Boa';
  else if (index <= 80) category = 'Moderada';
  else if (index <= 120) category = 'Ruim';
  else if (index <= 200) category = 'Muito Ruim';
  else category = 'Péssima';

  return { mainPollutant, index: Math.round(index), category };
}

/**
 * Opcional: gera uma descrição textual para exibir no frontend
 */
export function descIQAr(categoria: IQArCategory): string {
  switch (categoria) {
    case 'Boa': return 'A qualidade do ar está boa, adequada para todas as atividades.';
    case 'Moderada': return 'A qualidade do ar é aceitável, mas grupos sensíveis devem ter cautela.';
    case 'Ruim': return 'A qualidade do ar está ruim, evite longas exposições ao ar livre.';
    case 'Muito Ruim': return 'A qualidade do ar está muito ruim, evite atividades físicas externas.';
    case 'Péssima': return 'A qualidade do ar está péssima, permaneça em ambientes fechados.';
  }
}
