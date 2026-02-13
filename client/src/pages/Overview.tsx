import { Layout } from "@/components/layout/Layout";
import { useDashboard } from "@/store/dashboard-context";
import { StatCard } from "@/components/ui/stat-card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Clock, AlertTriangle, Hash } from "lucide-react";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";

export default function OverviewPage() {
  const { filteredData, isLoading } = useDashboard();

  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const totalCalls = filteredData.length;
    const avgDuration = filteredData.reduce((acc, curr) => acc + curr.duracaoMinutos, 0) / totalCalls;
    const noInteractionCount = filteredData.filter(d => d.flagFaltaInteracao).length;
    const noInteractionRate = (noInteractionCount / totalCalls) * 100;

    // Group by Date for Timeline
    const callsByDate = filteredData.reduce((acc, curr) => {
      acc[curr.data] = (acc[curr.data] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const timelineData = Object.entries(callsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group by Channel
    const callsByChannel = filteredData.reduce((acc, curr) => {
      acc[curr.canalNormalizado] = (acc[curr.canalNormalizado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const channelData = Object.entries(callsByChannel)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Group by Theme
    const callsByTheme = filteredData.reduce((acc, curr) => {
      const theme = curr.tema || "Unknown";
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const themeData = Object.entries(callsByTheme)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 themes

    return { totalCalls, avgDuration, noInteractionCount, noInteractionRate, timelineData, channelData, themeData };
  }, [filteredData]);

  if (isLoading || !stats) return <div className="p-8">Loading analysis...</div>;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <Layout title="Dashboard Overview" subtitle="High-level metrics and performance indicators">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Conversations" 
          value={stats.totalCalls.toLocaleString()} 
          icon={<MessageSquare className="w-4 h-4" />}
          description="calls in selection"
          className="border-l-blue-500"
        />
        <StatCard 
          title="Avg Duration" 
          value={`${stats.avgDuration.toFixed(1)} min`}
          icon={<Clock className="w-4 h-4" />}
          description="average handling time"
          className="border-l-emerald-500"
        />
        <StatCard 
          title="No Interaction" 
          value={stats.noInteractionCount.toLocaleString()} 
          icon={<AlertTriangle className="w-4 h-4" />}
          description={`${stats.noInteractionRate.toFixed(1)}% of total calls`}
          className="border-l-amber-500"
          trend="down"
          trendValue="Needs Attention"
        />
        <StatCard 
          title="Active Channels" 
          value={stats.channelData.length} 
          icon={<Hash className="w-4 h-4" />}
          description="channels detected"
          className="border-l-purple-500"
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart (Wide) */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Volume Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.timelineData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(parseISO(val), "MMM d")} 
                  stroke="#9ca3af" 
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                  labelFormatter={(label) => format(parseISO(label), "PPP")}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Themes Bar Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Top Themes</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.themeData} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis type="category" dataKey="name" width={100} stroke="#4b5563" fontSize={11} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {stats.themeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Channel Distribution */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Channel Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.channelData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Layout>
  );
}
