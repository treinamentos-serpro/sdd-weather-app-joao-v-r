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
        timezone: 'Europe/Lisbon',
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
  const currentWeather = page.getByRole('region', { name: 'Lisboa' });

  const forecastRegion = page.getByRole('region', {
    name: 'Previsão para os próximos dias',
  });
  await expect(forecastRegion).toBeVisible();
  await expect(forecastRegion.getByRole('article')).toHaveCount(5);

  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(currentWeather.getByText('32°F', { exact: true })).toBeVisible();
});

test('mostra estado vazio quando o geocoding não retorna results', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: [] }),
    });
  });

  await page.goto('./');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  await expect(page.getByRole('main')).toBeFocused();
});

test('exige seleção quando o geocoding retorna cidades homônimas', async ({ page }) => {
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
          },
          {
            id: 2,
            name: 'Lisboa',
            latitude: -10.05,
            longitude: -48.3,
            country: 'Brasil',
            admin1: 'Tocantins',
          },
        ],
      }),
    });
  });

  let forecastURL = '';
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastURL = route.request().url();
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'America/Araguaina',
        current: { temperature_2m: 20, weather_code: 0 },
        daily: {
          time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
          temperature_2m_min: [15, 15, 15, 15, 15],
          temperature_2m_max: [25, 25, 25, 25, 25],
          weather_code: [0, 0, 0, 0, 0],
        },
      }),
    });
  });

  await page.goto('./');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const cityOptions = page.getByRole('region', { name: 'Escolha uma cidade' });
  await expect(cityOptions.getByRole('button', { name: 'Lisboa, Portugal' })).toBeVisible();
  await expect(
    cityOptions.getByRole('button', { name: 'Lisboa, Tocantins, Brasil' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lisboa', level: 1 })).toHaveCount(0);

  await cityOptions.getByRole('button', { name: 'Lisboa, Tocantins, Brasil' }).click();

  await expect(page.getByRole('heading', { name: 'Lisboa', level: 1 })).toBeVisible();
  await expect.poll(() => new URL(forecastURL).searchParams.get('latitude')).toBe('-10.05');
  await expect.poll(() => new URL(forecastURL).searchParams.get('longitude')).toBe('-48.3');
});

test('mostra erro amigável quando o forecast tem menos de cinco dias', async ({ page }) => {
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
        timezone: 'Europe/Lisbon',
        current: {},
        daily: { time: ['2026-09-30'] },
      }),
    });
  });

  await page.goto('./');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('alert')).toContainText(
    'A resposta recebida é inválida. Tente novamente.',
  );
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
});

test('busca e exibe o clima corretamente em viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockSuccessfulWeatherApi(page);

  await page.goto('./');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Lisboa', level: 1 })).toBeVisible();
  const currentWeather = page.getByRole('region', { name: 'Lisboa' });
  await expect(currentWeather.getByText('0°C', { exact: true })).toBeVisible();

  const forecastRegion = page.getByRole('region', {
    name: 'Previsão para os próximos dias',
  });
  await expect(forecastRegion).toBeVisible();
  await expect(forecastRegion.getByRole('article')).toHaveCount(5);
});

test('anuncia busy durante loading e foca o main após a busca', async ({ page }) => {
  await mockSuccessfulWeatherApi(page);

  let releaseForecast: (() => void) | undefined;
  const forecastGate = new Promise<void>((resolve) => {
    releaseForecast = resolve;
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await forecastGate;
    await route.fallback();
  });

  await page.goto('./');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const main = page.getByRole('main');
  await expect(main).toHaveAttribute('aria-busy', 'true');
  releaseForecast?.();
  await expect(main).toHaveAttribute('aria-busy', 'false');
  await expect(main).toBeFocused();
});

test('recupera a geocodificação offline ao tentar novamente', async ({ page }) => {
  await mockSuccessfulWeatherApi(page);
  let geocodingAttempts = 0;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    geocodingAttempts += 1;
    if (geocodingAttempts === 1) {
      await route.abort('failed');
      return;
    }

    await route.fallback();
  });

  await page.goto('./');
  const searchInput = page.getByRole('searchbox', { name: 'Cidade' });
  await searchInput.fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('alert')).toContainText(
    'Falha de rede. Verifique sua conexão e tente novamente.',
  );
  await expect(searchInput).toHaveValue('Lisboa');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();

  await expect(page.getByRole('heading', { name: 'Lisboa', level: 1 })).toBeVisible();
  expect(geocodingAttempts).toBe(2);
});

test('repete apenas o forecast após falha HTTP', async ({ page }) => {
  await mockSuccessfulWeatherApi(page);
  let geocodingAttempts = 0;
  let forecastAttempts = 0;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    geocodingAttempts += 1;
    await route.fallback();
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastAttempts += 1;
    if (forecastAttempts === 1) {
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
      return;
    }

    await route.fallback();
  });

  await page.goto('./');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar o clima.');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();

  await expect(page.getByRole('heading', { name: 'Lisboa', level: 1 })).toBeVisible();
  expect(geocodingAttempts).toBe(1);
  expect(forecastAttempts).toBe(2);
});

test('converte timeout em erro recuperável e permite retry', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Timeout real de 10 s somente no Chromium.');
  await mockSuccessfulWeatherApi(page);

  let releaseFirstForecast: (() => void) | undefined;
  let completeFirstRoute: (() => void) | undefined;
  const firstForecastGate = new Promise<void>((resolve) => {
    releaseFirstForecast = resolve;
  });
  const firstRouteCompleted = new Promise<void>((resolve) => {
    completeFirstRoute = resolve;
  });
  let forecastAttempts = 0;
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastAttempts += 1;
    if (forecastAttempts === 1) {
      await firstForecastGate;
      try {
        await route.abort('timedout');
      } catch {
        completeFirstRoute?.();
        return;
      }
      completeFirstRoute?.();
      return;
    }

    await route.fallback();
  });

  await page.goto('./');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('alert')).toContainText('A consulta expirou. Tente novamente.', {
    timeout: 15_000,
  });
  releaseFirstForecast?.();
  await firstRouteCompleted;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();

  await expect(page.getByRole('heading', { name: 'Lisboa', level: 1 })).toBeVisible();
  expect(forecastAttempts).toBe(2);
});

test('mantém os controles e evita overflow nos viewports do plano', async ({ page }) => {
  await page.goto('./');

  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('searchbox', { name: 'Cidade' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Celsius' })).toBeVisible();
    const scrollWidths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(scrollWidths.document).toBeLessThanOrEqual(scrollWidths.viewport);
  }
});
