import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { Wallet, ArrowUpRight, ArrowDownLeft, Copy, ExternalLink, RefreshCw, MoreHorizontal } from 'lucide-react';

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
  color: string;
}

const mockTokens: Token[] = [
  { symbol: 'LUX', name: 'Lux', balance: '1,245.50', value: '$12,455.00', change: '+5.2%', positive: true, color: 'from-violet-500 to-purple-600' },
  { symbol: 'ETH', name: 'Ethereum', balance: '2.5', value: '$8,750.00', change: '+2.8%', positive: true, color: 'from-blue-400 to-indigo-500' },
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.15', value: '$15,750.00', change: '-1.2%', positive: false, color: 'from-amber-400 to-orange-500' },
  { symbol: 'USDC', name: 'USD Coin', balance: '5,000.00', value: '$5,000.00', change: '0.0%', positive: true, color: 'from-emerald-400 to-teal-500' },
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
      <div className="flex flex-col h-full bg-black/80 backdrop-blur-2xl">
        {/* Header - Glass Card */}
        <div className="m-4 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Wallet Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full blur-xl opacity-50" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center border border-white/20 shadow-lg">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-white/60 text-sm font-mono">{shortAddress}</span>
            <button className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 group">
              <Copy className="w-3.5 h-3.5 text-white/40 group-hover:text-white/80" />
            </button>
          </div>

          {/* Balance */}
          <h2 className="text-white text-4xl font-bold text-center tracking-tight">$41,955.00</h2>
          <p className="text-emerald-400 text-sm mt-2 text-center font-medium">+$1,234.56 (3.02%)</p>
        </div>

        {/* Action Buttons - Glass Style */}
        <div className="flex justify-center gap-3 px-4 pb-4">
          <button className="flex flex-col items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/80 text-xs font-medium">Send</span>
          </button>
          <button className="flex flex-col items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <ArrowDownLeft className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/80 text-xs font-medium">Receive</span>
          </button>
          <button className="flex flex-col items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-violet-500/50 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/80 text-xs font-medium">Swap</span>
          </button>
        </div>

        {/* Tabs - Minimal Glass */}
        <div className="flex mx-4 p-1 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('tokens')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === 'tokens'
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            Tokens
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === 'activity'
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Content - Token/Activity List */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {activeTab === 'tokens' ? (
            <div className="space-y-2">
              {mockTokens.map((token) => (
                <div
                  key={token.symbol}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                >
                  {/* Token Icon */}
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${token.color} rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity`} />
                    <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${token.color} flex items-center justify-center text-white font-bold text-sm border border-white/20`}>
                      {token.symbol[0]}
                    </div>
                  </div>

                  {/* Token Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{token.name}</p>
                    <p className="text-white/40 text-sm font-mono">{token.balance} {token.symbol}</p>
                  </div>

                  {/* Value */}
                  <div className="text-right">
                    <p className="text-white font-medium">{token.value}</p>
                    <p className={`text-sm font-medium ${token.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {token.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {mockTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                >
                  {/* Transaction Icon */}
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity ${
                      tx.type === 'receive' ? 'bg-emerald-500' : 'bg-cyan-500'
                    }`} />
                    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center border border-white/20 ${
                      tx.type === 'receive' ? 'bg-emerald-500/20' : 'bg-cyan-500/20'
                    }`}>
                      {tx.type === 'receive' ? (
                        <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>
                  </div>

                  {/* Transaction Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium capitalize">{tx.type}</p>
                    <p className="text-white/40 text-sm font-mono">{tx.address}</p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={`font-medium font-mono ${tx.type === 'receive' ? 'text-emerald-400' : 'text-white'}`}>
                      {tx.amount} {tx.token}
                    </p>
                    <p className="text-white/30 text-sm">{tx.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Glass Style */}
        <div className="p-4 border-t border-white/5">
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
            <ExternalLink className="w-4 h-4 text-white/50 group-hover:text-cyan-400 transition-colors" />
            <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">View on Explorer</span>
          </button>
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Lux Wallet app manifest
 */
export const LuxManifest = {
  identifier: 'ai.hanzo.lux',
  name: 'Lux Wallet',
  version: '1.0.0',
  description: 'Cryptocurrency wallet for zOS',
  category: 'web3' as const,
  permissions: ['network', 'storage'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 400, height: 600 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Lux Wallet menu bar configuration
 */
export const LuxMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newWallet', label: 'New Wallet...', shortcut: '⌘N' },
        { type: 'item' as const, id: 'importWallet', label: 'Import Wallet...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'exportPrivateKey', label: 'Export Private Key...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'copy', label: 'Copy Address', shortcut: '⌘C' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'preferences', label: 'Preferences...' },
      ],
    },
    {
      id: 'transactions',
      label: 'Transactions',
      items: [
        { type: 'item' as const, id: 'send', label: 'Send...', shortcut: '⌘S' },
        { type: 'item' as const, id: 'receive', label: 'Receive', shortcut: '⌘R' },
        { type: 'item' as const, id: 'swap', label: 'Swap...' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'history', label: 'Transaction History' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'luxHelp', label: 'Lux Wallet Help' },
        { type: 'item' as const, id: 'explorer', label: 'Open Block Explorer' },
      ],
    },
  ],
};

/**
 * Lux Wallet dock configuration
 */
export const LuxDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'send', label: 'Send' },
    { type: 'item' as const, id: 'receive', label: 'Receive' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Lux Wallet App definition for registry
 */
export const LuxApp = {
  manifest: LuxManifest,
  component: LuxWindow,
  icon: Wallet,
  menuBar: LuxMenuBar,
  dockConfig: LuxDockConfig,
};

export default LuxWindow;
