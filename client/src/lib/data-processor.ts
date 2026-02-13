import Papa from "papaparse";
import { type ServiceCall, type ThemeRule } from "@shared/schema";
import { differenceInMinutes, parseISO, format, getISOWeek } from "date-fns";

export interface ProcessingOptions {
  themeRules: ThemeRule[];
}

export async function parseAndProcessCSV(
  file: File,
  options: ProcessingOptions
): Promise<ServiceCall[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const processedData = results.data.map((row: any) => processRow(row, options.themeRules));
          // Filter out nulls (failed rows)
          const validData = processedData.filter((item): item is ServiceCall => item !== null);
          resolve(validData);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}

function processRow(row: any, rules: ThemeRule[]): ServiceCall | null {
  try {
    // Basic Validation - Check required fields
    if (!row.id || !row.dataHoraInicio || !row.dataHoraFim) {
      console.warn("Skipping invalid row:", row);
      return null;
    }

    const start = parseISO(row.dataHoraInicio);
    const end = parseISO(row.dataHoraFim);
    const duration = differenceInMinutes(end, start);
    
    // Safety check for invalid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn("Invalid date in row:", row);
      return null;
    }

    const summary = row.resumoConversa || "";
    const tema = classifyTheme(summary, rules);

    const house = row.casa || "Unknown";
    const flagFaltaInteracao = house.toLowerCase().includes("falta de interação");

    return {
      id: row.id,
      contato: row.contato || "",
      identificador: row.identificador || "",
      protocolo: row.protocolo || "",
      canal: row.canal || "",
      dataHoraInicio: row.dataHoraInicio,
      dataHoraFim: row.dataHoraFim,
      tipoCanal: row.tipoCanal || "",
      resumoConversa: summary,
      casa: house,
      
      // Calculated Fields
      duracaoMinutos: duration > 0 ? duration : 0,
      data: format(start, "yyyy-MM-dd"),
      hora: start.getHours(),
      diaDaSemana: format(start, "EEEE"), // Monday, Tuesday...
      mes: format(start, "yyyy-MM"),
      semana: getISOWeek(start),
      canalNormalizado: `${row.canal || ""} - ${row.tipoCanal || ""}`,
      flagFaltaInteracao,
      tema,
    };
  } catch (error) {
    console.error("Error processing row:", error, row);
    return null;
  }
}

export function classifyTheme(text: string, rules: ThemeRule[]): string {
  const normalizedText = text.toLowerCase();
  
  for (const rule of rules) {
    if (rule.keywords.some(keyword => normalizedText.includes(keyword.toLowerCase()))) {
      return rule.name;
    }
  }
  
  return "Outros";
}
