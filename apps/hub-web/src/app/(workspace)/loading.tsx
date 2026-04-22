export default function Loading() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded-xl animate-pulse" />
          <div className="h-4 w-96 bg-muted/60 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted rounded-xl animate-pulse" />
      </div>

      {/* Stats/Filters Skeleton */}
      <div className="flex gap-4 py-2">
        <div className="h-10 w-full max-w-sm bg-muted rounded-xl animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded-xl animate-pulse" />
      </div>

      {/* Table/Card Skeleton */}
      <div className="rounded-2xl border border-border bg-card/50 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
        </div>
        <div className="p-8 space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-muted/60 rounded animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-muted rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
