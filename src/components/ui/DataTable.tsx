import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from './Button'
import { EmptyState } from './EmptyState'
import { TableLoadingSpinner } from './LoadingSpinner'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  className?: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  onRowClick?: (item: T) => void
  keyExtractor?: (item: T) => string
  searchPlaceholder?: string
  searchable?: boolean
  pagination?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    onPageChange: (page: number) => void
  }
  emptyTitle?: string
  emptyDescription?: string
}

function asRecord(item: object): Record<string, unknown> {
  return item as Record<string, unknown>
}

export function DataTable<T extends object>({
  columns,
  data,
  isLoading,
  onRowClick,
  keyExtractor,
  searchPlaceholder,
  searchable = false,
  pagination,
  emptyTitle = 'No data',
  emptyDescription = 'No records found',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  let displayData = [...data]

  if (search && searchable) {
    const q = search.toLowerCase()
    displayData = displayData.filter((item) =>
      Object.values(asRecord(item)).some((v) => String(v ?? '').toLowerCase().includes(q))
    )
  }

  if (sortConfig) {
    displayData.sort((a, b) => {
      const aVal = asRecord(a)[sortConfig.key]
      const bVal = asRecord(b)[sortConfig.key]
      if (aVal === bVal) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = aVal < bVal ? -1 : 1
      return sortConfig.direction === 'asc' ? cmp : -cmp
    })
  }

  if (isLoading) {
    return <TableLoadingSpinner />
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder || 'Search...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      )}

      {displayData.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                        column.sortable && 'cursor-pointer select-none hover:text-gray-700',
                        column.className
                      )}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-1">
                        {column.header}
                        {column.sortable && sortConfig?.key === column.key && (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayData.map((item, index) => (
                  <tr
                    key={keyExtractor ? keyExtractor(item) : String(index)}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      'transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-gray-50'
                    )}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={cn('px-4 py-3 whitespace-nowrap', column.className)}>
                        {column.render
                          ? column.render(item)
                          : ((asRecord(item)[column.key] as React.ReactNode) ?? '—')}
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
          <p className="text-sm text-gray-500">
            Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-700">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
