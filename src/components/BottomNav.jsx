import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', icon: '🏠', label: 'Início', end: true },
  { to: '/componentes', icon: '🧁', label: 'Componentes' },
  { to: '/receitas', icon: '🎂', label: 'Receitas' },
  { to: '/config', icon: '⚙️', label: 'Config' },
];

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-accent-light/60 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex justify-around z-20">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl text-[11px] font-medium transition ${
              isActive ? 'text-primary-dark bg-primary/15' : 'text-text-light'
            }`
          }
        >
          <span className="text-xl leading-none">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
