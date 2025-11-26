import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center w-10 h-10", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Shield Background */}
        <path
          d="M50 95C50 95 85 80 85 50V15L50 5L15 15V50C15 80 50 95 50 95Z"
          className="fill-primary"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="4"
        />
        
        {/* Inner Design - Abstract Pitch/S */}
        <path
          d="M35 35H65M35 50H65M35 65H65"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="8" className="fill-primary" />
      </svg>
    </div>
  );
}
