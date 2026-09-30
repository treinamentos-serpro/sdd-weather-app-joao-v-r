interface EmptyStateProps {
  title?: string;
  hint?: string;
}

function EmptyState({
  title = 'Pesquise uma cidade',
  hint = 'Informe uma cidade para consultar o clima atual e a previsão.',
}: EmptyStateProps) {
  return (
    <section
      aria-labelledby="empty-state-title"
      className="flex w-full flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white shadow-glass backdrop-blur-md"
    >
      <h1 className="text-2xl font-semibold" id="empty-state-title">
        {title}
      </h1>
      <p className="mt-2 max-w-md text-white/75">{hint}</p>
    </section>
  );
}

export default EmptyState;
