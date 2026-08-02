import { User } from 'lucide-react';

export default function WelcomeSection() {
  return (
    <div className="bg-white rounded-[24px] p-[30px] shadow-sm">
      <div className="flex items-center gap-4">
        {/* User Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF3131] to-[#FF5757] flex items-center justify-center text-white">
          <User size={32} />
        </div>

        {/* Welcome Text */}
        <div>
          <p className="text-gray-500 text-sm">Welcome back</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            Sarah Johnson
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Let's achieve your IELTS goals today!
          </p>
        </div>
      </div>
    </div>
  );
}
