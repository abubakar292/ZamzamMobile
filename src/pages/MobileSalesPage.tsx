import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { useToast } from '../contexts/ToastContext';
import { FileText, Undo2, AlertCircle, Bluetooth, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isThisWeek, isThisMonth, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { parseDateSafe, formatDateSafe } from '../utils/dateUtils';
import { printBillHtml } from '../utils/printBill';
import { BluetoothPrinterModal } from '../components/ui/BluetoothPrinterModal';

export default function MobileSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('All');
  const [selectedBluetoothBill, setSelectedBluetoothBill] = useState<any>(null);
  
  const [customStart, setCustomStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { success, error } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredSales = sales.filter(s => {
    // Text search
    const term = search.toLowerCase();
    const matchesSearch = (
      s.customerName?.toLowerCase().includes(term) ||
      s.itemName?.toLowerCase().includes(term) ||
      s.imei1?.includes(term) ||
      s.imei2?.includes(term)
    );

    // Date filter
    let matchesDate = true;
    let saleDate = parseDateSafe(s.date || s.createdAt) || new Date();
    
    if (dateFilter === 'Today') {
      matchesDate = isToday(saleDate);
    } else if (dateFilter === 'This Week') {
      matchesDate = isThisWeek(saleDate);
    } else if (dateFilter === 'This Month') {
      matchesDate = isThisMonth(saleDate);
    } else if (dateFilter === 'Custom Range') {
      matchesDate = isWithinInterval(saleDate, {
        start: startOfDay(new Date(customStart)),
        end: endOfDay(new Date(customEnd))
      });
    }

    return matchesSearch && matchesDate;
  });

  const totalSales = filteredSales.reduce((acc, s) => acc + (s.status !== 'returned' ? s.sellPrice || 0 : 0), 0);
  const totalProfit = filteredSales.reduce((acc, s) => acc + (s.status !== 'returned' ? s.profit || 0 : 0), 0);
  const activeSalesCount = filteredSales.filter(s => s.status !== 'returned').length;

  const [saleToReturn, setSaleToReturn] = useState<any | null>(null);

  const handleReturn = async () => {
    if (saleToReturn) {
      try {
        const batch = writeBatch(db);
        
        // Update sale status
        const saleRef = doc(db, 'sales', saleToReturn.id);
        batch.update(saleRef, { status: 'returned' });
        
        // If it's a mobile from inventory, restore quantity
        if (saleToReturn.itemType === 'mobile' && saleToReturn.itemId) {
          const mobileRef = doc(db, 'mobiles', saleToReturn.itemId);
          const { increment } = await import('firebase/firestore');
          batch.update(mobileRef, { quantity: increment(1) });
        }
        
        await batch.commit();
        success('Sale returned successfully');
      } catch (err: any) {
        error(err.message || 'Error returning sale');
      } finally {
        setSaleToReturn(null);
      }
    }
  };

  const constructBillData = (sale: any) => ({
    id: sale.billId || sale.id,
    billNumber: sale.billId ? undefined : sale.id.substring(0,8).toUpperCase(),
    customerName: sale.customerName,
    customerPhone: sale.customerPhone,
    itemName: sale.itemName,
    company: sale.company,
    imei1: sale.imei1,
    imei2: sale.imei2,
    sellPrice: sale.sellPrice,
    paymentMethod: sale.paymentMethod,
    date: sale.date || sale.createdAt
  });

  const handleViewBill = (sale: any) => {
    printBillHtml(constructBillData(sale));
  };

  const handleBluetoothPrint = (sale: any) => {
    setSelectedBluetoothBill(constructBillData(sale));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mobile Sales Record</h1>
          <p className="text-sm text-slate-500 mt-1">History of all sold mobiles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-white shadow-glow-sm">
          <p className="text-primary-100 text-sm font-medium">Total Sales</p>
          <p className="text-2xl font-bold mt-1">Rs. {totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-accent-emerald to-green-500 rounded-xl p-4 text-white shadow-card">
          <p className="text-green-100 text-sm font-medium">Total Profit</p>
          <p className="text-2xl font-bold mt-1">Rs. {totalProfit.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Sales Count</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{activeSalesCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <SearchBar value={search} onChange={setSearch} placeholder="Search customer, model, IMEI..." />
          <Select 
            className="md:max-w-[200px]"
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Time' },
              { value: 'Today', label: 'Today' },
              { value: 'This Week', label: 'This Week' },
              { value: 'This Month', label: 'This Month' },
              { value: 'Custom Range', label: 'Custom Range' },
            ]}
          />
          {dateFilter === 'Custom Range' && (
            <div className="flex items-center gap-2">
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="rounded-xl border border-primary-500/20 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2" />
              <span className="text-slate-400">to</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="rounded-xl border border-primary-500/20 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2" />
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-xl">Date/Time</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">IMEI 1</th>
                <th className="px-4 py-3 font-semibold">Base / Sell</th>
                <th className="px-4 py-3 font-semibold">Profit</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold rounded-tr-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
              ) : filteredSales.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No sales records found.</td></tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className={`hover:bg-slate-50/50 transition-colors ${s.status === 'returned' ? 'opacity-50 bg-slate-50' : ''}`}>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDateSafe(s.date || s.createdAt, 'dd MMM yyyy, hh:mm a')}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{s.customerName || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{s.itemName}</span>
                      {s.itemType === 'quick_sale' && <Badge variant="warning" className="ml-2 scale-75">Quick Sale</Badge>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.imei1 || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-400 line-through">Rs. {s.basePrice?.toLocaleString()}</div>
                      <div className="font-medium">Rs. {s.sellPrice?.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${s.profit >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                        {s.profit >= 0 ? '+' : ''}Rs. {s.profit?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.paymentMethod === 'Cash' ? 'success' : s.paymentMethod === 'Udhar' ? 'warning' : 'cyan'}>
                        {s.paymentMethod}
                      </Badge>
                      {s.status === 'returned' && (
                        <Badge variant="danger" className="ml-2">Returned</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleBluetoothPrint(s)} 
                          title="Print via Bluetooth Mini Printer" 
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                        >
                          <Bluetooth className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleViewBill(s)} 
                          title="Print via WiFi / Browser" 
                          className="p-1.5 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {s.status !== 'returned' && (
                          <button 
                            onClick={() => setSaleToReturn(s)} 
                            title="Return" 
                            className="p-1.5 text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                          >
                            <Undo2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Confirmation Modal */}
      <AnimatePresence>
        {saleToReturn && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSaleToReturn(null)}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-full sm:max-w-sm bg-white sm:rounded-2xl shadow-2xl flex flex-col p-6 text-center"
            >
              <div className="w-12 h-12 bg-accent-rose/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-accent-rose" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Return Sale</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to return this sale? Quantity will be restored and profit reversed.</p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setSaleToReturn(null)}>Cancel</Button>
                <Button variant="danger" className="flex-1" onClick={handleReturn}>Confirm Return</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bluetooth Printer Modal */}
      {selectedBluetoothBill && (
        <BluetoothPrinterModal
          isOpen={Boolean(selectedBluetoothBill)}
          onClose={() => setSelectedBluetoothBill(null)}
          billData={selectedBluetoothBill}
        />
      )}
    </div>
  );
}
