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
                {/* Book in locker */}
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
        
        {/* User silhouette */}
        <div className="absolute -left-4 bottom-16 sm:bottom-20">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-900 shadow"></div>
            <div className="w-16 h-28 bg-indigo-900 rounded-t-3xl absolute -bottom-28 left-1/2 transform -translate-x-1/2"></div>
            <div className="w-6 h-1 bg-white rounded absolute top-5 left-2 opacity-75"></div>
          </div>
        </div>
        
        {/* Animated book floating */}
        <div className="absolute -left-16 sm:-left-24 top-1/3 transform -translate-y-1/2 animate-float" style={{animationDelay: '1.5s'}}>
          <div className="w-12 h-16 bg-white rounded-sm shadow-lg transform -rotate-12">
            <div className="h-full w-2 bg-red-500 absolute left-0 rounded-l-sm"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
              <div className="w-8 h-0.5 bg-gray-300 mb-1"></div>
              <div className="w-8 h-0.5 bg-gray-300 mb-1"></div>
              <div className="w-6 h-0.5 bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add floating decorative elements */}
      <div className="absolute top-10 right-10 text-indigo-300 opacity-20 animate-pulse">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582a1 1 0 01.646.942V9.5a1 1 0 01-.5.866l-4 2.31v.323a1 1 0 01-2 0v-.323l-4-2.31a1 1 0 01-.5-.866V6.847a1 1 0 01.646-.942L9 4.323V3a1 1 0 011-1zm-4 8l4 2.31 4-2.31V7.027l-4-1.582-4 1.582V10z" clipRule="evenodd" />
        </svg>
      </div>
      
      <div className="absolute bottom-8 left-8 text-indigo-300 opacity-20 animate-pulse" style={{animationDelay: '2s'}}>
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      </div>
      
      {/* Add some CSS animations */}
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