# Melhoria: Filtro de Datas (DateRangePicker)

**Data:** 13/02/2026

## Problema

1. **Navegação entre meses quebrada** — Não era possível voltar para meses anteriores (ex: Janeiro). O componente usava classNames do `react-day-picker` v8, mas o projeto usa v9. As setas de navegação perdiam o estilo e posicionamento, ficando invisíveis ou não-clicáveis.
2. **Layout pouco profissional** — O popover estava simples demais para um dashboard corporativo.

## Causa Raiz

O `react-day-picker` v9 renomeou diversas classes CSS:

| v8 (antigo)             | v9 (novo)          |
|-------------------------|--------------------|
| `nav_button`            | `button_previous` / `button_next` |
| `nav_button_previous`   | `button_previous`  |
| `nav_button_next`       | `button_next`      |
| `table`                 | `month_grid`       |
| `head_row`              | `weekdays`         |
| `head_cell`             | `weekday`          |
| `row`                   | `week`             |
| `cell`                  | `day`              |
| `day`                   | `day_button`       |
| `day_selected`          | `selected`         |
| `day_today`             | `today`            |
| `day_outside`           | `outside`          |
| `day_range_middle`      | `range_middle`     |
| `caption`               | `month_caption`    |

## Alterações Realizadas

### Arquivo: `client/src/components/ui/date-range-picker.tsx`

Reescrita completa do componente:

- **Usa `DayPicker` diretamente** em vez do wrapper `Calendar`, com classNames v9 corretas
- **Navegação entre meses funcional** — controle de `month` + `onMonthChange` permite navegar livremente para qualquer mês/ano
- **2 meses lado a lado** — `numberOfMonths={2}` para visualização profissional
- **10 presets de atalhos** — Hoje, Ontem, Esta semana, Semana passada, Últimos 7 dias, Últimos 30 dias, Este mês, Mês passado, Últimos 3 meses, Este ano
- **Badge de contagem de dias** — Exibe quantos dias estão selecionados no período
- **Header com período completo** — Mostra as datas por extenso no topo
- **Design dark theme profissional** — Cores consistentes com o dashboard (#009FE3 como cor primária), bordas sutis, sombras, hover states suaves
- **Botões de ação melhorados** — "Limpar" com hover vermelho, "Aplicar filtro" com destaque azul e sombra

## Impacto

- O usuário agora consegue navegar para qualquer mês passado ou futuro
- O filtro de datas tem aparência profissional e consistente com o resto do dashboard
- Os atalhos de período são mais abrangentes e práticos

