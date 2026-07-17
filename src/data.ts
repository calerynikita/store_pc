import { Store, SchoolAssociation, QueueRecord, QueueSettings, Product, OutOfStockRecord } from './types';

export const initialStores: Store[] = [
  {
    id: 'store-1',
    code: 'DS001',
    name: '迪尚校园服旗舰店',
    address: '上海市徐汇区钦州路100号',
    phone: '021-12345678',
    manager: '张店长',
    hours: '09:00-21:00',
    status: '营业中',
    schools: ['上海市徐汇实验小学', '南京市第一中学'],
    printers: [
      { id: 'printer-1-1', name: '前台小票打印机', deviceType: 'network', paperWidth: 80, paperHeight: 0, ipAddress: '192.168.1.120', port: 9100 },
      { id: 'printer-1-2', name: '后场发票打印机', deviceType: 'gprinter', paperWidth: 80, paperHeight: 150, sn: 'GP-1200384' }
    ],
    qrCode: 'qr-code-placeholder-1',
    type: '正式版',
    warehouse: '迪尚徐汇一号仓'
  },
  {
    id: 'store-2',
    code: 'DS002',
    name: '迪尚校园服体验店',
    address: '上海市浦东新区世纪大道200号',
    phone: '021-87654321',
    manager: '李店长',
    hours: '10:00-22:00',
    status: '营业中',
    schools: ['杭州市外国语学校'],
    printers: [
      { id: 'printer-2-1', name: '仓库飞鹅打印机', deviceType: 'feie', paperWidth: 58, paperHeight: 0, sn: '920054321', key: 'feiekey888' },
      { id: 'printer-2-2', name: '前台热敏打印机', deviceType: 'usb', paperWidth: 80, paperHeight: 0 }
    ],
    qrCode: 'qr-code-placeholder-2',
    type: '体验版',
    warehouse: '浦东旗舰备货仓'
  },
  {
    id: 'store-3',
    code: 'DS003',
    name: '迪尚校园服开发区店',
    address: '上海市浦东新区张江高科技园区',
    phone: '021-11223344',
    manager: '王店长',
    hours: '09:00-18:00',
    status: '休息中',
    schools: ['上海市徐汇实验小学', '合肥市师范附属小学'],
    printers: [],
    qrCode: 'qr-code-placeholder-3',
    type: '开发版',
    warehouse: '张江临时备用仓'
  }
];

export const initialProducts: Product[] = [
  {
    id: 1,
    name: '夏季短袖校服套装',
    image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=150&auto=format&fit=crop&q=60',
    code: '1',
    schoolName: '上海市徐汇实验小学',
    price: 168.00,
    stock: 150,
    status: '上架'
  },
  {
    id: 2,
    name: '冬季加厚校服套装',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=150&auto=format&fit=crop&q=60',
    code: '2',
    schoolName: '南京市第一中学',
    price: 298.00,
    stock: 80,
    status: '上架'
  },
  {
    id: 3,
    name: '夏季短袖校服套装',
    image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=150&auto=format&fit=crop&q=60',
    code: '1',
    schoolName: '杭州市外国语学校',
    price: 168.00,
    stock: 100,
    status: '上架'
  },
  {
    id: 4,
    name: '运动校服套装',
    image: 'https://images.unsplash.com/photo-1519242220831-09410926fbff?w=150&auto=format&fit=crop&q=60',
    code: '3',
    schoolName: '合肥市师范附属小学',
    price: 198.00,
    stock: 60,
    status: '下架'
  }
];

export const initialAssociations: SchoolAssociation[] = [
  {
    id: 'assoc-1',
    associationId: 'SSR001',
    storeName: '迪尚校园服旗舰店',
    schoolName: '钦家国际小学',
    status: '启用'
  },
  {
    id: 'assoc-2',
    associationId: 'SSR002',
    storeName: '迪尚校园服旗舰店',
    schoolName: '钦家中学',
    status: '启用'
  },
  {
    id: 'assoc-3',
    associationId: 'SSR003',
    storeName: '迪尚校园服体验店',
    schoolName: '岳阳中学',
    status: '启用'
  },
  {
    id: 'assoc-4',
    associationId: 'SSR004',
    storeName: '迪尚校园服开发区店',
    schoolName: '钦家国际小学',
    status: '启用'
  },
  {
    id: 'assoc-5',
    associationId: 'SSR005',
    storeName: '迪尚校园服开发区店',
    schoolName: '南溪一中',
    status: '停用'
  }
];

export const initialQueueRecords: QueueRecord[] = [
  {
    id: 'queue-1',
    ticketNo: 'A001',
    type: '现货',
    storeName: '迪尚校园服旗舰店',
    status: '等待中',
    createdTime: '2024-03-15 09:30:00',
    phone: '13812345678'
  },
  {
    id: 'queue-2',
    ticketNo: 'A002',
    type: '现货',
    storeName: '迪尚校园服旗舰店',
    status: '叫号中',
    createdTime: '2024-03-15 09:35:00',
    phone: '13987654321'
  },
  {
    id: 'queue-3',
    ticketNo: 'A003',
    type: '现货',
    storeName: '迪尚校园服旗舰店',
    status: '已完成',
    createdTime: '2024-03-15 09:20:00',
    phone: '13511223344'
  },
  {
    id: 'queue-4',
    ticketNo: 'B001',
    type: '现货',
    storeName: '迪尚校园服体验店',
    status: '等待中',
    createdTime: '2024-03-15 10:00:00',
    phone: '18888889999'
  }
];

export const initialSettings: QueueSettings = {
  enabled: true,
  prefix: 'A',
  startNo: 1,
  reminders: {
    voice: true,
    sms: false,
    requeue: true
  }
};

export const initialOutOfStockRecords: OutOfStockRecord[] = [
  {
    id: 'oos-1',
    customerName: '李美华',
    customerPhone: '13812345678',
    productId: 1,
    productName: '夏季短袖校服套装',
    productCode: '1',
    schoolName: '上海市徐汇实验小学',
    size: '140码',
    quantity: 1,
    registeredTime: '2026-07-15 14:32:00',
    status: '登记中',
    notificationSentCount: 0,
    notificationLogs: [],
    remarks: '家长说孩子长得快，如果到货了请尽快电话或短信通知'
  },
  {
    id: 'oos-2',
    customerName: '张建国',
    customerPhone: '13987654321',
    productId: 2,
    productName: '冬季加厚校服套装',
    productCode: '2',
    schoolName: '南京市第一中学',
    size: '160码',
    quantity: 2,
    registeredTime: '2026-07-14 10:15:00',
    status: '已到货',
    notificationSentCount: 1,
    notificationLogs: [
      {
        time: '2026-07-16 11:00:00',
        content: '【迪尚校服】尊敬的张建国家长，您登记的 2件 南京市第一中学 冬季加厚校服套装 (160码) 已到货。请凭此短信前往门店领取。',
        type: 'SMS'
      }
    ],
    remarks: '急用'
  }
];

