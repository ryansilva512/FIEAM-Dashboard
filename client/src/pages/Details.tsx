import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useDashboard } from "@/store/dashboard-context";
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel, 
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type ServiceCall } from "@shared/schema";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

const columnHelper = createColumnHelper<ServiceCall>();

const columns = [
  columnHelper.accessor("protocolo", {
    header: "Protocolo",
    cell: info => <span className="font-mono text-xs">{info.getValue()}</span>,
  }),
  columnHelper.accessor("data", {
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Data
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("canalNormalizado", {
    header: "Canal",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("casa", {
    header: "Casa",
    cell: info => info.getValue(),
  }),
  columnHelper.accessor("tema", {
    header: "Tema",
    cell: info => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        info.getValue() === 'Outros' 
          ? 'bg-gray-100 text-gray-700' 
          : 'bg-blue-100 text-blue-700'
      }`}>
        {info.getValue() || "Outros"}
      </span>
    ),
  }),
  columnHelper.accessor("duracaoMinutos", {
    header: "Duração (min)",
    cell: info => info.getValue().toFixed(1),
  }),
  columnHelper.accessor("resumoConversa", {
    header: "Resumo",
    cell: info => (
      <div className="max-w-md truncate text-xs text-muted-foreground" title={info.getValue()}>
        {info.getValue()}
      </div>
    ),
  }),
];

export default function DetailsPage() {
  const { filteredData } = useDashboard();
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 15 },
    }
  });

  return (
    <Layout title="Data Grid" subtitle="Detailed view of all service calls">
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No results found. Check your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
          <div className="flex-1 text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
