import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingCart, Smartphone, TrendingUp, Zap, Receipt, 
  CreditCard, BookOpen, Package, Settings
} from 'lucide-react';

const sections = [
  {
    title: null,
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    title: 'Inventory',
    items: [
      { path: '/purchase-mobile', icon: ShoppingCart, label: 'Purchase Mobile' },
      { path: '/mobiles-stock', icon: Smartphone, label: 'Mobiles in Stock' },
    ]
  },
  {
    title: 'Sales',
    items: [
      { path: '/mobile-sales', icon: TrendingUp, label: 'Mobile Sales Record' },
      { path: '/quick-sale', icon: Zap, label: 'Quick Sale' },
      { path: '/bills-history', icon: Receipt, label: 'Bills History' },
    ]
  },
  {
    title: 'Finance',
    items: [
      { path: '/expenses', icon: CreditCard, label: 'Expenses' },
      { path: '/khata', icon: BookOpen, label: 'Khata / Ledger' },
    ]
  },
  {
    title: 'Reports',
    items: [
      { path: '/inventory-valuation', icon: Package, label: 'Inventory Valuation' },
    ]
  },
  {
    title: null,
    items: [
      { path: '/settings', icon: Settings, label: 'Settings' },
    ]
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="h-full bg-forest text-white flex flex-col overflow-hidden">
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center shadow-glow-green">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">ZAMZAM</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="px-4 space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-white/45 uppercase">
                  {section.title}
                </div>
              )}
              
              {section.items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group
                      ${isActive 
                        ? 'bg-white text-forest' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-2 bottom-2 w-1 bg-accent-emerald rounded-r-full shadow-glow-green"
                      />
                    )}
                    <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-forest' : 'text-white/80 group-hover:text-white'}`} />
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
