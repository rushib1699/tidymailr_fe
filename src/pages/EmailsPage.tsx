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
  fromName: string;
  internalDate: string;
  senderAvatar?: string;
}

type LabelType = 'INBOX' | 'SENT' | 'DRAFTS';
type AccountType = 'personal' | 'business';

export default function EmailsPage() {
  const { state, actions } = useApp();
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<LabelType>('INBOX');
  const [selectedAccount, setSelectedAccount] = useState<AccountType>('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  useEffect(() => {
    loadEmails();
  }, [selectedLabel, selectedAccount]);

  // Check which accounts are available
  const hasPersonalAccount = !!state.user?.google_email_personal;
  const hasBusinessAccount = !!state.user?.google_email_business;
  const hasAnyAccount = hasPersonalAccount || hasBusinessAccount;

  // Click outside handler for account dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAccountDropdown && !(event.target as Element).closest('.account-dropdown')) {
        setShowAccountDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAccountDropdown]);

  // Auto-select available account
  useEffect(() => {
    if (!hasPersonalAccount && hasBusinessAccount) {
      setSelectedAccount('business');
    }
  }, [hasPersonalAccount, hasBusinessAccount]);

  const getCurrentEmail = () => {
    if (selectedAccount === 'personal') {
      return state.user?.google_email_personal;
    }
    return state.user?.google_email_business;
  };

  const loadEmails = async (): Promise<void> => {
    const userEmail = getCurrentEmail();
    
    if (!userEmail) {
      setEmails([]);
      setIsLoading(false);
      return;
    }

    try {
      const emailData = await mail.listEmails({
        user_email: userEmail,
        label: selectedLabel
      });

      const mappedEmails: Email[] = emailData.map((email: any) => ({
        id: email.id,
        subject: email.subject,
        sender: email.sender,
        fromName: email.fromName,
        preview: email.snippet,
        date: email.date.toString(),
        internalDate: email.internalDate,
        read: false,
        priority: determinePriority(email),
        category: selectedLabel.toLowerCase(),
        senderAvatar: email.senderAvatar || ''
      }));

      setEmails(mappedEmails);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      actions.setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const determinePriority = (email: any): 'high' | 'medium' | 'low' => {
    return 'medium';
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

  const handleLabelChange = (label: LabelType): void => {
    setSelectedLabel(label);
    setSelectedEmail(null);
    setIsLoading(true);
  };

  const handleAccountChange = (account: AccountType): void => {
    setSelectedAccount(account);
    setSelectedEmail(null);
    setShowAccountDropdown(false);
    setIsLoading(true);
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = searchQuery === '' || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.fromName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const formatDate = (dateStr: string): string => {
    const date = new Date(parseInt(dateStr));
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Skeleton loader component
  const EmailSkeleton = () => (
    <div className="p-4 border-b border-gray-100 animate-pulse">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  if (!hasAnyAccount) {
    return (
      <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No email account connected</h3>
          <p className="mt-1 text-sm text-gray-500">Please connect your Google account to view emails.</p>
          <button
            onClick={() => window.location.href = '/connect-accounts'}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Connect Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-white overflow-hidden">
      {/* Gmail-like Header - Fixed height */}
      <div className="flex-shrink-0 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Search mail"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Account Selector */}
            {(hasPersonalAccount && hasBusinessAccount) && (
              <div className="relative account-dropdown">
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline">{getCurrentEmail()}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showAccountDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      {hasPersonalAccount && (
                        <button
                          onClick={() => handleAccountChange('personal')}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${
                            selectedAccount === 'personal' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <span>{state.user?.google_email_personal}</span>
                          {selectedAccount === 'personal' && (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      )}
                      {hasBusinessAccount && (
                        <button
                          onClick={() => handleAccountChange('business')}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${
                            selectedAccount === 'business' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <span>{state.user?.google_email_business}</span>
                          {selectedAccount === 'business' && (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sync Button */}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <svg className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main content area - Takes remaining height */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar - Fixed height with scroll */}
        <div className="w-16 sm:w-48 lg:w-64 border-r border-gray-200 flex-shrink-0 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 sm:p-4">
              <nav className="space-y-1">
                {(['INBOX', 'SENT', 'DRAFTS'] as LabelType[]).map((label) => (
                  <button
                    key={label}
                    onClick={() => handleLabelChange(label)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedLabel === label
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="hidden sm:inline">
                      {label === 'INBOX' && <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>}
                      {label === 'SENT' && <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                      {label === 'DRAFTS' && <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                    </span>
                    <span className="sm:hidden">
                      {label === 'INBOX' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>}
                      {label === 'SENT' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                      {label === 'DRAFTS' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                    </span>
                    <span className="hidden sm:inline">{label.charAt(0) + label.slice(1).toLowerCase()}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Email List - Fixed height with scroll */}
        <div className="w-full sm:w-96 lg:w-1/3 border-r border-gray-200 flex-shrink-0 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div>
                <EmailSkeleton />
                <EmailSkeleton />
                <EmailSkeleton />
                <EmailSkeleton />
                <EmailSkeleton />
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="font-medium">No messages</p>
                <p className="text-sm mt-1">
                  {searchQuery ? 'Try adjusting your search' : `No emails in ${selectedLabel.toLowerCase()}`}
                </p>
              </div>
            ) : (
              <div>
                {filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleEmailClick(email)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:shadow-md transition-shadow ${
                      selectedEmail?.id === email.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    } ${!email.read ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {email.senderAvatar ? (
                          <img src={email.senderAvatar} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium">
                            {getInitials(email.fromName.split(' <')[0])}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {email.fromName.split(' <')[0]}
                          </p>
                          <p className={`text-xs ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                            {formatDate(email.date)}
                          </p>
                        </div>
                        <p className={`text-sm truncate mt-1 ${!email.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {email.subject}
                        </p>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {email.preview}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email Content - Fixed height with scroll */}
        <div className="flex-1 flex flex-col h-full bg-white">
          {selectedEmail ? (
            <>
              {/* Email Header - Fixed height */}
              <div className="flex-shrink-0 border-b border-gray-200 p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-medium text-gray-900 pr-4">
                      {selectedEmail.subject}
                    </h2>
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {selectedEmail.senderAvatar ? (
                          <img src={selectedEmail.senderAvatar} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-medium">
                            {getInitials(selectedEmail.fromName.split(' <')[0])}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedEmail.fromName.split(' <')[0]}</p>
                          <p className="text-xs text-gray-500">{selectedEmail.sender}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{selectedEmail.internalDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 min-h-0">
                <div className="max-w-4xl">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedEmail.preview}
                  </p>
                  {/* <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 italic">
                      Full email content would be loaded here. You'll need to implement an API endpoint to fetch the complete email body.
                    </p>
                  </div> */}
                </div>
              </div>

              {/* Reply Section - Fixed at bottom */}
              {/* <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Reply
                  </button>
                  <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Reply all
                  </button>
                  <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    Forward
                  </button>
                </div>
              </div> */}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select an email</h3>
                <p className="mt-1 text-sm text-gray-500">Choose an email from the list to read it.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}