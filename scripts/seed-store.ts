// Seed de la tienda (categorías y productos) desde el catálogo de demostración.
// Datos copiados literalmente de LearningAstro/src/data/catalog.ts (PLACEHOLDER).
// Idempotente: upsert por slug. En update solo se tocan campos del catálogo;
// soldOut y active NO se sobrescriben (los gestiona el admin).
//
// Uso: npm run seed:store

import { prisma } from '../src/utils/prisma.utils';

type SeedCategory = {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
};

type SeedVariant = {
  id: string;
  label: string;
  priceCents: number;
};

type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  priceCents: number;
  images: string[];
  variants: SeedVariant[];
};

const categories: SeedCategory[] = [
  {
    slug: 'figuras',
    name: 'Figuras',
    description: 'Miniaturas y figuras de ejemplo.',
    sortOrder: 0,
  },
  {
    slug: 'funcionales',
    name: 'Funcionales',
    description: 'Piezas útiles para el día a día. Ejemplo.',
    sortOrder: 1,
  },
  {
    slug: 'decoracion',
    name: 'Decoración',
    description: 'Lámparas y objetos para el hogar. Ejemplo.',
    sortOrder: 2,
  },
];

// Variantes con precio absoluto, igual que src/data/catalog.ts (pricing.ts usa variant.priceCents).
const products: SeedProduct[] = [
  {
    slug: 'figura-explorador',
    name: 'Figura explorador',
    description: 'Producto de ejemplo. Figura impresa en 3D, pintable.',
    categorySlug: 'figuras',
    priceCents: 4500,
    images: ['/products/figura-explorador.svg'],
    variants: [
      { id: 'fe-arena', label: 'Arena', priceCents: 4500 },
      { id: 'fe-terracota', label: 'Terracota', priceCents: 4500 },
    ],
  },
  {
    slug: 'figura-gato-azotea',
    name: 'Gato de azotea',
    description: 'Producto de ejemplo. Figura pequeña de ejemplo.',
    categorySlug: 'figuras',
    priceCents: 3500,
    images: ['/products/gato-azotea.svg'],
    variants: [
      { id: 'ga-pla', label: 'PLA', priceCents: 3500 },
      { id: 'ga-petg', label: 'PETG', priceCents: 4200 },
    ],
  },
  {
    slug: 'figura-robot',
    name: 'Robot de ejemplo',
    description: 'Producto de ejemplo. Figura articulada de ejemplo.',
    categorySlug: 'figuras',
    priceCents: 6800,
    images: ['/products/robot.svg'],
    variants: [{ id: 'rb-gris', label: 'Gris', priceCents: 6800 }],
  },
  {
    slug: 'soporte-celular',
    name: 'Soporte para celular',
    description: 'Producto de ejemplo. Soporte de escritorio impreso en 3D.',
    categorySlug: 'funcionales',
    priceCents: 2500,
    images: ['/products/soporte.svg'],
    variants: [
      { id: 'sc-negro', label: 'Negro', priceCents: 2500 },
      { id: 'sc-blanco', label: 'Blanco', priceCents: 2500 },
    ],
  },
  {
    slug: 'organizador-cables',
    name: 'Organizador de cables',
    description: 'Producto de ejemplo. Clips para cables de escritorio.',
    categorySlug: 'funcionales',
    priceCents: 1800,
    images: ['/products/organizador.svg'],
    variants: [
      { id: 'oc-pack4', label: 'Pack de 4', priceCents: 1800 },
      { id: 'oc-pack8', label: 'Pack de 8', priceCents: 3200 },
    ],
  },
  {
    slug: 'maceta-modular',
    name: 'Maceta modular',
    description: 'Producto de ejemplo. Maceta con drenaje, apilable.',
    categorySlug: 'funcionales',
    priceCents: 3000,
    images: ['/products/maceta.svg'],
    variants: [
      { id: 'mm-s', label: 'Chica', priceCents: 3000 },
      { id: 'mm-m', label: 'Mediana', priceCents: 4500 },
    ],
  },
  {
    slug: 'lampara-atardecer',
    name: 'Lámpara atardecer',
    description: 'Producto de ejemplo. Lámpara de mesa con difusor.',
    categorySlug: 'decoracion',
    priceCents: 8900,
    images: ['/products/lampara.svg'],
    variants: [
      { id: 'la-terracota', label: 'Terracota', priceCents: 8900 },
      { id: 'la-cal', label: 'Cal', priceCents: 8900 },
    ],
  },
  {
    slug: 'macetero-cuerda',
    name: 'Macetero colgante',
    description: 'Producto de ejemplo. Macetero para colgar en balcón.',
    categorySlug: 'decoracion',
    priceCents: 3900,
    images: ['/products/macetero.svg'],
    variants: [{ id: 'mc-pla', label: 'PLA', priceCents: 3900 }],
  },
];

async function main(): Promise<void> {
  const categoryIds = new Map<string, number>();

  for (const c of categories) {
    const row = await prisma.storeCategory.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        sortOrder: c.sortOrder,
      },
      create: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        sortOrder: c.sortOrder,
      },
    });
    categoryIds.set(c.slug, row.id);
  }

  for (const p of products) {
    const categoryId = categoryIds.get(p.categorySlug);
    if (categoryId === undefined) {
      throw new Error(
        `Unknown categorySlug "${p.categorySlug}" for product "${p.slug}"`,
      );
    }

    // Campos del catálogo. soldOut/active solo en create (defaults: false/true).
    const catalogFields = {
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      categoryId,
      images: p.images,
      variants: p.variants,
    };

    await prisma.storeProduct.upsert({
      where: { slug: p.slug },
      update: catalogFields,
      create: { slug: p.slug, ...catalogFields, soldOut: false, active: true },
    });
  }

  console.log(
    `Seed OK: ${categories.length} categorías, ${products.length} productos.`,
  );
}

main()
  .catch((err: unknown) => {
    console.error('Seed de tienda falló:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
