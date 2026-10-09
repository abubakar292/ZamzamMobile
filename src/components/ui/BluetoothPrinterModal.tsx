import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bluetooth,
  Printer,
  X,
  Check,
  AlertCircle,
  Copy,
  Share2,
  ExternalLink,
  Smartphone,
  Zap,
  FileText,
} from 'lucide-react';
import {
  isBluetoothSupported,
  isIosDevice,
  connectBluetoothPrinter,
  generateEscPosReceipt,
  printToBluetoothDevice,
  generatePlainTextReceipt,
  getRawBtDeepLink,
} from '../../utils/bluetoothPrinter';
import { printBillHtml } from '../../utils/printBill';
import { useToast } from '../../contexts/ToastContext';
import { SHOP_CONFIG } from '../../config/shopConfig';

interface BluetoothPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  billData: any;
}

export function BluetoothPrinterModal({
  isOpen,
  onClose,
  billData,
}: BluetoothPrinterModalProps) {
  const { success, error: toastError } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !billData) return null;

  const hasWebBluetooth = isBluetoothSupported();
  const isIos = isIosDevice();
  const plainReceipt = generatePlainTextReceipt(billData, SHOP_CONFIG.name);

  // 1-Click Direct Web Bluetooth Print
  const handleDirectBluetoothPrint = async () => {
    try {
      setIsPrinting(true);
      setPrintStatus('Opening Bluetooth scanner... Please select your mini printer.');

      const deviceObj = await connectBluetoothPrinter();

      setPrintStatus(`Connected to ${deviceObj.device.name || 'Printer'}! Generating ESC/POS receipt...`);

      const receiptBytes = generateEscPosReceipt(billData, SHOP_CONFIG.name);

      setPrintStatus('Sending receipt to mini printer...');
      await printToBluetoothDevice(deviceObj, receiptBytes);

      setPrintStatus('Receipt printed successfully! 🎉');
      success(`Receipt sent to ${deviceObj.device.name || 'Bluetooth Printer'}!`);
      setTimeout(() => {
        setIsPrinting(false);
        setPrintStatus('');
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Bluetooth printing error:', err);
      setIsPrinting(false);
      setPrintStatus('');
      if (err.name === 'NotFoundError') {
        // User cancelled picker
        return;
      }
      toastError(err.message || 'Bluetooth printing failed.');
    }
  };

  // Copy plain thermal receipt text
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(plainReceipt);
      setCopied(true);
      success('Thermal receipt text copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toastError('Could not copy to clipboard.');
    }
  };

  // Share receipt text to installed Bluetooth printer apps or WhatsApp
  const handleShareReceipt = async () => {
    const billNum = billData.billNumber || billData.id || 'Receipt';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bill #${billNum} - ${SHOP_CONFIG.name}`,
          text: plainReceipt,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyText();
        }
      }
    } else {
      handleCopyText();
    }
  };

  // 1-Tap RawBT Print (Popular Bluetooth thermal print app on Android)
  const handleRawBtPrint = () => {
    const url = getRawBtDeepLink(billData);
    window.location.href = url;
  };

  // Standard WiFi / Browser Print fallback
  const handleBrowserPrint = () => {
    printBillHtml(billData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] border border-slate-200"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <Bluetooth className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-wide flex items-center gap-2">
                  Bluetooth Mini Printer
                  <span className="text-[10px] bg-emerald-500/40 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    58mm / 80mm
                  </span>
                </h3>
                <p className="text-xs text-emerald-100/80">
                  {SHOP_CONFIG.name} — Bill #{billData.billNumber || billData.id?.slice(0, 8)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isPrinting}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-4 text-slate-800">
            {/* Status indicator during Bluetooth print */}
            {isPrinting && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-pulse">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <p className="text-xs font-semibold text-emerald-800">{printStatus}</p>
              </div>
            )}

            {/* Direct Web Bluetooth Action Card */}
            <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  Method 1: Direct Web Bluetooth (Recommended)
                </span>
                {hasWebBluetooth ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    Supported
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                    {isIos ? 'Use Bluefy App on iPhone' : 'Web BLE Disabled'}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Wirelessly sends ESC/POS binary codes directly to your mini Bluetooth receipt printer. Works instantly on Chrome (Android, Windows, Mac, Linux).
              </p>

              <button
                onClick={handleDirectBluetoothPrint}
                disabled={isPrinting}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Bluetooth className="w-4 h-4" />
                {isPrinting ? 'Connecting & Printing...' : 'Connect & Print via Bluetooth'}
              </button>
            </div>

            {/* Android RawBT App & Share Options */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-slate-600" />
                Method 2: Android App or Share
              </span>

              <p className="text-xs text-slate-600">
                If your phone is already paired with RawBT or another thermal printer app, click below to print in 1-tap:
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleRawBtPrint}
                  className="py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  Print via RawBT App
                </button>

                <button
                  type="button"
                  onClick={handleShareReceipt}
                  className="py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  Share / WhatsApp
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied to Clipboard!' : 'Copy 58mm Thermal Text'}
                </button>

                <button
                  type="button"
                  onClick={handleBrowserPrint}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  Standard / WiFi Print
                </button>
              </div>
            </div>

            {/* Thermal Receipt Preview Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  58mm Receipt Preview
                </span>
                <span>Width: 32 Chars</span>
              </div>
              <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 font-mono text-[11px] leading-tight text-slate-800 whitespace-pre overflow-x-auto max-h-48 shadow-inner">
                {plainReceipt}
              </div>
            </div>

            {/* Quick Setup Notes */}
            <div className="text-[11px] text-slate-500 bg-slate-100/70 p-2.5 rounded-xl space-y-1">
              <p className="font-semibold text-slate-700 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-slate-500" />
                Tips for Mini Bluetooth Printers:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                <li>Make sure Bluetooth is turned <strong>ON</strong> on your mobile/PC.</li>
                <li>Ensure the mini printer has paper and the blue indicator is blinking or on.</li>
                <li>When prompted by Chrome, select your printer name (e.g. MPT-II, POS-58, Bluetooth Printer).</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              disabled={isPrinting}
              className="py-2 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDirectBluetoothPrint}
              disabled={isPrinting}
              className="py-2 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Bluetooth className="w-3.5 h-3.5" />
              Print Bluetooth
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default BluetoothPrinterModal;
