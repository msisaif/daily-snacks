export default function Loading() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500" role="status">
      <span className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
      লোড হচ্ছে…
    </div>
  );
}
