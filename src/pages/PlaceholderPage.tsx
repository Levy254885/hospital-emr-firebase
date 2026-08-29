import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description?: string
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
              <Construction className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {description || 'Esta pagina esta en desarrollo. Proximamente estara disponible.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
