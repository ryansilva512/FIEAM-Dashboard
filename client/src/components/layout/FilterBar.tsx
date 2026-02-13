import { useDashboard } from "@/store/dashboard-context";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FilterX } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function FilterBar() {
  const { data, filters, setFilters, resetFilters } = useDashboard();

  // Extract unique values for dropdowns
  const uniqueChannels = Array.from(new Set(data.map(d => d.canalNormalizado))).sort();
  const uniqueThemes = Array.from(new Set(data.map(d => d.tema || "Outros"))).sort();
  
  return (
    <div className="p-4 bg-card border border-border rounded-xl shadow-sm flex flex-col lg:flex-row gap-4 lg:items-center flex-wrap">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mr-2">
        <span>Filters:</span>
      </div>

      {/* Date Range Picker - Simplified as two date inputs for robustness */}
      <div className="flex gap-2 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !filters.startDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.startDate ? format(filters.startDate, "PPP") : <span>Start Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.startDate}
              onSelect={(date) => setFilters({ startDate: date })}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground">-</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !filters.endDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.endDate ? format(filters.endDate, "PPP") : <span>End Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.endDate}
              onSelect={(date) => setFilters({ endDate: date })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Channel Filter */}
      <Select 
        value={filters.channels[0] || "all"} 
        onValueChange={(val) => setFilters({ channels: val === "all" ? [] : [val] })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Channel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Channels</SelectItem>
          {uniqueChannels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Theme Filter */}
      <Select 
        value={filters.themes[0] || "all"} 
        onValueChange={(val) => setFilters({ themes: val === "all" ? [] : [val] })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Themes</SelectItem>
          {uniqueThemes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* No Interaction Flag */}
      <div className="flex items-center gap-2 border px-3 py-2 rounded-md bg-background">
        <Checkbox 
          id="no-interaction" 
          checked={filters.onlyNoInteraction}
          onCheckedChange={(checked) => setFilters({ onlyNoInteraction: checked === true })}
        />
        <Label htmlFor="no-interaction" className="text-sm cursor-pointer">Only "No Interaction"</Label>
      </div>

      <div className="ml-auto">
        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-destructive hover:text-destructive/80">
          <FilterX className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
