"use client";

import Link from "next/link";
import { useAcademic } from "@/context/AcademicContext";

export default function Home() {
  const { state, getDueScheduleItems } = useAcademic();
  const dueItems = getDueScheduleItems();

  const modules = [
    {
      name: "Semesters & Units",
      description: "Organize and upload your course content",
      href: "/semesters",
      color: "bg-academic-600",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      ),
      stat: `${state.units.length} units`,
    },
    {
      name: "Study Summaries",
      description: "AI-generated study guides from your content",
      href: "/summaries",
      color: "bg-emerald-600",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      stat: `${state.summaries.length} guides`,
    },
    {
      name: "Quizzes",
      description: "Test your knowledge with active recall",
      href: "/quizzes",
      color: "bg-purple-600",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      ),
      stat: `${state.quizzes.length} quizzes`,
    },
    {
      name: "Schedule",
      description: "Spaced repetition review calendar",
      href: "/schedule",
      color: "bg-orange-600",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      stat: `${dueItems.length} due today`,
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="text-center max-w-4xl w-full">
        <div className="w-16 h-16 bg-academic-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Welcome to AcademicOS
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          Your AI-driven learning management system. Upload lectures, generate study guides, test your knowledge, and let the scheduler optimize your review sessions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {modules.map((mod) => (
            <Link
              key={mod.name}
              href={mod.href}
              className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <div className={`w-11 h-11 ${mod.color} rounded-lg flex items-center justify-center shrink-0`}>
                {mod.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-academic-700 transition-colors">
                  {mod.name}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">{mod.description}</p>
                <p className="text-xs text-academic-600 mt-1.5 font-medium">{mod.stat}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
