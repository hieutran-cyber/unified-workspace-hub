import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
        {label}
      </label>
      <div className="relative group">{children}</div>
      {error && <p className="text-[11px] text-destructive font-bold ml-1">{error}</p>}
    </div>
  );
}

export const inputClasses =
  "w-full h-11 px-4 rounded-xl border border-border/60 bg-background/30 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-muted-foreground/40 font-medium hover:bg-background/50 drop-shadow-sm";
export const selectClasses =
  "w-full h-11 px-4 pr-10 rounded-xl border border-border/60 bg-background/30 text-sm focus:outline-none appearance-none cursor-pointer hover:bg-background/50 transition-all font-medium drop-shadow-sm";
