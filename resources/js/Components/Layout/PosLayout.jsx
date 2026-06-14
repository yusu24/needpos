import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import { ArrowLeft, Store, User, Clock, Wifi } from 'lucide-react';

export default function PosLayout({ children }) {
  const { auth } = usePage().props;
  const user = auth.user;
  const outlet = user.outlet;

  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="h-16 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 backdrop-blur-md sticky top-0 z-30">
        {/* Left section: Back and Outlet */}
        <div className="flex items-center gap-4">
          <Link
            href={route('dashboard')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all duration-200 group"
          >
            <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            Dashboard
          </Link>
          <div className="h-5 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Store size={14} />
            </div>
            <div>
              <h1 className="text-xs font-bold leading-tight">{outlet ? outlet.name : 'Demo Outlet'}</h1>
              <p className="text-[10px] text-slate-400 font-medium">Kasir Screen</p>
            </div>
          </div>
        </div>

        {/* Middle section: Real-time clock and connection status */}
        <div className="hidden md:flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Clock size={13} className="text-indigo-400" />
            <span>
              {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <Wifi size={11} className="animate-pulse" />
            <span>ONLINE</span>
          </div>
        </div>

        {/* Right section: User Profile Dropdown */}
        <div className="relative">
          <Dropdown>
            <Dropdown.Trigger>
              <button className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors duration-200">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium capitalize">
                    {user.roles && user.roles.length > 0 ? user.roles[0].name : 'user'}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-800 text-indigo-400 font-bold border border-slate-700 flex items-center justify-center shadow-md group-hover:bg-slate-750 transition-all duration-200">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>
            </Dropdown.Trigger>
            <Dropdown.Content align="right" width="48">
              <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {user.roles && user.roles.length > 0 ? user.roles[0].name : 'user'}
                </p>
              </div>
              <Dropdown.Link href={route('profile.edit')}>
                Setting Profile
              </Dropdown.Link>
              <Dropdown.Link href={route('logout')} method="post" as="button" className="text-rose-600 hover:text-rose-700">
                Keluar
              </Dropdown.Link>
            </Dropdown.Content>
          </Dropdown>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
