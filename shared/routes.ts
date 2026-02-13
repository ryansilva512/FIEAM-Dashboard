import { z } from 'zod';
import { insertThemeRuleSchema, themeRules } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  themeRules: {
    list: {
      method: 'GET' as const,
      path: '/api/theme-rules' as const,
      responses: {
        200: z.array(z.custom<typeof themeRules.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/theme-rules' as const,
      input: insertThemeRuleSchema,
      responses: {
        201: z.custom<typeof themeRules.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/theme-rules/:id' as const,
      input: insertThemeRuleSchema.partial(),
      responses: {
        200: z.custom<typeof themeRules.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/theme-rules/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  ai: {
    classify: {
      method: 'POST' as const,
      path: '/api/ai/classify' as const,
      input: z.object({
        text: z.string(),
        themes: z.array(z.string()).optional(), // Optional list of themes to choose from
      }),
      responses: {
        200: z.object({
          theme: z.string(),
          confidence: z.number().optional(),
        }),
        500: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
