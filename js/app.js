/* Wazi MVP — app logic */
(function(){
  'use strict';
  var LANG = localStorage.getItem('wazi_lang') || 'en';
  var I18N = window.WAZI_I18N;
  var notifs = [];

  function t(k){ return (I18N[LANG] && I18N[LANG][k]) || (I18N.en[k]) || k; }

  function applyI18n(){
    document.documentElement.lang = LANG;
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    document.getElementById('langBtn').textContent = (LANG === 'en') ? 'SW' : 'EN';
  }

  function toast(msg){
    var el = document.getElementById('toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(el._t); el._t = setTimeout(function(){ el.hidden = true; }, 2600);
  }

  var WEIGHTS = { owner:25, titleDeed:25, disputes:20, survey:15, landUse:15 };
  var HARDSTOP = ['owner','titleDeed','disputes'];

  function pts(status, w){
    if(status === 'Verified') return w;
    if(status === 'Needs review') return w/2;
    return 0; // Flagged
  }

  // FR-C1..C3: score, verdict bands and hard-stop rule
  function assess(p){
    var score = 0;
    Object.keys(WEIGHTS).forEach(function(k){ score += pts(p.checks[k].s, WEIGHTS[k]); });
    score = Math.round(score);
    var verdict;
    if(score >= 85) verdict = 'ok';
    else if(score >= 60) verdict = 'caution';
    else verdict = 'risk';
    // Hard stop: a flagged owner / deed / dispute can never be better than caution
    var hardFlag = HARDSTOP.some(function(k){ return p.checks[k].s === 'Flagged'; });
    if(hardFlag && verdict === 'ok') verdict = 'caution';
    return { score: score, verdict: verdict, hardFlag: hardFlag };
  }

  function money(n){ return 'TZS ' + n.toLocaleString('en-US'); }

  // FR-P1..P2: price band
  function priceBand(pr){
    if(pr.perSqm < pr.low) return 'below';
    if(pr.perSqm > pr.high) return 'above';
    return 'within';
  }

  function refNo(prefix){
    var d = new Date();
    var y = d.getFullYear().toString().slice(2);
    var r = Math.floor(1000 + Math.random()*9000);
    return (prefix||'WZ') + '-' + y + '-' + r;
  }

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function addNotif(title, body){
    notifs.unshift({ title: title, body: body, time: new Date() });
    if(notifs.length > 20) notifs.length = 20;
    var c = document.getElementById('bellCount');
    c.textContent = notifs.length;
    c.style.display = notifs.length ? '' : 'none';
    renderNotifs();
  }

  function renderNotifs(){
    var list = document.getElementById('notifList');
    if(!notifs.length){ list.innerHTML = '<li class="notif-empty">—</li>'; return; }
    list.innerHTML = notifs.map(function(n){
      return '<li><strong>'+esc(n.title)+'</strong>'+esc(n.body)+
        '<small>'+n.time.toLocaleTimeString()+'</small></li>';
    }).join('');
  }

  var CHECK_ORDER = ['owner','titleDeed','survey','disputes','landUse'];
  function statusClass(s){ return s==='Verified'?'s-verified':(s==='Needs review'?'s-review':'s-flagged'); }
  function statusIcon(s){ return s==='Verified'?'✓':(s==='Needs review'?'!':'✕'); }

  // expose to the second half
  window.__WAZI = { t:t, applyI18n:applyI18n, toast:toast, assess:assess, money:money,
    priceBand:priceBand, refNo:refNo, esc:esc, addNotif:addNotif, renderNotifs:renderNotifs,
    CHECK_ORDER:CHECK_ORDER, statusClass:statusClass, statusIcon:statusIcon,
    getLang:function(){return LANG;}, setLang:function(l){LANG=l;localStorage.setItem('wazi_lang',l);} };

  var result = document.getElementById('result');

  function mapSvg(p){
    var m = p.map;
    return '<div class="map-wrap"><svg viewBox="0 0 380 220" role="img" aria-label="plot map">'+
      '<rect width="380" height="220" fill="#e7f0ee"/>'+
      '<path d="M0 150 Q 90 130 190 150 T 380 145" stroke="#bcd3cf" stroke-width="10" fill="none"/>'+
      '<path d="M0 60 Q 120 80 230 55 T 380 70" stroke="#d5e4e0" stroke-width="8" fill="none"/>'+
      '<polygon points="'+m.poly+'" fill="rgba(16,54,87,.18)" stroke="#103657" stroke-width="2.5"/>'+
      '<circle cx="'+m.pin.split(',')[0]+'" cy="'+m.pin.split(',')[1]+'" r="7" fill="#d6453d" stroke="#fff" stroke-width="2"/>'+
      '<text x="12" y="210" font-size="11" fill="#5b6b78">GPS '+esc(m.gps)+'</text>'+
      '</svg></div><div class="map-cap">'+esc(p.plot+', '+p.area+', '+p.region)+'</div>';
  }

  function renderReport(p){
    var a = assess(p);
    var ref = refNo('WZ');
    var vClass = a.verdict==='ok'?'v-ok':(a.verdict==='caution'?'v-caution':'v-risk');
    var vText = a.verdict==='ok'?t('vOk'):(a.verdict==='caution'?t('vCaution'):t('vRisk'));
    var pr = p.price, band = priceBand(pr);
    var bandText = t(band), bandCls = 'pb-'+band;
    var checks = CHECK_ORDER.map(function(k){
      var c = p.checks[k];
      return '<li class="'+statusClass(c.s)+'">'+
        '<span class="ck-ico">'+statusIcon(c.s)+'</span>'+
        '<span class="ck-body"><span class="ck-name">'+t(k)+'</span>'+
        '<span class="ck-meta">'+t('source')+': '+esc(c.src)+' · '+t('updated')+' '+esc(c.date)+'</span></span>'+
        '<span class="ck-status">'+t(c.s)+'</span></li>';
    }).join('');

    var flags = p.flags.length ? '<div class="block"><div class="section-title">'+t('flagsTitle')+
      '</div><ul class="flags">'+ p.flags.map(function(f){
        return '<li><span class="fdot">●</span><span>'+esc(f)+'</span></li>'; }).join('') +'</ul></div>' : '';

    var nextStep = a.verdict==='ok'
      ? (LANG==='sw'?'Thibitisha uhamisho wa mwisho na wakili, kisha lipa kupitia njia inayofuatiliwa.':'Confirm the final transfer with a lawyer, then pay through a traceable channel.')
      : (LANG==='sw'?'Tatua mambo yaliyoainishwa hapo juu kabla ya kulipa amana yoyote.':'Resolve the flagged items above before you pay any deposit.');

    result.innerHTML =
      '<div class="card" id="reportCard">'+
        '<div class="print-head"><strong>WAZI</strong> — '+t('verifiedSeal')+' · '+ref+'</div>'+
        '<div class="card-head"><div><h2>'+esc(p.plot)+'</h2>'+
          '<div class="loc">'+esc(p.area+', '+p.district+', '+p.region)+' · '+p.size+' m² · '+esc(p.landUse)+'</div>'+
          '<div class="ref">'+t('verifiedSeal')+' № '+ref+' · '+t('seller')+': ★ '+pr_trust(p)+'</div></div></div>'+
        '<div class="verdict '+vClass+'"><div class="score-ring" style="--p:'+a.score+'"><span>'+a.score+'</span></div>'+
          '<div class="verdict-text"><strong>'+vText+'</strong><small>'+a.score+'/100</small></div></div>'+
        '<div class="section-title">'+t('checksTitle')+'</div><ul class="checks">'+checks+'</ul>'+
        '<div class="block"><div class="section-title">'+t('priceTitle')+'</div>'+
          '<div class="price"><span class="price-badge '+bandCls+'">'+bandText+'</span>'+
          '<span class="fig">'+t('askingPrice')+': '+money(pr.asking)+' · '+pr.perSqm.toLocaleString()+' '+t('perSqm')+
          ' · '+t('marketRange')+': '+pr.low.toLocaleString()+'–'+pr.high.toLocaleString()+'</span></div></div>'+
        flags +
        '<div class="block"><div class="section-title">'+t('mapTitle')+'</div>'+mapSvg(p)+'</div>'+
        '<div class="block"><div class="section-title">'+t('nextTitle')+'</div>'+
          '<div class="nextstep">'+esc(nextStep)+'</div></div>'+
        '<div class="report-foot">'+
          '<button class="btn btn-wa" id="waBtn">'+t('shareWa')+'</button>'+
          '<button class="btn btn-pdf" id="pdfBtn">'+t('downloadPdf')+'</button>'+
          '<button class="btn btn-out" id="newBtn">'+t('newSearch')+'</button>'+
        '</div>'+
        '<div class="feedback"><span>'+t('helpfulQ')+'</span>'+
          '<button data-fb="yes">👍 '+t('yes')+'</button><button data-fb="no">👎 '+t('no')+'</button></div>'+
        '<div class="disclaimer">'+t('disclaimer')+'</div>'+
      '</div>';

    wireReport(p, ref, a, vText);
    addNotif(t('verifiedSeal')+': '+ref, ' — '+p.plot+', '+p.area);
    result.scrollIntoView({behavior:'smooth', block:'start'});
  }

  function pr_trust(p){ return p.seller.trust.toFixed(1)+' ('+esc(p.seller.name)+')'; }

  function shareText(p, ref, a, vText){
    return 'WAZI '+t('verifiedSeal')+' '+ref+'%0A'+p.plot+', '+p.area+', '+p.region+'%0A'+
      vText+' ('+a.score+'/100)%0A'+t('askingPrice')+': '+money(p.price.asking)+'%0A'+
      'https://21tnyemo.github.io/WAZI/';
  }

  function wireReport(p, ref, a, vText){
    document.getElementById('waBtn').onclick = function(){
      window.open('https://wa.me/?text='+shareText(p,ref,a,vText), '_blank');
    };
    document.getElementById('pdfBtn').onclick = function(){ window.print(); };
    document.getElementById('newBtn').onclick = function(){
      result.innerHTML=''; document.getElementById('searchInput').value='';
      document.getElementById('searchInput').focus();
      window.scrollTo({top:0,behavior:'smooth'});
    };
    result.querySelectorAll('[data-fb]').forEach(function(b){
      b.onclick = function(){ toast(t('thanks')); };
    });
  }

  function renderNoRecord(q){
    result.innerHTML =
      '<div class="card norecord"><h2>'+t('noRecordTitle')+'</h2>'+
      '<p>'+t('noRecordBody')+'</p>'+
      '<div class="reqbox"><strong>'+t('requestVerify')+'</strong>'+
        '<input id="reqPlot" value="'+esc(q)+'" placeholder="Plot / listing"/>'+
        '<input id="reqWa" placeholder="'+t('yourWhats')+'"/>'+
        '<button class="btn btn-pdf" id="reqBtn" style="width:100%">'+t('submitReq')+'</button>'+
      '</div></div>';
    document.getElementById('reqBtn').onclick = function(){
      var ref = refNo('REQ');
      addNotif(t('requestVerify')+': '+ref, ' — '+t('reqFollow'));
      result.innerHTML = '<div class="card norecord"><h2>'+t('reqSent')+' '+ref+'</h2><p>'+t('reqFollow')+'</p></div>';
      toast(t('reqSent')+' '+ref);
    };
    result.scrollIntoView({behavior:'smooth', block:'start'});
  }

  function doSearch(q){
    var p = window.WAZI_FIND(q);
    if(p) renderReport(p); else renderNoRecord(q);
  }

  // Guided demo: play 3 sample reports in sequence (FR / Part A "guided demo button")
  var guidedTimer = null;
  function runGuided(){
    if(guidedTimer){ return; }
    toast(t('guidedRun'));
    var ids = window.WAZI_GUIDED.slice();
    var i = 0;
    function step(){
      var p = window.WAZI_DATA.find(function(x){ return x.id === ids[i]; });
      if(p){ document.getElementById('searchInput').value = p.plot; renderReport(p); }
      i++;
      if(i < ids.length){ guidedTimer = setTimeout(step, 6000); }
      else { guidedTimer = null; }
    }
    step();
  }

  // ---- wiring ----
  document.getElementById('searchForm').addEventListener('submit', function(e){
    e.preventDefault();
    doSearch(document.getElementById('searchInput').value);
  });
  document.querySelectorAll('.chip').forEach(function(ch){
    ch.addEventListener('click', function(e){
      e.preventDefault();
      var q = ch.getAttribute('data-q');
      document.getElementById('searchInput').value = q;
      doSearch(q);
    });
  });
  document.getElementById('guidedBtn').addEventListener('click', runGuided);

  document.getElementById('langBtn').addEventListener('click', function(e){
    e.stopPropagation();
    setLang(getLang()==='en' ? 'sw' : 'en');
    applyI18n();
    // re-render current report if one is shown (keeps any open dropdown open)
    var q = document.getElementById('searchInput').value;
    if(q && result.querySelector('#reportCard')) doSearch(q);
  });

  var panel = document.getElementById('notifPanel');
  var bellBtn = document.getElementById('bellBtn');
  function openPanel(){ panel.hidden = false; }
  function closePanel(){ panel.hidden = true; }
  bellBtn.addEventListener('click', function(e){
    e.stopPropagation();
    if(panel.hidden) openPanel(); else closePanel();
  });
  document.getElementById('notifClose').addEventListener('click', closePanel);
  // close the dropdown when clicking anywhere outside it
  document.addEventListener('click', function(e){
    if(!panel.hidden && !panel.contains(e.target) && !bellBtn.contains(e.target)) closePanel();
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closePanel(); });

  applyI18n();
  renderNotifs();
  (function(){ var c=document.getElementById('bellCount'); c.style.display = notifs.length ? '' : 'none'; })();

  // ---- PWA: install prompt + service worker ----
  var deferredPrompt = null;
  var installBtn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault(); deferredPrompt = e; installBtn.classList.remove('hidden');
  });
  installBtn.addEventListener('click', function(){
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(function(){ deferredPrompt = null; installBtn.classList.add('hidden'); });
  });
  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('sw.js').catch(function(){ /* offline cache optional */ });
    });
  }
})();
