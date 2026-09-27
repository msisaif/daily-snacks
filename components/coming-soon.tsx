export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mt-2 text-slate-600">এই অংশটা শীঘ্রই আসছে।</p>
    </div>
  );
}
