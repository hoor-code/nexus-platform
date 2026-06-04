import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, PieChart, Filter, Search, PlusCircle, Calendar, Video, FolderLock, Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, ShieldCheck, RefreshCw, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { VideoCallChamber } from '../../components/VideoCallChamber'; 
import { DocumentLocker } from '../../components/DocumentLocker'; 
import { useAuth } from '../../context/AuthContext';
import { entrepreneurs } from '../../data/users';
import { getRequestsFromInvestor } from '../../data/collaborationRequests';
import axios from 'axios';

interface BackendMeeting {
  _id: string;
  title: string;
  description?: string;
  host: { _id: string; name: string; email: string };
  attendee: { _id: string; name: string; email: string };
  startTime: string;
  endTime: string;
  status: 'pending' | 'accepted' | 'rejected';
  roomId: string;
}

interface Transaction {
  id: string;
  targetStartup: string;
  amount: string;
  date: string;
  type: 'investment' | 'deposit';
  status: 'completed' | 'in_escrow';
}

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'documents' | 'payments'>('discover');
  
  // Real-time backend meeting state managers
  const [meetings, setMeetings] = useState<BackendMeeting[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  // Simulated Payment Ledger State
  const [balance, setBalance] = useState<number>(250000); 
  const [escrowAmount, setEscrowAmount] = useState<number>(50000);
  const [targetStartup, setTargetStartup] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-101',
      targetStartup: 'EcoSphere Energy Solutions',
      amount: '$50,000',
      date: 'Jun 02, 2026',
      type: 'investment',
      status: 'in_escrow',
    },
    {
      id: 'tx-102',
      targetStartup: 'Capital Pool Injection',
      amount: '$300,000',
      date: 'May 15, 2026',
      type: 'deposit',
      status: 'completed',
    },
  ]);

  useEffect(() => {
    if (user) {
      const fetchLiveMeetings = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5000/api/meetings', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMeetings(response.data);
        } catch (err) {
          console.error("Error communicating with calendar backend:", err);
        } finally {
          setLoadingMeetings(false);
        }
      };

      fetchLiveMeetings();
    }
  }, [user]);

  if (!user) return null;

  if (activeRoomId) {
    return (
      <div className="p-4">
        <VideoCallChamber 
          roomId={activeRoomId} 
          userId={user.id} 
          onLeaveCall={() => setActiveRoomId(null)} 
        />
      </div>
    );
  }

  const handleSimulateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);

    if (!targetStartup.trim() || isNaN(amountNum) || amountNum <= 0) return;
    if (amountNum > balance) {
      alert("Insufficient liquidity available in active wallet balance.");
      return;
    }

    setIsProcessing(true);

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
  
  const filteredEntrepreneurs = entrepreneurs.filter(entrepreneur => {
    const matchesSearch = searchQuery === '' || 
      entrepreneur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.pitchSummary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = selectedIndustries.length === 0 || 
      selectedIndustries.includes(entrepreneur.industry);
    
    return matchesSearch && matchesIndustry;
  });
  
  const industries = Array.from(new Set(entrepreneurs.map(e => e.industry)));
  
  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prevSelected => 
      prevSelected.includes(industry) ? prevSelected.filter(i => i !== industry) : [...prevSelected, industry]
    );
  };
  
  const upcomingMeetingsCount = meetings.filter(m => m.status === 'accepted').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navigation Tab Group Controls */}
      <div className="flex flex-wrap border-b border-gray-200 bg-white rounded-lg p-1 shadow-sm max-w-xl">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'discover' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Search size={16} /> Discover Startups
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'documents' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FolderLock size={16} /> Deal Flow Documents
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'payments' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Wallet size={16} /> Capital Pool
        </button>
      </div>

      {/* Conditionally Render Content Blocks */}
      {activeTab === 'discover' ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Discover Startups</h1>
              <p className="text-gray-600">Find and connect with promising entrepreneurs</p>
            </div>
            <Link to="/entrepreneurs">
              <Button leftIcon={<PlusCircle size={18} />}>View All Startups</Button>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-2/3">
              <Input
                placeholder="Search startups, industries, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                startAdornment={<Search size={18} />}
              />
            </div>
            <div className="w-full md:w-1/3 flex items-center space-x-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex flex-wrap gap-2">
                {industries.map(industry => (
                  <Badge
                    key={industry}
                    variant={selectedIndustries.includes(industry) ? 'primary' : 'gray'}
                    className="cursor-pointer"
                    onClick={() => toggleIndustry(industry)}
                  >
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary-50 border border-primary-100">
              <CardBody className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-full mr-4"><Users size={20} className="text-primary-700" /></div>
                <div>
                  <p className="text-sm font-medium text-primary-700">Total Startups</p>
                  <h3 className="text-xl font-semibold text-primary-900">{entrepreneurs.length}</h3>
                </div>
              </CardBody>
            </Card>
            <Card className="bg-secondary-50 border border-secondary-100">
              <CardBody className="flex items-center">
                <div className="p-3 bg-secondary-100 rounded-full mr-4"><PieChart size={20} className="text-secondary-700" /></div>
                <div>
                  <p className="text-sm font-medium text-secondary-700">Industries</p>
                  <h3 className="text-xl font-semibold text-secondary-900">{industries.length}</h3>
                </div>
              </CardBody>
            </Card>
            <Card className="bg-accent-50 border border-accent-100">
              <CardBody className="flex items-center">
                <div className="p-3 bg-accent-100 rounded-full mr-4"><Calendar size={20} className="text-accent-700" /></div>
                <div>
                  <p className="text-sm font-medium text-accent-700">Upcoming Pitches</p>
                  <h3 className="text-xl font-semibold text-accent-900">{upcomingMeetingsCount}</h3>
                </div>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader><h2 className="text-lg font-medium text-gray-900">Your Scheduled Pitch Sessions</h2></CardHeader>
            <CardBody>
              {loadingMeetings ? (
                <p className="text-gray-500 text-sm">Syncing secure boardroom times...</p>
              ) : meetings.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {meetings.map((meeting) => (
                    <div key={meeting._id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{meeting.title}</h4>
                        <p className="text-xs text-gray-500">With Founder: {meeting.host._id === user.id ? meeting.attendee.name : meeting.host.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(meeting.startTime).toLocaleString()}</p>
                      </div>
                      <div>
                        {meeting.status === 'accepted' ? (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs flex items-center gap-1" onClick={() => setActiveRoomId(meeting.roomId)}>
                            <Video size={14} /> Enter Video Room
                          </Button>
                        ) : (
                          <Badge variant={meeting.status === 'rejected' ? 'danger' : 'gray'}>{meeting.status}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No scheduled boardroom calls listed yet.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h2 className="text-lg font-medium text-gray-900">Featured Startups</h2></CardHeader>
            <CardBody>
              {filteredEntrepreneurs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEntrepreneurs.map(entrepreneur => (
                    <EntrepreneurCard key={entrepreneur.id} entrepreneur={entrepreneur} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No startups match your filters</p>
                  <Button variant="outline" className="mt-2" onClick={() => { setSearchQuery(''); setSelectedIndustries([]); }}>Clear filters</Button>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      ) : activeTab === 'documents' ? (
        <div className="animate-fade-in space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deal Flow Documents</h1>
            <p className="text-gray-600">Securely sign, manage, and audit your investment agreements</p>
          </div>
          <DocumentLocker />
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Capital Escrow Portal</h1>
            <p className="text-gray-600">Track liquid capital assets, monitor escrows, and execute secure tranche deployments</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
                  <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Available Liquidity Pool</p>
                  <h2 className="text-3xl font-bold mt-2">${balance.toLocaleString()}</h2>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 w-fit px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <ShieldCheck size={14} /> Active Capital Vault Guarded
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Committed Escrow</p>
                    <h2 className="text-3xl font-bold text-gray-800 mt-2">${escrowAmount.toLocaleString()}</h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                    <RefreshCw size={12} className="animate-spin text-amber-500" /> Bound to outstanding legal review items
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-sm">Escrow Allocation Statement</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex justify-between items-center text-sm hover:bg-gray-50/40 transition-colors">
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
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${tx.status === 'in_escrow' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            {tx.status === 'in_escrow' ? 'In Escrow' : 'Settled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-fit">
              <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-1.5">
                <Send size={16} className="text-blue-600" /> Initialize Capital Allocation
              </h3>
              <form onSubmit={handleSimulateTransfer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Target Startup Identity</label>
                  <input
                    type="text" required placeholder="e.g. Nexus Tech Corp" value={targetStartup}
                    onChange={(e) => setTargetStartup(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tranche Transfer Amount ($)</label>
                  <input
                    type="number" required placeholder="e.g. 25000" value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit" disabled={isProcessing}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Deploying Tranche to Ledger...' : 'Commit Venture Funds'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};