/* Wazi — application logic (MVP) */
(function(){
  'use strict';

  var I18N = window.WAZI_I18N;
  var DATA = window.WAZI_DATA || [];
  var DATA_SW = window.WAZI_DATA_SW || {};
  var LANG = localStorage.getItem('wazi_lang') || 'en';

  var state = {
    query: '',
    filter: 'all',
    sort: 'risk',
    notifs: [],
    lastSearch: '',
    guidedTimer: null
  };

  /* ---------- helpers ---------- */
  function t(k){
    return (I18N[LANG] && I18N[LANG][k]) || (I18N.en[k]) || k;
  }
  function td(s){
    if(LANG !== 'sw' || s == null) return s;
    return DATA_SW[s] || s;
  }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function $(id){ return document.getElementById(id); }
  function money(n){
    return 'TZS ' + Number(n).toLocaleString('en-US');
  }
  function refNo(prefix){
    var d = new Date();
    var y = d.getFullYear().toString().slice(2);
    var r = Math.floor(1000 + Math.random()*9000);
    return (prefix||'WZ') + '-' + y + '-' + r;
  }

  /* ---------- scoring model ---------- */
  var WEIGHTS = { owner:25, titleDeed:25, disputes:20, survey:15, landUse:15 };
  var HARDSTOP = ['owner','titleDeed','disputes'];
  var CHECK_ORDER = ['owner','titleDeed','survey','disputes','landUse'];

  function pts(status, w){
    if(status === 'Verified') return w;
    if(status === 'Needs review') return w/2;
    return 0;
  }
  function assess(p){
    var score = 0;
    Object.keys(WEIGHTS).forEach(function(k){ score += pts(p.checks[k].s, WEIGHTS[k]); });
    score = Math.round(score);
    var verdict = score >= 85 ? 'ok' : (score >= 60 ? 'caution' : 'risk');
    var hardFlag = HARDSTOP.some(function(k){ return p.checks[k].s === 'Flagged'; });
    if(hardFlag && verdict === 'ok') verdict = 'caution';
    return { score: score, verdict: verdict, hardFlag: hardFlag };
  }
  function verdictKey(p){
    var v = assess(p).verdict;
    return v === 'ok' ? 'verified' : (v === 'caution' ? 'review' : 'risk');
  }
  function priceBand(pr){
    if(pr.perSqm < pr.low) return 'below';
    if(pr.perSqm > pr.high) return 'above';
    return 'within';
  }
  function statusClass(s){
    return s === 'Verified' ? 's-verified' : (s === 'Needs review' ? 's-review' : 's-flagged');
  }
  function statusIcon(s){
    return s === 'Verified' ? '\u2713' : (s === 'Needs review' ? '!' : '\u2715');
  }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg){
    var el = $('toast');
    el.textContent = msg;
    el.hidden = false;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ el.classList.remove('show'); el.hidden = true; }, 2600);
  }

  /* ---------- notifications ---------- */
  function addNotif(title, body){
    state.notifs.unshift({ title: title, body: body, time: new Date() });
    if(state.notifs.length > 30) state.notifs.length = 30;
    renderNotifs();
    var c = $('bellCount');
    c.textContent = state.notifs.length;
    c.style.display = state.notifs.length ? '' : 'none';
    $('bellBtn').classList.add('ping');
    setTimeout(function(){ $('bellBtn').classList.remove('ping'); }, 700);
  }
  function renderNotifs(){
    var list = $('notifList');
    if(!state.notifs.length){
      list.innerHTML = '<li class="notif-empty">' + esc(t('notifEmpty')) + '</li>';
      return;
    }
    list.innerHTML = state.notifs.map(function(n){
      var d = n.time;
      var hh = ('0'+d.getHours()).slice(-2) + ':' + ('0'+d.getMinutes()).slice(-2);
      return '<li><div class="n-title">' + esc(n.title) + '</div>' +
             '<div class="n-body">' + esc(n.body) + '</div>' +
             '<small>' + hh + '</small></li>';
    }).join('');
  }

  /* ---------- i18n application ---------- */
  function applyI18n(){
    document.documentElement.lang = LANG;
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    document.querySelectorAll('.lang-opt').forEach(function(b){
      var on = b.getAttribute('data-lang') === LANG;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    renderNotifs();
    renderFilters();
    renderBrowse();
    if(state.lastSearch){
      var p = window.WAZI_FIND(state.lastSearch);
      if(p) renderReport(p, true);
    }
  }

  /* ---------- report rendering ---------- */
  function mapSvg(p){
    var m = p.map;
    var xy = m.pin.split(',');
    return '<div class="map-wrap"><svg viewBox="0 0 380 220" role="img" aria-label="plot map">' +
      '<rect width="380" height="220" fill="#e8f1ef"/>' +
      '<path d="M0 150 Q 90 130 190 150 T 380 145" stroke="#c2d8d4" stroke-width="10" fill="none"/>' +
      '<path d="M0 60 Q 120 80 230 55 T 380 70" stroke="#d8e6e2" stroke-width="8" fill="none"/>' +
      '<polygon points="' + m.poly + '" fill="rgba(16,54,87,.16)" stroke="#103657" stroke-width="2.5"/>' +
      '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="7" fill="#d6453d" stroke="#fff" stroke-width="2"/>' +
      '<text x="12" y="210" font-size="11" fill="#5b6b78">GPS ' + esc(m.gps) + '</text>' +
      '</svg></div><div class="map-cap">' + esc(p.plot + ', ' + p.area + ', ' + p.region) + '</div>';
  }

  function renderReport(p, silent){
    var a = assess(p);
    var ref = refNo('WZ');
    var vClass = a.verdict === 'ok' ? 'v-ok' : (a.verdict === 'caution' ? 'v-caution' : 'v-risk');
    var vText = a.verdict === 'ok' ? t('vOk') : (a.verdict === 'caution' ? t('vCaution') : t('vRisk'));
    var pr = p.price;
    var band = priceBand(pr);

    var checks = CHECK_ORDER.map(function(k){
      var c = p.checks[k];
      var w = WEIGHTS[k];
      var got = pts(c.s, w);
      var pct = Math.round(got / w * 100);
      return '<li class="' + statusClass(c.s) + '">' +
        '<span class="ck-ico">' + statusIcon(c.s) + '</span>' +
        '<span class="ck-body">' +
          '<span class="ck-name">' + esc(t(k)) + '<span class="ck-weight">' + w + '%</span></span>' +
          '<span class="ck-meta">' + esc(t('source')) + ': ' + esc(td(c.src)) + ' · ' + esc(t('updated')) + ' ' + esc(c.date) + '</span>' +
          '<span class="ck-bar"><i style="width:' + pct + '%"></i></span>' +
        '</span>' +
        '<span class="ck-status">' + esc(t(c.s)) + '</span></li>';
    }).join('');

    var flags = p.flags.length ? '<div class="block"><div class="section-title">' + esc(t('flagsTitle')) +
      '</div><ul class="flags">' + p.flags.map(function(f){
        return '<li><span class="fdot">!</span><span>' + esc(td(f)) + '</span></li>';
      }).join('') + '</ul></div>' : '';

    var docs = (p.docs || []).length ? '<div class="block"><div class="section-title">' + esc(t('docsTitle')) +
      '</div><ul class="docs">' + p.docs.map(function(d){
        return '<li><span class="dchk">\u2713</span>' + esc(td(d)) + '</li>';
      }).join('') + '</ul></div>' : '';

    var f = p.facts || {};
    var facts = '<div class="block"><div class="section-title">' + esc(t('factsTitle')) + '</div>' +
      '<div class="facts-grid">' +
        '<div><span>' + esc(t('tenure')) + '</span><strong>' + esc(td(f.tenure)) + '</strong></div>' +
        '<div><span>' + esc(t('registered')) + '</span><strong>' + esc(f.registered) + '</strong></div>' +
        '<div><span>' + esc(t('ward')) + '</span><strong>' + esc(f.ward) + '</strong></div>' +
        '<div><span>' + esc(t('plotNo')) + '</span><strong>' + esc(f.plotNo) + '</strong></div>' +
        '<div><span>' + esc(t('size')) + '</span><strong>' + p.size + ' m²</strong></div>' +
        '<div><span>' + esc(t('seller')) + '</span><strong>\u2605 ' + p.seller.trust.toFixed(1) + ' · ' + esc(p.seller.name) + '</strong></div>' +
      '</div></div>';

    var nextStep = a.verdict === 'ok' ? t('nextOk') : t('nextAction');

    var html =
      '<article class="card" id="reportCard">' +
        '<div class="print-head"><strong>WAZI</strong> — ' + esc(t('verifiedSeal')) + ' · ' + ref + '</div>' +
        '<div class="card-head">' +
          '<div class="ch-main">' +
            '<h2>' + esc(p.plot) + '</h2>' +
            '<div class="loc">' + esc(p.area + ', ' + p.district + ', ' + p.region) + ' · ' + p.size + ' m² · ' + esc(td(p.landUse)) + '</div>' +
            '<div class="ref">' + esc(t('verifiedSeal')) + ' \u2116 ' + ref + '</div>' +
          '</div>' +
          '<div class="verdict ' + vClass + '">' +
            '<div class="score-ring" style="--p:' + a.score + '"><span>' + a.score + '</span></div>' +
            '<div class="verdict-text"><strong>' + esc(vText) + '</strong><small>' + a.score + '/100</small></div>' +
          '</div>' +
        '</div>' +
        '<div class="section-title">' + esc(t('checksTitle')) + '</div>' +
        '<ul class="checks">' + checks + '</ul>' +
        '<div class="block"><div class="section-title">' + esc(t('priceTitle')) + '</div>' +
          '<div class="price">' +
            '<span class="price-badge pb-' + band + '">' + esc(t(band)) + '</span>' +
            '<span class="fig"><b>' + money(pr.asking) + '</b> · ' + pr.perSqm.toLocaleString() + ' ' + esc(t('perSqm')) +
            ' · ' + esc(t('marketRange')) + ': ' + pr.low.toLocaleString() + '–' + pr.high.toLocaleString() + '</span>' +
          '</div>' +
        '</div>' +
        flags + docs + facts +
        '<div class="block"><div class="section-title">' + esc(t('mapTitle')) + '</div>' + mapSvg(p) + '</div>' +
        '<div class="block"><div class="section-title">' + esc(t('nextTitle')) + '</div>' +
          '<div class="nextstep">' + esc(nextStep) + '</div></div>' +
        '<div class="report-foot">' +
          '<button class="btn btn-wa" id="waBtn">' + esc(t('shareWa')) + '</button>' +
          '<button class="btn btn-pdf" id="pdfBtn">' + esc(t('downloadPdf')) + '</button>' +
          '<button class="btn btn-out" id="copyBtn">' + esc(t('copySummary')) + '</button>' +
          '<button class="btn btn-out" id="newBtn">' + esc(t('newSearch')) + '</button>' +
        '</div>' +
        '<div class="feedback"><span>' + esc(t('helpfulQ')) + '</span>' +
          '<button data-fb="yes">\ud83d\udc4d ' + esc(t('yes')) + '</button>' +
          '<button data-fb="no">\ud83d\udc4e ' + esc(t('no')) + '</button></div>' +
        '<div class="disclaimer">' + esc(t('disclaimer')) + '</div>' +
      '</article>';

    $('result').innerHTML = html;
    wireReport(p, ref, a, vText);
    if(!silent){
      addNotif(t('notifNew') + ': ' + ref, p.plot + ', ' + p.area);
      document.querySelector('.result').scrollIntoView({behavior:'smooth', block:'start'});
    }
  }

  function shareText(p, ref, a, vText){
    return 'WAZI ' + t('verifiedSeal') + ' ' + ref + '\n' +
      p.plot + ', ' + p.area + ', ' + p.region + '\n' +
      vText + ' (' + a.score + '/100)\n' +
      t('askingPrice') + ': ' + money(p.price.asking) + '\n' +
      'https://21tnyemo.github.io/WAZI/';
  }

  function wireReport(p, ref, a, vText){
    var txt = shareText(p, ref, a, vText);
    $('waBtn').addEventListener('click', function(){
      window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank', 'noopener');
    });
    $('pdfBtn').addEventListener('click', function(){ window.print(); });
    $('copyBtn').addEventListener('click', function(){
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(txt).then(function(){ toast(t('copied')); })
          .catch(function(){ legacyCopy(txt); });
      } else { legacyCopy(txt); }
    });
    $('newBtn').addEventListener('click', function(){
      $('result').innerHTML = '';
      $('searchInput').value = '';
      state.lastSearch = '';
      $('searchInput').focus();
      window.scrollTo({top:0, behavior:'smooth'});
    });
    document.querySelectorAll('#reportCard [data-fb]').forEach(function(b){
      b.addEventListener('click', function(){
        document.querySelectorAll('#reportCard [data-fb]').forEach(function(x){ x.classList.remove('picked'); });
        b.classList.add('picked');
        toast(t('thanks'));
        addNotif(t('thanks'), p.plot);
      });
    });
  }

  function legacyCopy(txt){
    var ta = document.createElement('textarea');
    ta.value = txt;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand('copy'); toast(t('copied')); }catch(e){ toast(t('copied')); }
    document.body.removeChild(ta);
  }

  /* ---------- no record + request ---------- */
  function renderNoRecord(q){
    $('result').innerHTML =
      '<article class="card norecord">' +
        '<div class="nr-ico">?</div>' +
        '<h2>' + esc(t('noRecordTitle')) + '</h2>' +
        '<p>' + esc(t('noRecordBody')) + '</p>' +
        '<div class="reqbox">' +
          '<strong>' + esc(t('requestVerify')) + '</strong>' +
          '<input id="reqPlot" value="' + esc(q) + '" placeholder="Plot / listing" />' +
          '<input id="reqName" placeholder="' + esc(t('yourName')) + '" />' +
          '<input id="reqWa" type="tel" inputmode="tel" placeholder="' + esc(t('yourWhats')) + '" />' +
          '<button class="btn btn-pdf" id="reqBtn" type="button">' + esc(t('submitReq')) + '</button>' +
        '</div>' +
      '</article>';

    $('reqBtn').addEventListener('click', function(){
      var wa = ($('reqWa').value || '').replace(/[^0-9]/g, '');
      if(wa.length < 9){
        toast(t('reqInvalid'));
        $('reqWa').focus();
        return;
      }
      var ref = refNo('REQ');
      addNotif(t('requestVerify') + ': ' + ref, t('reqFollow'));
      $('result').innerHTML =
        '<article class="card norecord">' +
          '<div class="nr-ico ok">\u2713</div>' +
          '<h2>' + esc(t('reqSent')) + ' ' + ref + '</h2>' +
          '<p>' + esc(t('reqFollow')) + '</p>' +
          '<button class="btn btn-out" id="backBtn" type="button">' + esc(t('newSearch')) + '</button>' +
        '</article>';
      $('backBtn').addEventListener('click', function(){
        $('result').innerHTML = '';
        $('searchInput').value = '';
        state.lastSearch = '';
      });
      toast(t('reqSent') + ' ' + ref);
    });

    document.querySelector('.result').scrollIntoView({behavior:'smooth', block:'start'});
  }

  function doSearch(q, silent){
    q = (q || '').trim();
    if(!q) return;
    var p = window.WAZI_FIND(q);
    if(p){
      state.lastSearch = q;
      renderReport(p, silent);
    } else {
      state.lastSearch = '';
      renderNoRecord(q);
    }
  }

  /* ---------- browse grid ---------- */
  function renderFilters(){
    var defs = [
      ['all', t('all')],
      ['verified', t('verifiedOnly')],
      ['review', t('needsReview')],
      ['risk', t('highRisk')]
    ];
    $('filterRow').innerHTML = defs.map(function(d){
      var n = d[0] === 'all' ? DATA.length : DATA.filter(function(p){ return verdictKey(p) === d[0]; }).length;
      return '<button class="fchip' + (state.filter === d[0] ? ' on' : '') + '" data-f="' + d[0] + '" type="button">' +
        esc(d[1]) + ' <span>' + n + '</span></button>';
    }).join('');
    document.querySelectorAll('.fchip').forEach(function(b){
      b.addEventListener('click', function(){
        state.filter = b.getAttribute('data-f');
        renderFilters();
        renderBrowse();
      });
    });
  }

  function renderBrowse(){
    var box = $('browseGrid');
    if(!box) return;
    var list = DATA.filter(function(p){
      return state.filter === 'all' || verdictKey(p) === state.filter;
    });
    if(state.sort === 'name'){
      list = list.slice().sort(function(a,b){ return a.area.localeCompare(b.area); });
    } else if(state.sort === 'score'){
      list = list.slice().sort(function(a,b){ return assess(b).score - assess(a).score; });
    } else {
      list = list.slice().sort(function(a,b){ return assess(a).score - assess(b).score; });
    }

    if(!list.length){
      box.innerHTML = '<div class="browse-empty">—</div>';
      return;
    }
    box.innerHTML = list.map(function(p){
      var a = assess(p);
      var v = a.verdict === 'ok' ? 'ok' : (a.verdict === 'caution' ? 'caution' : 'risk');
      return '<button class="pcard v-' + v + '" data-id="' + p.id + '" type="button">' +
        '<span class="pc-top"><span class="pc-dot"></span>' + esc(p.area) + '</span>' +
        '<span class="pc-plot">' + esc(p.plot) + '</span>' +
        '<span class="pc-meta">' + esc(p.region) + ' · ' + p.size + ' m²</span>' +
        '<span class="pc-foot"><span class="pc-score">' + a.score + '</span>' +
          '<span class="pc-verdict">' + esc(a.verdict === 'ok' ? t('vOk') : (a.verdict === 'caution' ? t('vCaution') : t('vRisk'))) + '</span></span>' +
      '</button>';
    }).join('');
    document.querySelectorAll('.pcard').forEach(function(b){
      b.addEventListener('click', function(){
        var id = b.getAttribute('data-id');
        var p = DATA.filter(function(x){ return x.id === id; })[0];
        if(p){ $('searchInput').value = p.plot; doSearch(p.plot); }
      });
    });
  }

  /* ---------- guided demo ---------- */
  function runGuided(){
    if(state.guidedTimer) return;
    toast(t('guidedRun'));
    var ids = (window.WAZI_GUIDED || []).slice();
    var i = 0;
    function step(){
      var p = DATA.filter(function(x){ return x.id === ids[i]; })[0];
      if(p){
        $('searchInput').value = p.plot;
        doSearch(p.plot);
      }
      i++;
      if(i < ids.length){
        state.guidedTimer = setTimeout(step, 6500);
      } else {
        state.guidedTimer = null;
      }
    }
    step();
  }

  /* ---------- wiring ---------- */
  function wire(){
    $('searchForm').addEventListener('submit', function(e){
      e.preventDefault();
      doSearch($('searchInput').value);
    });

    document.querySelectorAll('.chip').forEach(function(ch){
      ch.addEventListener('click', function(e){
        e.preventDefault();
        var q = ch.getAttribute('data-q');
        $('searchInput').value = q;
        doSearch(q);
      });
    });

    $('guidedBtn').addEventListener('click', runGuided);

    $('sortSel').addEventListener('change', function(){
      state.sort = $('sortSel').value;
      renderBrowse();
    });

    document.querySelectorAll('.lang-opt').forEach(function(b){
      b.addEventListener('click', function(e){
        e.stopPropagation();
        var l = b.getAttribute('data-lang');
        if(l === LANG) return;
        LANG = l;
        localStorage.setItem('wazi_lang', l);
        applyI18n();
        if(state.lastSearch) doSearch(state.lastSearch, true);
      });
    });

    /* notifications panel */
    var panel = $('notifPanel');
    var bell = $('bellBtn');
    function closePanel(){ panel.hidden = true; }
    bell.addEventListener('click', function(e){
      e.stopPropagation();
      panel.hidden = !panel.hidden;
    });
    $('notifClose').addEventListener('click', closePanel);
    $('clearNotifs').addEventListener('click', function(){
      state.notifs = [];
      renderNotifs();
      $('bellCount').style.display = 'none';
      closePanel();
      toast(t('clearAll'));
    });
    document.addEventListener('click', function(e){
      if(!panel.hidden && !panel.contains(e.target) && !bell.contains(e.target)) closePanel();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closePanel();
    });
  }

  /* ---------- PWA ---------- */
  function wirePWA(){
    var deferred = null;
    var btn = $('installBtn');
    window.addEventListener('beforeinstallprompt', function(e){
      e.preventDefault();
      deferred = e;
      btn.classList.remove('hidden');
    });
    btn.addEventListener('click', function(){
      if(!deferred) return;
      deferred.prompt();
      deferred.userChoice.finally(function(){
        deferred = null;
        btn.classList.add('hidden');
      });
    });
    if('serviceWorker' in navigator){
      window.addEventListener('load', function(){
        navigator.serviceWorker.register('sw.js').catch(function(){});
      });
    }
  }

  /* ---------- boot ---------- */
  function boot(){
    wire();
    applyI18n();
    renderFilters();
    renderBrowse();
    wirePWA();
    $('bellCount').style.display = 'none';
    $('yearNow').textContent = new Date().getFullYear();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
