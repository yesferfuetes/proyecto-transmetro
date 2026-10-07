import type { ReactElement } from 'react';

export default function Cargando(): ReactElement {
  return (
    <div role="status" className="px-6 py-16 text-ink-muted">
      Cargando…
    </div>
  );
}
