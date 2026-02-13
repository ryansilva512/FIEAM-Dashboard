import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Search, 
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/protocolo", label: "Pesquisar Protocolo", icon: Search },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden text-white"
        onClick={toggle}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-[#1a1a2e] border-r border-[#2a2a4a] shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 border-b border-[#2a2a4a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Polo BI
                </h1>
                <p className="text-xs text-gray-400">Polo Telecom</p>
              </div>
            </div>
          </div>

          {/* Section Label */}
          <div className="px-6 pt-6 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dashboards</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} className="block" onClick={() => setIsOpen(false)}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-red-600/20 text-red-400 border border-red-500/30"
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive ? "text-red-400" : "text-gray-500")} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#2a2a4a]">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs text-gray-400">Dados em tempo real</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
