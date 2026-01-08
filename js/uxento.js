// Uxento Sidebar Functions
function toggleUxentoEnabled() {
    const sidebar = document.getElementById('uxentoSidebar');
    const toggle = document.getElementById('uxentoToggle');
    const expandBtn = document.getElementById('uxentoExpandBtn');
    const isEnabled = !sidebar.classList.contains('disabled');

    if (isEnabled) {
        // Disable
        sidebar.classList.add('disabled');
        toggle.classList.remove('on');
        expandBtn.style.display = 'none';
        localStorage.setItem('uxentoEnabled', 'false');
    } else {
        // Enable
        sidebar.classList.remove('disabled');
        sidebar.classList.remove('collapsed');
        toggle.classList.add('on');
        expandBtn.style.display = 'none';
        localStorage.setItem('uxentoEnabled', 'true');
        localStorage.setItem('uxentoCollapsed', 'false');
    }
}

function toggleUxentoSidebar() {
    const sidebar = document.getElementById('uxentoSidebar');
    const expandBtn = document.getElementById('uxentoExpandBtn');

    if (sidebar.classList.contains('disabled')) return;

    sidebar.classList.toggle('collapsed');
    if (sidebar.classList.contains('collapsed')) {
        expandBtn.style.display = 'block';
        localStorage.setItem('uxentoCollapsed', 'true');
    } else {
        expandBtn.style.display = 'none';
        localStorage.setItem('uxentoCollapsed', 'false');
    }
}

function enableUxento() {
    const sidebar = document.getElementById('uxentoSidebar');
    const toggle = document.getElementById('uxentoToggle');
    const expandBtn = document.getElementById('uxentoExpandBtn');

    sidebar.classList.remove('disabled');
    sidebar.classList.remove('collapsed');
    toggle.classList.add('on');
    expandBtn.style.display = 'none';
    localStorage.setItem('uxentoEnabled', 'true');
    localStorage.setItem('uxentoCollapsed', 'false');
}

let uxentoLoadTimeout = null;

function loadUxento() {
    const url = document.getElementById('uxentoUrl').value.trim();
    if (!url) return;

    const setup = document.getElementById('uxentoSetup');
    const frameContainer = document.getElementById('uxentoFrameContainer');
    const frame = document.getElementById('uxentoFrame');
    const loading = document.getElementById('uxentoLoading');

    // Show loading state
    if (loading) {
        loading.classList.remove('hidden');
        loading.innerHTML = `
            <div class="uxento-spinner"></div>
            <div class="uxento-loading-text">Loading Twitter Monitor...</div>
        `;
    }

    setup.style.display = 'none';
    frameContainer.style.display = 'block';
    frame.src = url;

    localStorage.setItem('uxentoUrl', url);

    // Also update settings input
    const settingsInput = document.getElementById('uxentoUrlSettings');
    if (settingsInput) settingsInput.value = url;

    // Timeout - if still loading after 8 seconds, show error with option to open in new tab
    if (uxentoLoadTimeout) clearTimeout(uxentoLoadTimeout);
    uxentoLoadTimeout = setTimeout(() => {
        if (loading && !loading.classList.contains('hidden')) {
            loading.innerHTML = `
                <div class="uxento-loading-text" style="text-align: center;">
                    <div style="margin-bottom: 12px;">Unable to embed. Site may block iframes.</div>
                    <button class="uxento-btn" onclick="window.open('${url}', '_blank')">Open in New Tab</button>
                    <button class="uxento-btn" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); margin-left: 8px;" onclick="retryUxento()">Retry</button>
                </div>
            `;
        }
    }, 8000);
}

function retryUxento() {
    const frame = document.getElementById('uxentoFrame');
    const loading = document.getElementById('uxentoLoading');
    const url = localStorage.getItem('uxentoUrl');

    if (loading) {
        loading.classList.remove('hidden');
        loading.innerHTML = `
            <div class="uxento-spinner"></div>
            <div class="uxento-loading-text">Loading Twitter Monitor...</div>
        `;
    }

    if (frame && url) {
        frame.src = '';
        setTimeout(() => { frame.src = url; }, 100);
    }

    // Reset timeout
    if (uxentoLoadTimeout) clearTimeout(uxentoLoadTimeout);
    uxentoLoadTimeout = setTimeout(() => {
        if (loading && !loading.classList.contains('hidden')) {
            loading.innerHTML = `
                <div class="uxento-loading-text" style="text-align: center;">
                    <div style="margin-bottom: 12px;">Unable to embed. Site may block iframes.</div>
                    <button class="uxento-btn" onclick="window.open('${url}', '_blank')">Open in New Tab</button>
                    <button class="uxento-btn" style="background: var(--surface); color: var(--text); border: 1px solid var(--border); margin-left: 8px;" onclick="retryUxento()">Retry</button>
                </div>
            `;
        }
    }, 8000);
}

function onUxentoLoad() {
    const loading = document.getElementById('uxentoLoading');
    if (loading) loading.classList.add('hidden');
    if (uxentoLoadTimeout) clearTimeout(uxentoLoadTimeout);
}

// Attach load event listener to iframe
document.getElementById('uxentoFrame').addEventListener('load', onUxentoLoad);

function resetUxento() {
    const setup = document.getElementById('uxentoSetup');
    const frameContainer = document.getElementById('uxentoFrameContainer');
    const frame = document.getElementById('uxentoFrame');
    const loading = document.getElementById('uxentoLoading');

    // Clear any pending timeout
    if (uxentoLoadTimeout) clearTimeout(uxentoLoadTimeout);

    // Clear the iframe
    frame.src = '';

    // Reset loading spinner state
    if (loading) {
        loading.classList.remove('hidden');
        loading.innerHTML = `
            <div class="uxento-spinner"></div>
            <div class="uxento-loading-text">Loading Twitter Monitor...</div>
        `;
    }

    // Hide frame container, show setup
    frameContainer.style.display = 'none';
    setup.style.display = 'flex';
}

function saveUxentoUrl() {
    const url = document.getElementById('uxentoUrlSettings').value.trim();
    if (url) {
        document.getElementById('uxentoUrl').value = url;
        localStorage.setItem('uxentoUrl', url);
    }
}

// Load saved Uxento state on page load
function initUxento() {
    const savedUrl = localStorage.getItem('uxentoUrl');
    const isEnabled = localStorage.getItem('uxentoEnabled') === 'true';
    const isCollapsed = localStorage.getItem('uxentoCollapsed') === 'true';
    const sidebar = document.getElementById('uxentoSidebar');
    const toggle = document.getElementById('uxentoToggle');
    const expandBtn = document.getElementById('uxentoExpandBtn');
    const settingsInput = document.getElementById('uxentoUrlSettings');

    // Set URL in both inputs
    if (savedUrl) {
        document.getElementById('uxentoUrl').value = savedUrl;
        if (settingsInput) settingsInput.value = savedUrl;
    } else {
        // Default URL
        const defaultUrl = 'https://app.uxento.io/aio';
        if (settingsInput) settingsInput.value = defaultUrl;
    }

    if (isEnabled) {
        sidebar.classList.remove('disabled');
        toggle.classList.add('on');

        if (savedUrl) {
            loadUxento();
        }

        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            expandBtn.style.display = 'block';
        }
    } else {
        // Keep disabled (default state)
        sidebar.classList.add('disabled');
        toggle.classList.remove('on');
        expandBtn.style.display = 'none';
    }
}

// Call initUxento when DOM is ready
document.addEventListener('DOMContentLoaded', initUxento);
