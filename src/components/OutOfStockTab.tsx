import React, { useState } from 'react';
import { Product, Store, OutOfStockRecord, OutOfStockNotificationLog } from '../types';
import {
  Search,
  RotateCcw,
  Plus,
  Bell,
  Check,
  CheckCircle,
  X,
  XCircle,
  Info,
  Phone,
  User,
  Calendar,
  MapPin,
  ClipboardList,
  Send,
  Trash2,
  Edit,
  MessageSquare,
  Volume2,
  TrendingUp,
  Box,
  ChevronDown,
  ChevronUp,
  Mail,
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface OutOfStockTabProps {
  records: OutOfStockRecord[];
  setRecords: React.Dispatch<React.SetStateAction<OutOfStockRecord[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  stores: Store[];
  preselectedProductId?: number | null;
  clearPreselectedProductId?: () => void;
}

export default function OutOfStockTab({
  records,
  setRecords,
  products,
  setProducts,
  stores,
  preselectedProductId,
  clearPreselectedProductId
}: OutOfStockTabProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('全部学校');
  const [statusFilter, setStatusFilter] = useState('全部状态');

  // Modal / Form States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OutOfStockRecord | null>(null);
  const [selectedRecordForNotify, setSelectedRecordForNotify] = useState<OutOfStockRecord | null>(null);
  const [selectedRecordForLog, setSelectedRecordForLog] = useState<OutOfStockRecord | null>(null);

  // Form Fields
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerPhone, setFormCustomerPhone] = useState('');
  const [formProductId, setFormProductId] = useState<number | ''>('');
  const [formSize, setFormSize] = useState('140码');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formRemarks, setFormRemarks] = useState('');

  // Notification Modal States
  const [notifyType, setNotifyType] = useState<'SMS' | 'Voice'>('SMS');
  const [notifyTemplate, setNotifyTemplate] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  // Expanded Logs State for inline accordion
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  // Pickup confirmation modal state
  const [confirmPickupRecord, setConfirmPickupRecord] = useState<OutOfStockRecord | null>(null);
  const [shouldDeductStock, setShouldDeductStock] = useState(true);

  // Get list of unique schools from stores
  const allSchools = Array.from(new Set(stores.flatMap(s => s.schools)));

  // Preset size choices for ease of entry
  const SIZE_CHOICES = [
    '110码', '120码', '130码', '140码', '150码', '160码', '170码', '180码',
    'S码', 'M码', 'L码', 'XL码', 'XXL码'
  ];

  // Selected product details in form
  const selectedProductInForm = products.find(p => p.id === formProductId);

  // Prepare default notification text when modal opens
  const openNotifyModal = (record: OutOfStockRecord) => {
    setSelectedRecordForNotify(record);
    const template = `【迪尚校服】尊敬的${record.customerName}家长，您登记缺货的 [${record.schoolName}] ${record.productName} (尺码:${record.size}) 已到货。现已为您预留，请凭此短信尽快前往门店领取。如有疑问，请咨询电话：${
      stores.find(s => s.schools.includes(record.schoolName))?.phone || '021-12345678'
    }。`;
    setNotifyTemplate(template);
    setNotifyType('SMS');
    setNotificationSuccess(false);
    setIsSendingNotification(false);
    setIsNotifyModalOpen(true);
  };

  // Switch template based on channel
  const handleNotifyTypeChange = (type: 'SMS' | 'Voice', record: OutOfStockRecord) => {
    setNotifyType(type);
    if (type === 'SMS') {
      const template = `【迪尚校服】尊敬的${record.customerName}家长，您登记缺货的 [${record.schoolName}] ${record.productName} (尺码:${record.size}) 已到货。现已为您预留，请凭此短信尽快前往门店领取。`;
      setNotifyTemplate(template);
    } else {
      const template = `您好！这里是迪尚校服中心。尊敬的${record.customerName}家长，您为孩子登记的${record.schoolName}${record.productName}${record.size}商品现已到货，门店已为您预留，请您抽空前往门店领取。期待您的光临！`;
      setNotifyTemplate(template);
    }
  };

  // Send notification implementation
  const handleSendNotification = () => {
    if (!selectedRecordForNotify) return;

    setIsSendingNotification(true);
    setTimeout(() => {
      setIsSendingNotification(false);
      setNotificationSuccess(true);

      const now = new Date();
      const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
        2,
        '0'
      )}:${String(now.getSeconds()).padStart(2, '0')}`;

      const newLog: OutOfStockNotificationLog = {
        time: formattedTime,
        content: notifyTemplate,
        type: notifyType === 'SMS' ? 'SMS' : 'Voice'
      };

      setRecords(prev =>
        prev.map(r => {
          if (r.id === selectedRecordForNotify.id) {
            return {
              ...r,
              status: '已到货',
              notificationSentCount: r.notificationSentCount + 1,
              notificationLogs: [newLog, ...r.notificationLogs]
            };
          }
          return r;
        })
      );

      // Dismiss after 1.5s
      setTimeout(() => {
        setIsNotifyModalOpen(false);
        setNotificationSuccess(false);
        setSelectedRecordForNotify(null);
      }, 1500);
    }, 1800);
  };

  // Submit Register Form (Add / Edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim() || !formCustomerPhone.trim() || !formProductId) {
      alert('请完整填写客户姓名、联系电话并选择登记商品！');
      return;
    }

    const matchedProduct = products.find(p => p.id === formProductId);
    if (!matchedProduct) return;

    if (editingRecord) {
      // Edit mode
      setRecords(prev =>
        prev.map(r => {
          if (r.id === editingRecord.id) {
            return {
              ...r,
              customerName: formCustomerName.trim(),
              customerPhone: formCustomerPhone.trim(),
              productId: matchedProduct.id,
              productName: matchedProduct.name,
              productCode: matchedProduct.code,
              schoolName: matchedProduct.schoolName,
              size: formSize,
              quantity: Number(formQuantity) || 1,
              remarks: formRemarks.trim()
            };
          }
          return r;
        })
      );
    } else {
      // Add mode
      const now = new Date();
      const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
        2,
        '0'
      )}:${String(now.getSeconds()).padStart(2, '0')}`;

      const newRecord: OutOfStockRecord = {
        id: `oos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        customerName: formCustomerName.trim(),
        customerPhone: formCustomerPhone.trim(),
        productId: matchedProduct.id,
        productName: matchedProduct.name,
        productCode: matchedProduct.code,
        schoolName: matchedProduct.schoolName,
        size: formSize,
        quantity: Number(formQuantity) || 1,
        registeredTime: formattedTime,
        status: '登记中',
        notificationSentCount: 0,
        notificationLogs: [],
        remarks: formRemarks.trim()
      };

      setRecords(prev => [newRecord, ...prev]);
    }

    // Reset Form & Close Modal
    handleCloseAddModal();
  };

  React.useEffect(() => {
    if (preselectedProductId) {
      const matchedProduct = products.find(p => p.id === preselectedProductId);
      if (matchedProduct) {
        setEditingRecord(null);
        setFormCustomerName('');
        setFormCustomerPhone('');
        setFormProductId(matchedProduct.id);
        setFormSize('140码');
        setFormQuantity(1);
        setFormRemarks('商品列表一键登记');
        setIsAddModalOpen(true);
      }
      if (clearPreselectedProductId) {
        clearPreselectedProductId();
      }
    }
  }, [preselectedProductId, products, clearPreselectedProductId]);

  const handleOpenAddModal = (record: OutOfStockRecord | null = null) => {
    if (record) {
      setEditingRecord(record);
      setFormCustomerName(record.customerName);
      setFormCustomerPhone(record.customerPhone);
      setFormProductId(record.productId);
      setFormSize(record.size);
      setFormQuantity(record.quantity);
      setFormRemarks(record.remarks || '');
    } else {
      setEditingRecord(null);
      setFormCustomerName('');
      setFormCustomerPhone('');
      // Preselect first product if available
      setFormProductId(products[0]?.id || '');
      setFormSize('140码');
      setFormQuantity(1);
      setFormRemarks('');
    }
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingRecord(null);
    setFormCustomerName('');
    setFormCustomerPhone('');
    setFormProductId('');
    setFormSize('140码');
    setFormQuantity(1);
    setFormRemarks('');
  };

  // Mark pickup confirmation logic
  const triggerConfirmPickup = (record: OutOfStockRecord) => {
    setConfirmPickupRecord(record);
    setShouldDeductStock(true);
  };

  const handleExecutePickup = () => {
    if (!confirmPickupRecord) return;

    // Deduct stock if toggled
    if (shouldDeductStock) {
      setProducts(prev =>
        prev.map(p => {
          if (p.id === confirmPickupRecord.productId) {
            const nextStock = Math.max(0, p.stock - confirmPickupRecord.quantity);
            return { ...p, stock: nextStock };
          }
          return p;
        })
      );
    }

    // Update registration status
    setRecords(prev =>
      prev.map(r => {
        if (r.id === confirmPickupRecord.id) {
          const systemLog: OutOfStockNotificationLog = {
            time: new Date().toISOString().replace('T', ' ').substring(0, 19),
            content: `【系统日志】用户取货成功。${shouldDeductStock ? `系统自动扣减库存 ${r.quantity} 件。` : '未选择扣减库存。'}`,
            type: 'System'
          };
          return {
            ...r,
            status: '已取货',
            notificationLogs: [systemLog, ...r.notificationLogs]
          };
        }
        return r;
      })
    );

    setConfirmPickupRecord(null);
  };

  // Change status of record directly
  const handleUpdateStatus = (id: string, newStatus: OutOfStockRecord['status']) => {
    setRecords(prev =>
      prev.map(r => {
        if (r.id === id) {
          return { ...r, status: newStatus };
        }
        return r;
      })
    );
  };

  // Delete registration log
  const handleDeleteRecord = (id: string) => {
    if (confirm('确定要删除这条缺货登记记录吗？删除后将无法恢复。')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // Filter records based on UI states
  const filteredRecords = records.filter(record => {
    // Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = record.customerName.toLowerCase().includes(q);
      const matchPhone = record.customerPhone.includes(q);
      const matchProduct = record.productName.toLowerCase().includes(q);
      const matchCode = record.productCode.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchProduct && !matchCode) {
        return false;
      }
    }

    // School filter
    if (schoolFilter !== '全部学校' && record.schoolName !== schoolFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== '全部状态' && record.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Calculate statistics
  const statsTotal = records.length;
  const statsPending = records.filter(r => r.status === '登记中').length;
  const statsArrived = records.filter(r => r.status === '已到货').length;
  const statsNotifiedTotal = records.reduce((acc, curr) => acc + curr.notificationSentCount, 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSchoolFilter('全部学校');
    setStatusFilter('全部状态');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-1.5">
            <span>商品管理</span>
            <span>&gt;</span>
            <span className="text-gray-600 font-medium">缺货登记列表</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>缺货登记服务</span>
            <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-100">
              智能通知
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            登记到店咨询却缺货的家长信息，到货时一键发送个性化到货通知（短信通知），提升顾客忠诚度与周转率。
          </p>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-400 block">累计登记数量</span>
            <span className="text-lg font-bold text-gray-800">{statsTotal}</span>
          </div>
        </div>

        {/* Card 2: Pending Arrival */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <TrendingUp className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-400 block">等待配货中</span>
            <span className="text-lg font-bold text-amber-600">{statsPending}</span>
          </div>
        </div>

        {/* Card 3: Arrived & Pre-notified */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-400 block">已到货待自提</span>
            <span className="text-lg font-bold text-indigo-600">{statsArrived}</span>
          </div>
        </div>

        {/* Card 4: Total Notifications Sent */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-gray-400 block">到货通知已发</span>
            <span className="text-lg font-bold text-emerald-600">{statsNotifiedTotal} 次</span>
          </div>
        </div>
      </div>

      {/* Filter and Query Panel */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Query search input */}
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="搜索顾客姓名、手机号、商品..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50 transition-colors"
            />
          </div>

          {/* School filter */}
          <select
            value={schoolFilter}
            onChange={e => setSchoolFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50 cursor-pointer font-medium text-gray-700"
          >
            <option value="全部学校">全部学校</option>
            {allSchools.map(school => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50 cursor-pointer font-medium text-gray-700"
          >
            <option value="全部状态">全部状态</option>
            <option value="登记中">登记中（等待配货）</option>
            <option value="已到货">已到货（待自提）</option>
            <option value="已取货">已取货（交易完成）</option>
            <option value="已取消">已取消</option>
          </select>

          {/* Action reset */}
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-50 hover:text-gray-700 transition-colors active:scale-98"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置筛选</span>
          </button>
        </div>
      </div>

      {/* Main List Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-3">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-700">没有找到匹配的缺货登记记录</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              您可以调整过滤项，或点击右上角“新建缺货登记”按钮，为家长录入新的缺货预约。
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">顾客信息</th>
                  <th className="py-3 px-4">登记学校及商品</th>
                  <th className="py-3 px-4">尺码 / 数量</th>
                  <th className="py-3 px-4">登记时间</th>
                  <th className="py-3 px-4">状态</th>
                  <th className="py-3 px-4">通知历史</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredRecords.map(record => {
                  const productObj = products.find(p => p.id === record.productId);
                  const isExpanded = expandedRecordId === record.id;
                  return (
                    <React.Fragment key={record.id}>
                      <tr className="hover:bg-slate-50/30 transition-colors">
                        {/* Parent/Customer Column */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              {record.customerName}
                            </span>
                            <span className="text-gray-500 font-mono mt-1 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {record.customerPhone}
                            </span>
                          </div>
                        </td>

                        {/* Product Column */}
                        <td className="py-4 px-4 max-w-xs">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] bg-slate-100 text-gray-600 font-semibold px-1.5 py-0.5 rounded self-start flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                              {record.schoolName}
                            </span>
                            <span className="font-bold text-gray-800 block truncate">
                              {record.productName}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              SKU编码: {record.productCode}
                            </span>
                          </div>
                        </td>

                        {/* Specification Column */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-700 bg-indigo-50/50 border border-indigo-100/50 text-[10px] px-2 py-0.5 rounded self-start">
                              {record.size}
                            </span>
                            <span className="text-gray-500 mt-1.5 font-medium">
                              需求数: <span className="text-gray-900 font-bold">{record.quantity}</span> 件
                            </span>
                          </div>
                        </td>

                        {/* Time Column */}
                        <td className="py-4 px-4 text-gray-500 font-mono">
                          {record.registeredTime}
                        </td>

                        {/* Status Badge Column */}
                        <td className="py-4 px-4">
                          {(() => {
                            switch (record.status) {
                              case '登记中':
                                return (
                                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2 py-0.5 font-semibold text-[10px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                    登记配货中
                                  </span>
                                );
                              case '已到货':
                                return (
                                  <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2 py-0.5 font-semibold text-[10px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                    已到货待取
                                  </span>
                                );
                              case '已取货':
                                return (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5 font-semibold text-[10px]">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    已取自提
                                  </span>
                                );
                              case '已取消':
                                return (
                                  <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 border border-gray-100 rounded-full px-2 py-0.5 font-semibold text-[10px]">
                                    已取消预约
                                  </span>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </td>

                        {/* Notifications Column */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                            className="text-gray-500 hover:text-indigo-600 font-semibold flex items-center gap-1 group"
                          >
                            <span className="bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-full px-2 py-0.5 text-[10px] font-mono">
                              {record.notificationSentCount}次通知
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600" />
                            )}
                          </button>
                        </td>

                        {/* Actions Column */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Send Notification Button */}
                            {record.status !== '已取货' && record.status !== '已取消' && (
                              <button
                                onClick={() => openNotifyModal(record)}
                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 hover:border-indigo-200 font-bold text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                                title="发送到货通知"
                              >
                                <Bell className="w-3.5 h-3.5" />
                                <span>{record.status === '已到货' ? '重新通知' : '通知到货'}</span>
                              </button>
                            )}

                            {/* Mark Picked Up Button */}
                            {record.status === '已到货' && (
                              <button
                                onClick={() => triggerConfirmPickup(record)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-all"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>确认自提</span>
                              </button>
                            )}

                            {/* Edit Button */}
                            {record.status === '登记中' && (
                              <button
                                onClick={() => handleOpenAddModal(record)}
                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="编辑登记详情"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}

                            {/* Cancel Button */}
                            {record.status === '登记中' && (
                              <button
                                onClick={() => handleUpdateStatus(record.id, '已取消')}
                                className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="取消登记"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="删除此记录"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Accordion: Notification Details & Remarks */}
                      {isExpanded && (
                        <tr className="bg-slate-50/40">
                          <td colSpan={7} className="p-4 border-t border-b border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Left pane: Remarks */}
                              <div>
                                <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2">
                                  <Info className="w-4 h-4 text-amber-500" />
                                  登记备注
                                </h4>
                                <div className="bg-white border border-gray-200/60 rounded-xl p-3 text-xs text-gray-600 shadow-3xs min-h-[80px]">
                                  {record.remarks ? (
                                    <p className="leading-relaxed whitespace-pre-wrap">{record.remarks}</p>
                                  ) : (
                                    <p className="text-gray-400 italic">暂无任何备注说明</p>
                                  )}
                                </div>
                              </div>

                              {/* Right pane: Notification Logs */}
                              <div>
                                <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2">
                                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                                  到货通知发送历史
                                </h4>
                                <div className="bg-white border border-gray-200/60 rounded-xl p-3 shadow-3xs max-h-[160px] overflow-y-auto space-y-3">
                                  {record.notificationLogs.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400 italic">
                                      未曾发送任何到货提醒
                                    </div>
                                  ) : (
                                    record.notificationLogs.map((log, idx) => (
                                      <div
                                        key={idx}
                                        className="text-[11px] border-b border-gray-50 last:border-0 pb-2.5 last:pb-0"
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-mono text-gray-400">{log.time}</span>
                                          <span
                                            className={`font-semibold px-1.5 py-0.2 rounded-sm text-[9px] ${
                                              log.type === 'SMS'
                                                ? 'bg-blue-50 text-blue-600 border border-blue-100/30'
                                                : log.type === 'Voice'
                                                ? 'bg-purple-50 text-purple-600 border border-purple-100/30'
                                                : 'bg-slate-50 text-slate-500 border border-slate-100/30'
                                            }`}
                                          >
                                            {log.type === 'SMS' ? '短信通道' : log.type === 'Voice' ? '语音智能呼叫' : '系统操作'}
                                          </span>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed font-sans">{log.content}</p>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / EDIT REGISTER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 my-8">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-gray-150 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {editingRecord ? '修改缺货登记信息' : '创建缺货自提登记'}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">录入家长的校服规格及产品需求</p>
                </div>
              </div>
              <button
                onClick={handleCloseAddModal}
                className="text-gray-400 hover:text-gray-600 p-1 bg-white hover:bg-gray-50 border border-gray-150 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form content */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {/* Product Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 block">
                  选择所缺商品 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formProductId}
                  onChange={e => setFormProductId(Number(e.target.value) || '')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white text-xs text-gray-800 font-medium cursor-pointer"
                >
                  <option value="" disabled>-- 请选择登记的学校与商品 --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.schoolName}] {p.name} - (现货库存: {p.stock}件, 售价: ￥{p.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Real-time system stock warning badge */}
              {selectedProductInForm && (
                <div className={`p-3 rounded-xl text-[11px] flex items-start gap-2 border ${
                  selectedProductInForm.stock > 0 
                    ? 'bg-amber-50 text-amber-800 border-amber-100'
                    : 'bg-rose-50 text-rose-800 border-rose-100'
                }`}>
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      {selectedProductInForm.stock > 0 ? '注意：该商品当前系统仍有库存' : '系统库存已售罄（缺货状态）'}
                    </span>
                    <span>
                      {selectedProductInForm.stock > 0 
                        ? `当前系统仍显示有 ${selectedProductInForm.stock} 件库存，建议您核实前台展台，或继续登记此缺货自提服务。`
                        : '当前此商品在所属学校没有现货库存。录入登记后，可以优先进行仓储配货。'}
                    </span>
                  </div>
                </div>
              )}

              {/* Customer Info Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600 block">
                    家长姓名/客户名称 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例如：王妈妈"
                    value={formCustomerName}
                    onChange={e => setFormCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white text-xs text-gray-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600 block">
                    联系手机电话 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="请输入11位手机号"
                    value={formCustomerPhone}
                    onChange={e => setFormCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white text-xs font-mono text-gray-800"
                  />
                </div>
              </div>

              {/* Spec & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600 block">
                    预留尺码/规格 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="size-suggestions"
                      placeholder="如 140码 或 M码"
                      value={formSize}
                      onChange={e => setFormSize(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white text-xs text-gray-800 font-medium"
                    />
                    <datalist id="size-suggestions">
                      {SIZE_CHOICES.map(sz => (
                        <option key={sz} value={sz} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600 block">
                    需求预留数量 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formQuantity}
                    onChange={e => setFormQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white text-xs text-gray-800 font-bold"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 block">补货备注 / 特殊要求</label>
                <textarea
                  placeholder="可在此输入孩子的其他特殊身型、配货紧迫性或其它说明..."
                  value={formRemarks}
                  onChange={e => setFormRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white text-xs text-gray-800 h-20 resize-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="px-4 py-2 border border-gray-200 text-gray-500 font-semibold rounded-lg text-xs hover:bg-gray-50 active:scale-98 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-md active:scale-98 transition-all"
                >
                  {editingRecord ? '保存修改' : '确认提交登记'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SEND NOTIFICATION */}
      {isNotifyModalOpen && selectedRecordForNotify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-indigo-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-200 animate-bounce" />
                <div>
                  <h3 className="font-bold text-sm">一键发送到货通知</h3>
                  <p className="text-[10px] text-indigo-200 mt-0.5">
                    通知家长：{selectedRecordForNotify.customerName} ({selectedRecordForNotify.customerPhone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNotifyModalOpen(false)}
                className="text-indigo-200 hover:text-white p-1 bg-indigo-800/40 hover:bg-indigo-800 border border-indigo-700/50 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Template Textarea */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 block">
                  短信发送预览
                </label>
                <textarea
                  value={notifyTemplate}
                  onChange={e => setNotifyTemplate(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50 leading-relaxed font-sans"
                />
              </div>

              {/* Info panel */}
              {!isSendingNotification && !notificationSuccess && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-indigo-800 animate-fade-in">
                  <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">极速短信提醒</span>
                    <span>到货通知将通过系统集成短信通道即时下发至家长手机，确保百分百触达。</span>
                  </div>
                </div>
              )}

              {/* Sending / Success Animations */}
              {isSendingNotification && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                    <Send className="w-4 h-4 text-indigo-500 absolute" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">
                      正在提交短信运营商网关...
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">请稍候，这通常需要一到两秒钟</p>
                  </div>
                </div>
              )}

              {notificationSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-2 animate-fade-in">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-emerald-900">
                      短信发送成功
                    </h4>
                    <p className="text-[10px] text-emerald-700 mt-0.5">
                      运营商返回码: SUCCESS，已递送
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {!isSendingNotification && !notificationSuccess && (
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-150">
                  <button
                    onClick={() => setIsNotifyModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-500 font-semibold rounded-lg text-xs hover:bg-gray-50 active:scale-98 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSendNotification}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>确认发送通知</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM PICKUP (DEDUCT STOCK INTEGRATION) */}
      {confirmPickupRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-100 animate-bounce" />
                <h3 className="font-bold text-sm">家长到店取货确认</h3>
              </div>
              <button
                onClick={() => setConfirmPickupRecord(null)}
                className="text-emerald-200 hover:text-white p-1 bg-emerald-700/40 hover:bg-emerald-700 border border-emerald-500/50 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                正在确认家长 <strong className="text-gray-900">{confirmPickupRecord.customerName}</strong> 已凭通知到店，并提走以下商品：
              </p>

              <div className="bg-slate-50 rounded-xl p-3 border border-gray-150 space-y-2 text-xs">
                <div>
                  <span className="text-gray-400">学校：</span>
                  <span className="text-gray-700 font-bold">{confirmPickupRecord.schoolName}</span>
                </div>
                <div>
                  <span className="text-gray-400">商品：</span>
                  <span className="text-gray-700 font-bold">{confirmPickupRecord.productName}</span>
                </div>
                <div>
                  <span className="text-gray-400">规格：</span>
                  <span className="text-gray-700 font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                    {confirmPickupRecord.size}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">数量：</span>
                  <span className="text-gray-900 font-bold">{confirmPickupRecord.quantity} 件</span>
                </div>
              </div>

              {/* Deduct Stock Integration Toggle */}
              {(() => {
                const product = products.find(p => p.id === confirmPickupRecord.productId);
                return (
                  <div className="space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={shouldDeductStock}
                        onChange={e => setShouldDeductStock(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-gray-700 block">同步扣减该学校线下库存</span>
                        <span className="text-gray-400 mt-0.5 block">
                          勾选后，系统将自动从当前商品库存中减去该提货数量。
                        </span>
                      </div>
                    </label>

                    {product && (
                      <div className="text-[11px] bg-slate-50 rounded-lg p-2 flex items-center justify-between border border-dashed border-gray-200">
                        <span className="text-gray-500">当前系统可用库存:</span>
                        <span className="font-mono font-bold text-gray-700">
                          {product.stock} 件 {shouldDeductStock && (
                            <span className="text-rose-500 font-semibold ml-1">
                              &rarr; {Math.max(0, product.stock - confirmPickupRecord.quantity)} 件
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-150">
                <button
                  onClick={() => setConfirmPickupRecord(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-500 font-semibold rounded-lg text-xs hover:bg-gray-50 active:scale-98 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleExecutePickup}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-md active:scale-98 transition-all"
                >
                  确认提货完成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
