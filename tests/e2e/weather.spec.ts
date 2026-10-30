import { expect, test } from '@playwright/test';

test('busca uma cidade, mostra o forecast e converte a temperatura para Fahrenheit', async ({
  page,
}) => {
  const nowEpochSeconds = Math.floor(Date.now() / 1000);
  const firstDay = new Date();
  firstDay.setUTCHours(0, 0, 0, 0);
  const firstDayEpochSeconds = Math.floor(firstDay.getTime() / 1000);

  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get('name')).toBe('São Paulo');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            latitude: -23.55,
            longitude: -46.63,
          },
        ],
      }),
    });
  });

  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get('latitude')).toBe('-23.55');
    expect(url.searchParams.get('longitude')).toBe('-46.63');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'UTC',
        current: {
          time: nowEpochSeconds,
          temperature_2m: 0,
          weather_code: 0,
          relative_humidity_2m: 60,
          wind_speed_10m: 8,
          precipitation: 0,
          surface_pressure: 1013,
        },
        daily: {
          time: Array.from({ length: 5 }, (_, index) => firstDayEpochSeconds + index * 86_400),
          weather_code: [0, 1, 2, 3, 61],
          temperature_2m_min: [-2, -1, 0, 1, 2],
          temperature_2m_max: [0, 1, 2, 3, 4],
          precipitation_probability_max: [0, 10, 20, 40, 80],
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();

  await page.getByRole('button', { name: '°F' }).click();
  await expect(page.getByText('32 °F')).toBeVisible();
});

test('mostra estado vazio quando o geocoding não retorna results', async ({ page }) => {
  let forecastRequestCount = 0;

  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastRequestCount += 1;
    await route.abort();
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Curitiba');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  expect(forecastRequestCount).toBe(0);
});

test('renderiza clima e previsão no viewport mobile 375x812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const firstDayEpoch = Math.floor(today.getTime() / 1000);

  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            latitude: -23.55,
            longitude: -46.63,
          },
        ],
      }),
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'UTC',
        current: {
          time: Math.floor(Date.now() / 1000),
          temperature_2m: 0,
          weather_code: 0,
          relative_humidity_2m: 60,
          wind_speed_10m: 8,
          precipitation: 0,
          surface_pressure: 1013,
        },
        daily: {
          time: Array.from({ length: 5 }, (_, index) => firstDayEpoch + index * 86_400),
          weather_code: [0, 1, 2, 3, 61],
          temperature_2m_min: [-2, -1, 0, 1, 2],
          temperature_2m_max: [0, 1, 2, 3, 4],
          precipitation_probability_max: [0, 10, 20, 40, 80],
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByText('0 °C')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('main')).toHaveCSS('overflow-x', 'visible');
});
