import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const themeRules = pgTable("theme_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  keywords: text("keywords").array().notNull(), // Array of keywords
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertThemeRuleSchema = createInsertSchema(themeRules).omit({
  id: true,
  createdAt: true,
});

export type ThemeRule = typeof themeRules.$inferSelect;
export type InsertThemeRule = z.infer<typeof insertThemeRuleSchema>;

// Types for the frontend (CSV Data)
// These are not in the DB, but shared for consistency
export const serviceCallSchema = z.object({
  id: z.string(),
  contato: z.string(),
  identificador: z.string(),
  protocolo: z.string(),
  canal: z.string(),
  dataHoraInicio: z.string(), // ISO string
  dataHoraFim: z.string(), // ISO string
  tipoCanal: z.string(),
  resumoConversa: z.string(),
  casa: z.string(),
  // Calculated fields
  duracaoMinutos: z.number(),
  data: z.string(),
  hora: z.number(),
  diaDaSemana: z.string(),
  mes: z.string(),
  semana: z.number(),
  canalNormalizado: z.string(),
  flagFaltaInteracao: z.boolean(),
  tema: z.string().optional(),
});

export type ServiceCall = z.infer<typeof serviceCallSchema>;

export * from "./models/chat";
