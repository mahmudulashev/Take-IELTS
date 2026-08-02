import { FileCheck, ArrowRight } from 'lucide-react';

export default function DiagnosticTestCard() {
  return (
    <div
      className="rounded-[24px] p-8 text-white relative overflow-hidden"
      style={{
        background: '#FF3131'
      }}
    >
      {/* Background Decoration */}
      <div className="absolute -right-8 -bottom-8 opacity-10">
        <FileCheck size={200} />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <FileCheck size={28} />
            </div>

            <h3 className="text-2xl font-bold mb-2">
              Take Your IELTS Diagnostic Test
            </h3>
            <p className="text-white/90 mb-6 max-w-md">
              Discover your current level and get a personalized study plan to reach your target score
            </p>

            <button
              className="bg-white text-[#FF3131] px-8 py-4 rounded-full font-semibold
                       hover:bg-gray-50 transition-all duration-200 shadow-lg
                       hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              Start Test Now
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
