import React, { useState } from 'react';
import { ZWindow, useTheme } from '@z-os/ui';
import { Wallet, ArrowUpRight, ArrowDownLeft, Copy, ExternalLink, RefreshCw } from 'lucide-react';

interface LuxWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Token {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  change: string;
  positive: boolean;
}

const mockTokens: Token[] = [
  { symbol: 'LUX', name: 'Lux', balance: '1,245.50', value: '$12,455.00', change: '+5.2%', positive: true },
  { symbol: 'ETH', name: 'Ethereum', balance: '2.5', value: '$8,750.00', change: '+2.8%', positive: true },
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.15', value: '$15,750.00', change: '-1.2%', positive: false },
  { symbol: 'USDC', name: 'USD Coin', balance: '5,000.00', value: '$5,000.00', change: '0.0%', positive: true },
];

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  token: string;
  amount: string;
  address: string;
  time: string;
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'receive', token: 'LUX', amount: '+500.00', address: '0x1234...5678', time: '2 hours ago' },
  { id: '2', type: 'send', token: 'ETH', amount: '-0.5', address: '0xabcd...efgh', time: '1 day ago' },
  { id: '3', type: 'receive', token: 'USDC', amount: '+1,000.00', address: '0x9876...5432', time: '3 days ago' },
];

const LuxWindow: React.FC<LuxWindowProps> = ({ onClose, onFocus }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'tokens' | 'activity'>('tokens');

  const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  return (
    <ZWindow
      title="Lux Wallet"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 200, y: 100 }}
      initialSize={{ width: 400, height: 600 }}
      windowType="system"
    >
      <div className="flex flex-col h-full zos-bg-primary">
        {/* Header */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="zos-text-secondary text-sm">{shortAddress}</span>
            <button className="p-1 hover:bg-[var(--zos-surface-glass-hover)] rounded transition-colors">
              <Copy className="w-3 h-3 zos-text-muted" />
            </button>
          </div>
          <h2 className="zos-text-primary text-3xl font-bold">$41,955.00</h2>
          <p className="zos-text-green text-sm mt-1">+$1,234.56 (3.02%)</p>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 px-6 pb-6">
          <button className="flex flex-col items-center gap-1 px-6 py-3 bg-[var(--zos-accent-primary)] hover:opacity-90 rounded-xl transition-opacity">
            <ArrowUpRight className="w-5 h-5 text-white" />
            <span className="text-white text-sm">Send</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-6 py-3 bg-[var(--zos-system-green)] hover:opacity-90 rounded-xl transition-opacity">
            <ArrowDownLeft className="w-5 h-5 text-white" />
            <span className="text-white text-sm">Receive</span>
          </button>
          <button className="flex flex-col items-center gap-1 px-6 py-3 bg-[var(--zos-system-purple)] hover:opacity-90 rounded-xl transition-opacity">
            <RefreshCw className="w-5 h-5 text-white" />
            <span className="text-white text-sm">Swap</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b zos-border">
          <button
            onClick={() => setActiveTab('tokens')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'tokens' ? 'zos-text-primary border-b-2 border-[var(--zos-accent-primary)]' : 'zos-text-muted hover:zos-text-secondary'
            }`}
          >
            Tokens
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'activity' ? 'zos-text-primary border-b-2 border-[var(--zos-accent-primary)]' : 'zos-text-muted hover:zos-text-secondary'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'tokens' ? (
            <div className="p-4 space-y-2">
              {mockTokens.map((token) => (
                <div
                  key={token.symbol}
                  className="flex items-center gap-3 p-3 rounded-xl zos-surface-glass hover:bg-[var(--zos-surface-glass-hover)] transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {token.symbol[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="zos-text-primary font-medium">{token.name}</p>
                    <p className="zos-text-muted text-sm">{token.balance} {token.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="zos-text-primary font-medium">{token.value}</p>
                    <p className={`text-sm ${token.positive ? 'zos-text-green' : 'zos-text-red'}`}>
                      {token.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {mockTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-3 rounded-xl zos-surface-glass hover:bg-[var(--zos-surface-glass-hover)] transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'receive' ? 'bg-[var(--zos-system-green)]/20' : 'bg-[var(--zos-accent-primary)]/20'
                  }`}>
                    {tx.type === 'receive' ? (
                      <ArrowDownLeft className="w-5 h-5 zos-text-green" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-[var(--zos-accent-primary)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="zos-text-primary font-medium capitalize">{tx.type}</p>
                    <p className="zos-text-muted text-sm">{tx.address}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === 'receive' ? 'zos-text-green' : 'zos-text-primary'}`}>
                      {tx.amount} {tx.token}
                    </p>
                    <p className="zos-text-muted text-sm">{tx.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t zos-border">
          <button className="w-full flex items-center justify-center gap-2 py-2 text-[var(--zos-accent-primary)] hover:opacity-80 transition-opacity">
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">View on Explorer</span>
          </button>
        </div>
      </div>
    </ZWindow>
  );
};

export default LuxWindow;
