// ============================================================================
// PageHeader — logo + title + subtitle block shown atop each auth page.
// ============================================================================

// Interfaces
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Whether to render the brand logo above the title. */
  showLogo?: boolean;
}

// Component
export function PageHeader({ title, subtitle, showLogo = true }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      {showLogo && (
        <div className="mb-6 flex items-center gap-2 text-primary">
          <span className="h-0.5 w-5 bg-primary" />
          <span className="font-display text-sm tracking-wide">PropCare</span>
        </div>
      )}

      <h1 className="text-foreground">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
