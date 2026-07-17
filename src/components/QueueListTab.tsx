import React, { useState } from 'react';
import { QueueRecord, Store, QueueSettings, QueueType, QueueStatus } from '../types';
import {
  Search,
  RotateCcw,
  Plus,
  Play,
  Check,
  X,
  Volume2,
  Calendar,
  Layers,
  Sparkles,
  Ticket,
  UserCheck,
  Clock,
  Phone,
  Store as StoreIcon
} from 'lucide-react';

interface QueueListTabProps {
  records: QueueRecord[];
  setRecords: React.Dispatch<React.SetStateAction<QueueRecord[]>>;
  stores: Store[];
  settings: QueueSettings;
}

export default function QueueListTab({ records, setRecords, stores, settings }: QueueListTabProps) {
  // Search state
  const [searchPhone, setSearchPhone] = useState('');
  const [searchTicket, setSearchTicket] = useState('');
  const [selectedStore, setSelectedStore] = useState('全部门店');
  
  // Tab state: 'all' | 'pending' | 'completed'
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');

  // Multi-select checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Simulation Panel state
  const [simPhone, setSimPhone] = useState('');
  const [simType, setSimType] = useState<QueueType>('现货');
  const [simStore, setSimStore] = useState('');

  // Auto-initialize simulator store
  React.useEffect(() => {
    if (stores.length > 0 && !simStore) {
      setSimStore(stores[0].name);
    }
  }, [stores, simStore]);

  // Derived counts
  const waitingCount = records.filter(r => r.status === '等待中').length;
  const callingCount = records.filter(r => r.status === '叫号中').length;
  const completedCount = records.filter(r => r.status === '已完成').length;
  const totalCount = records.length;

  // Speak voice broadcast
  const playVoice = (ticketNo: string, type: QueueType, storeName: string) => {
    if (!settings.reminders.voice) return;
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      const text = `请 ${ticketNo} 号顾客，到 ${storeName} ${type}区。请 ${ticketNo} 号顾客，到 ${storeName} ${type}区。`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Actions
  const handleCall = (id: string) => {
    setRecords(prev =>
      prev.map(r => {
        if (r.id === id) {
          const updated = { ...r, status: '叫号中' as QueueStatus };
          playVoice(updated.ticketNo, updated.type, updated.storeName);
          return updated;
        }
        return r;
      })
    );
  };

  const handleComplete = (id: string) => {
    setRecords(prev =>
      prev.map(r => (r.id === id ? { ...r, status: '已完成' as QueueStatus } : r))
    );
  };

  const handleCancel = (id: string) => {
    setRecords(prev =>
      prev.map(r => (r.id === id ? { ...r, status: '已取消' as QueueStatus } : r))
    );
  };

  const handleResetFilters = () => {
    setSearchPhone('');
    setSearchTicket('');
    setSelectedStore('全部门店');
  };

  // Ticket Generator / Simulation
  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simPhone.trim()) {
      alert('请输入手机号码');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(simPhone.trim())) {
      alert('请输入合法的11位手机号码');
      return;
    }

    // Determine prefix from settings (e.g. 'A', 'B', 'C' or dynamic)
    const currentPrefix = settings.prefix || 'A';
    
    // Find next ticket sequence for that prefix/store
    const samePrefixRecords = records.filter(r => r.ticketNo.startsWith(currentPrefix));
    let nextNum = settings.startNo || 1;
    if (samePrefixRecords.length > 0) {
      // Extract numeric suffix
      const numbers = samePrefixRecords.map(r => parseInt(r.ticketNo.substring(currentPrefix.length))).filter(n => !isNaN(n));
      if (numbers.length > 0) {
        nextNum = Math.max(...numbers) + 1;
      }
    }

    const ticketNo = `${currentPrefix}${String(nextNum).padStart(3, '0')}`;
    const newRecord: QueueRecord = {
      id: `queue-${Date.now()}`,
      ticketNo,
      type: simType,
      storeName: simStore || '迪尚校园服旗舰店',
      status: '等待中',
      createdTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      phone: simPhone.trim()
    };

    setRecords(prev => [newRecord, ...prev]);
    setSimPhone('');
    
    // Optionally auto broadcast
    if (settings.reminders.voice) {
      const announceText = `取号成功，您的号码是 ${ticketNo}。`;
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(announceText);
        u.lang = 'zh-CN';
        window.speechSynthesis.speak(u);
      }
    }
  };

  // Filter logic
  const filteredRecords = records.filter(r => {
    // Phone search (match ends or contains)
    if (searchPhone.trim() && !r.phone.includes(searchPhone.trim())) {
      return false;
    }
    // Ticket search (case insensitive)
    if (searchTicket.trim() && !r.ticketNo.toLowerCase().includes(searchTicket.trim().toLowerCase())) {
      return false;
    }
    // Store filter
    if (selectedStore !== '全部门店' && r.storeName !== selectedStore) {
      return false;
    }
    // Tab filter
    if (activeTab === 'pending') {
      return r.status === '等待中' || r.status === '叫号中';
    }
    if (activeTab === 'completed') {
      return r.status === '已完成';
    }
    return true; // 'all'
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredRecords.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkAction = (action: 'call' | 'complete' | 'cancel') => {
    if (selectedIds.length === 0) return;
    setRecords(prev =>
      prev.map(r => {
        if (selectedIds.includes(r.id)) {
          if (action === 'call' && r.status === '等待中') {
            return { ...r, status: '叫号中' as QueueStatus };
          }
          if (action === 'complete') {
            return { ...r, status: '已完成' as QueueStatus };
          }
          if (action === 'cancel') {
            return { ...r, status: '已取消' as QueueStatus };
          }
        }
        return r;
      })
    );
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      
      {/* Title section with Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-1.5">
            <span>线下</span>
            <span>&gt;</span>
            <span>叫号管理</span>
            <span>&gt;</span>
            <span className="text-gray-600 font-medium">叫号列表</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">叫号管理</h1>
          <p className="text-xs text-gray-400 mt-0.5">管理线下门店的叫号队列，支持实时监控与音视频播报。</p>
        </div>
      </div>

      {/* Top Cards for Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 等待中 */}
        <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex items-center justify-between shadow-xs relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="space-y-1 z-10">
            <span className="text-xs font-medium text-orange-600 block">等待中</span>
            <span className="text-2xl font-bold text-orange-700 tracking-tight font-sans">
              {waitingCount}
            </span>
            <span className="text-[10px] text-orange-400 block">当前待服务人数</span>
          </div>
          <div className="w-12 h-12 bg-orange-100/80 rounded-xl flex items-center justify-center text-orange-600 z-10">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-orange-100/20 rounded-full group-hover:scale-125 transition-transform"></div>
        </div>

        {/* Card 2: 叫号中 */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between shadow-xs relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="space-y-1 z-10">
            <span className="text-xs font-medium text-blue-600 block">叫号中</span>
            <span className="text-2xl font-bold text-blue-700 tracking-tight font-sans">
              {callingCount}
            </span>
            <span className="text-[10px] text-blue-400 block">窗口或展区正呼叫</span>
          </div>
          <div className="w-12 h-12 bg-blue-100/80 rounded-xl flex items-center justify-center text-blue-600 z-10">
            <Volume2 className="w-6 h-6 animate-bounce" />
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-blue-100/20 rounded-full group-hover:scale-125 transition-transform"></div>
        </div>

        {/* Card 3: 已完成 */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between shadow-xs relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="space-y-1 z-10">
            <span className="text-xs font-medium text-emerald-600 block">已完成</span>
            <span className="text-2xl font-bold text-emerald-700 tracking-tight font-sans">
              {completedCount}
            </span>
            <span className="text-[10px] text-emerald-400 block">今日已服务人次</span>
          </div>
          <div className="w-12 h-12 bg-emerald-100/80 rounded-xl flex items-center justify-center text-emerald-600 z-10">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-emerald-100/20 rounded-full group-hover:scale-125 transition-transform"></div>
        </div>

        {/* Card 4: 今日总计 */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="space-y-1 z-10">
            <span className="text-xs font-medium text-slate-600 block">今日总计</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight font-sans">
              {totalCount}
            </span>
            <span className="text-[10px] text-slate-400 block">累计总排号单量</span>
          </div>
          <div className="w-12 h-12 bg-slate-200/80 rounded-xl flex items-center justify-center text-slate-600 z-10">
            <Ticket className="w-6 h-6" />
          </div>
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-slate-200/10 rounded-full group-hover:scale-125 transition-transform"></div>
        </div>
      </div>

      {/* Main Work Area: Filters and Queue Table + Ticket Simulation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left side: Queue Records List (9 Cols) */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Filters Form Panel */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Input 1: Phone */}
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="请输入手机号"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50 transition-colors"
                />
              </div>

              {/* Input 2: Ticket Number */}
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <Ticket className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="请输入号码 (如 A001)"
                  value={searchTicket}
                  onChange={(e) => setSearchTicket(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50 transition-colors"
                />
              </div>

              {/* Select 3: Store */}
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <StoreIcon className="w-4 h-4" />
                </span>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg appearance-none focus:outline-hidden focus:border-indigo-500 bg-gray-50/50 transition-colors"
                >
                  <option value="全部门店">全部门店</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.name}>{store.name}</option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {}} // Simple search triggers live via filtering
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
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

          {/* Table Container */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden">
            {/* Tabs & Bulk Actions */}
            <div className="px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/20">
              <div className="flex border-b border-gray-100 sm:border-0">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'all'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  全部 ({records.length})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'pending'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  待处理 ({records.filter(r => r.status === '等待中' || r.status === '叫号中').length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'completed'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  已完成 ({records.filter(r => r.status === '已完成').length})
                </button>
              </div>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-sm">
                    已选 {selectedIds.length} 项
                  </span>
                  <button
                    onClick={() => handleBulkAction('complete')}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    批量完成
                  </button>
                  <button
                    onClick={() => handleBulkAction('cancel')}
                    className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-semibold hover:bg-rose-100 transition-colors"
                  >
                    批量取消
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-5 w-10">
                      <input
                        type="checkbox"
                        checked={filteredRecords.length > 0 && selectedIds.length === filteredRecords.length}
                        onChange={handleSelectAll}
                        className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                    </th>
                    <th className="py-3 px-4 font-bold">号码</th>
                    <th className="py-3 px-4 font-bold">类型</th>
                    <th className="py-3 px-4 font-bold">所属门店</th>
                    <th className="py-3 px-4 font-bold">状态</th>
                    <th className="py-3 px-4 font-bold">创建时间</th>
                    <th className="py-3 px-4 font-bold text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                        暂无匹配的排号记录
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => {
                      // Status colors
                      let statusBadge = (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
                          {record.status}
                        </span>
                      );
                      if (record.status === '等待中') {
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-600 border border-orange-100">
                            等待中
                          </span>
                        );
                      } else if (record.status === '叫号中') {
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 animate-pulse">
                            叫号中
                          </span>
                        );
                      } else if (record.status === '已完成') {
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            已完成
                          </span>
                        );
                      } else if (record.status === '已取消') {
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-400 border border-gray-200">
                            已取消
                          </span>
                        );
                      }

                      // Type colors
                      let typeBadge = (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                          {record.type}
                        </span>
                      );

                      return (
                        <tr
                          key={record.id}
                          className={`hover:bg-gray-50/80 transition-colors ${
                            record.status === '叫号中' ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          <td className="py-3 px-5">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(record.id)}
                              onChange={(e) => handleSelectOne(record.id, e.target.checked)}
                              className="rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                            />
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-800 tracking-tight">
                            {record.ticketNo}
                          </td>
                          <td className="py-3 px-4">
                            {typeBadge}
                          </td>
                          <td className="py-3 px-4 text-gray-600 font-medium">
                            {record.storeName}
                          </td>
                          <td className="py-3 px-4">
                            {statusBadge}
                          </td>
                          <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                            {record.createdTime}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex gap-1.5 justify-center">
                              {/* 叫号 Action */}
                              <button
                                disabled={record.status === '已完成' || record.status === '已取消'}
                                onClick={() => handleCall(record.id)}
                                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-all ${
                                  record.status === '已完成' || record.status === '已取消'
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm'
                                }`}
                                title="呼叫此号/重新播报"
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>叫号</span>
                              </button>

                              {/* 完成 Action */}
                              <button
                                disabled={record.status === '已完成' || record.status === '已取消'}
                                onClick={() => handleComplete(record.id)}
                                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-all ${
                                  record.status === '已完成' || record.status === '已取消'
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-sm'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                                <span>完成</span>
                              </button>

                              {/* 取消 Action */}
                              <button
                                disabled={record.status === '已完成' || record.status === '已取消'}
                                onClick={() => handleCancel(record.id)}
                                className={`px-2 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-all border ${
                                  record.status === '已完成' || record.status === '已取消'
                                    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                    : 'border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-100 hover:text-rose-700'
                                }`}
                              >
                                <X className="w-3 h-3" />
                                <span>取消</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/30">
              <span>共 {filteredRecords.length} 条记录</span>
              <div className="flex items-center gap-1">
                <button disabled className="px-2.5 py-1 border border-gray-200 rounded-md bg-white text-gray-300 cursor-not-allowed">&lt;</button>
                <button className="px-2.5 py-1 bg-indigo-600 text-white font-semibold rounded-md shadow-xs">1</button>
                <button className="px-2.5 py-1 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors">2</button>
                <button className="px-2.5 py-1 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors">&gt;</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Simulation panel for testing (3 Cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* SIMULATOR CARD */}
          <div className="bg-linear-to-b from-indigo-50/80 to-white border border-indigo-100 rounded-xl p-5 shadow-xs relative overflow-hidden">
            <div className="absolute right-3 top-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>

            <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5">
              <span>现场取号模拟器</span>
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              在此模拟顾客前台扫码或自助机取号。取号后，左侧队列监控将实时增加新数据。
            </p>

            <form onSubmit={handleAddTicket} className="space-y-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  顾客手机号 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  required
                  placeholder="请输入手机号码 (11位)"
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                />
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  取号类型
                </label>
                <div className="bg-indigo-50/50 text-indigo-700 border border-indigo-100 rounded-lg py-1.5 px-3 text-xs font-bold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>现货 (默认)</span>
                </div>
              </div>

              {/* Store */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  选择门店 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={simStore}
                  onChange={(e) => setSimStore(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.name}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit btn */}
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>一键模拟取号</span>
              </button>
            </form>
          </div>

          {/* Quick Voice Prompt Info */}
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 text-xs text-amber-800 space-y-2">
            <h3 className="font-bold flex items-center gap-1.5 text-amber-900">
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>实时语音提示</span>
            </h3>
            <p className="text-[11px] leading-relaxed text-amber-800/90">
              当您在左侧表格点击 <b>“叫号”</b> 按钮时，系统会根据<b>“叫号设置”</b>内的参数，进行真人普通话语音播报（如：“请 A001 号顾客到取货区办理业务”）。
            </p>
            <p className="text-[10px] text-amber-600 font-semibold">
              * 请确保浏览器声音未静音
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
