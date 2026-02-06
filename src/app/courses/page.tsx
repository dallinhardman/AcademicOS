import Link from "next/link";

export default function CoursesPage() {
  const courses = [
    {
      title: "Data Structures & Algorithms",
      description: "Learn fundamental data structures and algorithm design patterns.",
      progress: 65,
      modules: 12,
      completed: 8,
      color: "bg-blue-500",
    },
    {
      title: "Web Development",
      description: "Full-stack web development with React, Node.js, and databases.",
      progress: 40,
      modules: 15,
      completed: 6,
      color: "bg-emerald-500",
    },
    {
      title: "Machine Learning",
      description: "Introduction to ML concepts, models, and practical applications.",
      progress: 20,
      modules: 10,
      completed: 2,
      color: "bg-purple-500",
    },
    {
      title: "Operating Systems",
      description: "Processes, memory management, file systems, and concurrency.",
      progress: 85,
      modules: 8,
      completed: 7,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="text-slate-600 mt-1">Your enrolled courses and progress.</p>
        </div>
        <Link
          href="/code-chat"
          className="inline-flex items-center gap-2 px-4 py-2 bg-academic-600 text-white text-sm rounded-lg font-medium hover:bg-academic-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          Open Code Chat
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div key={course.title} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${course.color}`} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{course.description}</p>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600">
                      {course.completed} of {course.modules} modules
                    </span>
                    <span className="font-medium text-slate-900">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-academic-500 h-2 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
