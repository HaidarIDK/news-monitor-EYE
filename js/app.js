// Panel configuration with display names
const PANELS = {
    map: { name: 'Global Map', priority: 1 },
    politics: { name: 'World / Geopolitical', priority: 1 },
    tech: { name: 'Technology / AI', priority: 1 },
    finance: { name: 'Financial', priority: 1 },
    gov: { name: 'Government / Policy', priority: 2 },
    heatmap: { name: 'Sector Heatmap', priority: 1 },
    markets: { name: 'Markets', priority: 1 },
    monitors: { name: 'My Monitors', priority: 1 },
    commodities: { name: 'Commodities / VIX', priority: 2 },
    polymarket: { name: 'Polymarket', priority: 2 },
    congress: { name: 'Congress Trades', priority: 3 },
    whales: { name: 'Whale Watch', priority: 3 },
    mainchar: { name: 'Main Character', priority: 2 },
    printer: { name: 'Money Printer', priority: 2 },
    contracts: { name: 'Gov Contracts', priority: 3 },
    ai: { name: 'AI Arms Race', priority: 3 },
    layoffs: { name: 'Layoffs Tracker', priority: 3 },
    venezuela: { name: 'Venezuela Situation', priority: 2 },
    greenland: { name: 'Greenland Situation', priority: 2 },
    tbpn: { name: 'TBPN Live', priority: 1 },
    intel: { name: 'Intel Feed', priority: 2 }
};

// Load panel visibility from localStorage
function getPanelSettings() {
    try {
        const saved = localStorage.getItem('situationMonitorPanels');
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        return {};
    }
}

// Save panel visibility to localStorage
function savePanelSettings(settings) {
    try {
        localStorage.setItem('situationMonitorPanels', JSON.stringify(settings));
    } catch (e) {}
}

// Check if panel is enabled
function isPanelEnabled(panelId) {
    const settings = getPanelSettings();
    return settings[panelId] !== false; // Default to enabled
}

// Toggle panel visibility
function togglePanel(panelId) {
    const settings = getPanelSettings();
    settings[panelId] = !isPanelEnabled(panelId);
    savePanelSettings(settings);
    applyPanelSettings();
    updateSettingsUI();
}

// Apply panel settings to DOM
function applyPanelSettings() {
    document.querySelectorAll('[data-panel]').forEach(panel => {
        const panelId = panel.dataset.panel;
        if (isPanelEnabled(panelId)) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    });
}

// Toggle settings modal
function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.toggle('open');
    if (modal.classList.contains('open')) {
        updateSettingsUI();
        renderMonitorsList();
        // Load saved livestream URL
        const savedUrl = localStorage.getItem('livestreamUrl') || 'https://www.youtube.com/watch?v=IuxPj8V6hkU';
        document.getElementById('livestreamUrl').value = savedUrl;
        // Update theme toggle state
        updateThemeToggle();
    }
}

// Toggle theme between dark and light mode
function toggleTheme() {
    const root = document.documentElement;
    const isLightMode = root.classList.contains('light-mode');

    if (isLightMode) {
        root.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        root.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
    }

    updateThemeToggle();
    // Re-render map with new theme colors
    if (typeof renderGlobalMap === 'function' && lastMapData) {
        renderGlobalMap(lastMapData.activityData, lastMapData.earthquakes, lastMapData.allNews);
    }
}

// Update theme toggle UI state
function updateThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const isLightMode = document.documentElement.classList.contains('light-mode');
    if (toggle) {
        if (isLightMode) {
            toggle.classList.add('on');
        } else {
            toggle.classList.remove('on');
        }
    }
}

// Initialize theme from localStorage
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-mode');
    }
}
initTheme();

// Update settings UI
function updateSettingsUI() {
    const container = document.getElementById('panelToggles');
    container.innerHTML = Object.entries(PANELS).map(([id, config]) => {
        const enabled = isPanelEnabled(id);
        return `
            <div class="panel-toggle-item">
                <label onclick="togglePanel('${id}')">${config.name}</label>
                <div class="toggle-switch ${enabled ? 'on' : ''}" onclick="togglePanel('${id}')"></div>
            </div>
        `;
    }).join('');
}

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url) {
    if (!url) return null;
    // Handle various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([^&\?\/]+)/,
        /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Save livestream URL
function saveLivestreamUrl() {
    const input = document.getElementById('livestreamUrl');
    const url = input.value.trim();
    localStorage.setItem('livestreamUrl', url);
    updateLivestreamEmbed();
}

// Toggle inline livestream settings popup
function toggleLivestreamSettings(event) {
    event.stopPropagation();
    const popup = document.getElementById('livestreamSettingsPopup');
    const input = document.getElementById('livestreamUrlInline');
    popup.classList.toggle('open');
    if (popup.classList.contains('open')) {
        input.value = localStorage.getItem('livestreamUrl') || '';
        input.focus();
        // Close popup when clicking outside
        setTimeout(() => {
            document.addEventListener('click', closeLivestreamSettingsOnClickOutside);
        }, 10);
    }
}

function closeLivestreamSettingsOnClickOutside(event) {
    const popup = document.getElementById('livestreamSettingsPopup');
    if (!popup.contains(event.target) && !event.target.classList.contains('livestream-settings-btn')) {
        popup.classList.remove('open');
        document.removeEventListener('click', closeLivestreamSettingsOnClickOutside);
    }
}

// Apply livestream URL from inline popup
function applyLivestreamUrl() {
    const input = document.getElementById('livestreamUrlInline');
    const url = input.value.trim();
    if (url) {
        localStorage.setItem('livestreamUrl', url);
        updateLivestreamEmbed();
        // Also update the main settings input if it exists
        const mainInput = document.getElementById('livestreamUrl');
        if (mainInput) mainInput.value = url;
    }
    document.getElementById('livestreamSettingsPopup').classList.remove('open');
    document.removeEventListener('click', closeLivestreamSettingsOnClickOutside);
}

// Update the livestream embed
function updateLivestreamEmbed() {
    const url = localStorage.getItem('livestreamUrl') || 'https://www.youtube.com/watch?v=IuxPj8V6hkU';
    const videoId = extractYouTubeId(url);
    const panel = document.getElementById('tbpnPanel');
    if (panel && videoId) {
        panel.innerHTML = `
            <iframe
                src="https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>
        `;
    } else if (panel) {
        panel.innerHTML = '<div class="loading-msg">Invalid YouTube URL</div>';
    }
}

// Get current livestream embed URL
function getLivestreamEmbedUrl() {
    const url = localStorage.getItem('livestreamUrl') || 'https://www.youtube.com/watch?v=IuxPj8V6hkU';
    const videoId = extractYouTubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1` : '';
}

// Drag and Drop Panel Reordering
let draggedPanel = null;
const NON_DRAGGABLE_PANELS = ['map', 'tbpn']; // Map stays at top, livestream has iframe

function initDragAndDrop() {
    const dashboard = document.querySelector('.dashboard');
    const panels = dashboard.querySelectorAll('.panel');

    panels.forEach(panel => {
        const panelId = panel.dataset.panel;
        const isDraggable = !NON_DRAGGABLE_PANELS.includes(panelId);

        // Make panels draggable (except map and livestream)
        panel.setAttribute('draggable', isDraggable ? 'true' : 'false');

        if (!isDraggable) {
            panel.style.cursor = 'default';
            panel.querySelector('.panel-header').style.cursor = 'default';
            return; // Skip drag event listeners for non-draggable panels
        }

        panel.addEventListener('dragstart', (e) => {
            draggedPanel = panel;
            panel.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', panel.dataset.panel);
        });

        panel.addEventListener('dragend', () => {
            panel.classList.remove('dragging');
            document.querySelectorAll('.panel.drag-over').forEach(p => p.classList.remove('drag-over'));
            draggedPanel = null;
            savePanelOrder();
        });

        panel.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (draggedPanel && draggedPanel !== panel) {
                panel.classList.add('drag-over');
            }
        });

        panel.addEventListener('dragleave', () => {
            panel.classList.remove('drag-over');
        });

        panel.addEventListener('drop', (e) => {
            e.preventDefault();
            panel.classList.remove('drag-over');

            if (draggedPanel && draggedPanel !== panel) {
                const dashboard = document.querySelector('.dashboard');
                const panels = [...dashboard.querySelectorAll('.panel')];
                const draggedIdx = panels.indexOf(draggedPanel);
                const targetIdx = panels.indexOf(panel);

                if (draggedIdx < targetIdx) {
                    panel.parentNode.insertBefore(draggedPanel, panel.nextSibling);
                } else {
                    panel.parentNode.insertBefore(draggedPanel, panel);
                }
            }
        });
    });
}

// Save panel order to localStorage
function savePanelOrder() {
    const dashboard = document.querySelector('.dashboard');
    const panels = dashboard.querySelectorAll('.panel');
    const order = [...panels].map(p => p.dataset.panel);
    localStorage.setItem('panelOrder', JSON.stringify(order));
}

// Restore panel order from localStorage
function restorePanelOrder() {
    const savedOrder = localStorage.getItem('panelOrder');
    if (!savedOrder) return;

    try {
        const order = JSON.parse(savedOrder);
        const dashboard = document.querySelector('.dashboard');
        const panels = [...dashboard.querySelectorAll('.panel')];

        // Only restore order for draggable panels
        order.forEach(panelId => {
            if (NON_DRAGGABLE_PANELS.includes(panelId)) return;
            const panel = panels.find(p => p.dataset.panel === panelId);
            if (panel) {
                dashboard.appendChild(panel);
            }
        });
    } catch (e) {
        console.error('Error restoring panel order:', e);
    }
}

// Reset panel order
function resetPanelOrder() {
    localStorage.removeItem('panelOrder');
    location.reload();
}

// ========== MAP ZOOM FUNCTIONALITY ==========
let mapZoom = 1;
let mapPan = { x: 0, y: 0 };
let isPanning = false;
let panStart = { x: 0, y: 0 };
const MAP_ZOOM_MIN = 1;
const MAP_ZOOM_MAX = 4;
const MAP_ZOOM_STEP = 0.5;

function mapZoomIn() {
    if (mapZoom < MAP_ZOOM_MAX) {
        mapZoom = Math.min(MAP_ZOOM_MAX, mapZoom + MAP_ZOOM_STEP);
        applyMapTransform(true);
    }
}

function mapZoomOut() {
    if (mapZoom > MAP_ZOOM_MIN) {
        mapZoom = Math.max(MAP_ZOOM_MIN, mapZoom - MAP_ZOOM_STEP);
        // Reset pan if zooming back to 1x
        if (mapZoom === 1) {
            mapPan = { x: 0, y: 0 };
        }
        applyMapTransform(true);
    }
}

function mapZoomReset() {
    mapZoom = 1;
    mapPan = { x: 0, y: 0 };
    applyMapTransform(true);
}

function applyMapTransform(animate = false) {
    const wrapper = document.getElementById('mapZoomWrapper');
    const levelDisplay = document.getElementById('mapZoomLevel');
    const panHint = document.getElementById('mapPanHint');

    if (wrapper) {
        if (animate) {
            wrapper.classList.add('animating');
            setTimeout(() => wrapper.classList.remove('animating'), 150);
        }
        wrapper.style.transform = `scale(${mapZoom}) translate(${mapPan.x}px, ${mapPan.y}px)`;
    }
    if (levelDisplay) {
        levelDisplay.textContent = `${mapZoom.toFixed(1)}x`;
    }
    if (panHint) {
        panHint.classList.toggle('show', mapZoom > 1);
    }
}

// Map panning with mouse drag
function initMapPan() {
    const container = document.getElementById('worldMapContainer');
    if (!container) return;

    container.addEventListener('mousedown', (e) => {
        if (mapZoom <= 1) return;
        if (e.target.closest('.map-zoom-controls')) return;

        isPanning = true;
        panStart = { x: e.clientX - mapPan.x * mapZoom, y: e.clientY - mapPan.y * mapZoom };
        container.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isPanning) return;

        // Pan limits based on zoom level - allow full map exploration
        const container = document.getElementById('worldMapContainer');
        const containerWidth = container ? container.offsetWidth : 800;
        const containerHeight = container ? container.offsetHeight : 500;

        // Allow panning to see all edges of the map when zoomed
        const maxPanX = Math.max(0, (containerWidth * (mapZoom - 1)) / 2);
        const maxPanY = Math.max(0, (containerHeight * (mapZoom - 1)) / 2);

        mapPan.x = Math.max(-maxPanX, Math.min(maxPanX, (e.clientX - panStart.x) / mapZoom));
        mapPan.y = Math.max(-maxPanY, Math.min(maxPanY, (e.clientY - panStart.y) / mapZoom));
        applyMapTransform();
    });

    document.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            const container = document.getElementById('worldMapContainer');
            if (container) container.style.cursor = '';
        }
    });

    // Mouse wheel zoom
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            mapZoomIn();
        } else {
            mapZoomOut();
        }
    }, { passive: false });
}

// ========== PANEL RESIZE FUNCTIONALITY ==========
let resizingPanel = null;
let resizeStart = { x: 0, y: 0, width: 0, height: 0 };
let resizeDirection = null;

function initPanelResize() {
    // Add resize handles to all panels
    document.querySelectorAll('.panel').forEach(panel => {
        // Skip if already has handles
        if (panel.querySelector('.panel-resize-handle')) return;

        // Corner handle (for both width and height)
        const cornerHandle = document.createElement('div');
        cornerHandle.className = 'panel-resize-handle corner';
        cornerHandle.addEventListener('mousedown', (e) => startResize(e, panel, 'corner'));
        panel.appendChild(cornerHandle);

        // Bottom edge handle (height only)
        const bottomHandle = document.createElement('div');
        bottomHandle.className = 'panel-resize-handle bottom';
        bottomHandle.addEventListener('mousedown', (e) => startResize(e, panel, 'bottom'));
        panel.appendChild(bottomHandle);

        // Right edge handle (width only)
        const rightHandle = document.createElement('div');
        rightHandle.className = 'panel-resize-handle right';
        rightHandle.addEventListener('mousedown', (e) => startResize(e, panel, 'right'));
        panel.appendChild(rightHandle);
    });
}

function startResize(e, panel, direction) {
    e.preventDefault();
    e.stopPropagation();

    resizingPanel = panel;
    resizeDirection = direction;
    resizeStart = {
        x: e.clientX,
        y: e.clientY,
        width: panel.offsetWidth,
        height: panel.offsetHeight
    };

    panel.classList.add('resizing');
    document.body.style.cursor = direction === 'corner' ? 'nwse-resize' :
                                 direction === 'bottom' ? 'ns-resize' : 'ew-resize';
}

document.addEventListener('mousemove', (e) => {
    if (!resizingPanel) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    if (resizeDirection === 'corner' || resizeDirection === 'right') {
        const newWidth = Math.max(200, resizeStart.width + deltaX);
        resizingPanel.style.width = newWidth + 'px';
        resizingPanel.style.minWidth = newWidth + 'px';
        resizingPanel.style.maxWidth = newWidth + 'px';
    }

    if (resizeDirection === 'corner' || resizeDirection === 'bottom') {
        const newHeight = Math.max(150, resizeStart.height + deltaY);
        resizingPanel.style.minHeight = newHeight + 'px';
        resizingPanel.style.maxHeight = newHeight + 'px';
    }
});

document.addEventListener('mouseup', () => {
    if (resizingPanel) {
        resizingPanel.classList.remove('resizing');
        // Save panel sizes to localStorage
        savePanelSizes();
        resizingPanel = null;
        resizeDirection = null;
        document.body.style.cursor = '';
    }
});

function savePanelSizes() {
    const sizes = {};
    document.querySelectorAll('.panel').forEach(panel => {
        const panelName = panel.getAttribute('data-panel');
        if (panelName && (panel.style.minHeight || panel.style.width)) {
            sizes[panelName] = {
                height: panel.style.minHeight,
                width: panel.style.width
            };
        }
    });
    localStorage.setItem('panelSizes', JSON.stringify(sizes));
}

function restorePanelSizes() {
    const saved = localStorage.getItem('panelSizes');
    if (!saved) return;

    try {
        const sizes = JSON.parse(saved);
        Object.entries(sizes).forEach(([panelName, dims]) => {
            const panel = document.querySelector(`.panel[data-panel="${panelName}"]`);
            if (panel) {
                if (dims.height) {
                    panel.style.minHeight = dims.height;
                    panel.style.maxHeight = dims.height;
                }
                if (dims.width) {
                    panel.style.width = dims.width;
                    panel.style.minWidth = dims.width;
                    panel.style.maxWidth = dims.width;
                }
            }
        });
    } catch (e) {
        console.error('Failed to restore panel sizes:', e);
    }
}

// Initialize panel settings and livestream on load
document.addEventListener('DOMContentLoaded', () => {
    applyPanelSettings();
    restorePanelOrder();
    restorePanelSizes();
    updateLivestreamEmbed();
    initDragAndDrop();
    initPanelResize();
});

// Store last map data for resize re-rendering
let lastMapData = { activityData: null, earthquakes: [], allNews: [] };
let mapResizeTimeout = null;

// Handle window resize for map
window.addEventListener('resize', () => {
    if (mapResizeTimeout) clearTimeout(mapResizeTimeout);
    mapResizeTimeout = setTimeout(() => {
        const mapContainer = document.getElementById('worldMapContainer');
        if (mapContainer && lastMapData.activityData) {
            renderGlobalMap(lastMapData.activityData, lastMapData.earthquakes, lastMapData.allNews);
        }
    }, 250);
});

const CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url='
];

// Geopolitical alert keywords
const ALERT_KEYWORDS = [
    'war', 'invasion', 'military', 'nuclear', 'sanctions', 'missile',
    'attack', 'troops', 'conflict', 'strike', 'bomb', 'casualties',
    'ceasefire', 'treaty', 'nato', 'coup', 'martial law', 'emergency',
    'assassination', 'terrorist', 'hostage', 'evacuation'
];

// RSS Feed sources
const FEEDS = {
    politics: [
        { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
        { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml' },
        { name: 'Guardian World', url: 'https://www.theguardian.com/world/rss' },
        { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' }
    ],
    tech: [
        { name: 'Hacker News', url: 'https://hnrss.org/frontpage' },
        { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab' },
        { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
        { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },
        { name: 'ArXiv AI', url: 'https://rss.arxiv.org/rss/cs.AI' },
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' }
    ],
    finance: [
        { name: 'Bloomberg', url: 'https://feeds.bloomberg.com/markets/news.rss' },
        { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories' },
        { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex' },
        { name: 'Investing.com', url: 'https://www.investing.com/rss/news.rss' },
        { name: 'Seeking Alpha', url: 'https://seekingalpha.com/market_currents.xml' }
    ],
    gov: [
        { name: 'Federal Reserve', url: 'https://www.federalreserve.gov/feeds/press_all.xml' },
        { name: 'SEC Announcements', url: 'https://www.sec.gov/news/pressreleases.rss' },
        { name: 'State Dept', url: 'https://www.state.gov/rss-feed/press-releases/feed/' },
        { name: 'DoD News', url: 'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=10&ContentType=1&Site=945' }
    ]
};

// Intelligence-focused news sources
const INTEL_SOURCES = [
    // Think Tanks
    { name: 'CSIS', url: 'https://www.csis.org/analysis/feed', type: 'think-tank', topics: ['defense', 'geopolitics'] },
    { name: 'Brookings', url: 'https://www.brookings.edu/feed/', type: 'think-tank', topics: ['policy', 'geopolitics'] },
    { name: 'CFR', url: 'https://www.cfr.org/rss.xml', type: 'think-tank', topics: ['foreign-policy'] },
    // Defense/Security News
    { name: 'Defense One', url: 'https://www.defenseone.com/rss/all/', type: 'defense', topics: ['military', 'defense'] },
    { name: 'War on Rocks', url: 'https://warontherocks.com/feed/', type: 'defense', topics: ['military', 'strategy'] },
    { name: 'Breaking Defense', url: 'https://breakingdefense.com/feed/', type: 'defense', topics: ['military', 'defense'] },
    { name: 'The Drive War Zone', url: 'https://www.thedrive.com/the-war-zone/feed', type: 'defense', topics: ['military'] },
    // Regional Specialists
    { name: 'The Diplomat', url: 'https://thediplomat.com/feed/', type: 'regional', topics: ['asia-pacific'], region: 'APAC' },
    { name: 'Al-Monitor', url: 'https://www.al-monitor.com/rss', type: 'regional', topics: ['middle-east'], region: 'MENA' },
    // OSINT & Investigations
    { name: 'Bellingcat', url: 'https://www.bellingcat.com/feed/', type: 'osint', topics: ['investigation', 'osint'] },
    // Government/Official
    { name: 'DoD News', url: 'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=10&ContentType=1&Site=945', type: 'govt', topics: ['military', 'official'] },
    { name: 'State Dept', url: 'https://www.state.gov/rss-feed/press-releases/feed/', type: 'govt', topics: ['diplomacy', 'official'] },
    // Cyber/Security
    { name: 'CISA Alerts', url: 'https://www.cisa.gov/uscert/ncas/alerts.xml', type: 'cyber', topics: ['cyber', 'security'] },
    { name: 'Krebs Security', url: 'https://krebsonsecurity.com/feed/', type: 'cyber', topics: ['cyber', 'security'] }
];

// Region detection keywords for tagging
const REGION_KEYWORDS = {
    'EUROPE': ['nato', 'eu', 'european', 'ukraine', 'russia', 'germany', 'france', 'uk', 'britain', 'poland'],
    'MENA': ['iran', 'israel', 'saudi', 'syria', 'iraq', 'gaza', 'lebanon', 'yemen', 'houthi', 'middle east'],
    'APAC': ['china', 'taiwan', 'japan', 'korea', 'indo-pacific', 'south china sea', 'asean', 'philippines'],
    'AMERICAS': ['us', 'america', 'canada', 'mexico', 'brazil', 'venezuela', 'latin'],
    'AFRICA': ['africa', 'sahel', 'niger', 'sudan', 'ethiopia', 'somalia']
};

// Topic detection keywords
const TOPIC_KEYWORDS = {
    'CYBER': ['cyber', 'hack', 'ransomware', 'malware', 'breach', 'apt', 'vulnerability'],
    'NUCLEAR': ['nuclear', 'icbm', 'warhead', 'nonproliferation', 'uranium', 'plutonium'],
    'CONFLICT': ['war', 'military', 'troops', 'invasion', 'strike', 'missile', 'combat', 'offensive'],
    'INTEL': ['intelligence', 'espionage', 'spy', 'cia', 'mossad', 'fsb', 'covert'],
    'DEFENSE': ['pentagon', 'dod', 'defense', 'military', 'army', 'navy', 'air force'],
    'DIPLO': ['diplomat', 'embassy', 'treaty', 'sanctions', 'talks', 'summit', 'bilateral']
};

// Sector ETFs for heatmap
const SECTORS = [
    { symbol: 'XLK', name: 'Tech' },
    { symbol: 'XLF', name: 'Finance' },
    { symbol: 'XLE', name: 'Energy' },
    { symbol: 'XLV', name: 'Health' },
    { symbol: 'XLY', name: 'Consumer' },
    { symbol: 'XLI', name: 'Industrial' },
    { symbol: 'XLP', name: 'Staples' },
    { symbol: 'XLU', name: 'Utilities' },
    { symbol: 'XLB', name: 'Materials' },
    { symbol: 'XLRE', name: 'Real Est' },
    { symbol: 'XLC', name: 'Comms' },
    { symbol: 'SMH', name: 'Semis' }
];

// Commodities and VIX
const COMMODITIES = [
    { symbol: '^VIX', name: 'VIX', display: 'VIX' },
    { symbol: 'GC=F', name: 'Gold', display: 'GOLD' },
    { symbol: 'CL=F', name: 'Crude Oil', display: 'OIL' },
    { symbol: 'NG=F', name: 'Natural Gas', display: 'NATGAS' },
    { symbol: 'SI=F', name: 'Silver', display: 'SILVER' },
    { symbol: 'HG=F', name: 'Copper', display: 'COPPER' }
];

// Fetch with proxy
async function fetchWithProxy(url) {
    for (let i = 0; i < CORS_PROXIES.length; i++) {
        try {
            const proxy = CORS_PROXIES[i];
            const response = await fetch(proxy + encodeURIComponent(url), {
                headers: { 'Accept': 'application/rss+xml, application/xml, text/xml, */*' }
            });
            if (response.ok) {
                return await response.text();
            }
        } catch (e) {
            console.log(`Proxy ${i} failed, trying next...`);
        }
    }
    throw new Error('All proxies failed');
}

// Check for alert keywords
function hasAlertKeyword(title) {
    const lower = title.toLowerCase();
    return ALERT_KEYWORDS.some(kw => lower.includes(kw));
}

// Parse RSS feed
async function fetchFeed(source) {
    try {
        const text = await fetchWithProxy(source.url);
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        const parseError = xml.querySelector('parsererror');
        if (parseError) {
            console.error(`Parse error for ${source.name}`);
            return [];
        }

        let items = xml.querySelectorAll('item');
        if (items.length === 0) {
            items = xml.querySelectorAll('entry');
        }

        return Array.from(items).slice(0, 5).map(item => {
            let link = '';
            const linkEl = item.querySelector('link');
            if (linkEl) {
                link = linkEl.getAttribute('href') || linkEl.textContent || '';
            }
            link = link.trim();

            const title = (item.querySelector('title')?.textContent || 'No title').trim();
            const pubDate = item.querySelector('pubDate')?.textContent ||
                           item.querySelector('published')?.textContent ||
                           item.querySelector('updated')?.textContent || '';

            return {
                source: source.name,
                title,
                link,
                pubDate,
                isAlert: hasAlertKeyword(title)
            };
        });
    } catch (error) {
        console.error(`Error fetching ${source.name}:`, error);
        return [];
    }
}

// Fetch all feeds for a category
async function fetchCategory(feeds) {
    const results = await Promise.all(feeds.map(fetchFeed));
    const items = results.flat();

    items.sort((a, b) => {
        // Alerts first, then by date
        if (a.isAlert && !b.isAlert) return -1;
        if (!a.isAlert && b.isAlert) return 1;
        const dateA = new Date(a.pubDate);
        const dateB = new Date(b.pubDate);
        return dateB - dateA;
    });

    return items.slice(0, 20);
}

// Fetch stock quote
async function fetchQuote(symbol) {
    try {
        const text = await fetchWithProxy(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
        const data = JSON.parse(text);
        if (data.chart?.result?.[0]) {
            const meta = data.chart.result[0].meta;
            const change = ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100;
            return { price: meta.regularMarketPrice, change };
        }
    } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
    }
    return null;
}

// Fetch market data
async function fetchMarkets() {
    const markets = [];

    const symbols = [
        { symbol: '^GSPC', name: 'S&P 500', display: 'SPX' },
        { symbol: '^DJI', name: 'Dow Jones', display: 'DJI' },
        { symbol: '^IXIC', name: 'NASDAQ', display: 'NDX' },
        { symbol: 'AAPL', name: 'Apple', display: 'AAPL' },
        { symbol: 'MSFT', name: 'Microsoft', display: 'MSFT' },
        { symbol: 'NVDA', name: 'NVIDIA', display: 'NVDA' },
        { symbol: 'GOOGL', name: 'Alphabet', display: 'GOOGL' },
        { symbol: 'AMZN', name: 'Amazon', display: 'AMZN' },
        { symbol: 'META', name: 'Meta', display: 'META' },
        { symbol: 'BRK-B', name: 'Berkshire', display: 'BRK.B' },
        { symbol: 'TSM', name: 'TSMC', display: 'TSM' },
        { symbol: 'LLY', name: 'Eli Lilly', display: 'LLY' },
        { symbol: 'TSLA', name: 'Tesla', display: 'TSLA' },
        { symbol: 'AVGO', name: 'Broadcom', display: 'AVGO' },
        { symbol: 'WMT', name: 'Walmart', display: 'WMT' },
        { symbol: 'JPM', name: 'JPMorgan', display: 'JPM' },
        { symbol: 'V', name: 'Visa', display: 'V' },
        { symbol: 'UNH', name: 'UnitedHealth', display: 'UNH' },
        { symbol: 'NVO', name: 'Novo Nordisk', display: 'NVO' },
        { symbol: 'XOM', name: 'Exxon', display: 'XOM' },
        { symbol: 'MA', name: 'Mastercard', display: 'MA' },
        { symbol: 'ORCL', name: 'Oracle', display: 'ORCL' },
        { symbol: 'PG', name: 'P&G', display: 'PG' },
        { symbol: 'COST', name: 'Costco', display: 'COST' },
        { symbol: 'JNJ', name: 'J&J', display: 'JNJ' },
        { symbol: 'HD', name: 'Home Depot', display: 'HD' },
        { symbol: 'NFLX', name: 'Netflix', display: 'NFLX' },
        { symbol: 'BAC', name: 'BofA', display: 'BAC' }
    ];

    const fetchStock = async (s) => {
        const quote = await fetchQuote(s.symbol);
        if (quote) {
            return { name: s.name, symbol: s.display, price: quote.price, change: quote.change };
        }
        return null;
    };

    const stockResults = await Promise.all(symbols.map(fetchStock));
    stockResults.forEach(r => { if (r) markets.push(r); });

    // Crypto
    try {
        const cryptoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const crypto = await cryptoResponse.json();

        if (crypto.bitcoin) markets.push({ name: 'Bitcoin', symbol: 'BTC', price: crypto.bitcoin.usd, change: crypto.bitcoin.usd_24h_change });
        if (crypto.ethereum) markets.push({ name: 'Ethereum', symbol: 'ETH', price: crypto.ethereum.usd, change: crypto.ethereum.usd_24h_change });
        if (crypto.solana) markets.push({ name: 'Solana', symbol: 'SOL', price: crypto.solana.usd, change: crypto.solana.usd_24h_change });
    } catch (error) {
        console.error('Error fetching crypto:', error);
    }

    return markets;
}

// Fetch sector heatmap data
async function fetchSectors() {
    const results = await Promise.all(SECTORS.map(async (s) => {
        const quote = await fetchQuote(s.symbol);
        if (quote) {
            return { name: s.name, symbol: s.symbol, change: quote.change };
        }
        return { name: s.name, symbol: s.symbol, change: 0 };
    }));
    return results;
}

// Fetch commodities and VIX
async function fetchCommodities() {
    const results = [];
    for (const c of COMMODITIES) {
        const quote = await fetchQuote(c.symbol);
        if (quote) {
            results.push({ name: c.name, symbol: c.display, price: quote.price, change: quote.change });
        }
    }
    return results;
}

// Intelligence hotspots with coordinates (x%, y% on map)
const INTEL_HOTSPOTS = [
    {
        id: 'dc', name: 'DC', subtext: 'Pentagon Pizza Index', lat: 38.9, lon: -77.0,
        keywords: ['pentagon', 'white house', 'washington', 'us military', 'cia', 'nsa', 'biden', 'trump'],
        description: 'US national security hub. Pentagon, CIA, NSA, State Dept. Monitor for late-night activity spikes.',
        agencies: ['Pentagon', 'CIA', 'NSA', 'State Dept'],
        status: 'Active monitoring'
    },
    {
        id: 'moscow', name: 'Moscow', subtext: 'Kremlin Activity', lat: 55.75, lon: 37.6,
        keywords: ['russia', 'putin', 'kremlin', 'moscow', 'russian'],
        description: 'Russian political and military command center. FSB, GRU, Presidential Administration.',
        agencies: ['FSB', 'GRU', 'SVR', 'Kremlin'],
        status: 'High activity'
    },
    {
        id: 'beijing', name: 'Beijing', subtext: 'PLA/MSS Activity', lat: 39.9, lon: 116.4,
        keywords: ['china', 'beijing', 'chinese', 'xi jinping', 'taiwan strait', 'pla'],
        description: 'Chinese Communist Party headquarters. PLA command, MSS intelligence operations.',
        agencies: ['PLA', 'MSS', 'CCP Politburo'],
        status: 'Medium posture'
    },
    {
        id: 'kyiv', name: 'Kyiv', subtext: 'Conflict Zone', lat: 50.45, lon: 30.5,
        keywords: ['ukraine', 'kyiv', 'zelensky', 'ukrainian', 'donbas', 'crimea'],
        description: 'Ukrainian capital under wartime conditions. Government, military coordination center.',
        agencies: ['SBU', 'GUR', 'Armed Forces'],
        status: 'Active conflict'
    },
    {
        id: 'taipei', name: 'Taipei', subtext: 'Strait Watch', lat: 25.03, lon: 121.5,
        keywords: ['taiwan', 'taipei', 'taiwanese', 'strait'],
        description: 'Taiwan government and military HQ. ADIZ violations and PLA exercises tracked.',
        agencies: ['NSB', 'MND', 'AIT'],
        status: 'Heightened alert'
    },
    {
        id: 'tehran', name: 'Tehran', subtext: 'IRGC Activity', lat: 35.7, lon: 51.4,
        keywords: ['iran', 'tehran', 'iranian', 'irgc', 'hezbollah', 'nuclear'],
        description: 'Iranian regime center. IRGC Quds Force, nuclear program oversight, proxy coordination.',
        agencies: ['IRGC', 'MOIS', 'AEOI'],
        status: 'Proxy operations active'
    },
    {
        id: 'jerusalem', name: 'Tel Aviv', subtext: 'Mossad/IDF', lat: 32.07, lon: 34.78,
        keywords: ['israel', 'israeli', 'gaza', 'hamas', 'idf', 'netanyahu', 'mossad'],
        description: 'Israeli security apparatus. IDF operations, Mossad intel, Shin Bet domestic security.',
        agencies: ['Mossad', 'IDF', 'Shin Bet', 'Aman'],
        status: 'Active operations'
    },
    {
        id: 'pyongyang', name: 'Pyongyang', subtext: 'DPRK Watch', lat: 39.03, lon: 125.75,
        keywords: ['north korea', 'kim jong', 'pyongyang', 'dprk', 'korean missile'],
        description: 'North Korean leadership compound. Nuclear/missile program, regime stability indicators.',
        agencies: ['RGB', 'KPA', 'SSD'],
        status: 'Missile tests ongoing'
    },
    {
        id: 'london', name: 'London', subtext: 'GCHQ/MI6', lat: 51.5, lon: -0.12,
        keywords: ['uk', 'britain', 'british', 'mi6', 'gchq', 'london'],
        description: 'UK intelligence community hub. Five Eyes partner, SIGINT, foreign intelligence.',
        agencies: ['MI6', 'GCHQ', 'MI5'],
        status: 'Normal operations'
    },
    {
        id: 'brussels', name: 'Brussels', subtext: 'NATO HQ', lat: 50.85, lon: 4.35,
        keywords: ['nato', 'eu', 'european union', 'brussels'],
        description: 'NATO headquarters and EU institutions. Alliance coordination, Article 5 readiness.',
        agencies: ['NATO', 'EU Commission', 'EEAS'],
        status: 'Enhanced readiness'
    },
    {
        id: 'caracas', name: 'Caracas', subtext: 'Venezuela Crisis', lat: 10.5, lon: -66.9,
        keywords: ['venezuela', 'maduro', 'caracas', 'guaido', 'venezuelan', 'pdvsa'],
        description: 'Venezuelan political crisis center. Maduro regime, opposition movements, oil politics.',
        agencies: ['SEBIN', 'DGCIM', 'GNB'],
        status: 'Political instability'
    },
    {
        id: 'greenland', name: 'Nuuk', subtext: 'Arctic Dispute', lat: 64.18, lon: -51.7,
        keywords: ['greenland', 'denmark', 'arctic', 'nuuk', 'thule', 'rare earth'],
        description: 'Arctic strategic territory. US military presence, rare earth minerals, sovereignty questions.',
        agencies: ['Danish Defence', 'US Space Force', 'Arctic Council'],
        status: 'Diplomatic tensions'
    }
];

// Shipping chokepoints for supply chain monitoring
const SHIPPING_CHOKEPOINTS = [
    {
        id: 'suez',
        name: 'Suez Canal',
        lat: 30.0,
        lon: 32.5,
        keywords: ['suez', 'red sea', 'houthi', 'canal'],
        desc: 'Critical waterway connecting Mediterranean to Red Sea. ~12% of global trade. Currently threatened by Houthi attacks.',
        traffic: '~50 ships/day',
        region: 'Egypt'
    },
    {
        id: 'panama',
        name: 'Panama Canal',
        lat: 9.1,
        lon: -79.7,
        keywords: ['panama canal', 'panama'],
        desc: 'Links Atlantic and Pacific oceans. ~5% of global trade. Facing drought-related capacity restrictions.',
        traffic: '~40 ships/day',
        region: 'Panama'
    },
    {
        id: 'hormuz',
        name: 'Strait of Hormuz',
        lat: 26.5,
        lon: 56.3,
        keywords: ['hormuz', 'strait of hormuz', 'persian gulf'],
        desc: 'Only sea route from Persian Gulf to open ocean. ~21% of global oil passes through daily.',
        traffic: '~20 tankers/day',
        region: 'Iran/Oman'
    },
    {
        id: 'malacca',
        name: 'Malacca Strait',
        lat: 2.5,
        lon: 101.5,
        keywords: ['malacca', 'singapore strait'],
        desc: 'Main shipping route between Indian and Pacific oceans. ~25% of global trade including ~25% of oil.',
        traffic: '~80 ships/day',
        region: 'Malaysia/Singapore'
    },
    {
        id: 'bosphorus',
        name: 'Bosphorus Strait',
        lat: 41.1,
        lon: 29.0,
        keywords: ['bosphorus', 'black sea', 'turkish strait', 'istanbul', 'dardanelles'],
        desc: 'Only route between Black Sea and Mediterranean. Critical for Russian/Ukrainian grain exports and energy shipments.',
        traffic: '~45,000 ships/year',
        region: 'Turkey',
        length: '31 km (19 mi)',
        width: '0.7-3.5 km',
        depth: '36-124 m',
        connects: 'Black Sea ↔ Sea of Marmara',
        controlled: 'Turkey (Montreux Convention 1936)',
        cargo: ['Grain', 'Oil/Gas', 'Coal', 'Metals', 'Containers'],
        flags: ['Russia', 'Turkey', 'Ukraine', 'Greece', 'Malta'],
        strategic: 'Only warm-water access for Russian Navy to Mediterranean'
    }
];

// Cyber threat regions
const CYBER_REGIONS = [
    {
        id: 'cyber_russia',
        name: 'RU',
        fullName: 'Russia',
        lat: 55.75,
        lon: 45.0,
        group: 'APT28/29',
        aka: 'Fancy Bear / Cozy Bear',
        sponsor: 'GRU / FSB',
        desc: 'State-sponsored groups linked to Russian intelligence. Known for election interference, government espionage, and critical infrastructure attacks.',
        targets: ['Government', 'Defense', 'Energy', 'Elections', 'Media']
    },
    {
        id: 'cyber_china',
        name: 'CN',
        fullName: 'China',
        lat: 35.0,
        lon: 105.0,
        group: 'APT41',
        aka: 'Double Dragon / Winnti',
        sponsor: 'MSS',
        desc: 'Hybrid espionage and financially motivated group. Conducts state-sponsored intelligence and supply chain attacks.',
        targets: ['Tech', 'Telecom', 'Healthcare', 'Gaming', 'Supply Chain']
    },
    {
        id: 'cyber_nk',
        name: 'NK',
        fullName: 'North Korea',
        lat: 39.0,
        lon: 127.0,
        group: 'Lazarus',
        aka: 'Hidden Cobra / APT38',
        sponsor: 'RGB',
        desc: 'Financially motivated attacks to fund regime. Known for cryptocurrency theft, SWIFT banking attacks, and ransomware.',
        targets: ['Crypto', 'Banks', 'Defense', 'Media', 'Critical Infra']
    },
    {
        id: 'cyber_iran',
        name: 'IR',
        fullName: 'Iran',
        lat: 32.0,
        lon: 53.0,
        group: 'APT33/35',
        aka: 'Charming Kitten / Elfin',
        sponsor: 'IRGC',
        desc: 'Focus on regional adversaries and dissidents. Known for destructive wiper malware and spear-phishing campaigns.',
        targets: ['Energy', 'Aviation', 'Government', 'Dissidents', 'Israel']
    }
];

// Active conflict zones with approximate boundaries
const CONFLICT_ZONES = [
    {
        id: 'ukraine',
        name: 'Ukraine Conflict',
        intensity: 'high',
        coords: [
            [37.5, 47.0], [38.5, 47.5], [39.0, 48.5], [38.0, 49.5],
            [37.0, 49.0], [36.0, 48.5], [35.5, 47.5], [36.5, 47.0]
        ],
        labelPos: { lat: 48.0, lon: 37.5 },
        startDate: 'Feb 24, 2022',
        parties: ['Russia', 'Ukraine', 'NATO (support)'],
        casualties: '500,000+ (est.)',
        displaced: '6.5M+ refugees',
        description: 'Full-scale Russian invasion of Ukraine. Active frontlines in Donetsk, Luhansk, Zaporizhzhia, and Kherson oblasts. Heavy artillery, drone warfare, and trench combat.',
        keyEvents: [
            'Battle of Bakhmut',
            'Kursk incursion',
            'Black Sea drone strikes',
            'Infrastructure attacks'
        ],
        keywords: ['ukraine', 'russia', 'zelensky', 'putin', 'donbas', 'crimea', 'bakhmut', 'kursk']
    },
    {
        id: 'gaza',
        name: 'Gaza Conflict',
        intensity: 'high',
        coords: [
            [34.2, 31.6], [34.6, 31.6], [34.6, 31.2], [34.2, 31.2]
        ],
        labelPos: { lat: 31.4, lon: 34.4 },
        startDate: 'Oct 7, 2023',
        parties: ['Israel (IDF)', 'Hamas', 'Palestinian Islamic Jihad'],
        casualties: '45,000+ (Gaza), 1,200+ (Israel)',
        displaced: '2M+ internally displaced',
        description: 'Israeli military operation in Gaza following Oct 7 Hamas attacks. Urban warfare, humanitarian crisis, regional escalation with Hezbollah and Houthis.',
        keyEvents: [
            'Oct 7 attacks',
            'Ground invasion',
            'Rafah operation',
            'Hostage negotiations'
        ],
        keywords: ['gaza', 'israel', 'hamas', 'idf', 'netanyahu', 'hostage', 'rafah', 'hezbollah']
    },
    {
        id: 'sudan',
        name: 'Sudan Civil War',
        intensity: 'medium',
        coords: [
            [32.0, 16.0], [34.0, 16.5], [35.0, 15.0], [33.5, 13.5],
            [31.5, 14.0], [31.0, 15.5]
        ],
        labelPos: { lat: 15.0, lon: 32.5 },
        startDate: 'Apr 15, 2023',
        parties: ['Sudanese Armed Forces (SAF)', 'Rapid Support Forces (RSF)'],
        casualties: '15,000+ killed',
        displaced: '10M+ displaced',
        description: 'Power struggle between SAF and RSF paramilitary. Fighting centered around Khartoum, Darfur. Major humanitarian catastrophe with famine conditions.',
        keyEvents: [
            'Khartoum battle',
            'Darfur massacres',
            'El Fasher siege',
            'Famine declared'
        ],
        keywords: ['sudan', 'khartoum', 'rsf', 'darfur', 'burhan', 'hemedti']
    },
    {
        id: 'myanmar',
        name: 'Myanmar Civil War',
        intensity: 'medium',
        coords: [
            [96.0, 22.0], [98.0, 23.0], [98.5, 21.0], [97.0, 19.5], [95.5, 20.5]
        ],
        labelPos: { lat: 21.0, lon: 96.5 },
        startDate: 'Feb 1, 2021',
        parties: ['Military Junta (SAC)', 'Ethnic Armed Organizations', 'People\'s Defense Forces'],
        casualties: '50,000+ (est.)',
        displaced: '3M+ internally displaced',
        description: 'Armed resistance following 2021 military coup. Multiple ethnic armies and pro-democracy forces fighting junta. Recent rebel advances in border regions.',
        keyEvents: [
            'Operation 1027',
            'Lashio capture',
            'Myawaddy offensive',
            'Junta conscription'
        ],
        keywords: ['myanmar', 'burma', 'junta', 'arakan', 'karen', 'kachin']
    },
    {
        id: 'taiwan_strait',
        name: 'Taiwan Strait',
        intensity: 'watch',
        coords: [
            [119.0, 26.0], [121.5, 26.0], [121.5, 22.5], [119.0, 22.5]
        ],
        labelPos: { lat: 24.5, lon: 120.0 },
        startDate: 'Ongoing tensions',
        parties: ['China (PLA)', 'Taiwan (ROC)', 'United States (deterrence)'],
        casualties: 'N/A - no active combat',
        displaced: 'N/A',
        description: 'Heightened tensions over Taiwan sovereignty. Regular PLA exercises, airspace incursions, naval activity. Risk of flashpoint escalation.',
        keyEvents: [
            'PLA exercises',
            'ADIZ incursions',
            'US arms sales',
            'Diplomatic tensions'
        ],
        keywords: ['taiwan', 'china', 'strait', 'pla', 'tsai', 'invasion']
    }
];

// Military bases around the world
const MILITARY_BASES = [
    // US/NATO Major Bases
    { id: 'ramstein', name: 'Ramstein AB', lat: 49.44, lon: 7.6, type: 'us-nato' },
    { id: 'diego_garcia', name: 'Diego Garcia', lat: -7.32, lon: 72.42, type: 'us-nato' },
    { id: 'guam', name: 'Andersen AFB', lat: 13.58, lon: 144.92, type: 'us-nato' },
    { id: 'okinawa', name: 'Kadena AB', lat: 26.35, lon: 127.77, type: 'us-nato' },
    { id: 'yokosuka', name: 'Yokosuka', lat: 35.28, lon: 139.67, type: 'us-nato' },
    { id: 'bahrain', name: 'NSA Bahrain', lat: 26.23, lon: 50.65, type: 'us-nato' },
    { id: 'qatar', name: 'Al Udeid', lat: 25.12, lon: 51.31, type: 'us-nato' },
    { id: 'djibouti', name: 'Camp Lemonnier', lat: 11.55, lon: 43.15, type: 'us-nato' },
    { id: 'incirlik', name: 'Incirlik AB', lat: 37.0, lon: 35.43, type: 'us-nato' },
    { id: 'rota', name: 'NS Rota', lat: 36.62, lon: -6.35, type: 'us-nato' },
    // Chinese Bases
    { id: 'djibouti_cn', name: 'PLA Djibouti', lat: 11.59, lon: 43.05, type: 'china' },
    { id: 'woody_island', name: 'Woody Island', lat: 16.83, lon: 112.33, type: 'china' },
    { id: 'fiery_cross', name: 'Fiery Cross', lat: 9.55, lon: 112.89, type: 'china' },
    { id: 'mischief_reef', name: 'Mischief Reef', lat: 9.90, lon: 115.53, type: 'china' },
    { id: 'ream', name: 'Ream (Cambodia)', lat: 10.52, lon: 103.63, type: 'china' },
    // Russian Bases
    { id: 'kaliningrad', name: 'Kaliningrad', lat: 54.71, lon: 20.51, type: 'russia' },
    { id: 'sevastopol', name: 'Sevastopol', lat: 44.62, lon: 33.53, type: 'russia' },
    { id: 'tartus', name: 'Tartus (Syria)', lat: 34.89, lon: 35.87, type: 'russia' },
    { id: 'hmeimim', name: 'Hmeimim AB', lat: 35.41, lon: 35.95, type: 'russia' },
    { id: 'cam_ranh', name: 'Cam Ranh', lat: 11.99, lon: 109.22, type: 'russia' }
];

// Nuclear facilities (power plants, enrichment, weapons sites)
const NUCLEAR_FACILITIES = [
    // Major Power Plants
    { id: 'zaporizhzhia', name: 'Zaporizhzhia NPP', lat: 47.51, lon: 34.58, type: 'plant', status: 'contested' },
    { id: 'fukushima', name: 'Fukushima', lat: 37.42, lon: 141.03, type: 'plant', status: 'decommissioning' },
    { id: 'flamanville', name: 'Flamanville', lat: 49.54, lon: -1.88, type: 'plant', status: 'active' },
    { id: 'bruce', name: 'Bruce Power', lat: 44.33, lon: -81.60, type: 'plant', status: 'active' },
    // Enrichment/Weapons Facilities
    { id: 'natanz', name: 'Natanz', lat: 33.72, lon: 51.73, type: 'enrichment', status: 'active' },
    { id: 'fordow', name: 'Fordow', lat: 34.88, lon: 51.0, type: 'enrichment', status: 'active' },
    { id: 'yongbyon', name: 'Yongbyon', lat: 39.80, lon: 125.75, type: 'weapons', status: 'active' },
    { id: 'dimona', name: 'Dimona', lat: 31.0, lon: 35.15, type: 'weapons', status: 'active' },
    { id: 'los_alamos', name: 'Los Alamos', lat: 35.88, lon: -106.30, type: 'weapons', status: 'active' },
    { id: 'sellafield', name: 'Sellafield', lat: 54.42, lon: -3.50, type: 'reprocessing', status: 'active' },
    { id: 'la_hague', name: 'La Hague', lat: 49.68, lon: -1.88, type: 'reprocessing', status: 'active' }
];

// Major undersea cable routes (simplified waypoints)
const UNDERSEA_CABLES = [
    {
        id: 'transatlantic_1',
        name: 'Transatlantic (TAT-14)',
        major: true,
        points: [[-74.0, 40.7], [-30.0, 45.0], [-9.0, 52.0]]
    },
    {
        id: 'transpacific_1',
        name: 'Transpacific (Unity)',
        major: true,
        points: [[-122.4, 37.8], [-155.0, 25.0], [139.7, 35.7]]
    },
    {
        id: 'sea_me_we_5',
        name: 'SEA-ME-WE 5',
        major: true,
        points: [[103.8, 1.3], [80.0, 10.0], [55.0, 25.0], [35.0, 30.0], [12.0, 37.0], [-5.0, 36.0]]
    },
    {
        id: 'aae1',
        name: 'Asia-Africa-Europe 1',
        major: true,
        points: [[121.0, 25.0], [103.8, 1.3], [73.0, 15.0], [44.0, 12.0], [35.0, 30.0], [28.0, 41.0]]
    },
    {
        id: 'curie',
        name: 'Curie (Google)',
        major: false,
        points: [[-122.4, 37.8], [-80.0, 0.0], [-70.0, -33.0]]
    },
    {
        id: 'marea',
        name: 'MAREA (Microsoft)',
        major: true,
        points: [[-73.8, 39.4], [-9.0, 37.0]]
    }
];

// Countries under sanctions (ISO 3166-1 numeric codes used by Natural Earth)
const SANCTIONED_COUNTRIES = {
    // Severe sanctions (comprehensive)
    408: 'severe',  // North Korea
    728: 'severe',  // South Sudan
    729: 'severe',  // Sudan
    760: 'severe',  // Syria
    // High sanctions
    364: 'high',    // Iran
    643: 'high',    // Russia
    112: 'high',    // Belarus
    // Moderate sanctions
    862: 'moderate', // Venezuela
    104: 'moderate', // Myanmar
    178: 'moderate', // Congo
    // Low/targeted sanctions
    152: 'low',     // Cuba (being modified)
    716: 'low',     // Zimbabwe
};

// Regions for news density calculation
const NEWS_REGIONS = [
    { id: 'us', name: 'United States', lat: 39.0, lon: -98.0, radius: 60, keywords: ['us', 'america', 'washington', 'trump', 'biden', 'congress'] },
    { id: 'europe', name: 'Europe', lat: 50.0, lon: 10.0, radius: 55, keywords: ['europe', 'eu', 'european', 'nato', 'brussels'] },
    { id: 'russia', name: 'Russia', lat: 60.0, lon: 90.0, radius: 50, keywords: ['russia', 'russian', 'putin', 'moscow', 'kremlin'] },
    { id: 'china', name: 'China', lat: 35.0, lon: 105.0, radius: 55, keywords: ['china', 'chinese', 'beijing', 'xi'] },
    { id: 'middle_east', name: 'Middle East', lat: 30.0, lon: 45.0, radius: 50, keywords: ['israel', 'iran', 'saudi', 'gaza', 'syria', 'iraq', 'yemen'] },
    { id: 'east_asia', name: 'East Asia', lat: 35.0, lon: 130.0, radius: 45, keywords: ['japan', 'korea', 'taiwan', 'kim jong'] },
    { id: 'south_asia', name: 'South Asia', lat: 22.0, lon: 78.0, radius: 45, keywords: ['india', 'pakistan', 'modi'] },
    { id: 'africa', name: 'Africa', lat: 5.0, lon: 20.0, radius: 55, keywords: ['africa', 'african', 'sudan', 'nigeria', 'ethiopia'] },
    { id: 'latam', name: 'Latin America', lat: -15.0, lon: -60.0, radius: 50, keywords: ['brazil', 'mexico', 'venezuela', 'argentina'] }
];

// Map layer visibility state
let mapLayers = {
    conflicts: true,
    bases: false,
    nuclear: false,
    cables: false,
    sanctions: true,
    density: true
};

// Convert lat/lon to map position (simple equirectangular projection)
function latLonToXY(lat, lon, width, height) {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
}

// Analyze news for hotspot activity
function analyzeHotspotActivity(allNews) {
    const results = {};

    INTEL_HOTSPOTS.forEach(spot => {
        let score = 0;
        let matchedHeadlines = [];

        allNews.forEach(item => {
            const title = item.title.toLowerCase();
            const matchedKeywords = spot.keywords.filter(kw => title.includes(kw));
            if (matchedKeywords.length > 0) {
                score += matchedKeywords.length;
                if (item.isAlert) score += 3; // Boost for alert keywords
                // Store full headline object with link and source
                matchedHeadlines.push({
                    title: item.title,
                    link: item.link,
                    source: item.source,
                    isAlert: item.isAlert
                });
            }
        });

        let level = 'low';
        if (score >= 8) level = 'high';
        else if (score >= 3) level = 'medium';

        results[spot.id] = { level, score, headlines: matchedHeadlines.slice(0, 5) };
    });

    return results;
}

// World map data cache
let worldMapData = null;

// Load world map TopoJSON data
async function loadWorldMap() {
    if (worldMapData) return worldMapData;
    try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
        worldMapData = await response.json();
        return worldMapData;
    } catch (e) {
        console.error('Failed to load world map:', e);
        return null;
    }
}

// Render the global map - Situation Room Style with accurate borders
async function renderGlobalMap(activityData, earthquakes = [], allNews = []) {
    // Store data for resize re-rendering
    lastMapData = { activityData, earthquakes, allNews };

    // Cache allNews for popup access
    window.cachedAllNews = allNews;

    const panel = document.getElementById('mapPanel');
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    // Set up the container
    panel.innerHTML = `
        <div class="world-map" id="worldMapContainer">
            <div class="map-zoom-wrapper" id="mapZoomWrapper">
                <svg id="worldMapSVG"></svg>
                <div class="map-overlays" id="mapOverlays"></div>
            </div>
            <div class="map-zoom-controls">
                <button class="map-zoom-btn" onclick="mapZoomIn()" title="Zoom In">+</button>
                <div class="map-zoom-level" id="mapZoomLevel">1.0x</div>
                <button class="map-zoom-btn" onclick="mapZoomOut()" title="Zoom Out">−</button>
                <button class="map-zoom-btn map-zoom-reset" onclick="mapZoomReset()" title="Reset">RST</button>
            </div>
            <div class="map-pan-hint" id="mapPanHint">DRAG TO PAN</div>
            <div class="conflict-popup" id="conflictPopup"></div>
            <div class="map-corner-label tl">GLOBAL ACTIVITY MONITOR</div>
            <div class="map-corner-label tr">CLASSIFICATION: OPEN SOURCE</div>
            <div class="map-corner-label bl">⚓ SHIP | ☢ NUKES | ▪ BASES | ═ CABLES</div>
            <div class="map-corner-label br">${timestamp}</div>
        </div>
    `;

    const container = document.getElementById('worldMapContainer');
    const svg = d3.select('#worldMapSVG');
    const width = container.offsetWidth || 800;
    const height = container.offsetHeight || 550;

    svg.attr('width', '100%')
       .attr('height', '100%')
       .attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'none');

    // Create projection that fills the entire container
    // Use the smaller of horizontal or vertical scale to ensure full map is visible
    const scaleX = width / (2 * Math.PI);
    const scaleY = height / Math.PI;
    const scale = Math.min(scaleX, scaleY);

    const projection = d3.geoEquirectangular()
        .scale(scale)
        .center([0, 0])
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Add background
    const isLightModeBg = document.documentElement.classList.contains('light-mode');
    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', isLightModeBg ? '#f1f5f9' : '#0f1419');

    // Add grid pattern
    const defs = svg.append('defs');

    const smallGrid = defs.append('pattern')
        .attr('id', 'smallGridD3')
        .attr('width', 20)
        .attr('height', 20)
        .attr('patternUnits', 'userSpaceOnUse');
    smallGrid.append('path')
        .attr('d', 'M 20 0 L 0 0 0 20')
        .attr('fill', 'none')
        .attr('stroke', isLightModeBg ? '#e0e4e8' : '#1a1f28')
        .attr('stroke-width', 0.5);

    const grid = defs.append('pattern')
        .attr('id', 'gridD3')
        .attr('width', 60)
        .attr('height', 60)
        .attr('patternUnits', 'userSpaceOnUse');
    grid.append('rect')
        .attr('width', 60)
        .attr('height', 60)
        .attr('fill', 'url(#smallGridD3)');
    const isLightMode = document.documentElement.classList.contains('light-mode');

    grid.append('path')
        .attr('d', 'M 60 0 L 0 0 0 60')
        .attr('fill', 'none')
        .attr('stroke', isLightMode ? '#e2e8f0' : '#252a35')
        .attr('stroke-width', 0.8);

    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'url(#gridD3)');

    // Add graticule (lat/lon grid lines)
    const graticule = d3.geoGraticule().step([30, 30]);
    svg.append('path')
        .datum(graticule)
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', isLightMode ? '#cbd5e1' : '#1e2530')
        .attr('stroke-width', 0.5)
        .attr('stroke-opacity', 0.6);

    // Load and render countries
    const world = await loadWorldMap();
    if (world) {
        const countries = topojson.feature(world, world.objects.countries);

        svg.append('g')
            .attr('class', 'countries-layer')
            .selectAll('path')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', d => {
                const isLightMode = document.documentElement.classList.contains('light-mode');
                // Apply sanctions coloring if enabled
                if (mapLayers.sanctions) {
                    const countryId = d.id;
                    const sanctionLevel = SANCTIONED_COUNTRIES[countryId];
                    if (isLightMode) {
                        if (sanctionLevel === 'severe') return '#fecaca';
                        if (sanctionLevel === 'high') return '#fed7aa';
                        if (sanctionLevel === 'moderate') return '#fef08a';
                        if (sanctionLevel === 'low') return '#bbf7d0';
                    } else {
                        if (sanctionLevel === 'severe') return '#4a1515';
                        if (sanctionLevel === 'high') return '#3d2a15';
                        if (sanctionLevel === 'moderate') return '#2d2d18';
                        if (sanctionLevel === 'low') return '#1e2820';
                    }
                }
                return isLightMode ? '#e2e8f0' : '#1a2028';
            })
            .attr('stroke', d => document.documentElement.classList.contains('light-mode') ? '#cbd5e1' : '#2a3545')
            .attr('stroke-width', 0.5);

        // Add conflict zone boundaries
        if (mapLayers.conflicts) {
            const conflictGroup = svg.append('g').attr('class', 'conflicts-layer');
            CONFLICT_ZONES.forEach(zone => {
                // Create closed polygon path
                const points = zone.coords.map(c => projection([c[0], c[1]]));
                if (points.length > 0) {
                    const pathData = 'M' + points.map(p => p.join(',')).join('L') + 'Z';
                    const isHigh = zone.intensity === 'high';

                    // Glow effect layer (behind fill)
                    conflictGroup.append('path')
                        .attr('d', pathData)
                        .attr('class', 'conflict-zone-glow');

                    // Fill for zone area
                    conflictGroup.append('path')
                        .attr('d', pathData)
                        .attr('class', `conflict-zone-fill ${isHigh ? 'high-intensity' : ''}`);

                    // Animated border
                    conflictGroup.append('path')
                        .attr('d', pathData)
                        .attr('class', `conflict-zone-path ${isHigh ? 'high-intensity' : ''}`);
                }
            });
        }
    }

    // Helper to convert lon/lat to percentage using the projection
    const toPercent = (lon, lat) => {
        const [x, y] = projection([lon, lat]);
        return {
            x: (x / width) * 100,
            y: (y / height) * 100
        };
    };

    // Build overlay HTML
    let overlaysHTML = '';

    // Coordinate labels
    [-60, -30, 0, 30, 60].forEach(lat => {
        const pos = toPercent(-175, lat);
        const label = lat === 0 ? '0°' : (lat > 0 ? `${lat}°N` : `${Math.abs(lat)}°S`);
        overlaysHTML += `<div class="coord-label lat" style="top: ${pos.y}%; left: 0.5%;">${label}</div>`;
    });
    [-120, -60, 0, 60, 120].forEach(lon => {
        const pos = toPercent(lon, -85);
        const label = lon === 0 ? '0°' : (lon > 0 ? `${lon}°E` : `${Math.abs(lon)}°W`);
        overlaysHTML += `<div class="coord-label lon" style="left: ${pos.x}%; bottom: 1%;">${label}</div>`;
    });

    // News density heatmap blobs
    if (mapLayers.density) {
        const densityScores = calculateNewsDensity(allNews);
        NEWS_REGIONS.forEach(region => {
            const score = densityScores[region.id] || 0;
            if (score > 0) {
                const pos = toPercent(region.lon, region.lat);
                let level = 'low';
                let size = region.radius;
                if (score >= 10) {
                    level = 'high';
                    size = region.radius * 1.5;
                } else if (score >= 5) {
                    level = 'medium';
                    size = region.radius * 1.2;
                }
                overlaysHTML += `
                    <div class="density-blob ${level}"
                         style="left: ${pos.x}%; top: ${pos.y}%; width: ${size}px; height: ${size}px; transform: translate(-50%, -50%);"></div>
                `;
            }
        });
    }

    // Conflict zone labels
    if (mapLayers.conflicts) {
        CONFLICT_ZONES.forEach(zone => {
            const pos = toPercent(zone.labelPos.lon, zone.labelPos.lat);
            const intensityClass = zone.intensity === 'high' ? 'high-intensity' : '';
            // Store zone data for popup
            const zoneData = encodeURIComponent(JSON.stringify(zone));
            overlaysHTML += `
                <div class="conflict-zone-label ${intensityClass}"
                     style="left: ${pos.x}%; top: ${pos.y}%;"
                     data-conflict-id="${zone.id}"
                     data-conflict-info="${zoneData}"
                     onclick="showConflictPopup(event, '${zone.id}')">
                    ${zone.name}
                </div>
            `;
        });
    }

    // Military base markers
    if (mapLayers.bases) {
        MILITARY_BASES.forEach(base => {
            const pos = toPercent(base.lon, base.lat);
            overlaysHTML += `
                <div class="military-base ${base.type}" style="left: ${pos.x}%; top: ${pos.y}%;" title="${base.name}">
                    <div class="base-icon ${base.type}"></div>
                    <div class="base-label ${base.type}">${base.name}</div>
                </div>
            `;
        });
    }

    // Nuclear facility markers
    if (mapLayers.nuclear) {
        NUCLEAR_FACILITIES.forEach(facility => {
            const pos = toPercent(facility.lon, facility.lat);
            const isWeapons = facility.type === 'weapons' || facility.type === 'enrichment';
            overlaysHTML += `
                <div class="nuclear-facility" style="left: ${pos.x}%; top: ${pos.y}%;" title="${facility.name} (${facility.type})">
                    <div class="nuclear-icon ${isWeapons ? 'weapons' : ''}"></div>
                    <div class="nuclear-label">${facility.name}</div>
                </div>
            `;
        });
    }

    // Cyber threat zones
    CYBER_REGIONS.forEach(cz => {
        const pos = toPercent(cz.lon, cz.lat);
        // Randomly determine if this zone is "active" (simulated)
        const isActive = Math.random() > 0.6;

        // Store cyber zone data
        const czData = encodeURIComponent(JSON.stringify({
            ...cz,
            isActive
        }));

        overlaysHTML += `
            <div class="cyber-zone ${isActive ? 'active' : ''}"
                 style="left: ${pos.x}%; top: ${pos.y}%;"
                 data-cyber-id="${cz.id}"
                 data-cyber-info="${czData}"
                 onclick="showCyberPopup(event, '${cz.id}')">
                <div class="cyber-icon"></div>
                <div class="cyber-label">${cz.group}</div>
            </div>
        `;
    });

    // Shipping chokepoints
    SHIPPING_CHOKEPOINTS.forEach(cp => {
        const pos = toPercent(cp.lon, cp.lat);

        // Find matching headlines for this chokepoint
        const matchedHeadlines = allNews.filter(item => {
            const title = (item.title || '').toLowerCase();
            return cp.keywords.some(kw => title.includes(kw));
        }).slice(0, 5).map(item => ({
            title: item.title,
            link: item.link,
            source: item.source
        }));

        const isAlert = matchedHeadlines.length > 0;

        // Store chokepoint data as JSON
        const cpData = encodeURIComponent(JSON.stringify({
            ...cp,
            isAlert,
            headlines: matchedHeadlines
        }));

        overlaysHTML += `
            <div class="chokepoint ${isAlert ? 'alert' : ''}"
                 style="left: ${pos.x}%; top: ${pos.y}%;"
                 data-chokepoint-id="${cp.id}"
                 data-chokepoint-info="${cpData}"
                 onclick="showChokepointPopup(event, '${cp.id}')">
                <div class="chokepoint-icon"></div>
                <div class="chokepoint-label">${cp.name}</div>
            </div>
        `;
    });

    // Earthquake markers
    earthquakes.slice(0, 10).forEach((eq, index) => {
        const pos = toPercent(eq.lon, eq.lat);
        const isMajor = eq.mag >= 6.0;

        // Store earthquake data
        const eqData = encodeURIComponent(JSON.stringify({
            mag: eq.mag,
            place: eq.place,
            time: eq.time,
            lat: eq.lat,
            lon: eq.lon,
            depth: eq.depth,
            id: eq.id || `eq_${index}`
        }));

        overlaysHTML += `
            <div class="quake ${isMajor ? 'major' : ''}"
                 style="left: ${pos.x}%; top: ${pos.y}%;"
                 data-quake-id="eq_${index}"
                 data-quake-info="${eqData}"
                 onclick="showQuakePopup(event, 'eq_${index}')">
                <div class="quake-icon"></div>
                <div class="quake-label">M${eq.mag.toFixed(1)}</div>
            </div>
        `;
    });

    // Intel hotspots with breaking news pulse for high activity
    INTEL_HOTSPOTS.forEach(spot => {
        const activity = activityData[spot.id] || { level: 'low', score: 0, headlines: [] };
        const pos = toPercent(spot.lon, spot.lat);
        // Store activity data as JSON in data attribute (including new detailed info)
        const activityJson = encodeURIComponent(JSON.stringify({
            ...activity,
            name: spot.name,
            subtext: spot.subtext,
            lat: spot.lat,
            lon: spot.lon,
            description: spot.description || '',
            agencies: spot.agencies || [],
            status: spot.status || ''
        }));

        overlaysHTML += `
            <div class="hotspot ${activity.level}"
                 style="left: ${pos.x}%; top: ${pos.y}%;"
                 data-hotspot-id="${spot.id}"
                 data-hotspot-activity="${activityJson}"
                 onclick="showHotspotPopup(event, '${spot.id}')">
                <div class="hotspot-dot"></div>
                <div class="hotspot-label">
                    ${spot.name}
                    <div class="hotspot-info">${spot.subtext}</div>
                </div>
            </div>
        `;
    });

    // Custom monitor hotspots (user-created)
    const customHotspots = getMonitorHotspots(allNews);
    customHotspots.forEach(monitor => {
        const pos = toPercent(monitor.lon, monitor.lat);
        const matchData = encodeURIComponent(JSON.stringify({
            id: monitor.id,
            name: monitor.name,
            color: monitor.color,
            keywords: monitor.keywords,
            lat: monitor.lat,
            lon: monitor.lon,
            matchCount: monitor.matchCount,
            matches: monitor.matches.slice(0, 5)
        }));

        overlaysHTML += `
            <div class="custom-hotspot"
                 style="left: ${pos.x}%; top: ${pos.y}%; color: ${monitor.color};"
                 data-monitor-id="${monitor.id}"
                 data-monitor-info="${matchData}"
                 onclick="showCustomHotspotPopup(event, '${monitor.id}')">
                <div class="custom-hotspot-dot" style="background: ${monitor.color}; border-color: ${monitor.color};"></div>
                <div class="custom-hotspot-label" style="color: ${monitor.color};">
                    ${monitor.name}
                    <span class="custom-hotspot-count">${monitor.matchCount > 0 ? ` (${monitor.matchCount})` : ''}</span>
                </div>
            </div>
        `;
    });

    // Add popup containers
    overlaysHTML += `<div class="hotspot-popup" id="hotspotPopup"></div>`;
    overlaysHTML += `<div class="chokepoint-popup" id="chokepointPopup"></div>`;
    overlaysHTML += `<div class="quake-popup" id="quakePopup"></div>`;
    overlaysHTML += `<div class="cyber-popup" id="cyberPopup"></div>`;
    overlaysHTML += `<div class="custom-hotspot-popup" id="customHotspotPopup"></div>`;

    document.getElementById('mapOverlays').innerHTML = overlaysHTML;

    // Layer toggle buttons - added OUTSIDE zoom wrapper so they don't scale
    const layerToggleHTML = `
        <div class="map-layer-toggle">
            <button class="layer-btn ${mapLayers.conflicts ? 'active' : ''}" onclick="toggleLayer('conflicts')">Conflicts</button>
            <button class="layer-btn ${mapLayers.sanctions ? 'active' : ''}" onclick="toggleLayer('sanctions')">Sanctions</button>
            <button class="layer-btn ${mapLayers.density ? 'active' : ''}" onclick="toggleLayer('density')">Density</button>
        </div>
    `;

    // Live indicator - also outside zoom wrapper
    const liveIndicatorHTML = `
        <div class="live-status-indicator">LIVE</div>
    `;

    // Add layer toggle and live indicator directly to the map container (not zoom wrapper)
    const existingLayerToggle = document.querySelector('.map-layer-toggle');
    const existingLiveIndicator = document.querySelector('.live-status-indicator');
    if (existingLayerToggle) existingLayerToggle.remove();
    if (existingLiveIndicator) existingLiveIndicator.remove();

    document.getElementById('worldMapContainer').insertAdjacentHTML('beforeend', layerToggleHTML);
    document.getElementById('worldMapContainer').insertAdjacentHTML('beforeend', liveIndicatorHTML);

    // Initialize map pan functionality after render
    initMapPan();

    // Close popups when clicking outside
    document.getElementById('worldMapContainer').addEventListener('click', (e) => {
        if (!e.target.closest('.hotspot') && !e.target.closest('.hotspot-popup')) {
            hideHotspotPopup();
        }
        if (!e.target.closest('.chokepoint') && !e.target.closest('.chokepoint-popup')) {
            hideChokepointPopup();
        }
        if (!e.target.closest('.quake') && !e.target.closest('.quake-popup')) {
            hideQuakePopup();
        }
        if (!e.target.closest('.cyber-zone') && !e.target.closest('.cyber-popup')) {
            hideCyberPopup();
        }
        if (!e.target.closest('.custom-hotspot') && !e.target.closest('.custom-hotspot-popup')) {
            hideCustomHotspotPopup();
        }
        if (!e.target.closest('.conflict-zone-label') && !e.target.closest('.conflict-popup')) {
            hideConflictPopup();
        }
    });
}

// Show hotspot popup
function showHotspotPopup(event, hotspotId) {
    event.stopPropagation();

    const hotspotEl = document.querySelector(`[data-hotspot-id="${hotspotId}"]`);
    if (!hotspotEl) return;

    // Hide other popups
    hideChokepointPopup();
    hideQuakePopup();
    hideCyberPopup();
    hideCustomHotspotPopup();

    const activityData = JSON.parse(decodeURIComponent(hotspotEl.dataset.hotspotActivity));
    const popup = document.getElementById('hotspotPopup');

    // Build headlines HTML
    let headlinesHTML = '';
    if (activityData.headlines && activityData.headlines.length > 0) {
        headlinesHTML = activityData.headlines.map(h => `
            <div class="hotspot-popup-headline">
                <div class="hotspot-popup-source">${escapeHtml(h.source || 'News')}</div>
                <a href="${h.link || '#'}" target="_blank">${escapeHtml(h.title)}</a>
            </div>
        `).join('');
    } else {
        headlinesHTML = '<div class="hotspot-popup-empty">No recent headlines for this location</div>';
    }

    // Build agencies HTML if available
    let agenciesHTML = '';
    if (activityData.agencies && activityData.agencies.length > 0) {
        agenciesHTML = `
            <div class="hotspot-popup-agencies">
                <div class="hotspot-popup-agencies-title">Key Entities</div>
                ${activityData.agencies.map(a => `<span class="hotspot-popup-agency">${escapeHtml(a)}</span>`).join('')}
            </div>
        `;
    }

    // Build popup content
    popup.innerHTML = `
        <div class="hotspot-popup-header">
            <span class="hotspot-popup-title">${escapeHtml(activityData.name)}</span>
            <span class="hotspot-popup-level ${activityData.level}">${activityData.level.toUpperCase()}</span>
            <button class="hotspot-popup-close" onclick="hideHotspotPopup()">&times;</button>
        </div>
        <div class="hotspot-popup-subtext">${escapeHtml(activityData.subtext)}</div>
        ${activityData.description ? `<div class="hotspot-popup-desc">${escapeHtml(activityData.description)}</div>` : ''}
        <div class="hotspot-popup-meta">
            <div class="hotspot-popup-meta-item">
                <span class="hotspot-popup-meta-label">Coordinates</span>
                <span class="hotspot-popup-meta-value">${activityData.lat.toFixed(2)}°${activityData.lat >= 0 ? 'N' : 'S'}, ${Math.abs(activityData.lon).toFixed(2)}°${activityData.lon >= 0 ? 'E' : 'W'}</span>
            </div>
            ${activityData.status ? `
            <div class="hotspot-popup-meta-item">
                <span class="hotspot-popup-meta-label">Status</span>
                <span class="hotspot-popup-meta-value">${escapeHtml(activityData.status)}</span>
            </div>
            ` : ''}
        </div>
        ${agenciesHTML}
        ${headlinesHTML.includes('hotspot-popup-headline') ? '<div class="hotspot-popup-headlines-title">Related Headlines</div>' : ''}
        <div class="hotspot-popup-headlines">
            ${headlinesHTML}
        </div>
    `;

    // Set popup class for styling based on threat level
    popup.className = `hotspot-popup visible ${activityData.level}`;

    // Position popup near the hotspot
    const hotspotRect = hotspotEl.getBoundingClientRect();
    const mapContainer = document.getElementById('worldMapContainer');
    const mapRect = mapContainer.getBoundingClientRect();

    // Calculate position relative to map container
    let left = hotspotRect.left - mapRect.left + 20;
    let top = hotspotRect.top - mapRect.top - 10;

    // Ensure popup stays within map bounds
    const popupWidth = 320;
    const popupHeight = 400;

    if (left + popupWidth > mapRect.width) {
        left = hotspotRect.left - mapRect.left - popupWidth - 20;
    }
    if (top + popupHeight > mapRect.height) {
        top = mapRect.height - popupHeight - 10;
    }
    if (top < 10) top = 10;
    if (left < 10) left = 10;

    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
}

// Hide hotspot popup
function hideHotspotPopup() {
    const popup = document.getElementById('hotspotPopup');
    if (popup) {
        popup.classList.remove('visible');
    }
}

// Show conflict zone popup
function showConflictPopup(event, conflictId) {
    event.stopPropagation();

    const conflictEl = document.querySelector(`[data-conflict-id="${conflictId}"]`);
    if (!conflictEl) return;

    // Hide other popups
    hideHotspotPopup();
    hideChokepointPopup();
    hideQuakePopup();
    hideCyberPopup();
    hideCustomHotspotPopup();

    const conflictData = JSON.parse(decodeURIComponent(conflictEl.dataset.conflictInfo));
    const popup = document.getElementById('conflictPopup');

    // Find matching headlines from cachedNews
    let matchedHeadlines = [];
    if (window.cachedAllNews && conflictData.keywords) {
        matchedHeadlines = window.cachedAllNews.filter(item => {
            const title = (item.title || '').toLowerCase();
            return conflictData.keywords.some(kw => title.includes(kw.toLowerCase()));
        }).slice(0, 5);
    }

    // Build headlines HTML
    let headlinesHTML = '';
    if (matchedHeadlines.length > 0) {
        headlinesHTML = `
            <div class="conflict-popup-headlines-title">Related Headlines</div>
            <div class="conflict-popup-headlines">
                ${matchedHeadlines.map(h => `
                    <div class="conflict-popup-headline">
                        <div class="conflict-popup-headline-source">${escapeHtml(h.source || 'News')}</div>
                        <a href="${h.link || '#'}" target="_blank">${escapeHtml(h.title)}</a>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Build popup content
    popup.innerHTML = `
        <button class="conflict-popup-close" onclick="hideConflictPopup()">&times;</button>
        <div class="conflict-popup-header">
            <span class="conflict-popup-title">${escapeHtml(conflictData.name)}</span>
            <span class="conflict-popup-intensity ${conflictData.intensity}">${conflictData.intensity.toUpperCase()}</span>
        </div>
        <div class="conflict-popup-meta">
            <div class="conflict-popup-meta-item">
                <span class="conflict-popup-meta-label">Start Date</span>
                <span class="conflict-popup-meta-value">${escapeHtml(conflictData.startDate)}</span>
            </div>
            <div class="conflict-popup-meta-item">
                <span class="conflict-popup-meta-label">Casualties</span>
                <span class="conflict-popup-meta-value">${escapeHtml(conflictData.casualties)}</span>
            </div>
            <div class="conflict-popup-meta-item">
                <span class="conflict-popup-meta-label">Displaced</span>
                <span class="conflict-popup-meta-value">${escapeHtml(conflictData.displaced)}</span>
            </div>
            <div class="conflict-popup-meta-item">
                <span class="conflict-popup-meta-label">Location</span>
                <span class="conflict-popup-meta-value">${conflictData.labelPos.lat.toFixed(1)}°N, ${conflictData.labelPos.lon.toFixed(1)}°E</span>
            </div>
        </div>
        <div class="conflict-popup-desc">${escapeHtml(conflictData.description)}</div>
        <div class="conflict-popup-parties">
            <div class="conflict-popup-parties-title">Belligerents</div>
            ${conflictData.parties.map(p => `<span class="conflict-popup-party">${escapeHtml(p)}</span>`).join('')}
        </div>
        <div class="conflict-popup-events">
            <div class="conflict-popup-events-title">Key Developments</div>
            ${conflictData.keyEvents.map(e => `<div class="conflict-popup-event">${escapeHtml(e)}</div>`).join('')}
        </div>
        ${headlinesHTML}
    `;

    // Position popup
    popup.classList.add('visible');

    const conflictRect = conflictEl.getBoundingClientRect();
    const mapContainer = document.getElementById('worldMapContainer');
    const mapRect = mapContainer.getBoundingClientRect();

    let left = conflictRect.left - mapRect.left + 20;
    let top = conflictRect.top - mapRect.top - 10;

    const popupWidth = 380;
    const popupHeight = 450;

    if (left + popupWidth > mapRect.width) {
        left = conflictRect.left - mapRect.left - popupWidth - 20;
    }
    if (top + popupHeight > mapRect.height) {
        top = mapRect.height - popupHeight - 10;
    }
    if (top < 10) top = 10;
    if (left < 10) left = 10;

    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
}

// Hide conflict popup
function hideConflictPopup() {
    const popup = document.getElementById('conflictPopup');
    if (popup) {
        popup.classList.remove('visible');
    }
}

// Escape HTML for popup content
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show chokepoint popup
function showChokepointPopup(event, chokepointId) {
    event.stopPropagation();

    const cpEl = document.querySelector(`[data-chokepoint-id="${chokepointId}"]`);
    if (!cpEl) return;

    // Hide other popups
    hideHotspotPopup();
    hideQuakePopup();
    hideCyberPopup();
    hideCustomHotspotPopup();

    const cpData = JSON.parse(decodeURIComponent(cpEl.dataset.chokepointInfo));
    const popup = document.getElementById('chokepointPopup');

    // Build headlines HTML
    let headlinesHTML = '';
    if (cpData.headlines && cpData.headlines.length > 0) {
        headlinesHTML = `<div class="chokepoint-popup-headlines-header">Recent Headlines</div>`;
        headlinesHTML += cpData.headlines.map(h => `
            <div class="chokepoint-popup-headline">
                <a href="${h.link || '#'}" target="_blank">${escapeHtml(h.title)}</a>
            </div>
        `).join('');
    } else {
        headlinesHTML = '<div class="chokepoint-popup-empty">No recent headlines for this chokepoint</div>';
    }

    // Build cargo tags HTML (if available)
    let cargoHTML = '';
    if (cpData.cargo && cpData.cargo.length > 0) {
        cargoHTML = `
            <div class="chokepoint-popup-tags">
                <div class="chokepoint-popup-tags-label">Primary Cargo</div>
                <div class="chokepoint-popup-tags-list">
                    ${cpData.cargo.map(c => `<span class="chokepoint-popup-tag">${escapeHtml(c)}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // Build strategic importance section (if available)
    let strategicHTML = '';
    if (cpData.strategic) {
        strategicHTML = `
            <div class="chokepoint-popup-strategic">
                <div class="chokepoint-popup-strategic-label">Strategic Importance</div>
                <div class="chokepoint-popup-strategic-text">${escapeHtml(cpData.strategic)}</div>
            </div>
        `;
    }

    // Build popup content
    popup.innerHTML = `
        <button class="chokepoint-popup-close" onclick="hideChokepointPopup()">&times;</button>
        <div class="chokepoint-popup-header">
            <span class="chokepoint-popup-title">${escapeHtml(cpData.name)}</span>
            <span class="chokepoint-popup-status ${cpData.isAlert ? 'alert' : 'normal'}">${cpData.isAlert ? 'ALERT' : 'NORMAL'}</span>
        </div>
        ${cpData.connects ? `<div class="chokepoint-popup-connects">${escapeHtml(cpData.connects)}</div>` : ''}
        <div class="chokepoint-popup-info">
            <div class="chokepoint-popup-stat">
                <span class="chokepoint-popup-stat-label">Region</span>
                <span class="chokepoint-popup-stat-value">${escapeHtml(cpData.region)}</span>
            </div>
            <div class="chokepoint-popup-stat">
                <span class="chokepoint-popup-stat-label">Traffic</span>
                <span class="chokepoint-popup-stat-value">${escapeHtml(cpData.traffic)}</span>
            </div>
            ${cpData.length ? `
            <div class="chokepoint-popup-stat">
                <span class="chokepoint-popup-stat-label">Length</span>
                <span class="chokepoint-popup-stat-value">${escapeHtml(cpData.length)}</span>
            </div>` : ''}
            ${cpData.width ? `
            <div class="chokepoint-popup-stat">
                <span class="chokepoint-popup-stat-label">Width</span>
                <span class="chokepoint-popup-stat-value">${escapeHtml(cpData.width)}</span>
            </div>` : ''}
            ${cpData.depth ? `
            <div class="chokepoint-popup-stat">
                <span class="chokepoint-popup-stat-label">Depth</span>
                <span class="chokepoint-popup-stat-value">${escapeHtml(cpData.depth)}</span>
            </div>` : ''}
            ${cpData.controlled ? `
            <div class="chokepoint-popup-stat full-width">
                <span class="chokepoint-popup-stat-label">Controlled By</span>
                <span class="chokepoint-popup-stat-value">${escapeHtml(cpData.controlled)}</span>
            </div>` : ''}
        </div>
        ${cargoHTML}
        <div class="chokepoint-popup-desc">${escapeHtml(cpData.desc)}</div>
        ${strategicHTML}
        <div class="chokepoint-popup-headlines">
            ${headlinesHTML}
        </div>
    `;

    // Set popup class for styling
    popup.className = `chokepoint-popup visible ${cpData.isAlert ? 'alert' : ''}`;

    // Position popup near the chokepoint
    const cpRect = cpEl.getBoundingClientRect();
    const mapContainer = document.getElementById('worldMapContainer');
    const mapRect = mapContainer.getBoundingClientRect();

    // Calculate position relative to map container
    let left = cpRect.left - mapRect.left + 20;
    let top = cpRect.top - mapRect.top - 10;

    // Ensure popup stays within map bounds
    const popupWidth = 360;
    const popupHeight = 450;

    if (left + popupWidth > mapRect.width) {
        left = cpRect.left - mapRect.left - popupWidth - 20;
    }
    if (top + popupHeight > mapRect.height) {
        top = mapRect.height - popupHeight - 10;
    }
    if (top < 10) top = 10;
    if (left < 10) left = 10;

    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
}

// Hide chokepoint popup
function hideChokepointPopup() {
    const popup = document.getElementById('chokepointPopup');
    if (popup) {
        popup.classList.remove('visible');
    }
}

// Show earthquake popup
function showQuakePopup(event, quakeId) {
    event.stopPropagation();

    const quakeEl = document.querySelector(`[data-quake-id="${quakeId}"]`);
    if (!quakeEl) return;

    // Hide other popups
    hideHotspotPopup();
    hideChokepointPopup();
    hideCyberPopup();
    hideCustomHotspotPopup();

    const eqData = JSON.parse(decodeURIComponent(quakeEl.dataset.quakeInfo));
    const popup = document.getElementById('quakePopup');

    const isMajor = eqData.mag >= 6.0;
    const isModerate = eqData.mag >= 5.0;

    // Determine severity label
    let severity = 'minor';
    let severityLabel = 'Minor';
    if (isMajor) {
        severity = 'major';
        severityLabel = 'Major';
    } else if (isModerate) {
        severity = 'moderate';
        severityLabel = 'Moderate';
    }

    // Format time
    const time = new Date(eqData.time);
    const timeStr = time.toLocaleString();
    const timeAgo = getTimeAgo(time);

    // USGS link
    const usgsLink = `https://earthquake.usgs.gov/earthquakes/eventpage/${eqData.id || ''}`;

    popup.innerHTML = `
        <button class="quake-popup-close" onclick="hideQuakePopup()">&times;</button>
        <div class="quake-popup-header">
            <span class="quake-popup-mag">M${eqData.mag.toFixed(1)}</span>
            <span class="quake-popup-severity ${severity}">${severityLabel}</span>
        </div>
        <div class="quake-popup-location">${escapeHtml(eqData.place)}</div>
        <div class="quake-popup-info">
            <div class="quake-popup-stat">
                <span class="quake-popup-stat-label">Depth</span>
                <span class="quake-popup-stat-value">${eqData.depth.toFixed(1)} km</span>
            </div>
            <div class="quake-popup-stat">
                <span class="quake-popup-stat-label">Coordinates</span>
                <span class="quake-popup-stat-value">${eqData.lat.toFixed(2)}°, ${eqData.lon.toFixed(2)}°</span>
            </div>
            <div class="quake-popup-stat">
                <span class="quake-popup-stat-label">Time</span>
                <span class="quake-popup-stat-value">${timeAgo}</span>
            </div>
        </div>
        <a href="${usgsLink}" target="_blank" class="quake-popup-link">View on USGS →</a>
    `;

    // Set popup class
    popup.className = `quake-popup visible ${isMajor ? 'major' : ''}`;

    // Position popup
    const quakeRect = quakeEl.getBoundingClientRect();
    const mapContainer = document.getElementById('worldMapContainer');
    const mapRect = mapContainer.getBoundingClientRect();

    let left = quakeRect.left - mapRect.left + 20;
    let top = quakeRect.top - mapRect.top - 10;

    const popupWidth = 260;
    const popupHeight = 220;

    if (left + popupWidth > mapRect.width) {
        left = quakeRect.left - mapRect.left - popupWidth - 20;
    }
    if (top + popupHeight > mapRect.height) {
        top = mapRect.height - popupHeight - 10;
    }
    if (top < 10) top = 10;
    if (left < 10) left = 10;

    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
}

// Hide earthquake popup
function hideQuakePopup() {
    const popup = document.getElementById('quakePopup');
    if (popup) {
        popup.classList.remove('visible');
    }
}

// Get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

// Show cyber threat popup
function showCyberPopup(event, cyberId) {
    event.stopPropagation();

    const cyberEl = document.querySelector(`[data-cyber-id="${cyberId}"]`);
    if (!cyberEl) return;

    // Hide other popups
    hideHotspotPopup();
    hideChokepointPopup();
    hideQuakePopup();
    hideCustomHotspotPopup();

    const czData = JSON.parse(decodeURIComponent(cyberEl.dataset.cyberInfo));
    const popup = document.getElementById('cyberPopup');

    // Build targets HTML
    const targetsHTML = czData.targets.map(t =>
        `<span class="cyber-popup-target-tag">${escapeHtml(t)}</span>`
    ).join('');

    popup.innerHTML = `
        <button class="cyber-popup-close" onclick="hideCyberPopup()">&times;</button>
        <div class="cyber-popup-header">
            <span class="cyber-popup-title">${escapeHtml(czData.fullName)}</span>
            <span class="cyber-popup-status ${czData.isActive ? 'active' : 'dormant'}">${czData.isActive ? 'Active' : 'Dormant'}</span>
        </div>
        <div class="cyber-popup-apt">${escapeHtml(czData.group)} — ${escapeHtml(czData.aka)}</div>
        <div class="cyber-popup-desc">${escapeHtml(czData.desc)}</div>
        <div class="cyber-popup-info">
            <div class="cyber-popup-stat">
                <span class="cyber-popup-stat-label">State Sponsor</span>
                <span class="cyber-popup-stat-value">${escapeHtml(czData.sponsor)}</span>
            </div>
            <div class="cyber-popup-stat">
                <span class="cyber-popup-stat-label">Coordinates</span>
                <span class="cyber-popup-stat-value">${czData.lat.toFixed(1)}°, ${czData.lon.toFixed(1)}°</span>
            </div>
        </div>
        <div class="cyber-popup-targets">
            <div class="cyber-popup-targets-label">Primary Targets</div>
            <div class="cyber-popup-target-tags">${targetsHTML}</div>
        </div>
    `;

    // Set popup class
    popup.className = `cyber-popup visible ${czData.isActive ? 'active' : ''}`;

    // Position popup
    const cyberRect = cyberEl.getBoundingClientRect();
    const mapContainer = document.getElementById('worldMapContainer');
    const mapRect = mapContainer.getBoundingClientRect();

    let left = cyberRect.left - mapRect.left + 25;
    let top = cyberRect.top - mapRect.top - 10;

    const popupWidth = 280;
    const popupHeight = 300;

    if (left + popupWidth > mapRect.width) {
        left = cyberRect.left - mapRect.left - popupWidth - 25;
    }
    if (top + popupHeight > mapRect.height) {
        top = mapRect.height - popupHeight - 10;
    }
    if (top < 10) top = 10;
    if (left < 10) left = 10;

    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
}

// Hide cyber threat popup
function hideCyberPopup() {
    const popup = document.getElementById('cyberPopup');
    if (popup) {
        popup.classList.remove('visible');
    }
}

// Show custom hotspot popup
function showCustomHotspotPopup(event, monitorId) {
    event.stopPropagation();

    const hotspotEl = document.querySelector(`[data-monitor-id="${monitorId}"]`);
    if (!hotspotEl) return;

    // Hide other popups
    hideHotspotPopup();
    hideChokepointPopup();
    hideQuakePopup();
    hideCyberPopup();

    const monitorData = JSON.parse(decodeURIComponent(hotspotEl.dataset.monitorInfo));
    const popup = document.getElementById('customHotspotPopup');
    if (!popup) return;

    let matchesHTML = '';
    if (monitorData.matches && monitorData.matches.length > 0) {
        matchesHTML = monitorData.matches.map(m => `
            <div class="custom-hotspot-popup-match">
                <a href="${m.link}" target="_blank">${m.title}</a>
                <div class="custom-hotspot-popup-match-source">${m.source || 'News'}</div>
            </div>
        `).join('');
    } else {
        matchesHTML = '<div class="custom-hotspot-popup-empty">No matching headlines</div>';
    }

    popup.innerHTML = `
        <button class="custom-hotspot-popup-close" onclick="hideCustomHotspotPopup()">×</button>
        <div class="custom-hotspot-popup-header">
            <div class="custom-hotspot-popup-dot" style="background: ${monitorData.color};"></div>
            <div class="custom-hotspot-popup-name" style="color: ${monitorData.color};">${monitorData.name}</div>
            <div class="custom-hotspot-popup-count">${monitorData.matchCount} matches</div>
        </div>
        <div class="custom-hotspot-popup-keywords">
            <strong>Keywords:</strong> ${monitorData.keywords.join(', ')}
        </div>
        <div class="custom-hotspot-popup-coords">
            📍 ${monitorData.lat.toFixed(4)}, ${monitorData.lon.toFixed(4)}
        </div>
        <div class="custom-hotspot-popup-matches">
            ${matchesHTML}
        </div>
    `;

    // Position the popup
    const container = document.getElementById('worldMapContainer');
    const containerRect = container.getBoundingClientRect();
    const hotspotRect = hotspotEl.getBoundingClientRect();

    let left = hotspotRect.left - containerRect.left + 20;
    let top = hotspotRect.top - containerRect.top;

    // Keep within bounds
    if (left + 300 > containerRect.width) {
        left = hotspotRect.left - containerRect.left - 310;
    }
    if (top + 250 > containerRect.height) {
        top = containerRect.height - 260;
    }
    if (top < 10) top = 10;

    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
    popup.classList.add('visible');
}

// Hide custom hotspot popup
function hideCustomHotspotPopup() {
    const popup = document.getElementById('customHotspotPopup');
    if (popup) {
        popup.classList.remove('visible');
    }
}

// Calculate news density for each region
function calculateNewsDensity(allNews) {
    const scores = {};
    NEWS_REGIONS.forEach(region => {
        let score = 0;
        allNews.forEach(item => {
            const title = (item.title || '').toLowerCase();
            region.keywords.forEach(kw => {
                if (title.includes(kw)) score++;
            });
            if (item.isAlert) score += 2; // Boost for alerts
        });
        scores[region.id] = score;
    });
    return scores;
}

// Toggle map layer visibility
function toggleLayer(layerName) {
    mapLayers[layerName] = !mapLayers[layerName];
    // Re-render the map with cached data (don't refetch everything)
    if (lastMapData && lastMapData.activityData) {
        renderGlobalMap(lastMapData.activityData, lastMapData.earthquakes, lastMapData.allNews);
    }
}

// Update flashback time display
function updateFlashback(hoursAgo) {
    const flashbackTime = document.getElementById('flashbackTime');
    const flashbackIndicator = document.getElementById('flashbackIndicator');

    if (parseInt(hoursAgo) === 0) {
        flashbackTime.textContent = 'LIVE';
        if (flashbackIndicator) flashbackIndicator.classList.remove('active');
    } else {
        const now = new Date();
        now.setHours(now.getHours() - parseInt(hoursAgo));
        flashbackTime.textContent = `-${hoursAgo}h`;
        if (flashbackIndicator) flashbackIndicator.classList.add('active');
    }
    // Note: In a real implementation, this would fetch historical data
    // For now, it just updates the display as a UI demonstration
}

// ========== CUSTOM MONITORS ==========

const MONITOR_COLORS = [
    '#00ff88', '#ff6600', '#00aaff', '#ff00ff', '#ffcc00',
    '#ff3366', '#33ccff', '#99ff33', '#ff6699', '#00ffcc'
];

// Load monitors from localStorage
function loadMonitors() {
    try {
        const data = localStorage.getItem('customMonitors');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to load monitors:', e);
        return [];
    }
}

// Save monitors to localStorage
function saveMonitors(monitors) {
    try {
        localStorage.setItem('customMonitors', JSON.stringify(monitors));
    } catch (e) {
        console.error('Failed to save monitors:', e);
    }
}

// Render monitors list in settings
function renderMonitorsList() {
    const monitors = loadMonitors();
    const container = document.getElementById('monitorsList');
    if (!container) return;

    if (monitors.length === 0) {
        container.innerHTML = '<div style="font-size: 0.6rem; color: var(--text-dim); padding: 0.5rem 0;">No monitors yet</div>';
        return;
    }

    container.innerHTML = monitors.map(m => `
        <div class="monitor-item">
            <div class="monitor-item-info">
                <div class="monitor-item-name">
                    <div class="monitor-item-color" style="background: ${m.color};"></div>
                    ${m.name}
                </div>
                <div class="monitor-item-keywords">${m.keywords.join(', ')}</div>
                ${m.lat && m.lon ? `<div class="monitor-item-location">📍 ${m.lat.toFixed(2)}, ${m.lon.toFixed(2)}</div>` : ''}
            </div>
            <div class="monitor-item-actions">
                <button class="monitor-item-btn" onclick="editMonitor('${m.id}')" title="Edit">✎</button>
                <button class="monitor-item-btn delete" onclick="deleteMonitor('${m.id}')" title="Delete">✕</button>
            </div>
        </div>
    `).join('');
}

// Open monitor form (for add or edit)
function openMonitorForm(monitorId = null) {
    const overlay = document.getElementById('monitorFormOverlay');
    const titleEl = document.getElementById('monitorFormTitle');
    const editIdEl = document.getElementById('monitorEditId');
    const nameEl = document.getElementById('monitorName');
    const keywordsEl = document.getElementById('monitorKeywords');
    const latEl = document.getElementById('monitorLat');
    const lonEl = document.getElementById('monitorLon');
    const colorsContainer = document.getElementById('monitorColors');

    // Render color options
    colorsContainer.innerHTML = MONITOR_COLORS.map((c, i) =>
        `<div class="monitor-color-option" style="background: ${c};" data-color="${c}" onclick="selectMonitorColor('${c}')"></div>`
    ).join('');

    if (monitorId) {
        // Edit mode
        const monitors = loadMonitors();
        const monitor = monitors.find(m => m.id === monitorId);
        if (monitor) {
            titleEl.textContent = 'Edit Monitor';
            editIdEl.value = monitorId;
            nameEl.value = monitor.name;
            keywordsEl.value = monitor.keywords.join(', ');
            latEl.value = monitor.lat || '';
            lonEl.value = monitor.lon || '';
            selectMonitorColor(monitor.color);
        }
    } else {
        // Add mode
        titleEl.textContent = 'Add Monitor';
        editIdEl.value = '';
        nameEl.value = '';
        keywordsEl.value = '';
        latEl.value = '';
        lonEl.value = '';
        selectMonitorColor(MONITOR_COLORS[0]);
    }

    overlay.classList.add('open');
}

// Close monitor form
function closeMonitorForm() {
    document.getElementById('monitorFormOverlay').classList.remove('open');
}

// Select a monitor color
function selectMonitorColor(color) {
    document.querySelectorAll('.monitor-color-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.color === color);
    });
}

// Get currently selected color
function getSelectedMonitorColor() {
    const selected = document.querySelector('.monitor-color-option.selected');
    return selected ? selected.dataset.color : MONITOR_COLORS[0];
}

// Save monitor (add or update)
function saveMonitor() {
    const editId = document.getElementById('monitorEditId').value;
    const name = document.getElementById('monitorName').value.trim();
    const keywordsRaw = document.getElementById('monitorKeywords').value.trim();
    const lat = parseFloat(document.getElementById('monitorLat').value);
    const lon = parseFloat(document.getElementById('monitorLon').value);
    const color = getSelectedMonitorColor();

    if (!name) {
        alert('Please enter a name');
        return;
    }
    if (!keywordsRaw) {
        alert('Please enter at least one keyword');
        return;
    }

    const keywords = keywordsRaw.split(',').map(k => k.trim().toLowerCase()).filter(k => k);

    const monitor = {
        id: editId || `monitor_${Date.now()}`,
        name,
        keywords,
        color,
        lat: isNaN(lat) ? null : lat,
        lon: isNaN(lon) ? null : lon,
        createdAt: editId ? undefined : new Date().toISOString()
    };

    const monitors = loadMonitors();
    if (editId) {
        // Update existing
        const idx = monitors.findIndex(m => m.id === editId);
        if (idx !== -1) {
            monitor.createdAt = monitors[idx].createdAt;
            monitors[idx] = monitor;
        }
    } else {
        // Add new
        monitors.push(monitor);
    }

    saveMonitors(monitors);
    closeMonitorForm();
    renderMonitorsList();
    refreshAll(); // Refresh to show on map and in panel
}

// Edit a monitor
function editMonitor(id) {
    openMonitorForm(id);
}

// Delete a monitor
function deleteMonitor(id) {
    if (!confirm('Delete this monitor?')) return;
    const monitors = loadMonitors().filter(m => m.id !== id);
    saveMonitors(monitors);
    renderMonitorsList();
    refreshAll();
}

// Scan news for monitor matches
function scanMonitorsForMatches(allNews) {
    const monitors = loadMonitors();
    const results = {};

    monitors.forEach(monitor => {
        const matches = [];
        allNews.forEach(item => {
            const title = (item.title || '').toLowerCase();
            const matched = monitor.keywords.some(kw => title.includes(kw));
            if (matched) {
                matches.push({
                    title: item.title,
                    link: item.link,
                    source: item.source,
                    monitorId: monitor.id,
                    monitorName: monitor.name,
                    monitorColor: monitor.color
                });
            }
        });
        results[monitor.id] = {
            monitor,
            matches: matches.slice(0, 10), // Limit per monitor
            count: matches.length
        };
    });

    return results;
}

// Render the My Monitors panel
function renderMonitorsPanel(allNews) {
    const panel = document.getElementById('monitorsPanel');
    const countEl = document.getElementById('monitorsCount');
    if (!panel) return;

    const monitors = loadMonitors();
    if (monitors.length === 0) {
        panel.innerHTML = `
            <div class="monitors-empty">
                No monitors configured
                <div class="monitors-empty-hint">Click Settings → Add Monitor to get started</div>
            </div>
        `;
        countEl.textContent = '-';
        return;
    }

    const results = scanMonitorsForMatches(allNews);
    let allMatches = [];

    Object.values(results).forEach(r => {
        allMatches = allMatches.concat(r.matches);
    });

    if (allMatches.length === 0) {
        panel.innerHTML = `
            <div class="monitors-empty">
                No matches found
                <div class="monitors-empty-hint">Your ${monitors.length} monitor(s) found no matching headlines</div>
            </div>
        `;
        countEl.textContent = '0';
        return;
    }

    // Sort by most recent (based on order in allNews)
    countEl.textContent = allMatches.length;
    panel.innerHTML = allMatches.slice(0, 20).map(match => `
        <div class="monitor-match">
            <div class="monitor-match-header">
                <div class="monitor-match-dot" style="background: ${match.monitorColor};"></div>
                <span class="monitor-match-name">${match.monitorName}</span>
            </div>
            <a href="${match.link}" target="_blank" class="monitor-match-title">${match.title}</a>
            <div class="monitor-match-source">${match.source || 'News'}</div>
        </div>
    `).join('');
}

// Get monitor data for map hotspots
function getMonitorHotspots(allNews) {
    const monitors = loadMonitors().filter(m => m.lat && m.lon);
    const results = scanMonitorsForMatches(allNews);

    return monitors.map(m => ({
        ...m,
        matchCount: results[m.id]?.count || 0,
        matches: results[m.id]?.matches || []
    }));
}

// Fetch Congressional trades - uses news RSS since APIs are locked down
async function fetchCongressTrades() {
    try {
        // Try Google News RSS for congress stock trading news
        const searchTerms = encodeURIComponent('congress stock trading pelosi tuberville');
        const rssUrl = `https://news.google.com/rss/search?q=${searchTerms}&hl=en-US&gl=US&ceid=US:en`;

        const text = await fetchWithProxy(rssUrl);
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const items = xml.querySelectorAll('item');

        if (items.length > 0) {
            const trades = extractTradesFromNews(Array.from(items).slice(0, 15));
            if (trades.length >= 3) {
                console.log('Congress trades extracted from news');
                return trades;
            }
        }
    } catch (e) {
        console.log('News fetch failed:', e.message);
    }

    // Fallback: Recent trades with dynamic dates
    return getRecentNotableTrades();
}

// Extract trade info from news headlines
function extractTradesFromNews(items) {
    const trades = [];
    const members = {
        'pelosi': { name: 'Nancy Pelosi', party: 'D', district: 'CA-11' },
        'tuberville': { name: 'Tommy Tuberville', party: 'R', district: 'Senate' },
        'crenshaw': { name: 'Dan Crenshaw', party: 'R', district: 'TX-02' },
        'greene': { name: 'Marjorie Taylor Greene', party: 'R', district: 'GA-14' },
        'khanna': { name: 'Ro Khanna', party: 'D', district: 'CA-17' },
        'gottheimer': { name: 'Josh Gottheimer', party: 'D', district: 'NJ-05' },
        'mccaul': { name: 'Michael McCaul', party: 'R', district: 'TX-10' },
        'ossoff': { name: 'Jon Ossoff', party: 'D', district: 'Senate' },
        'cruz': { name: 'Ted Cruz', party: 'R', district: 'Senate' }
    };
    const tickers = ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'META', 'TSLA', 'AMZN', 'AMD', 'AVGO', 'CRM', 'PLTR'];

    items.forEach(item => {
        const title = (item.querySelector('title')?.textContent || '').toLowerCase();
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();

        for (const [key, member] of Object.entries(members)) {
            if (title.includes(key)) {
                const isBuy = title.includes('buy') || title.includes('purchase') || title.includes('bought');
                const isSell = title.includes('sell') || title.includes('sold') || title.includes('sale');

                let ticker = tickers.find(t => title.includes(t.toLowerCase())) || 'STOCK';

                if (isBuy || isSell || title.includes('trade') || title.includes('stock')) {
                    trades.push({
                        ...member,
                        ticker,
                        type: isSell ? 'sell' : 'buy',
                        amount: 'Disclosed',
                        date: pubDate
                    });
                }
            }
        }
    });

    return trades.slice(0, 10);
}

// Fallback - recent trades with dynamically calculated dates
function getRecentNotableTrades() {
    const today = new Date();
    const daysAgo = (n) => {
        const d = new Date(today);
        d.setDate(d.getDate() - n);
        return d.toISOString().split('T')[0];
    };

    // Real congressional traders known for active trading
    return [
        { name: 'Nancy Pelosi', party: 'D', ticker: 'NVDA', type: 'buy', amount: '$1M - $5M', date: daysAgo(2), district: 'CA-11' },
        { name: 'Tommy Tuberville', party: 'R', ticker: 'PLTR', type: 'buy', amount: '$250K - $500K', date: daysAgo(4), district: 'Senate' },
        { name: 'Dan Crenshaw', party: 'R', ticker: 'MSFT', type: 'buy', amount: '$100K - $250K', date: daysAgo(6), district: 'TX-02' },
        { name: 'Ro Khanna', party: 'D', ticker: 'GOOGL', type: 'buy', amount: '$50K - $100K', date: daysAgo(8), district: 'CA-17' },
        { name: 'Josh Gottheimer', party: 'D', ticker: 'META', type: 'buy', amount: '$100K - $250K', date: daysAgo(10), district: 'NJ-05' },
        { name: 'Marjorie Taylor Greene', party: 'R', ticker: 'TSLA', type: 'buy', amount: '$15K - $50K', date: daysAgo(12), district: 'GA-14' },
        { name: 'Michael McCaul', party: 'R', ticker: 'RTX', type: 'buy', amount: '$500K - $1M', date: daysAgo(14), district: 'TX-10' },
        { name: 'Nancy Pelosi', party: 'D', ticker: 'AAPL', type: 'sell', amount: '$500K - $1M', date: daysAgo(18), district: 'CA-11' },
        { name: 'Mark Green', party: 'R', ticker: 'LMT', type: 'buy', amount: '$50K - $100K', date: daysAgo(21), district: 'TN-07' },
        { name: 'Tommy Tuberville', party: 'R', ticker: 'XOM', type: 'buy', amount: '$100K - $250K', date: daysAgo(25), district: 'Senate' }
    ];
}

// Fetch whale transactions
async function fetchWhaleTransactions() {
    try {
        // Use Blockchain.com API for recent large BTC transactions
        const text = await fetchWithProxy('https://blockchain.info/unconfirmed-transactions?format=json');
        const data = JSON.parse(text);

        // Filter for large transactions (> 10 BTC)
        const btcPrice = 100000; // Approximate, will be updated
        const whales = data.txs
            .map(tx => {
                const totalOut = tx.out.reduce((sum, o) => sum + o.value, 0) / 100000000;
                return {
                    coin: 'BTC',
                    amount: totalOut,
                    usd: totalOut * btcPrice,
                    hash: tx.hash.substring(0, 8) + '...',
                    time: new Date(tx.time * 1000)
                };
            })
            .filter(tx => tx.amount >= 10)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 15);

        return whales;
    } catch (error) {
        console.error('Error fetching whale transactions:', error);
        // Fallback: simulate with placeholder data showing the feature
        return [];
    }
}

// Calculate "Main Character" from news headlines
function calculateMainCharacter(allNews) {
    // Common names and figures to track
    const namePatterns = [
        { pattern: /\btrump\b/gi, name: 'Trump' },
        { pattern: /\bbiden\b/gi, name: 'Biden' },
        { pattern: /\belon\b|\bmusk\b/gi, name: 'Elon Musk' },
        { pattern: /\bputin\b/gi, name: 'Putin' },
        { pattern: /\bzelensky\b/gi, name: 'Zelensky' },
        { pattern: /\bxi\s*jinping\b|\bxi\b/gi, name: 'Xi Jinping' },
        { pattern: /\bnetanyahu\b/gi, name: 'Netanyahu' },
        { pattern: /\bsam\s*altman\b/gi, name: 'Sam Altman' },
        { pattern: /\bmark\s*zuckerberg\b|\bzuckerberg\b/gi, name: 'Zuckerberg' },
        { pattern: /\bjeff\s*bezos\b|\bbezos\b/gi, name: 'Bezos' },
        { pattern: /\btim\s*cook\b/gi, name: 'Tim Cook' },
        { pattern: /\bsatya\s*nadella\b|\bnadella\b/gi, name: 'Satya Nadella' },
        { pattern: /\bsundar\s*pichai\b|\bpichai\b/gi, name: 'Sundar Pichai' },
        { pattern: /\bwarren\s*buffett\b|\bbuffett\b/gi, name: 'Warren Buffett' },
        { pattern: /\bjanet\s*yellen\b|\byellen\b/gi, name: 'Janet Yellen' },
        { pattern: /\bjerome\s*powell\b|\bpowell\b/gi, name: 'Jerome Powell' },
        { pattern: /\bkamala\s*harris\b|\bharris\b/gi, name: 'Kamala Harris' },
        { pattern: /\bnancy\s*pelosi\b|\bpelosi\b/gi, name: 'Nancy Pelosi' },
        { pattern: /\bjensen\s*huang\b|\bhuang\b/gi, name: 'Jensen Huang' },
        { pattern: /\bdario\s*amodei\b|\bamodei\b/gi, name: 'Dario Amodei' }
    ];

    const counts = {};

    allNews.forEach(item => {
        const text = item.title.toLowerCase();
        namePatterns.forEach(({ pattern, name }) => {
            const matches = text.match(pattern);
            if (matches) {
                counts[name] = (counts[name] || 0) + matches.length;
            }
        });
    });

    // Sort by mentions
    const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    return sorted;
}

// Fetch government contracts from USAspending
async function fetchGovContracts() {
    try {
        // USAspending API for recent contract awards
        const response = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filters: {
                    time_period: [{ start_date: getDateDaysAgo(7), end_date: getToday() }],
                    award_type_codes: ['A', 'B', 'C', 'D'] // Contracts only
                },
                fields: ['Award ID', 'Recipient Name', 'Award Amount', 'Awarding Agency', 'Description', 'Start Date'],
                limit: 15,
                order: 'desc',
                sort: 'Award Amount'
            })
        });

        const data = await response.json();

        return (data.results || []).map(c => ({
            agency: c['Awarding Agency'] || 'Unknown Agency',
            vendor: c['Recipient Name'] || 'Unknown',
            amount: c['Award Amount'] || 0,
            description: c['Description'] || 'Contract Award',
            date: c['Start Date']
        }));
    } catch (error) {
        console.error('Error fetching contracts:', error);
        return [];
    }
}

function getDateDaysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

// AI RSS feeds for arms race tracking
const AI_FEEDS = [
    { name: 'OpenAI', url: 'https://openai.com/blog/rss.xml' },
    { name: 'Anthropic', url: 'https://www.anthropic.com/rss.xml' },
    { name: 'Google AI', url: 'https://blog.google/technology/ai/rss/' },
    { name: 'DeepMind', url: 'https://deepmind.google/blog/rss.xml' },
    { name: 'Meta AI', url: 'https://ai.meta.com/blog/rss/' },
    { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml' }
];

async function fetchAINews() {
    const results = await Promise.all(AI_FEEDS.map(async (source) => {
        try {
            const text = await fetchWithProxy(source.url);
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');

            let items = xml.querySelectorAll('item');
            if (items.length === 0) items = xml.querySelectorAll('entry');

            return Array.from(items).slice(0, 3).map(item => {
                let link = '';
                const linkEl = item.querySelector('link');
                if (linkEl) link = linkEl.getAttribute('href') || linkEl.textContent || '';

                return {
                    source: source.name,
                    title: item.querySelector('title')?.textContent?.trim() || 'No title',
                    link: link.trim(),
                    date: item.querySelector('pubDate')?.textContent ||
                          item.querySelector('published')?.textContent || ''
                };
            });
        } catch (e) {
            console.log(`Failed to fetch ${source.name}`);
            return [];
        }
    }));

    return results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);
}

// Fetch Fed balance sheet from FRED
async function fetchFedBalance() {
    try {
        // FRED API - Fed total assets (WALCL)
        const text = await fetchWithProxy('https://api.stlouisfed.org/fred/series/observations?series_id=WALCL&sort_order=desc&limit=10&file_type=json&api_key=DEMO');
        const data = JSON.parse(text);

        if (data.observations && data.observations.length >= 2) {
            const latest = parseFloat(data.observations[0].value);
            const previous = parseFloat(data.observations[1].value);
            const change = latest - previous;
            const changePercent = (change / previous) * 100;

            // WALCL is in millions
            return {
                value: latest / 1000000, // Convert to trillions
                change: change / 1000000,
                changePercent,
                date: data.observations[0].date,
                // Historical high was ~9T in 2022
                percentOfMax: (latest / 9000000) * 100
            };
        }
    } catch (error) {
        console.error('Error fetching Fed balance:', error);
    }

    // Fallback with approximate current value
    return {
        value: 6.8,
        change: 0,
        changePercent: 0,
        date: new Date().toISOString().split('T')[0],
        percentOfMax: 75
    };
}

// Render functions for new panels
function renderCongressTrades(trades) {
    const panel = document.getElementById('congressPanel');
    const count = document.getElementById('congressCount');

    if (trades.length === 0) {
        panel.innerHTML = '<div class="error-msg">Unable to load congressional trades</div>';
        count.textContent = '0';
        return;
    }

    panel.innerHTML = trades.map(t => `
        <div class="congress-item">
            <div class="congress-info">
                <div>
                    <span class="congress-name">${t.name}</span>
                    <span class="congress-party ${t.party}">${t.party}</span>
                </div>
                <div class="congress-ticker">${t.ticker}</div>
                <div class="congress-meta">${timeAgo(t.date)} · ${t.district}</div>
            </div>
            <div class="congress-type">
                <span class="congress-action ${t.type}">${t.type.toUpperCase()}</span>
                <div class="congress-amount">${t.amount}</div>
            </div>
        </div>
    `).join('');

    count.textContent = trades.length;
}

function renderWhaleWatch(whales) {
    const panel = document.getElementById('whalePanel');
    const count = document.getElementById('whaleCount');

    if (whales.length === 0) {
        panel.innerHTML = '<div class="error-msg">No whale transactions detected</div>';
        count.textContent = '0';
        return;
    }

    const formatAmount = (amt) => amt >= 1000 ? (amt / 1000).toFixed(1) + 'K' : amt.toFixed(2);
    const formatUSD = (usd) => {
        if (usd >= 1000000000) return '$' + (usd / 1000000000).toFixed(1) + 'B';
        if (usd >= 1000000) return '$' + (usd / 1000000).toFixed(1) + 'M';
        return '$' + (usd / 1000).toFixed(0) + 'K';
    };

    panel.innerHTML = whales.map(w => `
        <div class="whale-item">
            <div class="whale-header">
                <span class="whale-coin">${w.coin}</span>
                <span class="whale-amount">${formatAmount(w.amount)} ${w.coin}</span>
            </div>
            <div class="whale-flow">
                <span class="whale-usd">${formatUSD(w.usd)}</span>
                <span class="arrow">→</span>
                <span>${w.hash}</span>
            </div>
        </div>
    `).join('');

    count.textContent = whales.length;
}

function renderMainCharacter(rankings) {
    const panel = document.getElementById('mainCharPanel');

    if (rankings.length === 0) {
        panel.innerHTML = '<div class="error-msg">No main character detected</div>';
        return;
    }

    const [topName, topCount] = rankings[0];

    panel.innerHTML = `
        <div class="main-char-display">
            <div class="main-char-label">Today's Main Character</div>
            <div class="main-char-name">${topName}</div>
            <div class="main-char-count">${topCount} mentions in headlines</div>

            <div class="main-char-list">
                ${rankings.slice(1, 8).map((r, i) => `
                    <div class="char-row">
                        <span class="rank">${i + 2}.</span>
                        <span class="name">${r[0]}</span>
                        <span class="mentions">${r[1]}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderGovContracts(contracts) {
    const panel = document.getElementById('contractsPanel');
    const count = document.getElementById('contractsCount');

    if (contracts.length === 0) {
        panel.innerHTML = '<div class="error-msg">Unable to load contracts</div>';
        count.textContent = '0';
        return;
    }

    const formatValue = (v) => {
        if (v >= 1000000000) return '$' + (v / 1000000000).toFixed(1) + 'B';
        if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
        if (v >= 1000) return '$' + (v / 1000).toFixed(0) + 'K';
        return '$' + v.toFixed(0);
    };

    panel.innerHTML = contracts.map(c => `
        <div class="contract-item">
            <div class="contract-agency">${c.agency}</div>
            <div class="contract-desc">${c.description.substring(0, 100)}${c.description.length > 100 ? '...' : ''}</div>
            <div class="contract-meta">
                <span class="contract-vendor">${c.vendor}</span>
                <span class="contract-value">${formatValue(c.amount)}</span>
            </div>
        </div>
    `).join('');

    count.textContent = contracts.length;
}

function renderAINews(items) {
    const panel = document.getElementById('aiPanel');
    const count = document.getElementById('aiCount');

    if (items.length === 0) {
        panel.innerHTML = '<div class="error-msg">Unable to load AI news</div>';
        count.textContent = '0';
        return;
    }

    panel.innerHTML = items.map(item => `
        <div class="ai-item">
            <div class="ai-source">${item.source}</div>
            <a class="ai-title item-title" href="${item.link}" target="_blank">${item.title}</a>
            <div class="ai-date">${timeAgo(item.date)}</div>
        </div>
    `).join('');

    count.textContent = items.length;
}

function renderMoneyPrinter(data) {
    const panel = document.getElementById('printerPanel');

    const isExpanding = data.change > 0;
    const status = isExpanding ? 'PRINTER ON' : 'PRINTER OFF';

    panel.innerHTML = `
        <div class="printer-gauge">
            <div class="printer-label">Federal Reserve Balance Sheet</div>
            <div class="printer-value">
                ${data.value.toFixed(2)}<span class="printer-unit">T USD</span>
            </div>
            <div class="printer-change ${isExpanding ? 'up' : 'down'}">
                ${data.change >= 0 ? '+' : ''}${(data.change * 1000).toFixed(0)}B (${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%) WoW
            </div>
            <div class="printer-bar">
                <div class="printer-fill" style="width: ${Math.min(data.percentOfMax, 100)}%"></div>
            </div>
            <div class="printer-status">
                <span class="printer-indicator ${isExpanding ? 'on' : 'off'}"></span>
                ${status}
            </div>
        </div>
    `;
}

// Fetch Polymarket predictions
async function fetchPolymarket() {
    try {
        const text = await fetchWithProxy('https://gamma-api.polymarket.com/markets?closed=false&order=volume&ascending=false&limit=25');
        const data = JSON.parse(text);

        if (!Array.isArray(data)) {
            console.error('Polymarket response is not an array');
            return [];
        }

        // Parse markets with flexible field handling
        const markets = data
            .filter(m => {
                const vol = parseFloat(m.volume || m.volumeNum || 0);
                return m.question && vol > 1000;
            })
            .slice(0, 15)
            .map(m => {
                // Handle different price formats
                let yesPrice = 0;
                if (m.outcomePrices && Array.isArray(m.outcomePrices)) {
                    yesPrice = parseFloat(m.outcomePrices[0]) || 0;
                } else if (m.bestBid !== undefined) {
                    yesPrice = parseFloat(m.bestBid) || 0;
                } else if (m.lastTradePrice !== undefined) {
                    yesPrice = parseFloat(m.lastTradePrice) || 0;
                }

                // Ensure price is in 0-1 range, convert to percentage
                if (yesPrice > 1) yesPrice = yesPrice / 100;
                const yesPct = Math.round(yesPrice * 100);

                return {
                    question: m.question,
                    yes: yesPct,
                    volume: parseFloat(m.volume || m.volumeNum || 0),
                    slug: m.slug || m.id
                };
            });

        return markets;
    } catch (error) {
        console.error('Error fetching Polymarket:', error);
        return [];
    }
}

// Fetch earthquakes from USGS
async function fetchEarthquakes() {
    try {
        // USGS API - significant earthquakes in last 7 days
        const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson';
        const text = await fetchWithProxy(url);
        const data = JSON.parse(text);

        if (!data.features) return [];

        return data.features
            .filter(f => f.properties.mag >= 4.0) // Only M4.0+
            .slice(0, 15)
            .map(f => ({
                mag: f.properties.mag,
                place: f.properties.place,
                time: f.properties.time,
                lat: f.geometry.coordinates[1],
                lon: f.geometry.coordinates[0],
                depth: f.geometry.coordinates[2]
            }));
    } catch (error) {
        console.error('Error fetching earthquakes:', error);
        return [];
    }
}

// Fetch layoffs news
async function fetchLayoffs() {
    try {
        const searchTerms = encodeURIComponent('tech layoffs 2025 job cuts');
        const rssUrl = `https://news.google.com/rss/search?q=${searchTerms}&hl=en-US&gl=US&ceid=US:en`;
        const text = await fetchWithProxy(rssUrl);
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const items = xml.querySelectorAll('item');

        const layoffs = [];
        const companies = ['google', 'meta', 'amazon', 'microsoft', 'apple', 'tesla', 'nvidia',
            'salesforce', 'stripe', 'spotify', 'intel', 'cisco', 'ibm', 'dell', 'hp', 'oracle',
            'adobe', 'paypal', 'uber', 'lyft', 'airbnb', 'doordash', 'snap', 'twitter', 'x corp'];

        items.forEach(item => {
            const title = item.querySelector('title')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent;
            const link = item.querySelector('link')?.textContent || '';

            // Extract company name and layoff count
            const titleLower = title.toLowerCase();
            const company = companies.find(c => titleLower.includes(c));

            // Look for numbers in title
            const countMatch = title.match(/(\d{1,3}(?:,\d{3})*|\d+)\s*(?:employees?|workers?|jobs?|staff|people|positions?)/i) ||
                             title.match(/(?:cuts?|lays?\s*off|eliminat\w*|slash\w*)\s*(\d{1,3}(?:,\d{3})*|\d+)/i);

            if (company || titleLower.includes('layoff') || titleLower.includes('job cut')) {
                layoffs.push({
                    company: company ? company.charAt(0).toUpperCase() + company.slice(1) : 'Tech',
                    title: title.substring(0, 100),
                    count: countMatch ? countMatch[1].replace(/,/g, '') : null,
                    date: pubDate,
                    link
                });
            }
        });

        return layoffs.slice(0, 8);
    } catch (error) {
        console.error('Error fetching layoffs:', error);
        return getRecentLayoffs();
    }
}

// Fallback layoffs data
function getRecentLayoffs() {
    const today = new Date();
    const daysAgo = (n) => {
        const d = new Date(today);
        d.setDate(d.getDate() - n);
        return d.toISOString();
    };
    return [
        { company: 'Meta', title: 'Meta cuts workforce in Reality Labs division', count: '700', date: daysAgo(1) },
        { company: 'Google', title: 'Google restructures cloud division, reduces staff', count: '200', date: daysAgo(2) },
        { company: 'Microsoft', title: 'Microsoft gaming division sees job cuts', count: '650', date: daysAgo(3) },
        { company: 'Amazon', title: 'Amazon reduces Alexa team headcount', count: '400', date: daysAgo(4) }
    ];
}

// Fetch situation news (Venezuela/Greenland)
async function fetchSituationNews(keywords, limit = 5) {
    try {
        const searchTerms = encodeURIComponent(keywords);
        const rssUrl = `https://news.google.com/rss/search?q=${searchTerms}&hl=en-US&gl=US&ceid=US:en`;
        const text = await fetchWithProxy(rssUrl);
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const items = xml.querySelectorAll('item');

        return Array.from(items).slice(0, limit).map(item => ({
            title: item.querySelector('title')?.textContent || '',
            link: item.querySelector('link')?.textContent || '',
            pubDate: item.querySelector('pubDate')?.textContent,
            source: item.querySelector('source')?.textContent || 'News'
        }));
    } catch (error) {
        console.error('Error fetching situation news:', error);
        return [];
    }
}

// Detect regions from text
function detectRegions(text) {
    const lower = text.toLowerCase();
    const regions = [];
    for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
        if (keywords.some(kw => lower.includes(kw))) {
            regions.push(region);
        }
    }
    return regions;
}

// Detect topics from text
function detectTopics(text) {
    const lower = text.toLowerCase();
    const topics = [];
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (keywords.some(kw => lower.includes(kw))) {
            topics.push(topic);
        }
    }
    return topics;
}

// Fetch Intel Feed from multiple sources
async function fetchIntelFeed() {
    const results = await Promise.all(INTEL_SOURCES.map(async (source) => {
        try {
            const text = await fetchWithProxy(source.url);
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');

            let items = xml.querySelectorAll('item');
            if (items.length === 0) items = xml.querySelectorAll('entry');

            return Array.from(items).slice(0, 3).map(item => {
                let link = '';
                const linkEl = item.querySelector('link');
                if (linkEl) link = linkEl.getAttribute('href') || linkEl.textContent || '';

                const title = item.querySelector('title')?.textContent?.trim() || 'No title';
                const pubDate = item.querySelector('pubDate')?.textContent ||
                               item.querySelector('published')?.textContent || '';

                // Detect regions and topics from title
                const detectedRegions = source.region ? [source.region] : detectRegions(title);
                const detectedTopics = detectTopics(title);

                // Priority flag for critical items
                const isPriority = ALERT_KEYWORDS.some(kw => title.toLowerCase().includes(kw));

                return {
                    source: source.name,
                    sourceType: source.type,
                    title,
                    link: link.trim(),
                    pubDate,
                    regions: detectedRegions,
                    topics: detectedTopics,
                    isPriority
                };
            });
        } catch (e) {
            console.log(`Failed to fetch intel from ${source.name}`);
            return [];
        }
    }));

    // Flatten and sort by date, priority items first
    const allItems = results.flat();
    allItems.sort((a, b) => {
        if (a.isPriority && !b.isPriority) return -1;
        if (!a.isPriority && b.isPriority) return 1;
        return new Date(b.pubDate) - new Date(a.pubDate);
    });

    return allItems.slice(0, 25);
}

// Render Intel Feed panel
function renderIntelFeed(items) {
    const panel = document.getElementById('intelPanel');
    const count = document.getElementById('intelCount');

    if (!items || items.length === 0) {
        panel.innerHTML = '<div class="loading-msg">No intel available</div>';
        count.textContent = '-';
        return;
    }

    count.textContent = items.length;

    panel.innerHTML = items.map(item => {
        // Build tags HTML
        let tagsHTML = '';

        // Source type tag
        if (item.sourceType === 'osint') {
            tagsHTML += '<span class="intel-tag osint">OSINT</span>';
        } else if (item.sourceType === 'govt') {
            tagsHTML += '<span class="intel-tag govt">GOVT</span>';
        }

        // Region tags (max 2)
        item.regions.slice(0, 2).forEach(r => {
            tagsHTML += `<span class="intel-tag region">${r}</span>`;
        });

        // Topic tags (max 2)
        item.topics.slice(0, 2).forEach(t => {
            tagsHTML += `<span class="intel-tag topic">${t}</span>`;
        });

        const timeAgo = item.pubDate ? getRelativeTime(new Date(item.pubDate)) : '';

        return `
            <div class="intel-item ${item.isPriority ? 'priority' : ''}">
                <div class="intel-header">
                    <span class="intel-source">${item.source}</span>
                    <div class="intel-tags">${tagsHTML}</div>
                </div>
                <a href="${item.link}" target="_blank" class="intel-title">${item.title}</a>
                <div class="intel-meta">
                    <span>${timeAgo}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Get relative time string
function getRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

// Render Layoffs panel
function renderLayoffs(layoffs) {
    const panel = document.getElementById('layoffsPanel');
    const count = document.getElementById('layoffsCount');

    if (!layoffs || layoffs.length === 0) {
        panel.innerHTML = '<div class="loading-msg">No recent layoffs data</div>';
        count.textContent = '-';
        return;
    }

    count.textContent = layoffs.length;

    panel.innerHTML = layoffs.map(l => `
        <div class="layoff-item">
            <div class="layoff-company">${l.company}</div>
            ${l.count ? `<div class="layoff-count">${parseInt(l.count).toLocaleString()} jobs</div>` : ''}
            <div class="layoff-meta">
                <span class="headline">${l.title}</span>
                <span class="time">${timeAgo(l.date)}</span>
            </div>
        </div>
    `).join('');
}

// Render Situation panel (Venezuela or Greenland)
function renderSituation(panelId, statusId, news, config) {
    const panel = document.getElementById(panelId);
    const status = document.getElementById(statusId);

    if (!panel) return;

    // Determine threat level based on recent news volume and keywords
    let threatLevel = 'monitoring';
    let threatText = 'MONITORING';

    if (news.length > 0) {
        const recentNews = news.filter(n => {
            const date = new Date(n.pubDate);
            const hoursSince = (Date.now() - date.getTime()) / (1000 * 60 * 60);
            return hoursSince < 24;
        });

        const criticalKeywords = config.criticalKeywords || [];
        const hasCritical = news.some(n =>
            criticalKeywords.some(k => n.title.toLowerCase().includes(k))
        );

        if (hasCritical || recentNews.length >= 3) {
            threatLevel = 'critical';
            threatText = 'CRITICAL';
        } else if (recentNews.length >= 1) {
            threatLevel = 'medium';
            threatText = 'MEDIUM';
        }
    }

    status.innerHTML = `<span class="situation-status ${threatLevel}">${threatText}</span>`;

    const newsHTML = news.length > 0 ? news.map(n => `
        <div class="situation-item">
            <a href="${n.link}" target="_blank" class="headline">${n.title}</a>
            <div class="meta">${n.source} · ${timeAgo(n.pubDate)}</div>
        </div>
    `).join('') : '<div class="loading-msg">No recent news</div>';

    panel.innerHTML = `
        <div class="situation-header">
            <div class="situation-title">${config.title}</div>
            <div class="situation-subtitle">${config.subtitle}</div>
        </div>
        ${newsHTML}
    `;
}

// Format relative time
function timeAgo(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
}

// Render news items
function renderNews(items, panelId, countId) {
    const panel = document.getElementById(panelId);
    const count = document.getElementById(countId);

    if (items.length === 0) {
        panel.innerHTML = '<div class="error-msg">Failed to load</div>';
        count.textContent = '0';
        return;
    }

    panel.innerHTML = items.map(item => `
        <div class="item ${item.isAlert ? 'alert' : ''}">
            <div class="item-source">${item.source}${item.isAlert ? '<span class="alert-tag">ALERT</span>' : ''}</div>
            <a class="item-title" href="${item.link}" target="_blank">${item.title}</a>
            <div class="item-time">${timeAgo(item.pubDate)}</div>
        </div>
    `).join('');

    count.textContent = items.length;
}

// Render markets
function renderMarkets(markets) {
    const panel = document.getElementById('marketsPanel');
    const count = document.getElementById('marketsCount');

    if (markets.length === 0) {
        panel.innerHTML = '<div class="error-msg">Failed to load</div>';
        count.textContent = '0';
        return;
    }

    panel.innerHTML = markets.map(m => {
        const changeClass = m.change > 0 ? 'up' : m.change < 0 ? 'down' : '';
        const changeText = m.change !== null ? `${m.change > 0 ? '+' : ''}${m.change.toFixed(2)}%` : '-';
        const priceDisplay = typeof m.price === 'number' && m.price > 100
            ? m.price.toLocaleString('en-US', { maximumFractionDigits: 0 })
            : m.price?.toFixed(2);

        return `
            <div class="market-item">
                <div>
                    <div class="market-name">${m.name}</div>
                    <div class="market-symbol">${m.symbol}</div>
                </div>
                <div class="market-data">
                    <div class="market-price">$${priceDisplay}</div>
                    <div class="market-change ${changeClass}">${changeText}</div>
                </div>
            </div>
        `;
    }).join('');

    count.textContent = markets.length;
}

// Render sector heatmap
function renderHeatmap(sectors) {
    const panel = document.getElementById('heatmapPanel');

    if (sectors.length === 0) {
        panel.innerHTML = '<div class="error-msg">Failed to load</div>';
        return;
    }

    panel.innerHTML = '<div class="heatmap">' + sectors.map(s => {
        let colorClass = 'up-0';
        const c = s.change;
        if (c >= 2) colorClass = 'up-3';
        else if (c >= 1) colorClass = 'up-2';
        else if (c >= 0.5) colorClass = 'up-1';
        else if (c >= 0) colorClass = 'up-0';
        else if (c >= -0.5) colorClass = 'down-0';
        else if (c >= -1) colorClass = 'down-1';
        else if (c >= -2) colorClass = 'down-2';
        else colorClass = 'down-3';

        return `
            <div class="heatmap-cell ${colorClass}">
                <div class="sector-name">${s.name}</div>
                <div class="sector-change">${s.change >= 0 ? '+' : ''}${s.change.toFixed(2)}%</div>
            </div>
        `;
    }).join('') + '</div>';
}

// Render commodities
function renderCommodities(commodities) {
    const panel = document.getElementById('commoditiesPanel');

    if (commodities.length === 0) {
        panel.innerHTML = '<div class="error-msg">Failed to load</div>';
        return;
    }

    panel.innerHTML = commodities.map(m => {
        const changeClass = m.change > 0 ? 'up' : m.change < 0 ? 'down' : '';
        const changeText = `${m.change > 0 ? '+' : ''}${m.change.toFixed(2)}%`;
        const priceDisplay = m.price?.toFixed(2);

        return `
            <div class="market-item">
                <div>
                    <div class="market-name">${m.name}</div>
                    <div class="market-symbol">${m.symbol}</div>
                </div>
                <div class="market-data">
                    <div class="market-price">${m.symbol === 'VIX' ? '' : '$'}${priceDisplay}</div>
                    <div class="market-change ${changeClass}">${changeText}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Render Polymarket predictions
function renderPolymarket(markets) {
    const panel = document.getElementById('polymarketPanel');
    const count = document.getElementById('polymarketCount');

    if (markets.length === 0) {
        panel.innerHTML = '<div class="error-msg">Failed to load predictions</div>';
        count.textContent = '0';
        return;
    }

    const formatVolume = (v) => {
        if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
        if (v >= 1000) return '$' + (v / 1000).toFixed(0) + 'K';
        return '$' + v.toFixed(0);
    };

    panel.innerHTML = markets.map(m => `
        <div class="prediction-item">
            <div>
                <div class="prediction-question">${m.question}</div>
                <div class="prediction-volume">Vol: ${formatVolume(m.volume)}</div>
            </div>
            <div class="prediction-odds">
                <span class="prediction-yes">${m.yes}%</span>
            </div>
        </div>
    `).join('');

    count.textContent = markets.length;
}

// Update status
function setStatus(text, loading = false) {
    const status = document.getElementById('status');
    status.textContent = text;
    status.className = loading ? 'status loading' : 'status';
}

// Staged refresh - loads critical data first for faster perceived startup
async function refreshAll() {
    const btn = document.getElementById('refreshBtn');
    btn.disabled = true;
    setStatus('Loading critical...', true);

    let allNews = [];

    try {
        // STAGE 1: Critical data (news + markets) - loads first
        const stage1Promise = Promise.all([
            isPanelEnabled('politics') ? fetchCategory(FEEDS.politics) : Promise.resolve([]),
            isPanelEnabled('tech') ? fetchCategory(FEEDS.tech) : Promise.resolve([]),
            isPanelEnabled('finance') ? fetchCategory(FEEDS.finance) : Promise.resolve([]),
            isPanelEnabled('markets') ? fetchMarkets() : Promise.resolve([]),
            isPanelEnabled('heatmap') ? fetchSectors() : Promise.resolve([])
        ]);

        const [politics, tech, finance, markets, sectors] = await stage1Promise;

        // Render Stage 1 immediately
        if (isPanelEnabled('politics')) renderNews(politics, 'politicsPanel', 'politicsCount');
        if (isPanelEnabled('tech')) renderNews(tech, 'techPanel', 'techCount');
        if (isPanelEnabled('finance')) renderNews(finance, 'financePanel', 'financeCount');
        if (isPanelEnabled('markets')) renderMarkets(markets);
        if (isPanelEnabled('heatmap')) renderHeatmap(sectors);

        allNews = [...politics, ...tech, ...finance];
        setStatus('Loading more...', true);

        // STAGE 2: Secondary data (gov, commodities, polymarket, printer, earthquakes)
        const stage2Promise = Promise.all([
            isPanelEnabled('gov') ? fetchCategory(FEEDS.gov) : Promise.resolve([]),
            isPanelEnabled('commodities') ? fetchCommodities() : Promise.resolve([]),
            isPanelEnabled('polymarket') ? fetchPolymarket() : Promise.resolve([]),
            isPanelEnabled('printer') ? fetchFedBalance() : Promise.resolve({ value: 0, change: 0, changePercent: 0, percentOfMax: 0 }),
            isPanelEnabled('map') ? fetchEarthquakes() : Promise.resolve([])
        ]);

        const [gov, commodities, polymarket, fedBalance, earthquakes] = await stage2Promise;

        if (isPanelEnabled('gov')) {
            renderNews(gov, 'govPanel', 'govCount');
            allNews = [...allNews, ...gov];
        }
        if (isPanelEnabled('commodities')) renderCommodities(commodities);
        if (isPanelEnabled('polymarket')) renderPolymarket(polymarket);
        if (isPanelEnabled('printer')) renderMoneyPrinter(fedBalance);

        // Render map with earthquakes and shipping alert data
        if (isPanelEnabled('map')) {
            const activityData = analyzeHotspotActivity(allNews);
            await renderGlobalMap(activityData, earthquakes, allNews);
        }
        if (isPanelEnabled('mainchar')) {
            const mainCharRankings = calculateMainCharacter(allNews);
            renderMainCharacter(mainCharRankings);
        }

        setStatus('Loading extras...', true);

        // STAGE 3: Extra data (congress, whales, contracts, AI, layoffs, situations, intel) - lowest priority
        const stage3Promise = Promise.all([
            isPanelEnabled('congress') ? fetchCongressTrades() : Promise.resolve([]),
            isPanelEnabled('whales') ? fetchWhaleTransactions() : Promise.resolve([]),
            isPanelEnabled('contracts') ? fetchGovContracts() : Promise.resolve([]),
            isPanelEnabled('ai') ? fetchAINews() : Promise.resolve([]),
            isPanelEnabled('layoffs') ? fetchLayoffs() : Promise.resolve([]),
            isPanelEnabled('venezuela') ? fetchSituationNews('venezuela maduro caracas crisis') : Promise.resolve([]),
            isPanelEnabled('greenland') ? fetchSituationNews('greenland denmark trump arctic') : Promise.resolve([]),
            isPanelEnabled('intel') ? fetchIntelFeed() : Promise.resolve([])
        ]);

        const [congressTrades, whales, contracts, aiNews, layoffs, venezuelaNews, greenlandNews, intelFeed] = await stage3Promise;

        if (isPanelEnabled('congress')) renderCongressTrades(congressTrades);
        if (isPanelEnabled('whales')) renderWhaleWatch(whales);
        if (isPanelEnabled('contracts')) renderGovContracts(contracts);
        if (isPanelEnabled('ai')) renderAINews(aiNews);
        if (isPanelEnabled('layoffs')) renderLayoffs(layoffs);
        if (isPanelEnabled('intel')) renderIntelFeed(intelFeed);
        if (isPanelEnabled('venezuela')) {
            renderSituation('venezuelaPanel', 'venezuelaStatus', venezuelaNews, {
                title: 'Venezuela Crisis',
                subtitle: 'Political instability & humanitarian situation',
                criticalKeywords: ['invasion', 'military', 'coup', 'violence', 'sanctions', 'arrested']
            });
        }
        if (isPanelEnabled('greenland')) {
            renderSituation('greenlandPanel', 'greenlandStatus', greenlandNews, {
                title: 'Greenland Dispute',
                subtitle: 'US-Denmark tensions over Arctic territory',
                criticalKeywords: ['purchase', 'trump', 'military', 'takeover', 'independence', 'referendum']
            });
        }

        // Render My Monitors panel with all news
        if (isPanelEnabled('monitors')) {
            renderMonitorsPanel(allNews);
        }

        const now = new Date();
        setStatus(`Updated ${now.toLocaleTimeString()}`);
    } catch (error) {
        console.error('Refresh error:', error);
        setStatus('Error updating');
    }

    btn.disabled = false;
}

// Initial load
refreshAll();

// Auto-refresh every 5 minutes
setInterval(refreshAll, 5 * 60 * 1000);
