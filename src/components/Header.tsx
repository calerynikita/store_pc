import React from 'react';
import { Bell, Settings, User, Shirt, ChevronDown } from 'lucide-react';

export default function Header() {
  const navItems = [
    { name: '首页', active: false },
    { name: '学校', active: false },
    { name: '征订', active: false },
    { name: '商品', active: false },
    { name: '订单', active: false },
    { name: '线下', active: true },
    { name: '装修', active: false },
    { name: '内容', active: false },
    { name: '会员', active: false },
    { name: '权限', active: false },
    { name: '设置', active: false },
    { name: '分销', active: false },
    { name: '财务', active: false }
  ];

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 shadow-xs z-20">
      {/* Brand Logo and Name */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
          <Shirt className="w-5 h-5" />
        </div>
        <span className="text-lg font-bold bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          校服商城
        </span>
      </div>

      {/* Main Navigation Menu */}
      <nav className="hidden xl:flex items-center gap-1 h-full">
        {navItems.map((item) => (
          <button
            key={item.name}
            className={`px-4 h-full flex items-center text-sm font-medium transition-all duration-150 relative ${
              item.active
                ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {item.name}
          </button>
        ))}
      </nav>

      {/* Right User Bar */}
      <div className="flex items-center gap-5">
        <button className="relative p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        <div className="h-4 w-px bg-gray-200"></div>

        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 bg-indigo-50 rounded-full border border-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm shadow-xs">
            AD
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-xs font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
              管理员
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">Super Admin</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}
