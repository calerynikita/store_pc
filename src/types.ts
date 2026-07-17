export type StoreStatus = '营业中' | '休息中';
export type StoreType = '正式版' | '体验版' | '开发版';

export interface PrinterConfig {
  id: string;
  name: string;
  deviceType: 'feie' | 'xprinter' | 'yilianyun' | 'gprinter' | 'bluetooth' | 'usb' | 'network' | 'custom';
  paperWidth: number; // 纸张宽度 (mm)
  paperHeight: number; // 纸张高度 (mm)，0表示连续卷纸
  sn?: string; // 打印机SN/终端号
  key?: string; // 打印机Key/密钥 (云打印机)
  ipAddress?: string; // IP地址 (网口打印机)
  port?: number; // 端口 (网口打印机)
}

export interface Store {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  hours: string;
  status: StoreStatus;
  schools: string[];
  printers: PrinterConfig[];
  qrCode: string; // QR code block placeholder or data URL
  type: StoreType;
  warehouse: string; // 所属店仓
}

export interface SchoolAssociation {
  id: string;
  associationId: string;
  storeName: string;
  schoolName: string;
  status: '启用' | '停用';
}

export type QueueStatus = '等待中' | '叫号中' | '已完成' | '已取消';
export type QueueType = '现货';

export interface QueueRecord {
  id: string;
  ticketNo: string;
  type: QueueType;
  storeName: string;
  status: QueueStatus;
  createdTime: string;
  phone: string;
}

export interface QueueSettings {
  enabled: boolean;
  prefix: string;
  startNo: number;
  reminders: {
    voice: boolean;
    sms: boolean;
    requeue: boolean;
  };
}

export interface Product {
  id: number;
  name: string;
  image: string;
  code: string;
  schoolName: string; // 所属学校 instead of storeName
  price: number;
  stock: number;
  status: '上架' | '下架';
}

export interface OutOfStockNotificationLog {
  time: string;
  content: string;
  type: 'SMS' | 'Voice' | 'System';
}

export interface OutOfStockRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  productId: number;
  productName: string;
  productCode: string;
  schoolName: string;
  size: string;
  quantity: number;
  registeredTime: string;
  status: '登记中' | '已到货' | '已取货' | '已取消';
  notificationSentCount: number;
  notificationLogs: OutOfStockNotificationLog[];
  remarks?: string;
}

