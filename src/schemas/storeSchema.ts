import { z } from 'zod';

const slugRegex = /^[a-z0-9-]+$/;
const slugMessage =
  'El slug solo puede contener minusculas, numeros y guiones.';
const httpsUrl = z
  .string()
  .url('Debe ser una URL de imagen valida')
  .refine(
    (url) => url.startsWith('https://'),
    'La URL de la imagen debe usar https.',
  );

export const storeCategoryCreateSchema = z.object({
  slug: z
    .string()
    .min(2, 'El slug debe tener al menos 2 caracteres.')
    .max(80, 'El slug no puede superar los 80 caracteres.')
    .regex(slugRegex, slugMessage),
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(80, 'El nombre no puede superar los 80 caracteres.'),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const storeCategoryUpdateSchema = storeCategoryCreateSchema
  .omit({ slug: true })
  .partial();

export const storeVariantSchema = z.object({
  id: z
    .string()
    .min(1, 'El id de la variante es obligatorio.')
    .max(40, 'El id de la variante no puede superar los 40 caracteres.')
    .regex(slugRegex, slugMessage),
  label: z
    .string()
    .min(1, 'La etiqueta de la variante es obligatoria.')
    .max(80, 'La etiqueta de la variante no puede superar los 80 caracteres.'),
  priceCents: z
    .number()
    .int()
    .min(0, 'El precio de la variante no puede ser negativo.'),
});

export const storeProductCreateSchema = z.object({
  slug: z
    .string()
    .min(2, 'El slug debe tener al menos 2 caracteres.')
    .max(120, 'El slug no puede superar los 120 caracteres.')
    .regex(slugRegex, slugMessage),
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(120, 'El nombre no puede superar los 120 caracteres.'),
  description: z
    .string()
    .min(1, 'La descripcion es obligatoria.')
    .max(2000, 'La descripcion no puede superar los 2000 caracteres.'),
  priceCents: z
    .number()
    .int()
    .min(0, 'El precio no puede ser negativo.')
    .max(100000000, 'El precio excede el maximo permitido.'),
  categoryId: z.number().int().positive('El id de la categoria no es valido.'),
  images: z
    .array(httpsUrl)
    .max(10, 'No puede haber mas de 10 imagenes.')
    .default([]),
  variants: z
    .array(storeVariantSchema)
    .min(1, 'Debe haber al menos una variante.')
    .max(20, 'No puede haber mas de 20 variantes.')
    .refine(
      (variants) => new Set(variants.map((v) => v.id)).size === variants.length,
      'Los ids de las variantes deben ser unicos.',
    ),
  soldOut: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const storeProductUpdateSchema = storeProductCreateSchema
  .omit({ slug: true })
  .partial();

export const storeSoldOutSchema = z.object({
  soldOut: z.boolean(),
});

export type StoreCategoryCreateDto = z.infer<typeof storeCategoryCreateSchema>;
export type StoreCategoryUpdateDto = z.infer<typeof storeCategoryUpdateSchema>;
export type StoreVariantDto = z.infer<typeof storeVariantSchema>;
export type StoreProductCreateDto = z.infer<typeof storeProductCreateSchema>;
export type StoreProductUpdateDto = z.infer<typeof storeProductUpdateSchema>;
export type StoreSoldOutDto = z.infer<typeof storeSoldOutSchema>;
