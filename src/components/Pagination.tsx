import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  total,
  perPage,
  page,
  onChange,
}: {
  total: number;
  perPage: number;
  page: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-12 pt-8 border-t border-border/40">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-9 h-9"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      {Array.from({ length: totalPages }).map((_, i) => (
        <Button
          key={i}
          variant={page === i + 1 ? "default" : "ghost"}
          size="icon"
          onClick={() => onChange(i + 1)}
          className={`w-9 h-9 ${page === i + 1 ? "bg-primary text-primary-foreground" : ""}`}
        >
          {i + 1}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-9 h-9"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
