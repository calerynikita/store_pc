import React, { useState } from 'react';
import { Product, Store } from '../types';
import {
  Search,
  RotateCcw,
  RefreshCw,
  Eye,
  EyeOff,
  Package,
  CheckCircle,
  X,
  School,
  ClipboardList
} from 'lucide-react';

interface ProductListTabProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  stores: Store[];
  onRegisterOutOfStock?: (productId: number) => void;
}

export default function ProductListTab({ products, setProducts, stores, onRegisterOutOfStock }: ProductListTabProps) {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('全部学校');
  const [statusFilter, setStatusFilter] = useState('全部状态');

  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Get all unique schools dynamically from stores to populate select filter
  const allSchools = Array.from(
    new Set(stores.flatMap(store => store.schools))
  );

  const handleSyncProducts = () => {
    setIsSyncing(true);
    setSyncMessage(null);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage('同步成功！已成功拉取线上商品最新数据，并同步到对应学校线下库存。');
      setTimeout(() => setSyncMessage(null), 4000);
    }, 1500);
  };

  const handleToggleStatus = (id: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === '上架' ? '下架' : '上架';
        return {
          ...p,
          status: nextStatus
        };
      }
      return p;
    }));
    // If the modal is viewing this product, update it in modal state as well
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(prev => prev ? { ...prev, status: prev.status === '上架' ? '下架' : '上架' } : null);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSchoolFilter('全部学校');
    setStatusFilter('全部状态');
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const matchName = p.name.toLowerCase().includes(query);
      const matchCode = p.code.toLowerCase().includes(query);
      if (!matchName && !matchCode) return false;
    }
    if (schoolFilter !== '全部学校' && p.schoolName !== schoolFilter) {
      return false;
    }
    if (statusFilter !== '全部状态') {
      if (statusFilter === '已上架' && p.status !== '上架') return false;
      if (statusFilter === '已下架' && p.status !== '下架') return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Title section with Breadcrumbs & Sync Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-1.5">
            <span>线下</span>
            <span>&gt;</span>
            <span>商品管理</span>
            <span>&gt;</span>
            <span className="text-gray-600 font-medium">线下商品列表</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">线下商品管理</h1>
          <p className="text-xs text-gray-400 mt-0.5">查看和维护对应学校所引入销售的校服、配饰等商品及库存。</p>
        </div>

        <button
          onClick={handleSyncProducts}
          disabled={isSyncing}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? '正在同步...' : '同步线上商品'}</span>
        </button>
      </div>

      {/* Sync Alert message */}
      {syncMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-emerald-800 animate-fade-in">
          <div className="p-1 bg-emerald-100 rounded-lg text-emerald-700 mt-0.5">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-emerald-900 font-sans">同步操作成功</h4>
            <p className="text-xs text-emerald-800/90 mt-0.5">{syncMessage}</p>
          </div>
        </div>
      )}

      {/* Filter panel */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Query Search */}
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="搜索商品名称/编号"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50 transition-colors"
            />
          </div>

          {/* School Filter */}
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50 transition-colors"
          >
            <option value="全部学校">全部学校</option>
            {allSchools.map(school => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50 transition-colors"
          >
            <option value="全部状态">全部状态</option>
            <option value="已上架">已上架</option>
            <option value="已下架">已下架</option>
          </select>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {}}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>筛选</span>
            </button>
            <button
              onClick={handleResetFilters}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 font-medium text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-5 w-10">
                  <input
                    type="checkbox"
                    className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                </th>
                <th className="py-3 px-4 font-bold">商品信息</th>
                <th className="py-3 px-4 font-bold">所属学校</th>
                <th className="py-3 px-4 font-bold">价格</th>
                <th className="py-3 px-4 font-bold">库存</th>
                <th className="py-3 px-4 font-bold">状态</th>
                <th className="py-3 px-4 font-bold text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    暂无匹配的商品数据
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <input
                        type="checkbox"
                        className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-gray-800 line-clamp-1">{p.name}</h4>
                          <span className="text-[10px] text-gray-400 font-mono block">ID: {p.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-gray-400" />
                        <span>{p.schoolName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-900 font-mono">
                      ¥{p.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-500 font-mono">
                      {p.stock}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(p.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                          p.status === '上架'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                        title="点击快速切换上下架"
                      >
                        {p.status}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex gap-2 justify-center items-center">
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors flex items-center gap-1"
                          title="查看商品详情"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>查看</span>
                        </button>
                        {onRegisterOutOfStock && (
                          <button
                            onClick={() => onRegisterOutOfStock(p.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md border border-rose-100/50 transition-colors flex items-center gap-1"
                            title="登记缺货配货预约"
                          >
                            <ClipboardList className="w-3.5 h-3.5" />
                            <span>登记缺货</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(p.id)}
                          className={`p-1 rounded-md border transition-colors ${
                            p.status === '上架'
                              ? 'border-amber-100 text-amber-600 hover:bg-amber-50'
                              : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={p.status === '上架' ? '下架' : '上架'}
                        >
                          {p.status === '上架' ? (
                            <span className="text-[10px] px-1 font-semibold">下架</span>
                          ) : (
                            <span className="text-[10px] px-1 font-semibold">上架</span>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/30">
          <span>共 {filteredProducts.length} 条记录</span>
          <div className="flex items-center gap-1">
            <button disabled className="px-2.5 py-1 border border-gray-200 rounded-md bg-white text-gray-300 cursor-not-allowed">&lt;</button>
            <button className="px-2.5 py-1 bg-indigo-600 text-white font-semibold rounded-md shadow-xs">1</button>
            <button className="px-2.5 py-1 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors">&gt;</button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-100 overflow-hidden transform scale-100 transition-all">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-800">商品详细信息</h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="flex justify-center">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-48 h-48 object-cover rounded-xl border border-gray-100 shadow-xs"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">商品名称</label>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{selectedProduct.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">商品编号</label>
                    <p className="text-xs font-mono font-semibold text-gray-700 mt-0.5">{selectedProduct.code}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">当前状态</label>
                    <div className="mt-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedProduct.status === '上架'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}>
                        {selectedProduct.status === '上架' ? '已上架' : '已下架'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">零售价格</label>
                    <p className="text-sm font-bold text-indigo-600 mt-0.5">¥{selectedProduct.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">线下库存</label>
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">{selectedProduct.stock} 件</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-50">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">所属学校</label>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-700 font-medium">
                    <School className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{selectedProduct.schoolName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => handleToggleStatus(selectedProduct.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  selectedProduct.status === '上架'
                    ? 'border-amber-200 text-amber-700 bg-amber-50/50 hover:bg-amber-50'
                    : 'border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50'
                }`}
              >
                {selectedProduct.status === '上架' ? '设为下架' : '设为上架'}
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg shadow-2xs transition-all"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
