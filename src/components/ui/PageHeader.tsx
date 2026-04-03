interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="bg-primary-50 border-b border-primary-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-3 text-sm text-neutral-500">
            <ol className="flex items-center gap-1.5">
              <li>
                <a href="/" className="hover:text-primary transition-colors">
                  ホーム
                </a>
              </li>
              {breadcrumbs.map((bc, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span>/</span>
                  {bc.href ? (
                    <a
                      href={bc.href}
                      className="hover:text-primary transition-colors"
                    >
                      {bc.label}
                    </a>
                  ) : (
                    <span className="text-neutral-700">{bc.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-2xl font-bold text-primary-700 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-neutral-600">{description}</p>
        )}
      </div>
    </div>
  );
}
