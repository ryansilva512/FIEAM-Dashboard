## Packages
papaparse | CSV parsing library for the import feature
@types/papaparse | TypeScript types for papaparse
recharts | Charting library for dashboards and analytics
@tanstack/react-table | Headless table library for the data grid
date-fns | Date manipulation and formatting

## Notes
- The app relies on client-side CSV processing using papaparse.
- Data is persisted in localStorage ('dashboard_data') to persist state across reloads.
- Theme classification rules are stored in the backend (Postgres).
- AI Classification uses the OpenAI integration via the backend endpoint /api/ai/classify.
