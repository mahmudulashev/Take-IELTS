import { useState, useEffect } from 'react';
import { Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export default function PremiumBanner() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const features = [
    'Unlimited AI Speaking Practice',
    'Advanced Writing Feedback',
    'Personalized Study Plans',
    'Premium Mock Tests'
  ];

  return (
    <div
      className="rounded-[24px] p-8 md:p-10 text-white relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #170021, #2D0048)'
      }}
    >
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 opacity-10">
        <Sparkles size={200} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left Content */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
              <Sparkles size={18} />
              <span className="text-sm font-semibold">Limited Time Offer</span>
            </div>

            <h3 className="text-3xl font-bold mb-2">
              Get 50% OFF Premium
            </h3>
            <p className="text-white/80 mb-6">
              Unlock all AI-powered features and accelerate your IELTS success
            </p>

            {/* Countdown Timer */}
            <div className="flex items-center gap-2 mb-6">
              <Clock size={20} />
              <span className="text-sm">Offer ends in:</span>
              <div className="flex gap-2 ml-2">
                <div className="bg-white/20 px-3 py-1 rounded-lg">
                  <span className="font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-xs ml-1">h</span>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-lg">
                  <span className="font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-xs ml-1">m</span>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-lg">
                  <span className="font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-xs ml-1">s</span>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
                  <span className="text-sm text-white/90">{feature}</span>
                </div>
              ))}
            </div>

            {/* Upgrade Button */}
            <button
              className="bg-[#FF3131] text-white px-8 py-4 rounded-full font-semibold
                       hover:bg-[#FF4545] transition-all duration-200 shadow-lg
                       hover:shadow-xl hover:scale-105"
            >
              Upgrade to Premium Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
