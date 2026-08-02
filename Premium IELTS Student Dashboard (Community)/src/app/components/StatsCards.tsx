import { Flame, Award, User } from 'lucide-react';

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Day Streak Card */}
      <div
        className="w-full h-[120px] rounded-[24px] p-6 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FF3131, #FF5757)'
        }}
      >
        <div className="relative z-10">
          <Flame size={28} className="mb-2" />
          <p className="text-sm opacity-90">Day Streak</p>
          <p className="text-3xl font-bold mt-1">15</p>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Flame size={100} />
        </div>
      </div>

      {/* Overall Band Score Card */}
      <div className="w-full h-[120px] bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
        <Award size={28} className="text-[#FF3131] mb-2" />
        <p className="text-sm text-gray-600">Overall Band Score</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">7.5</p>
      </div>

      {/* Profile Card */}
      <div className="w-full h-[120px] bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
        <User size={28} className="text-[#FF3131] mb-2" />
        <p className="text-sm text-gray-600">Profile</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">Premium</p>
      </div>
    </div>
  );
}
