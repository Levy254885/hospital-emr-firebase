import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'

export default function RouteError() {
  const error = useRouteError()
  let message = 'An unexpected error occurred.'
  let detail = ''

  if (isRouteErrorResponse(error)) {
    message = error.statusText || message
    detail = typeof error.data === 'string' ? error.data : ''
  } else if (error instanceof Error) {
    message = error.message
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Application error</h1>
        <p className="text-sm text-red-600 mb-4 break-words">{message}</p>
        {detail ? <p className="text-xs text-gray-500 mb-4 break-words">{detail}</p> : null}
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => window.location.assign('/login')}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            Go to login
          </button>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
