interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-300/20 bg-white/5 p-6 text-white shadow-glass backdrop-blur-md"
    >
      <p className="text-sm text-white/80">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Tentar novamente
      </button>
    </div>
  );
}
