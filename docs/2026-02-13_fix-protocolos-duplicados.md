# Fix: Protocolos Duplicados no Dashboard

**Data:** 13/02/2026

## Problema

Na tabela "Últimos Atendimentos Finalizados" do dashboard, alguns protocolos apareciam duplicados (mesma linha repetida 2+ vezes). Isso ocorria porque o banco de dados possuía registros repetidos com o mesmo número de protocolo.

## Alterações Realizadas

### Arquivo: `server/routes.ts`

#### 1. Endpoint `/api/recentes` — Deduplicação na tabela

**Antes:** `SELECT ... FROM tabela WHERE ... ORDER BY ...` (retornava todas as linhas, incluindo duplicatas).

**Depois:** Utiliza um `INNER JOIN` com subquery que agrupa por `protocolo` e pega apenas o `MAX(id)` de cada grupo, garantindo um único registro por protocolo:

```sql
SELECT t.*
FROM `base senai` t
INNER JOIN (
  SELECT MAX(id) AS max_id
  FROM `base senai`
  WHERE `data e hora de fim` IS NOT NULL
  GROUP BY protocolo
) latest ON t.id = latest.max_id
ORDER BY t.`data e hora de fim` DESC
```

#### 2. Endpoint `/api/stats` — Contagem de protocolos distintos

Todas as queries de estatísticas foram atualizadas de `COUNT(*)` para `COUNT(DISTINCT protocolo)`:

- **Total de atendimentos** (`total`, `hoje`, `semana`, `mes`)
- **Atendimentos por canal** (`porCanal`)
- **Atendimentos por casa** (`porCasa`)
- **Atendimentos por resumo da conversa** (`porResumo`)
- **Timeline de volume** (`timeline`)

Isso evita que protocolos duplicados inflem os números nos cards e gráficos do dashboard.

#### 3. Endpoint `/api/protocolo/:protocolo` — Resultado único

**Antes:** `LIMIT 10` (poderia retornar várias linhas do mesmo protocolo).

**Depois:** `ORDER BY id DESC LIMIT 1` (retorna apenas o registro mais recente daquele protocolo).

## Impacto

- A tabela de atendimentos recentes agora exibe cada protocolo apenas uma vez.
- Os cards de métricas (Total, Hoje, Mês, Duração Média) refletem contagens sem duplicatas.
- Os gráficos (por Canal, por Casa, Timeline, Resumo) ficam mais precisos.
- A busca por protocolo retorna um único resultado.

