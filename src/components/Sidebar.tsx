import React, { useState } from 'react';
import {
  Package,
  Store,
  GraduationCap,
  BellRing,
  Settings,
  ChevronDown,
  ChevronUp,
  Boxes,
  FileText,
  Sliders,
  MapPin,
  ListCollapse,
  ClipboardList
} from 'lucide-react';

export type MenuKey = 'offline-products' | 'out-of-stock' | 'store-list' | 'queue-list' | 'queue-settings';

interface SidebarProps {
  activeMenu: MenuKey;
  onMenuChange: (menu: MenuKey) => void;
}

export default function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
  // Keep track of which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState({
    products: true,
    stores: true,
    queues: true
  });

  const toggleGroup = (group: 'products' | 'stores' | 'queues') => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shrink-0 h-full select-none shadow-xs">
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-3">
        
        {/* GROUP 1: 商品管理 */}
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup('products')}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-gray-400" />
              <span>商品管理</span>
            </div>
            {expandedGroups.products ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {expandedGroups.products && (
            <div className="space-y-1 pl-2">
              <button
                onClick={() => onMenuChange('offline-products')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  activeMenu === 'offline-products'
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Package className={`w-4 h-4 ${activeMenu === 'offline-products' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>线下商品列表</span>
              </button>

              <button
                onClick={() => onMenuChange('out-of-stock')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  activeMenu === 'out-of-stock'
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <ClipboardList className={`w-4 h-4 ${activeMenu === 'out-of-stock' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>缺货登记列表</span>
              </button>
            </div>
          )}
        </div>

        {/* GROUP 2: 门店管理 */}
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup('stores')}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-gray-400" />
              <span>门店管理</span>
            </div>
            {expandedGroups.stores ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {expandedGroups.stores && (
            <div className="space-y-1 pl-2">
              <button
                onClick={() => onMenuChange('store-list')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  activeMenu === 'store-list'
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <MapPin className={`w-4 h-4 ${activeMenu === 'store-list' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>门店列表</span>
              </button>
            </div>
          )}
        </div>

        {/* GROUP 3: 叫号管理 */}
        <div className="space-y-1">
          <button
            onClick={() => toggleGroup('queues')}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-gray-400" />
              <span>叫号管理</span>
            </div>
            {expandedGroups.queues ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {expandedGroups.queues && (
            <div className="space-y-1 pl-2">
              <button
                onClick={() => onMenuChange('queue-list')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  activeMenu === 'queue-list'
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FileText className={`w-4 h-4 ${activeMenu === 'queue-list' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>叫号列表</span>
              </button>

              <button
                onClick={() => onMenuChange('queue-settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  activeMenu === 'queue-settings'
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Sliders className={`w-4 h-4 ${activeMenu === 'queue-settings' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>叫号设置</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 font-medium">叫号系统已开启</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          当前排号规则: A字头轮巡排队
        </p>
      </div>
    </aside>
  );
}
