import React, { useState, useEffect, useRef } from 'react';
import {
  Globe, Search, AlertCircle, AlertTriangle, CheckCircle2,
  Download, ExternalLink, ShieldCheck, Zap,
  BarChart2, FileText, Image as ImageIcon, Link2, Code,
  Eye, RefreshCw, Layers, Check, Sparkles, Sliders, Smartphone,
  Monitor, Award, ListFilter, ArrowUpDown, ChevronRight, X,
  FolderTree, CornerDownRight, CheckCircle, Database, FileSpreadsheet,
  Settings2, Hash, FileCode, Copy, CheckCheck, Terminal,
  Radio, Play, Square, Pause, ChevronDown, ChevronUp, Cpu,
  User, Lock, Mail, Calendar, Clock, History as HistoryIcon,
  Bot, PlayCircle, PauseCircle, Trash2, LogIn, LogOut, UserCheck, Bell, Shield,
  LayoutDashboard, HelpCircle, MoreVertical, SlidersHorizontal, ArrowUpRight,
  DownloadCloud, Workflow, Compass, AlertOctagon, Info
} from 'lucide-react';

// =============================================================
// SVG Donut Chart Component (Ahrefs Circular Gauge)
// =============================================================
function DonutChart({ segments = [], size = 120, strokeWidth = 18, centerLabel = '' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0) || 1;

  let accumulatedPercent = 0;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#262c36"
          strokeWidth={strokeWidth}
        />
        {segments.map((seg, idx) => {
          const val = Number(seg.value) || 0;
          const strokeDash = (val / total) * circumference;
          const strokeOffset = (accumulatedPercent / 100) * circumference;
          accumulatedPercent += (val / total) * 100;

          if (val === 0) return null;

          return (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeDashoffset={-strokeOffset}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          );
        })}
      </svg>
      {centerLabel && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
          {centerLabel}
        </div>
      )}
    </div>
  );
}

// =============================================================
// Semi-Circle Health Score Gauge (Ahrefs Style)
// =============================================================
function SemiCircleGauge({ score = 96, size = 220 }) {
  const clampedScore = Math.max(0, Math.min(100, Number(score) || 0));
  const strokeWidth = 22;

  const statusLabel = clampedScore >= 90 ? 'Excellent' : clampedScore >= 75 ? 'Good' : clampedScore >= 50 ? 'Fair' : 'Needs Work';
  const statusColor = clampedScore >= 90 ? '#10b981' : clampedScore >= 75 ? '#38bdf8' : clampedScore >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div style={{ width: size, height: size * 0.55, overflow: 'hidden', position: 'relative' }}>
        <svg width={size} height={size} viewBox="0 0 200 200">
          <defs>
            <linearGradient id="ahrefsGaugeGrad" x1="0%" y1="100%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          {/* Background Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#262c36"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Gradient Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#ahrefsGaugeGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${(clampedScore / 100) * 251.3} 251.3`}
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>

        {/* Center Big Number */}
        <div style={{ position: 'absolute', bottom: '0px', left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#ffffff', lineHeight: 1 }}>
            {clampedScore}
          </div>
          <div style={{ marginTop: '4px' }}>
            <span style={{
              background: statusColor,
              color: '#000',
              padding: '2px 10px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {statusLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [urlInput, setUrlInput] = useState('https://www.cocoonfurnishings.ca/sitemap.xml');
  const [crawlMode, setCrawlMode] = useState('sitemap'); // 'site', 'sitemap', 'single'
  const [maxPages, setMaxPages] = useState(250);
  const [customPagesInput, setCustomPagesInput] = useState('');
  const [maxDepth, setMaxDepth] = useState(4);
  const [loading, setLoading] = useState(false);
  const [siteData, setSiteData] = useState(null);
  const [singleData, setSingleData] = useState(null);
  const [selectedPageModal, setSelectedPageModal] = useState(null);
  const [selectedIssueModal, setSelectedIssueModal] = useState(null);
  const [issueUrlSearch, setIssueUrlSearch] = useState('');
  const [modalImgTab, setModalImgTab] = useState('missing'); // 'missing' or 'all'
  const [error, setError] = useState(null);
  
  // Navigation: 'overview', 'all-issues', 'missing-alts', 'page-explorer', 'discovered-urls', 'ahrefs-metrics', 'crawl-log'
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewSubTab, setOverviewSubTab] = useState('whats-new'); // 'whats-new' or 'top-issues'

  const [urlSearchFilter, setUrlSearchFilter] = useState('');
  const [discoveredSearchFilter, setDiscoveredSearchFilter] = useState('');
  const [missingAltSearchFilter, setMissingAltSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Issues Filter State (Ahrefs Standard Suite)
  const [issueSeverityFilter, setIssueSeverityFilter] = useState('all'); // 'all', 'Critical', 'Warning', 'Passed'
  const [issueCategoryFilter, setIssueCategoryFilter] = useState('all');
  const [issueSearchFilter, setIssueSearchFilter] = useState('');

  // Live Checkmark & Resolution Verification State
  const [urlVerificationStatus, setUrlVerificationStatus] = useState({});
  const [imageVerificationStatus, setImageVerificationStatus] = useState({});
  const [issueVerificationStatus, setIssueVerificationStatus] = useState({});
  const [recheckingModalUrl, setRecheckingModalUrl] = useState(false);

  // USER AUTHENTICATION STATE
  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(null); // 'login', 'register', or null
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '', isRegister: false });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // AUTOMATIC AUDIT HISTORY STATE
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [savedHistoryList, setSavedHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // AUTO-CRAWL & SCHEDULES STATE
  const [schedulesModalOpen, setSchedulesModalOpen] = useState(false);
  const [schedulesList, setSchedulesList] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [newScheduleForm, setNewScheduleForm] = useState({
    name: '',
    targetUrl: 'https://www.cocoonfurnishings.ca/sitemap.xml',
    frequency: '24h',
    maxPages: 250,
    maxDepth: 4
  });

  // Live AJAX / SSE Progress & Log State
  const [progressState, setProgressState] = useState({
    percent: 0,
    currentCrawled: 0,
    targetLimit: 250,
    totalDiscovered: 0,
    currentUrl: '',
    activeWorkers: 0
  });
  const [crawlLogs, setCrawlLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('all'); // 'all', 'error', 'success'
  const [autoScroll, setAutoScroll] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const logContainerRef = useRef(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('seo_pro_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    } catch (e) {}

    fetchSavedHistory();
    fetchSchedules();
  }, []);

  // Central Navigation & URL Routing System (Deep-Linking)
  const navigateTo = (tab, options = {}) => {
    setActiveTab(tab);
    let path = `/${tab}`;
    if (tab === 'overview') path = '/overview';
    if (tab === 'discovered-urls') path = '/link-explorer';

    if (options.category) {
      setIssueCategoryFilter(options.category);
      const catSlug = options.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
      path = `/reports/${catSlug}`;
    }
    if (options.issue) {
      setSelectedIssueModal(options.issue);
      path = `/issue?title=${encodeURIComponent(options.issue.title)}`;
    }
    if (options.pageUrl) {
      path = `/inspect?url=${encodeURIComponent(options.pageUrl)}`;
    }

    try {
      if (window.location.pathname + window.location.search !== path) {
        window.history.pushState(null, '', path);
      }
    } catch (e) {}
  };

  // Synchronize Browser Address Bar & Handle Deep-Links / Back-Forward Navigation
  useEffect(() => {
    const handleUrlRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);

      if (pathname === '/all-issues' || pathname.startsWith('/all-issues')) {
        setActiveTab('all-issues');
      } else if (pathname === '/page-explorer' || pathname === '/pages') {
        setActiveTab('page-explorer');
      } else if (pathname === '/missing-alts' || pathname === '/images') {
        setActiveTab('missing-alts');
      } else if (pathname === '/link-explorer' || pathname === '/links' || pathname === '/discovered-urls') {
        setActiveTab('discovered-urls');
      } else if (pathname === '/structure-explorer' || pathname === '/structure') {
        setActiveTab('structure-explorer');
      } else if (pathname === '/crawl-log' || pathname === '/logs') {
        setActiveTab('crawl-log');
      } else if (pathname.startsWith('/reports/')) {
        const reportSlug = pathname.replace('/reports/', '');
        const reportMap = {
          'internal-pages': 'Internal pages',
          'internal': 'Internal pages',
          'indexability': 'Indexability',
          'links': 'Links',
          'redirects': 'Redirects',
          'content': 'Content',
          'social-tags': 'Social tags',
          'social': 'Social tags',
          'duplicates': 'Duplicates',
          'performance': 'Performance',
          'images': 'Images',
          'external-pages': 'External pages',
          'external': 'External pages'
        };
        const matchedCategory = reportMap[reportSlug];
        setActiveTab('all-issues');
        if (matchedCategory) setIssueCategoryFilter(matchedCategory);
      } else if (pathname === '/issue') {
        const issueTitle = params.get('title');
        if (issueTitle && siteData?.aggregateIssues) {
          const found = siteData.aggregateIssues.find(i => i.title.toLowerCase() === issueTitle.toLowerCase());
          if (found) setSelectedIssueModal(found);
        }
      } else if (pathname === '/inspect') {
        const pageUrl = params.get('url');
        if (pageUrl && siteData?.pages) {
          const foundP = siteData.pages.find(p => p.url === pageUrl);
          if (foundP) setSelectedPageModal(foundP);
        }
      } else if (pathname === '/history') {
        setHistoryModalOpen(true);
      } else if (pathname === '/schedules') {
        setSchedulesModalOpen(true);
      } else {
        // Default to overview for '/' or '/overview'
        setActiveTab('overview');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [siteData]);

  // Auto-scroll logs
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [crawlLogs, autoScroll]);

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Live Checkmark Resolution Handlers
  const verifyAndResolveUrl = async (targetUrl, e) => {
    if (e) e.stopPropagation();
    
    setUrlVerificationStatus(prev => ({
      ...prev,
      [targetUrl]: { status: 'checking', message: 'Running live audit check...' }
    }));

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to audit URL');

      const isStillBroken = data.isBroken || data.statusCode >= 400;
      const criticalCount = (data.issues || []).filter(i => i.severity === 'Critical').length;

      if (!isStillBroken && criticalCount === 0) {
        setUrlVerificationStatus(prev => ({
          ...prev,
          [targetUrl]: {
            status: 'completed',
            lastChecked: new Date().toLocaleTimeString(),
            message: `✓ Resolved! HTTP ${data.statusCode} (${data.responseTimeMs}ms) - Score: ${data.score}%`
          }
        }));
      } else {
        setUrlVerificationStatus(prev => ({
          ...prev,
          [targetUrl]: {
            status: 'still_error',
            lastChecked: new Date().toLocaleTimeString(),
            message: `❌ Still Error: HTTP ${data.statusCode} - ${criticalCount} critical issues remain (Score: ${data.score}%)`
          }
        }));
      }

      if (siteData && siteData.pages) {
        setSiteData(prev => {
          if (!prev) return prev;
          const updatedPages = prev.pages.map(p => p.url === targetUrl ? { ...p, ...data } : p);
          return {
            ...prev,
            pages: updatedPages
          };
        });
      }

      if (selectedPageModal && selectedPageModal.url === targetUrl) {
        setSelectedPageModal(data);
      }
    } catch (err) {
      setUrlVerificationStatus(prev => ({
        ...prev,
        [targetUrl]: {
          status: 'still_error',
          lastChecked: new Date().toLocaleTimeString(),
          message: `Check failed: ${err.message}`
        }
      }));
    }
  };

  const verifyAndResolveImageAlt = async (pageUrl, imgSrc, e) => {
    if (e) e.stopPropagation();
    const key = `${pageUrl}::${imgSrc}`;

    setImageVerificationStatus(prev => ({
      ...prev,
      [key]: { status: 'checking', message: 'Checking live <img> tag...' }
    }));

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pageUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch page');

      const foundImage = (data.images?.list || []).find(img => img.src === imgSrc || img.rawSrc === imgSrc || (img.src && imgSrc && imgSrc.endsWith(img.src.split('/').pop())));

      if (foundImage && foundImage.hasAlt && foundImage.alt.trim().length > 0) {
        setImageVerificationStatus(prev => ({
          ...prev,
          [key]: {
            status: 'completed',
            lastChecked: new Date().toLocaleTimeString(),
            message: `✓ ALT fixed! Current value: "${foundImage.alt}"`
          }
        }));
      } else {
        setImageVerificationStatus(prev => ({
          ...prev,
          [key]: {
            status: 'still_error',
            lastChecked: new Date().toLocaleTimeString(),
            message: `❌ ALT tag is still missing or empty on live page.`
          }
        }));
      }
    } catch (err) {
      setImageVerificationStatus(prev => ({
        ...prev,
        [key]: {
          status: 'still_error',
          lastChecked: new Date().toLocaleTimeString(),
          message: `Failed to check: ${err.message}`
        }
      }));
    }
  };

  const verifyAndResolveIssue = async (issueTitle, targetUrl, e) => {
    if (e) e.stopPropagation();
    const key = `${issueTitle}::${targetUrl}`;

    setIssueVerificationStatus(prev => ({
      ...prev,
      [key]: { status: 'checking', message: 'Checking live URL...' }
    }));

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to audit URL');

      const stillExists = (data.issues || []).some(iss => iss.title.toLowerCase() === issueTitle.toLowerCase());

      if (!stillExists) {
        setIssueVerificationStatus(prev => ({
          ...prev,
          [key]: {
            status: 'completed',
            lastChecked: new Date().toLocaleTimeString(),
            message: '✓ Verified Fixed! Issue is resolved.'
          }
        }));
      } else {
        setIssueVerificationStatus(prev => ({
          ...prev,
          [key]: {
            status: 'still_error',
            lastChecked: new Date().toLocaleTimeString(),
            message: '❌ Still Error: Issue is still present on this page.'
          }
        }));
      }
    } catch (err) {
      setIssueVerificationStatus(prev => ({
        ...prev,
        [key]: {
          status: 'still_error',
          lastChecked: new Date().toLocaleTimeString(),
          message: `Verification failed: ${err.message}`
        }
      }));
    }
  };

  // ==========================================
  // AUTHENTICATION HANDLERS
  // ==========================================
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const endpoint = authForm.isRegister ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
          name: authForm.name
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      localStorage.setItem('seo_pro_token', data.token);
      localStorage.setItem('seo_pro_user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setAuthModalOpen(null);
      setAuthForm({ email: '', password: '', name: '', isRegister: false });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('seo_pro_token');
    localStorage.removeItem('seo_pro_user');
    setCurrentUser(null);
  };

  // ==========================================
  // AUTOMATIC HISTORY HANDLERS
  // ==========================================
  const fetchSavedHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSavedHistoryList(data);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadHistorySnapshot = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/history/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load audit snapshot');

      setSiteData(data);
      setSingleData(data.pages?.[0] || null);
      setUrlInput(data.rootUrl || data.domain);
      setHistoryModalOpen(false);
      setActiveTab('overview');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      setSavedHistoryList(prev => prev.filter(h => h.id !== id));
    } catch (e) {}
  };

  // ==========================================
  // AUTO-CRAWL & SCHEDULES HANDLERS
  // ==========================================
  const fetchSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const res = await fetch('/api/schedules');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSchedulesList(data);
      }
    } catch (e) {
      console.error('Failed to load schedules:', e);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const createSchedule = async (e) => {
    e.preventDefault();
    if (!newScheduleForm.targetUrl) return;

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScheduleForm)
      });
      const data = await res.json();
      if (data.success) {
        setSchedulesList(prev => [data.schedule, ...prev]);
        setNewScheduleForm({ name: '', targetUrl: '', frequency: '24h', maxPages: 250, maxDepth: 4 });
      }
    } catch (e) {}
  };

  const toggleSchedule = async (id) => {
    try {
      const res = await fetch(`/api/schedules/${id}/toggle`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setSchedulesList(prev => prev.map(s => s.id === id ? data.schedule : s));
      }
    } catch (e) {}
  };

  const triggerScheduleRunNow = async (id) => {
    try {
      await fetch(`/api/schedules/${id}/run-now`, { method: 'POST' });
      fetchSchedules();
      fetchSavedHistory();
    } catch (e) {}
  };

  const deleteSchedule = async (id) => {
    try {
      await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      setSchedulesList(prev => prev.filter(s => s.id !== id));
    } catch (e) {}
  };

  // ==========================================
  // AUDIT RUNNER & SSE STREAMING
  // ==========================================
  const runAudit = () => {
    if (!urlInput.trim()) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setLoading(true);
    setError(null);
    setCrawlLogs([]);
    setProgressState({
      percent: 0,
      currentCrawled: 0,
      targetLimit: customPagesInput ? parseInt(customPagesInput) : maxPages,
      totalDiscovered: 0,
      currentUrl: urlInput,
      activeWorkers: 15
    });

    if (crawlMode === 'single') {
      fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          setSingleData(data);
          const singleWrapper = {
            domain: data.domain,
            rootUrl: data.url,
            siteHealthScore: data.score,
            siteGrade: data.grade,
            crawlTimestamp: new Date().toISOString(),
            crawlDurationMs: data.responseTimeMs,
            stats: {
              totalPagesCrawled: 1,
              totalDiscoveredUrls: (data.links?.discoveredInternal?.length || 0) + (data.links?.discoveredExternal?.length || 0),
              sitemapUrlsFound: 0,
              totalMissingAltImages: data.images?.missingAlt || 0,
              healthyPages: data.score >= 80 ? 1 : 0,
              warningPages: data.score >= 50 && data.score < 80 ? 1 : 0,
              errorPages: data.score < 50 ? 1 : 0,
              statusCounts: { '200 OK': 1, '3xx Redirects': 0, '4xx Client Errors': 0, '5xx Server Errors': 0 }
            },
            domainMetrics: {
              domainRating: 75,
              backlinks: 12500,
              referringDomains: 420,
              organicTraffic: 85000,
              source: 'Ahrefs Intelligence Heuristic'
            },
            allMissingAltImages: data.images?.missingAltList || [],
            aggregateIssues: data.issues || [],
            allDiscoveredUrls: [{ url: data.url, isCrawled: true, fromSitemap: false }],
            pages: [data]
          };
          setSiteData(singleWrapper);
          setLoading(false);
          setActiveTab('overview');
          fetchSavedHistory();
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
      return;
    }

    const effectivePages = customPagesInput ? parseInt(customPagesInput) : maxPages;
    const isDirectSitemap = crawlMode === 'sitemap' || urlInput.endsWith('.xml') || urlInput.includes('sitemap');
    const params = new URLSearchParams();

    if (isDirectSitemap) {
      params.append('sitemapUrl', urlInput.trim());
    } else {
      params.append('url', urlInput.trim());
    }
    params.append('maxPages', effectivePages);
    params.append('maxDepth', maxDepth);

    const sseUrl = `/api/crawl-stream?${params.toString()}`;
    const sse = new EventSource(sseUrl);
    eventSourceRef.current = sse;

    sse.addEventListener('log', (e) => {
      try {
        const logData = JSON.parse(e.data);
        setCrawlLogs(prev => [...prev.slice(-300), logData]);
      } catch (err) {}
    });

    sse.addEventListener('progress', (e) => {
      try {
        const prog = JSON.parse(e.data);
        setProgressState(prog);
      } catch (err) {}
    });

    sse.addEventListener('complete', (e) => {
      try {
        const report = JSON.parse(e.data);
        setSiteData(report);
        setSingleData(report.pages?.[0] || null);
        setLoading(false);
        setActiveTab('overview');
        fetchSavedHistory();
        sse.close();
      } catch (err) {
        setError('Error parsing final report payload');
        setLoading(false);
        sse.close();
      }
    });

    sse.addEventListener('error', (e) => {
      try {
        const errData = JSON.parse(e.data);
        setError(errData.message || 'Crawl stream encountered an issue');
      } catch (err) {
        if (sse.readyState === EventSource.CLOSED) {
          setLoading(false);
        }
      }
    });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#38bdf8';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const exportMissingAltCSV = () => {
    if (!siteData || !siteData.allMissingAltImages?.length) return;
    const headers = ['Page URL', 'Page Title', 'Image URL', 'Suggested ALT Tag', 'HTML Code Snippet'];
    const rows = siteData.allMissingAltImages.map(img => [
      `"${(img.pageUrl || '').replace(/"/g, '""')}"`,
      `"${(img.pageTitle || '').replace(/"/g, '""')}"`,
      `"${(img.imgSrc || '').replace(/"/g, '""')}"`,
      `"${(img.suggestedAlt || '').replace(/"/g, '""')}"`,
      `"${(img.htmlSnippet || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `missing_image_alts_${siteData.domain || 'report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllPagesCSV = () => {
    if (!siteData || !siteData.pages?.length) return;
    const headers = ['URL', 'Status Code', 'SEO Health Score', 'Grade', 'Title', 'Meta Description', 'Word Count', 'Missing Image ALTs', 'Response Time (ms)', 'H1 Tag'];
    const rows = siteData.pages.map(p => [
      `"${(p.url || '').replace(/"/g, '""')}"`,
      p.statusCode,
      p.score,
      `"${p.grade}"`,
      `"${(p.meta?.title || '').replace(/"/g, '""')}"`,
      `"${(p.meta?.metaDescription || '').replace(/"/g, '""')}"`,
      p.content?.wordCount || 0,
      p.images?.missingAlt || 0,
      p.responseTimeMs,
      `"${(p.headings?.h1?.[0] || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ahrefs_audit_pages_${siteData.domain || 'report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCrawlLogs = crawlLogs.filter(log => {
    if (logFilter === 'all') return true;
    if (logFilter === 'error') return log.level === 'error';
    if (logFilter === 'success') return log.level === 'success';
    return true;
  });

  const effectiveMaxPages = customPagesInput ? parseInt(customPagesInput) : maxPages;

  // ==========================================
  // REAL-TIME LIVE AUDIT OVERVIEW CALCULATIONS
  // ==========================================
  const getDomainSafe = (urlStr) => {
    if (!urlStr) return 'domain.com';
    try {
      let formatted = urlStr.trim();
      if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
        formatted = 'https://' + formatted;
      }
      return new URL(formatted).hostname;
    } catch {
      return urlStr || 'domain.com';
    }
  };

  const activeScore = siteData ? siteData.siteHealthScore : 0;
  const activeDomain = siteData ? siteData.domain : getDomainSafe(urlInput);
  
  // 1. Crawled URLs Distribution (Real Internal, External, and Media Resources)
  const realInternalCount = siteData ? siteData.pages.length : 0;
  const externalSet = new Set();
  if (siteData && siteData.pages) {
    siteData.pages.forEach(p => {
      (p.links?.discoveredExternal || []).forEach(e => externalSet.add(e));
    });
  }
  const realExternalCount = siteData ? (externalSet.size > 0 ? externalSet.size : siteData.pages.reduce((acc, p) => acc + (p.links?.externalCount || 0), 0)) : 0;
  const realResourcesCount = siteData ? siteData.pages.reduce((acc, p) => acc + (p.images?.total || 0), 0) : 0;
  const crawledDist = {
    internal: realInternalCount,
    external: realExternalCount,
    resources: realResourcesCount,
    total: realInternalCount + realExternalCount + realResourcesCount
  };

  // 2. Crawl Status of Links Found (Real Crawled, Discovered, and Error status)
  const realCrawledLinks = siteData ? siteData.pages.length : 0;
  const realTotalDiscovered = siteData ? (siteData.stats?.totalDiscoveredUrls ?? siteData.allDiscoveredUrls?.length ?? realCrawledLinks) : 0;
  const realUncrawledLinks = Math.max(0, realTotalDiscovered - realCrawledLinks);
  const realBlockedOrErrors = siteData ? siteData.pages.filter(p => p.isBroken || p.statusCode >= 400).length : 0;
  const crawlStatusDist = {
    crawled: realCrawledLinks,
    uncrawled: realUncrawledLinks,
    blocked: realBlockedOrErrors,
    total: realTotalDiscovered
  };

  // 3. Issues Distribution (Real Severity Breakdown)
  const issuesDist = {
    errors: siteData ? siteData.aggregateIssues?.filter(i => i.severity === 'Critical').length ?? 0 : 0,
    warnings: siteData ? siteData.aggregateIssues?.filter(i => i.severity === 'Warning').length ?? 0 : 0,
    notices: siteData ? siteData.aggregateIssues?.filter(i => i.severity === 'Passed').length ?? 0 : 0,
    total: siteData ? siteData.aggregateIssues?.length ?? 0 : 0
  };

  // 4. Error Distribution (Real URLs without Critical Errors vs with Errors)
  const realUrlsWithoutErrors = siteData ? siteData.pages.filter(p => !p.isBroken && (p.issues || []).filter(i => i.severity === 'Critical').length === 0).length : 0;
  const realUrlsWithErrors = siteData ? siteData.pages.filter(p => p.isBroken || (p.issues || []).some(i => i.severity === 'Critical')).length : 0;
  const errorDist = {
    withoutErrors: realUrlsWithoutErrors,
    withErrors: realUrlsWithErrors,
    total: realUrlsWithoutErrors + realUrlsWithErrors
  };

  // 5. Real Historical Timeline from Saved Snapshots
  const historyTimeline = (savedHistoryList && savedHistoryList.length > 0)
    ? savedHistoryList.slice(0, 5).reverse().map(h => ({
        date: new Date(h.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        score: h.score || 0
      }))
    : siteData ? [{
        date: new Date(siteData.crawlTimestamp || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        score: siteData.siteHealthScore || 0
      }] : [];

  // 6. Real Issues Table Rows with Exact Real-Time Comparative Diffs
  const previousAudit = (savedHistoryList && savedHistoryList.length > 0)
    ? savedHistoryList.find(h => (h.domain === siteData?.domain || h.rootUrl === siteData?.rootUrl) && h.timestamp !== siteData?.crawlTimestamp)
    : null;

  const prevIssuesMap = {};
  if (previousAudit && previousAudit.aggregateIssues) {
    previousAudit.aggregateIssues.forEach(pi => {
      prevIssuesMap[pi.title] = pi;
    });
  }

  const rawOverviewIssues = siteData ? (siteData.aggregateIssues || []).map(i => {
    const currentUrls = i.affectedUrls || [];
    const prevIssue = prevIssuesMap[i.title];
    const prevUrls = prevIssue ? (prevIssue.affectedUrls || []) : null;

    let changeNum = 0;
    let addedCount = 0;
    let removedCount = 0;
    let isBrandNew = false;

    if (prevUrls !== null) {
      const prevSet = new Set(prevUrls);
      const currSet = new Set(currentUrls);
      addedCount = currentUrls.filter(u => !prevSet.has(u)).length;
      removedCount = prevUrls.filter(u => !currSet.has(u)).length;
      changeNum = currentUrls.length - prevUrls.length;
      isBrandNew = prevUrls.length === 0 && currentUrls.length > 0;
    } else if (previousAudit) {
      addedCount = currentUrls.length;
      changeNum = currentUrls.length;
      removedCount = 0;
      isBrandNew = true;
    } else {
      // First baseline crawl: all issues are new discoveries
      addedCount = currentUrls.length;
      changeNum = currentUrls.length;
      removedCount = 0;
      isBrandNew = false;
    }

    return {
      severity: i.severity,
      category: i.category,
      title: i.title,
      description: i.description,
      recommendation: i.recommendation,
      affectedUrls: currentUrls,
      crawled: currentUrls.length,
      changeNum,
      added: addedCount,
      newCount: isBrandNew ? 1 : '—',
      removed: removedCount > 0 ? removedCount : '—',
      isNew: isBrandNew,
      percentOfSite: siteData.pages?.length > 0 ? Math.round((currentUrls.length / siteData.pages.length) * 100) : 0
    };
  }) : [];

  // Filter and sort for What's new vs Top Issues
  const topOverviewIssues = [...rawOverviewIssues].sort((a, b) => {
    if (overviewSubTab === 'whats-new') {
      if (b.added !== a.added) return b.added - a.added;
      if (Math.abs(b.changeNum) !== Math.abs(a.changeNum)) return Math.abs(b.changeNum) - Math.abs(a.changeNum);
    }
    const sevOrder = { Critical: 3, Warning: 2, Passed: 1 };
    const sevDiff = (sevOrder[b.severity] || 0) - (sevOrder[a.severity] || 0);
    if (sevDiff !== 0) return sevDiff;
    return b.crawled - a.crawled;
  });

  const renderIssueContextForUrl = (issueTitle, pageObj) => {
    if (!pageObj) return '—';
    const lower = (issueTitle || '').toLowerCase();
    if (lower.includes('open graph')) {
      const missing = [];
      if (!pageObj.social?.ogTitle) missing.push('og:title');
      if (!pageObj.social?.ogImage) missing.push('og:image');
      if (!pageObj.social?.ogDesc) missing.push('og:description');
      return missing.length > 0 ? `Missing: ${missing.join(', ')}` : 'OG tags incomplete';
    }
    if (lower.includes('text-to-html')) {
      return `Ratio: ${pageObj.content?.textToHtmlRatio}% (HTML: ${pageObj.content?.htmlSizeKb} KB)`;
    }
    if (lower.includes('anchor')) {
      return `${pageObj.links?.genericAnchorCount || 0} non-descriptive anchor(s)`;
    }
    if (lower.includes('large html') || lower.includes('size')) {
      return `Payload: ${pageObj.content?.htmlSizeKb} KB`;
    }
    if (lower.includes('ttfb') || lower.includes('server response')) {
      return `TTFB: ${pageObj.ttfbMs} ms`;
    }
    if (lower.includes('load time')) {
      return `Response Time: ${(pageObj.responseTimeMs / 1000).toFixed(2)}s`;
    }
    if (lower.includes('title tag too short') || lower.includes('title tag too long') || lower.includes('title tag truncated')) {
      return `Title (${pageObj.meta?.titleLength} chars): "${(pageObj.meta?.title || '').substring(0, 30)}..."`;
    }
    if (lower.includes('missing title')) {
      return 'Missing <title> tag';
    }
    if (lower.includes('missing canonical')) {
      return pageObj.meta?.canonicalUrl ? `Canonical: ${pageObj.meta.canonicalUrl}` : 'No canonical declared';
    }
    if (lower.includes('meta description too short') || lower.includes('meta description too long')) {
      return `Length: ${pageObj.meta?.metaDescriptionLength} chars`;
    }
    if (lower.includes('missing meta description')) {
      return 'Missing <meta name="description">';
    }
    if (lower.includes('missing alt') || lower.includes('image')) {
      return `${pageObj.images?.missingAlt || 0} image(s) missing alt`;
    }
    if (lower.includes('multiple h1')) {
      return `${pageObj.headings?.h1?.length || 0} H1 tags detected`;
    }
    if (lower.includes('missing h1')) {
      return 'No <h1> tag on page';
    }
    if (lower.includes('orphan')) {
      return '0 incoming internal links found';
    }
    if (lower.includes('depth')) {
      return `Click depth: ${pageObj.depth} clicks from root`;
    }
    if (lower.includes('links')) {
      return `${pageObj.links?.internalCount || 0} internal, ${pageObj.links?.externalCount || 0} external`;
    }
    return pageObj.meta?.title ? `"${pageObj.meta.title.substring(0, 35)}..."` : '—';
  };

  const exportSingleIssueCSV = (issue) => {
    if (!issue || !issue.affectedUrls) return;
    const rows = [
      ['Issue Title', 'Severity', 'Category', 'Affected URL', 'Status Code', 'Page Title', 'TTFB (ms)', 'Word Count']
    ];
    issue.affectedUrls.forEach(url => {
      const p = siteData?.pages?.find(page => page.url === url);
      rows.push([
        `"${issue.title.replace(/"/g, '""')}"`,
        `"${issue.severity}"`,
        `"${issue.category || ''}"`,
        `"${url}"`,
        p?.statusCode || 200,
        `"${(p?.meta?.title || '').replace(/"/g, '""')}"`,
        p?.ttfbMs || 0,
        p?.content?.wordCount || 0
      ]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${issue.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_urls.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryIssueCount = (catName) => {
    if (!siteData) return 0;
    const cat = catName.toLowerCase();
    if (cat.includes('internal')) return siteData.pages?.length || 0;
    if (cat.includes('external')) return realExternalCount;
    return (siteData.aggregateIssues || []).filter(i => {
      const issueCat = (i.category || '').toLowerCase();
      const issueTitle = (i.title || '').toLowerCase();
      return issueCat.includes(cat) || issueTitle.includes(cat);
    }).reduce((sum, i) => sum + (i.affectedUrls?.length || 1), 0);
  };

  return (
    <div className="ahrefs-app-container">
      
      {/* =========================================================
          LEFT SIDEBAR (Ahrefs Standard Site Audit Menu)
          ========================================================= */}
      <aside className="ahrefs-sidebar no-print">
        {/* Project Selector Header */}
        <div style={{ padding: '16px 14px', borderBottom: '1px solid #232730', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '0.9rem' }}>
            A
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {siteData ? activeDomain : (urlInput ? activeDomain : 'Ready for Audit')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Site Audit Pro</div>
          </div>
        </div>

        {/* Primary Navigation */}
        <div style={{ padding: '10px 0' }}>
          <div
            className={`ahrefs-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => navigateTo('overview')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LayoutDashboard size={16} />
              <span>Overview</span>
            </div>
          </div>

          <div
            className={`ahrefs-nav-item ${activeTab === 'all-issues' && issueCategoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => navigateTo('all-issues', { category: 'all' })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertOctagon size={16} />
              <span>All issues</span>
            </div>
            {issuesDist.errors > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '1px 7px', borderRadius: '10px' }}>
                {issuesDist.errors}
              </span>
            )}
          </div>

          <div className="ahrefs-nav-item" onClick={() => navigateTo('overview')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={16} />
              <span>Alerts</span>
            </div>
            {issuesDist.errors > 0 && (
              <span style={{ background: '#f59e0b', color: '#000', fontSize: '0.65rem', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>
                New
              </span>
            )}
          </div>

          <div className="ahrefs-nav-item" onClick={exportAllPagesCSV}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DownloadCloud size={16} />
              <span>Bulk export</span>
            </div>
          </div>

          <div className="ahrefs-nav-item" onClick={() => { setHistoryModalOpen(true); try { window.history.pushState(null, '', '/history'); } catch(e){} }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HistoryIcon size={16} />
              <span>Project history</span>
            </div>
            <span style={{ color: '#38bdf8', fontSize: '0.72rem', fontWeight: 700 }}>
              {savedHistoryList.length}
            </span>
          </div>

          <div className="ahrefs-nav-item" onClick={() => navigateTo('crawl-log')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Terminal size={16} />
              <span>Crawl log</span>
            </div>
          </div>
        </div>

        {/* Tools Section */}
        <div className="ahrefs-sidebar-section">Tools</div>
        <div>
          <div
            className={`ahrefs-nav-item ${activeTab === 'page-explorer' ? 'active' : ''}`}
            onClick={() => navigateTo('page-explorer')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Database size={16} />
              <span>Page explorer</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {siteData?.pages?.length ?? 0}
            </span>
          </div>

          <div
            className={`ahrefs-nav-item ${activeTab === 'missing-alts' ? 'active' : ''}`}
            onClick={() => navigateTo('missing-alts')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ImageIcon size={16} color="#f87171" />
              <span>Missing Image ALTs</span>
            </div>
            <span style={{ color: '#f87171', fontSize: '0.72rem', fontWeight: 700 }}>
              {siteData?.allMissingAltImages?.length ?? 0}
            </span>
          </div>

          <div
            className={`ahrefs-nav-item ${activeTab === 'discovered-urls' ? 'active' : ''}`}
            onClick={() => navigateTo('discovered-urls')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link2 size={16} />
              <span>Link explorer</span>
            </div>
          </div>

          <div
            className={`ahrefs-nav-item ${activeTab === 'structure-explorer' ? 'active' : ''}`}
            onClick={() => navigateTo('structure-explorer')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Workflow size={16} />
              <span>Structure explorer</span>
            </div>
          </div>

          <div className="ahrefs-nav-item" onClick={() => navigateTo('all-issues')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={16} color="#a855f7" />
              <span>Patches ⚡</span>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="ahrefs-sidebar-section">Reports</div>
        <div style={{ paddingBottom: '20px' }}>
          {[
            { id: 'internal', label: 'Internal pages' },
            { id: 'indexability', label: 'Indexability' },
            { id: 'links', label: 'Links' },
            { id: 'redirects', label: 'Redirects' },
            { id: 'content', label: 'Content' },
            { id: 'social', label: 'Social tags' },
            { id: 'duplicates', label: 'Duplicates' },
            { id: 'performance', label: 'Performance' },
            { id: 'images', label: 'Images' },
            { id: 'external', label: 'External pages' }
          ].map(r => {
            const count = getCategoryIssueCount(r.label);
            const isSelected = activeTab === 'all-issues' && issueCategoryFilter.toLowerCase() === r.label.toLowerCase();
            return (
              <div
                key={r.id}
                className={`ahrefs-nav-item ${isSelected ? 'active' : ''}`}
                onClick={() => navigateTo('all-issues', { category: r.label })}
              >
                <span>{r.label}</span>
                {siteData && count > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#64748b' }}>
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* =========================================================
          MAIN CONTENT AREA
          ========================================================= */}
      <div className="ahrefs-main-content">
        
        {/* Top Navbar */}
        <header className="ahrefs-topbar no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', textTransform: 'capitalize' }}>
                {activeTab.replace('-', ' ')}
              </span>
              <a href="#how-to-use" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.78rem', textDecoration: 'none' }}>
                <HelpCircle size={14} /> How to use
              </a>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Auto-Crawl Button */}
            <button
              onClick={() => setSchedulesModalOpen(true)}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: 'rgba(99, 102, 241, 0.15)',
                borderColor: 'rgba(99, 102, 241, 0.4)',
                color: '#818cf8'
              }}
            >
              <Bot size={14} color="#818cf8" /> Auto-Crawl
              <span className="badge badge-info" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                {schedulesList.filter(s => s.active).length} Active
              </span>
            </button>

            {/* History Drawer Button */}
            <button
              onClick={() => setHistoryModalOpen(true)}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: 'rgba(6, 182, 212, 0.12)',
                borderColor: 'rgba(6, 182, 212, 0.4)',
                color: '#67e8f9'
              }}
            >
              <HistoryIcon size={14} color="#06b6d4" /> History
              <span className="badge badge-passed" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                {savedHistoryList.length}
              </span>
            </button>

            {/* User Profile / Login */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '3px 10px 3px 6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem'
                }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem', color: '#fff' }}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                </div>
                <button onClick={handleLogout} className="btn-secondary" style={{ padding: '5px 8px', fontSize: '0.72rem' }}>
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen('login')}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.78rem' }}
              >
                <LogIn size={14} /> Sign In
              </button>
            )}
          </div>
        </header>

        {/* Inner Main Scroll Area */}
        <div style={{ padding: '24px 28px', flex: 1, overflowY: 'auto' }}>
          
          {/* Quick Target URL Bar & Audit Starter */}
          <div className="ahrefs-card no-print" style={{ marginBottom: '24px', padding: '16px 20px' }}>
            <form onSubmit={(e) => { e.preventDefault(); runAudit(); }} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '4px', background: '#12151a', padding: '3px', borderRadius: '6px', border: '1px solid #262c36' }}>
                <button
                  type="button"
                  onClick={() => { setCrawlMode('sitemap'); setUrlInput('https://www.cocoonfurnishings.ca/sitemap.xml'); }}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: crawlMode === 'sitemap' ? '#272d38' : 'transparent',
                    color: crawlMode === 'sitemap' ? '#38bdf8' : '#94a3b8',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Sitemap XML
                </button>
                <button
                  type="button"
                  onClick={() => { setCrawlMode('site'); setUrlInput('https://www.cocoonfurnishings.ca/'); }}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: crawlMode === 'site' ? '#272d38' : 'transparent',
                    color: crawlMode === 'site' ? '#38bdf8' : '#94a3b8',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Root Domain
                </button>
                <button
                  type="button"
                  onClick={() => setCrawlMode('single')}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: crawlMode === 'single' ? '#272d38' : 'transparent',
                    color: crawlMode === 'single' ? '#38bdf8' : '#94a3b8',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Single Page
                </button>
              </div>

              <div style={{ position: 'relative', flex: '1 1 340px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  className="input-field"
                  style={{ padding: '8px 12px 8px 36px', fontSize: '0.88rem', background: '#12151a', borderColor: '#262c36' }}
                  placeholder="Enter URL to audit..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Limit:</span>
                <select
                  value={customPagesInput ? 'custom' : maxPages}
                  onChange={(e) => {
                    if (e.target.value === 'custom') setCustomPagesInput('500');
                    else { setCustomPagesInput(''); setMaxPages(Number(e.target.value)); }
                  }}
                  style={{ background: '#12151a', border: '1px solid #262c36', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem' }}
                >
                  <option value="50">50 Pages</option>
                  <option value="100">100 Pages</option>
                  <option value="250">250 Pages</option>
                  <option value="500">500 Pages</option>
                  <option value="1000">1,000 Pages</option>
                  <option value="custom">Custom...</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !urlInput.trim()}
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Crawl Running ({progressState.percent}%)...
                  </>
                ) : (
                  <>
                    <Zap size={14} /> Start Crawl & Audit
                  </>
                )}
              </button>
            </form>
          </div>

          {/* REAL-TIME STREAMING PROGRESS BAR (When Crawling) */}
          {loading && (
            <div className="ahrefs-card animate-fade-in" style={{ marginBottom: '24px', borderColor: '#38bdf8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={16} color="#38bdf8" className="animate-pulse" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>LIVE AJAX SPIDER ENGINE</span>
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8' }}>{progressState.percent}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#262c36', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${progressState.percent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #38bdf8, #10b981)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          {/* =========================================================
              TAB: OVERVIEW (EXACT RECREATION OF USER SCREENSHOT)
              ========================================================= */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Top Row: 5 Grid Widget Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
                
                {/* 1. Crawled URLs distribution */}
                <div className="ahrefs-card" style={{ gridColumn: 'span 4' }}>
                  <div className="ahrefs-card-title">
                    <span>Crawled URLs distribution</span>
                    <HelpCircle size={14} color="#64748b" />
                    <span style={{ color: '#38bdf8', marginLeft: 'auto', fontWeight: 700 }}>
                      {crawledDist.total.toLocaleString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '12px' }}>
                    <DonutChart
                      size={110}
                      strokeWidth={16}
                      segments={[
                        { label: 'Resources', value: crawledDist.resources, color: '#10b981' },
                        { label: 'Internal', value: crawledDist.internal, color: '#38bdf8' },
                        { label: 'External', value: crawledDist.external, color: '#6366f1' }
                      ]}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
                          <span style={{ color: '#94a3b8' }}>Internal</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{crawledDist.internal.toLocaleString()}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
                          <span style={{ color: '#94a3b8' }}>External</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{crawledDist.external.toLocaleString()}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                          <span style={{ color: '#94a3b8' }}>Resources</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{crawledDist.resources.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Centerpiece Hero: Health Score */}
                <div className="ahrefs-card" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div className="ahrefs-card-title" style={{ marginBottom: '8px' }}>
                      <span>Health Score</span>
                      <HelpCircle size={14} color="#64748b" />
                    </div>

                    <SemiCircleGauge score={activeScore} size={200} />

                    <p style={{ fontSize: '0.76rem', color: '#94a3b8', textAlign: 'center', marginTop: '14px', lineHeight: 1.4 }}>
                      Health Score reflects the proportion of internal URLs on your site that don't have errors
                    </p>
                  </div>

                  {/* Historical Bar Chart (bottom of Health Score card) */}
                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #232730' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '50px', padding: '0 8px' }}>
                      {historyTimeline.length > 0 ? (
                        historyTimeline.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                            <div
                              style={{
                                width: '16px',
                                height: `${Math.max(6, (item.score / 100) * 40)}px`,
                                background: item.score >= 80 ? 'linear-gradient(180deg, #10b981 0%, #34d399 100%)' : item.score >= 60 ? 'linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%)' : 'linear-gradient(180deg, #ef4444 0%, #f87171 100%)',
                                borderRadius: '2px',
                                transition: 'height 0.4s ease'
                              }}
                              title={`${item.date}: Score ${item.score}%`}
                            />
                            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{item.date}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ width: '100%', textAlign: 'center', fontSize: '0.72rem', color: '#64748b', padding: '10px 0' }}>
                          No historical crawls recorded yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Issues distribution */}
                <div className="ahrefs-card" style={{ gridColumn: 'span 4' }}>
                  <div className="ahrefs-card-title">
                    <span>Issues distribution</span>
                    <HelpCircle size={14} color="#64748b" />
                    <span style={{ color: '#38bdf8', marginLeft: 'auto', fontWeight: 700 }}>
                      {issuesDist.total.toLocaleString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '18px' }}>
                    {/* Errors Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                        <span style={{ color: '#94a3b8' }}>Errors</span>
                        <span style={{ color: '#38bdf8', fontWeight: 700 }}>{issuesDist.errors}</span>
                      </div>
                      <div style={{ width: '100%', height: '14px', background: '#232730', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (issuesDist.errors / (issuesDist.total || 1)) * 100 * 3)}%`, height: '100%', background: '#ef4444', borderRadius: '3px' }} />
                      </div>
                    </div>

                    {/* Warnings Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                        <span style={{ color: '#94a3b8' }}>Warnings</span>
                        <span style={{ color: '#38bdf8', fontWeight: 700 }}>{issuesDist.warnings.toLocaleString()}</span>
                      </div>
                      <div style={{ width: '100%', height: '14px', background: '#232730', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (issuesDist.warnings / (issuesDist.total || 1)) * 100)}%`, height: '100%', background: '#eab308', borderRadius: '3px' }} />
                      </div>
                    </div>

                    {/* Notices Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                        <span style={{ color: '#94a3b8' }}>Notices</span>
                        <span style={{ color: '#38bdf8', fontWeight: 700 }}>{issuesDist.notices.toLocaleString()}</span>
                      </div>
                      <div style={{ width: '100%', height: '14px', background: '#232730', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (issuesDist.notices / (issuesDist.total || 1)) * 100)}%`, height: '100%', background: '#38bdf8', borderRadius: '3px' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Crawl status of links found */}
                <div className="ahrefs-card" style={{ gridColumn: 'span 6' }}>
                  <div className="ahrefs-card-title">
                    <span>Crawl status of links found</span>
                    <HelpCircle size={14} color="#64748b" />
                    <span style={{ color: '#38bdf8', marginLeft: 'auto', fontWeight: 700 }}>
                      {crawlStatusDist.total.toLocaleString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '12px' }}>
                    <DonutChart
                      size={110}
                      strokeWidth={16}
                      segments={[
                        { label: 'Crawled', value: crawlStatusDist.crawled, color: '#10b981' },
                        { label: 'Uncrawled', value: crawlStatusDist.uncrawled, color: '#475569' },
                        { label: 'Blocked', value: crawlStatusDist.blocked, color: '#f87171' }
                      ]}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                          <span style={{ color: '#94a3b8' }}>Crawled</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{crawlStatusDist.crawled.toLocaleString()}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#475569' }} />
                          <span style={{ color: '#94a3b8' }}>Uncrawled</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{crawlStatusDist.uncrawled.toLocaleString()}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }} />
                          <span style={{ color: '#94a3b8' }}>Blocked by robots.txt</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{crawlStatusDist.blocked.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Error distribution */}
                <div className="ahrefs-card" style={{ gridColumn: 'span 6' }}>
                  <div className="ahrefs-card-title">
                    <span>Error distribution</span>
                    <HelpCircle size={14} color="#64748b" />
                    <span style={{ color: '#38bdf8', marginLeft: 'auto', fontWeight: 700 }}>
                      {errorDist.total.toLocaleString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '12px' }}>
                    <DonutChart
                      size={110}
                      strokeWidth={16}
                      segments={[
                        { label: 'Without errors', value: errorDist.withoutErrors, color: '#10b981' },
                        { label: 'With errors', value: errorDist.withErrors, color: '#f87171' }
                      ]}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, fontSize: '0.84rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                          <span style={{ color: '#94a3b8' }}>URLs without errors</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{errorDist.withoutErrors.toLocaleString()}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }} />
                          <span style={{ color: '#94a3b8' }}>URLs with errors</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{errorDist.withErrors.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Table Widget: What's new / Top Issues */}
              <div className="ahrefs-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #232730', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      onClick={() => setOverviewSubTab('whats-new')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: overviewSubTab === 'whats-new' ? '#fff' : '#64748b',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        paddingBottom: '2px',
                        borderBottom: overviewSubTab === 'whats-new' ? '2px solid #38bdf8' : 'none'
                      }}
                    >
                      What's new
                    </button>
                    <button
                      onClick={() => setOverviewSubTab('top-issues')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: overviewSubTab === 'top-issues' ? '#fff' : '#64748b',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        paddingBottom: '2px',
                        borderBottom: overviewSubTab === 'top-issues' ? '2px solid #38bdf8' : 'none'
                      }}
                    >
                      Top Issues
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Code size={13} /> AI · API
                    </button>
                    <button onClick={exportAllPagesCSV} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Download size={13} /> Export all issues
                    </button>
                  </div>
                </div>

                {/* Issues Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table className="ahrefs-table">
                    <thead>
                      <tr>
                        <th style={{ minWidth: '320px' }}>Issue</th>
                        <th>Crawled</th>
                        <th>Change</th>
                        <th>Added</th>
                        <th>New</th>
                        <th>Removed</th>
                        <th>Missing</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topOverviewIssues.map((row, idx) => (
                        <tr
                          key={idx}
                          onClick={() => navigateTo(activeTab, { issue: row })}
                          style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                          title="Click to view full issue details and affected URLs"
                        >
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {row.severity === 'Critical' ? (
                                <AlertTriangle size={15} color="#ef4444" />
                              ) : row.severity === 'Warning' ? (
                                <AlertCircle size={15} color="#f59e0b" />
                              ) : (
                                <Info size={15} color="#38bdf8" />
                              )}
                              <span
                                style={{ fontWeight: 600, color: '#f1f5f9', cursor: 'pointer' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigateTo(activeTab, { issue: row });
                                }}
                              >
                                {row.title}
                              </span>
                              {row.isNew && (
                                <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '1px 5px', borderRadius: '3px' }}>
                                  New
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: '#38bdf8' }}>{row.crawled.toLocaleString()}</td>
                          <td>
                            {row.changeNum > 0 ? (
                              <span style={{ color: '#ef4444', fontWeight: 700 }}>+{row.changeNum} ▲</span>
                            ) : row.changeNum < 0 ? (
                              <span style={{ color: '#10b981', fontWeight: 700 }}>{Math.abs(row.changeNum)} ▼</span>
                            ) : (
                              <span style={{ color: '#64748b' }}>—</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 600 }}>{row.added > 0 ? row.added : '—'}</td>
                          <td style={{ fontWeight: 600 }}>{row.newCount || '—'}</td>
                          <td style={{ color: row.removed !== '—' ? '#10b981' : undefined, fontWeight: 600 }}>
                            {row.removed || '—'}
                          </td>
                          <td>
                            {/* Dynamic Sparkline proportional to site percentage */}
                            <div style={{ display: 'inline-flex', alignItems: 'flex-end', height: '14px', gap: '2px' }} title={`${row.percentOfSite}% of crawled pages affected`}>
                              <span className="sparkline-bar" style={{ height: `${Math.max(3, Math.min(14, Math.round(row.percentOfSite * 0.14)))}px`, background: row.severity === 'Critical' ? '#ef4444' : row.severity === 'Warning' ? '#38bdf8' : '#64748b' }} />
                              <span className="sparkline-bar" style={{ height: `${Math.max(3, Math.min(14, Math.round(row.percentOfSite * 0.12)))}px`, background: row.severity === 'Critical' ? '#ef4444' : row.severity === 'Warning' ? '#38bdf8' : '#64748b' }} />
                              <span className="sparkline-bar" style={{ height: `${Math.max(4, Math.min(14, Math.round(row.percentOfSite * 0.14)))}px`, background: row.severity === 'Critical' ? '#ef4444' : row.severity === 'Warning' ? '#38bdf8' : '#64748b' }} />
                              <span className="sparkline-bar" style={{ height: `${Math.max(2, Math.min(14, Math.round(row.percentOfSite * 0.08)))}px`, background: row.severity === 'Critical' ? '#ef4444' : row.severity === 'Warning' ? '#38bdf8' : '#64748b' }} />
                              <span className="sparkline-bar" style={{ height: `${Math.max(3, Math.min(14, Math.round(row.percentOfSite * 0.11)))}px`, background: row.severity === 'Critical' ? '#ef4444' : row.severity === 'Warning' ? '#38bdf8' : '#64748b' }} />
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateTo(activeTab, { issue: row });
                              }}
                            >
                              <HelpCircle size={14} color="#64748b" style={{ cursor: 'pointer' }} title="View issue details and affected pages" />
                              <MoreVertical size={14} color="#64748b" style={{ cursor: 'pointer' }} title="Options" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ padding: '12px 20px', borderTop: '1px solid #232730', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setActiveTab('all-issues')}
                    style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    View all issues &rarr;
                  </button>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Showing top priority flagged items</span>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================
              TAB: ALL ISSUES (COMPLETE AHREFS ISSUE SUITE)
              ========================================================= */}
          {activeTab === 'all-issues' && (() => {
            const allIssues = siteData?.aggregateIssues || [];
            const criticalCount = allIssues.filter(i => i.severity === 'Critical').length;
            const warningCount = allIssues.filter(i => i.severity === 'Warning').length;
            const passedCount = allIssues.filter(i => i.severity === 'Passed').length;
            const categories = ['all', ...new Set(allIssues.map(i => i.category))];

            const filteredIssues = allIssues.filter(issue => {
              if (issueSeverityFilter !== 'all' && issue.severity !== issueSeverityFilter) return false;
              if (issueCategoryFilter !== 'all' && issue.category !== issueCategoryFilter) return false;
              if (issueSearchFilter) {
                const q = issueSearchFilter.toLowerCase();
                const m1 = (issue.title || '').toLowerCase().includes(q);
                const m2 = (issue.description || '').toLowerCase().includes(q);
                const m3 = (issue.category || '').toLowerCase().includes(q);
                const m4 = (issue.affectedUrls || []).some(u => u.toLowerCase().includes(q));
                if (!m1 && !m2 && !m3 && !m4) return false;
              }
              return true;
            });

            return (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>All Issues Explorer</h2>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                      Comprehensive site-wide audit checks with live fix resolution engine
                    </p>
                  </div>
                  <button onClick={exportAllPagesCSV} className="btn-secondary" style={{ fontSize: '0.78rem' }}>
                    <Download size={13} /> Export Issues Report
                  </button>
                </div>

                {/* Filter Toolbar */}
                <div className="ahrefs-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'all', label: `All Issues (${allIssues.length})` },
                        { id: 'Critical', label: `🔴 Errors (${criticalCount})`, color: '#f87171' },
                        { id: 'Warning', label: `🟡 Warnings (${warningCount})`, color: '#fbbf24' },
                        { id: 'Passed', label: `🔵 Notices (${passedCount})`, color: '#38bdf8' }
                      ].map(s => (
                        <button
                          key={s.id}
                          onClick={() => setIssueSeverityFilter(s.id)}
                          className={`btn-secondary ${issueSeverityFilter === s.id ? 'active' : ''}`}
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            background: issueSeverityFilter === s.id ? 'rgba(99, 102, 241, 0.25)' : undefined,
                            borderColor: issueSeverityFilter === s.id ? 'var(--accent-primary)' : undefined,
                            color: issueSeverityFilter === s.id ? '#fff' : s.color || 'var(--text-muted)'
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ position: 'relative', minWidth: '260px' }}>
                      <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Search issues, URLs..."
                        value={issueSearchFilter}
                        onChange={(e) => setIssueSearchFilter(e.target.value)}
                        style={{ padding: '6px 12px 6px 34px', fontSize: '0.82rem', background: '#12151a' }}
                      />
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {categories.map(cat => {
                      const countInCat = cat === 'all' ? allIssues.length : allIssues.filter(i => i.category === cat).length;
                      const isSelected = issueCategoryFilter === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setIssueCategoryFilter(cat)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '999px',
                            border: isSelected ? '1px solid #38bdf8' : '1px solid #262c36',
                            background: isSelected ? '#38bdf8' : '#12151a',
                            color: isSelected ? '#000' : '#94a3b8',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {cat === 'all' ? 'All Categories' : cat} ({countInCat})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Issues Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredIssues.map((issue, idx) => {
                    const isExpanded = expandedIssue === idx;
                    const isCrit = issue.severity === 'Critical';
                    const isWarn = issue.severity === 'Warning';
                    const borderCol = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#38bdf8';

                    return (
                      <div
                        key={idx}
                        className="ahrefs-card"
                        style={{ borderLeft: `4px solid ${borderCol}`, padding: '16px 20px' }}
                      >
                        <div
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', gap: '14px' }}
                          onClick={() => setExpandedIssue(isExpanded ? null : idx)}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span className={`badge ${isCrit ? 'badge-critical' : isWarn ? 'badge-warning' : 'badge-passed'}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                {issue.severity === 'Critical' ? '🔴 Error' : issue.severity === 'Warning' ? '🟡 Warning' : '🔵 Notice'}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                                {issue.category}
                              </span>
                              <span className="badge badge-info" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                {issue.affectedUrls.length} Pages
                              </span>
                            </div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{issue.title}</h3>
                            <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '4px' }}>{issue.description}</p>
                          </div>

                          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                            {isExpanded ? 'Hide' : `View ${issue.affectedUrls.length} Pages`}
                          </button>
                        </div>

                        {isExpanded && (
                          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #232730' }}>
                            <div style={{ padding: '10px 14px', background: '#12151a', borderRadius: '6px', marginBottom: '12px', fontSize: '0.82rem', border: '1px solid #262c36' }}>
                              <span style={{ color: '#38bdf8', fontWeight: 700 }}>Action: </span>
                              {issue.recommendation}
                            </div>

                            <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {issue.affectedUrls.map((affUrl, uIdx) => {
                                const key = `${issue.title}::${affUrl}`;
                                const issStatus = issueVerificationStatus[key];
                                return (
                                  <div
                                    key={uIdx}
                                    style={{
                                      padding: '6px 10px',
                                      background: '#12151a',
                                      borderRadius: '4px',
                                      fontSize: '0.8rem',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      gap: '8px'
                                    }}
                                  >
                                    <span
                                      onClick={() => {
                                        const targetP = siteData?.pages?.find(p => p.url === affUrl);
                                        if (targetP) setSelectedPageModal(targetP);
                                      }}
                                      style={{ color: '#38bdf8', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}
                                    >
                                      {affUrl}
                                    </span>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                      {issStatus?.status === 'completed' ? (
                                        <span className="badge badge-passed" style={{ fontSize: '0.7rem' }}>
                                          <CheckCircle2 size={11} /> Resolved
                                        </span>
                                      ) : (
                                        <button
                                          onClick={(e) => verifyAndResolveIssue(issue.title, affUrl, e)}
                                          className="btn-secondary"
                                          style={{ padding: '3px 8px', fontSize: '0.7rem', color: '#38bdf8' }}
                                        >
                                          <Check size={11} /> Check Fix
                                        </button>
                                      )}

                                      <button
                                        onClick={() => {
                                          const targetP = siteData?.pages?.find(p => p.url === affUrl);
                                          if (targetP) setSelectedPageModal(targetP);
                                        }}
                                        className="btn-secondary"
                                        style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                                      >
                                        Inspect &rarr;
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* =========================================================
              TAB: MISSING IMAGE ALTS
              ========================================================= */}
          {activeTab === 'missing-alts' && (
            <div className="ahrefs-card animate-fade-in" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ImageIcon size={20} color="#f87171" /> Missing Image ALT Attributes ({siteData?.allMissingAltImages?.length || 0})
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                    Exact images, source URLs, and AI-suggested replacement ALT attributes with 1-click live verification
                  </p>
                </div>

                <button onClick={exportMissingAltCSV} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#ef4444' }}>
                  <Download size={13} /> Export Missing ALTs CSV
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="ahrefs-table">
                  <thead>
                    <tr>
                      <th>Image Preview</th>
                      <th>Image Source</th>
                      <th>Parent Page</th>
                      <th>Suggested Alt Text</th>
                      <th>Live Fix & Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(siteData?.allMissingAltImages || []).map((img, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden', background: '#12151a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={img.imgSrc} alt={img.suggestedAlt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          </div>
                        </td>
                        <td style={{ maxWidth: '280px', wordBreak: 'break-all', fontSize: '0.78rem', color: '#38bdf8' }}>
                          {img.imgSrc}
                        </td>
                        <td style={{ maxWidth: '240px', wordBreak: 'break-all', fontSize: '0.78rem', color: '#94a3b8' }}>
                          {img.pageUrl}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
                          "{img.suggestedAlt}"
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => copyText(img.htmlSnippet, `alt-${idx}`)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                              {copiedId === `alt-${idx}` ? 'Copied' : 'Copy HTML'}
                            </button>
                            <button onClick={(e) => verifyAndResolveImageAlt(img.pageUrl, img.imgSrc, e)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#38bdf8' }}>
                              Check Fix
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB: PAGE EXPLORER
              ========================================================= */}
          {activeTab === 'page-explorer' && (
            <div className="ahrefs-card animate-fade-in" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  Crawled Pages Explorer ({siteData?.pages?.length || 0})
                </h3>
                <button onClick={exportAllPagesCSV} className="btn-secondary" style={{ fontSize: '0.78rem' }}>
                  <Download size={13} /> Export Pages CSV
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="ahrefs-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>URL</th>
                      <th>Score</th>
                      <th>Title</th>
                      <th>Missing ALTs</th>
                      <th>Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(siteData?.pages || []).map((p, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`badge ${p.statusCode === 200 ? 'badge-passed' : 'badge-critical'}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                            {p.statusCode}
                          </span>
                        </td>
                        <td style={{ maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#38bdf8', cursor: 'pointer' }} onClick={() => setSelectedPageModal(p)}>
                          {p.url}
                        </td>
                        <td style={{ fontWeight: 700, color: getScoreColor(p.score) }}>{p.score}%</td>
                        <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#94a3b8' }}>
                          {p.meta?.title || '—'}
                        </td>
                        <td style={{ color: p.images?.missingAlt > 0 ? '#f87171' : '#10b981', fontWeight: 600 }}>
                          {p.images?.missingAlt || 0}
                        </td>
                        <td>{p.responseTimeMs}ms</td>
                        <td>
                          <button onClick={() => setSelectedPageModal(p)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB: CRAWL LOG
              ========================================================= */}
          {activeTab === 'crawl-log' && (
            <div className="ahrefs-card animate-fade-in" style={{ padding: '20px', background: '#070a12' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>CRAWLER TELEMETRY LOG</span>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{filteredCrawlLogs.length} events</span>
              </div>
              <div ref={logContainerRef} style={{ height: '400px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredCrawlLogs.map((log, idx) => (
                  <div key={idx} style={{ color: log.level === 'error' ? '#f87171' : log.level === 'success' ? '#34d399' : '#94a3b8' }}>
                    <span style={{ color: '#475569' }}>[{log.timestamp}]</span> {log.message}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* =========================================================
          MODALS: SINGLE PAGE INSPECTOR, AUTH, HISTORY, SCHEDULES
          ========================================================= */}
      
      {/* 1. Single Page Inspector Modal */}
      {selectedPageModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="ahrefs-card animate-fade-in" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '6px' }}>HTTP {selectedPageModal.statusCode}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', wordBreak: 'break-all' }}>{selectedPageModal.url}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedPageModal(null);
                  try {
                    const fallbackPath = activeTab === 'overview' ? '/overview' : `/${activeTab}`;
                    window.history.pushState(null, '', fallbackPath);
                  } catch (e) {}
                }}
                className="btn-secondary"
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#12151a', padding: '12px', borderRadius: '6px', border: '1px solid #262c36' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Score</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: getScoreColor(selectedPageModal.score) }}>{selectedPageModal.score}%</div>
              </div>
              <div style={{ background: '#12151a', padding: '12px', borderRadius: '6px', border: '1px solid #262c36' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Word Count</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{selectedPageModal.content?.wordCount || 0}</div>
              </div>
              <div style={{ background: '#12151a', padding: '12px', borderRadius: '6px', border: '1px solid #262c36' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Missing Image ALTs</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>{selectedPageModal.images?.missingAlt || 0}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8', marginBottom: '10px' }}>Issues Detected:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(selectedPageModal.issues || []).map((iss, i) => (
                <div key={i} style={{ padding: '10px 14px', background: '#12151a', borderRadius: '6px', borderLeft: `3px solid ${iss.severity === 'Critical' ? '#ef4444' : '#f59e0b'}` }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{iss.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{iss.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Issue Details Modal (Triggered by clicking any issue) */}
      {selectedIssueModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}>
          <div className="ahrefs-card animate-fade-in" style={{ width: '100%', maxWidth: '960px', maxHeight: '90vh', overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}>
            
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #232730', background: '#121721', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    className={`badge ${selectedIssueModal.severity === 'Critical' ? 'badge-critical' : selectedIssueModal.severity === 'Warning' ? 'badge-warning' : 'badge-passed'}`}
                    style={{ fontSize: '0.72rem', padding: '3px 8px', fontWeight: 700 }}
                  >
                    {selectedIssueModal.severity === 'Critical' ? '🔴 Critical Error' : selectedIssueModal.severity === 'Warning' ? '🟡 Warning' : '🔵 Notice'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {selectedIssueModal.category || 'SEO Audit'}
                  </span>
                  <span className="badge badge-info" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                    {selectedIssueModal.affectedUrls?.length || 0} Affected Pages
                  </span>
                  {selectedIssueModal.isNew && (
                    <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                      NEW ISSUE
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {selectedIssueModal.title}
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelectedIssueModal(null);
                  setIssueUrlSearch('');
                  try {
                    const fallbackPath = activeTab === 'overview' ? '/overview' : `/${activeTab}`;
                    window.history.pushState(null, '', fallbackPath);
                  } catch (e) {}
                }}
                className="btn-secondary"
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Problem & Fix Intelligence Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#12151a', padding: '16px', borderRadius: '8px', border: '1px solid #232b3a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                    <AlertCircle size={16} /> What is the issue?
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                    {selectedIssueModal.description || 'This issue impacts on-page optimization, site architecture, or search crawlability.'}
                  </p>
                </div>

                <div style={{ background: '#12151a', padding: '16px', borderRadius: '8px', border: '1px solid #232b3a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                    <CheckCircle2 size={16} /> How to fix it
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                    {selectedIssueModal.recommendation || 'Follow modern technical SEO guidelines to update templates, markup, or server response headers.'}
                  </p>
                </div>
              </div>

              {/* Affected URLs Table */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                    Affected URLs ({selectedIssueModal.affectedUrls?.length || 0})
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        type="text"
                        placeholder="Filter affected URLs..."
                        value={issueUrlSearch}
                        onChange={(e) => setIssueUrlSearch(e.target.value)}
                        style={{
                          background: '#12151a',
                          border: '1px solid #28303e',
                          color: '#fff',
                          padding: '5px 10px 5px 30px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          width: '220px'
                        }}
                      />
                    </div>

                    <button
                      onClick={() => exportSingleIssueCSV(selectedIssueModal)}
                      className="btn-secondary"
                      style={{ padding: '5px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Download size={13} /> Export CSV
                    </button>
                  </div>
                </div>

                <div style={{ border: '1px solid #232730', borderRadius: '8px', overflow: 'hidden', background: '#12151a' }}>
                  <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                    <table className="ahrefs-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ minWidth: '340px' }}>URL & Page Title</th>
                          <th>Status</th>
                          <th>Context / Issue Details</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedIssueModal.affectedUrls || [])
                          .filter(u => !issueUrlSearch || u.toLowerCase().includes(issueUrlSearch.toLowerCase()))
                          .map((urlStr, uIdx) => {
                            const pageObj = siteData?.pages?.find(p => p.url === urlStr);
                            const key = `${selectedIssueModal.title}::${urlStr}`;
                            const verifyState = issueVerificationStatus[key];

                            return (
                              <tr key={uIdx} style={{ background: uIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <a
                                      href={urlStr}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        color: '#38bdf8',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.82rem',
                                        wordBreak: 'break-all',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      {urlStr} <ExternalLink size={11} color="#64748b" />
                                    </a>
                                    {pageObj?.meta?.title && (
                                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                        {pageObj.meta.title}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <span style={{
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: (pageObj?.statusCode || 200) < 400 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    color: (pageObj?.statusCode || 200) < 400 ? '#10b981' : '#f87171'
                                  }}>
                                    {pageObj?.statusCode || 200}
                                  </span>
                                </td>
                                <td>
                                  <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                                    {renderIssueContextForUrl(selectedIssueModal.title, pageObj)}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    {pageObj && (
                                      <button
                                        onClick={() => navigateTo(activeTab, { pageUrl: pageObj.url })}
                                        className="btn-secondary"
                                        style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                        title="Inspect full technical diagnostics"
                                      >
                                        Inspect
                                      </button>
                                    )}

                                    {verifyState?.status === 'completed' ? (
                                      <span className="badge badge-passed" style={{ fontSize: '0.7rem' }}>
                                        <CheckCircle2 size={11} /> Resolved
                                      </span>
                                    ) : (
                                      <button
                                        onClick={(e) => verifyAndResolveIssue(selectedIssueModal.title, urlStr, e)}
                                        className="btn-secondary"
                                        style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        disabled={verifyState?.status === 'verifying'}
                                        title="Re-crawl and verify if this URL is fixed"
                                      >
                                        {verifyState?.status === 'verifying' ? (
                                          <>
                                            <RefreshCw size={11} className="animate-spin" /> Verifying...
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle2 size={11} color="#10b981" /> Verify Fix
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #232730', background: '#121721', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Real-time Issue Diagnostics · Click any URL to inspect on-page audits
              </span>
              <button
                onClick={() => {
                  setSelectedIssueModal(null);
                  setIssueUrlSearch('');
                  try {
                    const fallbackPath = activeTab === 'overview' ? '/overview' : `/${activeTab}`;
                    window.history.pushState(null, '', fallbackPath);
                  } catch (e) {}
                }}
                className="btn-primary"
                style={{ padding: '6px 18px', fontSize: '0.8rem' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Authentication Modal */}
      {authModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="ahrefs-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                {authForm.isRegister ? 'Create Auditor Account' : 'Sign In to Site Audit'}
              </h3>
              <button onClick={() => setAuthModalOpen(null)} className="btn-secondary" style={{ padding: '6px' }}>
                <X size={16} />
              </button>
            </div>

            {authError && (
              <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '6px', color: '#f87171', fontSize: '0.8rem', marginBottom: '14px' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {authForm.isRegister && (
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    placeholder="Jane Doe"
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Email Address</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="auditor@ahrefs.com"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Password</label>
                <input
                  type="password"
                  required
                  className="input-field"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={authLoading} style={{ marginTop: '8px' }}>
                {authLoading ? 'Authenticating...' : authForm.isRegister ? 'Register Account' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => setAuthForm({ ...authForm, isRegister: !authForm.isRegister })}
                style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.78rem', cursor: 'pointer', marginTop: '6px' }}
              >
                {authForm.isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Automatic History Snapshots Modal */}
      {historyModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="ahrefs-card animate-fade-in" style={{ width: '100%', maxWidth: '850px', maxHeight: '85vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HistoryIcon size={20} color="#06b6d4" /> Saved Project History Snapshots ({savedHistoryList.length})
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                  Every audit run (manual or auto-crawl) is permanently stored to disk for instant restoration
                </p>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} className="btn-secondary" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="ahrefs-table">
                <thead>
                  <tr>
                    <th>Domain / Target</th>
                    <th>Score</th>
                    <th>Pages</th>
                    <th>Missing ALTs</th>
                    <th>Timestamp</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedHistoryList.map((h, i) => (
                    <tr key={i}>
                      <td style={{ color: '#38bdf8', fontWeight: 600 }}>{h.domain || h.rootUrl}</td>
                      <td style={{ fontWeight: 800, color: getScoreColor(h.score) }}>{h.score}%</td>
                      <td>{h.totalPages}</td>
                      <td style={{ color: h.missingAltCount > 0 ? '#f87171' : '#10b981' }}>{h.missingAltCount || 0}</td>
                      <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(h.timestamp).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => loadHistorySnapshot(h.id)} className="btn-primary" style={{ padding: '3px 10px', fontSize: '0.72rem' }}>
                            Load
                          </button>
                          <button onClick={(e) => deleteHistoryItem(h.id, e)} className="btn-secondary" style={{ padding: '3px 6px', color: '#f87171' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Auto-Crawl Scheduler Modal */}
      {schedulesModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="ahrefs-card animate-fade-in" style={{ width: '100%', maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={20} color="#818cf8" /> Automated Recurring Crawls
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                  Configure automated cron schedules that crawl and store snapshots automatically
                </p>
              </div>
              <button onClick={() => setSchedulesModalOpen(false)} className="btn-secondary" style={{ padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Create Schedule Form */}
            <form onSubmit={createSchedule} style={{ padding: '16px', background: '#12151a', borderRadius: '8px', border: '1px solid #262c36', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>Add New Scheduled Audit</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <input
                  type="text"
                  required
                  placeholder="Target URL / Sitemap (e.g. https://domain.com/sitemap.xml)"
                  className="input-field"
                  value={newScheduleForm.targetUrl}
                  onChange={(e) => setNewScheduleForm({ ...newScheduleForm, targetUrl: e.target.value })}
                />
                <select
                  value={newScheduleForm.frequency}
                  onChange={(e) => setNewScheduleForm({ ...newScheduleForm, frequency: e.target.value })}
                  style={{ background: '#181b20', border: '1px solid #262c36', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem' }}
                >
                  <option value="30m">Every 30 Minutes</option>
                  <option value="1h">Every 1 Hour</option>
                  <option value="6h">Every 6 Hours</option>
                  <option value="24h">Daily (Every 24 Hours)</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem', alignSelf: 'flex-start' }}>
                + Schedule Auto-Crawl
              </button>
            </form>

            {/* Existing Schedules Table */}
            <table className="ahrefs-table">
              <thead>
                <tr>
                  <th>Target URL</th>
                  <th>Frequency</th>
                  <th>Status</th>
                  <th>Next Run</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedulesList.map((s, i) => (
                  <tr key={i}>
                    <td style={{ color: '#38bdf8', fontWeight: 600 }}>{s.targetUrl}</td>
                    <td>{s.frequency}</td>
                    <td>
                      <span className={`badge ${s.active ? 'badge-passed' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                        {s.active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(s.nextRun).toLocaleTimeString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => triggerScheduleRunNow(s.id)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.7rem', color: '#38bdf8' }}>
                          Run Now
                        </button>
                        <button onClick={() => toggleSchedule(s.id)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.7rem' }}>
                          {s.active ? 'Pause' : 'Resume'}
                        </button>
                        <button onClick={() => deleteSchedule(s.id)} className="btn-secondary" style={{ padding: '3px 6px', color: '#f87171' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
