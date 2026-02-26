window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) { splash.style.opacity = '0'; setTimeout(() => { splash.style.display = 'none'; }, 600); }
    }, 1000); 
});

function setElText(id, text) { const el = document.getElementById(id); if (el) el.innerText = text; }
function setElVal(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
window.onerror = function(msg) { console.error("Error: ", msg); return false; };

const supabaseClient = supabase.createClient('https://qznvabjtxcbffjryfgqi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6bnZhYmp0eGNiZmZqcnlmZ3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Nzc2NzUsImV4cCI6MjA4NzE1MzY3NX0.chreegQgxCJI4cZcvwsED8Cvh7XJ-E0P7G_wzpVMe6k');

let currentUser = null; 
let envData = { temp: 25, hum: 60, aqi: 50, pm25: 15 };

// 🌟 完整 13 項演算法參數
let algoParams = { 
    baseWear: 0.27, aqiOrange: 1.4, aqiRed: 1.8, tempHigh: 1.2, tempLow: 0.9, humHigh: 1.2, 
    carLarge: 1.3, carSmall: 0.8, basePm25: 1250, kwhPerDay: 0.25, co2Factor: 0.5, paHypass: 4, paOther: 8 
};

// 🌟 車單大擴充 (新增 MG, CMC, Peugeot, Land Rover, Mini 等)
const carData = { 
  "Toyota": ["RAV4", "Corolla Cross", "Altis", "Camry", "Yaris", "Vios", "Sienta", "Town Ace", "其他"], 
  "Lexus": ["NX", "RX", "UX", "ES", "IS", "LM", "其他"], 
  "Honda": ["CR-V", "HR-V", "Civic", "Fit", "Odyssey", "其他"],
  "Nissan": ["Kicks", "Sentra", "X-Trail", "Tiida", "Juke", "其他"], 
  "Ford": ["Focus", "Kuga", "Ranger", "Mustang", "其他"], 
  "Mazda": ["Mazda 3", "CX-5", "CX-30", "CX-60", "Mazda 6", "其他"],
  "Mitsubishi": ["Outlander", "Eclipse Cross", "Colt Plus", "Delica", "其他"], 
  "Hyundai": ["Tucson", "Custin", "Venue", "Santa Fe", "Ioniq 5", "其他"],
  "Kia": ["Sportage", "Sorento", "EV6", "Picanto", "Carnival", "其他"], 
  "Volkswagen": ["Golf", "Tiguan", "Polo", "T-Roc", "Caddy", "其他"], 
  "Skoda": ["Kodiaq", "Kamiq", "Octavia", "Superb", "Fabia", "其他"],
  "Benz": ["C-Class", "E-Class", "GLC", "GLE", "A-Class", "S-Class", "其他"],
  "BMW": ["3-Series", "5-Series", "X3", "X5", "X1", "1-Series", "其他"], 
  "Audi": ["A3", "A4", "Q3", "Q5", "Q7", "e-tron", "其他"],
  "Volvo": ["XC60", "XC40", "XC90", "V60", "其他"], 
  "Porsche": ["Macan", "Cayenne", "911", "Taycan", "Panamera", "其他"], 
  "Tesla": ["Model Y", "Model 3", "Model X", "Model S"],
  "Subaru": ["Forester", "XV", "Crosstrek", "Outback", "WRX", "其他"], 
  "Suzuki": ["Swift", "Jimny", "Vitara", "Ignis", "其他"], 
  "Luxgen": ["URX", "n7", "U6", "其他"],
  "MG": ["HS", "ZS", "MG4", "其他"],
  "CMC": ["Zinger", "Veryca (菱利)", "其他"],
  "Peugeot": ["2008", "3008", "5008", "208", "其他"],
  "Land Rover": ["Defender", "Range Rover Evoque", "Discovery", "其他"],
  "Mini": ["Countryman", "Cooper", "Clubman", "其他"],
  "Other": ["其他品牌"] 
};

const taiwanDistricts = {
  "基隆市": ["仁愛區", "信義區", "中正區", "中山區", "安樂區", "暖暖區", "七堵區"],
  "台北市": ["中正區", "大同區", "中山區", "松山區", "大安區", "萬華區", "信義區", "士林區", "北投區", "內湖區", "南港區", "文山區"],
  "新北市": ["板橋區", "三重區", "中和區", "永和區", "新莊區", "新店區", "樹林區", "鶯歌區", "三峽區", "淡水區", "汐止區", "瑞芳區", "土城區", "蘆洲區", "五股區", "泰山區", "林口區", "深坑區", "石碇區", "坪林區", "三芝區", "石門區", "八里區", "平溪區", "雙溪區", "貢寮區", "金山區", "萬里區", "烏來區"],
  "桃園市": ["桃園區", "中壢區", "大溪區", "楊梅區", "蘆竹區", "大園區", "龜山區", "八德區", "龍潭區", "平鎮區", "新屋區", "觀音區", "復興區"],
  "新竹市": ["東區", "北區", "香山區"],
  "新竹縣": ["竹北市", "竹東鎮", "新埔鎮", "關西鎮", "湖口鄉", "新豐鄉", "芎林鄉", "橫山鄉", "北埔鄉", "寶山鄉", "峨眉鄉", "尖石鄉", "五峰鄉"],
  "台中市": ["中區", "東區", "南區", "西區", "北區", "北屯區", "西屯區", "南屯區", "太平區", "大里區", "霧峰區", "烏日區", "豐原區", "后里區", "石岡區", "東勢區", "和平區", "新社區", "潭子區", "大雅區", "神岡區", "大肚區", "沙鹿區", "龍井區", "梧棲區", "清水區", "大甲區", "外埔區", "大安區"],
  "台南市": ["新營區", "鹽水區", "白河區", "柳營區", "後壁區", "東山區", "麻豆區", "下營區", "六甲區", "官田區", "大內區", "佳里區", "學甲區", "西港區", "七股區", "將軍區", "北門區", "新化區", "善化區", "新市區", "安定區", "山上區", "玉井區", "楠西區", "南化區", "左鎮區", "仁德區", "歸仁區", "關廟區", "龍崎區", "永康區", "東區", "南區", "北區", "安南區", "安平區", "中西區"],
  "高雄市": ["鹽埕區", "鼓山區", "左營區", "楠梓區", "三民區", "新興區", "前金區", "苓雅區", "前鎮區", "旗津區", "小港區", "鳳山區", "林園區", "大寮區", "大樹區", "大社區", "仁武區", "鳥松區", "岡山區", "橋頭區", "燕巢區", "田寮區", "阿蓮區", "路竹區", "湖內區", "茄萣區", "永安區", "彌陀區", "梓官區", "旗山區", "美濃區", "六龜區", "甲仙區", "杉林區", "內門區", "茂林區", "桃源區", "那瑪夏區"]
};

function formatTaipeiTime(dStr) { try { if(!dStr) return '-'; const d=new Date(dStr); return isNaN(d.getTime())?'-':d.getFullYear()+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+String(d.getDate()).padStart(2,'0'); } catch(e){return '-';} }

function setTheme(t) { 
    document.body.className = t + '-mode'; localStorage.setItem('hypass_theme', t); 
    document.getElementById('btn-theme-dark').style.borderColor = 'transparent'; document.getElementById('btn-theme-light').style.borderColor = 'transparent'; document.getElementById('btn-theme-metal').style.borderColor = 'transparent';
    if (t === 'light') { document.getElementById('btn-theme-light').style.borderColor = '#10b981'; } else if (t === 'metal') { document.getElementById('btn-theme-metal').style.borderColor = '#06b6d4'; } else { document.getElementById('btn-theme-dark').style.borderColor = '#00e676'; }
}
setTheme(localStorage.getItem('hypass_theme') || 'dark');

function updateCarModels(bId, mId) { const b = document.getElementById(bId).value; const m = document.getElementById(mId); m.innerHTML = '<option value="">* 選擇車型</option>'; if(carData[b]) carData[b].forEach(i => m.innerHTML+=`<option value="${i}">${i}</option>`); }
function updateDistricts(cityId, distId) { const c = document.getElementById(cityId).value; const d = document.getElementById(distId); d.innerHTML = '<option value="">* 鄉鎮市區</option>'; if(taiwanDistricts[c]) taiwanDistricts[c].forEach(i => d.innerHTML+=`<option value="${i}">${i}</option>`); }

function showForm(r) { document.getElementById('form-customer').style.display = r==='customer' ? 'block' : 'none'; }

function switchPage(id, el) { 
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active')); document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); 
    document.getElementById('page-'+id).classList.add('active'); if(el) el.classList.add('active'); 
    if(id==='book') loadGarages(); if(id==='settings') loadHistory('filter');
}

function switchSetTab(t) { 
    ['a','theme','b','c'].forEach(tab=>{ 
        const content = document.getElementById(`set-content-${tab}`); const btn = document.getElementById(`tab-set-${tab}`);
        if(content) content.style.display = t===tab ? 'block' : 'none'; if(btn) btn.className = `tab-btn ${t===tab ? 'active' : ''}`;
    }); 
}

function switchBookingTab(t) { 
    document.getElementById('booking-smart').style.display = t==='smart' ? 'block' : 'none'; document.getElementById('booking-manual').style.display = t==='manual' ? 'block' : 'none'; 
    document.getElementById('tab-btn-smart').className = `tab-btn ${t==='smart' ? 'active' : ''}`; document.getElementById('tab-btn-manual').className = `tab-btn ${t==='manual' ? 'active' : ''}`; 
}

// 🌟 優化註冊與獎勵金發放
async function submitRegister(role) {
    try {
        const p = await liff.getProfile(); 
        const refId = localStorage.getItem('hypass_ref_code') || null; 
        
        const n = document.getElementById('c-name').value; const ph = document.getElementById('c-phone').value; const e = document.getElementById('c-email').value; const g = document.getElementById('c-gender').value; const c = document.getElementById('c-city').value; const dist = document.getElementById('c-district').value; const addr = document.getElementById('c-address').value; const b = document.getElementById('c-brand').value; const m = document.getElementById('c-model').value; const y = document.getElementById('c-year').value; const pl = document.getElementById('c-plate').value; const mil = document.getElementById('c-mileage').value;
        
        if (!n || !ph || !b || !pl) return alert("請完整填寫必填欄位！");
        
        const payload = { line_uid: p.userId, referrer_uid: refId, role: role, name: n, phone: ph, email: e, gender: g, city: c, district: dist, address: addr, car_brand: b, car_model: m, car_year: parseInt(y) || null, license_plate: pl, yearly_mileage: parseInt(mil) || 10000 };
        
        const { error } = await supabaseClient.from('users').upsert(payload);
        if (!error) {
            // 確認推薦金寫入
            if (refId && refId !== p.userId) {
                await supabaseClient.from('rewards').insert([{ user_uid: refId, type: 'referral_register', points: 10, status: 'completed', details: `推薦註冊: ${n}` }]);
            }
            localStorage.removeItem('hypass_ref_code'); location.reload();
        } else { alert("註冊失敗: " + error.message); }
    } catch(e) { console.error(e); }
}

async function updateProfile() {
  const p = { name: document.getElementById('edit-name').value, phone: document.getElementById('edit-phone').value, email: document.getElementById('edit-email').value, gender: document.getElementById('edit-gender').value, city: document.getElementById('edit-city').value, district: document.getElementById('edit-district').value, address: document.getElementById('edit-address').value, car_brand: document.getElementById('edit-brand').value, car_model: document.getElementById('edit-model').value, car_year: parseInt(document.getElementById('edit-year').value) || null, license_plate: document.getElementById('edit-plate').value, yearly_mileage: parseInt(document.getElementById('edit-mileage').value) };
  const { error } = await supabaseClient.from('users').update(p).eq('line_uid', currentUser.line_uid); 
  if (error) alert("更新失敗"); else { alert('✅ 您的座艙資料已成功更新！'); location.reload(); }
}

let scanner = null;
function openFrontendScanner() { 
    document.getElementById('scanner-modal').style.display = 'flex'; 
    scanner = new Html5Qrcode("frontend-reader"); 
    scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 280, height: 120 } }, (text) => { scanner.stop(); document.getElementById('scanner-modal').style.display = 'none'; processUID(text.trim()); }); 
}
function closeScanner() { if(scanner) scanner.stop(); document.getElementById('scanner-modal').style.display = 'none'; }

async function processUID(uid) {
    if (!uid.match(/^HP-\d+$/)) return alert("格式錯誤，請掃描 HP- 條碼");
    const { data } = await supabaseClient.from('filters_uid').select('*').eq('uid', uid).maybeSingle();
    if (!data || (data.status !== 'sold' && data.status !== 'produced')) return alert("無效濾網 (可能已被綁定)");
    
    await supabaseClient.from('filters_uid').update({ status: 'replaced', deactivated_at: new Date() }).eq('activated_by_uid', currentUser.line_uid).eq('status', 'activated');
    await supabaseClient.from('filters_uid').update({ status: 'activated', activated_by_uid: currentUser.line_uid, activated_at: new Date() }).eq('uid', uid);
    
    if (currentUser.referrer_uid) {
        const { count } = await supabaseClient.from('filters_uid').select('*', { count: 'exact', head: true }).eq('activated_by_uid', currentUser.line_uid);
        if (count === 1) { await supabaseClient.from('rewards').insert([{ user_uid: currentUser.referrer_uid, type: 'referral_scan', points: 100, status: 'completed', details: `首掃獎勵` }]); }
    }
    alert("✅ 濾網綁定啟用成功！"); location.reload();
}

async function shareToLine() {
    if (!currentUser) return; const link = `https://liff.line.me/2009187567-58hBrZRj?ref=${currentUser.line_uid}`;
    if (liff.isApiAvailable('shareTargetPicker')) { try { await liff.shareTargetPicker([{ type: "text", text: `推薦您加入 HYPASS 智能座艙：\n${link}` }]); } catch (e) {} } else { navigator.clipboard.writeText(link); alert(`請複製並傳送給好友：\n${link}`); }
}

async function loadGarages() {
  const { data } = await supabaseClient.from('garages').select('*').eq('status', 'active'); let html = '';
  if (data && data.length > 0) {
    document.getElementById('smart-match-result').innerHTML = `<h3 style="color:var(--accent-color); margin:0 0 10px 0;">${data[0].name}</h3><p style="font-size:13px; color:var(--text-secondary);">${data[0].city}${data[0].address}</p><button class="btn-main" style="padding:12px; margin-top:10px;" onclick="bookGarage(${data[0].id})">立即預約配對廠</button>`;
    data.forEach(g => { html += `<div class="g-card" style="text-align:left;"><b style="color:var(--text-primary); font-size:16px;">${g.name}</b><br><span style="font-size:12px; color:var(--text-secondary); display:block; margin:6px 0;">${g.city}${g.address}</span><button class="btn-main" style="padding:10px; font-size:14px; margin-top:5px;" onclick="bookGarage(${g.id})">預約此廠</button></div>`; });
  } else { html = '目前無合作保修廠'; } document.getElementById('garage-list').innerHTML = html;
}

async function bookGarage(gId) { let d = prompt("輸入希望預約的日期 (ex: 2026/03/01):"); if(d) { await supabaseClient.from('bookings').insert([{user_uid: currentUser.line_uid, garage_id: gId, book_date: d}]); alert("✅ 預約已送出"); } }

async function loadHistory(type) {
  const container = document.getElementById('history-container'); container.innerHTML = '讀取中...'; let html = '';
  if (type === 'filter') { 
      const { data } = await supabaseClient.from('filters_uid').select('*').eq('activated_by_uid', currentUser.line_uid).order('activated_at', { ascending: false }); 
      if(data && data.length>0) data.forEach(d => html += `<div class="log-item"><b style="color:var(--text-primary);">📦 濾網 UID: ${d.uid}</b><br><span style="color:var(--accent-color); font-size:12px;">啟用時間: ${formatTaipeiTime(d.activated_at)}</span></div>`); 
  } else { 
      const { data } = await supabaseClient.from('bookings').select('*, garages(name)').eq('user_uid', currentUser.line_uid).order('created_at', { ascending: false }); 
      if(data && data.length>0) data.forEach(d => html += `<div class="log-item"><b style="color:var(--text-primary);">📍 廠端預約: ${d.garages?.name}</b><br><span style="font-size:12px; color:var(--text-secondary);">日期: ${d.book_date} | 狀態: ${d.status}</span></div>`); 
  }
  container.innerHTML = html || '<div class="log-item">尚無相關紀錄</div>';
}

async function loadBulletins() {
  const { data, error } = await supabaseClient.from('bulletins').select('*').eq('is_active', true).order('created_at', { ascending: false }); let html = '';
  if (!error && data && data.length > 0) {
      html += '<h4 style="color:var(--accent-color); font-size:16px; margin: 15px 0 10px 0;">📢 系統公告</h4>';
      data.forEach(b => { html += `<div class="g-card" style="padding:15px; border-left:4px solid var(--accent-color); text-align:left;"><div style="font-size:11px; color:var(--text-secondary); margin-bottom:5px;">${new Date(b.created_at).toLocaleDateString()}</div><div style="font-weight:bold; font-size:15px; color:var(--text-primary); margin-bottom:6px;">${b.title}</div><div style="font-size:13px; color:var(--text-secondary); line-height:1.5; white-space:pre-wrap;">${b.content}</div></div>`; });
  }
  document.getElementById('bulletin-board-container').innerHTML = html;
}

// 🌟 終極加權演算法 (雲端參數版)
async function calculateDashboardStats() {
  const badgeText = document.getElementById('ui-shield-text');
  const pulseDot = document.getElementById('ui-pulse-dot');
  const healthEl = document.getElementById('ui-health');

  const { data: filter } = await supabaseClient.from('filters_uid').select('activated_at').eq('activated_by_uid', currentUser.line_uid).eq('status', 'activated').order('activated_at', { ascending: false }).limit(1).maybeSingle();
  
  if (filter && filter.activated_at) {
    setElText('ui-filter-date', formatTaipeiTime(filter.activated_at));
    
    const today = new Date(); const actDate = new Date(filter.activated_at);
    const utc1 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const utc2 = Date.UTC(actDate.getFullYear(), actDate.getMonth(), actDate.getDate());
    const days = Math.max(0, Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24)));
    
    let aqi = envData.aqi || 50; 
    let aRate = aqi > 150 ? algoParams.aqiRed : (aqi > 100 ? algoParams.aqiOrange : 1.0);
    
    let cRate = 1.0;
    const l=['Model X','Model Y','RAV4','CR-V','X-Trail','Kuga','CX-5','Tucson','Sportage','NX','RX','GLC','X3','X5','XC60','Defender','Cayenne','Macan']; 
    const s=['Yaris','Fit','Swift','Colt Plus','Venue','Kamiq','UX','Picanto','Ignis']; 
    if(l.includes(currentUser.car_model)) cRate = algoParams.carLarge; 
    if(s.includes(currentUser.car_model)) cRate = algoParams.carSmall;
    
    let mileageRate = currentUser.yearly_mileage ? ((currentUser.yearly_mileage / 10000) * 0.5 + 0.5) : 1.0;
    let tempRate = envData.temp > 30 ? algoParams.tempHigh : (envData.temp < 15 ? algoParams.tempLow : 1.0);
    let humRate = envData.hum > 80 ? algoParams.humHigh : 1.0;

    let totalMultiplier = mileageRate * aRate * cRate * tempRate * humRate;
    let health = Math.max(0, Math.round(100 - (days * algoParams.baseWear * totalMultiplier)));
    
    if(healthEl) healthEl.innerText = `${health}%`;
    
    if (health >= 60) {
        if(badgeText) badgeText.innerText = '極效防護中'; if(healthEl) healthEl.style.color = 'var(--accent-color)'; if(pulseDot) pulseDot.
