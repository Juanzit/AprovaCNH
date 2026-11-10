interface RouteLoadingSkeletonProps {
  variant?: 'dashboard' | 'review' | 'simulado' | 'lesson';
}

export function RouteLoadingSkeleton({
  variant = 'dashboard',
}: RouteLoadingSkeletonProps) {
  const isDashboard = variant === 'dashboard';
  const isLesson = variant === 'lesson';

  return (
    <div
      aria-label="Carregando conteúdo"
      aria-busy="true"
      className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-pulse"
    >
      <div className="h-7 w-56 rounded-lg bg-slate-200" />
      {isDashboard && (
        <div className="h-36 rounded-2xl border border-slate-200 bg-white" />
      )}
      <div className={isDashboard ? 'grid grid-cols-2 lg:grid-cols-4 gap-3' : 'grid grid-cols-1 lg:grid-cols-3 gap-4'}>
        {Array.from({ length: isDashboard ? 4 : isLesson ? 1 : 3 }, (_, index) => (
          <div key={index} className="h-28 rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
      {isLesson ? (
        <div className="h-96 max-w-2xl rounded-2xl border border-slate-200 bg-white" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 h-[28rem] rounded-2xl border border-slate-200 bg-white" />
          <div className="lg:col-span-4 h-72 rounded-2xl border border-slate-200 bg-white" />
        </div>
      )}
    </div>
  );
}
