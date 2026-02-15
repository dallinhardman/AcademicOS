"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAcademic } from "@/context/AcademicContext";

export default function SemesterDetailPage() {
  const params = useParams();
  const semesterId = params.id as string;
  const {
    state,
    addUnit,
    deleteUnit,
    getUnitsForSemester,
    getContentsForUnit,
    getSummariesForUnit,
  } = useAcademic();

  const semester = state.semesters.find((s) => s.id === semesterId);
  const units = getUnitsForSemester(semesterId);

  const [showForm, setShowForm] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [unitSubject, setUnitSubject] = useState("");

  const handleCreate = () => {
    if (!unitName.trim() || !unitSubject.trim()) return;
    addUnit(semesterId, unitName.trim(), unitSubject.trim());
    setUnitName("");
    setUnitSubject("");
    setShowForm(false);
  };

  if (!semester) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Semester not found.</p>
        <Link href="/semesters" className="text-academic-600 hover:text-academic-700 text-sm mt-2 inline-block">
          Back to semesters
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-2">
        <Link href="/semesters" className="text-sm text-slate-500 hover:text-slate-700">
          Semesters
        </Link>
        <span className="text-sm text-slate-400 mx-2">/</span>
        <span className="text-sm text-slate-700">{semester.name}</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{semester.name}</h1>
          <p className="text-slate-600 mt-1">{units.length} units</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-academic-600 text-white rounded-lg text-sm font-medium hover:bg-academic-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Unit
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Add Unit</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              placeholder="Unit name (e.g. Week 4: Market Structures)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent"
              autoFocus
            />
            <input
              type="text"
              value={unitSubject}
              onChange={(e) => setUnitSubject(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Subject (e.g. Macroeconomics)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-academic-600 text-white rounded-lg text-sm font-medium hover:bg-academic-700"
              >
                Create Unit
              </button>
              <button
                onClick={() => { setShowForm(false); setUnitName(""); setUnitSubject(""); }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {units.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-500 mb-1">No units yet</p>
          <p className="text-sm text-slate-400">Add a unit to start uploading course content.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {units.map((unit) => {
            const contents = getContentsForUnit(unit.id);
            const summaries = getSummariesForUnit(unit.id);
            return (
              <Link
                key={unit.id}
                href={`/units/${unit.id}`}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-academic-700 transition-colors">
                      {unit.name}
                    </h3>
                    <div className="flex gap-3 mt-1 text-xs text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">{unit.subject}</span>
                      <span>{contents.length} files</span>
                      <span>{summaries.length} summaries</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm(`Delete "${unit.name}"?`)) deleteUnit(unit.id);
                    }}
                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
