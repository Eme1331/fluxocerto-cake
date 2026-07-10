import { useNavigate } from 'react-router-dom';

export default function Header({ title, subtitle, onBack, right }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur px-5 pt-6 pb-3 flex items-center gap-3">
      {onBack !== undefined && (
        <button
          onClick={() => (onBack === true ? navigate(-1) : onBack())}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-accent shadow-sm active:scale-95 transition shrink-0"
        >
          ←
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-text truncate">{title}</h1>
        {subtitle && <p className="text-xs text-text-light truncate">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
