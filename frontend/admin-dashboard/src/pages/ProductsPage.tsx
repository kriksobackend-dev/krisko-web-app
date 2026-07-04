import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminServices, AdminProduct } from "../lib/services";

const productSchema = z.object({
  seller_id: z.string().uuid("Enter a valid Seller UUID"),
  category_id: z.string().uuid("Enter a valid Category UUID"),
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  unit_price: z.coerce.number().positive("Price must be > 0"),
  unit_label: z.string().default("kg"),
});
type ProductForm = z.infer<typeof productSchema>;

const editSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  unit_price: z.coerce.number().positive(),
  unit_label: z.string(),
});
type EditForm = z.infer<typeof editSchema>;

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm transition-all focus:border-krikso-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-krikso-100";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-600";

export function ProductsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: adminServices.listProducts });
  const [showCreate, setShowCreate] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Create
  const createForm = useForm<ProductForm>({ resolver: zodResolver(productSchema), defaultValues: { unit_label: "kg" } });
  const createMut = useMutation({
    mutationFn: (v: ProductForm) => adminServices.createProduct(v),
    onSuccess: () => { createForm.reset(); setShowCreate(false); qc.invalidateQueries({ queryKey: ["admin-products"] }); flash("Product created!"); },
  });

  // Edit
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });
  const editMut = useMutation({
    mutationFn: (v: EditForm) => adminServices.updateProduct(editProduct!.id, v),
    onSuccess: () => { setEditProduct(null); qc.invalidateQueries({ queryKey: ["admin-products"] }); flash("Product updated!"); },
  });

  // Delete
  const deleteMut = useMutation({
    mutationFn: (id: string) => adminServices.deleteProduct(id),
    onSuccess: () => { setDeleteId(null); qc.invalidateQueries({ queryKey: ["admin-products"] }); flash("Product deleted!"); },
  });

  // Toggle publish
  const toggleMut = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      adminServices.updateProduct(id, { is_published: !published }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); },
  });

  const openEdit = (p: AdminProduct) => {
    setEditProduct(p);
    editForm.reset({ name: p.name, slug: p.slug || "", description: p.description || "", unit_price: p.price, unit_label: p.unit_label || "kg" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-outfit">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-krikso-500 to-krikso-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-krikso-500/25 transition-all hover:shadow-xl hover:brightness-110"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="rounded-xl border border-krikso-200 bg-krikso-50 px-4 py-3 text-sm font-medium text-krikso-700">
          ✓ {toast}
        </div>
      )}

      {/* Products Table */}
      <div className="admin-card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-bold text-slate-800">All Products ({data.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-50 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-6 py-4"><div className="h-4 w-40 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 animate-pulse rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No products yet. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                data.map((p) => (
                  <tr key={p.id} className="table-row-hover border-b border-slate-50">
                    <td className="px-6 py-3">
                      <p className="font-semibold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{p.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-700">₹{p.price}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => toggleMut.mutate({ id: p.id, published: p.published })}
                        className={`badge cursor-pointer ${p.published ? "badge-green" : "badge-amber"}`}
                      >
                        {p.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setDeleteId(p.id)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <>
          <div className="modal-backdrop" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-content w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Create Product</h2>
              <p className="mt-1 text-sm text-slate-500">Fill in the product details</p>
              <form className="mt-5 space-y-4" onSubmit={createForm.handleSubmit((v) => createMut.mutate(v))}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Seller UUID</label>
                    <input className={inputCls} placeholder="UUID..." {...createForm.register("seller_id")} />
                    {createForm.formState.errors.seller_id && <p className="mt-1 text-xs text-red-500">{createForm.formState.errors.seller_id.message}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Category UUID</label>
                    <input className={inputCls} placeholder="UUID..." {...createForm.register("category_id")} />
                    {createForm.formState.errors.category_id && <p className="mt-1 text-xs text-red-500">{createForm.formState.errors.category_id.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Product Name</label>
                    <input className={inputCls} placeholder="Organic Wheat Seeds" {...createForm.register("name")} />
                  </div>
                  <div>
                    <label className={labelCls}>Slug</label>
                    <input className={inputCls} placeholder="organic-wheat-seeds" {...createForm.register("slug")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Price (₹)</label>
                    <input className={inputCls} type="number" step="0.01" placeholder="299" {...createForm.register("unit_price")} />
                  </div>
                  <div>
                    <label className={labelCls}>Unit</label>
                    <select className={inputCls} {...createForm.register("unit_label")}>
                      <option value="kg">kg</option>
                      <option value="quintal">quintal</option>
                      <option value="ton">ton</option>
                      <option value="piece">piece</option>
                      <option value="liter">liter</option>
                      <option value="packet">packet</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea className={inputCls} rows={2} placeholder="Brief description..." {...createForm.register("description")} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={createMut.isPending} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-50">
                    {createMut.isPending ? "Creating..." : "Create Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── Edit Modal ── */}
      {editProduct && (
        <>
          <div className="modal-backdrop" onClick={() => setEditProduct(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-content w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Edit Product</h2>
              <p className="mt-1 text-sm text-slate-500">Update product details</p>
              <form className="mt-5 space-y-4" onSubmit={editForm.handleSubmit((v) => editMut.mutate(v))}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Product Name</label>
                    <input className={inputCls} {...editForm.register("name")} />
                  </div>
                  <div>
                    <label className={labelCls}>Slug</label>
                    <input className={inputCls} {...editForm.register("slug")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Price (₹)</label>
                    <input className={inputCls} type="number" step="0.01" {...editForm.register("unit_price")} />
                  </div>
                  <div>
                    <label className={labelCls}>Unit</label>
                    <select className={inputCls} {...editForm.register("unit_label")}>
                      <option value="kg">kg</option>
                      <option value="quintal">quintal</option>
                      <option value="ton">ton</option>
                      <option value="piece">piece</option>
                      <option value="liter">liter</option>
                      <option value="packet">packet</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea className={inputCls} rows={2} {...editForm.register("description")} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setEditProduct(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={editMut.isPending} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-50">
                    {editMut.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteId && (
        <>
          <div className="modal-backdrop" onClick={() => setDeleteId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-content w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Delete Product?</h3>
              <p className="mt-2 text-sm text-slate-500">This action cannot be undone.</p>
              <div className="mt-6 flex justify-center gap-3">
                <button onClick={() => setDeleteId(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={() => deleteMut.mutate(deleteId)} disabled={deleteMut.isPending} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-red-700 disabled:opacity-50">
                  {deleteMut.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
