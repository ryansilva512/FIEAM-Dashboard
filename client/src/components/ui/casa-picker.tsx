import { useState, useCallback, useMemo } from "react";
import { Building2, Check, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CasaPickerProps {
    value: string[];          // array of selected casas
    casas: string[];
    onChange: (casas: string[]) => void;
}

export function CasaPicker({ value, casas, onChange }: CasaPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const allSelected = value.length === 0; // empty = "Todas"

    const displayText = allSelected
        ? "Todas as Casas"
        : value.length === 1
            ? value[0]
            : `${value.length} casas selecionadas`;

    const filteredCasas = useMemo(() => {
        if (!search.trim()) return casas;
        const q = search.toLowerCase();
        return casas.filter((c) => c.toLowerCase().includes(q));
    }, [casas, search]);

    const isSelected = useCallback(
        (casa: string) => value.includes(casa),
        [value]
    );

    const toggleCasa = useCallback(
        (casa: string) => {
            if (value.includes(casa)) {
                onChange(value.filter((c) => c !== casa));
            } else {
                onChange([...value, casa]);
            }
        },
        [value, onChange]
    );

    const handleSelectAll = useCallback(() => {
        onChange([]);
        setOpen(false);
        setSearch("");
    }, [onChange]);

    const handleClear = useCallback(() => {
        onChange([]);
        setOpen(false);
        setSearch("");
    }, [onChange]);

    return (
        <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(""); }}>
            <PopoverTrigger asChild>
                <button className="group flex items-center gap-2.5 px-4 py-2.5 text-xs bg-[#060e1a]/80 border border-[#1a3a5c]/80 rounded-xl text-gray-300 hover:border-[#009FE3]/40 hover:bg-[#0a1929] hover:text-white transition-all duration-300 min-w-[180px] backdrop-blur-sm shadow-sm hover:shadow-md hover:shadow-[#009FE3]/5">
                    <Building2 className="w-4 h-4 text-[#009FE3] shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-left flex-1 truncate font-medium">{displayText}</span>
                    {!allSelected && (
                        <span className="px-1.5 py-0.5 bg-[#009FE3]/15 text-[#009FE3] text-[9px] font-bold rounded-full border border-[#009FE3]/20 min-w-[18px] text-center">
                            {value.length}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[280px] p-0 bg-[#0b1a2e] border border-[#1a3a5c]/80 shadow-2xl shadow-black/40 rounded-2xl overflow-hidden backdrop-blur-xl"
                align="start"
                sideOffset={8}
            >
                <div className="flex flex-col max-h-[420px]">
                    {/* Header */}
                    <div className="px-4 pt-4 pb-3 border-b border-[#1a3a5c]/40 bg-[#0d1f33]/50">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-bold flex items-center gap-1.5 mb-2">
                            <Building2 className="w-3 h-3" />
                            Filtrar por Casa
                        </p>
                        {/* Search */}
                        <div className="flex items-center gap-2 bg-[#081422] border border-[#1a3a5c]/60 rounded-lg px-3 py-2">
                            <Search className="w-3.5 h-3.5 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar casa..."
                                className="bg-transparent text-xs text-gray-300 placeholder-gray-600 focus:outline-none w-full"
                                autoFocus
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options list */}
                    <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 scrollbar-thin max-h-[280px]">
                        {/* "Todas" option */}
                        <button
                            onClick={handleSelectAll}
                            className={`w-full text-left px-3 py-2.5 text-xs rounded-lg transition-all duration-200 flex items-center gap-2.5 ${allSelected
                                    ? "bg-[#009FE3]/15 text-[#009FE3] font-semibold border border-[#009FE3]/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                                }`}
                        >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${allSelected
                                    ? "border-[#009FE3] bg-[#009FE3]"
                                    : "border-gray-600"
                                }`}>
                                {allSelected && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span>Todas as Casas</span>
                        </button>

                        {/* Divider */}
                        <div className="border-t border-[#1a3a5c]/30 my-1.5" />

                        {filteredCasas.length > 0 ? (
                            filteredCasas.map((casa) => {
                                const checked = isSelected(casa);
                                return (
                                    <button
                                        key={casa}
                                        onClick={() => toggleCasa(casa)}
                                        className={`w-full text-left px-3 py-2.5 text-xs rounded-lg transition-all duration-200 flex items-center gap-2.5 ${checked
                                                ? "bg-[#009FE3]/15 text-[#009FE3] font-semibold border border-[#009FE3]/20"
                                                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checked
                                                ? "border-[#009FE3] bg-[#009FE3]"
                                                : "border-gray-600 hover:border-gray-400"
                                            }`}>
                                            {checked && <Check className="w-2.5 h-2.5 text-white" />}
                                        </div>
                                        <span className="truncate">{casa}</span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="text-center py-6 text-gray-500 text-xs">
                                Nenhuma casa encontrada
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {!allSelected && (
                        <div className="px-3 py-2.5 border-t border-[#1a3a5c]/40 bg-[#081422]/50">
                            <button
                                onClick={handleClear}
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-gray-400 hover:text-red-400 transition-all duration-200 rounded-lg hover:bg-red-500/5 border border-transparent hover:border-red-500/15"
                            >
                                <X className="w-3.5 h-3.5" />
                                Limpar filtro
                            </button>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
