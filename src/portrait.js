/*
  dropPortrait(canvas, data, options)
  Builds a portrait from grey balls. Each ball falls in from the top, lands in its spot
  and bounces once. Rows fill from the bottom up. Background cells have no ball.

  options:
    duration  total time in ms (default 2400)
    onDone    called when the picture is complete
  returns { replay(), drawFinal() }
*/
const ALPHA = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function dropPortrait(canvas, data, options){
    options = options || {};
    var ctx = canvas.getContext('2d');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var S = data.step, R = S * 0.5, nRows = data.rows.length;

    /* one entry per ball: final position, grey shade, and its row counted from the bottom */
    var balls = [];
    data.rows.forEach(function(str, ri){
      for(var c = 0; c < str.length; c++){
        if(str[c] === '-') continue;
        var v = Math.round(ALPHA.indexOf(str[c]) / 61 * 255);
        balls.push({ x: c * S + S / 2, y: ri * S + S / 2, v: v, row: nRows - 1 - ri });
      }
    });

    /* on a dark page the darkest balls are lifted to grey so the suit and hair stay visible */
    var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    function isDark(){ var t = document.documentElement.getAttribute('data-theme'); return t ? t === 'dark' : darkQuery.matches; }
    function paint(){
      var dark = isDark();
      balls.forEach(function(b){ var v = dark ? Math.round(64 + b.v * 0.75) : b.v; b.col = 'rgb(' + v + ',' + v + ',' + v + ')'; });
    }
    paint();
    darkQuery.addEventListener('change', function(){ paint(); drawFinal(); });

    /* timing: rows start one after another, each ball gets a little random delay, then falls */
    var total = options.duration || 2400;
    var FALL = Math.round(total * 0.22), JITTER = Math.round(total * 0.12);
    var ROW = (total - FALL - JITTER) / nRows;
    function schedule(){
      balls.forEach(function(b){ b.t = b.row * ROW + Math.random() * JITTER; b.from = -R - Math.random() * 90; });
      balls.sort(function(a, b){ return a.t - b.t; });
    }

    var store = document.createElement('canvas'), sctx = store.getContext('2d'), k = 1, raf = 0, landed = 0;
    function size(){
      var rect = canvas.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      k = rect.width / data.w * dpr;
      [canvas, store].forEach(function(c){ c.width = Math.max(1, Math.round(rect.width * dpr)); c.height = Math.max(1, Math.round(rect.height * dpr)); });
      [ctx, sctx].forEach(function(c){ c.setTransform(k, 0, 0, k, 0, 0); });
    }
    function draw(c, b, y){ c.fillStyle = b.col; c.beginPath(); c.arc(b.x, y, R, 0, 6.2832); c.fill(); }
    function drawFinal(){ cancelAnimationFrame(raf); size(); balls.forEach(function(b){ draw(ctx, b, b.y); }); }

    /* gravity fall, then one small bounce */
    function fallY(b, p){
      if(p < 0.72){ var a = p / 0.72; return b.from + (b.y - b.from) * a * a; }
      var q = (p - 0.72) / 0.28; return b.y - Math.sin(q * Math.PI) * S * (1 - q);
    }

    function replay(){
      cancelAnimationFrame(raf); size(); schedule(); landed = 0;
      sctx.clearRect(0, 0, data.w, data.h);
      if(reduce){ drawFinal(); if(options.onDone) options.onDone(); return; }
      var t0 = performance.now(), end = balls[balls.length - 1].t + FALL;
      function frame(now){
        var t = now - t0;
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(store, 0, 0); ctx.setTransform(k, 0, 0, k, 0, 0);
        while(landed < balls.length && t - balls[landed].t >= FALL){ draw(sctx, balls[landed], balls[landed].y); landed++; }
        for(var i = landed; i < balls.length; i++){
          var b = balls[i], p = (t - b.t) / FALL;
          if(p <= 0) break;
          draw(ctx, b, p >= 1 ? b.y : fallY(b, p));
        }
        if(t < end + 30) raf = requestAnimationFrame(frame);
        else { drawFinal(); if(options.onDone) options.onDone(); }
      }
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', drawFinal);
    replay();
    return { replay: replay, drawFinal: drawFinal };
  }

