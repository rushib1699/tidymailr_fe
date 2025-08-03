import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { mail } from '../services/api';

interface Email {
  id: string;
  subject: string;
  sender: string;
  preview: string;
  date: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export default function EmailsPage() {
  const { actions } = useApp();
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async (): Promise<void> => {
    try {
      // For now, we'll create mock data since the API might not have emails endpoint yet
      const mockEmails: Email[] = [
        {
          id: '1',
          subject: 'Welcome to EmailApp',
          sender: 'noreply@emailapp.com',
          preview: 'Thank you for signing up! Get started with our intelligent email management system...',
          date: new Date().toISOString(),
          read: false,
          priority: 'high',
          category: 'important'
        },
        {
          id: '2',
          subject: 'Your weekly summary',
          sender: 'summary@emailapp.com',
          preview: 'Here is your weekly email activity summary. You have processed 45 emails this week...',
          date: new Date(Date.now() - 86400000).toISOString(),
          read: true,
          priority: 'medium',
          category: 'updates'
        },
        {
          id: '3',
          subject: 'New feature announcement',
          sender: 'updates@emailapp.com',
          preview: 'We are excited to announce new task management features in your email dashboard...',
          date: new Date(Date.now() - 172800000).toISOString(),
          read: false,
          priority: 'low',
          category: 'updates'
        }
      ];
      setEmails(mockEmails);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      actions.setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (): Promise<void> => {
    setIsSyncing(true);
    try {
      await mail.sync({});
      await loadEmails();
      actions.setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      actions.setError(errorMessage);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEmailClick = (email: Email): void => {
    setSelectedEmail(email);
    if (!email.read) {
      setEmails(prev => prev.map(e => 
        e.id === email.id ? { ...e, read: true } : e
      ));
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !email.read) ||
      (filter === 'read' && email.read) ||
      email.category === filter;
    
    const matchesSearch = searchQuery === '' || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Email List Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Search and Actions */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Emails</h2>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isSyncing ? 'Syncing...' : 'Sync'}
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          
          <div className="mt-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Emails</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="important">Important</option>
              <option value="updates">Updates</option>
              <option value="promotion">Promotions</option>
            </select>
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p>No emails found</p>
              <p className="text-sm">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => handleEmailClick(email)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedEmail?.id === email.id ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                  } ${!email.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm font-medium truncate ${!email.read ? 'font-bold' : ''}`}>
                          {email.sender}
                        </p>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(email.priority)}`} />
                        {!email.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className={`text-sm text-gray-900 truncate mt-1 ${!email.read ? 'font-semibold' : ''}`}>
                        {email.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {email.preview}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(email.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 flex flex-col">
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedEmail.subject}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>From: {selectedEmail.sender}</span>
                    <span>•</span>
                    <span>{new Date(selectedEmail.date).toLocaleString()}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedEmail.priority === 'high' ? 'bg-red-100 text-red-800' :
                      selectedEmail.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedEmail.priority} priority
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 bg-white p-6 overflow-y-auto">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {selectedEmail.preview}
                </p>
                <br />
                <p className="text-gray-700 leading-relaxed">
                  This is a sample email content. In a real application, this would contain the full email body with proper formatting, images, and attachments.
                </p>
                <br />
                <p className="text-gray-700 leading-relaxed">
                  You can implement rich text rendering, attachment handling, and other email features here.
                </p>
              </div>
            </div>

            {/* Reply Section */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Reply
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Forward
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Select an email</h3>
              <p className="mt-1 text-sm text-gray-500">Choose an email from the list to view its contents.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}