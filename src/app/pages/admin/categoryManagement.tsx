// ============================================================================
// CategoryManagementPage — CRUD for issue categories.
// Add Category and Edit Category both use the CategoryFormModal.
// ============================================================================

// Imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminLayout } from "../../layouts/adminLayout";
import { PrimaryButton } from "../../components/auth/buttons";
import { PriorityBadge } from "../../components/dashboard/badges";
import { CategoryFormModal } from "../../components/admin/categoryFormModal";
import { LoadingState } from "../../components/shared/loadingState";
import { getCategories, saveCategory, updateCategory } from "../../services/adminService";
import type { IssueCategory } from "../../constants/admin";
import type { RequestPriority } from "../../constants/resident";

// Component
export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<IssueCategory | null>(null);

  useEffect(() => {
    let active = true;
    getCategories().then((data) => { if (!active) return; setCategories(data); setLoading(false); });
    return () => { active = false; };
  }, []);

  const openAdd  = useCallback(() => { setEditing(null);  setModalOpen(true); }, []);
  const openEdit = useCallback((cat: IssueCategory) => { setEditing(cat); setModalOpen(true); }, []);

  const handleSave = useCallback(async (data: Omit<IssueCategory, "id">) => {
    if (editing) {
      await updateCategory(editing.id, data);
      setCategories((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...data } : c));
    } else {
      const newCat = await saveCategory(data);
      setCategories((prev) => [...prev, newCat]);
    }
  }, [editing]);

  const handleToggle = useCallback(async (id: string) => {
    await updateCategory(id, { active: !categories.find((c) => c.id === id)?.active });
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c));
  }, [categories]);

  const active   = useMemo(() => categories.filter((c) => c.active).length,   [categories]);
  const inactive = useMemo(() => categories.filter((c) => !c.active).length, [categories]);

  return (
    <AdminLayout
      title="Issue Categories"
      actions={
        <PrimaryButton fullWidth={false} onClick={openAdd}>
          <Plus size={18} /> Add Category
        </PrimaryButton>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Summary */}
        <div className="flex gap-3 text-sm text-slate-500">
          <span>{categories.length} total</span>
          <span>·</span>
          <span className="text-green-400">{active} active</span>
          <span>·</span>
          <span className="text-red-400">{inactive} disabled</span>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingState />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            {/* Desktop */}
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Category Name</th>
                    <th className="px-5 py-3">Slug</th>
                    <th className="px-5 py-3">Default Priority</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="bg-slate-900/20 transition-colors hover:bg-slate-800/40">
                      <td className="px-5 py-3 text-slate-200">{cat.name}</td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-500">{cat.slug}</td>
                      <td className="px-5 py-3">
                        <PriorityBadge priority={cat.defaultPriority as RequestPriority} />
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full border px-2.5 py-1 text-xs ${
                          cat.active
                            ? "border-green-500/30 bg-green-500/10 text-green-300"
                            : "border-red-500/30 bg-red-500/10 text-red-300"
                        }`}>
                          {cat.active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(cat)}
                            title="Edit"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleToggle(cat.id)}
                            title={cat.active ? "Disable" : "Enable"}
                            className={`rounded-lg p-1.5 transition-colors ${
                              cat.active
                                ? "text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                                : "text-slate-400 hover:bg-green-500/10 hover:text-green-400"
                            }`}
                          >
                            {cat.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col divide-y divide-slate-800 md:hidden">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-start justify-between gap-3 px-4 py-4">
                  <div>
                    <p className="text-sm text-slate-200">{cat.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">{cat.slug}</p>
                    <div className="mt-2 flex gap-2">
                      <PriorityBadge priority={cat.defaultPriority as RequestPriority} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(cat)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200"><Pencil size={15} /></button>
                    <button onClick={() => handleToggle(cat.id)} className={`rounded-lg p-1.5 ${cat.active ? "text-red-400" : "text-green-400"}`}>
                      {cat.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CategoryFormModal
        open={modalOpen}
        category={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </AdminLayout>
  );
}
