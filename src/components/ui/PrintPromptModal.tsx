import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Printer, Bluetooth, Share2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { printBillHtml } from '../../utils/printBill';
import { BluetoothPrinterModal } from './BluetoothPrinterModal';

interface PrintPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  billData: any;
  profit: number;
}

export function PrintPromptModal({ isOpen, onClose, billData, profit }: PrintPromptModalProps) {
  const [showBluetoothModal, setShowBluetoothModal] = useState(false);

  const handleStandardPrint = () => {
    if (billData) {
      printBillHtml(billData);
    }
    onClose();
  };

  const handleOpenBluetooth = () => {
    setShowBluetoothModal(true);
  };

  const handleCloseAll = () => {
    setShowBluetoothModal(false);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen && !showBluetoothModal} onClose={onClose} title="Success" size="sm">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100"
          >
            <Check className="w-8 h-8 text-emerald-600" />
          </motion.div>

          <h3 className="font-bold text-lg mb-1 text-slate-800">Sale Completed! 🎉</h3>
          <p className="text-slate-500 text-sm mb-4">
            Profit: <span className="text-emerald-600 font-bold">Rs. {profit.toLocaleString()}</span>
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 mt-4">
            {/* Primary: Bluetooth Mini Printer */}
            <button
              type="button"
              onClick={handleOpenBluetooth}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Bluetooth className="w-4 h-4 text-emerald-200" />
              <span>Print Bluetooth Mini Printer</span>
            </button>

            {/* Secondary: Standard / WiFi Print */}
            <button
              type="button"
              onClick={handleStandardPrint}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>WiFi / Browser Print (A4)</span>
            </button>

            {/* Skip */}
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 pt-1 transition-colors cursor-pointer"
            >
              Skip Printing
            </button>
          </div>
        </div>
      </Modal>

      {/* Bluetooth Printer Modal */}
      {showBluetoothModal && (
        <BluetoothPrinterModal
          isOpen={showBluetoothModal}
          onClose={handleCloseAll}
          billData={billData}
        />
      )}
    </>
  );
}

export default PrintPromptModal;
