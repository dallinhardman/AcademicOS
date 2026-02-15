"use client";

import { useState } from "react";
import Link from "next/link";
import { useAcademic } from "@/context/AcademicContext";

export default function SemestersPage() {
  const { state, addSemester, deleteSemester } = useAcademic();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    addSemester(name.trim());
    setName("");
    setShowForm(false);
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Semesters</h1>
          <p className="text-slate-600 mt-1">Organize your courses by semester.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-academic-600 text-white rounded-lg text-sm font-medium hover:bg-academic-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Semester
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Create Semester</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. Spring 2026"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent"
              autoFocus
            />
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-academic-600 text-white rounded-lg text-sm font-medium hover:bg-academic-700"
            >
              Create
            </button>
            <button
              onClick={() => { setShowForm(false); setName(""); }}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {state.semesters.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <p className="text-slate-500 mb-1">No semesters yet</p>
          <p className="text-sm text-slate-400">Create a semester to start organizing your courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.semesters.map((sem) => {
            const units = state.units.filter((u) => u.semesterId === sem.id);
            const contents = state.contents.filter((c) =>
              units.some((u) => u.id === c.unitId)
            );
            const summaries = state.summaries.filter((s) =>
              units.some((u) => u.id === s.unitId)
            );

            return (
              <Link
                key={sem.id}
                href={`/semesters/${sem.id}`}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-academic-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-academic-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm(`Delete "${sem.name}" and all its units?`)) {
                        deleteSemester(sem.id);
                      }
                    }}
                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-academic-700 transition-colors">
                  {sem.name}
                </h3>
                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                  <span>{units.length} units</span>
                  <span>{contents.length} files</span>
                  <span>{summaries.length} summaries</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
