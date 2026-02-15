import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { id: 'graph', path: '/graph', icon: 'account_tree', label: 'Graph' },
  { id: 'dashboard', path: '/dashboard', icon: 'grid_view', label: 'Dashboard' },
  { id: 'chatbot', path: '/chat', icon: 'chat_bubble', label: 'Ask Memory' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <nav className="w-16 lg:w-20 flex flex-col items-center py-8 border-r border-border bg-white/50 z-50 shrink-0">
      <div className="mb-12">
        <Link to="/graph">
          <div className="w-10 h-10 rounded-full border border-forest/20 flex items-center justify-center text-forest cursor-pointer hover:border-forest/50 transition-colors">
            <span className="material-symbols-outlined">bubble_chart</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 flex flex-col gap-8">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`relative transition-colors duration-300 cursor-pointer ${isActive ? 'text-forest' : 'text-text-muted hover:text-forest'
                }`}
              title={item.label}
            >
              <span
                className="material-symbols-outlined"
                style={
                  isActive
                    ? { fontVariationSettings: "'FILL' 1, 'wght' 200, 'GRAD' 0, 'opsz' 24" }
                    : undefined
                }
              >
                {item.icon}
              </span>
              {isActive && (
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-forest" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto">
        <img
          alt="User profile"
          className="w-8 h-8 rounded-full grayscale hover:grayscale-0 transition-all duration-500 border border-border cursor-pointer"
          src="https://i.pravatar.cc/64?u=cognitive-os-user"
        />
      </div>
    </nav>
  );
}
