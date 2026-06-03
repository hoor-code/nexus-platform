import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, PieChart, Filter, Search, PlusCircle, Calendar, Video, FolderLock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { VideoCallChamber } from '../../components/VideoCallChamber'; // Import WebRTC workspace
import { DocumentLocker } from '../../components/DocumentLocker'; // Import Document Locker component
import { useAuth } from '../../context/AuthContext';
import { Entrepreneur } from '../../types';
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

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'documents'>('discover');
  
  // Real-time backend meeting state managers
  const [meetings, setMeetings] = useState<BackendMeeting[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  useEffect(() => {
    if (user) {
      // Fetch live meeting events booked through MongoDB Atlas
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

  // If a video call session is launched by the investor, render the call interface overlay
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
  
  // Get collaboration requests sent by this investor
  const sentRequests = getRequestsFromInvestor(user.id);
  
  // Filter entrepreneurs based on search and industry filters
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
  
  // Get unique industries for filter
  const industries = Array.from(new Set(entrepreneurs.map(e => e.industry)));
  
  // Toggle industry selection
  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prevSelected => 
      prevSelected.includes(industry)
        ? prevSelected.filter(i => i !== industry)
        : [...prevSelected, industry]
    );
  };
  
  const upcomingMeetingsCount = meetings.filter(m => m.status === 'accepted').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab Navigation Switches */}
      <div className="flex border-b border-gray-200 bg-white rounded-lg p-1 shadow-sm max-w-md">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'discover'
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Search size={16} /> Discover Startups
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'documents'
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FolderLock size={16} /> Deal Flow Documents
        </button>
      </div>

      {/* Conditional Rendering Blocks based on Active View State */}
      {activeTab === 'discover' ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Discover Startups</h1>
              <p className="text-gray-600">Find and connect with promising entrepreneurs</p>
            </div>
            
            <Link to="/entrepreneurs">
              <Button leftIcon={<PlusCircle size={18} />}>
                View All Startups
              </Button>
            </Link>
          </div>
          
          {/* Filters and search */}
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
            
            <div className="w-full md:w-1/3">
              <div className="flex items-center space-x-2">
                <Filter size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
                
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
          </div>
          
          {/* Stats summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary-50 border border-primary-100">
              <CardBody>
                <div className="flex items-center">
                  <div className="p-3 bg-primary-100 rounded-full mr-4">
                    <Users size={20} className="text-primary-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-700">Total Startups</p>
                    <h3 className="text-xl font-semibold text-primary-900">{entrepreneurs.length}</h3>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card className="bg-secondary-50 border border-secondary-100">
              <CardBody>
                <div className="flex items-center">
                  <div className="p-3 bg-secondary-100 rounded-full mr-4">
                    <PieChart size={20} className="text-secondary-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-700">Industries</p>
                    <h3 className="text-xl font-semibold text-secondary-900">{industries.length}</h3>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card className="bg-accent-50 border border-accent-100">
              <CardBody>
                <div className="flex items-center">
                  <div className="p-3 bg-accent-100 rounded-full mr-4">
                    <Calendar size={20} className="text-accent-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-accent-700">Upcoming Pitches</p>
                    <h3 className="text-xl font-semibold text-accent-900">{upcomingMeetingsCount}</h3>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Live Calendar Timeline Feed for Investor */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Your Scheduled Pitch Sessions</h2>
            </CardHeader>
            <CardBody>
              {loadingMeetings ? (
                <p className="text-gray-500 text-sm">Syncing secure boardroom times...</p>
              ) : meetings.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {meetings.map((meeting) => (
                    <div key={meeting._id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{meeting.title}</h4>
                        <p className="text-xs text-gray-500">
                          With Startup Founder: {meeting.host._id === user.id ? meeting.attendee.name : meeting.host.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(meeting.startTime).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        {meeting.status === 'accepted' ? (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white text-xs flex items-center gap-1"
                            onClick={() => setActiveRoomId(meeting.roomId)}
                          >
                            <Video size={14} /> Enter Video Room
                          </Button>
                        ) : (
                          <Badge variant={meeting.status === 'rejected' ? 'danger' : 'gray'}>
                            {meeting.status}
                          </Badge>
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
          
          {/* Entrepreneurs grid */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Featured Startups</h2>
              </CardHeader>
              
              <CardBody>
                {filteredEntrepreneurs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEntrepreneurs.map(entrepreneur => (
                      <EntrepreneurCard
                        key={entrepreneur.id}
                        entrepreneur={entrepreneur}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No startups match your filters</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedIndustries([]);
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      ) : (
        <div className="animate-fade-in space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deal Flow Documents</h1>
            <p className="text-gray-600">Securely sign, manage, and audit your investment agreements</p>
          </div>
          {/* Mounted DocumentLocker Workspace */}
          <DocumentLocker />
        </div>
      )}
    </div>
  );
};