import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, RefreshCw, Send } from 'lucide-react';

interface Transaction {
  id: string;
  targetStartup: string;
  amount: string;
  date: string;
  type: 'investment' | 'deposit';
  status: 'completed' | 'in_escrow';
}

export const WalletLedger: React.FC = () => {
  const [balance, setBalance] = useState<number>(250000); // Start with a default $250k investment fund
  const [escrowAmount, setEscrowAmount] = useState<number>(50000);
  const [targetStartup, setTargetStartup] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-101',
      targetStartup: 'EcoSphere Energy Solutions',
      amount: '$50,000',
      date: 'June 02, 2026',
      type: 'investment',
      status: 'in_escrow',
    },
    {
      id: 'tx-102',
      targetStartup: 'Wallet Deposit (Capital Call)',
      amount: '$300,000',
      date: 'May 15, 2026',
      type: 'deposit',
      status: 'completed',
    },
  ]);

  const handleSimulateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);

    if (!targetStartup.trim() || isNaN(amountNum) || amountNum <= 0) return;
    if (amountNum > balance) {
      alert("Insufficient liquidity available in active wallet balance.");
      return;
    }

    setIsProcessing(true);

    // Simulate standard block timeline latency
    setTimeout(() => {
      setBalance(prev => prev - amountNum);
      setEscrowAmount(prev => prev + amountNum);
      
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        targetStartup: targetStartup,
        amount: `$${amountNum.toLocaleString()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        type: 'investment',
        status: 'in_escrow',
      };

      setTransactions([newTx, ...transactions]);
      setTransferAmount('');
      setTargetStartup('');
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Balance Summaries Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 translate-x-4 translate-y-4">
              <Wallet size={160} />
            </div>
            <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Available Capital Pool</p>
            <h2 className="text-3xl font-bold mt-2">${balance.toLocaleString()}</h2>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 w-fit px-2.5 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck size={14} /> Liquid SAF SAFE Reserves Active
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Committed Funds In Escrow</p>
              <h2 className="text-3xl font-bold text-gray-800 mt-2">${escrowAmount.toLocaleString()}</h2>
            </div>
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
              <RefreshCw size={12} className="animate-spin text-amber-500" /> Linked to active term checks & signatures
            </p>
          </div>
        </div>

        {/* Ledger Transaction History View */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Escrow Allocation Statement</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex justify-between items-center text-sm transition-colors hover:bg-gray-50/40">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    {tx.type === 'deposit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{tx.targetStartup}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{tx.date} • ID: {tx.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount}
                  </span>
                  <div className="mt-1">
                    {tx.status === 'in_escrow' ? (
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-medium">In Escrow</span>
                    ) : (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-medium">Settled</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deploy Simulation Transfer Interaction */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-fit">
        <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-1.5">
          <Send size={16} className="text-blue-600" /> Initialize Capital Allocation
        </h3>
        <form onSubmit={handleSimulateTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Target Startup Identity</label>
            <input
              type="text"
              required
              placeholder="e.g. Nexus Tech Corp"
              value={targetStartup}
              onChange={(e) => setTargetStartup(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tranche Transfer Amount ($)</label>
            <input
              type="number"
              required
              placeholder="e.g. 25000"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isProcessing ? 'Deploying Tranche to Ledger...' : 'Commit Venture Funds'}
          </button>
        </form>
      </div>

    </div>
  );
};