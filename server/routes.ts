import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Theme Rules API
  app.get(api.themeRules.list.path, async (req, res) => {
    const rules = await storage.getThemeRules();
    res.json(rules);
  });

  app.post(api.themeRules.create.path, async (req, res) => {
    try {
      const input = api.themeRules.create.input.parse(req.body);
      const rule = await storage.createThemeRule(input);
      res.status(201).json(rule);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.themeRules.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.themeRules.update.input.parse(req.body);
      const updated = await storage.updateThemeRule(id, input);
      if (!updated) {
        return res.status(404).json({ message: "Rule not found" });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.themeRules.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteThemeRule(id);
    res.status(204).send();
  });

  // AI Classification Endpoint
  app.post(api.ai.classify.path, async (req, res) => {
    try {
      const { text, themes } = req.body;
      
      const systemPrompt = themes 
        ? `You are a helpful assistant that classifies customer service conversation summaries into one of the following themes: ${themes.join(", ")}. Return only the theme name. If none match, return "Outros".`
        : `You are a helpful assistant that classifies customer service conversation summaries into a short, concise theme (1-3 words). Return only the theme name.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Summary: ${text}` },
        ],
        max_completion_tokens: 50,
      });

      const theme = response.choices[0].message.content?.trim() || "Outros";
      res.json({ theme });
    } catch (error) {
      console.error("AI Classification error:", error);
      res.status(500).json({ message: "Failed to classify text" });
    }
  });

  // Seed default rules if empty
  const rules = await storage.getThemeRules();
  if (rules.length === 0) {
    await storage.createThemeRule({ name: "Matrícula", keywords: ["matrícula", "inscrição", "matricular"] });
    await storage.createThemeRule({ name: "Valores", keywords: ["valor", "preço", "mensalidade", "custo", "pagamento"] });
    await storage.createThemeRule({ name: "Cursos", keywords: ["curso", "turma", "horário", "grade", "disciplina"] });
    await storage.createThemeRule({ name: "Documentos", keywords: ["certificado", "declaração", "diploma", "documento"] });
  }

  return httpServer;
}
