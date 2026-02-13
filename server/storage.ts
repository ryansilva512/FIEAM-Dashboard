import { db } from "./db";
import {
  themeRules,
  type ThemeRule,
  type InsertThemeRule,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getThemeRules(): Promise<ThemeRule[]>;
  getThemeRule(id: number): Promise<ThemeRule | undefined>;
  createThemeRule(rule: InsertThemeRule): Promise<ThemeRule>;
  updateThemeRule(id: number, updates: Partial<InsertThemeRule>): Promise<ThemeRule>;
  deleteThemeRule(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getThemeRules(): Promise<ThemeRule[]> {
    return await db.select().from(themeRules);
  }

  async getThemeRule(id: number): Promise<ThemeRule | undefined> {
    const [rule] = await db.select().from(themeRules).where(eq(themeRules.id, id));
    return rule;
  }

  async createThemeRule(rule: InsertThemeRule): Promise<ThemeRule> {
    const [newRule] = await db.insert(themeRules).values(rule).returning();
    return newRule;
  }

  async updateThemeRule(id: number, updates: Partial<InsertThemeRule>): Promise<ThemeRule> {
    const [updated] = await db
      .update(themeRules)
      .set(updates)
      .where(eq(themeRules.id, id))
      .returning();
    return updated;
  }

  async deleteThemeRule(id: number): Promise<void> {
    await db.delete(themeRules).where(eq(themeRules.id, id));
  }
}

export const storage = new DatabaseStorage();
