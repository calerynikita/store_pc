import React, { useState, useEffect } from 'react';
import { Store, StoreStatus, StoreType, PrinterConfig } from '../types';
import {
  MapPin,
  Phone,
  User,
  Clock,
  Printer,
  QrCode,
  Download,
  Plus,
  Edit2,
  Trash2,
  GraduationCap,
  Store as StoreIcon,
  X,
  FileCheck2,
  Warehouse,
  School,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Info
} from 'lucide-react';

const schoolTree = [
  {
    id: 'area-xuhui',
    label: '上海徐汇区',
    children: [
      { id: 'sch-xh-syxx', label: '上海市徐汇实验小学' },
      { id: 'sch-xh-sjwy', label: '上海市世界外国语小学' },
      { id: 'sch-xh-xhzx', label: '上海市徐汇中学' },
      { id: 'sch-xh-nylx', label: '上海市南洋模范中学' },
      { id: 'sch-xh-stxx', label: '上海市盛大花园小学' },
    ]
  },
  {
    id: 'area-pudong',
    label: '上海浦东新区',
    children: [
      { id: 'sch-pd-fls', label: '浦东外国语学校' },
      { id: 'sch-pd-hzxx', label: '华东师范大学附属东昌中学' },
      { id: 'sch-pd-jcy', label: '上海建平中学' },
      { id: 'sch-pd-lbs', label: '上海陆家嘴实验学校' },
    ]
  },
  {
    id: 'area-minhang',
    label: '上海闵行区',
    children: [
      { id: 'sch-mh-syzx', label: '上海闵行区实验中学' },
      { id: 'sch-mh-qx', label: '华东师范大学第二附属中学' },
      { id: 'sch-mh-qbz', label: '上海市七宝中学' },
    ]
  },
  {
    id: 'area-nanjing',
    label: '江苏南京地区',
    children: [
      { id: 'sch-nj-yz', label: '南京市第一中学' },
      { id: 'sch-nj-wgy', label: '南京外国语学校' },
      { id: 'sch-nj-sf', label: '南京师范大学附属中学' },
    ]
  },
  {
    id: 'area-hangzhou',
    label: '浙江杭州地区',
    children: [
      { id: 'sch-hz-wgy', label: '杭州外国语学校' },
      { id: 'sch-hz-xj', label: '杭州学军中学' },
      { id: 'sch-hz-yz', label: '杭州市第一中学' },
    ]
  },
  {
    id: 'area-hefei',
    label: '安徽合肥地区',
    children: [
      { id: 'sch-hf-yz', label: '合肥市第一中学' },
      { id: 'sch-hf-syxx', label: '合肥市师范附属小学' },
    ]
  }
];

const DEVICE_OPTIONS = [
  { value: 'feie', label: '飞鹅云打印机', category: '云打印机', defaultWidth: 80, defaultHeight: 0, hasSn: true, hasKey: true, hasIp: false },
  { value: 'xprinter', label: '芯烨云打印机', category: '云打印机', defaultWidth: 80, defaultHeight: 0, hasSn: true, hasKey: true, hasIp: false },
  { value: 'yilianyun', label: '易联云打印机', category: '云打印机', defaultWidth: 80, defaultHeight: 0, hasSn: true, hasKey: true, hasIp: false },
  { value: 'gprinter', label: '佳博网络标签机', category: '局域网/直连', defaultWidth: 80, defaultHeight: 150, hasSn: true, hasKey: false, hasIp: true },
  { value: 'network', label: '网络小票打印机 (ESC/POS)', category: '局域网/直连', defaultWidth: 80, defaultHeight: 0, hasSn: false, hasKey: false, hasIp: true },
  { value: 'bluetooth', label: '蓝牙热敏小票机', category: '移动端直连', defaultWidth: 58, defaultHeight: 0, hasSn: false, hasKey: false, hasIp: false },
  { value: 'usb', label: '本地USB热敏小票机', category: '本地电脑', defaultWidth: 80, defaultHeight: 0, hasSn: false, hasKey: false, hasIp: false },
  { value: 'custom', label: '通用/其他打印设备', category: '其他', defaultWidth: 80, defaultHeight: 0, hasSn: false, hasKey: false, hasIp: false },
] as const;

interface StoreListTabProps {
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
}

export default function StoreListTab({ stores, setStores }: StoreListTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  
  // View modals states
  const [activeSchoolsStore, setActiveSchoolsStore] = useState<Store | null>(null);
  const [activePrintersStore, setActivePrintersStore] = useState<Store | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [manager, setManager] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('09:00-21:00');
  const [status, setStatus] = useState<StoreStatus>('营业中');
  const [type, setType] = useState<StoreType>('正式版');
  const [warehouse, setWarehouse] = useState('');

  // School UI local states (Dynamic Dual-Column SaaS list design)
  const [schoolSearch, setSchoolSearch] = useState('');
  const [selectedAreaTab, setSelectedAreaTab] = useState('all');
  const [hideAssociated, setHideAssociated] = useState(false);
  const [selectedListSearch, setSelectedListSearch] = useState('');
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [batchImportText, setBatchImportText] = useState('');

  // Local helper states for add inputs inside detail view modals
  const [newSchoolInput, setNewSchoolInput] = useState('');
  const [newPrinterInput, setNewPrinterInput] = useState('');
  const [newPrinterDeviceType, setNewPrinterDeviceType] = useState<PrinterConfig['deviceType']>('feie');
  const [newPrinterWidth, setNewPrinterWidth] = useState<number>(80);
  const [newPrinterHeight, setNewPrinterHeight] = useState<number>(0);
  const [newPrinterSn, setNewPrinterSn] = useState('');
  const [newPrinterKey, setNewPrinterKey] = useState('');
  const [newPrinterIpAddress, setNewPrinterIpAddress] = useState('');
  const [newPrinterPort, setNewPrinterPort] = useState<number>(9100);
  const [editingPrinterId, setEditingPrinterId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const totalStores = stores.length;
  const totalPages = Math.ceil(totalStores / pageSize) || 1;

  // Sync current page if total pages decreases (e.g. after a deletion)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalStores, pageSize, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStores = stores.slice(startIndex, startIndex + pageSize);

  // Reset or Populate form fields on modal change
  useEffect(() => {
    if (editingStore) {
      setName(editingStore.name);
      setCode(editingStore.code);
      setManager(editingStore.manager);
      setPhone(editingStore.phone);
      setAddress(editingStore.address);
      setHours(editingStore.hours);
      setStatus(editingStore.status);
      setType(editingStore.type);
      setWarehouse(editingStore.warehouse || '');
    } else {
      setName('');
      setCode('');
      setManager('');
      setPhone('');
      setAddress('');
      setHours('09:00-21:00');
      setStatus('营业中');
      setType('正式版');
      setWarehouse('');
    }
  }, [editingStore, isModalOpen]);

  // Keep viewing store details up to date reactively if they are being updated
  useEffect(() => {
    if (activeSchoolsStore) {
      const fresh = stores.find(s => s.id === activeSchoolsStore.id);
      if (!fresh) {
        setActiveSchoolsStore(null);
      } else if (JSON.stringify(fresh) !== JSON.stringify(activeSchoolsStore)) {
        setActiveSchoolsStore(fresh);
      }
    }
  }, [stores, activeSchoolsStore]);

  useEffect(() => {
    if (activePrintersStore) {
      const fresh = stores.find(s => s.id === activePrintersStore.id);
      if (!fresh) {
        setActivePrintersStore(null);
      } else if (JSON.stringify(fresh) !== JSON.stringify(activePrintersStore)) {
        setActivePrintersStore(fresh);
      }
    }
  }, [stores, activePrintersStore]);

  const handleSubmitStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !address.trim() || !warehouse.trim()) {
      alert('请填写所有必填信息');
      return;
    }

    if (editingStore) {
      // Edit mode - preserves existing schools and printers
      setStores(prev => {
        const next = prev.map(s => {
          if (s.id === editingStore.id) {
            return {
              ...s,
              code: code.trim(),
              name: name.trim(),
              address: address.trim(),
              status,
              type,
              warehouse: warehouse.trim()
            };
          }
          return s;
        });
        return next;
      });
    } else {
      // Add mode - starts with empty schools & printers, configured dynamically afterward
      const newStore: Store = {
        id: `store-${Date.now()}`,
        code: code.trim(),
        name: name.trim(),
        address: address.trim(),
        phone: '',
        manager: '',
        hours: '',
        status,
        schools: [],
        printers: [],
        qrCode: `qr-code-${Date.now()}`,
        type,
        warehouse: warehouse.trim()
      };
      setStores(prev => [...prev, newStore]);
    }

    setIsModalOpen(false);
    setEditingStore(null);
  };

  const handleDeleteStore = (id: string) => {
    if (confirm('确认要删除该门店吗？这将清除所有关联的数据配置。')) {
      setStores(prev => prev.filter(s => s.id !== id));
      if (activeSchoolsStore?.id === id) setActiveSchoolsStore(null);
      if (activePrintersStore?.id === id) setActivePrintersStore(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    setStores(prev => {
      const next = prev.map(s => {
        if (s.id === id) {
          return {
            ...s,
            status: s.status === '营业中' ? '休息中' as StoreStatus : '营业中' as StoreStatus
          };
        }
        return s;
      });
      return next;
    });
  };

  // Dynamically toggle association of a single school
  const handleToggleSchoolLink = (storeId: string, schoolName: string) => {
    setStores(prev => {
      const next = prev.map(s => {
        if (s.id === storeId) {
          const exists = s.schools.includes(schoolName);
          const updatedSchools = exists
            ? s.schools.filter(name => name !== schoolName)
            : [...s.schools, schoolName];
          return { ...s, schools: updatedSchools };
        }
        return s;
      });
      return next;
    });
  };

  // Dynamically link a batch of schools
  const handleBatchLinkFiltered = (storeId: string, filteredSchoolNames: string[]) => {
    setStores(prev => {
      const next = prev.map(s => {
        if (s.id === storeId) {
          const updatedSchools = [...s.schools];
          filteredSchoolNames.forEach(name => {
            if (!updatedSchools.includes(name)) {
              updatedSchools.push(name);
            }
          });
          return { ...s, schools: updatedSchools };
        }
        return s;
      });
      return next;
    });
  };

  // Dynamically unlink a batch of schools
  const handleBatchUnlinkFiltered = (storeId: string, filteredSchoolNames: string[]) => {
    setStores(prev => {
      const next = prev.map(s => {
        if (s.id === storeId) {
          const updatedSchools = s.schools.filter(name => !filteredSchoolNames.includes(name));
          return { ...s, schools: updatedSchools };
        }
        return s;
      });
      return next;
    });
  };

  // Dynamically import schools from bulk text area
  const handleBatchImportSchools = (storeId: string) => {
    if (!batchImportText.trim()) return;
    const lines = batchImportText
      .split(/[\n,;，；\t]+/)
      .map(line => line.trim())
      .filter(Boolean);
    
    if (lines.length === 0) return;

    setStores(prev => {
      const next = prev.map(s => {
        if (s.id === storeId) {
          const updatedSchools = [...s.schools];
          let addedCount = 0;
          lines.forEach(name => {
            if (!updatedSchools.includes(name)) {
              updatedSchools.push(name);
              addedCount++;
            }
          });
          return { ...s, schools: updatedSchools };
        }
        return s;
      });
      return next;
    });
    setBatchImportText('');
    setIsBatchImportOpen(false);
  };

  // Dynamically remove a school in detail modal
  const handleRemoveSchoolFromStore = (storeId: string, schoolName: string) => {
    setStores(prev => {
      const next = prev.map(s => {
        if (s.id === storeId) {
          return { ...s, schools: s.schools.filter(sc => sc !== schoolName) };
        }
        return s;
      });
      return next;
    });
  };

  // Dynamically add or edit a printer in detail modal
  const handleAddPrinterToStore = (storeId: string) => {
    if (!newPrinterInput.trim()) return;
    
    setStores(prev => {
      const next = prev.map(s => {
        if (s.id === storeId) {
          const printersList = s.printers || [];
          
          if (editingPrinterId) {
            // Edit Mode - Update existing printer
            const nameExists = printersList.some(
              pr => pr.id !== editingPrinterId && pr.name.trim() === newPrinterInput.trim()
            );
            if (nameExists) {
              alert('该打印机名称已存在');
              return s;
            }
            
            const updatedPrinters = printersList.map(pr => {
              if (pr.id === editingPrinterId) {
                return {
                  ...pr,
                  name: newPrinterInput.trim(),
                  deviceType: newPrinterDeviceType,
                  paperWidth: Number(newPrinterWidth) || 80,
                  paperHeight: Number(newPrinterHeight) || 0,
                  sn: newPrinterSn.trim() || undefined,
                  key: newPrinterKey.trim() || undefined,
                  ipAddress: newPrinterIpAddress.trim() || undefined,
                  port: Number(newPrinterPort) || undefined,
                };
              }
              return pr;
            });
            return { ...s, printers: updatedPrinters };
          } else {
            // Add Mode
            const nameExists = printersList.some(
              pr => pr.name.trim() === newPrinterInput.trim()
            );
            if (nameExists) {
              alert('该打印机名称已存在');
              return s;
            }
            
            const newPrinter: PrinterConfig = {
              id: `printer-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: newPrinterInput.trim(),
              deviceType: newPrinterDeviceType,
              paperWidth: Number(newPrinterWidth) || 80,
              paperHeight: Number(newPrinterHeight) || 0,
              sn: newPrinterSn.trim() || undefined,
              key: newPrinterKey.trim() || undefined,
              ipAddress: newPrinterIpAddress.trim() || undefined,
              port: Number(newPrinterPort) || undefined,
            };
            return { ...s, printers: [...printersList, newPrinter] };
          }
        }
        return s;
      });
      return next;
    });
    
    // Reset states after complete
    setNewPrinterInput('');
    setNewPrinterDeviceType('feie');
    setNewPrinterWidth(80);
    setNewPrinterHeight(0);
    setNewPrinterSn('');
    setNewPrinterKey('');
    setNewPrinterIpAddress('');
    setNewPrinterPort(9100);
    setEditingPrinterId(null);
  };

  // Dynamically remove a printer in detail modal
  const handleRemovePrinterFromStore = (storeId: string, printerId: string) => {
    setStores(prev => {
      const next = prev.map(s => {
        if (s.id === storeId) {
          const printersList = s.printers || [];
          return { ...s, printers: printersList.filter(pr => pr.id !== printerId) };
        }
        return s;
      });
      return next;
    });
    
    // If the printer being deleted was being edited, reset editing state
    if (editingPrinterId === printerId) {
      setNewPrinterInput('');
      setNewPrinterDeviceType('feie');
      setNewPrinterWidth(80);
      setNewPrinterHeight(0);
      setNewPrinterSn('');
      setNewPrinterKey('');
      setNewPrinterIpAddress('');
      setNewPrinterPort(9100);
      setEditingPrinterId(null);
    }
  };

  const handleStartEditPrinter = (printer: any) => {
    setEditingPrinterId(printer.id);
    setNewPrinterInput(printer.name);
    setNewPrinterDeviceType(printer.deviceType || 'feie');
    setNewPrinterWidth(printer.paperWidth);
    setNewPrinterHeight(printer.paperHeight);
    setNewPrinterSn(printer.sn || '');
    setNewPrinterKey(printer.key || '');
    setNewPrinterIpAddress(printer.ipAddress || '');
    setNewPrinterPort(printer.port || 9100);
  };

  const handleCancelEditPrinter = () => {
    setNewPrinterInput('');
    setNewPrinterDeviceType('feie');
    setNewPrinterWidth(80);
    setNewPrinterHeight(0);
    setNewPrinterSn('');
    setNewPrinterKey('');
    setNewPrinterIpAddress('');
    setNewPrinterPort(9100);
    setEditingPrinterId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Title section with Breadcrumbs and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-1.5">
            <span>线下</span>
            <span>&gt;</span>
            <span>门店管理</span>
            <span>&gt;</span>
            <span className="text-gray-600 font-medium">门店列表</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">门店管理</h1>
          <p className="text-xs text-gray-400 mt-0.5">管理线下各门店信息、所属版本、所属店仓、关联学校以及发票打印机。</p>
        </div>

        <button
          onClick={() => {
            setEditingStore(null);
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>新增门店</span>
        </button>
      </div>

      {/* List / Table of Stores */}
      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">门店信息</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">所属店仓</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">详细地址</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">版本</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">营业状态</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">门店二维码</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedStores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-xs text-gray-400">
                    暂无门店，请点击右上角新增门店
                  </td>
                </tr>
              ) : (
                paginatedStores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Store Name & Code */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                          <StoreIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{store.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">编码: {store.code}</div>
                        </div>
                      </div>
                    </td>

                    {/* Warehouse */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100/70 border border-slate-200/50 px-2.5 py-1 rounded-md font-semibold">
                        <Warehouse className="w-3.5 h-3.5 text-slate-500" />
                        {store.warehouse || '未设置'}
                      </span>
                    </td>

                    {/* Address */}
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-500 block max-w-xs truncate font-medium" title={store.address}>
                        {store.address}
                      </span>
                    </td>

                    {/* Type Version */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        store.type === '正式版'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : store.type === '体验版'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                      }`}>
                        {store.type}
                      </span>
                    </td>

                    {/* Status Toggle Button */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(store.id)}
                        title="点击切换营业状态"
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                          store.status === '营业中'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                        }`}
                      >
                        {store.status}
                      </button>
                    </td>

                    {/* QR Code */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-white border border-gray-200 rounded-md flex items-center justify-center text-gray-400 shadow-3xs">
                          <QrCode className="w-3.5 h-3.5" />
                        </div>
                        <button
                          onClick={() => alert('开始下载该门店的高清二维码...')}
                          className="p-1 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-md transition-colors cursor-pointer"
                          title="下载二维码"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-600" />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveSchoolsStore(store)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg transition-all cursor-pointer"
                        >
                          <School className="w-3.5 h-3.5 text-indigo-500" />
                          <span>关联学校 ({store.schools.length})</span>
                        </button>

                        <button
                          onClick={() => setActivePrintersStore(store)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-indigo-500" />
                          <span>打印机配置 ({store.printers.length})</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingStore(store);
                            setIsModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:text-gray-950 hover:bg-gray-150 border border-gray-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>编辑</span>
                        </button>
                        <button
                          onClick={() => handleDeleteStore(store.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="删除门店"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        {totalStores > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 bg-slate-50 border-t border-gray-150 rounded-b-2xl">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>
                共 <span className="font-semibold text-gray-700">{totalStores}</span> 个门店
              </span>
              <div className="flex items-center gap-1.5">
                <span>每页显示</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-200 text-gray-700 rounded-md py-1 px-2 focus:outline-hidden cursor-pointer text-xs"
                >
                  <option value={5}>5 条</option>
                  <option value={10}>10 条</option>
                  <option value={20}>20 条</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 bg-white border border-gray-200 hover:bg-slate-50 text-gray-600 rounded-md disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="第一页"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-slate-50 text-xs font-semibold text-gray-600 rounded-md disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                上一页
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  totalPages > 5 &&
                  page !== 1 &&
                  page !== totalPages &&
                  Math.abs(page - currentPage) > 1
                ) {
                  if (
                    (page === 2 && currentPage > 3) ||
                    (page === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span key={page} className="px-1 text-xs text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white border border-indigo-600 shadow-2xs'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-slate-50 hover:text-gray-900'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-slate-50 text-xs font-semibold text-gray-600 rounded-md disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                下一页
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 bg-white border border-gray-200 hover:bg-slate-50 text-gray-600 rounded-md disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="最后一页"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Associated Schools Modal (Click-to-view & Manage) */}
      {activeSchoolsStore && (() => {
        // Flat preset list of schools
        const allPresetSchools = schoolTree.flatMap(area =>
          area.children.map(school => ({
            areaId: area.id,
            areaLabel: area.label,
            schoolName: school.label
          }))
        );

        // Schools that are in activeSchoolsStore but not in our preset list
        const activeStoreSchools = activeSchoolsStore.schools || [];
        const customSchools = activeStoreSchools
          .filter(name => !allPresetSchools.some(ps => ps.schoolName === name))
          .map(name => ({
            areaId: 'area-custom',
            areaLabel: '自定义学校',
            schoolName: name
          }));

        // Merge both lists
        const allAvailableSchools = [...allPresetSchools, ...customSchools];

        // Unique dynamic areas for filtering tabs
        const areaTabs = [
          { id: 'all', label: '全部学校' },
          ...schoolTree.map(area => ({
            id: area.id,
            label: area.label.replace('上海', '').replace('江苏', '').replace('浙江', '').replace('安徽', '').trim()
          })),
          { id: 'area-custom', label: '自定义学校' }
        ];

        // Filter left pane available schools
        const filteredAvailableSchools = allAvailableSchools.filter(school => {
          // 1. Tab filtering
          if (selectedAreaTab !== 'all') {
            if (school.areaId !== selectedAreaTab) return false;
          }
          // 2. Search filtering
          if (schoolSearch.trim()) {
            const query = schoolSearch.trim().toLowerCase();
            const matchName = school.schoolName.toLowerCase().includes(query);
            const matchArea = school.areaLabel.toLowerCase().includes(query);
            if (!matchName && !matchArea) return false;
          }
          // 3. Hide already associated schools
          if (hideAssociated) {
            if (activeStoreSchools.includes(school.schoolName)) return false;
          }
          return true;
        });

        // Search within already selected list on the right pane
        const filteredSelectedSchools = activeStoreSchools.filter(name => {
          if (!selectedListSearch.trim()) return true;
          return name.toLowerCase().includes(selectedListSearch.trim().toLowerCase());
        });

        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 flex flex-col h-[85vh] max-h-[750px]">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/30 to-indigo-50/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <School className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">选择并关联学校</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">配置此门店负责的学校范围，支持多维快速检索、双栏穿梭关联与文本批量导入</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveSchoolsStore(null);
                    setSchoolSearch('');
                    setSelectedListSearch('');
                    setIsBatchImportOpen(false);
                  }}
                  className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Store context info row */}
              <div className="px-6 py-3 bg-slate-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">当前编辑门店：</span>
                  <span className="font-bold text-gray-900 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-3xs">{activeSchoolsStore.name}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">门店编号：</span>
                  <span className="font-mono text-gray-600">{activeSchoolsStore.code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">关联状态：</span>
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    已关联 {activeStoreSchools.length} 所学校
                  </span>
                </div>
              </div>

              {/* Main Dual-Column Content Area */}
              <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-150">
                
                {/* LEFT COLUMN: School Warehouse (md:col-span-3, 60% Width) */}
                <div className="md:col-span-3 flex flex-col p-5 min-h-0 bg-white">
                  
                  {/* Search, toggle, & Action Bar */}
                  <div className="space-y-3 shrink-0 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="搜索学校名称或所属区域..."
                          value={schoolSearch}
                          onChange={e => setSchoolSearch(e.target.value)}
                          className="w-full pl-9 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white transition-colors"
                        />
                        {schoolSearch && (
                          <button
                            onClick={() => setSchoolSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-semibold cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <label className="flex items-center gap-1.5 text-xs text-gray-600 font-bold cursor-pointer shrink-0 select-none bg-slate-50/70 hover:bg-slate-100/70 px-2.5 py-1.5 border border-gray-200 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={hideAssociated}
                          onChange={e => setHideAssociated(e.target.checked)}
                          className="rounded-sm text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 border-gray-300 cursor-pointer"
                        />
                        <span>隐藏已选</span>
                      </label>
                    </div>

                    {/* Horizontal Area Filter Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-thin">
                      {areaTabs.map(tab => {
                        // Count matching available items for badge
                        const countInTab = allAvailableSchools.filter(school => {
                          if (tab.id !== 'all' && school.areaId !== tab.id) return false;
                          if (hideAssociated && activeStoreSchools.includes(school.schoolName)) return false;
                          return true;
                        }).length;

                        const isActive = selectedAreaTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setSelectedAreaTab(tab.id)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-gray-600'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span className={`text-[9px] px-1 rounded-full ${isActive ? 'bg-indigo-500/80 text-white' : 'bg-gray-200 text-gray-500'}`}>
                              {countInTab}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Batch Import Card / School List Pane */}
                  <div className="flex-1 min-h-0 flex flex-col relative">
                    {isBatchImportOpen ? (
                      /* Batch Text Import Mode */
                      <div className="absolute inset-0 bg-white border border-indigo-100 rounded-xl p-4 flex flex-col space-y-3 z-10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                            <Plus className="w-4 h-4 text-indigo-500" />
                            文本批量关联学校
                          </span>
                          <button
                            onClick={() => setIsBatchImportOpen(false)}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold"
                          >
                            返回列表
                          </button>
                        </div>
                        
                        <p className="text-[10px] text-gray-500 leading-normal">
                          在下方粘贴或输入多个学校名称（每个学校占一行，或者用逗号隔开），系统将自动创建并不重复地关联到当前门店：
                        </p>

                        <textarea
                          rows={6}
                          placeholder="例如：&#10;上海市实验学校&#10;上海交通大学附属小学&#10;复旦大学附属中学"
                          value={batchImportText}
                          onChange={e => setBatchImportText(e.target.value)}
                          className="w-full flex-1 p-3 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-slate-50 font-sans resize-none"
                        />

                        <div className="flex justify-end gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setIsBatchImportOpen(false);
                              setBatchImportText('');
                            }}
                            className="px-3 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => handleBatchImportSchools(activeSchoolsStore.id)}
                            className="px-4 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-lg shadow-xs"
                          >
                            确认导入并关联
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {/* Flat list of matching available schools */}
                    <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl bg-slate-50/50 p-2 space-y-1">
                      {filteredAvailableSchools.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-xs">
                          没有找到符合条件的学校
                        </div>
                      ) : (
                        filteredAvailableSchools.map((school, idx) => {
                          const isLinked = activeStoreSchools.includes(school.schoolName);
                          return (
                            <div
                              key={idx}
                              onClick={() => handleToggleSchoolLink(activeSchoolsStore.id, school.schoolName)}
                              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer select-none group ${
                                isLinked
                                  ? 'bg-indigo-50/30 border-indigo-100 shadow-3xs'
                                  : 'bg-white border-transparent hover:border-slate-200 hover:shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {/* Area Prefix Pill */}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                                  school.areaId === 'area-custom'
                                    ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                    : 'bg-slate-100 text-gray-500 border border-gray-200'
                                }`}>
                                  {school.areaLabel.replace('上海', '').replace('江苏', '').replace('浙江', '').replace('安徽', '').trim()}
                                </span>
                                <span className={`text-xs ${isLinked ? 'text-indigo-600 font-bold' : 'text-gray-700 font-medium group-hover:text-gray-950'}`}>
                                  {school.schoolName}
                                </span>
                              </div>

                              <div>
                                {isLinked ? (
                                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-bold flex items-center gap-0.5 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                                    <span className="inline group-hover:hidden">已关联</span>
                                    <span className="hidden group-hover:inline">取消关联</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 px-2 py-1 rounded-md font-bold transition-all">
                                    + 关联
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Left Column Bottom Quick Actions Bar */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsBatchImportOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>粘贴文本批量导入学校...</span>
                    </button>

                    <div className="flex gap-2">
                      {filteredAvailableSchools.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              const targets = filteredAvailableSchools.map(s => s.schoolName);
                              handleBatchLinkFiltered(activeSchoolsStore.id, targets);
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                          >
                            关联本组 ({filteredAvailableSchools.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const targets = filteredAvailableSchools.map(s => s.schoolName);
                              handleBatchUnlinkFiltered(activeSchoolsStore.id, targets);
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                          >
                            取消本组
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Selected/Associated Panel (md:col-span-2, 40% Width) */}
                <div className="md:col-span-2 flex flex-col p-5 bg-slate-50/50 min-h-0">
                  <div className="flex items-center justify-between shrink-0 mb-3">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      当前已选择 ({activeStoreSchools.length})
                    </span>

                    {activeStoreSchools.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('确认要清空当前门店关联的所有学校吗？')) {
                            setStores(prev => prev.map(s => {
                              if (s.id === activeSchoolsStore.id) {
                                return { ...s, schools: [] };
                              }
                              return s;
                            }));
                          }
                        }}
                        className="text-[10px] text-rose-500 hover:text-rose-700 hover:underline font-bold transition-all cursor-pointer"
                      >
                        全部清空
                      </button>
                    )}
                  </div>

                  {/* Search inside selected schools */}
                  <div className="relative mb-3 shrink-0">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="在已选学校中搜索..."
                      value={selectedListSearch}
                      onChange={e => setSelectedListSearch(e.target.value)}
                      className="w-full pl-8 pr-7 py-1 text-[11px] border border-gray-200 rounded-md focus:outline-hidden focus:border-indigo-500 bg-white"
                    />
                    {selectedListSearch && (
                      <button
                        onClick={() => setSelectedListSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-semibold cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  {/* Selected items Scroll List */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 border border-gray-150 rounded-xl bg-white p-2.5">
                    {filteredSelectedSchools.length === 0 ? (
                      <div className="text-center py-20 text-gray-400 text-xs flex flex-col items-center justify-center gap-1">
                        <span>{activeStoreSchools.length === 0 ? '暂无关联学校' : '没有匹配的已选学校'}</span>
                        <span className="text-[10px] text-gray-300">请在左侧列表中点击选择关联</span>
                      </div>
                    ) : (
                      filteredSelectedSchools.map((school, idx) => {
                        const originalInfo = allPresetSchools.find(p => p.schoolName === school);
                        const areaName = originalInfo ? originalInfo.areaLabel : '自定义学校';

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 transition-all text-xs group"
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="font-medium text-gray-800 truncate">{school}</span>
                              <span className="text-[9px] text-gray-400 font-semibold uppercase mt-0.5">
                                {areaName.replace('上海', '').replace('江苏', '').replace('浙江', '').replace('安徽', '').trim()}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveSchoolFromStore(activeSchoolsStore.id, school)}
                              className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all shrink-0 cursor-pointer opacity-60 group-hover:opacity-100"
                              title="取消关联"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-gray-100 bg-slate-50 flex justify-end shrink-0">
                <button
                  onClick={() => {
                    setActiveSchoolsStore(null);
                    setSchoolSearch('');
                    setSelectedListSearch('');
                    setIsBatchImportOpen(false);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer hover:shadow-md"
                >
                  确认并关闭
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Printer Configuration Modal (Click-to-view & Manage) */}
      {activePrintersStore && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/30 to-indigo-50/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <Printer className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">打印机与纸张配置</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">配置此门店的收银小票、配货标签打印设备及纸张规格</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActivePrintersStore(null);
                  handleCancelEditPrinter();
                }}
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="text-xs text-gray-600 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span>当前门店：</span>
                  <span className="font-bold text-gray-900">{activePrintersStore.name}</span>
                </div>
                <div className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  已配设备 {activePrintersStore.printers.length} 台
                </div>
              </div>

              {/* Add/Edit Printer Form */}
              <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-4 space-y-4">
                <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-500" />
                  {editingPrinterId ? '编辑打印设备' : '新增打印设备'}
                </h4>

                {/* Device Brand / Connection Type Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600 block">选择打印设备品牌/类型 <span className="text-rose-500">*</span></label>
                  <select
                    value={newPrinterDeviceType}
                    onChange={e => {
                      const val = e.target.value as PrinterConfig['deviceType'];
                      setNewPrinterDeviceType(val);
                      const selected = DEVICE_OPTIONS.find(o => o.value === val);
                      if (selected) {
                        setNewPrinterWidth(selected.defaultWidth);
                        setNewPrinterHeight(selected.defaultHeight);
                        // Auto pre-fill name suggestion
                        setNewPrinterInput(`${activePrintersStore.name}-${selected.label}`);
                      }
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white font-medium text-gray-800 cursor-pointer"
                  >
                    {Array.from(new Set(DEVICE_OPTIONS.map(o => o.category))).map(cat => (
                      <optgroup key={cat} label={cat} className="text-gray-500 text-[11px]">
                        {DEVICE_OPTIONS.filter(o => o.category === cat).map(o => (
                          <option key={o.value} value={o.value} className="text-gray-800 text-xs">{o.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Printer Name Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600 block">设备备注名称 <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    placeholder="例如：后勤配货飞鹅打印机"
                    value={newPrinterInput}
                    onChange={e => setNewPrinterInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                  />
                </div>

                {/* Conditional Fields based on Selection */}
                {(() => {
                  const currentSelected = DEVICE_OPTIONS.find(o => o.value === newPrinterDeviceType);
                  return (
                    <div className="space-y-3">
                      {currentSelected?.hasSn && (
                        <div className="space-y-1 animate-fade-in">
                          <label className="text-[11px] font-semibold text-gray-600 block">
                            设备终端号 (SN) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="请输入打印机底部的 SN 编号或终端号"
                            value={newPrinterSn}
                            onChange={e => setNewPrinterSn(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white font-mono"
                          />
                        </div>
                      )}

                      {currentSelected?.hasKey && (
                        <div className="space-y-1 animate-fade-in">
                          <label className="text-[11px] font-semibold text-gray-600 block">
                            设备密钥 (KEY / TOKEN) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="请输入云打印机的 API 密钥/KEY"
                            value={newPrinterKey}
                            onChange={e => setNewPrinterKey(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white font-mono"
                          />
                        </div>
                      )}

                      {currentSelected?.hasIp && (
                        <div className="grid grid-cols-3 gap-3 animate-fade-in">
                          <div className="col-span-2 space-y-1">
                            <label className="text-[11px] font-semibold text-gray-600 block">
                              网口 IP 地址 <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="例如：192.168.1.150"
                              value={newPrinterIpAddress}
                              onChange={e => setNewPrinterIpAddress(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-gray-600 block">网络端口</label>
                            <input
                              type="number"
                              placeholder="9100"
                              value={newPrinterPort || ''}
                              onChange={e => setNewPrinterPort(Number(e.target.value) || 9100)}
                              className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {(newPrinterDeviceType === 'bluetooth' || newPrinterDeviceType === 'usb') && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-gray-500 flex items-start gap-2 animate-fade-in">
                          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-gray-700 block">
                              {newPrinterDeviceType === 'bluetooth' ? '移动端蓝牙直连模式' : '本地 USB 直连模式'}
                            </span>
                            <span>
                              {newPrinterDeviceType === 'bluetooth'
                                ? '适用于手持收银PDA、智能平板及手机。通过手机系统蓝牙连接设备。'
                                : '适用于前台收银电脑。需要在本地电脑安装通用热敏驱动，并在收银端选择此本地打印通道。'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Paper Dimensions */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Paper Width */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600 block">纸张宽度 (mm)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={10}
                        max={300}
                        placeholder="80"
                        value={newPrinterWidth || ''}
                        onChange={e => setNewPrinterWidth(Number(e.target.value) || 0)}
                        className="w-full pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">mm</span>
                    </div>
                    {/* Quick options */}
                    <div className="flex gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => setNewPrinterWidth(80)}
                        className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold border transition-colors ${
                          newPrinterWidth === 80
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        80mm
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewPrinterWidth(58)}
                        className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold border transition-colors ${
                          newPrinterWidth === 58
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        58mm
                      </button>
                    </div>
                  </div>

                  {/* Paper Height */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-gray-600 block">纸张高度 (mm)</label>
                      <label className="flex items-center gap-1 text-[9px] text-gray-500 font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newPrinterHeight === 0}
                          onChange={e => setNewPrinterHeight(e.target.checked ? 0 : 150)}
                          className="rounded-3xs text-indigo-600 focus:ring-indigo-500 h-3 w-3 border-gray-300 cursor-pointer"
                        />
                        <span>连续卷纸</span>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        placeholder="连续卷纸"
                        disabled={newPrinterHeight === 0}
                        value={newPrinterHeight === 0 ? '' : newPrinterHeight}
                        onChange={e => setNewPrinterHeight(Number(e.target.value) || 0)}
                        className="w-full pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-white disabled:bg-slate-100 disabled:text-gray-400"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">
                        {newPrinterHeight === 0 ? '卷纸' : 'mm'}
                      </span>
                    </div>
                    {/* Quick options */}
                    {newPrinterHeight !== 0 && (
                      <div className="flex gap-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => setNewPrinterHeight(150)}
                          className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold border transition-colors ${
                            newPrinterHeight === 150
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          150mm
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPrinterHeight(297)}
                          className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold border transition-colors ${
                            newPrinterHeight === 297
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          A4 (297)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-2 pt-1.5">
                  {editingPrinterId && (
                    <button
                      type="button"
                      onClick={handleCancelEditPrinter}
                      className="px-3 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      取消
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleAddPrinterToStore(activePrintersStore.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    {editingPrinterId ? '保存修改' : '确认添加'}
                  </button>
                </div>
              </div>

              {/* Printer List Section */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">已配打印设备列表</label>
                {activePrintersStore.printers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl bg-slate-50/30 flex flex-col items-center justify-center gap-1">
                    <span>此门店暂未配置打印设备</span>
                    <span className="text-[10px] text-gray-300">请在上方表单配置并添加</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {activePrintersStore.printers.map((printer, idx) => {
                      const isEditingThis = editingPrinterId === printer.id;
                      const deviceMeta = DEVICE_OPTIONS.find(o => o.value === printer.deviceType);
                      return (
                        <div
                          key={printer.id || idx}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isEditingThis
                              ? 'bg-indigo-50/50 border-indigo-300 shadow-3xs ring-2 ring-indigo-600/10'
                              : 'bg-white border-gray-150 hover:border-slate-300 hover:shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg mt-0.5 ${isEditingThis ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-500'}`}>
                              <Printer className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900 flex flex-wrap items-center gap-1.5">
                                <span>{printer.name}</span>
                                {deviceMeta && (
                                  <span className="bg-indigo-50 text-indigo-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-100/50">
                                    {deviceMeta.label}
                                  </span>
                                )}
                                {isEditingThis && (
                                  <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    编辑中
                                  </span>
                                )}
                              </div>
                              
                              {/* Connection Details Metadata */}
                              {(printer.sn || printer.ipAddress) && (
                                <div className="text-[10px] text-gray-400 font-mono mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  {printer.sn && (
                                    <span>SN: <span className="text-gray-600 font-semibold">{printer.sn}</span></span>
                                  )}
                                  {printer.ipAddress && (
                                    <span>IP: <span className="text-gray-600 font-semibold">{printer.ipAddress}{printer.port ? `:${printer.port}` : ''}</span></span>
                                  )}
                                </div>
                              )}

                              <div className="text-[10px] text-gray-500 font-medium mt-1.5 flex items-center gap-2">
                                <span className="bg-slate-100 text-gray-600 px-1.5 py-0.5 rounded font-mono font-semibold">
                                  宽 {printer.paperWidth} mm
                                </span>
                                <span className="text-gray-300">|</span>
                                <span className="bg-slate-100 text-gray-600 px-1.5 py-0.5 rounded font-mono font-semibold">
                                  高 {printer.paperHeight === 0 ? '连续卷纸' : `${printer.paperHeight} mm`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEditPrinter(printer)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="编辑配置"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemovePrinterFromStore(activePrintersStore.id, printer.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="删除设备"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-slate-50 flex justify-end shrink-0">
              <button
                onClick={() => {
                  setActivePrintersStore(null);
                  handleCancelEditPrinter();
                }}
                className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer hover:shadow-md"
              >
                确认并关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal for adding or editing a store */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 transform scale-100 transition-all">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50/30">
              <div className="flex items-center gap-2">
                <StoreIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900 text-sm">
                  {editingStore ? '编辑门店配置' : '新增门店配置'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingStore(null);
                }}
                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitStore} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Store Name */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    门店名称 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如：迪尚校园服开发区店"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50"
                  />
                </div>

                {/* Code */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    门店编码 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如：DS004"
                    value={code}
                    disabled={!!editingStore}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>

                {/* Warehouse */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    所属店仓 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="如：迪尚一号仓"
                    value={warehouse}
                    onChange={e => setWarehouse(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    营业状态
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as StoreStatus)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50"
                  >
                    <option value="营业中">营业中</option>
                    <option value="休息中">休息中</option>
                  </select>
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    版本
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as StoreType)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50"
                  >
                    <option value="正式版">正式版</option>
                    <option value="体验版">体验版</option>
                    <option value="开发版">开发版</option>
                  </select>
                </div>

                {/* Address */}
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">
                    详细地址 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="上海市徐汇区钦州路100号"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-gray-50/50"
                  />
                </div>


              </div>

              {/* Modal footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingStore(null);
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md active:scale-98 transition-all"
                >
                  {editingStore ? '保存修改' : '确认新增'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
