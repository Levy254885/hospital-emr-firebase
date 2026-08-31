import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, ArrowUpRight, ArrowDownRight, Lock, Unlock } from 'lucide-react'

interface CashMovement {
  id: string
  type: 'entry' | 'exit'
  description: string
  amount: number
  time: string
}

export default function CashRegisterPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [openAmount, setOpenAmount] = useState(0)
  const [movements] = useState<CashMovement[]>([])
  const [totalEntries] = useState(0)
  const [totalExits] = useState(0)

  const handleOpen = () => {
    setIsOpen(true)
  }
  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Register</h1>
          <p className="text-sm text-gray-500">Daily cash control</p>
        </div>
        <div className="flex gap-2">
          {isOpen ? (
            <Button variant="danger" leftIcon={<Lock className="h-4 w-4" />} onClick={handleClose}>
              Close Register
            </Button>
          ) : (
            <Button leftIcon={<Unlock className="h-4 w-4" />} onClick={handleOpen}>
              Open Register
            </Button>
          )}
        </div>
      </div>
      <Card variant="elevated">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${isOpen ? 'bg-green-100' : 'bg-gray-100'}`}>
                <DollarSign className={`h-8 w-8 ${isOpen ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Register Status</p>
                <p className={`text-lg font-bold ${isOpen ? 'text-green-600' : 'text-gray-500'}`}>
                  {isOpen ? 'Open' : 'Closed'}
                </p>
              </div>
            </div>
            {isOpen && <Badge variant="success">Open</Badge>}
          </div>
        </CardContent>
      </Card>
      {!isOpen && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Open Register</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Opening Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={openAmount}
                  onChange={(e) => setOpenAmount(parseFloat(e.target.value) || 0)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="0.00"
                />
              </div>
              <Button onClick={handleOpen} disabled={openAmount <= 0}>
                Open Register
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="elevated">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Income</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalEntries)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ArrowDownRight className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expenses</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalExits)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <ArrowUpRight className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Balance</p>
                <p className="text-xl font-bold text-primary-600">
                  {formatCurrency(totalEntries - totalExits)}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Today's Movements</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No movements recorded today</p>
          ) : (
            <div className="space-y-3">
              {movements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        movement.type === 'entry' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {movement.type === 'entry' ? (
                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{movement.description}</p>
                      <p className="text-xs text-gray-500">{movement.time}</p>
                    </div>
                  </div>
                  <p
                    className={`font-medium ${
                      movement.type === 'entry' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {movement.type === 'entry' ? '+' : '-'}
                    {formatCurrency(movement.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
