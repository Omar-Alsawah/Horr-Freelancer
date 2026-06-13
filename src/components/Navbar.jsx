import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, Bell, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [findWorkDropdownOpen, setFindWorkDropdownOpen] = useState(false);
  const [deliverWorkDropdownOpen, setDeliverWorkDropdownOpen] = useState(false);

  const toggleLang = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side: Logo & Desktop Links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2 text-decoration-none">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#eab308" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="12 2 22 20 2 20" />
                </svg>
                <span className="font-bold text-2xl text-gray-900 tracking-tight">HORR</span>
              </Link>
            </div>
            {/* Desktop Nav Links */}
            <div className="hidden md:ml-6 md:flex md:space-x-8 md:items-center">

              {/* Find Work Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setFindWorkDropdownOpen(!findWorkDropdownOpen)}
                  className="text-gray-900 hover:text-gray-500 px-3 py-2 text-sm font-medium flex items-center gap-1 focus:outline-none"
                >
                  Find work <ChevronDown className="w-4 h-4" />
                </button>

                {findWorkDropdownOpen && (
                  <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <Link
                      to="/find-work"
                      onClick={() => setFindWorkDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Find Work
                    </Link>
                    <Link
                      to="/saved-jobs"
                      onClick={() => setFindWorkDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Saved Jobs
                    </Link>
                    <Link
                      to="/proposals/my-proposals"
                      onClick={() => setFindWorkDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Proposals and Offers
                    </Link>

                    <div className="border-t border-gray-200 my-1"></div>

                    <span className="block px-4 py-2 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                      Reach more Clients
                    </span>

                    {/* TODO: page not implemented */}
                    <Link
                      to="/services/my-services"
                      onClick={() => setFindWorkDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Services
                    </Link>
                    {/* TODO: page not implemented */}
                    <Link
                      to="/"
                      onClick={() => setFindWorkDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Direct Contracts
                    </Link>
                  </div>
                )}
              </div>

              {/* Deliver Work Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDeliverWorkDropdownOpen(!deliverWorkDropdownOpen)}
                  className={`px-3 py-2 text-sm font-medium flex items-center gap-1 focus:outline-none transition-colors ${
                    deliverWorkDropdownOpen ? 'text-[#B68C48]' : 'text-gray-900 hover:text-gray-500'
                  }`}
                >
                  Deliver work <ChevronDown className="w-4 h-4" />
                </button>

                {deliverWorkDropdownOpen && (
                  <div className="origin-top-left absolute left-0 mt-4 w-60 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),_0_8px_10px_-6px_rgba(0,0,0,0.1)] py-3 bg-white border border-gray-100 z-50">
                    <Link
                      to="/contracts/my-contracts"
                      onClick={() => setDeliverWorkDropdownOpen(false)}
                      className="block px-5 py-2.5 text-[15px] text-gray-800 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      Your active contracts
                    </Link>
                    <Link
                      to="/contracts/my-contracts"
                      onClick={() => setDeliverWorkDropdownOpen(false)}
                      className="block px-5 py-2.5 text-[15px] text-gray-800 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      Contract history
                    </Link>
                  </div>
                )}
              </div>
              <Link to="/messages" className="text-gray-900 hover:text-gray-500 px-3 py-2 text-sm font-medium">
                Messages
              </Link>
            </div>
          </div>

          {/* Middle: Search Bar (Hidden on mobile) */}
          <div className="hidden md:flex flex-1 items-center justify-center px-6">
            <div className="w-full max-w-lg flex items-center border border-gray-300 rounded-full px-4 py-2 bg-gray-50 hover:bg-white transition-colors focus-within:ring-2 focus-within:ring-[#eab308] focus-within:border-transparent">
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-900 placeholder-gray-500"
              />
              <div className="flex items-center border-l border-gray-300 pl-3 ml-2 cursor-pointer hover:bg-gray-100 rounded">
                <span className="text-xs text-gray-700 font-medium whitespace-nowrap">Jobs</span>
                <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
              </div>
            </div>
          </div>

          {/* Right side: Actions, Lang Toggle, Avatar */}
          <div className="hidden md:flex items-center space-x-5">

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 px-2 py-1 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {i18n.language === 'en' ? 'عربي' : 'EN'}
            </button>

            {/* Notification Bell */}
            <button className="relative p-1 text-gray-500 hover:text-gray-900 focus:outline-none">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {/* User Avatar with Dropdown */}
            <div className="relative ml-1">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center justify-center h-9 w-9 rounded-full bg-[#1e293b] text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eab308]"
              >
                {getInitials(user?.name)}
              </button>

              {profileDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <span className="block px-4 py-3 text-xs text-gray-500 border-b">{user?.name || 'User'}</span>
                  <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                  <Link to="/settings" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hamburger Menu (Mobile only) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/find-work" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">Find Work</Link>
            <Link to="/saved-jobs" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">Saved Jobs</Link>
            <Link to="/proposals/my-proposals" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">Proposals and Offers</Link>
            {/* TODO: page not implemented */}
            <Link to="/services/my-services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">Your Services</Link>
            {/* TODO: page not implemented */}
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">Direct Contracts</Link>
            {/* Deliver work mobile items */}
            <div className="px-3 py-2">
              <div className="text-base font-medium text-gray-900 mb-2">Deliver work</div>
              <div className="pl-4 space-y-1 border-l-2 border-gray-100 ml-1">
                <Link to="/contracts/my-contracts" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">Your active contracts</Link>
                <Link to="/contracts/my-contracts" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">Contract history</Link>
              </div>
            </div>
            <Link to="/messages" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50">Messages</Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center px-5 gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#1e293b] text-white font-bold">
                  {getInitials(user?.name)}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-gray-800">{user?.name || 'User'}</div>
              </div>
              <button className="ml-auto flex-shrink-0 bg-white p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                <Bell className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-4 px-2 space-y-1">
              <button onClick={toggleLang} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200">
                Language toggle: {i18n.language === 'en' ? 'AR' : 'EN'}
              </button>
              <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200">My Profile</Link>
              <Link to="/settings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200">Settings</Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-900 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}