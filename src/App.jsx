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
  Bot, PlayCircle, PauseCircle, Trash2, LogIn, LogOut, UserCheck, Bell, Shield
} from 'lucide-react';

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
  const [modalImgTab, setModalImgTab] = useState('missing'); // 'missing' or 'all'
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('site-health');
  const [history, setHistory] = useState([]);
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
      [targetUrl]: { status: 'checking', message: 'Auditing live URL...' }
    }));

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to re-audit URL');

      const criticalCount = (data.issues || []).filter(i => i.severity === 'Critical').length;
      const warningCount = (data.issues || []).filter(i => i.severity === 'Warning').length;
      const missingAltCount = data.images?.missingAlt || 0;
      const isClean = criticalCount === 0 && missingAltCount === 0 && data.statusCode === 200;
      const isResolved = isClean || (data.score >= 85 && data.statusCode === 200);

      const statusResult = isResolved ? 'completed' : 'still_error';
      const message = isResolved
        ? `✓ Resolved! Score: ${data.score}% | 0 Missing ALTs`
        : `Still Error: ${missingAltCount > 0 ? `${missingAltCount} Missing ALTs, ` : ''}${criticalCount + warningCount} Issues (Score: ${data.score}%)`;

      setUrlVerificationStatus(prev => ({
        ...prev,
        [targetUrl]: {
          status: statusResult,
          lastChecked: new Date().toLocaleTimeString(),
          score: data.score,
          statusCode: data.statusCode,
          missingAltCount,
          criticalCount,
          warningCount,
          message,
          data
        }
      }));

      // Update siteData dynamically
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
            message: `✓ Resolved! ALT: "${foundImage.alt}"`,
            altText: foundImage.alt
          }
        }));
      } else {
        setImageVerificationStatus(prev => ({
          ...prev,
          [key]: {
            status: 'still_error',
            lastChecked: new Date().toLocaleTimeString(),
            message: '❌ Still Error: ALT attribute is still missing on live page.'
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
      setActiveTab('site-health');
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
    } catch (e) {
      console.error('Failed to delete history item:', e);
    }
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

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!newScheduleForm.targetUrl) return;

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScheduleForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create auto-crawl schedule');

      fetchSchedules();
      setNewScheduleForm({
        name: '',
        targetUrl: '',
        frequency: '24h',
        maxPages: 250,
        maxDepth: 4
      });
    } catch (e) {
      alert(e.message);
    }
  };

  const handleToggleSchedule = async (id) => {
    try {
      const res = await fetch(`/api/schedules/${id}/toggle`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setSchedulesList(prev => prev.map(s => s.id === id ? data.schedule : s));
      }
    } catch (e) {
      console.error('Failed to toggle schedule:', e);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      setSchedulesList(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error('Failed to delete schedule:', e);
    }
  };

  const handleRunScheduleNow = async (id) => {
    try {
      const res = await fetch(`/api/schedules/${id}/run-now`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('🚀 Background crawl initiated! Audit snapshot will automatically appear in your History upon completion.');
        fetchSchedules();
        setTimeout(fetchSavedHistory, 3000);
      }
    } catch (e) {
      alert('Failed to start scheduled crawl: ' + e.message);
    }
  };

  const effectiveMaxPages = customPagesInput ? parseInt(customPagesInput, 10) || 100 : maxPages;

  const runAudit = async (targetUrl) => {
    const queryUrl = targetUrl || urlInput;
    if (!queryUrl) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setLoading(true);
    setError(null);
    setSelectedPageModal(null);
    setCrawlLogs([]);
    setProgressState({
      percent: 0,
      currentCrawled: 0,
      targetLimit: effectiveMaxPages,
      totalDiscovered: 0,
      currentUrl: queryUrl,
      activeWorkers: 15
    });

    if (crawlMode === 'site' || crawlMode === 'sitemap') {
      // Connect to Server-Sent Events (SSE) Streaming API for Real-Time AJAX Progress & Live Logs
      const sseUrl = `/api/crawl-stream?url=${encodeURIComponent(queryUrl)}&sitemapUrl=${crawlMode === 'sitemap' ? encodeURIComponent(queryUrl) : ''}&maxPages=${effectiveMaxPages}&maxDepth=${maxDepth}`;
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      let isCompleted = false;

      es.addEventListener('progress', (e) => {
        try {
          const data = JSON.parse(e.data);
          setProgressState(prev => ({
            ...prev,
            ...data
          }));
        } catch (err) {}
      });

      es.addEventListener('log', (e) => {
        try {
          const logItem = JSON.parse(e.data);
          setCrawlLogs(prev => [...prev.slice(-300), logItem]);
        } catch (err) {}
      });

      es.addEventListener('complete', (e) => {
        isCompleted = true;
        try {
          const finalReport = JSON.parse(e.data);
          setSiteData(finalReport);
          setSingleData(finalReport.pages?.[0] || null);
          setUrlInput(finalReport.rootUrl);

          const newHistory = [
            { url: finalReport.rootUrl, domain: finalReport.domain, score: finalReport.siteHealthScore, pages: finalReport.stats.totalPagesCrawled, timestamp: new Date().toLocaleTimeString() },
            ...history.filter(h => h.url !== finalReport.rootUrl).slice(0, 9)
          ];
          setHistory(newHistory);
          try { localStorage.setItem('seo_audit_history_v2', JSON.stringify(newHistory)); } catch (err) {}
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
          es.close();
        }
      });

      es.addEventListener('error', async (e) => {
        if (isCompleted) return;
        
        let serverErrMsg = '';
        if (e.data) {
          try {
            const data = JSON.parse(e.data);
            serverErrMsg = data.message;
          } catch (err) {}
        }

        if (serverErrMsg) {
          setError(serverErrMsg);
          setLoading(false);
          es.close();
          return;
        }

        // If SSE connection dropped or proxy failed, fallback seamlessly to POST /api/crawl-site
        console.warn('SSE stream interrupted or disconnected, attempting fallback to direct crawl API...');
        es.close();
        try {
          const fallbackRes = await fetch('/api/crawl-site', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: queryUrl,
              sitemapUrl: crawlMode === 'sitemap' ? queryUrl : undefined,
              maxPages: effectiveMaxPages,
              maxDepth
            })
          });
          const fallbackData = await fallbackRes.json();
          if (!fallbackRes.ok) throw new Error(fallbackData.error || 'Crawling failed');
          
          setSiteData(fallbackData);
          setSingleData(fallbackData.pages?.[0] || null);
          setUrlInput(fallbackData.rootUrl);
        } catch (fbErr) {
          setError(fbErr.message || 'Failed to connect to crawler stream.');
        } finally {
          setLoading(false);
        }
      });

      es.onerror = (e) => {
        if (isCompleted) return;
        // Native browser event error triggers addEventListener('error')
      };
    } else {
      // Single Page Audit mode
      try {
        const response = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: queryUrl })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to complete single URL audit');

        setSingleData(data);
        setSiteData(null);
        setUrlInput(data.url);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const exportAllPagesCSV = () => {
    if (!siteData || !siteData.pages) return;
    const headers = ['URL', 'Status Code', 'Depth', 'Health Score', 'Title', 'Title Length', 'Meta Description', 'H1', 'Word Count', 'Internal Links', 'Missing Alt Count', 'Critical Issues Count'];
    const rows = siteData.pages.map(p => [
      `"${p.url}"`,
      p.statusCode,
      p.depth,
      p.score,
      `"${(p.meta?.title || '').replace(/"/g, '""')}"`,
      p.meta?.titleLength || 0,
      `"${(p.meta?.metaDescription || '').replace(/"/g, '""')}"`,
      `"${(p.headings?.h1?.[0] || '').replace(/"/g, '""')}"`,
      p.content?.wordCount || 0,
      p.links?.internalCount || 0,
      p.images?.missingAlt || 0,
      p.issues?.filter(i => i.severity === 'Critical').length || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `crawled-pages-${siteData.domain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMissingAltCSV = () => {
    if (!siteData || !siteData.allMissingAltImages) return;
    const headers = ['Page URL', 'Page Title', 'Image URL', 'Suggested ALT Tag', 'HTML Code Fix'];
    const rows = siteData.allMissingAltImages.map(img => [
      `"${img.pageUrl}"`,
      `"${(img.pageTitle || '').replace(/"/g, '""')}"`,
      `"${img.imgSrc}"`,
      `"${(img.suggestedAlt || '').replace(/"/g, '""')}"`,
      `"${img.htmlSnippet.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `missing-alt-images-${siteData.domain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllDiscoveredUrlsTXT = () => {
    if (!siteData || !siteData.allDiscoveredUrls) return;
    const content = siteData.allDiscoveredUrls.map(item => item.url).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sitemap-urls-${siteData.domain}-${siteData.allDiscoveredUrls.length}-urls.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getScoreColor = (val) => {
    if (val >= 85) return '#10b981';
    if (val >= 70) return '#6366f1';
    if (val >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const filteredPages = siteData?.pages?.filter(page => {
    const matchesSearch = page.url.toLowerCase().includes(urlSearchFilter.toLowerCase()) || 
                          (page.meta?.title || '').toLowerCase().includes(urlSearchFilter.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'healthy') return matchesSearch && page.score >= 80;
    if (statusFilter === 'warnings') return matchesSearch && page.score >= 50 && page.score < 80;
    if (statusFilter === 'errors') return matchesSearch && (page.score < 50 || page.isBroken);
    if (statusFilter === 'broken') return matchesSearch && page.statusCode >= 400;
    return matchesSearch;
  }) || [];

  const filteredMissingAltImages = siteData?.allMissingAltImages?.filter(img =>
    img.imgSrc.toLowerCase().includes(missingAltSearchFilter.toLowerCase()) ||
    img.pageUrl.toLowerCase().includes(missingAltSearchFilter.toLowerCase()) ||
    img.pageTitle.toLowerCase().includes(missingAltSearchFilter.toLowerCase())
  ) || [];

  const filteredDiscovered = siteData?.allDiscoveredUrls?.filter(item => 
    item.url.toLowerCase().includes(discoveredSearchFilter.toLowerCase())
  ) || [];

  const filteredCrawlLogs = crawlLogs.filter(log => {
    if (logFilter === 'all') return true;
    if (logFilter === 'error') return log.level === 'error' || log.level === 'warning';
    if (logFilter === 'success') return log.level === 'success';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <header className="no-print" style={{
        background: 'rgba(10, 13, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '14px 24px'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            }}>
              <Globe size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-display)' }}>
                AHREFS SITE AUDITOR <span style={{ color: 'var(--accent-secondary)', WebkitTextFillColor: 'var(--accent-secondary)' }}>PRO</span>
              </h1>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Real-Time Streaming Crawler & Image ALT Tracking Engine</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Auto-Crawl Schedules Trigger */}
            <button
              onClick={() => { fetchSchedules(); setSchedulesModalOpen(true); }}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                fontSize: '0.8rem',
                background: 'rgba(99, 102, 241, 0.12)',
                borderColor: 'rgba(99, 102, 241, 0.4)',
                color: '#a5b4fc'
              }}
              title="Configure background automated crawling schedules"
            >
              <Bot size={15} color="#818cf8" /> Auto-Crawl
              <span className="badge badge-info" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                {schedulesList.filter(s => s.active).length} Active
              </span>
            </button>

            {/* Auto-Saved Audit History Trigger */}
            <button
              onClick={() => { fetchSavedHistory(); setHistoryModalOpen(true); }}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                fontSize: '0.8rem',
                background: 'rgba(6, 182, 212, 0.12)',
                borderColor: 'rgba(6, 182, 212, 0.4)',
                color: '#67e8f9'
              }}
              title="View all automatically saved crawl snapshots"
            >
              <HistoryIcon size={15} color="#06b6d4" /> History
              <span className="badge badge-passed" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                {savedHistoryList.length}
              </span>
            </button>

            {/* User Auth / Profile Badge */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 12px 4px 6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#fff' }}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                  <span className="badge badge-passed" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>{currentUser.role || 'Pro'}</span>
                </div>
                <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }} title="Sign Out">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen('login')}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', fontSize: '0.8rem' }}
              >
                <LogIn size={15} /> Sign In / Register
              </button>
            )}

            {siteData && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '10px' }}>
                <button onClick={exportMissingAltCSV} className="btn-secondary" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }} title="Export Missing ALT Images Tracker (CSV)">
                  <ImageIcon size={15} /> Missing ALTs ({siteData.allMissingAltImages?.length || 0})
                </button>
                <button onClick={exportAllPagesCSV} className="btn-secondary" title="Export Crawled Audit Data (CSV)">
                  <FileSpreadsheet size={15} /> Export CSV ({siteData.pages.length})
                </button>
                <button onClick={() => window.print()} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                  <FileText size={15} /> Print / PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '28px 24px' }}>
        
        {/* Search & Mode Switcher */}
        <section className="no-print" style={{ marginBottom: '28px' }}>
          <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(180deg, rgba(18, 24, 38, 0.95) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setCrawlMode('sitemap'); setUrlInput('https://www.cocoonfurnishings.ca/sitemap.xml'); }}
                className="btn-secondary"
                style={{
                  background: crawlMode === 'sitemap' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  borderColor: crawlMode === 'sitemap' ? 'var(--accent-primary)' : 'var(--border-subtle)'
                }}
              >
                <FileCode size={16} /> Direct Sitemap XML Input (sitemap.xml)
              </button>
              <button
                type="button"
                onClick={() => { setCrawlMode('site'); setUrlInput('https://www.cocoonfurnishings.ca/'); }}
                className="btn-secondary"
                style={{
                  background: crawlMode === 'site' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  borderColor: crawlMode === 'site' ? 'var(--accent-primary)' : 'var(--border-subtle)'
                }}
              >
                <FolderTree size={16} /> Website Root Domain Crawler
              </button>
              <button
                type="button"
                onClick={() => setCrawlMode('single')}
                className="btn-secondary"
                style={{
                  background: crawlMode === 'single' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  borderColor: crawlMode === 'single' ? 'var(--accent-primary)' : 'var(--border-subtle)'
                }}
              >
                <FileText size={16} /> Single Page Audit
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); runAudit(); }} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 380px' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  {crawlMode === 'sitemap' ? <FileCode size={20} color="var(--accent-secondary)" /> : <Search size={20} />}
                </div>
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: '48px', fontSize: '1.05rem' }}
                  placeholder={crawlMode === 'sitemap' ? "Enter direct Sitemap URL (e.g. https://www.cocoonfurnishings.ca/sitemap.xml)..." : "Enter website URL (e.g. https://www.cocoonfurnishings.ca/)..."}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={loading}
                />
              </div>

              {crawlMode !== 'single' && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.8)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Crawl Scope:</span>
                    <select
                      value={customPagesInput ? 'custom' : maxPages}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setCustomPagesInput('500');
                        } else {
                          setCustomPagesInput('');
                          setMaxPages(Number(e.target.value));
                        }
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <option value="50" style={{ background: '#121826' }}>50 Pages (Fast)</option>
                      <option value="100" style={{ background: '#121826' }}>100 Pages</option>
                      <option value="250" style={{ background: '#121826' }}>250 Pages (Recommended)</option>
                      <option value="500" style={{ background: '#121826' }}>500 Pages (Deep)</option>
                      <option value="1000" style={{ background: '#121826' }}>1,000 Pages (Enterprise)</option>
                      <option value="2500" style={{ background: '#121826' }}>2,500 Pages (Massive Catalog)</option>
                      <option value="5000" style={{ background: '#121826' }}>5,000 Pages (Full Sitemaps)</option>
                      <option value="custom" style={{ background: '#121826' }}>Custom Limit...</option>
                    </select>
                  </div>

                  {customPagesInput !== '' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.8)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--accent-primary)' }}>
                      <Hash size={14} color="var(--accent-secondary)" />
                      <input
                        type="number"
                        min="10"
                        max="10000"
                        value={customPagesInput}
                        onChange={(e) => setCustomPagesInput(e.target.value)}
                        placeholder="e.g. 4023"
                        style={{ width: '80px', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>pages</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.8)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Depth:</span>
                    <select
                      value={maxDepth}
                      onChange={(e) => setMaxDepth(Number(e.target.value))}
                      style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <option value="2" style={{ background: '#121826' }}>Depth 2</option>
                      <option value="3" style={{ background: '#121826' }}>Depth 3</option>
                      <option value="4" style={{ background: '#121826' }}>Depth 4</option>
                      <option value="5" style={{ background: '#121826' }}>Depth 5</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !urlInput.trim()}
                style={{ padding: '14px 28px', fontSize: '1rem', minWidth: '190px' }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Auditing ({progressState.percent}%)...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    {crawlMode === 'sitemap' ? `Crawl Sitemap (${effectiveMaxPages} Pages)` : crawlMode === 'site' ? `Start Crawl (${effectiveMaxPages} Pages)` : 'Run Single Audit'}
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Error Notification */}
        {error && (
          <div className="glass-panel" style={{ padding: '20px', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <AlertCircle size={28} color="#ef4444" />
            <div>
              <h4 style={{ color: '#f87171', fontWeight: 600 }}>Crawl & Audit Error</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>{error}</p>
            </div>
          </div>
        )}

        {/* LIVE REAL-TIME AJAX PROGRESS PERCENTAGE & STREAMING LOG CONSOLE */}
        {loading && (
          <div className="animate-fade-in" style={{ marginBottom: '28px' }}>
            
            {/* Real-time Percentage & Progress Banner */}
            <div className="glass-panel glass-panel-glow" style={{ padding: '28px', marginBottom: '16px', background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.18), rgba(15, 23, 42, 0.95) 75%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 12px #10b981', animation: 'pulseGlow 1.2s infinite' }} />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Crawling & Auditing Live: <span style={{ color: 'var(--accent-secondary)' }}>{progressState.currentUrl || urlInput}</span>
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Streaming via Server-Sent Events (SSE) &bull; {progressState.activeWorkers} Concurrent Spider Threads
                    </div>
                  </div>
                </div>

                {/* Big Percentage Number */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '2.6rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: '#38bdf8', lineHeight: 1 }}>
                    {progressState.percent}%
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completed</span>
                </div>
              </div>

              {/* Glowing Percentage Bar */}
              <div style={{ width: '100%', height: '12px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden', position: 'relative', marginBottom: '18px' }}>
                <div
                  style={{
                    width: `${progressState.percent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 50%, #10b981 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease',
                    boxShadow: '0 0 16px rgba(6, 182, 212, 0.6)'
                  }}
                />
              </div>

              {/* Progress Counters Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Crawled Pages</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                    {progressState.currentCrawled} <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 500 }}>/ {progressState.targetLimit} max</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Discovered Sitemap URLs</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                    {progressState.totalDiscovered.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live Logs Streamed</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    {crawlLogs.length} events
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE TERMINAL LOG CONSOLE */}
            <div className="glass-panel" style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={16} color="#38bdf8" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#e2e8f0' }}>LIVE CRAWL CONSOLE</span>
                  <span className="badge badge-info" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>Streaming AJAX</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '2px' }}>
                    {['all', 'success', 'error'].map(f => (
                      <button
                        key={f}
                        onClick={() => setLogFilter(f)}
                        style={{
                          background: logFilter === f ? 'rgba(99, 102, 241, 0.4)' : 'transparent',
                          border: 'none',
                          color: logFilter === f ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setAutoScroll(!autoScroll)}
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.72rem', background: autoScroll ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: autoScroll ? '#34d399' : 'var(--text-muted)' }}
                  >
                    Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
                  </button>

                  <button
                    onClick={() => setConsoleOpen(!consoleOpen)}
                    className="btn-secondary"
                    style={{ padding: '4px' }}
                  >
                    {consoleOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Terminal Logs Window */}
              {consoleOpen && (
                <div
                  ref={logContainerRef}
                  style={{
                    height: '280px',
                    overflowY: 'auto',
                    padding: '14px 18px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    lineHeight: 1.6,
                    background: '#070a12',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  {filteredCrawlLogs.length === 0 ? (
                    <div style={{ color: 'var(--text-dim)', textAlign: 'center', paddingTop: '40px' }}>
                      Waiting for crawler spider worker telemetry...
                    </div>
                  ) : (
                    filteredCrawlLogs.map((log, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '10px',
                          color: log.level === 'error' ? '#f87171' : log.level === 'warning' ? '#fbbf24' : log.level === 'success' ? '#34d399' : '#94a3b8'
                        }}
                      >
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', userSelect: 'none' }}>[{log.timestamp}]</span>
                        <span style={{ wordBreak: 'break-all' }}>{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FULL SITE AUDIT RESULTS */}
        {siteData && !loading && (
          <div className="animate-fade-in">
            
            {/* Top Site Health Hero Card */}
            <div className="glass-panel glass-panel-glow" style={{ padding: '32px', marginBottom: '28px', background: 'radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.15), rgba(18, 24, 38, 0.95) 70%)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
                
                {/* Site Health Gauge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
                    <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="3.2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={getScoreColor(siteData.siteHealthScore)}
                        strokeWidth="3.2"
                        strokeDasharray={`${siteData.siteHealthScore}, 100`}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 1s ease' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                        {siteData.siteHealthScore}%
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                        Health Score
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span className={`badge ${siteData.siteHealthScore >= 80 ? 'badge-passed' : siteData.siteHealthScore >= 60 ? 'badge-warning' : 'badge-critical'}`} style={{ fontSize: '0.85rem', padding: '4px 12px' }}>
                        Grade: {siteData.siteGrade}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{siteData.stats.totalPagesCrawled} Pages Audited in {(siteData.crawlDurationMs / 1000).toFixed(1)}s</span>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', wordBreak: 'break-all' }}>
                      {siteData.domain}
                    </h2>
                    <a href={siteData.sitemapSourceUrl || siteData.rootUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: 'var(--accent-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', marginTop: '4px' }}>
                      {siteData.sitemapSourceUrl || siteData.rootUrl} <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                {/* Tracking Counters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-display)' }}>
                      {siteData.stats.totalMissingAltImages || 0}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Missing Alt Images</div>
                  </div>

                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-display)' }}>
                      {siteData.stats.warningPages}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pages w/ Warnings</div>
                  </div>

                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-display)' }}>
                      {siteData.stats.healthyPages}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Healthy Pages</div>
                  </div>
                </div>

                {/* Summary list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>Inventory Tracking:</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#c084fc' }}>● Total Discovered URLs</span>
                    <span style={{ fontWeight: 700 }}>{siteData.stats.totalDiscoveredUrls.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#38bdf8' }}>● XML Sitemap URLs</span>
                    <span style={{ fontWeight: 700 }}>{siteData.stats.sitemapUrlsFound.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#f87171' }}>● Missing ALT Images</span>
                    <span style={{ fontWeight: 700 }}>{siteData.stats.totalMissingAltImages.toLocaleString()}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="no-print" style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px', overflowX: 'auto', gap: '4px' }}>
              {[
                { id: 'site-health', label: 'Crawled Pages Explorer', icon: Database, count: siteData.pages.length },
                { id: 'missing-alts', label: 'Missing Image ALTs Tracking', icon: ImageIcon, count: siteData.allMissingAltImages?.length || 0 },
                { id: 'discovered-urls', label: 'All Discovered Sitemap URLs', icon: Link2, count: siteData.allDiscoveredUrls.length },
                { id: 'site-issues', label: 'Site-Wide Issues & Bulk Fixes', icon: AlertTriangle, count: siteData.aggregateIssues.length },
                { id: 'ahrefs-metrics', label: 'Ahrefs Domain Authority', icon: Award }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={16} />
                    {tab.label}
                    {tab.count !== undefined && (
                      <span style={{
                        background: tab.id === 'missing-alts' ? 'rgba(239, 68, 68, 0.2)' : isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        color: tab.id === 'missing-alts' ? '#f87171' : isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {tab.count.toLocaleString()}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB: Missing Image ALTs Tracking (Site-Wide) */}
            {activeTab === 'missing-alts' && (
              <div className="animate-fade-in glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon size={20} color="#f87171" /> Missing Image ALT Attributes Tracking ({siteData.allMissingAltImages?.length || 0})
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Exact image URLs, previews, source pages, and suggested replacement ALT text across the crawled pages
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative', width: '280px' }}>
                      <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        className="input-field"
                        style={{ padding: '8px 12px 8px 36px', fontSize: '0.85rem' }}
                        placeholder="Search image or page title..."
                        value={missingAltSearchFilter}
                        onChange={(e) => setMissingAltSearchFilter(e.target.value)}
                      />
                    </div>
                    <button onClick={exportMissingAltCSV} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                      <Download size={14} /> Export Missing ALTs (CSV)
                    </button>
                  </div>
                </div>

                <div className="table-container" style={{ maxHeight: '600px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Preview</th>
                        <th>Image File URL & Path</th>
                        <th>Found on Page (Title & URL)</th>
                        <th>Suggested ALT Fix</th>
                        <th style={{ width: '120px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMissingAltImages.map((img, i) => (
                        <tr key={i}>
                          <td>
                            <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', background: '#0f172a', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img
                                src={img.imgSrc}
                                alt={img.suggestedAlt}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            </div>
                          </td>
                          <td style={{ maxWidth: '300px' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--accent-secondary)', wordBreak: 'break-all' }}>
                              {img.imgSrc.split('/').pop()}
                            </div>
                            <a href={img.imgSrc} target="_blank" rel="noreferrer" style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                              Open Full Image <ExternalLink size={10} />
                            </a>
                          </td>
                          <td style={{ maxWidth: '320px' }}>
                            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {img.pageTitle || '[Page Title]'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                              {img.pageUrl}
                            </div>
                          </td>
                          <td>
                            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: '#34d399', fontWeight: 600 }}>
                              "{img.suggestedAlt}"
                            </div>
                          </td>
                          <td style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <button
                              onClick={() => copyText(img.htmlSnippet, `site-${i}`)}
                              className="btn-secondary"
                              style={{ padding: '5px 10px', fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}
                            >
                              {copiedId === `site-${i}` ? <><CheckCheck size={13} color="#10b981" /> Copied Fix</> : <><Copy size={13} /> Copy HTML Fix</>}
                            </button>

                            {(() => {
                              const key = `${img.pageUrl}::${img.imgSrc}`;
                              const imgStatus = imageVerificationStatus[key];
                              if (imgStatus?.status === 'checking') {
                                return (
                                  <span className="badge badge-info" style={{ justifyContent: 'center', padding: '4px 8px', fontSize: '0.72rem' }}>
                                    <RefreshCw size={11} className="animate-spin" /> Verifying Live...
                                  </span>
                                );
                              }
                              if (imgStatus?.status === 'completed') {
                                return (
                                  <button
                                    onClick={(e) => verifyAndResolveImageAlt(img.pageUrl, img.imgSrc, e)}
                                    className="badge badge-passed"
                                    style={{ justifyContent: 'center', padding: '4px 8px', fontSize: '0.72rem', border: 'none', cursor: 'pointer' }}
                                    title={imgStatus.message}
                                  >
                                    <CheckCircle2 size={12} color="#10b981" /> ALT Resolved!
                                  </button>
                                );
                              }
                              if (imgStatus?.status === 'still_error') {
                                return (
                                  <button
                                    onClick={(e) => verifyAndResolveImageAlt(img.pageUrl, img.imgSrc, e)}
                                    className="badge badge-critical"
                                    style={{ justifyContent: 'center', padding: '4px 8px', fontSize: '0.72rem', border: 'none', cursor: 'pointer' }}
                                    title={imgStatus.message}
                                  >
                                    <AlertCircle size={12} /> Still Missing (Re-test)
                                  </button>
                                );
                              }
                              return (
                                <button
                                  onClick={(e) => verifyAndResolveImageAlt(img.pageUrl, img.imgSrc, e)}
                                  className="btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '0.72rem', width: '100%', justifyContent: 'center', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' }}
                                  title="Audit live page to verify if ALT attribute is now present"
                                >
                                  <Check size={12} /> Check Live ALT
                                </button>
                              );
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: Crawled Pages Table */}
            {activeTab === 'site-health' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['all', 'healthy', 'warnings', 'errors', 'broken'].map(f => (
                      <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className="btn-secondary"
                        style={{
                          background: statusFilter === f ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                          borderColor: statusFilter === f ? 'var(--accent-primary)' : 'var(--border-subtle)',
                          color: statusFilter === f ? '#fff' : 'var(--text-muted)',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          textTransform: 'capitalize'
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div style={{ position: 'relative', width: '320px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="input-field"
                      style={{ padding: '8px 12px 8px 36px', fontSize: '0.85rem' }}
                      placeholder="Filter crawled pages by URL/title..."
                      value={urlSearchFilter}
                      onChange={(e) => setUrlSearchFilter(e.target.value)}
                    />
                  </div>
                </div>

                {Object.keys(urlVerificationStatus).length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    marginBottom: '14px',
                    fontSize: '0.84rem',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCheck size={18} color="var(--accent-primary)" />
                      <span style={{ fontWeight: 700 }}>Live Problem Resolution Tracker:</span>
                      <span className="badge badge-passed" style={{ fontSize: '0.78rem', padding: '3px 10px' }}>
                        ✓ {Object.values(urlVerificationStatus).filter(s => s.status === 'completed').length} Verified Resolved
                      </span>
                      <span className="badge badge-critical" style={{ fontSize: '0.78rem', padding: '3px 10px' }}>
                        ⚠️ {Object.values(urlVerificationStatus).filter(s => s.status === 'still_error').length} Still Unresolved
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      Auditing live URLs directly on click
                    </span>
                  </div>
                )}

                <div className="table-container" style={{ maxHeight: '600px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Page URL & Title</th>
                        <th>Status</th>
                        <th>Depth</th>
                        <th>Health</th>
                        <th>H1 Tag</th>
                        <th>Words</th>
                        <th>Missing Alt</th>
                        <th style={{ minWidth: '150px' }}>Live Resolution Check</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPages.map((page, i) => (
                        <tr key={i} style={{ cursor: 'pointer' }} onClick={() => setSelectedPageModal(page)}>
                          <td style={{ maxWidth: '380px' }}>
                            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {page.meta?.title || <span style={{ color: 'var(--text-dim)' }}>[No Title]</span>}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--accent-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                              {page.url}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${page.statusCode === 200 ? 'badge-passed' : page.statusCode >= 300 && page.statusCode < 400 ? 'badge-info' : 'badge-critical'}`}>
                              {page.statusCode}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Level {page.depth}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: getScoreColor(page.score) }}>
                              {page.score}%
                            </span>
                          </td>
                          <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                            {page.headings?.h1?.[0] || <span style={{ color: '#ef4444' }}>Missing H1</span>}
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>{page.content?.wordCount?.toLocaleString() || 0}</td>
                          <td>
                            {page.images?.missingAlt > 0 ? (
                              <span className="badge badge-critical" style={{ fontSize: '0.75rem' }}>{page.images.missingAlt} Missing</span>
                            ) : (
                              <span className="badge badge-passed" style={{ fontSize: '0.75rem' }}>0</span>
                            )}
                          </td>
                          <td>
                            {(() => {
                              const vStatus = urlVerificationStatus[page.url];
                              if (vStatus?.status === 'checking') {
                                return (
                                  <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', padding: '5px 10px' }}>
                                    <RefreshCw size={12} className="animate-spin" /> Verifying...
                                  </span>
                                );
                              }
                              if (vStatus?.status === 'completed') {
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <button
                                      onClick={(e) => verifyAndResolveUrl(page.url, e)}
                                      className="badge badge-passed"
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', padding: '4px 10px', cursor: 'pointer', border: 'none' }}
                                      title="Click to re-audit live URL again"
                                    >
                                      <CheckCircle2 size={13} color="#10b981" /> Completed ({vStatus.score}%)
                                    </button>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Verified at {vStatus.lastChecked}</span>
                                  </div>
                                );
                              }
                              if (vStatus?.status === 'still_error') {
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <button
                                      onClick={(e) => verifyAndResolveUrl(page.url, e)}
                                      className="badge badge-critical"
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', padding: '4px 10px', cursor: 'pointer', border: 'none' }}
                                      title={vStatus.message}
                                    >
                                      <AlertTriangle size={12} /> Still Error ({vStatus.missingAltCount || 0} ALTs)
                                    </button>
                                    <span style={{ fontSize: '0.68rem', color: '#f87171' }}>Click to Re-test</span>
                                  </div>
                                );
                              }
                              // Default initial state:
                              const hasAnyIssues = (page.score < 80) || (page.images?.missingAlt > 0) || (page.statusCode !== 200);
                              return (
                                <button
                                  onClick={(e) => verifyAndResolveUrl(page.url, e)}
                                  className="btn-secondary"
                                  style={{
                                    padding: '4px 10px',
                                    fontSize: '0.74rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: hasAnyIssues ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                    borderColor: hasAnyIssues ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                                    color: hasAnyIssues ? '#fca5a5' : '#86efac'
                                  }}
                                  title="Check and verify if problems on this URL are resolved"
                                >
                                  <Check size={12} /> Mark Fixed & Check
                                </button>
                              );
                            })()}
                          </td>
                          <td>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedPageModal(page); }}
                              className="btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              Inspect <ChevronRight size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: All Discovered Sitemap URLs */}
            {activeTab === 'discovered-urls' && (
              <div className="animate-fade-in glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                      Complete Discovered URLs Inventory ({siteData.allDiscoveredUrls.length.toLocaleString()})
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Every single URL discovered from XML Sitemaps and internal hyperlink crawling on {siteData.domain}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ position: 'relative', width: '280px' }}>
                      <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        className="input-field"
                        style={{ padding: '8px 12px 8px 36px', fontSize: '0.85rem' }}
                        placeholder="Search across all URLs..."
                        value={discoveredSearchFilter}
                        onChange={(e) => setDiscoveredSearchFilter(e.target.value)}
                      />
                    </div>
                    <button onClick={exportAllDiscoveredUrlsTXT} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      <Download size={14} /> Download All URLs (TXT)
                    </button>
                  </div>
                </div>

                <div className="table-container" style={{ maxHeight: '550px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>URL</th>
                        <th>Source</th>
                        <th>Crawl Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDiscovered.slice(0, 1500).map((item, i) => (
                        <tr key={i}>
                          <td style={{ color: 'var(--text-dim)', fontSize: '0.75rem', width: '50px' }}>{i + 1}</td>
                          <td style={{ color: 'var(--accent-secondary)', wordBreak: 'break-all', fontSize: '0.85rem' }}>
                            {item.url}
                          </td>
                          <td>
                            {item.fromSitemap ? (
                              <span className="badge badge-info">Sitemap.xml</span>
                            ) : (
                              <span className="badge badge-warning">Hyperlink</span>
                            )}
                          </td>
                          <td>
                            {item.isCrawled ? (
                              <span className="badge badge-passed">Audited</span>
                            ) : (
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>Discovered / Queued</span>
                            )}
                          </td>
                          <td>
                            <a href={item.url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', textDecoration: 'none' }}>
                              Visit <ExternalLink size={12} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: All Issues Explorer (Ahrefs Standard Suite) */}
            {activeTab === 'site-issues' && (() => {
              const allIssues = siteData.aggregateIssues || [];
              const criticalCount = allIssues.filter(i => i.severity === 'Critical').length;
              const warningCount = allIssues.filter(i => i.severity === 'Warning').length;
              const passedCount = allIssues.filter(i => i.severity === 'Passed').length;

              // Categories present in the report
              const categories = ['all', ...new Set(allIssues.map(i => i.category))];

              const filteredIssues = allIssues.filter(issue => {
                // Severity filter
                if (issueSeverityFilter !== 'all' && issue.severity !== issueSeverityFilter) return false;
                // Category filter
                if (issueCategoryFilter !== 'all' && issue.category !== issueCategoryFilter) return false;
                // Search filter
                if (issueSearchFilter) {
                  const query = issueSearchFilter.toLowerCase();
                  const matchTitle = (issue.title || '').toLowerCase().includes(query);
                  const matchDesc = (issue.description || '').toLowerCase().includes(query);
                  const matchCat = (issue.category || '').toLowerCase().includes(query);
                  const matchRec = (issue.recommendation || '').toLowerCase().includes(query);
                  const matchUrls = (issue.affectedUrls || []).some(u => u.toLowerCase().includes(query));
                  if (!matchTitle && !matchDesc && !matchCat && !matchRec && !matchUrls) return false;
                }
                return true;
              });

              return (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Summary Metric Header Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid var(--accent-primary)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total SEO Checks Flagged</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', marginTop: '4px' }}>
                        {allIssues.length}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Across {siteData.pages.length} crawled pages</div>
                    </div>

                    <div
                      className="glass-panel"
                      onClick={() => setIssueSeverityFilter(issueSeverityFilter === 'Critical' ? 'all' : 'Critical')}
                      style={{ padding: '16px 20px', borderLeft: '4px solid #ef4444', cursor: 'pointer', background: issueSeverityFilter === 'Critical' ? 'rgba(239, 68, 68, 0.12)' : undefined }}
                    >
                      <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={14} /> Critical Errors
                      </div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f87171', marginTop: '4px' }}>
                        {criticalCount}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Requires immediate fix</div>
                    </div>

                    <div
                      className="glass-panel"
                      onClick={() => setIssueSeverityFilter(issueSeverityFilter === 'Warning' ? 'all' : 'Warning')}
                      style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b', cursor: 'pointer', background: issueSeverityFilter === 'Warning' ? 'rgba(245, 158, 11, 0.12)' : undefined }}
                    >
                      <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={14} /> Warnings
                      </div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fbbf24', marginTop: '4px' }}>
                        {warningCount}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Optimization opportunities</div>
                    </div>

                    <div
                      className="glass-panel"
                      onClick={() => setIssueSeverityFilter(issueSeverityFilter === 'Passed' ? 'all' : 'Passed')}
                      style={{ padding: '16px 20px', borderLeft: '4px solid #38bdf8', cursor: 'pointer', background: issueSeverityFilter === 'Passed' ? 'rgba(56, 189, 248, 0.12)' : undefined }}
                    >
                      <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={14} /> Notices & Passed
                      </div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>
                        {passedCount}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>Passed standard criteria</div>
                    </div>
                  </div>

                  {/* Filter Toolbar (Ahrefs Style) */}
                  <div className="glass-panel" style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      {/* Severity Selector Tabs */}
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

                      {/* Live Search Input */}
                      <div style={{ position: 'relative', minWidth: '260px' }}>
                        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Search issues, tags, or URLs..."
                          value={issueSearchFilter}
                          onChange={(e) => setIssueSearchFilter(e.target.value)}
                          style={{ padding: '7px 12px 7px 34px', fontSize: '0.82rem' }}
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
                              border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                              background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
                              color: isSelected ? '#fff' : 'var(--text-muted)',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {cat === 'all' ? 'All Categories' : cat} ({countInCat})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Issues List Container */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredIssues.length === 0 ? (
                      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 12px' }} />
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>No Issues Found in this Filter</div>
                        <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Try switching categories or clearing search query.</p>
                      </div>
                    ) : (
                      filteredIssues.map((issue, idx) => {
                        const isExpanded = expandedIssue === idx;
                        const isCrit = issue.severity === 'Critical';
                        const isWarn = issue.severity === 'Warning';
                        const borderCol = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#38bdf8';

                        return (
                          <div
                            key={idx}
                            className="glass-panel"
                            style={{
                              padding: '20px',
                              borderLeft: `5px solid ${borderCol}`,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', gap: '14px' }}
                              onClick={() => setExpandedIssue(isExpanded ? null : idx)}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                  <span className={`badge ${isCrit ? 'badge-critical' : isWarn ? 'badge-warning' : 'badge-passed'}`} style={{ fontSize: '0.72rem', padding: '3px 10px' }}>
                                    {issue.severity === 'Critical' ? '🔴 Error' : issue.severity === 'Warning' ? '🟡 Warning' : '🔵 Notice'}
                                  </span>
                                  <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {issue.category}
                                  </span>
                                  <span className="badge badge-info" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                                    {issue.affectedUrls.length} Affected URL{issue.affectedUrls.length > 1 ? 's' : ''}
                                  </span>
                                </div>

                                <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.2px' }}>
                                  {issue.title}
                                </h3>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '5px', lineHeight: 1.5 }}>
                                  {issue.description}
                                </p>
                              </div>

                              <button
                                className="btn-secondary"
                                style={{ padding: '7px 14px', fontSize: '0.8rem', flexShrink: 0, fontWeight: 600 }}
                              >
                                {isExpanded ? 'Collapse Details' : `View ${issue.affectedUrls.length} Pages (${isExpanded ? '▲' : '▼'})`}
                              </button>
                            </div>

                            {isExpanded && (
                              <div style={{ marginTop: '18px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
                                {/* Actionable Fix Recommendation */}
                                <div style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.85)', borderRadius: '8px', marginBottom: '14px', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                  <span style={{ color: 'var(--accent-secondary)', fontWeight: 700, flexShrink: 0 }}>Recommended Action:</span>
                                  <span style={{ color: '#e2e8f0', lineHeight: 1.5 }}>{issue.recommendation}</span>
                                </div>

                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Affected Pages & Live Resolution Tracker:
                                </div>

                                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {issue.affectedUrls.map((affUrl, uIdx) => {
                                    const key = `${issue.title}::${affUrl}`;
                                    const issStatus = issueVerificationStatus[key];
                                    return (
                                      <div
                                        key={uIdx}
                                        style={{
                                          padding: '8px 12px',
                                          background: 'rgba(255, 255, 255, 0.03)',
                                          borderRadius: '6px',
                                          fontSize: '0.82rem',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          gap: '10px'
                                        }}
                                      >
                                        <span
                                          onClick={() => {
                                            const targetP = siteData.pages.find(p => p.url === affUrl);
                                            if (targetP) setSelectedPageModal(targetP);
                                          }}
                                          style={{
                                            color: 'var(--accent-secondary)',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            flex: 1,
                                            fontWeight: 500
                                          }}
                                          title={`Inspect ${affUrl}`}
                                        >
                                          {affUrl}
                                        </span>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                          {(() => {
                                            if (issStatus?.status === 'checking') {
                                              return (
                                                <span className="badge badge-info" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                                                  <RefreshCw size={11} className="animate-spin" /> Live Checking...
                                                </span>
                                              );
                                            }
                                            if (issStatus?.status === 'completed') {
                                              return (
                                                <button
                                                  onClick={(e) => verifyAndResolveIssue(issue.title, affUrl, e)}
                                                  className="badge badge-passed"
                                                  style={{ fontSize: '0.72rem', padding: '3px 8px', border: 'none', cursor: 'pointer' }}
                                                  title={issStatus.message}
                                                >
                                                  <CheckCircle2 size={11} color="#10b981" /> Verified Fixed!
                                                </button>
                                              );
                                            }
                                            if (issStatus?.status === 'still_error') {
                                              return (
                                                <button
                                                  onClick={(e) => verifyAndResolveIssue(issue.title, affUrl, e)}
                                                  className="badge badge-critical"
                                                  style={{ fontSize: '0.72rem', padding: '3px 8px', border: 'none', cursor: 'pointer' }}
                                                  title={issStatus.message}
                                                >
                                                  <AlertTriangle size={11} /> Still Error (Re-test)
                                                </button>
                                              );
                                            }
                                            return (
                                              <button
                                                onClick={(e) => verifyAndResolveIssue(issue.title, affUrl, e)}
                                                className="btn-secondary"
                                                style={{ padding: '3px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                                                title="Audit live page to verify if this issue has been resolved"
                                              >
                                                <Check size={11} /> Check Fix
                                              </button>
                                            );
                                          })()}

                                          <button
                                            onClick={() => {
                                              const targetP = siteData.pages.find(p => p.url === affUrl);
                                              if (targetP) setSelectedPageModal(targetP);
                                            }}
                                            className="btn-secondary"
                                            style={{ padding: '3px 8px', fontSize: '0.72rem' }}
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
                      })
                    )}
                  </div>
                </div>
              );
            })()}

            {/* TAB: Ahrefs Domain Authority */}
            {activeTab === 'ahrefs-metrics' && (
              <div className="animate-fade-in glass-panel" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Award size={22} color="#06b6d4" /> Ahrefs Domain & Authority Intelligence
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated backlink profile and domain authority telemetry for {siteData.domain}</p>
                  </div>
                  <span className="badge badge-info">{siteData.domainMetrics.source}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Domain Rating (DR)</div>
                    <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#06b6d4', fontFamily: 'var(--font-display)', margin: '8px 0' }}>
                      {siteData.domainMetrics.domainRating}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>0-100 Logarithmic Scale</div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Backlinks</div>
                    <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#a855f7', fontFamily: 'var(--font-display)', margin: '8px 0' }}>
                      {siteData.domainMetrics.backlinks.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Inbound Hyperlinks</div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Referring Domains</div>
                    <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-display)', margin: '8px 0' }}>
                      {siteData.domainMetrics.referringDomains.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Unique Root Domains</div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '24px', borderRadius: '14px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Monthly Organic Traffic</div>
                    <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'var(--font-display)', margin: '8px 0' }}>
                      ~{siteData.domainMetrics.organicTraffic.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Estimated Search Visits</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* DETAILED PAGE INSPECTION MODAL */}
        {selectedPageModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}>
            <div className="glass-panel" style={{
              maxWidth: '1020px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '28px',
              background: '#0f172a',
              border: '1px solid var(--border-focus)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span className={`badge ${selectedPageModal.score >= 80 ? 'badge-passed' : selectedPageModal.score >= 60 ? 'badge-warning' : 'badge-critical'}`}>
                      Score: {selectedPageModal.score}%
                    </span>
                    <span className="badge badge-info">HTTP {selectedPageModal.statusCode}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Crawl Depth: Level {selectedPageModal.depth}</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>{selectedPageModal.meta?.title || '[No Title]'}</h3>
                  <a href={selectedPageModal.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {selectedPageModal.url} <ExternalLink size={12} />
                  </a>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={(e) => verifyAndResolveUrl(selectedPageModal.url, e)}
                    className="btn-primary"
                    style={{ padding: '7px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {urlVerificationStatus[selectedPageModal.url]?.status === 'checking' ? (
                      <><RefreshCw size={13} className="animate-spin" /> Verifying Live...</>
                    ) : urlVerificationStatus[selectedPageModal.url]?.status === 'completed' ? (
                      <><CheckCircle2 size={14} /> Re-Verify Live URL</>
                    ) : (
                      <><Check size={14} /> Re-Audit & Verify Live Fixes</>
                    )}
                  </button>
                  <button onClick={() => setSelectedPageModal(null)} className="btn-secondary" style={{ padding: '6px' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {urlVerificationStatus[selectedPageModal.url] && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  background: urlVerificationStatus[selectedPageModal.url].status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${urlVerificationStatus[selectedPageModal.url].status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  color: urlVerificationStatus[selectedPageModal.url].status === 'completed' ? '#86efac' : '#fca5a5'
                }}>
                  {urlVerificationStatus[selectedPageModal.url].status === 'completed' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{urlVerificationStatus[selectedPageModal.url].message}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Meta Description ({selectedPageModal.meta?.metaDescriptionLength || 0} chars)</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>{selectedPageModal.meta?.metaDescription || <span style={{ color: '#ef4444' }}>Missing</span>}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>H1 Heading</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>{selectedPageModal.headings?.h1?.[0] || <span style={{ color: '#ef4444' }}>Missing H1</span>}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Canonical URL</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '2px', wordBreak: 'break-all' }}>{selectedPageModal.meta?.canonicalUrl || <span style={{ color: '#f59e0b' }}>None</span>}</div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Word Count & Size</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>{selectedPageModal.content?.wordCount} words ({selectedPageModal.content?.htmlSizeKb} KB)</div>
                </div>
              </div>

              {/* IMAGE ALT TRACKING IN MODAL */}
              <div style={{ background: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ImageIcon size={18} color="var(--accent-secondary)" />
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Image Audit & Exact ALT Tracker</h4>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setModalImgTab('missing')}
                      className="btn-secondary"
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.78rem',
                        background: modalImgTab === 'missing' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                        borderColor: modalImgTab === 'missing' ? '#ef4444' : 'var(--border-subtle)',
                        color: modalImgTab === 'missing' ? '#f87171' : 'var(--text-muted)'
                      }}
                    >
                      Missing Alt ({selectedPageModal.images?.missingAlt || 0})
                    </button>
                    <button
                      onClick={() => setModalImgTab('all')}
                      className="btn-secondary"
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.78rem',
                        background: modalImgTab === 'all' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                        borderColor: modalImgTab === 'all' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                        color: modalImgTab === 'all' ? '#fff' : 'var(--text-muted)'
                      }}
                    >
                      All Images ({selectedPageModal.images?.list?.length || 0})
                    </button>
                  </div>
                </div>

                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(modalImgTab === 'missing' ? selectedPageModal.images?.missingAltList : selectedPageModal.images?.list)?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>
                      <CheckCircle2 size={24} style={{ margin: '0 auto 6px' }} />
                      All images on this page have descriptive ALT tags!
                    </div>
                  ) : (
                    (modalImgTab === 'missing' ? selectedPageModal.images?.missingAltList : selectedPageModal.images?.list)?.map((img, idx) => {
                      const imgKey = `${selectedPageModal.url}::${img.src}`;
                      const imgStatus = imageVerificationStatus[imgKey];
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '12px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '8px',
                            border: '1px solid ' + (img.hasAlt ? 'var(--border-subtle)' : 'rgba(239, 68, 68, 0.3)')
                          }}
                        >
                          <div style={{ width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', background: '#0a0d14', border: '1px solid var(--border-subtle)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                              src={img.src}
                              alt={img.alt || img.suggestedAlt}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                              {img.hasAlt ? (
                                <span className="badge badge-passed" style={{ fontSize: '0.7rem' }}>ALT: "{img.alt}"</span>
                              ) : (
                                <span className="badge badge-critical" style={{ fontSize: '0.7rem' }}>Missing ALT Attribute</span>
                              )}
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Image #{img.index || idx + 1}</span>
                            </div>

                            <div style={{ fontSize: '0.82rem', color: 'var(--accent-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {img.src}
                            </div>

                            {!img.hasAlt && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                <span style={{ color: '#34d399', fontWeight: 600 }}>Suggested ALT: </span>"{img.suggestedAlt}"
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <a
                              href={img.src}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-secondary"
                              style={{ padding: '6px 8px', fontSize: '0.75rem', textDecoration: 'none' }}
                              title="Open image in new tab"
                            >
                              <ExternalLink size={13} />
                            </a>
                            <button
                              onClick={() => copyText(img.htmlSnippet, `modal-${idx}`)}
                              className="btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                              title="Copy complete <img> tag with suggested ALT text"
                            >
                              {copiedId === `modal-${idx}` ? <CheckCheck size={13} color="#10b981" /> : <Copy size={13} />}
                            </button>

                            {(() => {
                              if (imgStatus?.status === 'checking') {
                                return (
                                  <span className="badge badge-info" style={{ padding: '5px 8px', fontSize: '0.72rem' }}>
                                    <RefreshCw size={11} className="animate-spin" />
                                  </span>
                                );
                              }
                              if (imgStatus?.status === 'completed') {
                                return (
                                  <span className="badge badge-passed" style={{ padding: '5px 8px', fontSize: '0.72rem' }} title={imgStatus.message}>
                                    <CheckCircle2 size={12} color="#10b981" /> Verified
                                  </span>
                                );
                              }
                              if (imgStatus?.status === 'still_error') {
                                return (
                                  <button
                                    onClick={(e) => verifyAndResolveImageAlt(selectedPageModal.url, img.src, e)}
                                    className="badge badge-critical"
                                    style={{ padding: '5px 8px', fontSize: '0.72rem', cursor: 'pointer', border: 'none' }}
                                    title="Still missing on live site. Click to retry."
                                  >
                                    <AlertTriangle size={11} /> Missing
                                  </button>
                                );
                              }
                              return (
                                <button
                                  onClick={(e) => verifyAndResolveImageAlt(selectedPageModal.url, img.src, e)}
                                  className="btn-secondary"
                                  style={{ padding: '5px 8px', fontSize: '0.72rem', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' }}
                                  title="Check if ALT tag exists on live page"
                                >
                                  <Check size={12} /> Verify
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>Other Technical Issues on this URL:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedPageModal.issues || []).map((iss, i) => {
                  const issueKey = `${iss.title}::${selectedPageModal.url}`;
                  const issStatus = issueVerificationStatus[issueKey];
                  return (
                    <div key={i} style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className={`badge ${iss.severity === 'Critical' ? 'badge-critical' : iss.severity === 'Warning' ? 'badge-warning' : 'badge-passed'}`}>{iss.severity}</span>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{iss.title}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{iss.description}</div>
                      </div>

                      <div>
                        {(() => {
                          if (issStatus?.status === 'checking') {
                            return (
                              <span className="badge badge-info" style={{ fontSize: '0.74rem', padding: '4px 8px' }}>
                                <RefreshCw size={11} className="animate-spin" /> Verifying...
                              </span>
                            );
                          }
                          if (issStatus?.status === 'completed') {
                            return (
                              <span className="badge badge-passed" style={{ fontSize: '0.74rem', padding: '4px 8px' }}>
                                <CheckCircle2 size={12} color="#10b981" /> Resolved
                              </span>
                            );
                          }
                          if (issStatus?.status === 'still_error') {
                            return (
                              <button
                                onClick={(e) => verifyAndResolveIssue(iss.title, selectedPageModal.url, e)}
                                className="badge badge-critical"
                                style={{ fontSize: '0.74rem', padding: '4px 8px', border: 'none', cursor: 'pointer' }}
                                title="Issue still detected"
                              >
                                <AlertTriangle size={11} /> Still Error (Re-test)
                              </button>
                            );
                          }
                          return (
                            <button
                              onClick={(e) => verifyAndResolveIssue(iss.title, selectedPageModal.url, e)}
                              className="btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Check size={12} /> Verify Fix
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. AUTHENTICATION MODAL (LOGIN & REGISTRATION) */}
        {/* ========================================================================= */}
        {authModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div className="glass-panel" style={{
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              background: '#0f172a',
              border: '1px solid var(--border-focus)',
              borderRadius: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{authForm.isRegister ? 'Create Account' : 'Welcome Back'}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{authForm.isRegister ? 'Sign up for Ahrefs SEO Pro' : 'Log in to access your saved crawls'}</p>
                  </div>
                </div>
                <button onClick={() => { setAuthModalOpen(null); setAuthError(null); }} className="btn-secondary" style={{ padding: '6px' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Mode Toggle Tabs */}
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '8px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => { setAuthForm(prev => ({ ...prev, isRegister: false })); setAuthError(null); }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: 'none',
                    background: !authForm.isRegister ? 'var(--accent-primary)' : 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthForm(prev => ({ ...prev, isRegister: true })); setAuthError(null); }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: 'none',
                    background: authForm.isRegister ? 'var(--accent-primary)' : 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Register
                </button>
              </div>

              {authError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {authForm.isRegister && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        required
                        className="input-field"
                        style={{ paddingLeft: '38px', width: '100%' }}
                        placeholder="John Doe"
                        value={authForm.name}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      required
                      className="input-field"
                      style={{ paddingLeft: '38px', width: '100%' }}
                      placeholder="auditor@domain.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      required
                      className="input-field"
                      style={{ paddingLeft: '38px', width: '100%' }}
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-primary"
                  style={{ marginTop: '8px', padding: '10px', justifyContent: 'center', width: '100%', fontSize: '0.9rem' }}
                >
                  {authLoading ? <RefreshCw size={16} className="animate-spin" /> : authForm.isRegister ? 'Create Pro Account' : 'Sign In Now'}
                </button>
              </form>

              {/* Quick Demo Fill */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthForm({ email: 'demo@seo.pro', password: 'password123', name: 'SEO Lead Auditor', isRegister: false });
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '6px 12px', width: '100%', justifyContent: 'center' }}
                >
                  ⚡ Fill Demo Credentials (demo@seo.pro)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. AUTO-CRAWL & SCHEDULES MANAGER MODAL */}
        {/* ========================================================================= */}
        {schedulesModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}>
            <div className="glass-panel" style={{
              maxWidth: '920px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '28px',
              background: '#0f172a',
              border: '1px solid var(--border-focus)',
              borderRadius: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={22} color="var(--accent-primary)" /> Automated Background Crawling Engine
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configure scheduled automated audits. Results are automatically saved into your crawl history.</p>
                </div>
                <button onClick={() => setSchedulesModalOpen(false)} className="btn-secondary" style={{ padding: '6px' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Add New Schedule Form */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: 'var(--accent-secondary)' }}>
                  + Set Up New Auto-Crawl Schedule
                </h4>
                <form onSubmit={handleCreateSchedule} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Target Website or Sitemap XML URL</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder="https://example.com/sitemap.xml"
                      value={newScheduleForm.targetUrl}
                      onChange={(e) => setNewScheduleForm(prev => ({ ...prev, targetUrl: e.target.value }))}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Schedule Interval</label>
                    <select
                      className="input-field"
                      value={newScheduleForm.frequency}
                      onChange={(e) => setNewScheduleForm(prev => ({ ...prev, frequency: e.target.value }))}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      <option value="30m">Every 30 Minutes</option>
                      <option value="1h">Every 1 Hour (Hourly)</option>
                      <option value="6h">Every 6 Hours</option>
                      <option value="12h">Every 12 Hours</option>
                      <option value="24h">Daily (Every 24 Hours)</option>
                      <option value="weekly">Weekly (Every 7 Days)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Max Pages Limit</label>
                    <select
                      className="input-field"
                      value={newScheduleForm.maxPages}
                      onChange={(e) => setNewScheduleForm(prev => ({ ...prev, maxPages: e.target.value }))}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      <option value="50">50 Pages</option>
                      <option value="100">100 Pages</option>
                      <option value="250">250 Pages</option>
                      <option value="500">500 Pages</option>
                      <option value="1000">1,000 Pages</option>
                      <option value="5000">5,000 Pages</option>
                    </select>
                  </div>

                  <div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '9px 16px', justifyContent: 'center', fontSize: '0.85rem' }}>
                      <Check size={16} /> Save & Activate Schedule
                    </button>
                  </div>
                </form>
              </div>

              {/* Schedules List */}
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
                Active Automated Schedules ({schedulesList.length})
              </h4>

              {schedulesList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px' }}>
                  <Bot size={36} style={{ margin: '0 auto 10px', color: 'var(--text-dim)' }} />
                  No automated schedules configured yet. Create one above to let the system audit your sites in the background automatically!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {schedulesList.map((sch) => (
                    <div
                      key={sch.id}
                      style={{
                        padding: '16px 20px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '10px',
                        border: '1px solid ' + (sch.active ? 'rgba(99, 102, 241, 0.3)' : 'var(--border-subtle)'),
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '14px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span className={`badge ${sch.active ? 'badge-passed' : 'badge-critical'}`} style={{ fontSize: '0.72rem' }}>
                            {sch.active ? 'Active' : 'Paused'}
                          </span>
                          <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                            {sch.frequency === '30m' ? 'Every 30m' : sch.frequency === '1h' ? 'Every Hour' : sch.frequency === '6h' ? 'Every 6 Hours' : sch.frequency === '24h' ? 'Daily' : 'Weekly'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Max: {sch.maxPages} pages</span>
                        </div>
                        <h5 style={{ fontSize: '0.95rem', fontWeight: 700, wordBreak: 'break-all' }}>{sch.name}</h5>
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent-secondary)', wordBreak: 'break-all' }}>{sch.targetUrl}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Next run: {new Date(sch.nextRun).toLocaleString()} | Status: {sch.lastStatus}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleRunScheduleNow(sch.id)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                          title="Run this crawl immediately in the background"
                        >
                          <PlayCircle size={14} /> Run Now
                        </button>

                        <button
                          onClick={() => handleToggleSchedule(sch.id)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          {sch.active ? <><PauseCircle size={14} /> Pause</> : <><PlayCircle size={14} /> Resume</>}
                        </button>

                        <button
                          onClick={() => handleDeleteSchedule(sch.id)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          title="Delete Schedule"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. AUTOMATIC AUDIT HISTORY EXPLORER MODAL */}
        {/* ========================================================================= */}
        {historyModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}>
            <div className="glass-panel" style={{
              maxWidth: '960px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '28px',
              background: '#0f172a',
              border: '1px solid var(--border-focus)',
              borderRadius: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HistoryIcon size={22} color="#06b6d4" /> Automatically Saved Audit History ({savedHistoryList.length})
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Every completed audit snapshot is saved automatically with full metrics and issue details.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={fetchSavedHistory} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    <RefreshCw size={13} className={loadingHistory ? 'animate-spin' : ''} /> Refresh
                  </button>
                  <button onClick={() => setHistoryModalOpen(false)} className="btn-secondary" style={{ padding: '6px' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {savedHistoryList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <HistoryIcon size={36} style={{ margin: '0 auto 10px', color: 'var(--text-dim)' }} />
                  No audit history saved yet. Run your first audit to see it automatically recorded here!
                </div>
              ) : (
                <div className="table-container" style={{ maxHeight: '550px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Domain & Root URL</th>
                        <th>Health Score</th>
                        <th>Pages Audited</th>
                        <th>Missing ALTs</th>
                        <th>Type</th>
                        <th>Timestamp</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedHistoryList.map((item) => (
                        <tr key={item.id}>
                          <td style={{ maxWidth: '280px' }}>
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{item.domain}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.rootUrl}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${item.score >= 80 ? 'badge-passed' : item.score >= 60 ? 'badge-warning' : 'badge-critical'}`} style={{ fontWeight: 700 }}>
                              {item.score}% ({item.grade})
                            </span>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{item.totalPages} Pages</td>
                          <td>
                            {item.missingAltCount > 0 ? (
                              <span className="badge badge-critical" style={{ fontSize: '0.74rem' }}>{item.missingAltCount} Missing</span>
                            ) : (
                              <span className="badge badge-passed" style={{ fontSize: '0.74rem' }}>0</span>
                            )}
                          </td>
                          <td>
                            {item.isAutoCrawl ? (
                              <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>🤖 Auto-Crawl</span>
                            ) : (
                              <span className="badge" style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-muted)' }}>Manual</span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                            {new Date(item.timestamp).toLocaleString()}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => loadHistorySnapshot(item.id)}
                                className="btn-primary"
                                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                title="Load this complete snapshot into the main audit view"
                              >
                                <Eye size={12} /> Load
                              </button>
                              <button
                                onClick={(e) => deleteHistoryItem(item.id, e)}
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#f87171' }}
                                title="Delete from history"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="no-print" style={{ borderTop: '1px solid var(--border-subtle)', padding: '24px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        Ahrefs Site Auditor Pro &bull; Real-Time Streaming AJAX Percentage & Image ALT Intelligence Suite
      </footer>
    </div>
  );
}
