import { Sidebar } from "./Sidebar";

export function Layout({ children, title, subtitle }: { 
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-gray-100 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 transition-all duration-300">
        <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{title}</h2>
              {subtitle && <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>}
            </div>
          </header>

          {/* Main Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
