/* ==================== MB LEGACY STORE - FUNGSI DIKONGSI ==================== */
/* Diguna oleh: index.html, buyer.html, seller.html */

// ---------- PI SDK ----------
let currentUser = null;
let isPaymentPending = false;

function initPi() {
    if (typeof Pi === 'undefined') {
        updateStatus('❌ Pi SDK not loaded. Please use Pi Browser.');
        return;
    }
    Pi.init({ version: "2.0", sandbox: true });
    updateStatus('✅ Vault Secured. System Ready.');
    enableButton('btn-login');
}

function authenticatePi(callback) {
    updateStatus('🔄 Connecting...');
    disableButton('btn-login');
    
    Pi.authenticate(['username', 'payments'], onIncompletePaymentFound)
        .then(function(auth) {
            currentUser = auth.user;
            if (!isPaymentPending) {
                updateStatus('👤 User: ' + auth.user.username);
            }
            enableButton('btn-login');
            enableButton('btn-pay1');
            enableButton('btn-pay10');
            enableButton('btn-cancel');
            if (callback) callback(auth);
        })
        .catch(function() {
            updateStatus('❌ Connection Failed.');
            enableButton('btn-login');
        });
}

function onIncompletePaymentFound(payment) {
    isPaymentPending = true;
    updateStatus('⚠️ Pending Payment: ' + payment.identifier);
}

function createPayment(amount, memo, btnId, onSuccess) {
    updateStatus('💰 Processing ' + amount + ' Pi...');
    disableButton(btnId);
    
    Pi.createPayment({ 
        amount: amount, 
        memo: memo, 
        metadata: { id: Date.now().toString() } 
    }, {
        onReadyForServerApproval: function(paymentId) {
            updateStatus('⏳ Approving...');
            fetch('/api/finalize', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: paymentId })
            });
        },
        onReadyForServerCompletion: function(paymentId, txid) {
            isPaymentPending = false;
            updateStatus('✅ Payment ' + amount + ' Pi Successful!');
            enableButton(btnId);
            if (onSuccess) onSuccess({ paymentId: paymentId, txid: txid });
        },
        onCancel: function() {
            updateStatus('❌ Cancelled.');
            enableButton(btnId);
        },
        onError: function() {
            updateStatus('❌ Error.');
            enableButton(btnId);
        },
        onIncompletePaymentFound: onIncompletePaymentFound
    });
}

function cancelPayment(paymentId) {
    updateStatus('🗑️ Cancelling...');
    fetch('/api/finalize', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: paymentId })
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            updateStatus('✅ Cancelled!');
            alert('✅ Success!');
        } else {
            updateStatus('❌ Failed.');
            alert('❌ Failed: ' + JSON.stringify(d));
        }
        enableButton('btn-cancel');
    })
    .catch(function() {
        updateStatus('❌ Error.');
        enableButton('btn-cancel');
    });
}

// ---------- STATUS BAR ----------
function updateStatus(msg) {
    const el = document.getElementById('stSticky');
    const container = document.getElementById('stickyStatus');
    if (el) el.innerText = msg;
    if (container) container.style.display = 'block';
}

// ---------- BUTTON HELPERS ----------
function enableButton(id) {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = false;
}

function disableButton(id) {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = true;
}

// ---------- BAHASA ----------
function switchLanguageGlobal(lang) {
    setLanguage(lang);
    applyTranslations();
}

function applyTranslations() {
    const langData = translations[getCurrentLang()] || translations.en;
    
    // Fungsi selamat untuk set teks
    function setText(id, key) {
        const el = document.getElementById(id);
        if (el && langData[key]) el.innerText = langData[key];
    }
    function setClassText(selector, key) {
        const el = document.querySelector(selector);
        if (el && langData[key]) el.innerText = langData[key];
    }
    
    // Terapkan ke elemen yang wujud
    setClassText('.treasury-section h2', 'vault');
    setText('btn-login', 'connectBtn');
    setText('btn-pay1', 'pay1Btn');
    setText('btn-pay10', 'pay10Btn');
    setText('btn-cancel', 'cancelBtn');
    setText('btn-seller-login', 'sellerBtn');
    setText('btn-buyer-dashboard', 'buyerBtn');
    setText('tab-digital', 'digitalTab');
    setText('tab-merchant', 'merchantTab');
    setClassText('.footer-frame p', 'security');
    setClassText('footer', 'footer');
    setClassText('.free-banner', 'freeBanner');
    setText('back-btn', 'backBtn');
    setClassText('.dashboard-title', 'dashboardTitle');
    setClassText('.my-purchases-title', 'myPurchases');
    setClassText('.empty-state p', 'noPurchases');
    setClassText('.browse-store-link', 'browseStore');
}

// ---------- STORAGE ----------
function saveToStorage(key, value) {
    try {
        localStorage.setItem('mbl_' + key, JSON.stringify(value));
    } catch(e) {}
}

function getFromStorage(key) {
    try {
        const data = localStorage.getItem('mbl_' + key);
        return data ? JSON.parse(data) : null;
    } catch(e) {
        return null;
    }
}

// ---------- NAVIGASI ----------
function navigateTo(page) {
    window.location.href = page + '?lang=' + getCurrentLang();
}

// ---------- INIT SEMASA PAGE LOAD ----------
document.addEventListener('DOMContentLoaded', function() {
    // Kekalkan bahasa dari URL atau localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && translations[urlLang]) {
        setLanguage(urlLang);
    }
    applyTranslations();
});
