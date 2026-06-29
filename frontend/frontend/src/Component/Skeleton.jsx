export default function Skeleton({ className = "", height = "h-4", width = "w-full" }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className} ${height} ${width}`}
      style={{
        animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] overflow-hidden rounded-xl">
      <Skeleton className="h-96 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
      <div className="flex gap-4">
        <Skeleton className="w-28 h-32 rounded-xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-6 w-20" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-5 w-8" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Section */}
        <div className="space-y-4">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <div className="flex gap-4">
            <Skeleton className="h-20 w-20 rounded-lg" />
            <Skeleton className="h-20 w-20 rounded-lg" />
            <Skeleton className="h-20 w-20 rounded-lg" />
            <Skeleton className="h-20 w-20 rounded-lg" />
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />

          <div className="space-y-4 pt-6">
            <Skeleton className="h-6 w-1/4" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>

          <div className="space-y-4 pt-6">
            <Skeleton className="h-6 w-1/4" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 w-1/3 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
