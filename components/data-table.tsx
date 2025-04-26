"use client"

import { useState, useMemo } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchColumn?: string
  filterColumn?: string
  isLoading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn = "nama",
  filterColumn,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  })

  // Check if searchColumn exists in the columns
  const hasSearchColumn = table.getAllColumns().some((column) => column.id === searchColumn)

  // Check if filterColumn exists in the columns
  const hasFilterColumn = filterColumn && table.getAllColumns().some((column) => column.id === filterColumn)

  // Get unique values for filter dropdown if filterColumn is provided
  const filterOptions = useMemo(() => {
    if (!filterColumn || !data.length) return []

    const uniqueValues = new Set<string>()
    data.forEach((item: any) => {
      if (item[filterColumn]) {
        uniqueValues.add(item[filterColumn])
      }
    })

    return Array.from(uniqueValues).sort()
  }, [data, filterColumn])

  // Handle filter change
  const handleFilterChange = (value: string) => {
    if (filterColumn) {
      if (value === "all") {
        // Clear the filter when "all" is selected
        table.getColumn(filterColumn)?.setFilterValue(undefined)
      } else {
        table.getColumn(filterColumn)?.setFilterValue(value)
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex gap-2">
          {hasSearchColumn && (
            <Input
              placeholder="Cari..."
              value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn(searchColumn)?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
          )}

          {hasFilterColumn && filterOptions.length > 0 && (
            <Select
              value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? "all"}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={`Filter ${filterColumn}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua {filterColumn === "tingkat" ? "Tingkat" : filterColumn}</SelectItem>
                {filterOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {filterColumn === "tingkat" ? `Tingkat ${option}` : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Memuat data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Menampilkan {table.getFilteredRowModel().rows.length} data
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
