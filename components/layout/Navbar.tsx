export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-xl text-gray-900">FretFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button className="text-purple-600 font-medium">Explore Scales</button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">Practice</button>
          </div>
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-purple-600 font-medium text-sm">U</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
