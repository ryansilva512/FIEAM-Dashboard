import React, { createContext, useContext, useState, useEffect } from "react";
import type { ServiceCall } from "@shared/schema";

interface DashboardContextType {
  data: ServiceCall[];
  setData: (data: ServiceCall[]) => void;
  filteredData: ServiceCall[];
  filters: {
    startDate: Date | undefined;
    endDate: Date | undefined;
    channels: string[];
    houses: string[];
    themes: string[];
    onlyNoInteraction: boolean;
  };
  setFilters: (filters: Partial<DashboardContextType["filters"]>) => void;
  isLoading: boolean;
  resetFilters: () => void;
  updateRowTheme: (id: string, newTheme: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ServiceCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFiltersState] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    channels: [] as string[],
    houses: [] as string[],
    themes: [] as string[],
    onlyNoInteraction: false,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dashboard_data");
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load data from storage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem("dashboard_data", JSON.stringify(data));
    }
  }, [data]);

  const setFilters = (newFilters: Partial<typeof filters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFiltersState({
      startDate: undefined,
      endDate: undefined,
      channels: [],
      houses: [],
      themes: [],
      onlyNoInteraction: false,
    });
  };

  const updateRowTheme = (id: string, newTheme: string) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, tema: newTheme } : item
      )
    );
  };

  // Apply filters
  const filteredData = data.filter((item) => {
    const itemDate = new Date(item.dataHoraInicio);

    if (filters.startDate && itemDate < filters.startDate) return false;
    if (filters.endDate && itemDate > filters.endDate) return false;
    
    if (filters.channels.length > 0 && !filters.channels.includes(item.canalNormalizado)) return false;
    if (filters.houses.length > 0 && !filters.houses.includes(item.casa)) return false;
    if (filters.themes.length > 0 && !filters.themes.includes(item.tema || "Outros")) return false;
    
    if (filters.onlyNoInteraction && !item.flagFaltaInteracao) return false;

    return true;
  });

  return (
    <DashboardContext.Provider
      value={{
        data,
        setData,
        filteredData,
        filters,
        setFilters,
        isLoading,
        resetFilters,
        updateRowTheme,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
