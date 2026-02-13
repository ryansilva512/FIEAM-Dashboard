import { Layout } from "@/components/layout/Layout";
import { useDashboard } from "@/store/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from "recharts";
import { useMemo } from "react";

export default function TimeAnalysisPage() {
  const { filteredData } = useDashboard();

  const heatmapData = useMemo(() => {
    // 0 = Sunday, 1 = Monday, etc.
    // Hours: 0-23
    const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));

    filteredData.forEach(item => {
      const date = new Date(item.dataHoraInicio);
      const day = date.getDay(); // 0-6
      const hour = date.getHours(); // 0-23
      matrix[day][hour]++;
    });

    const data: { day: number; hour: number; value: number }[] = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    matrix.forEach((hours, dayIndex) => {
      hours.forEach((count, hourIndex) => {
        if (count > 0) {
          data.push({
            day: dayIndex,
            hour: hourIndex,
            value: count
          });
        }
      });
    });

    return { data, days };
  }, [filteredData]);

  // Color scale function
  const getColor = (value: number, max: number) => {
    const intensity = value / max;
    // Blue scale
    return `rgba(59, 130, 246, ${Math.max(0.2, intensity)})`;
  };

  const maxValue = Math.max(...heatmapData.data.map(d => d.value), 1);

  return (
    <Layout title="Time Analysis" subtitle="Patterns by Day of Week and Hour of Day">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis 
                type="number" 
                dataKey="hour" 
                name="Hour" 
                domain={[0, 23]} 
                tickCount={24}
                tickFormatter={(val) => `${val}:00`}
                label={{ value: "Hour of Day", position: "insideBottom", offset: -10 }}
              />
              <YAxis 
                type="number" 
                dataKey="day" 
                name="Day" 
                domain={[0, 6]} 
                tickCount={7}
                tickFormatter={(val) => heatmapData.days[val]}
                reversed
              />
              <ZAxis type="number" dataKey="value" range={[50, 500]} name="Volume" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border p-2 rounded shadow text-sm">
                        <p className="font-semibold">{heatmapData.days[data.day]} at {data.hour}:00</p>
                        <p>Volume: {data.value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={heatmapData.data} shape="circle">
                {heatmapData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.value, maxValue)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Layout>
  );
}
