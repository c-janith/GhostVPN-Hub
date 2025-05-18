function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cname) == 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return "";
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function extractRemark() {
    const input = document.getElementById('v2rayInput').value;
    const fullUrl = 'https://sg.ghostvpnhub.site:2096/json/' + input;
    setCookie('v2rayCode', input, 7);
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(fullUrl);

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const v2rayConfig = JSON.parse(data.contents);
        const remark = v2rayConfig.remarks || 'No remarks found';
        displayRemark(remark);
    } catch (error) {
        document.getElementById('result').innerText = 'Invalid V2Ray URL or JSON format';
        document.getElementById('result').style.display = 'block';
    }
}

function displayRemark(remark) {
    // Initialize defaults
    let username = 'N/A';
    let remainingUsage = 'Unlimited'; // Default if 📊 is missing
    let remainingDate = 'Never Expire'; // Default if ⏳ is missing

    // Extract username (always the first part before any special symbols)
    const usernameEnd = remark.indexOf('-');
    if (usernameEnd !== -1) {
        username = remark.substring(0, usernameEnd).trim() || 'N/A';
    } else {
        username = remark.trim(); // If no hyphens, assume entire string is the username
    }

    // Check for remaining usage (look for 📊)
    if (remark.includes('📊')) {
        const usageStart = remark.indexOf('-') + 1;
        const usageEnd = remark.indexOf('📊');
        remainingUsage = remark.substring(usageStart, usageEnd).trim() || 'N/A';
    }

    // Check for expiration (look for ⏳)
    if (remark.includes('⏳')) {
        const dateStart = remark.indexOf('⏳') - 1; // Get text before ⏳
        const prevHyphen = remark.lastIndexOf('-', dateStart);
        if (prevHyphen !== -1) {
            remainingDate = remark.substring(prevHyphen + 1, remark.indexOf('⏳')).trim() || 'N/A';
        }
    }

    // Display results
    document.getElementById('result').innerHTML = `
        <div class="result-item">
            <span class="result-label">Username:</span>
            <span class="result-value">${username}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Remaining Usage:</span>
            <span class="result-value">${remainingUsage}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Remaining Time:</span>
            <span class="result-value">${remainingDate}</span>
        </div>
    `;
    document.getElementById('result').style.display = 'block';
}

function resetCookies() {
    document.cookie.split(";").forEach((c) => {
        document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    location.reload();
}

window.onload = () => {
    const savedCode = getCookie('v2rayCode');
    const queryUsername = getQueryParam('un');

    if (queryUsername) {
        document.getElementById('v2rayInput').value = queryUsername;
        extractRemark();
    } else if (savedCode) {
        document.getElementById('v2rayInput').value = savedCode;
        extractRemark();
    }
}
// Show welcome message only on first visit
function checkFirstVisit() {
    if (!getCookie('welcomeShown')) {
        document.getElementById('welcomeMessage').style.display = 'flex';
        setCookie('welcomeShown', 'true', 365);
    }
}

function hideWelcome() {
    document.getElementById('welcomeMessage').style.display = 'none';
}

// Bookmark function (Desktop)
function addBookmark() {
    const title = "GhostVPN HUB";
    const url = window.location.href;
    
    if (window.sidebar && window.sidebar.addPanel) { // Firefox
        window.sidebar.addPanel(title, url, "");
    } else if (window.external && ('AddFavorite' in window.external)) { // IE
        window.external.AddFavorite(url, title);
    } else if (window.chrome && window.chrome.webstore) { // Chrome
        alert(`Press ${navigator.userAgent.includes('Mac') ? 'Cmd+D' : 'Ctrl+D'} to bookmark`);
    } else {
        alert(`Press ${navigator.userAgent.includes('Mac') ? 'Cmd+D' : 'Ctrl+D'} to bookmark this page.`);
    }
}

// PWA Install Prompt (Mobile)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installPrompt').style.display = 'block';
});

document.getElementById('installButton').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            document.getElementById('installPrompt').style.display = 'none';
        }
    }
});

// Initialize on load
window.onload = () => {
    checkFirstVisit();
    
    const savedCode = getCookie('v2rayCode');
    const queryUsername = getQueryParam('un');
    
    if (queryUsername || savedCode) {
        document.getElementById('v2rayInput').value = queryUsername || savedCode;
        extractRemark();
        
        // Auto-hide welcome if data loads
        hideWelcome();
    }
};
