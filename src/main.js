import { dropPortrait } from './portrait.js';
import { PORTRAIT_DATA } from './portrait-data.js';

(function(){
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* flip cards */
  document.querySelectorAll('.flip').forEach(function(card){
    card.addEventListener('click', function(){
      var on = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  });

  /* copy buttons: the label itself says whether it worked */
  function wireCopy(btnId, srcId, label){
    var btn = document.getElementById(btnId), src = document.getElementById(srcId);
    if(!btn || !src) return;
    var lbl = btn.querySelector('.lbl'), timer;
    function show(text, state){
      btn.classList.remove('roll'); void btn.offsetWidth; btn.classList.add('roll');
      setTimeout(function(){ lbl.textContent = text; }, 200);
      if(state) btn.setAttribute('data-state', state); else btn.removeAttribute('data-state');
    }
    btn.addEventListener('click', function(){
      var text = src.textContent.trim();
      clearTimeout(timer);
      function fail(){
        var r = document.createRange(); r.selectNodeContents(src);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        show('Selected, press Ctrl+C', 'fail');
        timer = setTimeout(function(){ show(label); }, 2600);
      }
      try{
        if(!navigator.clipboard){ fail(); return; }
        navigator.clipboard.writeText(text).then(function(){
          show('Copied', 'done');
          timer = setTimeout(function(){ show(label); }, 2000);
        }, fail);
      }catch(e){ fail(); }
    });
  }
  wireCopy('copy-email', 'mail', 'Copy email');
  wireCopy('copy-phone', 'phone', 'Copy phone');

  /* mobile menu */
  var menuBtn = document.querySelector('.menu-btn'), nav = document.getElementById('site-nav');
  function setMenu(open){
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.textContent = open ? 'Close' : 'Menu';
  }
  menuBtn.addEventListener('click', function(){ setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function(e){ if(e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && nav.classList.contains('open')){ setMenu(false); menuBtn.focus(); } });
  window.addEventListener('resize', function(){ if(window.innerWidth >= 720) setMenu(false); });

  /* ---------- motion ---------- */

  /* red-pencil underline under each section title */
  var heads = Array.prototype.slice.call(document.querySelectorAll('.sec-head h2'));
  heads.forEach(function(h, i){
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'pencil'); svg.setAttribute('viewBox', '0 0 200 20'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    var wob = (i % 3) * 3;
    svg.innerHTML = '<path pathLength="1" d="M3 ' + (12 + wob % 4) + ' C 50 ' + (6 + wob) + ', 100 ' + (17 - wob) + ', 150 10 S 190 ' + (8 + wob) + ', 197 12"/>';
    h.appendChild(svg);
  });

  /* year badges: rise and get circled */
  var tags = Array.prototype.slice.call(document.querySelectorAll('.yr'));

  /* anything below the first screen waits for the reader; the first screen is already complete */
  if(!reduce){
    heads.forEach(function(h){ if(h.getBoundingClientRect().top > window.innerHeight) h.querySelector('.pencil path').style.setProperty('--d', '1'); });
    tags.forEach(function(t){ if(t.getBoundingClientRect().top > window.innerHeight) t.classList.add('pending'); });
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(!e.isIntersecting) return;
          var el = e.target;
          if(el.classList.contains('yr')) el.classList.remove('pending');
          else el.querySelector('.pencil path').style.setProperty('--d', '0');
          io.unobserve(el);
        });
      }, {rootMargin:'0px 0px -12% 0px'});
      heads.concat(tags).forEach(function(el){ io.observe(el); });
    }
  }

  /* changelog reading line */
  var log = document.querySelector('.log'), logFill = null;
  if(log){
    var tr = document.createElement('span'); tr.className = 'log-track'; tr.setAttribute('aria-hidden', 'true');
    tr.innerHTML = '<i></i>'; log.appendChild(tr); logFill = tr.querySelector('i');
  }

  var bar = document.getElementById('bar');
  var kin = document.querySelector('.kinetic'), krow = kin ? kin.querySelector('.k-row') : null;
  var foot = document.querySelector('footer.reveal'), giant = foot ? foot.querySelector('.giant') : null;
  var lastY = window.scrollY, skew = 0, running = false;

  function frame(){
    var y = window.scrollY, v = y - lastY; lastY = y;
    var h = root.scrollHeight - window.innerHeight;
    if(bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    if(!reduce){
      if(krow){
        var r = kin.getBoundingClientRect(), p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
        skew += (Math.max(-6, Math.min(6, v * .2)) - skew) * .2;
        krow.style.transform = 'translateX(' + (-p * 35) + '%) skewX(' + (-skew) + 'deg)';
      }
      if(logFill){
        var lr = log.getBoundingClientRect();
        logFill.style.setProperty('--t', Math.min(1, Math.max(0, (window.innerHeight * .6 - lr.top) / lr.height)).toFixed(3));
      }
      if(giant){
        var fr = foot.getBoundingClientRect();
        giant.style.setProperty('--f', (1 - Math.min(1, Math.max(0, (window.innerHeight - fr.top) / fr.height))).toFixed(3));
      }
    }
    if(!reduce && Math.abs(skew) > .05) requestAnimationFrame(frame); else running = false;
  }
  window.addEventListener('scroll', function(){ if(!running){ running = true; requestAnimationFrame(frame); } }, {passive:true});
  window.addEventListener('resize', frame);
  frame();

  /* portrait made of falling balls */
  var fig = document.getElementById('portrait'), ballCanvas = document.getElementById('portrait-balls');
  if(fig && ballCanvas){
    dropPortrait(ballCanvas, PORTRAIT_DATA, { duration: 2400, onDone: function(){ fig.classList.add('done'); } });
  }

  /* copyright year */
  var year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();
})();
