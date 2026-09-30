interface LoadingStateProps {
  message?: string;
}

function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <div
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
      className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8 text-white shadow-glass backdrop-blur-md"
      role="status"
    >
      <span className="flex items-center gap-3 text-white/80">
        <span
          aria-hidden="true"
          className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-accent-400 motion-reduce:animate-none"
        />
        {message}
      </span>
    </div>
  );
}

export default LoadingState;
