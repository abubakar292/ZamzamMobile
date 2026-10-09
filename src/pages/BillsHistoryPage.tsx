import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { FileText, Bluetooth, Printer } from 'lucide-react';
import { format, isToday, isThisWeek, isThisMonth, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { parseDateSafe, formatDateSafe } from '../utils/dateUtils';
import { printBillHtml } from '../utils/printBill';
import { BluetoothPrinterModal } from '../components/ui/BluetoothPrinterModal';

export default function BillsHistoryPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('All');
  const [selectedBluetoothBill, setSelectedBluetoothBill] = useState<any>(null);

  const [customStart, setCustomStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    const q = query(collection(db, 'bills'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setBills(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filteredBills = bills.filter(b => {
    const term = search.toLowerCase();
    const matchesSearch = (
      b.customerName?.toLowerCase().includes(term) ||
      b.billNumber?.toLowerCase().includes(term) ||
      b.id.toLowerCase().includes(term)
    );

    // Date filter
    let matchesDate = true;
    let billDate = parseDateSafe(b.date || b.createdAt) || new Date();

    if (dateFilter === 'Today') {
      matchesDate = isToday(billDate);
    } else if (dateFilter === 'This Week') {
      matchesDate = isThisWeek(billDate);
    } else if (dateFilter === 'This Month') {
      matchesDate = isThisMonth(billDate);
    } else if (dateFilter === 'Custom Range') {
      matchesDate = isWithinInterval(billDate, {
        start: startOfDay(new Date(customStart)),
        end: endOfDay(new Date(customEnd))
      });
    }

    return matchesSearch && matchesDate;
  });

  const handlePrint = (bill: any) => {
    printBillHtml(bill);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bills History</h1>
          <p className="text-sm text-slate-500 mt-1">View and reprint generated sales receipts</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by Bill # or Customer Name..." />
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
        </div>

        {dateFilter === 'Custom Range' && (
          <div className="flex gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
              <input 
                type="date" 
                value={customStart} 
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
              <input 
                type="date" 
                value={customEnd} 
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
              />
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3">Bill #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">Loading bills...</td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No bills found</td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-primary-600">{b.billNumber || b.id.substring(0,8).toUpperCase()}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDateSafe(b.date || b.createdAt, 'dd MMM yyyy, hh:mm a')}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{b.customerName || 'Walk-in'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{b.items?.length || 0} Items</Badge>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      Rs. {(b.totalSellPrice || b.totalSellAmount || b.sellPrice || (b.items?.reduce((s: number, it: any) => s + (Number(it.sellPrice) || 0), 0)) || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={b.paymentMethod === 'Cash' ? 'success' : 'cyan'}>
                        {b.paymentMethod}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedBluetoothBill(b)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors inline-flex items-center gap-1.5 border border-emerald-200 shadow-xs cursor-pointer"
                          title="Print to Bluetooth Mini Thermal Printer"
                        >
                          <Bluetooth className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Bluetooth</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrint(b)}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          title="Print via WiFi / Browser"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>WiFi</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
