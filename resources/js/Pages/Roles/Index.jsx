import React, { useState } from 'react';
import AppLayout from '@/Components/Layout/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Shield, Plus, Trash2, CheckSquare, Square, Lock, RefreshCw, AlertCircle, CheckCircle, Search } from 'lucide-react';

const ROLE_COLORS = {
    owner:       { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    manager:     { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
    cashier:     { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    stock_admin: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
};
const DEFAULT_COLOR = { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };

const PROTECTED_ROLES = ['owner', 'manager', 'cashier', 'stock_admin'];
const PROTECTED_PERMISSIONS = [
    'view users', 'create users', 'edit users', 'delete users',
    'view roles', 'manage roles', 'view settings', 'edit settings', 'view dashboard'
];

export default function Index({ roles, permissions, flash }) {
    const [activeRole, setActiveRole] = useState(roles[0] ?? null);
    const [saving, setSaving] = useState(false);
    const [assignSearch, setAssignSearch] = useState('');
    const [localPerms, setLocalPerms] = useState(() => {
        const map = {};
        roles.forEach(r => { map[r.id] = [...r.permissions]; });
        return map;
    });

    const filteredPermissions = permissions.filter(perm => 
        perm.name.toLowerCase().includes(assignSearch.toLowerCase())
    );

    // Forms
    const roleForm  = useForm({ name: '' });
    const permForm  = useForm({ name: '' });

    const color = activeRole ? (ROLE_COLORS[activeRole.name] ?? DEFAULT_COLOR) : DEFAULT_COLOR;

    const toggle = (permName) => {
        if (!activeRole) return;
        setLocalPerms(prev => {
            const cur = prev[activeRole.id] ?? [];
            return {
                ...prev,
                [activeRole.id]: cur.includes(permName)
                    ? cur.filter(p => p !== permName)
                    : [...cur, permName],
            };
        });
    };

    const syncPerms = () => {
        if (!activeRole) return;
        setSaving(true);
        router.post(route('admin.roles.sync', activeRole.id), {
            permissions: localPerms[activeRole.id] ?? [],
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    const deleteRole = (role) => {
        if (!confirm(`Hapus role "${role.name}"?`)) return;
        router.delete(route('admin.roles.destroy', role.id), { preserveScroll: true });
    };

    const deletePermission = (perm) => {
        if (!confirm(`Hapus permission "${perm.name}"?`)) return;
        router.delete(route('admin.permissions.destroy', perm.id), { preserveScroll: true });
    };

    return (
        <AppLayout header="Roles & Permissions">
            <Head title="Roles & Permissions" />

            {/* Flash messages */}
            {flash?.success && (
                <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                    <CheckCircle size={14} /> {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    <AlertCircle size={14} /> {flash.error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Kolom Kiri: Roles ── */}
                <div className="space-y-4">
                    {/* Add Role */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Shield size={13} /> Tambah Role Baru
                        </h2>
                        <form onSubmit={e => { e.preventDefault(); roleForm.post(route('admin.roles.store'), { preserveScroll: true, onSuccess: () => roleForm.reset() }); }}
                              className="flex gap-2">
                            <input
                                value={roleForm.data.name}
                                onChange={e => roleForm.setData('name', e.target.value)}
                                placeholder="Nama role baru..."
                                className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                            />
                            <button type="submit" disabled={roleForm.processing}
                                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50">
                                <Plus size={16} />
                            </button>
                        </form>
                        {roleForm.errors.name && <p className="text-[10px] text-rose-500 mt-1">{roleForm.errors.name}</p>}
                    </div>

                    {/* Roles list */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daftar Role</h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {roles.map(role => {
                                const c = ROLE_COLORS[role.name] ?? DEFAULT_COLOR;
                                const isActive = activeRole?.id === role.id;
                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => {
                                            setActiveRole(role);
                                        }}
                                        className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors cursor-pointer ${isActive ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                                            <div>
                                                <p className={`text-xs font-bold capitalize ${isActive ? 'text-indigo-700' : 'text-slate-800'}`}>{role.name}</p>
                                                <p className="text-[10px] text-slate-400">{(localPerms[role.id] ?? role.permissions).length} permissions</p>
                                            </div>
                                        </div>
                                        {!PROTECTED_ROLES.includes(role.name) && (
                                            <span
                                                onClick={e => { e.stopPropagation(); deleteRole(role); }}
                                                className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Trash2 size={12} />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Kolom Tengah: Assign Permissions ── */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
                    <div className={`px-5 py-4 border-b border-slate-100 flex items-center justify-between ${color.bg}`}>
                        <div>
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assign Permissions</h2>
                            {activeRole && (
                                <p className={`text-sm font-bold capitalize mt-0.5 ${color.text}`}>{activeRole.name}</p>
                            )}
                        </div>
                        {activeRole && (
                            <button
                                onClick={syncPerms}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <RefreshCw size={12} className={saving ? 'animate-spin' : ''} />
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        )}
                    </div>

                    {activeRole && (
                        <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 relative">
                            <Search className="absolute left-8 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Cari permission..."
                                value={assignSearch}
                                onChange={e => setAssignSearch(e.target.value)}
                                className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                            />
                            {assignSearch && (
                                <button 
                                    onClick={() => setAssignSearch('')} 
                                    className="absolute right-8 text-slate-400 hover:text-slate-600 text-xs"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    )}

                    {!activeRole ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs flex-col gap-2 py-12">
                            <Shield size={28} className="text-slate-300" />
                            <span>Pilih role di sebelah kiri</span>
                        </div>
                    ) : (
                        <div className="flex-1 max-h-96 overflow-y-auto divide-y divide-slate-100 light-scrollbar">
                            {filteredPermissions.length === 0 ? (
                                <div className="p-5 text-center text-slate-400 text-xs">
                                    Tidak ada permission "{assignSearch}"
                                </div>
                            ) : (
                                filteredPermissions.map(perm => {
                                    const checked = (localPerms[activeRole.id] ?? activeRole.permissions).includes(perm.name);
                                    return (
                                        <button
                                            key={perm.id}
                                            onClick={() => toggle(perm.name)}
                                            className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors cursor-pointer ${checked ? 'bg-indigo-50/40' : 'hover:bg-slate-50'}`}
                                        >
                                            {checked
                                                ? <CheckSquare size={15} className="text-indigo-600 shrink-0" />
                                                : <Square size={15} className="text-slate-300 shrink-0" />
                                            }
                                            <span className={`text-xs font-medium ${checked ? 'text-indigo-700' : 'text-slate-600'}`}>
                                                {perm.name}
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* ── Kolom Kanan: Permissions ── */}
                <div className="space-y-4">
                    {/* Add Permission */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Lock size={13} /> Tambah Permission Baru
                        </h2>
                        <form onSubmit={e => { e.preventDefault(); permForm.post(route('admin.permissions.store'), { preserveScroll: true, onSuccess: () => permForm.reset() }); }}
                              className="flex gap-2">
                            <input
                                value={permForm.data.name}
                                onChange={e => permForm.setData('name', e.target.value)}
                                placeholder="Cth: view reports..."
                                className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all"
                            />
                            <button type="submit" disabled={permForm.processing}
                                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50">
                                <Plus size={16} />
                            </button>
                        </form>
                        {permForm.errors.name && <p className="text-[10px] text-rose-500 mt-1">{permForm.errors.name}</p>}
                    </div>

                    {/* Permissions list */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daftar Permission</h2>
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">{permissions.length}</span>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto light-scrollbar">
                            {permissions.map(perm => (
                                <div key={perm.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 group transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <Lock size={11} className="text-slate-400 shrink-0" />
                                        <span className="text-xs font-medium text-slate-700">{perm.name}</span>
                                    </div>
                                    {!PROTECTED_PERMISSIONS.includes(perm.name) && (
                                        <button
                                            onClick={() => deletePermission(perm)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                        >
                                            <Trash2 size={11} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
