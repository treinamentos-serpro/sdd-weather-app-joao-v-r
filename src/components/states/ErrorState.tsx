interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

function ErrorState({ message = 'Não foi possível carregar os dados.', onRetry }: ErrorStateProps) {
  return (
    <div
      aria-live="assertive"
      className="flex w-full flex-col items-center gap-4 rounded-2xl border border-red-300/20 bg-red-950/20 p-8 text-center text-white shadow-glass backdrop-blur-md"
      role="alert"
    >
      <p className="text-white/85">{message}</p>
      <button
        className="min-h-11 rounded-xl bg-accent-500 px-5 font-semibold text-white transition hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </div>
  );
}

export default ErrorState;
