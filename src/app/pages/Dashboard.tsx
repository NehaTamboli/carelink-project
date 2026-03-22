import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { 
  Heart, 
  Users, 
  AlertCircle, 
  MessageCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { api } from '../utils/api';
import { toast } from 'sonner';

interface AnalysisResult {
  intent: string;
  urgency: 'High' | 'Medium' | 'Low' | 'Critical';
  details: {
    name?: string;
    amount?: string;
    location?: string;
    date?: string;
    email?: string;
    phone?: string;
  };
  response: string;
}

export default function Dashboard() {
  const [message, setMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 287,
    donations: 180000,
    volunteers: 42,
    pending: 8,
  });

  // Load messages from backend
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const messages = await api.getMessages();
    if (messages && messages.length > 0) {
      setRecentMessages(messages.slice(-5).reverse());
      
      // Update stats based on real data
      const pending = messages.filter(m => m.status === 'pending').length;
      const donations = messages
        .filter(m => m.category === 'Donation' && m.amount)
        .reduce((sum, m) => {
          const amount = parseInt(m.amount?.replace(/[^\d]/g, '') || '0');
          return sum + amount;
        }, 0);
      const volunteers = messages.filter(m => m.category === 'Volunteer').length;
      
      setStats({
        total: messages.length,
        donations: donations,
        volunteers: volunteers,
        pending: pending,
      });
    }
  };

  const handleAnalyze = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message to analyze');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Call backend API to analyze the message
      const analysis = await api.analyzeMessage(message);
      
      if (analysis) {
        const { category, urgency, extractedInfo } = analysis;
        
        // Generate appropriate response based on category
        let response = '';
        let intent = category;
        
        if (category === 'Donation') {
          response = 'Thank you for your generous donation intent! We truly appreciate your support. A member of our donation team will contact you shortly to process your contribution.';
        } else if (category === 'Volunteer') {
          response = 'Thank you for your interest in volunteering! Your support means a lot to us. We will connect you with our volunteer coordinator to discuss available opportunities.';
        } else if (category === 'Complaint') {
          response = 'We sincerely apologize for any inconvenience. Your concern is important to us and has been marked as high priority. Our support team will reach out to you within 24 hours to resolve this matter.';
        } else if (category === 'Partnership') {
          response = 'Thank you for your interest in partnering with us! We are excited about potential collaboration opportunities. Our partnerships team will contact you to discuss this further.';
        } else {
          response = 'Thank you for reaching out! We have received your message and will get back to you shortly with the information you need.';
        }
        
        setAnalysisResult({
          intent,
          urgency: urgency as 'High' | 'Medium' | 'Low' | 'Critical',
          details: extractedInfo || {},
          response,
        });
        
        // Save message to backend
        const savedMessage = await api.createMessage({
          message: message,
          sender: extractedInfo?.name || 'Anonymous',
          category: category,
          urgency: urgency,
          status: 'pending',
          contact: extractedInfo?.email || extractedInfo?.phone || '',
          amount: extractedInfo?.amount || null,
          location: extractedInfo?.location || '',
        });
        
        if (savedMessage) {
          toast.success('Message analyzed and saved successfully!');
          // Reload messages to show the new one
          await loadMessages();
          // Clear the input
          setMessage('');
        } else {
          toast.error('Message analyzed but failed to save');
        }
      } else {
        toast.error('Failed to analyze message. Please try again.');
      }
    } catch (error) {
      console.error('Error analyzing message:', error);
      toast.error('An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const categoryData = [
    { name: 'Donations', value: 45, color: '#14b8a6' },
    { name: 'Volunteers', value: 30, color: '#3b82f6' },
    { name: 'Complaints', value: 15, color: '#ef4444' },
    { name: 'General', value: 10, color: '#8b5cf6' },
  ];

  const dailyTrends = [
    { day: 'Mon', messages: 24 },
    { day: 'Tue', messages: 32 },
    { day: 'Wed', messages: 28 },
    { day: 'Thu', messages: 35 },
    { day: 'Fri', messages: 42 },
    { day: 'Sat', messages: 38 },
    { day: 'Sun', messages: 30 },
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'Low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'Critical': return 'text-red-800 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2">{stats.total}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12% from last week
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[#14b8a6]" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Donations</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2">₹{stats.donations.toLocaleString()}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +8% from last week
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Volunteers</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2">{stats.volunteers}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +8 this week
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2">{stats.pending}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Needs attention
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Message Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Message Analyzer</h3>
            <div className="space-y-4">
              <Textarea
                placeholder="Paste a message here to analyze... 
Example: Hi, I would like to donate ₹10,000 for education support. My name is Rahul from Mumbai."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[150px] bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-gray-600 resize-none"
              />
              <Button
                onClick={handleAnalyze}
                disabled={!message.trim() || isAnalyzing}
                className="w-full bg-[#14b8a6] hover:bg-[#0f9688] text-white py-6"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Message'}
              </Button>
            </div>
          </Card>

          {/* Results Panel */}
          <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analysis Results</h3>
            {analysisResult ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Intent</p>
                  <span className="inline-block px-3 py-1 bg-[#14b8a6] bg-opacity-10 text-[#14b8a6] rounded-lg font-medium">
                    {analysisResult.intent}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Urgency Level</p>
                  <span className={`inline-block px-3 py-1 rounded-lg font-medium ${getUrgencyColor(analysisResult.urgency)}`}>
                    {analysisResult.urgency}
                  </span>
                </div>

                {Object.keys(analysisResult.details).length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Extracted Details</p>
                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg space-y-2">
                      {analysisResult.details.name && (
                        <p className="text-sm"><span className="font-medium text-gray-900 dark:text-white">Name:</span> {analysisResult.details.name}</p>
                      )}
                      {analysisResult.details.amount && (
                        <p className="text-sm"><span className="font-medium text-gray-900 dark:text-white">Amount:</span> ₹{parseInt(analysisResult.details.amount).toLocaleString('en-IN')}</p>
                      )}
                      {analysisResult.details.location && (
                        <p className="text-sm"><span className="font-medium text-gray-900 dark:text-white">Location:</span> {analysisResult.details.location}</p>
                      )}
                      {analysisResult.details.date && (
                        <p className="text-sm"><span className="font-medium text-gray-900 dark:text-white">Date:</span> {analysisResult.details.date}</p>
                      )}
                      {analysisResult.details.email && (
                        <p className="text-sm"><span className="font-medium text-gray-900 dark:text-white">Email:</span> {analysisResult.details.email}</p>
                      )}
                      {analysisResult.details.phone && (
                        <p className="text-sm"><span className="font-medium text-gray-900 dark:text-white">Phone:</span> {analysisResult.details.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">AI Generated Response</p>
                  <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{analysisResult.response}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter a message and click analyze to see results</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Message Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#14b8a6]" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">562</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Donation Requests</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">374</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Volunteer Requests</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">187</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Complaints</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">124</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">General Queries</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Messages and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Messages */}
          <Card className="lg:col-span-2 p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Messages</h3>
              <Button variant="ghost" className="text-[#14b8a6] hover:text-[#0f9688]">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{msg.sender}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{msg.text}</p>
                    </div>
                    {msg.status === 'Resolved' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-[#14b8a6] rounded">
                      {msg.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getUrgencyColor(msg.urgency)}`}>
                      {msg.urgency}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Analytics Preview */}
          <div className="space-y-6">
            <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Messages by Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{cat.name} ({cat.value}%)</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">This Week</h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={dailyTrends}>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}