import React from 'react';

export default function EnhancedHeroIllustration() {
  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden relative bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-100">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/6 w-20 h-20 md:w-32 md:h-32 bg-indigo-200 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 md:w-40 md:h-40 bg-blue-200 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/5 w-16 h-16 md:w-24 md:h-24 bg-purple-200 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Main illustration */}
      <div className="relative w-full max-w-lg mx-auto h-full flex items-center justify-center">
        {/* Smart Locker Cabinet */}
        <div className="relative w-64 h-56 sm:w-80 sm:h-64 bg-indigo-800 rounded-lg shadow-xl overflow-hidden transform perspective-800 rotate-y-6">
          {/* Cabinet frame */}
          <div className="absolute inset-1 bg-indigo-700 rounded"></div>
          
          {/* Locker Grid */}
          <div className="absolute inset-2 grid grid-cols-2 gap-1 p-1">
            {/* Locker 1 - Open with book */}
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded shadow-inner"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Single book in locker - ONLY ONE BOOK */}
                <div className="w-10 h-14 bg-white rounded-sm shadow-md transform rotate-6">
                  <div className="h-full w-2 bg-yellow-500 absolute left-0 rounded-l-sm"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-0.5 bg-gray-300"></div>
                  </div>
                  <div className="absolute inset-0 mt-5 flex items-center justify-center">
                    <div className="w-6 h-0.5 bg-gray-300"></div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            {/* Locker 2 - Closed */}
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600 rounded shadow-inner"></div>
              <div className="absolute inset-3 border-4 border-indigo-500 rounded opacity-20"></div>
              <div className="absolute bottom-1 right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            
            {/* Locker 3 - Closed */}
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600 rounded shadow-inner"></div>
              <div className="absolute inset-3 border-4 border-indigo-500 rounded opacity-20"></div>
              <div className="absolute bottom-1 right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            
            {/* Locker 4 - Open and empty */}
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded shadow-inner"></div>
              <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          
          {/* RFID Reader */}
          <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-6 h-12 bg-gray-800 rounded-r-md shadow-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-indigo-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* RFID Card Animation */}
        <div className="absolute right-12 sm:right-16 top-1/2 transform -translate-y-1/2 animate-float">
          <div className="relative w-16 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-md shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
            <div className="absolute right-1 top-1 h-2 w-4 bg-yellow-300 rounded-sm"></div>
            <div className="absolute bottom-1 left-1 text-white text-xs">
              <div className="text-xs font-bold leading-none">RFID</div>
            </div>
          </div>
        </div>
        
        {/* User silhouette - FIXED: Removed the white line and positioned better */}
        <div className="absolute left-12 sm:left-10 bottom-16 sm:bottom-20">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-900 shadow"></div>
            <div className="w-16 h-28 bg-indigo-900 rounded-t-3xl absolute -bottom-28 left-1/2 transform -translate-x-1/2"></div>
            {/* Removed the white line across the head */}
          </div>
        </div>
        
        {/* Removed the floating book entirely as requested */}
      </div>
      
      {/* Removed small transparent book logo next to the person */}
      
      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-10px) rotate(8deg); }
          100% { transform: translateY(0px) rotate(12deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .perspective-800 {
          perspective: 800px;
        }
        .rotate-y-6 {
          transform: rotateY(6deg);
        }
      `}</style>
    </div>
  );
}