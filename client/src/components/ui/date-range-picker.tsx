import { useState } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onApply: (startDate: string, endDate: string) => void;
}

const PRESETS = [
    {
        label: "Hoje", getRange: () => {
            const now = new Date();
            return { from: now, to: now };
        }
    },
    {
        label: "Esta semana", getRange: () => {
            const now = new Date();
            return { from: startOfWeek(now, { weekStartsOn: 1 }), to: now };
        }
    },
    {
        label: "Semana passada", getRange: () => {
            const now = new Date();
            const lastWeekEnd = subDays(startOfWeek(now, { weekStartsOn: 1 }), 1);
            return { from: startOfWeek(lastWeekEnd, { weekStartsOn: 1 }), to: lastWeekEnd };
        }
    },
    {
        label: "Últimos 30 dias", getRange: () => {
            const now = new Date();
            return { from: subDays(now, 30), to: now };
        }
    },
    {
        label: "Este mês", getRange: () => {
            const now = new Date();
            return { from: startOfMonth(now), to: now };
        }
    },
    {
        label: "Mês passado", getRange: () => {
            const now = new Date();
            const lastMonth = subMonths(now, 1);
            return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        }
    },
];

export function DateRangePicker({ startDate, endDate, onApply }: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<DateRange | undefined>(() => ({
        from: new Date(startDate + "T00:00:00"),
        to: new Date(endDate + "T00:00:00"),
    }));

    const displayText = selected?.from && selected?.to
        ? `${format(selected.from, "d 'de' MMM yyyy", { locale: ptBR })} – ${format(selected.to, "d 'de' MMM yyyy", { locale: ptBR })}`
        : "Selecione um período";

    const handlePreset = (preset: typeof PRESETS[0]) => {
        const range = preset.getRange();
        setSelected(range);
    };

    const handleConfirm = () => {
        if (selected?.from && selected?.to) {
            onApply(
                format(selected.from, "yyyy-MM-dd"),
                format(selected.to, "yyyy-MM-dd")
            );
            setOpen(false);
        }
    };

    const handleClear = () => {
        const now = new Date();
        const range = { from: startOfMonth(now), to: now };
        setSelected(range);
        onApply(
            format(range.from, "yyyy-MM-dd"),
            format(range.to, "yyyy-MM-dd")
        );
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className="flex items-center gap-2 px-3 py-2 text-xs bg-[#060e1a] border border-[#1a3a5c] rounded-lg text-gray-300 hover:border-[#0047B6]/60 hover:text-white transition-all duration-200 min-w-[260px]"
                >
                    <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-left flex-1 truncate">{displayText}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-0 bg-[#0a1628] border-[#1a3a5c] shadow-2xl rounded-xl overflow-hidden"
                align="end"
                sideOffset={8}
            >
                <div className="flex">
                    {/* Presets sidebar */}
                    <div className="border-r border-[#1a3a5c] p-2 min-w-[160px]">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-3 py-2">
                            Período
                        </p>
                        {PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => handlePreset(preset)}
                                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Calendar + actions */}
                    <div className="flex flex-col">
                        {/* Selected range display */}
                        <div className="px-4 pt-3 pb-1">
                            <p className="text-[10px] text-gray-500">{selected?.from ? format(selected.from, "yyyy") : ""}</p>
                            <p className="text-sm font-semibold text-blue-300">
                                {selected?.from && selected?.to
                                    ? `${format(selected.from, "d 'de' MMM yyyy", { locale: ptBR })} – ${format(selected.to, "d 'de' MMM yyyy", { locale: ptBR })}`
                                    : "Selecione um período"
                                }
                            </p>
                        </div>

                        {/* Calendar */}
                        <Calendar
                            mode="range"
                            selected={selected}
                            onSelect={setSelected}
                            locale={ptBR}
                            numberOfMonths={1}
                            className="text-gray-200"
                            classNames={{
                                months: "flex flex-col",
                                month: "space-y-2",
                                caption: "flex justify-center pt-1 relative items-center text-gray-200",
                                caption_label: "text-sm font-medium text-gray-200",
                                nav: "space-x-1 flex items-center",
                                nav_button: "h-7 w-7 bg-transparent p-0 text-gray-400 hover:text-white opacity-70 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-transparent hover:border-[#1a3a5c] transition-colors",
                                nav_button_previous: "absolute left-1",
                                nav_button_next: "absolute right-1",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex",
                                head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                                row: "flex w-full mt-1",
                                cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                                day: "h-9 w-9 p-0 font-normal text-gray-300 hover:bg-white/10 rounded-md inline-flex items-center justify-center transition-colors",
                                day_range_end: "day-range-end",
                                day_selected: "bg-[#0047B6] text-white hover:bg-[#003892] focus:bg-[#0047B6] rounded-md",
                                day_today: "bg-white/10 text-white font-semibold",
                                day_outside: "text-gray-600 opacity-50",
                                day_disabled: "text-gray-600 opacity-30",
                                day_range_middle: "bg-[#0047B6]/20 text-blue-200 rounded-none",
                                day_hidden: "invisible",
                            }}
                        />

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#1a3a5c]">
                            <button
                                onClick={handleClear}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors rounded-md hover:bg-white/5"
                            >
                                ✕ Limpar
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!selected?.from || !selected?.to}
                                className="flex items-center gap-1 px-4 py-1.5 text-xs bg-[#0047B6] text-white rounded-md hover:bg-[#003892] transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                            >
                                ✓ Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
