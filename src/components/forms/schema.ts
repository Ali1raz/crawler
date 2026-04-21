import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Not a valid email.' }),
  password: z.string().min(8, { message: 'Password should be 8 chars long.' }),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email({ message: 'Not a valid email.' }),
  password: z.string().min(8, { message: 'Password should be 8 chars long.' }),
  name: z.string().min(1, { message: 'Name is required.' }),
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;

// =========

export const singleUrlImportSchema = z.object({
  url: z.url('Please enter a valid URL'),
});
export type SingleUrlImportSchemaType = z.infer<typeof singleUrlImportSchema>;

export const bulkImportSchema = z.object({
  url: z.url('Please enter a valid URL'),
  searchQuery: z.string(),
});

export type BulkImportSchemaType = z.infer<typeof bulkImportSchema>;

// ================

export const extractSchema = z.object({
  author: z.string().nullable(),
  publishedAt: z.string().nullable(),
});

export type ExtractSchemaType = z.infer<typeof extractSchema>;

// =================

export const discoverSchema = z.object({
  query: z.string().min(3),
});

export type DiscoverSchemaType = z.infer<typeof discoverSchema>;
