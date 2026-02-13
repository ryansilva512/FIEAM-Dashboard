import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";

function LayoutInner({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#071A2E] text-gray-100 flex">
      <Sidebar />
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
        <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
          {/* Header Section — Blue FIEAM Banner */}
          <header className="flex items-center justify-between bg-[#009FE3] rounded-xl px-6 py-4 -mx-4 md:-mx-8 -mt-4 md:-mt-8 mb-2">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{title}</h2>
              {subtitle && <p className="text-white/70 mt-1 text-sm">{subtitle}</p>}
            </div>
            <img
              src="/anexo/grupo_fieam.png"
              alt="FIEAM · SESI · SENAI · IEL"
              className="h-10 md:h-12 object-contain"
            />
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

export function Layout({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <SidebarProvider>
      <LayoutInner title={title} subtitle={subtitle}>
        {children}
      </LayoutInner>
    </SidebarProvider>
  );
}
