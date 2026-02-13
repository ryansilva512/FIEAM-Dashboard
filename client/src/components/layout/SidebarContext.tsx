import { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
    collapsed: boolean;
    toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
    collapsed: false,
    toggle: () => { },
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem("sidebar-collapsed") === "true";
        } catch {
            return false;
        }
    });

    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", String(collapsed));
    }, [collapsed]);

    const toggle = () => setCollapsed((prev) => !prev);

    return (
        <SidebarContext.Provider value={{ collapsed, toggle }}>
            {children}
        </SidebarContext.Provider>
    );
}

export const useSidebar = () => useContext(SidebarContext);
