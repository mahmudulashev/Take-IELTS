import Sidebar from './components/Sidebar';
import WelcomeSection from './components/WelcomeSection';
import StatsCards from './components/StatsCards';
import PremiumBanner from './components/PremiumBanner';
import DiagnosticTestCard from './components/DiagnosticTestCard';

export default function App() {
  return (
    <div className="min-h-screen" style={{ background: '#F7F8FC' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-[260px] min-h-screen">
        {/* Content Container */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Top Spacing for Mobile Menu Button */}
          <div className="h-12 lg:h-0" />

          {/* Welcome Section */}
          <div className="mb-6">
            <WelcomeSection />
          </div>

          {/* Stats Cards */}
          <div className="mb-6">
            <StatsCards />
          </div>

          {/* Premium Banner */}
          <div className="mb-6">
            <PremiumBanner />
          </div>

          {/* Diagnostic Test Card */}
          <div className="mb-6">
            <DiagnosticTestCard />
          </div>

          {/* Additional Content Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <p className="font-semibold text-gray-900">Practice Speaking</p>
                  <p className="text-sm text-gray-600">Start AI conversation</p>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <p className="font-semibold text-gray-900">Review Vocabulary</p>
                  <p className="text-sm text-gray-600">Flash cards ready</p>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <p className="font-semibold text-gray-900">Take Mock Test</p>
                  <p className="text-sm text-gray-600">Full exam simulation</p>
                </button>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#FF3131] rounded-full mt-2" />
                  <div>
                    <p className="font-semibold text-gray-900">Completed Writing Task 1</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="font-semibold text-gray-900">Speaking Practice Session</p>
                    <p className="text-sm text-gray-600">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="font-semibold text-gray-900">Vocabulary Review - 50 words</p>
                    <p className="text-sm text-gray-600">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}