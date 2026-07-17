import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar, { MenuKey } from './components/Sidebar';
import ProductListTab from './components/ProductListTab';
import StoreListTab from './components/StoreListTab';
import QueueListTab from './components/QueueListTab';
import QueueSettingsTab from './components/QueueSettingsTab';
import OutOfStockTab from './components/OutOfStockTab';

import { Store, Product, SchoolAssociation, QueueRecord, QueueSettings, OutOfStockRecord } from './types';
import {
  initialStores,
  initialProducts,
  initialAssociations,
  initialQueueRecords,
  initialSettings,
  initialOutOfStockRecords
} from './data';

import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation Menu Key
  const [activeMenu, setActiveMenu] = useState<MenuKey>(() => {
    const saved = localStorage.getItem('queue_active_menu');
    if (saved === 'store-school') return 'store-list';
    return (saved as MenuKey) || 'queue-list';
  });

  // Master States synced with localStorage
  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem('queue_stores_data');
    const parsed: Store[] = saved ? JSON.parse(saved) : initialStores;
    // Safety migration: convert any string printers to PrinterConfig objects and ensure deviceType exists
    return parsed.map((store) => {
      let changed = false;
      const updatedPrinters = (store.printers || []).map((p: any, idx: number) => {
        if (typeof p === 'string') {
          changed = true;
          return {
            id: `printer-migrated-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
            name: p,
            deviceType: 'custom',
            paperWidth: 80,
            paperHeight: 0
          };
        }
        if (p && !p.deviceType) {
          changed = true;
          return {
            ...p,
            deviceType: 'custom'
          };
        }
        return p;
      });
      if (changed) {
        return {
          ...store,
          printers: updatedPrinters
        };
      }
      return store;
    });
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('queue_products_data');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [associations, setAssociations] = useState<SchoolAssociation[]>(() => {
    const saved = localStorage.getItem('queue_associations_data');
    return saved ? JSON.parse(saved) : initialAssociations;
  });

  const [queueRecords, setQueueRecords] = useState<QueueRecord[]>(() => {
    const saved = localStorage.getItem('queue_records_data');
    return saved ? JSON.parse(saved) : initialQueueRecords;
  });

  const [settings, setSettings] = useState<QueueSettings>(() => {
    const saved = localStorage.getItem('queue_settings_data');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [outOfStockRecords, setOutOfStockRecords] = useState<OutOfStockRecord[]>(() => {
    const saved = localStorage.getItem('queue_out_of_stock_records');
    return saved ? JSON.parse(saved) : initialOutOfStockRecords;
  });

  const [preselectedProductId, setPreselectedProductId] = useState<number | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('queue_active_menu', activeMenu);
  }, [activeMenu]);

  useEffect(() => {
    localStorage.setItem('queue_stores_data', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('queue_products_data', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('queue_associations_data', JSON.stringify(associations));
  }, [associations]);

  useEffect(() => {
    localStorage.setItem('queue_records_data', JSON.stringify(queueRecords));
  }, [queueRecords]);

  useEffect(() => {
    localStorage.setItem('queue_settings_data', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('queue_out_of_stock_records', JSON.stringify(outOfStockRecords));
  }, [outOfStockRecords]);

  // Render the current view/tab
  const renderView = () => {
    switch (activeMenu) {
      case 'offline-products':
        return (
          <ProductListTab
            products={products}
            setProducts={setProducts}
            stores={stores}
            onRegisterOutOfStock={(productId) => {
              setPreselectedProductId(productId);
              setActiveMenu('out-of-stock');
            }}
          />
        );
      case 'out-of-stock':
        return (
          <OutOfStockTab
            records={outOfStockRecords}
            setRecords={setOutOfStockRecords}
            products={products}
            setProducts={setProducts}
            stores={stores}
            preselectedProductId={preselectedProductId}
            clearPreselectedProductId={() => setPreselectedProductId(null)}
          />
        );
      case 'store-list':
        return (
          <StoreListTab
            stores={stores}
            setStores={setStores}
          />
        );
      case 'queue-list':
        return (
          <QueueListTab
            records={queueRecords}
            setRecords={setQueueRecords}
            stores={stores}
            settings={settings}
          />
        );
      case 'queue-settings':
        return (
          <QueueSettingsTab
            settings={settings}
            setSettings={setSettings}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-96 text-gray-400">
            暂无对应的功能界面
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50/50 text-gray-800 font-sans overflow-hidden antialiased">
      {/* Global Top Navbar */}
      <Header />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

        {/* Content View with Page transitions */}
        <main className="flex-1 overflow-y-auto bg-[#fafbfc] p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
