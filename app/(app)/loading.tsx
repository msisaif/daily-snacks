import { LogoMark } from "@/components/ui";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-sm font-medium text-slate-500" role="status">
      <LogoMark className="size-14 animate-float" />
      লোড হচ্ছে…
    </div>
  );
}
