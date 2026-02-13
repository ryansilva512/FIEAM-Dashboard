import type { Express } from "express";
import type { Server } from "http";
import pool, { TABLE_NAME } from "./db";
import type { RowDataPacket } from "mysql2";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // GET /api/stats - Metricas agregadas do dashboard
  // Supports optional ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  app.get("/api/stats", async (req, res) => {
    try {
      const conn = await pool.getConnection();

      try {
        const { startDate, endDate } = req.query;

        // Build date filter clause
        let dateFilter = "";
        const dateParams: string[] = [];
        if (startDate && endDate) {
          dateFilter = `AND DATE(\`data e hora de fim\`) >= ? AND DATE(\`data e hora de fim\`) <= ?`;
          dateParams.push(String(startDate), String(endDate));
        }

        // Total de atendimentos filtrado pelo período (contando protocolos distintos)
        const [totals] = await conn.query<RowDataPacket[]>(`
          SELECT
            COUNT(DISTINCT protocolo) AS total,
            COUNT(DISTINCT CASE WHEN DATE(\`data e hora de fim\`) = CURDATE() THEN protocolo END) AS hoje,
            COUNT(DISTINCT CASE WHEN YEARWEEK(\`data e hora de fim\`, 1) = YEARWEEK(CURDATE(), 1) THEN protocolo END) AS semana,
            COUNT(DISTINCT CASE WHEN YEAR(\`data e hora de fim\`) = YEAR(CURDATE()) AND MONTH(\`data e hora de fim\`) = MONTH(CURDATE()) THEN protocolo END) AS mes
          FROM \`${TABLE_NAME}\`
          WHERE \`data e hora de fim\` IS NOT NULL
            ${dateFilter}
        `, dateParams);

        // Duracao media em minutos
        const [avgDuration] = await conn.query<RowDataPacket[]>(`
          SELECT
            ROUND(AVG(TIMESTAMPDIFF(MINUTE, \`data e hora de inicio\`, \`data e hora de fim\`)), 1) AS duracao_media
          FROM \`${TABLE_NAME}\`
          WHERE \`data e hora de fim\` IS NOT NULL
            AND \`data e hora de inicio\` IS NOT NULL
            ${dateFilter}
        `, dateParams);

        // Atendimentos por canal (protocolos distintos)
        const [porCanal] = await conn.query<RowDataPacket[]>(`
          SELECT
            canal AS nome,
            COUNT(DISTINCT protocolo) AS total
          FROM \`${TABLE_NAME}\`
          WHERE \`data e hora de fim\` IS NOT NULL
            ${dateFilter}
          GROUP BY canal
          ORDER BY total DESC
        `, dateParams);

        // Atendimentos por casa (protocolos distintos) — COALESCE empty/null to 'Falta de Interação'
        const [porCasa] = await conn.query<RowDataPacket[]>(`
          SELECT
            COALESCE(NULLIF(TRIM(casa), ''), 'Falta de Interação') AS nome,
            COUNT(DISTINCT protocolo) AS total
          FROM \`${TABLE_NAME}\`
          WHERE \`data e hora de fim\` IS NOT NULL
            ${dateFilter}
          GROUP BY nome
          ORDER BY total DESC
          LIMIT 10
        `, dateParams);

        // Atendimentos por resumo da conversa (protocolos distintos)
        const [porResumo] = await conn.query<RowDataPacket[]>(`
          SELECT
            \`resumo da conversa\` AS nome,
            COUNT(DISTINCT protocolo) AS total
          FROM \`${TABLE_NAME}\`
          WHERE \`data e hora de fim\` IS NOT NULL
            AND \`resumo da conversa\` IS NOT NULL
            AND \`resumo da conversa\` != ''
            ${dateFilter}
          GROUP BY \`resumo da conversa\`
          ORDER BY total DESC
          LIMIT 10
        `, dateParams);

        // Volume ao longo do tempo (filtered by date range or last 30 days)
        let timelineFilter = dateFilter;
        const timelineParams = [...dateParams];
        if (!startDate || !endDate) {
          timelineFilter = `AND \`data e hora de fim\` >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
        }

        const [timeline] = await conn.query<RowDataPacket[]>(`
          SELECT
            DATE(\`data e hora de fim\`) AS data,
            COUNT(DISTINCT protocolo) AS total
          FROM \`${TABLE_NAME}\`
          WHERE \`data e hora de fim\` IS NOT NULL
            ${timelineFilter}
          GROUP BY DATE(\`data e hora de fim\`)
          ORDER BY data ASC
        `, timelineParams);

        conn.release();

        res.json({
          totais: totals[0] || { total: 0, hoje: 0, semana: 0, mes: 0 },
          duracaoMedia: avgDuration[0]?.duracao_media || 0,
          porCanal: porCanal || [],
          porCasa: porCasa || [],
          porResumo: porResumo || [],
          timeline: timeline || [],
        });
      } catch (queryErr) {
        conn.release();
        throw queryErr;
      }
    } catch (error) {
      console.error("Erro ao buscar stats:", error);
      res.status(500).json({ message: "Erro ao buscar estatisticas do dashboard" });
    }
  });

  // GET /api/recentes - Ultimos atendimentos finalizados (sem duplicatas de protocolo)
  app.get("/api/recentes", async (req, res) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT
          t.id,
          t.contato,
          t.identificador,
          t.protocolo,
          t.canal,
          t.\`data e hora de inicio\` AS dataHoraInicio,
          t.\`data e hora de fim\` AS dataHoraFim,
          t.\`tipo de canal\` AS tipoCanal,
          t.\`resumo da conversa\` AS resumoConversa,
          COALESCE(NULLIF(TRIM(t.casa), ''), 'Falta de Interação') AS casa
        FROM \`${TABLE_NAME}\` t
        INNER JOIN (
          SELECT MAX(id) AS max_id
          FROM \`${TABLE_NAME}\`
          WHERE \`data e hora de fim\` IS NOT NULL
          GROUP BY protocolo
        ) latest ON t.id = latest.max_id
        ORDER BY t.\`data e hora de fim\` DESC
      `);

      res.json(rows);
    } catch (error) {
      console.error("Erro ao buscar recentes:", error);
      res.status(500).json({ message: "Erro ao buscar atendimentos recentes" });
    }
  });

  // GET /api/protocolo/:protocolo - Busca por protocolo (sem duplicatas)
  app.get("/api/protocolo/:protocolo", async (req, res) => {
    try {
      const { protocolo } = req.params;

      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT
          id,
          contato,
          identificador,
          protocolo,
          canal,
          \`data e hora de inicio\` AS dataHoraInicio,
          \`data e hora de fim\` AS dataHoraFim,
          \`tipo de canal\` AS tipoCanal,
          \`resumo da conversa\` AS resumoConversa,
          COALESCE(NULLIF(TRIM(casa), ''), 'Falta de Interação') AS casa
        FROM \`${TABLE_NAME}\`
        WHERE protocolo = ?
        ORDER BY id DESC
        LIMIT 1
      `, [protocolo]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Protocolo nao encontrado" });
      }

      res.json(rows);
    } catch (error) {
      console.error("Erro ao buscar protocolo:", error);
      res.status(500).json({ message: "Erro ao buscar protocolo" });
    }
  });

  return httpServer;
}
