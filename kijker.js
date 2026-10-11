// Rondkijker: WebGL-kijker voor equirectangulaire panorama's, zonder bibliotheken.
// Instellingen in window.RONDKIJKER (gezet door index.html van de rondkijker):
//   {naam, plekken: [{id, naam, kijk, wat}], momenten: [{id, naam}]}; beeld per plek en moment: <plek>-<moment>.jpg
//   kijk = kompasrichting (graden) van het midden van de afbeelding.
(function () {
  const R = window.RONDKIJKER;
  const PLEKKEN = R.plekken, MOMENTEN = R.momenten;
  let plek = PLEKKEN[0], moment = MOMENTEN[0];
  document.getElementById("titel").textContent = R.naam;

  const canvas = document.getElementById("c");
  const gl = canvas.getContext("webgl", {antialias: false});
  const ladenEl = document.getElementById("laden");
  if (!gl) { ladenEl.textContent = "Deze browser ondersteunt geen WebGL; open de pagina in een recente browser."; return; }
  const vs = `attribute vec2 p; varying vec2 v; void main(){ v = p; gl_Position = vec4(p, 0., 1.); }`;
  const fs = `precision highp float; varying vec2 v; uniform sampler2D t; uniform float yaw, pitch, tanHalf, aspect;
  void main(){
    vec3 d = normalize(vec3(v.x * tanHalf * aspect, v.y * tanHalf, 1.0));
    float cp = cos(pitch), sp = sin(pitch);
    d = vec3(d.x, d.y * cp - d.z * sp, d.y * sp + d.z * cp);
    float cy = cos(yaw), sy = sin(yaw);
    d = vec3(d.x * cy + d.z * sy, d.y, -d.x * sy + d.z * cy);
    float lon = atan(d.x, d.z);
    float lat = asin(clamp(d.y, -1.0, 1.0));
    gl_FragColor = texture2D(t, vec2(0.5 + lon / 6.2831853, 0.5 - lat / 3.1415927));
  }`;
  function shader(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n);
  let yaw = 0, pitch = 0, fov = 75;
  const NAMEN = ["N", "NNO", "NO", "ONO", "O", "OZO", "ZO", "ZZO", "Z", "ZZW", "ZW", "WZW", "W", "WNW", "NW", "NNW"];
  const texturen = {};   // per bestand, geladen bij eerste gebruik

  function bestand(p = plek, m = moment) { return `${p.id}-${m.id}.jpg`; }
  function laad(naam) {
    if (texturen[naam]) return;
    const t = {tex: gl.createTexture(), klaar: false}; texturen[naam] = t;
    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      t.klaar = true; if (naam === bestand()) teken();
    };
    img.onerror = () => { if (naam === bestand()) ladenEl.textContent = `${naam} kon niet worden geladen.`; };
    img.src = naam;
  }
  function kies(nieuwePlek, nieuwMoment) {
    if (nieuwePlek && nieuwePlek !== plek) { plek = nieuwePlek; yaw = 0; pitch = 0; }
    if (nieuwMoment) moment = nieuwMoment;
    document.getElementById("wat").textContent = plek.wat || "";
    document.querySelectorAll("#plekken button").forEach(b => b.setAttribute("aria-pressed", b.dataset.id === plek.id));
    document.querySelectorAll("#momenten button").forEach(b => b.setAttribute("aria-pressed", b.dataset.id === moment.id));
    laad(bestand());
    MOMENTEN.forEach(m => laad(bestand(plek, m)));   // de andere momenten van dit standpunt alvast laden
    teken();
  }
  function knoppen(lijst, houder, actie) {
    if (lijst.length < 2) { houder.hidden = true; return; }
    lijst.forEach(item => {
      const b = document.createElement("button"); b.type = "button"; b.textContent = item.naam; b.dataset.id = item.id;
      b.addEventListener("click", () => actie(item)); houder.appendChild(b);
    });
  }
  knoppen(MOMENTEN, document.getElementById("momenten"), m => kies(null, m));
  knoppen(PLEKKEN, document.getElementById("plekken"), p => kies(p, null));

  function teken() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    const t = texturen[bestand()];
    ladenEl.hidden = !!(t && t.klaar);
    if (!t || !t.klaar) return;
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    gl.uniform1f(U("yaw"), yaw); gl.uniform1f(U("pitch"), pitch);
    gl.uniform1f(U("tanHalf"), Math.tan(fov * Math.PI / 360)); gl.uniform1f(U("aspect"), w / h);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    const az = ((plek.kijk + yaw * 180 / Math.PI) % 360 + 360) % 360;
    document.getElementById("richting").textContent = NAMEN[Math.round(az / 22.5) % 16];
    document.getElementById("graden").textContent = az.toFixed(0) + "°" + (pitch ? (pitch > 0 ? " ↑" : " ↓") + Math.abs(pitch * 180 / Math.PI).toFixed(0) + "°" : "");
    document.getElementById("fov").textContent = fov.toFixed(0);
  }
  function begrensPitch() { const lim = Math.PI / 2 - 0.01; pitch = Math.max(-lim, Math.min(lim, pitch)); }
  let sleep = null, knijp = null;
  canvas.addEventListener("pointerdown", e => { sleep = {x: e.clientX, y: e.clientY, yaw, pitch}; canvas.classList.add("drag"); canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", e => {
    if (!sleep || knijp) return;
    const k = fov / 360 * Math.PI / canvas.clientHeight * 1.2;
    yaw = sleep.yaw - (e.clientX - sleep.x) * k; pitch = sleep.pitch - (e.clientY - sleep.y) * k; begrensPitch(); teken();
  });
  const stop = () => { sleep = null; canvas.classList.remove("drag"); };
  canvas.addEventListener("pointerup", stop); canvas.addEventListener("pointercancel", stop);
  canvas.addEventListener("wheel", e => { e.preventDefault(); fov = Math.max(25, Math.min(120, fov * (e.deltaY > 0 ? 1.1 : 0.9))); teken(); }, {passive: false});
  const afstand = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  canvas.addEventListener("touchstart", e => { if (e.touches.length === 2) knijp = {d: afstand(e.touches), fov}; }, {passive: true});
  canvas.addEventListener("touchmove", e => { if (knijp && e.touches.length === 2) { fov = Math.max(25, Math.min(120, knijp.fov * knijp.d / afstand(e.touches))); teken(); } }, {passive: true});
  canvas.addEventListener("touchend", e => { if (e.touches.length < 2) knijp = null; });
  window.addEventListener("keydown", e => {
    if (e.target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return;
    const s = 0.05;
    if (e.key === "ArrowLeft") yaw -= s; else if (e.key === "ArrowRight") yaw += s;
    else if (e.key === "ArrowUp") pitch += s; else if (e.key === "ArrowDown") pitch -= s;
    else if (e.key === "0") { yaw = 0; pitch = 0; fov = 75; }
    else return;
    e.preventDefault(); begrensPitch(); teken();
  });
  window.addEventListener("resize", teken);
  kies(PLEKKEN[0], MOMENTEN[0]);
})();
