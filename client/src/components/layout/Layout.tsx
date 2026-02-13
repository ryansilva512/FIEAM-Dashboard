import { Sidebar } from "./Sidebar";
import { FilterBar } from "@/components/layout/FilterBar";
import { useDashboard } from "@/store/dashboard-context";

export function Layout({ children, title, subtitle, showFilters = true }: { 
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showFilters?: boolean;
}) {
  const { data } = useDashboard();
  const hasData = data.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 transition-all duration-300">
        <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
              {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
            </div>
          </header>

          {/* Conditional Filters */}
          {showFilters && hasData && <FilterBar />}

          {/* Main Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
