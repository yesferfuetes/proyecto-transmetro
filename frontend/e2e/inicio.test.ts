import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { contrasenaSembrada, iniciarSesion, SUPERVISOR } from './usuarios/apoyo';

const MOVIL = { width: 390, height: 844 };
const ESCRITORIO = { width: 1280, height: 800 };

async function violacionesGraves(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations
    .filter((violacion) => violacion.impact === 'serious' || violacion.impact === 'critical')
    .map((violacion) => `${violacion.id}: ${violacion.nodes.map((n) => n.target).join(', ')}`);
}

function navegacion(page: Page): ReturnType<Page['getByRole']> {
  return page.getByRole('navigation', { name: 'Principal' });
}

// Inicio exige sesión: cada prueba entra como el supervisor sembrado.
test.beforeEach(async ({ page }) => {
  await iniciarSesion(page, SUPERVISOR, contrasenaSembrada());
});

test.describe('Inicio en móvil', () => {
  test.use({ viewport: MOVIL });

  test('muestra los mosaicos y la barra inferior sin desplazamiento horizontal', async ({
    page,
  }) => {
    await page.goto('/inicio');

    await expect(page.getByRole('heading', { level: 1, name: 'Inicio' })).toBeAttached();
    await expect(page.getByRole('link', { name: 'Estaciones' }).first()).toBeVisible();
    const anchoMosaico = await page
      .getByRole('region', { name: 'Accesos rápidos' })
      .getByRole('link', { name: 'Líneas' })
      .evaluate((enlace) => enlace.getBoundingClientRect().width);
    expect(anchoMosaico).toBe(88);
    await expect(navegacion(page)).toHaveCount(1);
    await expect(navegacion(page).getByRole('button', { name: 'Más' })).toBeVisible();

    const anchoDelDocumento = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(anchoDelDocumento).toBeLessThanOrEqual(MOVIL.width);
  });

  test('"Más" abre la hoja con la cuenta y el cierre de sesión, y Esc la cierra', async ({
    page,
  }) => {
    await page.goto('/inicio');

    await navegacion(page).getByRole('button', { name: 'Más' }).click();
    const hoja = page.getByRole('dialog', { name: 'Más opciones' });
    await expect(hoja.getByRole('link', { name: /mi cuenta/ })).toBeVisible();
    await expect(hoja.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(hoja).toBeHidden();
  });

  test('no tiene violaciones de accesibilidad graves ni críticas', async ({ page }) => {
    await page.goto('/inicio');
    expect(await violacionesGraves(page)).toEqual([]);
  });
});

test.describe('Inicio en escritorio', () => {
  test.use({ viewport: ESCRITORIO });

  test('usa la barra lateral y los mosaicos conservan su tamaño', async ({ page }) => {
    await page.goto('/inicio');

    const lateral = navegacion(page);
    await expect(lateral).toHaveCount(1);
    await expect(lateral.getByRole('link', { name: 'Inicio' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(lateral.getByRole('button', { name: 'Más' })).toHaveCount(0);

    // Desde 1280 px rige el tamaño grande del mosaico; todos miden lo mismo y no se estiran.
    const mosaicos = page.getByRole('region', { name: 'Accesos rápidos' }).getByRole('link');
    const anchos = await mosaicos.evaluateAll((enlaces) =>
      enlaces.map((enlace) => enlace.getBoundingClientRect().width),
    );
    expect(anchos).toHaveLength(8);
    expect(new Set(anchos)).toEqual(new Set([104]));
  });

  test('no tiene violaciones de accesibilidad graves ni críticas', async ({ page }) => {
    await page.goto('/inicio');
    expect(await violacionesGraves(page)).toEqual([]);
  });

  test('se recorre con teclado y el foco siempre es visible', async ({ page }) => {
    await page.goto('/inicio');
    // Una pulsación antes de hidratar puede perder el foco; se espera a que React tome el <main>.
    await page.waitForFunction(() => {
      const principal = document.querySelector('main');
      return (
        principal !== null && Object.keys(principal).some((clave) => clave.startsWith('__react'))
      );
    });

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main#contenido')).toBeFocused();

    // Tras el contenido principal, el foco recorre los mosaicos de Inicio.
    const mosaicos = await page
      .getByRole('region', { name: 'Accesos rápidos' })
      .getByRole('link')
      .count();
    for (let paso = 0; paso < mosaicos; paso += 1) {
      await page.keyboard.press('Tab');
      const anillo = await page.evaluate(() => {
        const elemento = document.activeElement;
        if (!elemento || elemento === document.body) {
          return 'none';
        }
        const destino = elemento.querySelector('span') ?? elemento;
        const estilo = getComputedStyle(elemento);
        const estiloInterno = getComputedStyle(destino);
        return [estilo.boxShadow, estiloInterno.boxShadow, estilo.outlineStyle].join(' ');
      });
      expect(anillo).not.toBe('none none none');
      expect(anillo).toMatch(/rgb|solid|auto/);
    }
  });
});

test.describe('Inicio con movimiento reducido', () => {
  test.use({ viewport: ESCRITORIO });

  test('no hay animaciones en la página', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/inicio');

    const animados = await page.evaluate(
      () =>
        [...document.querySelectorAll('*')].filter(
          (elemento) => getComputedStyle(elemento).animationName !== 'none',
        ).length,
    );
    expect(animados).toBe(0);
  });
});
