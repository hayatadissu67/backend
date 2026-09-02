import React, { useState, useRef, useEffect } from 'react';
import { DiscussionItem, MeetingItem, NotificationItem, LoggedInPersona, Project, UserItem } from '../types';
import { fetchChannelsApi, createChannelApi, fetchMessagesApi, createMessageApi, fetchDocumentsApi, createDocumentApi, deleteDocumentApi } from '../services/api';

export interface DocumentFileItem {
  id: string;
  title: string;
  type: string;
  size: string;
  date: string;
  author: string;
  projectCode: string;
}

export interface ChatMessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ChatMessage {
  id: string;
  channelId: string;
  sender: string;
  senderRole: string;
  avatar: string;
  content: string;
  timestamp: string;
  reactions?: ChatMessageReaction[];
  isPinned?: boolean;
  isCodeSnippet?: boolean;
  attachmentName?: string;
  replyTo?: {
    id: string;
    sender: string;
    content: string;
  };
  status?: 'sent' | 'delivered' | 'read';
  isVoiceNote?: boolean;
  voiceDuration?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  unreadCount: number;
  description: string;
  avatar?: string;
  roleTitle?: string;
  status?: 'online' | 'offline' | 'busy';
  projectCode?: string;
}

export interface ExtractedChatNote {
  id: string;
  channelId: string;
  channelName: string;
  extractedBy: string;
  extractedAt: string;
  summaryTitle: string;
  executiveSummary: string;
  keyDecisions: string[];
  actionItems: { task: string; assignee: string; priority: 'High' | 'Medium' | 'Low' }[];
  rawChatExcerpt: string;
  publishedToDiscussion?: boolean;
}

const INITIAL_CHANNELS: ChatChannel[] = [
  {
    id: 'ch-general',
    name: 'general-pmo',
    type: 'channel',
    unreadCount: 2,
    description: 'Company-wide PMO alignment, announcements, and milestone sync.'
  },
  {
    id: 'ch-devteam',
    name: 'dev-team-sprint',
    type: 'channel',
    unreadCount: 0,
    description: 'Technical developer discussions, architecture, and code reviews.'
  },
  {
    id: 'ch-prjdelta',
    name: 'project-delta-gate3',
    type: 'channel',
    unreadCount: 1,
    description: 'PRJ-DELTA Gate 3 milestone execution and deliverables.'
  },
  {
    id: 'ch-governance',
    name: 'governance-and-security',
    type: 'channel',
    unreadCount: 0,
    description: 'ISO compliance, risk register reviews, and security audits.'
  },
  {
    id: 'dm-[#1]',
    name: 'Alex Rivers',
    type: 'dm',
    unreadCount: 0,
    description: 'Senior Software Engineer & Tech Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    roleTitle: 'Sr. Full-Stack Lead',
    status: 'online'
  },
  {
    id: 'dm-[#2]',
    name: 'David Kim',
    type: 'dm',
    unreadCount: 0,
    description: 'Frontend Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    roleTitle: 'UI/UX Developer',
    status: 'online'
  },
  {
    id: 'dm-[#3]',
    name: 'Marcus Vance',
    type: 'dm',
    unreadCount: 0,
    description: 'PMO Engineering Intern',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    roleTitle: 'Intern',
    status: 'online'
  },
  {
    id: 'dm-[#4]',
    name: 'Elena Rostova',
    type: 'dm',
    unreadCount: 0,
    description: 'QA Lead',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    roleTitle: 'Quality Assurance Lead',
    status: 'busy'
  }
];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    channelId: 'ch-general',
    sender: 'Sarah Jenkins',
    senderRole: 'PMO Executive Director',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    content: 'Good morning team! Please confirm your Gate 3 task completion status before 3 PM today.',
    timestamp: '10:15 AM',
    reactions: [{ emoji: '👍', count: 4, users: ['Alex Rivers', 'David Kim'] }],
    isPinned: true
  },
  {
    id: 'm2',
    channelId: 'ch-general',
    sender: 'Alex Rivers',
    senderRole: 'Sr. Full-Stack Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    content: 'Confirmed Sarah! Cloud API Security patch for PRJ-DELTA is complete and passed all 100% unit tests. We are ready for deployment.',
    timestamp: '10:22 AM',
    reactions: [{ emoji: '🔥', count: 3, users: ['Sarah Jenkins'] }]
  },
  {
    id: 'm3',
    channelId: 'ch-general',
    sender: 'David Kim',
    senderRole: 'UI/UX Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    content: 'The frontend communication hub and user account switching modules have been updated and validated.',
    timestamp: '10:35 AM'
  },
  {
    id: 'm4',
    channelId: 'ch-general',
    sender: 'Marcus Vance',
    senderRole: 'Intern',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    content: 'I uploaded the ISO 27001 audit report into the File Vault under project PRJ-COMP.',
    timestamp: '10:40 AM',
    reactions: [{ emoji: '✅', count: 2, users: ['Sarah Jenkins'] }]
  },
  {
    id: 'm5',
    channelId: 'ch-devteam',
    sender: 'Alex Rivers',
    senderRole: 'Sr. Full-Stack Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    content: 'Please ensure all database migrations use Drizzle ORM schema conventions with standard index constraints.',
    timestamp: '09:30 AM',
    isCodeSnippet: true
  },
  {
    id: 'm6',
    channelId: 'ch-devteam',
    sender: 'David Kim',
    senderRole: 'UI/UX Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    content: 'PostgreSQL indexes applied. Query execution benchmark dropped from 120ms to 9ms!',
    timestamp: '09:45 AM',
    reactions: [{ emoji: '⚡', count: 5, users: ['Alex Rivers'] }]
  },
  {
    id: 'm7',
    channelId: 'ch-prjdelta',
    sender: 'Sarah Jenkins',
    senderRole: 'PMO Executive Director',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    content: 'Project Delta budget variance analysis complete. $45,000 contingency buffer allocated for final validation.',
    timestamp: '11:00 AM'
  },
  {
    id: 'm8',
    channelId: 'ch-prjdelta',
    sender: 'Elena Rostova',
    senderRole: 'Quality Assurance Lead',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    content: 'Automated end-to-end regression suite passed with 0 critical defects.',
    timestamp: '11:15 AM',
    reactions: [{ emoji: '🎉', count: 4, users: ['Sarah Jenkins', 'Alex Rivers'] }]
  }
];

const INITIAL_EXTRACTED_NOTES: ExtractedChatNote[] = [
  {
    id: 'note-1',
    channelId: 'ch-general',
    channelName: '#general-pmo',
    extractedBy: 'Sarah Jenkins (PM)',
    extractedAt: '2026-07-30 10:45 AM',
    summaryTitle: 'Gate 3 Readiness & API Patch Sync',
    executiveSummary: 'Team confirmed readiness for Gate 3 deployment. API Security patch passed unit tests and frontend communication hub updates are live.',
    keyDecisions: [
      'Approved Cloud API Security Patch deployment for PRJ-DELTA.',
      'ISO 27001 audit report archived in File Vault.'
    ],
    actionItems: [
      { task: 'Verify regression tests before 3 PM gate sign-off', assignee: 'Elena Rostova', priority: 'High' },
      { task: 'Archive ISO 27001 audit findings in executive compliance log', assignee: 'Marcus Vance', priority: 'Medium' }
    ],
    rawChatExcerpt: 'Alex: Cloud API Security patch complete. David: Frontend hub updated. Marcus: ISO report uploaded.',
    publishedToDiscussion: true
  }
];

const INITIAL_DOCUMENTS: DocumentFileItem[] = [
  {
    id: 'doc-1',
    title: 'Q3 Strategic Portfolio Financial Report.pdf',
    type: 'PDF Report',
    size: '4.2 MB',
    date: '2026-07-28',
    author: 'Sarah Jenkins',
    projectCode: 'PRJ-DELTA'
  },
  {
    id: 'doc-2',
    title: 'Enterprise PMO Gate 3 Governance Review.docx',
    type: 'Word Document',
    size: '1.8 MB',
    date: '2026-07-25',
    author: 'PMO Governance',
    projectCode: 'PRJ-[#3]'
  },
  {
    id: 'doc-3',
    title: 'Project Delta Variance Analysis & Cost Model.xlsx',
    type: 'Spreadsheet',
    size: '2.5 MB',
    date: '2026-07-22',
    author: 'M. Thompson',
    projectCode: 'PRJ-DELTA'
  },
  {
    id: 'doc-4',
    title: 'Cloud Infrastructure API Security Diagram.pdf',
    type: 'Architecture Diagram',
    size: '8.1 MB',
    date: '2026-07-18',
    author: 'S. Gupta',
    projectCode: 'PRJ-AI'
  },
  {
    id: 'doc-5',
    title: 'ISO 27001 Cybersecurity Audit Assessment.pdf',
    type: 'Audit Document',
    size: '3.0 MB',
    date: '2026-07-15',
    author: 'J. Baker',
    projectCode: 'PRJ-COMP'
  }
];

interface CommunicationViewProps {
  users?: UserItem[];
  discussions: DiscussionItem[];
  onAddDiscussion: (discussion: DiscussionItem) => void;
  meetings: MeetingItem[];
  onAddMeeting: (meeting: MeetingItem) => void;
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  onClearNotifications: () => void;
  activeSubTab?: 'discussions' | 'chat' | 'calendar' | 'notifications' | 'files';
  onSubTabChange?: (tab: 'discussions' | 'chat' | 'calendar' | 'notifications' | 'files') => void;
  currentPersona?: LoggedInPersona;
  projects?: Project[];
}

export const CommunicationView: React.FC<CommunicationViewProps> = ({
  users = [],
  discussions,
  onAddDiscussion,
  meetings,
  onAddMeeting,
  notifications,
  onMarkAllNotificationsRead,
  onClearNotifications,
  activeSubTab = 'discussions',
  onSubTabChange,
  currentPersona,
  projects = [],
}) => {
  const [subTab, setSubTab] = useState<'discussions' | 'chat' | 'calendar' | 'notifications' | 'files'>(activeSubTab);

  useEffect(() => {
    setSubTab(activeSubTab);
  }, [activeSubTab]);

  const handleSetTab = (t: 'discussions' | 'chat' | 'calendar' | 'notifications' | 'files') => {
    setSubTab(t);
    if (onSubTabChange) onSubTabChange(t);
  };

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- TEAM CHAT MODULE STATE & TELEGRAM FEATURES ---
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const loadChatData = async () => {
      const [apiChannels, apiMessages] = await Promise.all([
        fetchChannelsApi(),
        fetchMessagesApi()
      ]);
      
      const baseChannels = apiChannels.length > 0 ? apiChannels : INITIAL_CHANNELS.filter(c => c.type === 'channel');
      
      const dynamicDMs: ChatChannel[] = (users || [])
        .filter(u => u.id !== currentPersona?.id && u.name !== currentPersona?.name)
        .map(u => {
          const myId = currentPersona?.id || 'temp';
          const otherId = u.id || 'temp2';
          const dmId = `dm-${[myId, otherId].sort().join('-')}`;
          
          return {
            id: dmId,
            name: u.name,
            type: 'dm',
            unreadCount: 0,
            description: `Chat with ${u.role}`,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
            roleTitle: u.role,
            status: 'online'
          };
        });
        
      const allChannels = [...baseChannels, ...dynamicDMs];
      
      if (allChannels.length > 0) {
        setChannels(allChannels);
        setActiveChannelId(allChannels[0].id);
      } else {
        setChannels([]);
        setActiveChannelId('');
      }
      setChatMessages(apiMessages || []);
    };
    
    loadChatData();
    
    // Polling interval for messages
    const interval = setInterval(loadChatData, 10000);
    return () => clearInterval(interval);
  }, [users, currentPersona]);

  const [chatInput, setChatInput] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [isCodeSnippet, setIsCodeSnippet] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>(null);
  const [isTypingStatus, setIsTypingStatus] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState<boolean>(true);
  const [extractedNotes, setExtractedNotes] = useState<ExtractedChatNote[]>(INITIAL_EXTRACTED_NOTES);
  const [showExtractModal, setShowExtractModal] = useState(false);
  const [extractedDraft, setExtractedDraft] = useState<ExtractedChatNote | null>(null);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);

  // Project Filtering & Channel Creation State
  const [selectedProjectCode, setSelectedProjectCode] = useState<string>('ALL');
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [newChannelNameInput, setNewChannelNameInput] = useState('');
  const [newChannelProjectCode, setNewChannelProjectCode] = useState('');
  const [newChannelDescInput, setNewChannelDescInput] = useState('');

  // Auto-sync channels with every project passed in props
  useEffect(() => {
    if (projects && projects.length > 0) {
      setChannels((prevChannels) => {
        const existingCodes = new Set(prevChannels.map((c) => c.projectCode).filter(Boolean));
        const newProjectChannels: ChatChannel[] = [];

        projects.forEach((prj) => {
          if (!existingCodes.has(prj.code)) {
            newProjectChannels.push({
              id: `ch-prj-${prj.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              name: `${prj.code.toLowerCase()}-${(prj.lifecycleStage || 'planning').toLowerCase()}`,
              type: 'channel',
              unreadCount: 0,
              description: `${prj.name} (${prj.code}) • Managed by ${prj.owner} • ${prj.gate} [${prj.health} Health]`,
              projectCode: prj.code
            });
          }
        });

        if (newProjectChannels.length > 0) {
          return [...prevChannels, ...newProjectChannels];
        }
        return prevChannels;
      });
    }
  }, [projects]);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  // Handler to create custom channel for any project
  const handleCreateNewChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelNameInput.trim()) return;

    const formattedName = newChannelNameInput.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const createdChan: ChatChannel = {
      id: `ch-custom-${Date.now()}`,
      name: formattedName,
      type: 'channel',
      unreadCount: 0,
      description: newChannelDescInput || `Dedicated collaboration channel for ${newChannelProjectCode || 'PMO project'}.`,
      projectCode: newChannelProjectCode || undefined
    };

    setChannels((prev) => [...prev, createdChan]);
    createChannelApi(createdChan);
    
    setActiveChannelId(createdChan.id);
    setIsCreateChannelOpen(false);
    setNewChannelNameInput('');
    setNewChannelProjectCode('');
    setNewChannelDescInput('');
    showToast(`Created channel #${createdChan.name}`);
  };

  // Removed automated Telegram team/manager responses

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const currentSender = currentPersona ? currentPersona.name : 'Sarah Jenkins';
    const currentRole = currentPersona ? currentPersona.roleTitle : 'PMO Executive Director';
    const currentAvatar = currentPersona?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      channelId: activeChannelId,
      sender: currentSender,
      senderRole: currentRole,
      avatar: currentAvatar,
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCodeSnippet,
      status: 'read',
      replyTo: replyingToMessage
        ? {
            id: replyingToMessage.id,
            sender: replyingToMessage.sender,
            content: replyingToMessage.content.slice(0, 70)
          }
        : undefined
    };

    setChatMessages((prev) => [...prev, newMsg]);
    createMessageApi(newMsg);

    const sentText = chatInput;
    setChatInput('');
    setIsCodeSnippet(false);
    setReplyingToMessage(null);
    showToast(`Sent message to ${activeChannel.name}`);
  };

  const handleSendVoiceNote = () => {
    const currentSender = currentPersona ? currentPersona.name : 'Sarah Jenkins';
    const currentRole = currentPersona ? currentPersona.roleTitle : 'PMO Executive Director';
    const currentAvatar = currentPersona?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';

    const voiceMsg: ChatMessage = {
      id: `m-voice-${Date.now()}`,
      channelId: activeChannelId,
      sender: currentSender,
      senderRole: currentRole,
      avatar: currentAvatar,
      content: 'Voice message recorded (0:18)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoiceNote: true,
      voiceDuration: '0:18',
      status: 'read'
    };

    setChatMessages((prev) => [...prev, voiceMsg]);
    createMessageApi(voiceMsg);

    showToast('Recorded and sent Telegram voice note (0:18)');
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setChatMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions = m.reactions ? [...m.reactions] : [];
        const existing = currentReactions.find((r) => r.emoji === emoji);
        const userName = currentPersona ? currentPersona.name : 'Sarah Jenkins';

        if (existing) {
          existing.count += 1;
          if (!existing.users.includes(userName)) existing.users.push(userName);
        } else {
          currentReactions.push({ emoji, count: 1, users: [userName] });
        }
        return { ...m, reactions: currentReactions };
      })
    );
  };

  const handleTogglePin = (msgId: string) => {
    setChatMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          const pinned = !m.isPinned;
          showToast(pinned ? 'Pinned message to chat header' : 'Unpinned message');
          return { ...m, isPinned: pinned };
        }
        return m;
      })
    );
  };

  const handleExtractChatNotes = () => {
    const channelMsgs = chatMessages.filter((m) => m.channelId === activeChannelId);
    const excerpt = channelMsgs.slice(-5).map((m) => `${m.sender}: ${m.content}`).join(' | ');

    const decisions: string[] = [];
    const actions: { task: string; assignee: string; priority: 'High' | 'Medium' | 'Low' }[] = [];

    channelMsgs.forEach((m) => {
      const lower = m.content.toLowerCase();
      if (lower.includes('complete') || lower.includes('pass') || lower.includes('ready') || lower.includes('confirm') || lower.includes('allocate')) {
        decisions.push(`Decision: ${m.sender} confirmed "${m.content.slice(0, 80)}..."`);
      }
      if (lower.includes('please') || lower.includes('ensure') || lower.includes('verify') || lower.includes('upload')) {
        actions.push({
          task: m.content.length > 90 ? m.content.slice(0, 87) + '...' : m.content,
          assignee: m.sender,
          priority: lower.includes('urgent') || lower.includes('gate 3') ? 'High' : 'Medium'
        });
      }
    });

    if (decisions.length === 0) {
      decisions.push(`Agreed on milestone deliverables for ${activeChannel.name}.`);
    }
    if (actions.length === 0) {
      actions.push({ task: `Follow up on technical sync for ${activeChannel.name}`, assignee: 'Alex Rivers', priority: 'Medium' });
    }

    const draft: ExtractedChatNote = {
      id: `ext-${Date.now()}`,
      channelId: activeChannelId,
      channelName: activeChannel.type === 'channel' ? `#${activeChannel.name}` : `@${activeChannel.name}`,
      extractedBy: currentPersona ? `${currentPersona.name} (${currentPersona.roleTitle})` : 'Sarah Jenkins (PM)',
      extractedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      summaryTitle: `Extracted PM Digest - ${activeChannel.name}`,
      executiveSummary: `Automated PM extraction from member chat. Key milestones, code patches, and task statuses compiled from ${channelMsgs.length} messages.`,
      keyDecisions: decisions,
      actionItems: actions,
      rawChatExcerpt: excerpt || 'No recent messages in this channel.',
      publishedToDiscussion: false
    };

    setExtractedDraft(draft);
    setShowExtractModal(true);
  };

  const handleConfirmSaveExtractedNote = (publishToDiscussion: boolean) => {
    if (!extractedDraft) return;

    const noteToSave = { ...extractedDraft, publishedToDiscussion: publishToDiscussion };

    setExtractedNotes((prev) => [noteToSave, ...prev]);

    if (publishToDiscussion) {
      const discussionItem: DiscussionItem = {
        id: `d-ext-${Date.now()}`,
        author: currentPersona ? currentPersona.name : 'Sarah Jenkins',
        role: currentPersona ? currentPersona.roleTitle : 'PMO Executive Director',
        avatar: currentPersona?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        content: `📌 **[PM Extracted Chat Summary - ${noteToSave.channelName}]**\n\n**Executive Summary:** ${noteToSave.executiveSummary}\n\n**Key Decisions:**\n${noteToSave.keyDecisions.map((d) => `• ${d}`).join('\n')}\n\n**Assigned Action Items:**\n${noteToSave.actionItems.map((a) => `• [${a.priority}] ${a.task} (@${a.assignee})`).join('\n')}`,
        timestamp: 'Just now',
        repliesCount: 0,
        projectTag: 'PRJ-DELTA'
      };

      onAddDiscussion(discussionItem);
      showToast('Saved PM Chat Notes & Published to Executive Discussions Bulletin!');
    } else {
      showToast('Saved Extracted Chat Notes to PM Governance Vault.');
    }

    setShowExtractModal(false);
    setExtractedDraft(null);
  };

  // --- DISCUSSIONS MODULE STATE ---
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [discussionTagFilter, setDiscussionTagFilter] = useState('ALL');
  const [discussionProjectTag, setDiscussionProjectTag] = useState('PRJ-DELTA');

  const handlePostDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussionContent.trim()) return;

    const item: DiscussionItem = {
      id: `d-${Date.now()}`,
      author: currentPersona ? currentPersona.name : 'Executive Office',
      role: currentPersona ? currentPersona.roleTitle : 'PMO Admin',
      avatar: currentPersona?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      content: newDiscussionContent,
      timestamp: 'Just now',
      repliesCount: 0,
      projectTag: discussionProjectTag
    };

    onAddDiscussion(item);
    setNewDiscussionContent('');
    showToast('Posted executive bulletin to communication feed.');
  };

  const filteredDiscussions = discussions.filter(
    (d) => discussionTagFilter === 'ALL' || d.projectTag === discussionTagFilter
  );

  // --- CALENDAR MODULE STATE ---
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const getLocalToday = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };
  const [meetingDate, setMeetingDate] = useState(() => getLocalToday());
  const [meetingTime, setMeetingTime] = useState('10:00 AM - 11:00 AM');
  const [meetingLocation, setMeetingLocation] = useState('Executive Boardroom A');
  const [meetingAgenda, setMeetingAgenda] = useState('');

  const handleScheduleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;

    if (meetingDate < getLocalToday()) {
      showToast('Cannot schedule a meeting in the past.');
      return;
    }

    const newM: MeetingItem = {
      id: `m-${Date.now()}`,
      title: meetingTitle,
      date: meetingDate,
      time: meetingTime,
      attendees: ['PMO Steering Committee', currentPersona ? currentPersona.name : 'Portfolio Leads'],
      location: meetingLocation,
      status: 'Scheduled',
      agenda: meetingAgenda || 'Strategic portfolio alignment and gate review session.'
    };

    onAddMeeting(newM);
    setMeetingTitle('');
    setMeetingAgenda('');
    setShowScheduleModal(false);
    showToast(`Scheduled governance meeting: "${newM.title}"`);
  };

  // --- NOTIFICATIONS MODULE STATE ---
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'alert'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (notificationFilter === 'unread') return !n.isRead;
    if (notificationFilter === 'alert') return n.type === 'alert';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // --- FILE SHARING MODULE STATE ---
  const [documents, setDocuments] = useState<DocumentFileItem[]>([]);
  const [documentSearch, setDocumentSearch] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadDocs = async () => {
      const docs = await fetchDocumentsApi();
      if (docs.length > 0) {
        setDocuments(docs);
      }
    };
    if (subTab === 'files') {
      loadDocs();
    }
  }, [subTab]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

      let docType = 'Document';
      if (ext === 'PDF') docType = 'PDF Report';
      else if (['DOC', 'DOCX'].includes(ext)) docType = 'Word Document';
      else if (['XLS', 'XLSX', 'CSV'].includes(ext)) docType = 'Spreadsheet';
      else if (['PNG', 'JPG', 'SVG'].includes(ext)) docType = 'Architecture Diagram';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('type', docType);
      formData.append('size', `${sizeMB} MB`);
      formData.append('date', new Date().toISOString().split('T')[0]);
      formData.append('projectCode', 'PRJ-DELTA'); // Placeholder until project selector is added

      const created = await createDocumentApi(formData);
      if (created) {
        setDocuments((prev) => [created, ...prev]);
      }
    }

    showToast(`Successfully uploaded ${files.length} document(s) to Communication Vault.`);
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      const success = await deleteDocumentApi(id);
      if (success) {
        setDocuments(documents.filter((d) => d.id !== id));
        showToast("Document deleted successfully");
      } else {
        alert("Failed to delete document. You might not have permission.");
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(documentSearch.toLowerCase()) ||
      d.type.toLowerCase().includes(documentSearch.toLowerCase()) ||
      d.author.toLowerCase().includes(documentSearch.toLowerCase()) ||
      d.projectCode.toLowerCase().includes(documentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-sm shadow-2xl flex items-center gap-2 border border-slate-700 animate-slideUp">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Communication Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-1 text-[#45464d] font-bold text-[11px] tracking-wider uppercase mb-1">
              <span>EXECUTIVE CENTER</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-[#00174b]">COMMUNICATION HUB</span>
            </nav>
            <h2 className="text-[26px] font-bold tracking-tight text-[#191c1e]">
              Communication &amp; Information Sharing
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Centralized hub for team discussions, governance calendar, notifications, and file sharing.
            </p>
          </div>

          {/* Sub-tab Navigation Buttons */}
          <div className="bg-slate-100 p-1 rounded-sm border border-slate-200 flex flex-wrap gap-1 text-xs font-bold">
            <button
              onClick={() => handleSetTab('discussions')}
              className={`px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all ${
                subTab === 'discussions'
                  ? 'bg-[#00174b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Discussions</span>
            </button>

            <button
              onClick={() => handleSetTab('chat')}
              className={`px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all relative ${
                subTab === 'chat'
                  ? 'bg-[#00174b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
              <span>Team Chat</span>
              <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1">
                LIVE
              </span>
            </button>

            <button
              onClick={() => handleSetTab('calendar')}
              className={`px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all ${
                subTab === 'calendar'
                  ? 'bg-[#00174b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">event</span>
              <span>Calendar</span>
            </button>

            <button
              onClick={() => handleSetTab('notifications')}
              className={`px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all relative ${
                subTab === 'notifications'
                  ? 'bg-[#00174b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">notifications</span>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSetTab('files')}
              className={`px-3.5 py-2 rounded-xs flex items-center gap-1.5 transition-all ${
                subTab === 'files'
                  ? 'bg-[#00174b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">folder_shared</span>
              <span>File Sharing</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODULE 1: DISCUSSIONS */}
      {/* ========================================================= */}
      {subTab === 'discussions' && (
        <div className="space-y-6 max-w-4xl">
          {/* New Discussion Form */}
          <form onSubmit={handlePostDiscussion} className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">chat</span>
                Post Discussion or Announcement
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-semibold">Project Tag:</span>
                <select
                  value={discussionProjectTag}
                  onChange={(e) => setDiscussionProjectTag(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-sm px-2 py-1 text-xs font-mono font-bold"
                >
                  <option value="PRJ-DELTA">PRJ-DELTA</option>
                  <option value="PRJ-ALPHA">PRJ-ALPHA</option>
                  <option value="PRJ-SIGMA">PRJ-SIGMA</option>
                  <option value="PRJ-ERP">PRJ-ERP</option>
                  <option value="PRJ-COMP">PRJ-COMP</option>
                </select>
              </div>
            </div>

            <textarea
              rows={3}
              value={newDiscussionContent}
              onChange={(e) => setNewDiscussionContent(e.target.value)}
              placeholder="Post milestone announcements, project updates, technical questions, or steering notes..."
              className="w-full border border-slate-200 rounded-sm p-3 text-xs outline-none focus:border-blue-600 focus:bg-slate-50/50"
            />

            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-slate-400">Posting as <strong className="text-slate-700">{currentPersona?.name || 'Sarah Jenkins'}</strong></span>
              <button
                type="submit"
                className="px-5 py-2 bg-[#00174b] text-white font-bold text-xs rounded-sm hover:bg-indigo-950 uppercase tracking-wider shadow-2xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Publish Bulletin</span>
              </button>
            </div>
          </form>

          {/* Project Filter Pills */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span>Filter by Project:</span>
            {['ALL', 'PRJ-DELTA', 'PRJ-ALPHA', 'PRJ-SIGMA', 'PRJ-COMP'].map((tag) => (
              <button
                key={tag}
                onClick={() => setDiscussionTagFilter(tag)}
                className={`px-3 py-1 rounded-xs font-mono text-[11px] transition-colors ${
                  discussionTagFilter === tag
                    ? 'bg-[#00174b] text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Discussions Feed */}
          <div className="space-y-4">
            {filteredDiscussions.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.author}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{item.author}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{item.role} • {item.timestamp}</p>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-xs">
                    {item.projectTag}
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed">{item.content}</p>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
                  <button
                    onClick={() => showToast(`Replying to thread by ${item.author}`)}
                    className="flex items-center gap-1 font-semibold hover:text-blue-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">reply</span>
                    {item.repliesCount} Responses
                  </button>
                  <button
                    onClick={() => showToast('Discussion thread link copied to clipboard!')}
                    className="hover:text-slate-800 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">link</span>
                    <span>Share Thread</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 2: TEAM CHAT & PM NOTES EXTRACTION (TELEGRAM UI) */}
      {/* ========================================================= */}
      {subTab === 'chat' && (
        <div className="space-y-6">
          {/* Telegram Header Bar */}
          <div className="bg-white p-4 border border-slate-200 rounded-sm shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 border border-blue-700 rounded-sm flex items-center justify-center text-white font-bold shadow-2xs">
                <span className="material-symbols-outlined text-[22px]">
                  {activeChannel.type === 'channel' ? 'tag' : 'person'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">
                    {activeChannel.type === 'channel' ? `#${activeChannel.name}` : `@${activeChannel.name}`}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {activeChannel.type === 'dm' ? activeChannel.status?.toUpperCase() || 'ONLINE' : 'ACTIVE PMO GROUP'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{activeChannel.description}</p>
              </div>
            </div>

            {/* PM Tools & Telegram Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Auto Reply Toggle */}
              <button
                type="button"
                onClick={() => {
                  setAutoReplyEnabled(!autoReplyEnabled);
                  showToast(autoReplyEnabled ? 'Live team replies disabled' : 'Live team replies enabled');
                }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-xs border transition-colors flex items-center gap-1 ${
                  autoReplyEnabled
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
                title="Toggle simulated live team replies"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {autoReplyEnabled ? 'bolt' : 'pause_circle'}
                </span>
                <span>Live Team Replies: {autoReplyEnabled ? 'ON' : 'OFF'}</span>
              </button>

              {/* Chat Search */}
              <div className="relative w-44">
                <span className="material-symbols-outlined absolute left-2 top-1.5 text-slate-400 text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  placeholder="Search chat..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs pl-7 pr-2 py-1 text-xs outline-none focus:border-blue-600"
                />
              </div>

              {/* Extract Chat Notes Button (PM Feature) */}
              <button
                onClick={handleExtractChatNotes}
                className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-900 to-blue-900 hover:from-indigo-950 hover:to-blue-950 text-white font-bold text-xs rounded-xs shadow-2xs flex items-center gap-1.5 transition-all transform active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-400 animate-pulse">auto_awesome</span>
                <span>Extract PM Notes</span>
              </button>

              {/* View PM Notes Vault Button */}
              <button
                onClick={() => setShowNotesDrawer(!showNotesDrawer)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xs border border-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-indigo-700">inventory_2</span>
                <span>Vault ({extractedNotes.length})</span>
              </button>
            </div>
          </div>

          {/* Live Telegram Typing Banner */}
          {isTypingStatus && (
            <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-sm flex items-center gap-2 text-xs text-blue-900 font-medium animate-pulse">
              <span className="material-symbols-outlined text-blue-600 text-[16px]">edit_note</span>
              <span>{isTypingStatus}</span>
              <span className="flex items-center gap-0.5 ml-1">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          )}

          {/* Pinned Announcement Header */}
          {chatMessages.some((m) => m.channelId === activeChannelId && m.isPinned) && (
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-sm flex items-center justify-between text-xs text-amber-950 shadow-2xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">push_pin</span>
                <span className="font-bold text-[11px] uppercase tracking-wider text-amber-900 shrink-0">Pinned Announcement:</span>
                <span className="truncate italic">
                  "{chatMessages.find((m) => m.channelId === activeChannelId && m.isPinned)?.content}"
                </span>
              </div>
              <span className="text-[10px] text-amber-700 font-semibold shrink-0">
                by {chatMessages.find((m) => m.channelId === activeChannelId && m.isPinned)?.sender}
              </span>
            </div>
          )}

          {/* Main Chat Layout: Sidebar Channels & Main Message View */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            {/* Left Channel Sidebar */}
            <div className="md:col-span-1 bg-white border border-slate-200/80 rounded-sm p-3 space-y-4 shadow-2xs">
              {/* Project Filter Selector */}
              <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-blue-600">folder_open</span>
                    Project Context
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-xs bg-blue-100 text-blue-800 font-bold">
                    {projects ? projects.length : 0} Projects
                  </span>
                </div>
                <select
                  value={selectedProjectCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setSelectedProjectCode(code);
                    if (code !== 'ALL') {
                      const prjChan = channels.find((c) => c.projectCode === code);
                      if (prjChan) setActiveChannelId(prjChan.id);
                      showToast(`Filtered chat context to project ${code}`);
                    } else {
                      showToast('Showing all PMO chat channels');
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xs p-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                >
                  <option value="ALL">All Projects (PMO Central)</option>
                  {projects?.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code}: {p.name} ({p.gate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Public Channels */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Project Channels
                  </span>
                  <button
                    onClick={() => setIsCreateChannelOpen(true)}
                    className="text-slate-400 hover:text-blue-600 p-0.5 transition-colors flex items-center gap-0.5 text-[10px] font-bold"
                    title="Add New Project Channel"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>New</span>
                  </button>
                </div>
                <div className="space-y-1 max-h-[220px] overflow-y-auto">
                  {channels
                    .filter((c) => c.type === 'channel')
                    .filter((c) => {
                      if (selectedProjectCode === 'ALL') return true;
                      return c.projectCode === selectedProjectCode || c.id === 'ch-general';
                    })
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveChannelId(c.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xs font-semibold text-xs flex justify-between items-center transition-colors ${
                          activeChannelId === c.id
                            ? 'bg-[#00174b] text-white shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate flex items-center gap-1">
                          <span className="font-mono text-[13px]">#</span>
                          <span>{c.name}</span>
                        </span>
                        {c.projectCode && selectedProjectCode === 'ALL' && (
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded-xs bg-slate-200 text-slate-700 font-bold shrink-0">
                            {c.projectCode}
                          </span>
                        )}
                        {c.unreadCount > 0 && activeChannelId !== c.id && (
                          <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                            {c.unreadCount}
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              </div>

              {/* Direct Messages */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Team Members (DMs)
                </span>
                <div className="space-y-1">
                  {channels
                    .filter((c) => c.type === 'dm')
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveChannelId(c.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xs font-semibold text-xs flex items-center justify-between transition-colors ${
                          activeChannelId === c.id
                            ? 'bg-[#00174b] text-white shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="relative shrink-0">
                            <img
                              src={c.avatar}
                              alt={c.name}
                              className="w-5 h-5 rounded-full object-cover border border-slate-200"
                            />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                                c.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            ></span>
                          </div>
                          <span className="truncate">{c.name}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono shrink-0">{c.roleTitle?.split(' ')[0]}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Active Persona Banner */}
              <div className="pt-2 border-t border-slate-200 bg-slate-50 p-2 rounded-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active User Persona</span>
                <div className="flex items-center gap-2">
                  <img
                    src={currentPersona?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                    alt="Persona"
                    className="w-6 h-6 rounded-full border border-slate-300 object-cover"
                  />
                  <div className="truncate">
                    <span className="font-bold text-slate-900 text-[11px] block truncate">
                      {currentPersona ? currentPersona.name : 'Sarah Jenkins'}
                    </span>
                    <span className="text-[9px] text-slate-500 block truncate">
                      {currentPersona ? currentPersona.roleTitle : 'PMO Executive Director'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Main Telegram Chat Panel */}
            <div className="md:col-span-3 bg-white border border-slate-200/80 rounded-sm shadow-2xs flex flex-col h-[620px]">
              {/* Message Feed Scroll Box */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-100/60">
                {chatMessages
                  .filter((m) => m.channelId === activeChannelId)
                  .filter((m) =>
                    chatSearch
                      ? m.content.toLowerCase().includes(chatSearch.toLowerCase()) || m.sender.toLowerCase().includes(chatSearch.toLowerCase())
                      : true
                  ).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                    <span className="material-symbols-outlined text-4xl text-slate-300">chat_bubble_outline</span>
                    <p>No messages in this chat yet. Start the conversation!</p>
                  </div>
                ) : (
                  chatMessages
                    .filter((m) => m.channelId === activeChannelId)
                    .filter((m) =>
                      chatSearch
                        ? m.content.toLowerCase().includes(chatSearch.toLowerCase()) || m.sender.toLowerCase().includes(chatSearch.toLowerCase())
                        : true
                    )
                    .map((m) => {
                      const isSelf = m.sender === (currentPersona ? currentPersona.name : 'Sarah Jenkins');

                      return (
                        <div
                          key={m.id}
                          className={`group flex items-start gap-3 relative transition-all ${
                            isSelf ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          {/* Avatar */}
                          <img
                            src={m.avatar}
                            alt={m.sender}
                            className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0 mt-1 shadow-2xs"
                          />

                          {/* Message Bubble Box */}
                          <div
                            className={`max-w-[80%] rounded-md p-3 space-y-1.5 shadow-2xs border relative ${
                              isSelf
                                ? 'bg-slate-900 text-white border-slate-800 rounded-tr-none'
                                : 'bg-white text-slate-900 border-slate-200/90 rounded-tl-none'
                            }`}
                          >
                            {/* Header: Sender & Role */}
                            <div className="flex items-center justify-between gap-3 text-[11px] pb-1 border-b border-slate-200/20">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className={`font-bold ${isSelf ? 'text-blue-300' : 'text-slate-900'}`}>
                                  {m.sender}
                                </span>
                                <span
                                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded-xs border ${
                                    isSelf
                                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}
                                >
                                  {m.senderRole}
                                </span>
                              </div>
                            </div>

                            {/* Telegram Quoted Reply Block */}
                            {m.replyTo && (
                              <div
                                onClick={() => showToast(`Quoted message from ${m.replyTo?.sender}`)}
                                className={`p-2 rounded-xs text-[11px] border-l-4 cursor-pointer transition-colors ${
                                  isSelf
                                    ? 'bg-slate-800/90 border-blue-400 text-slate-200 hover:bg-slate-800'
                                    : 'bg-blue-50 border-blue-600 text-slate-800 hover:bg-blue-100/70'
                                }`}
                              >
                                <span className="font-bold text-blue-500 block text-[10px]">
                                  ↩ {m.replyTo.sender}
                                </span>
                                <span className="italic line-clamp-1 opacity-90">{m.replyTo.content}</span>
                              </div>
                            )}

                            {/* Voice Note Player */}
                            {m.isVoiceNote ? (
                              <div className="flex items-center gap-3 bg-blue-900/30 p-2 rounded-xs border border-blue-800/50">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPlayingAudioId(playingAudioId === m.id ? null : m.id);
                                    showToast(playingAudioId === m.id ? 'Paused voice note' : 'Playing Telegram voice note (0:18)...');
                                  }}
                                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-2xs shrink-0 transition-transform active:scale-95"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    {playingAudioId === m.id ? 'pause' : 'play_arrow'}
                                  </span>
                                </button>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-0.5 h-4">
                                    {[30, 60, 40, 80, 50, 90, 70, 40, 60, 100, 50, 30, 70, 90, 40].map((h, idx) => (
                                      <span
                                        key={idx}
                                        style={{ height: `${h}%` }}
                                        className={`w-0.5 rounded-full transition-all ${
                                          playingAudioId === m.id ? 'bg-blue-400 animate-pulse' : 'bg-slate-400/60'
                                        }`}
                                      ></span>
                                    ))}
                                  </div>
                                  <div className="flex justify-between items-center text-[9px] font-mono opacity-80">
                                    <span>{m.voiceDuration || '0:18'}</span>
                                    <span>Voice Note</span>
                                  </div>
                                </div>
                              </div>
                            ) : m.isCodeSnippet ? (
                              <pre className="bg-slate-950 text-emerald-400 p-2.5 rounded-xs font-mono text-[11px] overflow-x-auto border border-slate-800">
                                <code>{m.content}</code>
                              </pre>
                            ) : (
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>
                            )}

                            {/* Reactions Display */}
                            {m.reactions && m.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {m.reactions.map((r, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleAddReaction(m.id, r.emoji)}
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-colors ${
                                      isSelf
                                        ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-blue-50'
                                    }`}
                                    title={`Reacted by: ${r.users.join(', ')}`}
                                  >
                                    <span>{r.emoji}</span>
                                    <span>{r.count}</span>
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Message Footer: Timestamp & Telegram Checkmarks */}
                            <div className="flex items-center justify-end gap-1.5 text-[9px] opacity-75 font-mono pt-1">
                              <span>{m.timestamp}</span>
                              {isSelf && (
                                <span className="text-blue-400 font-bold tracking-tighter" title="Read by team">
                                  ✓✓
                                </span>
                              )}
                            </div>

                            {/* Telegram Hover Toolbar */}
                            <div
                              className={`opacity-0 group-hover:opacity-100 transition-opacity absolute -top-3 ${
                                isSelf ? 'left-2' : 'right-2'
                              } bg-white border border-slate-300 rounded-xs shadow-md p-1 flex items-center gap-1 text-xs text-slate-700 z-10`}
                            >
                              <button
                                onClick={() => {
                                  setReplyingToMessage(m);
                                  showToast(`Replying to ${m.sender}'s message`);
                                }}
                                className="hover:bg-slate-100 p-1 rounded-xs flex items-center gap-0.5 text-blue-700 font-bold"
                                title="Reply (Telegram style)"
                              >
                                <span className="material-symbols-outlined text-[14px]">reply</span>
                                <span className="text-[10px]">Reply</span>
                              </button>
                              {['👍', '🔥', '✅', '⚡', '🎉', '❤️'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleAddReaction(m.id, emoji)}
                                  className="hover:bg-slate-100 p-1 rounded-xs transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                              <button
                                onClick={() => handleTogglePin(m.id)}
                                className={`p-1 rounded-xs transition-colors ${
                                  m.isPinned ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-800'
                                }`}
                                title={m.isPinned ? 'Unpin message' : 'Pin message'}
                              >
                                <span className="material-symbols-outlined text-[14px]">push_pin</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Telegram Input Form */}
              <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-200 space-y-2">
                {/* Quoted Reply Preview Box */}
                {replyingToMessage && (
                  <div className="bg-blue-50 border border-blue-200 p-2 rounded-xs flex items-center justify-between text-xs text-blue-950">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-1 h-8 bg-blue-600 rounded-full shrink-0"></div>
                      <div className="truncate">
                        <span className="font-bold text-blue-900 block text-[11px]">
                          Replying to {replyingToMessage.sender}
                        </span>
                        <span className="text-[10px] text-slate-600 truncate block">
                          "{replyingToMessage.content}"
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyingToMessage(null)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                      title="Cancel Reply"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}

                {/* Quick Emoji Toolbar */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto pb-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 mr-1 shrink-0">Quick Emojis:</span>
                  {['👍', '🔥', '✅', '⚡', '🎉', '🚀', '❤️', '💡', '💯'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setChatInput((prev) => prev + ' ' + emoji)}
                      className="hover:bg-slate-100 p-1 rounded-xs text-sm transition-transform active:scale-125 shrink-0"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Textarea Input & Send Controls */}
                <div className="flex items-end gap-2">
                  <textarea
                    rows={2}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage(e);
                      }
                    }}
                    placeholder={`Message ${activeChannel.type === 'channel' ? '#' + activeChannel.name : '@' + activeChannel.name}... (Press Enter to send)`}
                    className="flex-1 border border-slate-300 rounded-xs p-2.5 text-xs outline-none focus:border-blue-600 resize-none font-sans"
                  />

                  {/* Voice Note Record Button */}
                  <button
                    type="button"
                    onClick={handleSendVoiceNote}
                    className="p-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xs border border-slate-300 flex items-center justify-center transition-colors shrink-0"
                    title="Send Telegram Voice Note"
                  >
                    <span className="material-symbols-outlined text-[20px]">mic</span>
                  </button>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="px-5 py-3 bg-[#00174b] text-white font-bold text-xs rounded-xs hover:bg-indigo-950 flex flex-col items-center justify-center gap-0.5 shadow-2xs transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Send</span>
                  </button>
                </div>

                {/* Bottom Input Options */}
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 cursor-pointer hover:text-slate-800">
                      <input
                        type="checkbox"
                        checked={isCodeSnippet}
                        onChange={(e) => setIsCodeSnippet(e.target.checked)}
                        className="rounded-xs border-slate-300"
                      />
                      <span className="font-mono text-[10px] font-bold">Code Snippet Mode</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => showToast('File attachment picker opened (Images, Logs, Documents)')}
                      className="hover:text-blue-600 flex items-center gap-0.5 font-medium"
                    >
                      <span className="material-symbols-outlined text-[14px]">attach_file</span>
                      <span>Attach Media</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400">Shift+Enter for newline</span>
                </div>
              </form>
            </div>
          </div>

          {/* ========================================================= */}
          {/* PM EXTRACT CHAT NOTES MODAL */}
          {/* ========================================================= */}
          {showExtractModal && extractedDraft && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white border border-slate-300 rounded-md shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-2xl">auto_awesome</span>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        Extract PM Chat Notes &amp; Action Items
                      </h3>
                      <p className="text-xs text-slate-500">
                        AI-assisted extraction from chat log <strong className="text-slate-800">{extractedDraft.channelName}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowExtractModal(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Executive Summary */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                      Executive Summary Digest
                    </label>
                    <textarea
                      rows={2}
                      value={extractedDraft.executiveSummary}
                      onChange={(e) => setExtractedDraft({ ...extractedDraft, executiveSummary: e.target.value })}
                      className="w-full border border-slate-300 rounded-sm p-2 text-xs font-sans outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Key Decisions */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                      Key Team Decisions ({extractedDraft.keyDecisions.length})
                    </label>
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xs border border-slate-200">
                      {extractedDraft.keyDecisions.map((dec, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-800 font-medium">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{dec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extracted Action Items */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                      Extracted Action Items &amp; Member Assignments
                    </label>
                    <div className="space-y-2">
                      {extractedDraft.actionItems.map((act, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 p-2.5 rounded-xs flex items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs uppercase ${
                                act.priority === 'High' ? 'bg-red-100 text-red-900 border border-red-200' : 'bg-blue-100 text-blue-900 border border-blue-200'
                              }`}
                            >
                              {act.priority}
                            </span>
                            <span className="text-slate-800 font-medium">{act.task}</span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 shrink-0">
                            @{act.assignee}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Raw Chat Excerpt Context */}
                  <div>
                    <span className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                      Raw Chat Log Excerpt:
                    </span>
                    <p className="bg-slate-100 p-2 rounded-xs font-mono text-[10px] text-slate-600 truncate border border-slate-200">
                      {extractedDraft.rawChatExcerpt}
                    </p>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowExtractModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-sm"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmSaveExtractedNote(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-sm"
                    >
                      Save to Vault Only
                    </button>

                    <button
                      type="button"
                      onClick={() => handleConfirmSaveExtractedNote(true)}
                      className="px-4 py-2 bg-[#00174b] hover:bg-indigo-950 text-white font-bold rounded-sm flex items-center gap-1.5 shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">campaign</span>
                      <span>Save &amp; Publish to Executive Bulletin</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PM EXTRACTED NOTES VAULT DRAWER */}
          {/* ========================================================= */}
          {showNotesDrawer && (
            <div className="bg-slate-900 text-slate-100 p-5 rounded-sm shadow-xl space-y-4 border border-slate-800 animate-slideDown">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400">inventory_2</span>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">
                    PM Extracted Notes Vault &amp; Historical Digests ({extractedNotes.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowNotesDrawer(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extractedNotes.map((note) => (
                  <div key={note.id} className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-xs mr-2">
                          {note.channelName}
                        </span>
                        <h4 className="inline font-bold text-xs text-white">{note.summaryTitle}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Extracted by {note.extractedBy} • {note.extractedAt}
                        </p>
                      </div>

                      {note.publishedToDiscussion && (
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-xs font-bold uppercase">
                          Published
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xs border border-slate-800">
                      {note.executiveSummary}
                    </p>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Assigned Action Items:
                      </span>
                      {note.actionItems.map((act, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] text-slate-200 bg-slate-900/40 px-2 py-1 rounded-xs">
                          <span>• {act.task}</span>
                          <span className="font-bold text-amber-400 text-[10px]">@{act.assignee}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 3: CALENDAR & MEETINGS */}
      {/* ========================================================= */}
      {subTab === 'calendar' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded-sm shadow-2xs">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">event</span>
                Governance Meetings &amp; Calendar Schedule
              </h3>
              <p className="text-xs text-slate-500">Steering committee sessions, stage-gate reviews, and team standups.</p>
            </div>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 bg-[#00174b] text-white font-bold text-xs rounded-sm hover:bg-indigo-950 flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">event_available</span>
              <span>Schedule Meeting</span>
            </button>
          </div>

          {/* Meetings List */}
          <div className="space-y-4">
            {meetings.map((m) => (
              <div key={m.id} className="bg-white border border-slate-200/80 p-5 rounded-sm shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase bg-blue-100 text-blue-900 px-2 py-0.5 rounded-xs mr-2">
                      {m.status}
                    </span>
                    <h3 className="inline text-base font-bold text-slate-900">{m.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-blue-600">calendar_today</span>
                        {m.date} ({m.time})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                        {m.location}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => showToast(`Generated AI summary for "${m.title}"`)}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 font-bold text-xs rounded-xs flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber-500">auto_awesome</span>
                    <span>AI Minutes</span>
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xs border border-slate-200/60 text-xs">
                  <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Agenda &amp; Objective:</p>
                  <p className="text-slate-800">{m.agenda}</p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-700">Attendees ({m.attendees.length}):</span>
                  {m.attendees.map((att, i) => (
                    <span key={i} className="bg-slate-100 px-2 py-0.5 rounded-xs font-medium text-slate-700">
                      {att}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Schedule Meeting Modal */}
          {showScheduleModal && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white border border-slate-300 rounded-md shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scaleUp">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">event_available</span>
                    Schedule New Governance Meeting
                  </h3>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={handleScheduleMeetingSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Meeting Title *</label>
                    <input
                      type="text"
                      required
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      placeholder="e.g. Gate 3 Review & Portfolio Strategy"
                      className="w-full border border-slate-300 rounded-sm p-2 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        min={getLocalToday()}
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="w-full border border-slate-300 rounded-sm p-2 outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Time</label>
                      <input
                        type="text"
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                        placeholder="10:00 AM - 11:30 AM"
                        className="w-full border border-slate-300 rounded-sm p-2 outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Location / Video Room</label>
                    <input
                      type="text"
                      value={meetingLocation}
                      onChange={(e) => setMeetingLocation(e.target.value)}
                      placeholder="Executive Boardroom A or Virtual Google Meet Link"
                      className="w-full border border-slate-300 rounded-sm p-2 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Agenda &amp; Focus Area</label>
                    <textarea
                      rows={3}
                      value={meetingAgenda}
                      onChange={(e) => setMeetingAgenda(e.target.value)}
                      placeholder="Specify gate review criteria, budget sign-off items, or technical blockages..."
                      className="w-full border border-slate-300 rounded-sm p-2 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#00174b] text-white font-bold rounded-sm hover:bg-indigo-950"
                    >
                      Schedule Meeting
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 3: NOTIFICATIONS (NESTED UNDER COMMUNICATION) */}
      {/* ========================================================= */}
      {subTab === 'notifications' && (
        <div className="space-y-6 max-w-4xl">
          <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-3 gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600">notifications</span>
                System Alerts &amp; Telemetry Feed
              </h3>
              <p className="text-xs text-slate-500">Live notifications for task completions, risk escalations, and project approvals.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onMarkAllNotificationsRead}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-sm transition-colors"
              >
                Mark All as Read
              </button>
              <button
                onClick={onClearNotifications}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-sm transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setNotificationFilter('all')}
              className={`px-3 py-1.5 rounded-xs transition-colors ${
                notificationFilter === 'all' ? 'bg-[#00174b] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setNotificationFilter('unread')}
              className={`px-3 py-1.5 rounded-xs transition-colors ${
                notificationFilter === 'unread' ? 'bg-[#00174b] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setNotificationFilter('alert')}
              className={`px-3 py-1.5 rounded-xs transition-colors ${
                notificationFilter === 'alert' ? 'bg-[#00174b] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Critical Alerts
            </button>
          </div>

          {/* List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-sm text-slate-400 text-xs">
                No notifications found in this view.
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 bg-white border border-slate-200/80 rounded-sm shadow-2xs flex items-start justify-between gap-4 transition-all ${
                    !n.isRead ? 'border-l-4 border-l-blue-600 bg-blue-50/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`material-symbols-outlined text-[20px] mt-0.5 ${
                        n.type === 'alert'
                          ? 'text-red-600'
                          : n.type === 'warning'
                          ? 'text-amber-500'
                          : n.type === 'success'
                          ? 'text-emerald-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {n.type === 'alert'
                        ? 'error'
                        : n.type === 'warning'
                        ? 'warning'
                        : n.type === 'success'
                        ? 'check_circle'
                        : 'info'}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                      <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">{n.timestamp}</span>
                    </div>
                  </div>

                  {!n.isRead && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold text-[10px] rounded-xs shrink-0">
                      NEW
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 4: FILE SHARING & DOCUMENT VAULT */}
      {/* ========================================================= */}
      {subTab === 'files' && (
        <div className="space-y-6">
          {/* File Drag-and-Drop / Upload Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`bg-white border-2 border-dashed ${
              isDragOver ? 'border-blue-600 bg-blue-50/50' : 'border-slate-300'
            } p-6 rounded-sm text-center transition-all cursor-pointer`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-4xl text-blue-600">cloud_upload</span>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Drag &amp; drop files here, or click to browse</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Share project charters, architectural blueprints, financial spreadsheets, or gate review PDFs.
                </p>
              </div>
              <button
                type="button"
                className="mt-2 px-4 py-1.5 bg-[#00174b] text-white font-bold text-xs rounded-sm hover:bg-indigo-950 uppercase tracking-wider"
              >
                Upload File
              </button>
            </div>
          </div>

          {/* Search & Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-sm shadow-2xs">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">folder_shared</span>
              Communication File Repository ({filteredDocs.length} Documents)
            </h3>

            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={documentSearch}
                onChange={(e) => setDocumentSearch(e.target.value)}
                placeholder="Search files, types, authors..."
                className="w-full bg-slate-50 border border-slate-300 rounded-sm pl-8 pr-3 py-1.5 text-xs outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white border border-slate-200/80 rounded-sm overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6] text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80">
                  <th className="px-6 py-3">Document Name</th>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">File Type</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Uploaded Date</th>
                  <th className="px-6 py-3">Uploaded By</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 font-sans">
                {filteredDocs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#191c1e] flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-[18px]">
                        {d.type.includes('PDF')
                          ? 'picture_as_pdf'
                          : d.type.includes('Spreadsheet')
                          ? 'table_chart'
                          : d.type.includes('Architecture')
                          ? 'schema'
                          : 'description'}
                      </span>
                      <span>{d.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-xs">
                        {d.projectCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{d.type}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{d.size}</td>
                    <td className="px-6 py-4 text-slate-600">{d.date}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{d.author}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => showToast(`Downloading document: ${d.title}`)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] rounded-xs uppercase tracking-wider inline-flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">download</span>
                        <span>Download</span>
                      </button>
                      {(currentPersona?.roleType === 'EXECUTIVE_MANAGER' || d.author === currentPersona?.name) && (
                        <button
                          onClick={() => handleDeleteDocument(d.id)}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] rounded-xs uppercase tracking-wider inline-flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          <span>Delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE NEW PROJECT CHANNEL */}
      {/* ========================================================= */}
      {isCreateChannelOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-[#00174b]">
                <span className="material-symbols-outlined text-2xl">add_box</span>
                <h3 className="font-bold text-base text-slate-900">Create New Project Channel</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateChannelOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xs"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNewChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Channel Name <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1 border border-slate-300 rounded-xs px-2.5 py-1.5 focus-within:border-blue-600 bg-slate-50">
                  <span className="font-mono text-slate-400 font-bold text-sm">#</span>
                  <input
                    type="text"
                    required
                    value={newChannelNameInput}
                    onChange={(e) => setNewChannelNameInput(e.target.value)}
                    placeholder="e.g. prj-delta-qa-sprint"
                    className="w-full bg-transparent text-xs font-semibold outline-none text-slate-900"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Will be automatically formatted with dashes.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Associate With Project
                </label>
                <select
                  value={newChannelProjectCode}
                  onChange={(e) => setNewChannelProjectCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs p-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                >
                  <option value="">-- General / Company Wide --</option>
                  {projects?.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code}: {p.name} ({p.owner})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Channel Topic &amp; Description
                </label>
                <textarea
                  rows={2}
                  value={newChannelDescInput}
                  onChange={(e) => setNewChannelDescInput(e.target.value)}
                  placeholder="Describe the purpose of this project channel..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs p-2 text-xs outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateChannelOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00174b] hover:bg-indigo-950 text-white font-bold text-xs rounded-xs shadow-2xs transition-all"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
