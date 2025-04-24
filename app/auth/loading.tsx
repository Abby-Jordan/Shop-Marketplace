export default function AuthLoading() {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center">
      <div className="w-full max-w-md">
        <div className="animate-pulse space-y-4">
          {/* Tabs Skeleton */}
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md" />

          {/* Card Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {/* Header Skeleton */}
            <div className="space-y-2 mb-6">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>

            {/* Form Fields Skeleton */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>

            {/* Button Skeleton */}
            <div className="mt-6">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 