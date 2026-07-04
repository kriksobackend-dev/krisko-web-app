import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminServices, AdminCourse } from "../lib/services";

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  instructor_name: z.string().min(1, "Instructor is required"),
  price: z.coerce.number().positive("Price must be > 0"),
  duration_hours: z.coerce.number().min(0).default(0),
  difficulty: z.string().default("beginner"),
  thumbnail_url: z.string().optional(),
  category_tag: z.string().default("general"),
  lessons_count: z.coerce.number().int().min(0).default(0),
});
type CourseForm = z.infer<typeof courseSchema>;

const editSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  instructor_name: z.string().min(1),
  price: z.coerce.number().positive(),
  duration_hours: z.coerce.number().min(0),
  difficulty: z.string(),
  thumbnail_url: z.string().optional(),
  category_tag: z.string(),
  lessons_count: z.coerce.number().int().min(0),
});
type EditForm = z.infer<typeof editSchema>;

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm transition-all focus:border-krikso-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-krikso-100";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-600";

const diffBadge: Record<string, string> = {
  beginner: "badge badge-green",
  intermediate: "badge badge-amber",
  advanced: "badge badge-red",
};

export function CoursesPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["admin-courses"], queryFn: adminServices.listCourses });
  const [showCreate, setShowCreate] = useState(false);
  const [editCourse, setEditCourse] = useState<AdminCourse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Create
  const createForm = useForm<CourseForm>({ resolver: zodResolver(courseSchema), defaultValues: { difficulty: "beginner", category_tag: "general", duration_hours: 0, lessons_count: 0 } });
  const createMut = useMutation({
    mutationFn: (v: CourseForm) => adminServices.createCourse(v),
    onSuccess: () => { createForm.reset(); setShowCreate(false); qc.invalidateQueries({ queryKey: ["admin-courses"] }); flash("Course created!"); },
  });

  // Edit
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });
  const editMut = useMutation({
    mutationFn: (v: EditForm) => adminServices.updateCourse(editCourse!.id, v),
    onSuccess: () => { setEditCourse(null); qc.invalidateQueries({ queryKey: ["admin-courses"] }); flash("Course updated!"); },
  });

  // Delete
  const deleteMut = useMutation({
    mutationFn: (id: string) => adminServices.deleteCourse(id),
    onSuccess: () => { setDeleteId(null); qc.invalidateQueries({ queryKey: ["admin-courses"] }); flash("Course deleted!"); },
  });

  // Toggle publish
  const toggleMut = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      adminServices.updateCourse(id, { is_published: !published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-courses"] }),
  });

  const openEdit = (c: AdminCourse) => {
    setEditCourse(c);
    editForm.reset({
      title: c.title, slug: c.slug || "", description: c.description || "",
      instructor_name: c.instructor_name || "", price: c.price,
      duration_hours: c.duration_hours || 0, difficulty: c.difficulty || "beginner",
      thumbnail_url: c.thumbnail_url || "", category_tag: c.category_tag || "general",
      lessons_count: c.lessons_count || 0,
    });
  };

  const renderForm = (form: ReturnType<typeof useForm<any>>, onSubmit: (v: any) => void, isPending: boolean, submitLabel: string, onCancel: () => void) => (
    <form className="mt-5 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Title</label>
          <input className={inputCls} placeholder="Course Title" {...form.register("title")} />
        </div>
        <div>
          <label className={labelCls}>Slug</label>
          <input className={inputCls} placeholder="course-slug" {...form.register("slug")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Instructor</label>
          <input className={inputCls} placeholder="Dr. Name" {...form.register("instructor_name")} />
        </div>
        <div>
          <label className={labelCls}>Price (₹)</label>
          <input className={inputCls} type="number" step="0.01" placeholder="999" {...form.register("price")} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Duration (hrs)</label>
          <input className={inputCls} type="number" step="0.5" {...form.register("duration_hours")} />
        </div>
        <div>
          <label className={labelCls}>Lessons</label>
          <input className={inputCls} type="number" {...form.register("lessons_count")} />
        </div>
        <div>
          <label className={labelCls}>Difficulty</label>
          <select className={inputCls} {...form.register("difficulty")}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Category Tag</label>
        <input className={inputCls} placeholder="organic-farming" {...form.register("category_tag")} />
      </div>
      <div>
        <label className={labelCls}>Thumbnail URL</label>
        <input className={inputCls} placeholder="https://..." {...form.register("thumbnail_url")} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea className={inputCls} rows={3} placeholder="Course description..." {...form.register("description")} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={isPending} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-50">
          {isPending ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-outfit">Courses</h1>
          <p className="mt-1 text-sm text-slate-500">Manage farming courses</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:brightness-110"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Course
        </button>
      </div>

      {toast && (
        <div className="rounded-xl border border-krikso-200 bg-krikso-50 px-4 py-3 text-sm font-medium text-krikso-700">
          ✓ {toast}
        </div>
      )}

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-bold text-slate-800">All Courses ({data.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-50 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3 font-medium">Course</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Difficulty</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="px-6 py-4"><div className="h-4 w-40 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 animate-pulse rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No courses yet. Click "Add Course" to create one.
                  </td>
                </tr>
              ) : (
                data.map((c) => (
                  <tr key={c.id} className="table-row-hover border-b border-slate-50">
                    <td className="px-6 py-3">
                      <p className="font-semibold text-slate-800">{c.title}</p>
                      <p className="text-xs text-slate-400 font-mono">{c.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-700">₹{c.price}</td>
                    <td className="px-6 py-3">
                      <span className={diffBadge[c.difficulty || "beginner"] || "badge badge-slate"}>
                        {c.difficulty || "beginner"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => toggleMut.mutate({ id: c.id, published: c.published })}
                        className={`badge cursor-pointer ${c.published ? "badge-green" : "badge-amber"}`}
                      >
                        {c.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setDeleteId(c.id)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600">
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

      {/* Create Modal */}
      {showCreate && (
        <>
          <div className="modal-backdrop" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            <div className="modal-content w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Create Course</h2>
              <p className="mt-1 text-sm text-slate-500">Fill in the course details</p>
              {renderForm(createForm, (v) => createMut.mutate(v), createMut.isPending, "Create Course", () => setShowCreate(false))}
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editCourse && (
        <>
          <div className="modal-backdrop" onClick={() => setEditCourse(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            <div className="modal-content w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Edit Course</h2>
              <p className="mt-1 text-sm text-slate-500">Update course details</p>
              {renderForm(editForm, (v) => editMut.mutate(v), editMut.isPending, "Save Changes", () => setEditCourse(null))}
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation */}
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
              <h3 className="mt-4 text-base font-bold text-slate-900">Delete Course?</h3>
              <p className="mt-2 text-sm text-slate-500">This action cannot be undone.</p>
              <div className="mt-6 flex justify-center gap-3">
                <button onClick={() => setDeleteId(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cancel</button>
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
