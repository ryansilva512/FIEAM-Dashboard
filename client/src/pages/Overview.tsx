import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, Clock, CalendarDays, TrendingUp, 
  RefreshCw, Users, Building2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";

interface StatsData {
  totais: {
    total: number;
    hoje: number;
    semana: number;
    mes: number;
  };
  duracaoMedia: number;
  porCanal: Array<{ nome: string; total: number }>;
  porCasa: Array<{ nome: string; total: number }>;
  porResumo: Array<{ nome: string; total: number }>;
  timeline: Array<{ data: string; total: number }>;
}

interface Atendimento {
  id: number;
  contato: string;
  identificador: string;
  protocolo: string;
  canal: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  tipoCanal: string;
  resumoConversa: string;
  casa: string;
}

const REFRESH_INTERVAL = 60000; // 60 seconds

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1', '#a855f7', '#06b6d4', '#84cc16', '#d946ef', '#0ea5e9'];

export default function OverviewPage() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(60);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<StatsData>({
    queryKey: ["stats"],
    queryFn: () => apiRequest("/api/stats"),
    refetchInterval: REFRESH_INTERVAL,
  });

  const { data: recentes, isLoading: recentesLoading, refetch: refetchRecentes } = useQuery<Atendimento[]>({
    queryKey: ["recentes"],
    queryFn: () => apiRequest("/api/recentes"),
    refetchInterval: REFRESH_INTERVAL,
  });

  // Update last updated time whenever data refetches
  useEffect(() => {
    if (stats) {
      setLastUpdated(new Date());
      setCountdown(60);
    }
  }, [stats]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    refetchStats();
    refetchRecentes();
    setLastUpdated(new Date());
    setCountdown(60);
  };

  const isLoading = statsLoading || recentesLoading;

  if (isLoading) {
    return (
      <Layout title="Visão Geral" subtitle="Dashboard de atendimentos em tempo real">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
            <p className="text-gray-400">Carregando dados...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout title="Visão Geral" subtitle="Dashboard de atendimentos em tempo real">
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-gray-400">Nenhum dado disponível. Verifique a conexão com o banco de dados.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Visão Geral" subtitle="Dashboard de atendimentos em tempo real">
      {/* Refresh Info Bar */}
      <div className="flex items-center justify-between bg-[#1a1a2e] rounded-xl px-4 py-3 border border-[#2a2a4a]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-400">
            Última atualização: {format(lastUpdated, "HH:mm:ss", { locale: ptBR })}
          </span>
          <span className="text-xs text-gray-500">
            • Próxima em {countdown}s
          </span>
        </div>
        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Atendimentos Hoje"
          value={stats.totais.hoje?.toLocaleString("pt-BR") || "0"}
          icon={<MessageSquare className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          title="Esta Semana"
          value={stats.totais.semana?.toLocaleString("pt-BR") || "0"}
          icon={<CalendarDays className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Este Mês"
          value={stats.totais.mes?.toLocaleString("pt-BR") || "0"}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Duração Média"
          value={`${stats.duracaoMedia || 0} min`}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Timeline Chart */}
      <Card className="bg-[#1a1a2e] border-[#2a2a4a] shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-400" />
            Volume de Atendimentos (Últimos 30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.timeline}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a4a" />
              <XAxis 
                dataKey="data" 
                tickFormatter={(val) => {
                  try {
                    return format(new Date(val), "dd/MM");
                  } catch {
                    return val;
                  }
                }} 
                stroke="#6b7280" 
                fontSize={11}
              />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a2e', 
                  borderRadius: '12px', 
                  border: '1px solid #2a2a4a',
                  color: '#fff'
                }}
                labelFormatter={(label) => {
                  try {
                    return format(new Date(label), "dd/MM/yyyy");
                  } catch {
                    return label;
                  }
                }}
                formatter={(value: number) => [value, "Atendimentos"]}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#ef4444" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorVolume)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Por Canal */}
        <Card className="bg-[#1a1a2e] border-[#2a2a4a] shadow-lg">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Atendimentos por Canal
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.porCanal} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#2a2a4a" />
                <XAxis type="number" stroke="#6b7280" fontSize={11} />
                <YAxis 
                  type="category" 
                  dataKey="nome" 
                  width={140} 
                  stroke="#9ca3af" 
                  fontSize={11}
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', borderRadius: '12px', border: '1px solid #2a2a4a', color: '#fff' }}
                  formatter={(value: number) => [value, "Atendimentos"]}
                />
                <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={24}>
                  {stats.porCanal.map((_, index) => (
                    <Cell key={`canal-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Por Casa */}
        <Card className="bg-[#1a1a2e] border-[#2a2a4a] shadow-lg">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-400" />
              Atendimentos por Casa
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.porCasa} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#2a2a4a" />
                <XAxis type="number" stroke="#6b7280" fontSize={11} />
                <YAxis 
                  type="category" 
                  dataKey="nome" 
                  width={140} 
                  stroke="#9ca3af" 
                  fontSize={11}
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', borderRadius: '12px', border: '1px solid #2a2a4a', color: '#fff' }}
                  formatter={(value: number) => [value, "Atendimentos"]}
                />
                <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={24}>
                  {stats.porCasa.map((_, index) => (
                    <Cell key={`casa-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo da Conversa Chart */}
      <Card className="bg-[#1a1a2e] border-[#2a2a4a] shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            Top Assuntos (Resumo da Conversa)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.porResumo} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#2a2a4a" />
              <XAxis type="number" stroke="#6b7280" fontSize={11} />
              <YAxis 
                type="category" 
                dataKey="nome" 
                width={180} 
                stroke="#9ca3af" 
                fontSize={10}
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a2e', borderRadius: '12px', border: '1px solid #2a2a4a', color: '#fff' }}
                formatter={(value: number) => [value, "Atendimentos"]}
              />
              <Bar dataKey="total" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={20}>
                {stats.porResumo.map((_, index) => (
                  <Cell key={`resumo-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Calls Table */}
      <Card className="bg-[#1a1a2e] border-[#2a2a4a] shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg">Últimos Atendimentos Finalizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a4a]">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Protocolo</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Contato</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Canal</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Início</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Fim</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Resumo</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Casa</th>
                </tr>
              </thead>
              <tbody>
                {recentes && recentes.length > 0 ? (
                  recentes.map((item, idx) => (
                    <tr key={item.id || idx} className="border-b border-[#2a2a4a]/50 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-gray-300 font-mono text-xs">{item.protocolo}</td>
                      <td className="py-3 px-4 text-gray-300">{item.contato}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium">
                          {item.canal}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">
                        {formatDateTime(item.dataHoraInicio)}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">
                        {formatDateTime(item.dataHoraFim)}
                      </td>
                      <td className="py-3 px-4 text-gray-300 max-w-[200px] truncate">{item.resumoConversa}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-medium">
                          {item.casa}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      Nenhum atendimento recente encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

function StatCard({ title, value, icon, color }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "red" | "blue" | "green" | "amber";
}) {
  const colorMap = {
    red: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    green: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  };
  const c = colorMap[color];

  return (
    <div className={`bg-[#1a1a2e] rounded-xl p-5 border ${c.border} shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{title}</span>
        <div className={`p-2 rounded-lg ${c.bg}`}>
          <span className={c.text}>{icon}</span>
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
