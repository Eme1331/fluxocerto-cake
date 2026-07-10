import { useRef } from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div {...props} className={`bg-white rounded-[22px] shadow-sm shadow-black/5 p-4 ${className}`}>
      {children}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block mb-3">
      {label && (
        <span className="block text-xs font-medium text-text-light mb-1 ml-1">{label}</span>
      )}
      {children}
    </label>
  );
}

const inputBase =
  'w-full rounded-2xl border border-accent-light/70 bg-white px-4 py-2.5 text-sm text-text placeholder:text-text-light/60 outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary/30 transition';

export function Input(props) {
  return <input {...props} className={`${inputBase} ${props.className || ''}`} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${inputBase} ${props.className || ''}`}>
      {children}
    </select>
  );
}

export function TextArea(props) {
  return <textarea {...props} className={`${inputBase} resize-none ${props.className || ''}`} />;
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-primary-dark text-white active:scale-[0.98]',
    outline: 'bg-white text-accent border border-accent-light active:scale-[0.98]',
    ghost: 'bg-accent-light/40 text-accent active:scale-[0.98]',
    danger: 'bg-danger/90 text-white active:scale-[0.98]',
  };
  return (
    <button
      {...props}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition shadow-sm ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`w-10 h-10 flex items-center justify-center rounded-full bg-accent-light/40 text-accent text-lg active:scale-95 transition ${className}`}
    >
      {children}
    </button>
  );
}

export function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-1">
      <h2 className="text-base font-bold text-text">{children}</h2>
      {right}
    </div>
  );
}

export function PhotoPicker({ value, onChange, label = 'Adicionar foto' }) {
  const inputRef = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-36 rounded-3xl border-2 border-dashed border-primary/50 bg-primary/10 overflow-hidden">
      {value ? (
        <>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-black/45 flex items-center justify-center gap-2 py-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-semibold text-white bg-white/25 rounded-full px-3 py-1.5"
            >
              🔄 Trocar foto
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-xs font-semibold text-white bg-danger/80 rounded-full px-3 py-1.5"
            >
              ✕ Remover
            </button>
          </div>
        </>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
          <div className="flex flex-col items-center gap-1 text-primary-dark">
            <span className="text-3xl">📷</span>
            <span className="text-xs font-medium">{label}</span>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export function EmptyState({ icon = '🍰', title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="font-semibold text-text">{title}</p>
      {subtitle && <p className="text-sm text-text-light mt-1">{subtitle}</p>}
    </div>
  );
}

export function StatPill({ label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-accent-light/40 text-accent',
    success: 'bg-success/15 text-success',
    danger: 'bg-danger/15 text-danger',
    primary: 'bg-primary/20 text-primary-dark',
  };
  return (
    <div className={`rounded-2xl px-3 py-2 ${tones[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
