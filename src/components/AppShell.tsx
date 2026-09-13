import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Building2, Users, Receipt, Banknote,
  FileBarChart2, AlertTriangle, FileText, LogOut,
  ChevronLeft, ChevronRight, FolderOpen, LayoutTemplate, Settings, Scale,
} from 'lucide-react';
import AIChatbot from '@/components/AIChatbot';

const NAV_MAIN = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard',         end: true,  tid: 'nav-dashboard'   },
  { to: '/condomini',  icon: Building2,        label: 'Condomini',                     tid: 'nav-condomini'   },
  { to: '/fornitori',  icon: Users,            label: 'Fornitori',                     tid: 'nav-fornitori'   },
  { to: '/spese',      icon: Receipt,          label: 'Spese',                         tid: 'nav-spese'       },
  { to: '/banca',      icon: Banknote,         label: 'Movimenti Bancari',              tid: 'nav-banca'       },
  { to: '/consuntivi', icon: FileBarChart2,    label: 'Consuntivi',                    tid: 'nav-consuntivi'  },
  { to: '/debiti',     icon: AlertTriangle,    label: 'Debiti & Solleciti',             tid: 'nav-debiti'      },
];

const NAV_TOOLS = [
  { to: '/modulistica', icon: FileText,       label: 'Modulistica',                   tid: 'nav-modulistica' },
  { to: '/documenti',   icon: FolderOpen,     label: 'Documenti',                     tid: 'nav-documenti'   },
  { to: '/templates',   icon: LayoutTemplate, label: 'Template',                      tid: 'nav-templates'   },
  { to: '/legale',      icon: Scale,          label: 'Studi Legali',                  tid: 'nav-legale'      },
];

const NAV_BOTTOM = [
  { to: '/impostazioni', icon: Settings, label: 'Impostazioni', tid: 'nav-impostazioni' },
];

function NavItem({
  to, icon: Icon, label, end, tid, collapsed,
}: {
  to: string; icon: React.ElementType; label: string;
  end?: boolean; tid: string; collapsed: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      data-testid={tid}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

function NavSection({
  label, items, collapsed,
}: {
  label: string; items: typeof NAV_MAIN; collapsed: boolean;
}) {
  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 px-3 mb-1 mt-3">
          {label}
        </p>
      )}
      {items.map(item => (
        <NavItem key={item.to} {...item} collapsed={collapsed} />
      ))}
    </div>
  );
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Sidebar ── */}
      <aside
        className={`${collapsed ? 'w-16' : 'w-60'} transition-[width] duration-200 ease-in-out
          flex flex-col bg-slate-900 border-r border-slate-800 sticky top-0 h-screen z-30 shadow-sidebar`}
        data-testid="sidebar"
      >
        {/* Logo */}
        <div className="h-15 flex items-center px-3 border-b border-slate-800 py-4">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center
                          text-white font-display font-black text-base shrink-0 shadow-md">
            D
          </div>
          {!collapsed && (
            <div className="ml-3 min-w-0">
              <p className="font-display font-extrabold text-white text-sm leading-tight truncate">DomusAdmin</p>
              <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400">ERP Condominiale</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-3 overflow-y-auto">
          <NavSection label="Gestione" items={NAV_MAIN} collapsed={collapsed} />
          <NavSection label="Strumenti" items={NAV_TOOLS} collapsed={collapsed} />
        </nav>

        {/* Bottom nav + collapse toggle */}
        <div className="border-t border-slate-800 px-2 py-2 space-y-0.5">
          {NAV_BOTTOM.map(item => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 rounded-lg
                       text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            data-testid="btn-toggle-sidebar"
            title={collapsed ? 'Espandi menu' : 'Comprimi menu'}
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4" />
              : <><ChevronLeft className="w-4 h-4 mr-1" /><span className="text-xs">Comprimi</span></>
            }
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center
                           justify-between px-5 sticky top-0 z-20 shadow-sm">
          <div className="font-display font-bold text-slate-700 text-[15px]"
               data-testid="header-title">
            Gestione Amministrativa Condominiale
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right leading-tight hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">Amministratore</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Studio Domus</p>
            </div>
            <button
              onClick={() => nav('/login')}
              className="btn-ghost text-xs gap-1 ml-1"
              data-testid="btn-logout"
            >
              <LogOut className="w-3.5 h-3.5" /> Esci
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto animate-fade-up">
          <Outlet />
        </main>
      </div>
      <AIChatbot />
    </div>
  );
}
