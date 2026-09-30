import { expect, type Page, test } from '@playwright/test';

async function mockSuccessfulWeatherApi(page: Page) {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 1,
            name: 'Lisboa',
            latitude: 38.72,
            longitude: -9.14,
            country: 'Portugal',
            admin1: 'Lisboa',
          },
        ],
      }),
    });
  });

  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        current: {
          temperature_2m: 0,
          relative_humidity_2m: 60,
          weather_code: 0,
          wind_speed_10m: 5,
          precipitation: 0,
          surface_pressure: 1013,
        },
        daily: {
          time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
          temperature_2m_min: [0, 1, 2, 3, 4],
          temperature_2m_max: [10, 11, 12, 13, 14],
          weather_code: [0, 1, 2, 3, 61],
          precipitation_probability_max: [0, 10, 20, 30, 40],
        },
      }),
    });
  });
}

test('busca uma cidade, exibe cinco dias de previsão e converte para Fahrenheit', async ({
  page,
}) => {
  await mockSuccessfulWeatherApi(page);
  await page.goto('./');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Lisboa', level: 1 })).toBeVisible();

  const forecastRegion = page.getByRole('region', {
    name: 'Previsão para os próximos dias',
  });
  await expect(forecastRegion).toBeVisible();
  await expect(forecastRegion.getByRole('article')).toHaveCount(5);

  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(page.getByText('32°F')).toBeVisible();
});

test('mostra estado vazio quando o geocoding não retorna results', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });

  await page.goto('./');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
});

test('busca e exibe o clima corretamente em viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockSuccessfulWeatherApi(page);

  await page.goto('./');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Lisboa', level: 1 })).toBeVisible();
  await expect(page.getByText('0°C')).toBeVisible();

  const forecastRegion = page.getByRole('region', {
    name: 'Previsão para os próximos dias',
  });
  await expect(forecastRegion).toBeVisible();
  await expect(forecastRegion.getByRole('article')).toHaveCount(5);
});
