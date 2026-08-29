import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import { EmptyState } from './EmptyState'
import { TableLoadingSpinner } from './LoadingSpinner'

interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearch?: (value: string) => void
  pagination?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    onPageChange: (page: number) => void
  }
  emptyTitle?: string
  emptyDescription?: string
  onRowClick?: (item: T) => void
  className?: string
}

export function DataTable<T>({
  columns, data, isLoading, searchPlaceholder, searchValue, onSearch, pagination,
  emptyTitle = 'No hay datos', emptyDescription = 'No se encontraron registros',
  onRowClick, className,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      return { key, direction: 'asc' }
    })
  }

  const sortedData = useMemo(() => {
    if (!sortConfig) return data
    return [...data].sort((a, b) => {
      const aRecord = a as Record<string, unknown>
      const bRecord = b as Record<string, unknown>
      const aVal = aRecord[sortConfig.key] as string | number
      const bVal = bRecord[sortConfig.key] as string | number
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  if (isLoading) return <TableLoadingSpinner />

  return (
    <div className={cn('space-y-4', className)}>
      {onSearch && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder={searchPlaceholder || 'Buscar...'} value={searchValue || ''} onChange={(e) => onSearch(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
        </div>
      )}
      {data.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className={cn('px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider', column.sortable && 'cursor-pointer select-none hover:text-gray-700', column.className)} onClick={() => column.sortable && handleSort(column.key)}>
                      <div className="flex items-center gap-1">
                        {column.header}
                        {column.sortable && sortConfig?.key === column.key && (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((item, index) => (
                  <tr key={index} className={cn('hover:bg-gray-50 transition-colors', onRowClick && 'cursor-pointer')} onClick={() => onRowClick?.(item)}>
                    {columns.map((column) => (
                      <td key={column.key} className={cn('px-4 py-3 text-sm text-gray-900', column.className)}>
                        {column.render ? column.render(item) : String((item as Record<string, unknown>)[column.key] || '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Mostrando {(pagination.current_page - 1) * pagination.per_page + 1} a {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de {pagination.total} resultados</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => pagination.onPageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm text-gray-700">Pagina {pagination.current_page} de {pagination.last_page}</span>
            <Button variant="outline" size="sm" onClick={() => pagination.onPageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  )
}
