import { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Library,
  FileCheck,
  ListChecks,
  MessageCircle,
  Mic,
  FileEdit,
  BookOpen,
  GraduationCap,
  BarChart3,
  Flame,
  Menu,
  X
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/' },
  { icon: Calendar, label: 'Study Plan', path: '/study-plan' },
  { icon: Library, label: 'Content Library', path: '/content-library' },
  { icon: FileCheck, label: 'Mock Tests', path: '/mock-tests' },
  { icon: ListChecks, label: 'Part Practice', path: '/part-practice' },
  { icon: MessageCircle, label: 'AI Chatbot', path: '/ai-chatbot' },
  { icon: Mic, label: 'AI Speaking Partner', path: '/ai-speaking' },
  { icon: FileEdit, label: 'AI Rewriter', path: '/ai-rewriter' },
  { icon: BookOpen, label: 'Vocabulary Flash Cards', path: '/vocabulary' },
  { icon: GraduationCap, label: 'Grammar Learning', path: '/grammar' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Flame, label: 'Streaks', path: '/streaks' },
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('Overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleMenuClick = (label: string) => {
    setActiveItem(label);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white
          transition-transform duration-300 ease-in-out z-40
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:w-[260px]
          w-[260px]
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">
            IELTS Victorian
          </h1>
          <p className="text-xs text-gray-500 mt-1">AI Powered Learning</p>
        </div>

        {/* Menu Items */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-100px)]">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.label;

              return (
                <li key={item.label}>
                  <button
                    onClick={() => handleMenuClick(item.label)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-all duration-200
                      ${isActive
                        ? 'bg-red-50 text-[#FF3131]'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="text-[16px] font-medium">
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
