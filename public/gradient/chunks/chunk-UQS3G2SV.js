/* Mercury gradient. Engine: gradients.sh, MIT (see web/gradients/LICENSE in the Nara repo). */
function r(e,o){return e[o%e.length]??"transparent"}function s(e,o=0,t=100){let a=Math.max(1,e.length-1);return e.map((l,n)=>`${l} ${(o+(t-o)*n/a).toFixed(1)}%`).join(", ")}var F=[[16,20],[84,26],[72,86],[22,80],[52,48],[92,62]],C={defaults:{background:"#0a0d24",blur:.45,colors:["#ecdcf2","#8796ee","#2e45b7","#0e1645"],dither:{cell:3,enabled:!1,levels:8},grain:.1,interaction:{pointer:.2,scroll:.1},loopSeconds:14,scale:1,seed:42,speed:.6,warp:.4},description:"Soft, lit colour fields drifting through each other.",fallbackLayers:e=>e.map((o,t)=>{let[a,l]=F[t%F.length]??[50,50];return`radial-gradient(85% 95% at ${a}% ${l}%, ${r(e,t)} 0%, transparent 68%)`}),glsl:`
vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  // The palette marches from a lit corner to the far one: colour 0 sits in
  // the light, the last colour in the shadow.
  float theta = seedAngle();
  vec2 axis = vec2(cos(theta), sin(theta));
  vec2 side = vec2(-axis.y, axis.x);
  float span = abs(axis.x) * h.x + abs(axis.y) * h.y;
  vec2 q = p + u_warp * 0.14 * vec2(
    flowNoise(p * 1.2 * u_scale, 1.0),
    flowNoise(p * 1.2 * u_scale + 4.1, 2.0)
  );
  float sigma = (0.22 + 0.2 * u_blur) / u_scale;
  float inv = 1.0 / (sigma * sigma);
  float count = float(u_count);
  float wb = 0.06;
  vec3 lab = u_bg * wb;
  float chroma = length(u_bg.yz) * wb;
  float total = wb;
  for (int i = 0; i < 6; i++) {
    if (i >= u_count) break;
    float fi = float(i);
    float k = fi / max(1.0, count - 1.0);
    float zig = (mod(fi, 2.0) * 2.0 - 1.0) * (0.25 + 0.5 * fract(fi * 0.618 + 0.3));
    vec2 c = axis * span * (0.9 - 1.8 * k) + side * span * 0.5 * zig
      + 0.25 * h * (rot2(fi * 1.7) * u_loop);
    vec2 d = q - c;
    // Fields are wider across the axis than along it: soft bands of light.
    d = vec2(dot(d, axis) * 1.2, dot(d, side) * 0.65);
    float w = exp(-dot(d, d) * inv);
    lab += u_colors[i] * w;
    chroma += length(u_colors[i].yz) * w;
    total += w;
  }
  lab /= total;
  chroma /= total;
  float current = length(lab.yz);
  if (current > 1e-4) {
    lab.yz *= mix(1.0, chroma / current, 0.85);
  }
  lab.x += 0.05 * dot(p, axis) / span;
  // One long silk fold across the frame: a lit crest, then the cloth turns
  // into shadow behind it.
  float along = dot(q, side);
  float crest = 0.16 * sin(along * 1.6 + 0.8 * dot(u_loop, vec2(0.6, 0.8)) + theta)
    + 0.08 * flowNoise(vec2(along * 0.6, 2.0), 3.0);
  float acrossFold = dot(q, axis) - crest;
  float fw = 0.05 + 0.08 * u_blur;
  lab.x += 0.06 * exp(-acrossFold * acrossFold / (fw * fw)) - 0.07 * smoothstep(0.0, 0.5, -acrossFold);
  lab.x *= vignette(p, 0.18);
  return filmGrade(lab);
}
`,label:"Mesh",name:"mesh",wgsl:()=>import("./mesh-EYCR7U53.js").then(e=>e.wgsl)};var ot={...C.defaults,kind:"mesh"},p=(e,o,t)=>Math.min(t,Math.max(o,e));function M(e){if(typeof e!="object"||e===null||Array.isArray(e))throw new TypeError("Expected an object");return Object.fromEntries(Object.entries(e))}function d(e,o){if(typeof e!="number"||!Number.isFinite(e))throw new TypeError(`${o} must be a number`);return e}function Te(e,o){let t=d(e,o);if(!Number.isInteger(t))throw new TypeError(`${o} must be an integer`);return t}function B(e,o){if(typeof e!="string")throw new TypeError(`${o} must be a string`);return e}function Le(e){let o=M(e),t=o.colors;if(!Array.isArray(t)||t.length<2||t.length>6)throw new TypeError("colors must contain 2 to 6 entries");let a=M(o.dither),l=M(o.interaction),n={background:B(o.background,"background"),blur:d(o.blur,"blur"),colors:t.map(c=>B(c,"colors")),dither:{cell:d(a.cell,"dither.cell"),enabled:Me(a.enabled,"dither.enabled"),levels:d(a.levels,"dither.levels")},grain:d(o.grain,"grain"),interaction:{pointer:d(l.pointer,"interaction.pointer"),scroll:d(l.scroll,"interaction.scroll")},kind:B(o.kind,"kind"),loopSeconds:d(o.loopSeconds,"loopSeconds"),scale:d(o.scale,"scale"),seed:Te(o.seed,"seed"),speed:d(o.speed,"speed"),warp:d(o.warp,"warp")};return o.drift===void 0?n:{...n,drift:d(o.drift,"drift")}}function Me(e,o){if(typeof e!="boolean")throw new TypeError(`${o} must be a boolean`);return e}function N(e){let o=Le(e),t={...o,blur:p(o.blur,0,1),colors:o.colors.slice(0,6),dither:{cell:Math.round(p(o.dither.cell,1,32)),enabled:o.dither.enabled,levels:Math.round(p(o.dither.levels,2,32))},grain:p(o.grain,0,1),interaction:{pointer:p(o.interaction.pointer,0,1),scroll:p(o.interaction.scroll,0,1)},loopSeconds:p(o.loopSeconds,4,30),scale:p(o.scale,.25,4),speed:p(o.speed,0,2),warp:p(o.warp,0,1)};return o.drift!==void 0&&(t.drift=p(o.drift,0,2)),t}function O(e,o){return N({...e,...o,dither:{...e.dither,...o.dither},interaction:{...e.interaction,...o.interaction}})}var H={defaults:{background:"#03050b",blur:.35,colors:["#a0f0c8","#3fb5a3","#5147b6","#b25c9c"],dither:{cell:3,enabled:!1,levels:8},grain:.1,interaction:{pointer:.2,scroll:.2},loopSeconds:18,scale:1,seed:3,speed:.7,warp:.5},description:"Folded curtains of light hanging over a night sky.",fallbackLayers:e=>[...e.map((o,t)=>`radial-gradient(30% 55% at ${15+70*t/Math.max(1,e.length-1)}% 30%, color-mix(in oklab, ${r(e,t)} 75%, transparent) 0%, transparent 70%)`),`linear-gradient(180deg, transparent 35%, color-mix(in oklab, ${r(e,0)} 45%, transparent) 58%, transparent 80%)`],glsl:`
// One curtain sheet. Returns its intensity and the height above its hem (0..1).
vec2 auroraSheet(vec2 p, float layer, float hem0, bool detail) {
  float x = p.x * u_scale;
  // Folds sway the sheet sideways, more so higher up.
  float fold = flowNoise(vec2(x * 0.5, p.y * 0.25 + layer), layer);
  float xf = x + (0.1 + 0.3 * u_warp) * fold;
  float hem = hem0 + 0.24 * flowNoise(vec2(xf * 0.6, layer * 3.1), layer + 1.0)
    + 0.1 * sin(x * 1.2 + layer) + 0.06 * fold + 0.08 * x * x;
  float rise = p.y - hem;
  float up = exp(-max(rise, 0.0) * (2.8 - 1.0 * u_blur));
  float down = exp(min(rise, 0.0) * (9.0 - 5.0 * u_blur));
  // Rays: fine across the sheet, stretched along it.
  float n = 0.65 * flowNoise(vec2(xf * 4.0, p.y * 0.15), layer + 2.0);
  if (detail) {
    n += 0.35 * flowNoise(vec2(xf * 11.0, p.y * 0.3), layer + 3.0);
  }
  float rays = mix(1.0, 0.6 + 0.55 * n, 0.85 - 0.45 * u_blur);
  // The sheet thins where it folds edge-on.
  float density = 0.45 + 0.55 * smoothstep(-0.6, 0.6, fold);
  return vec2(up * down * rays * density, clamp(rise / 0.75, 0.0, 1.0));
}

vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  vec3 lab = u_bg;
  lab.x += 0.035 * smoothstep(0.3, -h.y, p.y);
  vec2 back = auroraSheet(p * vec2(0.75, 1.0) + vec2(0.9, 0.0), 11.0, -0.02, false);
  vec2 front = auroraSheet(p, 13.0, -0.3, true);
  lab = labMix(lab, ramp(0.3 + 0.7 * back.y), clamp(back.x * 0.35, 0.0, 1.0));
  lab = labMix(lab, ramp(front.y), clamp(front.x * 1.45, 0.0, 1.0));
  // A bright hem, and the light it throws onto the horizon.
  lab.x += 0.12 * front.x * (1.0 - front.y);
  float horizon = exp(-(p.y + h.y) * 5.0) * (0.5 + 0.5 * front.x);
  lab = labMix(lab, paletteColor(1), clamp(horizon * 0.2, 0.0, 1.0));
  lab.x *= vignette(p, 0.3);
  return filmGrade(lab);
}
`,wgsl:()=>import("./aurora-IJHQZ7U6.js").then(e=>e.wgsl),label:"Aurora",name:"aurora"};var W={defaults:{background:"#02030a",blur:.35,colors:["#f4f7ff","#8fb4ff","#3d5bff","#1a1660"],dither:{cell:3,enabled:!1,levels:8},grain:.2,interaction:{pointer:.15,scroll:.1},loopSeconds:14,scale:1,seed:2,speed:.6,warp:.6},description:"A cone of streaked light thrown from a source on the edge of the frame.",fallbackLayers:e=>[`radial-gradient(60% 90% at 50% 100%, color-mix(in oklab, ${r(e,0)} 80%, transparent) 0%, color-mix(in oklab, ${r(e,1)} 55%, transparent) 18%, color-mix(in oklab, ${r(e,2)} 30%, transparent) 45%, transparent 75%)`,`conic-gradient(from 315deg at 50% 100%, transparent 0deg, color-mix(in oklab, ${r(e,3)} 25%, transparent) 45deg, transparent 90deg)`],glsl:`
// Light from a point on or beyond the frame edge, spread into a cone of
// rays. The rays are noise sampled across the cone's angle, so they are
// fine across and long along the beam. scale widens the cone; warp sets
// ray contrast.

// One beam. Returns glow, the palette position, and how much of the light
// is the white-hot core and needle.
vec3 beamLight(vec2 p, vec2 source, float aim, float width, float reach, float layer, float omni) {
  vec2 axis = vec2(sin(aim), cos(aim));
  vec2 v = p - source;
  float dist = length(v);
  float along = dot(v, axis);
  float across = axis.x * v.y - axis.y * v.x;
  float ang = atan(across, max(along, 1e-3));
  float u = ang / width;
  float forward = smoothstep(-0.02, 0.06, along);
  float cone = exp(-u * u) * forward;

  // Rays: two scales of noise across the cone, stretched along it. A flare
  // rays out all round, so it samples on the unit circle instead, which
  // has no seam behind the source.
  vec2 dir = v / max(dist, 1e-4);
  vec2 coarseAt = omni > 0.5 ? dir * 3.2 + vec2(dist * 0.35, 0.0) : vec2(u * 2.2, dist * 0.35);
  vec2 fineAt = omni > 0.5 ? dir * 9.0 + vec2(13.0, dist * 0.9) : vec2(u * 6.0 + 13.0, dist * 0.9);
  float coarse = flowNoise(coarseAt, layer);
  float fine = flowNoise(fineAt, layer + 1.0);
  cone = mix(cone, 0.55 + 0.45 * exp(-u * u), omni);
  forward = mix(forward, 1.0, omni);
  float fineAmount = 0.55 * (1.0 - 0.6 * u_blur);
  float rays = 0.5 + 0.5 * (coarse + fineAmount * fine) / (1.0 + fineAmount);
  rays = mix(1.0, smoothstep(0.1, 0.95, rays) * 1.5, u_warp);

  float fall = exp(-dist / reach);
  float core = exp(-dist / (0.05 + 0.05 * u_blur));
  // A hairline down the axis, the brightest ray.
  float needle = exp(-pow(across / (0.0035 + 0.01 * u_blur), 2.0)) * exp(-dist / (0.6 * reach)) * smoothstep(0.0, 0.03, along) * u_warp * (1.0 - 0.5 * omni);
  float haze = exp(-dist / (0.4 + 0.5 * u_blur));
  // A broad, soft fill under the rays gives the beam volume.
  float fill = mix(exp(-u * u * 0.35), 1.0, omni) * forward * fall;

  float glow = cone * fall * (0.2 + 0.8 * rays) + 0.22 * fill + 0.85 * core + 0.55 * needle + 0.08 * haze;
  // Near the source the light is colour 0; colour takes over along the
  // beam and at the cone's edges.
  float t = clamp(dist / (reach * 1.4) + 0.35 * abs(u) * (1.0 - omni) - 0.25 * core, 0.0, 1.0);
  return vec3(glow, t, clamp(core + needle, 0.0, 1.0));
}

vec3 kindColor(vec2 p, vec2 uv) {
  float lightBg = smoothstep(0.55, 0.85, u_bg.x);
  vec2 h = frameHalf();
  // The seed picks the source: bottom centre, a bottom corner, the top
  // edge, a top corner, a side edge, two crossing beams from the bottom
  // corners, a source far below or above the frame, so only its rays
  // reach in, or a flare inside the frame raying out all round.
  float framing = floor(fract(u_seed.x * 0.0731 + 0.5) * 9.0);
  float side = sign(u_seed.y + 0.01);
  vec2 source = vec2(0.0, -h.y - 0.02);
  float aim = 0.0;
  float width = 0.3 * u_scale;
  float reach = 0.55 + 0.6 * u_scale;
  if (framing == 1.0) {
    source = vec2(-side * (h.x - 0.06), -h.y - 0.02);
    aim = side * 0.62;
  } else if (framing == 2.0) {
    source = vec2(0.0, h.y + 0.02);
    aim = 3.14159265;
  } else if (framing == 3.0) {
    source = vec2(-side * (h.x - 0.1), h.y + 0.02);
    aim = 3.14159265 - side * 0.5;
  } else if (framing == 4.0) {
    source = vec2(-side * (h.x + 0.02), -0.12);
    aim = side * 1.32;
  } else if (framing == 5.0) {
    source = vec2(-(h.x - 0.12), -h.y - 0.02);
    aim = 0.42;
    width *= 0.7;
  } else if (framing == 6.0) {
    source = vec2(0.3 * h.x * side, -h.y - 1.0);
    aim = -side * 0.12;
    width *= 0.45;
    reach *= 2.4;
  } else if (framing == 7.0) {
    source = vec2(0.3 * h.x * side, h.y + 1.0);
    aim = 3.14159265 + side * 0.15;
    width *= 0.45;
    reach *= 2.4;
  } else if (framing == 8.0) {
    source = vec2(0.22 * h.x * side, 0.04);
    aim = seedAngle();
    width = 0.6 * u_scale;
    reach = 0.3 + 0.3 * u_scale;
  }
  // The cone sways a little through the loop.
  float sway = 0.22 * u_loop.y;
  vec3 light = beamLight(p, source, aim + sway, width, reach, 1.0, framing == 8.0 ? 1.0 : 0.0);
  if (framing == 5.0) {
    // The second beam mirrors the first and sways the other way.
    vec3 twin = beamLight(p, vec2(-source.x, source.y), -aim - sway, width, reach, 4.0, 0.0);
    float total = max(light.x + twin.x, 1e-4);
    light = vec3(light.x + twin.x, (light.x * light.y + twin.x * twin.y) / total, max(light.z, twin.z));
  }
  float glow = light.x;

  vec3 col = ramp(light.y);
  col = labMix(col, paletteColor(0), light.z);
  vec3 lab = labMix(u_bg, col, clamp(glow, 0.0, 1.0));
  lab.x += 0.08 * max(glow - 0.9, 0.0) * (1.0 - lightBg);
  return filmGrade(lab);
}
`,wgsl:()=>import("./beam-GKCTGGOV.js").then(e=>e.wgsl),label:"Beam",name:"beam"};var I={defaults:{background:"#050203",blur:.2,colors:["#e0202e","#ffd6b8","#4fe3f0"],dither:{cell:3,enabled:!1,levels:8},grain:.06,interaction:{pointer:.2,scroll:.2},loopSeconds:24,scale:1,seed:6,speed:.5,warp:.5},description:"Liquid metal folding slowly under studio light.",fallbackLayers:e=>[`radial-gradient(60% 30% at 40% 38%, color-mix(in oklab, ${r(e,1)} 70%, transparent), transparent 70%)`,`linear-gradient(160deg, transparent 20%, ${r(e,0)} 45%, transparent 60%, color-mix(in oklab, ${r(e,0)} 60%, transparent) 75%, transparent 90%)`,`linear-gradient(20deg, transparent 60%, color-mix(in oklab, ${r(e,2)} 35%, transparent) 70%, transparent 78%)`],glsl:`
// Height of the metal: long folds running one way, their crests bent by a
// slow noise field so they curve and bunch like draped cloth, with a faint
// cross fold. Ridges rather than domes, so reflections stream along the
// folds instead of ringing. The folds roll a whole wavelength each loop.
float chromeHeight(vec2 q, vec2 t1, vec2 t2) {
  float bendBy = (0.9 + 1.6 * u_warp) * flowNoise(q * vec2(0.35, 0.55), 2.0);
  float a = 2.1 * q.y + bendBy;
  float c = 1.3 * q.x + 0.4 * bendBy + 1.3;
  return sin(a) * t1.x - cos(a) * t1.y
    + 0.2 * (sin(2.0 * a + 0.9) * t2.x - cos(2.0 * a + 0.9) * t2.y) * (1.0 - 0.6 * u_blur)
    + 0.15 * (sin(c) * t2.x - cos(c) * t2.y);
}

// The studio as seen in a reflection direction: a dark floor with a soft
// bounce and a light behind the camera, a dark horizon line, a bright sky with a cool band and a hot key, and darker ceiling.
vec3 chromeStudio(vec3 r, float sa) {
  float t = r.y * 0.9 + 0.3 * r.x * cos(sa);
  float soft = 0.04 + 0.12 * u_blur;
  vec3 floorC = labMix(u_bg, paletteColor(0), 0.08 + 0.5 * smoothstep(0.9, 1.0, r.z));
  // A broad, dimmer bounce off the floor, so downward slopes still read as metal.
  floorC = labMix(floorC, paletteColor(0), 0.7 * exp(-pow((t + 0.5) / (0.18 + soft), 2.0)));
  vec3 env = labMix(floorC, paletteColor(0), smoothstep(0.1, 0.3, t));
  float horizon = exp(-pow((t - 0.12) / (soft * 1.3), 2.0));
  env = labMix(env, u_bg, 0.92 * horizon);
  float cool = exp(-pow((t - 0.4) / (soft * 0.9), 2.0));
  env = labMix(env, paletteColor(u_count > 2 ? 2 : 1), 0.55 * cool);
  float key = exp(-pow((t - 0.58) / soft, 2.0));
  env = labMix(env, paletteColor(1), key);
  env.x += 0.16 * key * key;
  env = labMix(env, u_bg, 0.6 * smoothstep(0.75, 1.0, t));
  return env;
}

vec3 kindColor(vec2 p, vec2 uv) {
  float sa = seedAngle();
  vec2 t1 = loopTurn();
  vec2 t2 = vec2(t1.x * t1.x - t1.y * t1.y, 2.0 * t1.x * t1.y);
  vec2 q = rot2(0.6 * sin(sa) + 0.3) * p * 1.75 * u_scale + vec2(1.7, -0.9) * cos(sa);

  float e = 0.004;
  float h = chromeHeight(q, t1, t2);
  vec2 g = vec2(chromeHeight(q + vec2(e, 0.0), t1, t2) - h, chromeHeight(q + vec2(0.0, e), t1, t2) - h) / e;
  vec3 n = normalize(vec3(-g * 0.6 / sqrt(u_scale), 1.0));
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);

  vec3 lab = chromeStudio(r, sa);
  // Low ground sits in shadow.
  lab = labMix(lab, u_bg, 0.3 * (1.0 - smoothstep(-1.8, -0.6, h)));
  lab.x *= vignette(p, 0.35);
  return filmGrade(lab);
}
`,label:"Chrome",name:"chrome",wgsl:()=>import("./chrome-GYZC4KSX.js").then(e=>e.wgsl)};var U={defaults:{background:"#030305",blur:.5,colors:["#1b2cc1","#3d7bff","#bcd3ff","#f6f4ef"],dither:{cell:3,enabled:!1,levels:8},grain:0,interaction:{pointer:.15,scroll:0},loopSeconds:18,scale:1,seed:2,speed:.5,warp:.55},description:"A soft burst of light resolved into crisp dither cells, every hue kept.",fallbackLayers:e=>[`radial-gradient(90% 80% at 50% 108%, ${s([...e].reverse(),6,62)}, transparent 76%)`],glsl:`
float dbBayer2(vec2 a) {
  a = floor(a);
  return fract(dot(a, vec2(0.5, a.y * 0.75)));
}

float dbBayer8(vec2 a) {
  return dbBayer2(0.25 * a) * 0.0625 + dbBayer2(0.5 * a) * 0.25 + dbBayer2(a);
}

// Interleaved gradient noise (Jimenez 2014): ordered, but with no visible
// period, so it reads like blue noise.
float dbIgn(vec2 a) {
  return fract(52.9829189 * fract(dot(floor(a), vec2(0.06711056, 0.00583715))));
}

vec3 dbLabToSrgb(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  vec3 lin = vec3(
    4.0767416621 * l * l * l - 3.3077115913 * m * m * m + 0.2309699292 * s * s * s,
    -1.2684380046 * l * l * l + 2.6097574011 * m * m * m - 0.3413193965 * s * s * s,
    -0.0041960863 * l * l * l - 0.7034186147 * m * m * m + 1.7076147010 * s * s * s
  );
  lin = clamp(lin, 0.0, 1.0);
  return mix(1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055, lin * 12.92, vec3(lessThanEqual(lin, vec3(0.0031308))));
}

vec3 dbSrgbToLab(vec3 c) {
  vec3 lin = mix(pow((c + 0.055) / 1.055, vec3(2.4)), c / 12.92, vec3(lessThanEqual(c, vec3(0.04045))));
  float l = 0.4122214708 * lin.r + 0.5363325363 * lin.g + 0.0514459929 * lin.b;
  float m = 0.2119034982 * lin.r + 0.6806995451 * lin.g + 0.1073969566 * lin.b;
  float s = 0.0883024619 * lin.r + 0.2817188376 * lin.g + 0.6299787005 * lin.b;
  vec3 lms = pow(max(vec3(l, m, s), 0.0), vec3(1.0 / 3.0));
  return vec3(
    0.2104542553 * lms.x + 0.7936177850 * lms.y - 0.0040720468 * lms.z,
    1.9779984951 * lms.x - 2.4285922050 * lms.y + 0.4505937099 * lms.z,
    0.0259040371 * lms.x + 0.7827717662 * lms.y - 0.8086757660 * lms.z
  );
}

// How far the palette strays from the background. A flat palette has
// nothing to dither between, so it renders flat.
float dbSpread() {
  float d = 0.0;
  for (int i = 0; i < 6; i++) {
    if (i >= u_count) break;
    d = max(d, length(u_colors[i] - u_bg));
  }
  return smoothstep(0.0, 0.04, d);
}

// The light's intensity at q: 0 is the background, 1 the core.
float dbLight(vec2 q, vec2 h, float mode, float side) {
  float s = 1.0 / u_scale;
  float soft = 0.6 + 0.8 * u_blur;
  if (mode < 1.0) {
    // Burst: broad, blurred rays from a point just past one edge.
    float a = 1.5708 + (side - 0.5) * 2.4;
    vec2 src = vec2(cos(a), -abs(sin(a))) * h * vec2(1.0, 1.4) + 0.3 * drift(1.0);
    vec2 d = q - src;
    float r = length(d);
    vec2 dir = d / max(r, 1e-4);
    // Rays are noise on the unit circle, low in angle so they stay broad;
    // they fade in away from the source so it never reads as a star.
    float rays = 0.5 + 0.5 * flowNoise(dir * (1.6 + 1.4 * u_warp), 2.0);
    rays = mix(rays, 0.5 + 0.5 * flowNoise(dir * 4.0 + 7.0, 3.0), 0.3);
    float ray = mix(1.0, 0.25 + 1.2 * rays * rays, (0.35 + 0.55 * u_warp) * smoothstep(0.05, 0.7, r));
    float body = exp(-r / (0.62 * s * soft));
    return 1.15 * body * ray + 0.3 * exp(-r / (0.2 * s * soft));
  }
  if (mode < 2.0) {
    // Horizon: a huge disc rising from below, glowing into the dark.
    float tilt = (side - 0.5) * 0.5;
    vec2 t = rot2(tilt) * q;
    float radius = 1.7 * s;
    float lift = (0.12 + 0.18 * u_scale) * h.y + 0.1 * flowNoise(vec2(0.4, 0.9), 1.0);
    vec2 centre = vec2(0.45 * drift(2.0).x, -h.y - radius + lift);
    float x = length(t - centre) - radius;
    // The edge undulates, and with warp it drips into vertical streaks.
    x += 0.035 * u_warp * flowNoise(vec2(t.x * 2.2, 0.3), 3.0);
    x += 0.06 * u_warp * u_warp * flowNoise(vec2(t.x * 9.0, t.y * 0.6), 4.0) * (1.0 - smoothstep(-0.05, 0.25, x));
    float above = exp(-max(x, 0.0) / (0.14 * soft));
    float below = mix(1.0, 0.72, (1.0 - smoothstep(-0.6, 0.0, x)));
    return x > 0.0 ? 0.92 * above : 0.92 + 0.3 * below * (1.0 - smoothstep(-0.08, 0.0, x));
  }
  if (mode < 3.0) {
    // Beam: a long diagonal band, a thin hot core in a wide soft halo.
    float a = 0.45 + (side - 0.5) * 1.1;
    vec2 dir = vec2(cos(a), sin(a));
    vec2 n = vec2(-dir.y, dir.x);
    float u = dot(q, dir);
    float v = dot(q, n) + 0.08 * h.y + 0.14 * u_loop.y + 0.07 * u_warp * flowNoise(vec2(u * 0.9, 0.5), 2.0) - 0.12 * u * u;
    float w = 0.05 * s * soft;
    float core = exp(-v * v / (w * w));
    float halo = exp(-abs(v) / (4.0 * w));
    float along = smoothstep(-1.4 * h.x, 0.3 * h.x, u) * (0.85 + 0.15 * flowNoise(vec2(u * 1.2, 1.7), 3.0));
    return (0.75 * core + 0.6 * halo) * along;
  }
  // Bloom: light leaning in from a lower corner, with a hard-ish shoulder
  // where it meets the dark, bent by the flow.
  vec2 corner = vec2(side < 0.5 ? -1.0 : 1.0, -1.0) * h;
  vec2 c = corner * 0.92 + 0.3 * drift(3.0);
  vec2 w = q + 0.1 * u_warp * vec2(flowNoise(q * 1.1, 4.0), flowNoise(q * 1.1 + 3.3, 5.0));
  vec2 d = rot2((side - 0.5) * 1.4) * (w - c);
  float r = length(d * vec2(0.75, 1.0));
  // The light spills out of the lobe in a long, uneven tail.
  float tail = exp(-r / (0.55 * s * soft)) * (0.7 + 0.3 * flowNoise(d * 1.6 + 2.0, 7.0));
  float edge = 1.0 - smoothstep((1.0 - 0.6 * soft) * s, s, r);
  return 0.95 * edge * exp(-r / (1.1 * s * soft)) + 0.45 * tail;
}

vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  // The built-in dither; the engine's, when on, replaces it.
  bool own = u_dither.x < 0.5;
  float cell = own ? 3.0 : 1.0;
  vec2 px = uv * u_full;
  vec2 id = floor(px / cell);
  vec2 centre = (id + 0.5) * cell;
  vec2 q = (centre - 0.5 * u_full) / min(u_full.x, u_full.y);
  q.y = -q.y;
  q = interact(q);

  float pick8 = floor(fract(u_seed.x * 0.0731 + 0.5) * 8.0);
  float mode = mod(pick8, 4.0);
  float side = fract(u_seed.y * 0.0917 + 0.5);

  float light = dbLight(q, h, mode, side);
  float t = clamp(pow(max(light, 0.0), 1.25), 0.0, 1.0);
  vec3 lab = labMix(u_bg, ramp(t), smoothstep(0.0, 0.4, t));
  // Past the core the light bleaches toward the palette's brightest.
  vec3 hot = paletteColor(u_count - 1);
  lab = labMix(lab, vec3(min(hot.x + 0.04, 1.0), hot.yz * 0.7), clamp((light - 1.0) * 1.5, 0.0, 1.0));
  float lightBg = smoothstep(0.55, 0.85, u_bg.x);
  lab.x *= vignette(q, 0.25 * (1.0 - lightBg));
  lab = filmGrade(lab);
  if (!own) return lab;

  // Ordered dither per sRGB channel, one threshold per cell.
  float spread = dbSpread();
  float threshold = pick8 < 4.0 ? dbBayer8(id) : dbIgn(id);
  float steps = 11.0;
  vec3 rgb = dbLabToSrgb(lab);
  vec3 dithered = floor(rgb * steps + threshold) / steps;
  rgb = mix(rgb, dithered, spread);
  // The cells read as a display: a faint seam on two edges.
  vec2 local = px - id * cell;
  if (local.x >= cell - 1.0 || local.y >= cell - 1.0) {
    rgb *= 1.0 - 0.1 * spread;
  }
  return dbSrgbToLab(clamp(rgb, 0.0, 1.0));
}
`,wgsl:()=>import("./dither-burst-2WJPPSM5.js").then(e=>e.wgsl),label:"Dither burst",name:"dither-burst"};var j={defaults:{background:"#050505",blur:.4,colors:["#2b3dd8","#ff6a3d","#ffd9a8"],dither:{cell:4,enabled:!1,levels:4},grain:0,interaction:{pointer:1,scroll:0},loopSeconds:20,scale:1,seed:3,speed:.5,warp:.5},description:"A gradient map in ordered-dither cells that resolves to smooth colour around the pointer.",fallbackLayers:(e,o)=>{let t=a=>r(e,a);return[`radial-gradient(70% 85% at 72% 55%, ${t(2)} 0 14%, ${t(1)} 14% 30%, ${t(0)} 30% 52%, color-mix(in oklab, ${t(0)} 45%, ${o}) 52% 66%, transparent 66%)`]},glsl:`
const float BAYER_DF[16] = float[16](
  0.0, 8.0, 2.0, 10.0,
  12.0, 4.0, 14.0, 6.0,
  3.0, 11.0, 1.0, 9.0,
  15.0, 7.0, 13.0, 5.0
);

// Ramp stop i: 0 is the background, then the palette.
vec3 dfStop(int i) {
  return i <= 0 ? u_bg : u_colors[min(i - 1, u_count - 1)];
}

// The body's height, 0..1, at q (p units). It sits right of centre, or low
// in portrait frames, and falls to 0 well before the opposite side.
float dfField(vec2 q, vec2 h) {
  float portrait = clamp((h.y / h.x - 0.8) / 0.6, 0.0, 1.0);
  vec2 centre = mix(vec2(0.52 * h.x, -0.02), vec2(0.04, -0.62 * h.y), portrait);
  float reach = mix(0.56, 0.5, portrait);
  vec2 w = q + u_warp * 0.2 * vec2(flowNoise(q * 1.1, 1.0), flowNoise(q * 1.1 + 4.1, 2.0));
  vec2 d = (w - centre) * vec2(0.9, 1.0);
  float body = pow(clamp(1.0 - length(d) / reach, 0.0, 1.0), 0.75);
  // A second, smaller lobe circling the first.
  vec2 orbit = centre + 0.3 * normalize(drift(3.0) + vec2(1e-4)) * vec2(1.2, 0.7);
  float lobe = pow(clamp(1.0 - length(w - orbit) / 0.24, 0.0, 1.0), 1.4);
  body = max(body, 0.55 * lobe) + 0.25 * body * lobe;
  body += 0.06 * flowNoise(w * 2.4, 4.0) * smoothstep(0.0, 0.2, body);
  // Keep clear of the opposite side, where a hero puts its copy.
  float side = mix(q.x / h.x, -q.y / h.y, portrait);
  body *= smoothstep(mix(-0.18, 0.1, portrait), mix(0.25, 0.42, portrait), side);
  return clamp(body, 0.0, 1.0);
}

vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  float minSide = min(u_full.x, u_full.y);
  vec2 px = floor(uv * u_full);
  float coarse = 4.0 * clamp(floor(u_scale * 4.0 + 0.5), 2.0, 16.0);

  // The focus: an idle drift, eased toward the pointer while it is near.
  vec2 idle = mix(vec2(0.46 * h.x, 0.04), vec2(0.0, -0.6 * h.y), clamp((h.y / h.x - 0.8) / 0.6, 0.0, 1.0)) + 0.12 * drift(1.5);
  vec2 ptr = (u_pointer.xy - 0.5) * 2.0 * h;
  ptr.y = -ptr.y;
  vec2 focus = mix(idle, ptr, clamp(u_pointer.z, 0.0, 1.0));

  // Quadtree: a cell splits while its centre is inside the next radius.
  float core = 0.07 + 0.08 * u_blur;
  float radii[3] = float[3](core * 3.6, core * 2.2, core);
  float size = coarse;
  vec2 id = floor(px / size);
  int tier = 0;
  for (int k = 0; k < 3; k++) {
    vec2 centre = (id + 0.5) * size;
    vec2 cq = (centre - 0.5 * u_full) / minSide;
    cq.y = -cq.y;
    vec2 dq = abs(cq - focus);
    if (max(dq.x, dq.y) >= radii[k]) break;
    tier = k + 1;
    if (k < 2) {
      size *= 0.5;
      id = floor(px / size);
    }
  }

  // Viewfinder brackets around the smooth square, in the ramp's last stop,
  // shown only while the square sits on the body.
  float fine = coarse * 0.25;
  vec2 fpx = vec2(focus.x, -focus.y) * minSide + 0.5 * u_full;
  float corePx = radii[2] * minSide;
  vec2 lo = (ceil((fpx - corePx) / fine - 0.5)) * fine;
  vec2 hi = (floor((fpx + corePx) / fine - 0.5) + 1.0) * fine;
  float gap = 3.0;
  float arm = max(10.0, fine * 3.0);
  bool inBox = all(greaterThan(px, lo - gap - 3.0)) && all(lessThan(px, hi + gap + 3.0));
  bool inner = all(greaterThan(px, lo - gap - 1.0)) && all(lessThan(px, hi + gap + 1.0));
  bool nearCorner = (min(abs(px.x - lo.x), abs(px.x - hi.x)) < arm) && (min(abs(px.y - lo.y), abs(px.y - hi.y)) < arm);
  if (hi.x > lo.x && inBox && !inner && nearCorner && dfField(focus, h) > 0.2) {
    return dfStop(u_count);
  }

  float stops = float(u_count);
  if (tier == 3) {
    // Sampled from the pixel itself: the prelude's pointer lens bends p,
    // which would tear the core away from the cells around it.
    vec2 sq = (px + 0.5 - 0.5 * u_full) / minSide;
    sq.y = -sq.y;
    float x = dfField(sq, h) * stops;
    int i = int(floor(x));
    float f = smoothstep(0.0, 1.0, fract(x));
    return labMix(dfStop(i), dfStop(i + 1), f);
  }

  vec2 cellPx = (id + 0.5) * size;
  vec2 q = (cellPx - 0.5 * u_full) / minSide;
  q.y = -q.y;
  float x = dfField(q, h) * stops;
  ivec2 b = ivec2(mod(id, 4.0));
  float threshold = (BAYER_DF[b.y * 4 + b.x] + 0.5) / 16.0;
  int i = int(floor(x)) + (fract(x) > threshold ? 1 : 0);
  // Coarse cells read as a display: a hairline gap between lit cells, and a
  // faint unlit pixel at the centre of every empty one.
  vec2 local = px - id * size;
  if (i == 0) {
    vec2 dot_ = abs(local - (size * 0.5 - 1.0));
    bool lit = tier == 0 && max(dot_.x, dot_.y) < 1.0;
    return lit ? mix(u_bg, dfStop(1), 0.4) : u_bg;
  }
  if (tier == 0 && (local.x >= size - 1.0 || local.y >= size - 1.0)) {
    return mix(dfStop(i), u_bg, 0.35);
  }
  return dfStop(i);
}
`,wgsl:()=>import("./dither-field-H5ZXZZFE.js").then(e=>e.wgsl),label:"Dither field",name:"dither-field"};var V={defaults:{background:"#050507",blur:.5,colors:["#1d2a8f","#2f7bff","#ff7a3d","#ffe2c4"],dither:{cell:3,enabled:!1,levels:8},grain:.16,interaction:{pointer:.15,scroll:.1},loopSeconds:20,scale:1,seed:5,speed:.5,warp:.5},description:"A sweep of light behind fluted glass, every edge broken into fine teeth.",fallbackLayers:e=>["repeating-linear-gradient(90deg, rgb(255 255 255 / 0.05) 0 1px, transparent 1px 4.5%)",`linear-gradient(155deg, transparent 30%, ${s(e,40,60)}, transparent 72%)`],glsl:`
// The light behind the glass at q: intensity (x) and the column's core (y).
vec2 flLight(vec2 q, vec2 h, float mode, float side) {
  float soft = 0.5 + 0.9 * u_blur;
  float ribbon = 0.0;
  if (mode != 1.0) {
    // A ribbon sweeping corner to corner, bending with the flow.
    float a = -0.6 + (side - 0.5) * 0.9;
    vec2 dir = vec2(cos(a), sin(a));
    vec2 n = vec2(-dir.y, dir.x);
    float u = dot(q, dir);
    float v = dot(q, n) - 0.18 * sin(u * 2.2 + 1.3 * side) * h.y;
    v += 0.1 * flowNoise(vec2(u * 0.8, 0.2), 1.0);
    // Lit from above: a crisp bright lip, then a long fall into the dark.
    float w = 0.13 * soft;
    float lip = v > 0.0 ? exp(-v * v / (0.5 * w * w)) : exp(v / (1.4 * w));
    float glow = exp(-abs(v) / (5.0 * w));
    // A second, fainter fold under the first.
    float v2 = v + 0.3 + 0.06 * flowNoise(vec2(u * 0.7, 2.1), 2.0);
    float fold = 0.3 * (v2 > 0.0 ? exp(-v2 * v2 / (0.2 * w * w)) : exp(v2 / (2.0 * w)));
    ribbon = (0.95 * lip + 0.15 * glow + 0.75 * fold) * (0.8 + 0.2 * flowNoise(vec2(u * 1.5, 3.0), 3.0));
  }
  float column = 0.0;
  float core = 0.0;
  if (mode == 1.0) {
    // An arch: the top of a big soft disc rising from below, its rim lit
    // hardest at the crown and its body falling away into the dark.
    vec2 c = vec2((side - 0.5) * 1.1 * h.x, -1.35 * h.y) + vec2(0.06, 0.03) * drift(4.0);
    float radius = 1.05 * h.y + 0.3 * h.x * abs(side - 0.5);
    vec2 d = (q - c) * vec2(0.8, 1.0);
    float r = length(d);
    float x = r - radius + 0.03 * flowNoise(d * 1.4, 5.0);
    float crown = 0.45 + 0.55 * smoothstep(-0.2, 1.0, d.y / max(r, 1e-3));
    float w = 0.08 * soft;
    float rim = exp(-x * x / (w * w));
    float body = x < 0.0 ? exp(x / (0.3 * soft)) : exp(-x / (0.22 * soft));
    column = 0.85 * (0.5 * rim + 0.75 * body) * crown;
  } else if (mode == 2.0) {
    float x0 = (side - 0.5) * 0.9 * h.x + 0.04 * drift(4.0).x + 0.025 * flowNoise(vec2(0.5, q.y * 1.2), 7.0);
    float dx = q.x - x0;
    float tall = smoothstep(-1.2 * h.y, 0.3 * h.y, q.y + 0.15 * flowNoise(vec2(0.3, q.y), 5.0));
    core = exp(-dx * dx / (0.006 * soft)) * mix(0.6, 1.0, tall);
    column = 0.85 * core + 0.35 * exp(-abs(dx) / (0.16 * soft)) * mix(0.55, 1.0, tall);
  }
  return vec2(ribbon + column, core);
}

vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  float minSide = min(u_full.x, u_full.y);
  float mode = floor(fract(u_seed.x * 0.0731 + 0.5) * 3.0);
  float side = fract(u_seed.y * 0.0917 + 0.5);

  // Flutes: an uneven but monotonic stretch of x, so widths vary.
  float w = (2.0 * h.x) / (36.0 * u_scale);
  float x = p.x / w;
  float xf = x + 0.32 * sin(x * 0.61 + 1.7) + 0.18 * sin(x * 1.37 + 0.4);
  float u = fract(xf);
  float idx = floor(xf);
  // Progressive refraction: the image slides across each flute.
  float shift = (0.3 + 1.6 * u_warp) * w;
  vec2 q = p;
  q.x += (u - 0.5) * shift;
  // Each flute leans the image a touch, so diagonal edges turn into teeth.
  q.y += (u - 0.5) * shift * 0.35 * sin(idx * 2.3);

  vec2 light = flLight(q, h, mode, side);
  float t = clamp(pow(light.x, 1.15), 0.0, 1.0);
  vec3 col = ramp(t);
  col = labMix(col, paletteColor(u_count - 1), light.y * 0.85);
  vec3 lab = labMix(u_bg, col, smoothstep(0.0, 0.45, t));

  // Glass: the curve catches a thin highlight near one side of each flute
  // and darkens toward the seams.
  float seen = clamp(length(lab - u_bg) * 4.0, 0.0, 1.0);
  // Hand-made glass: each flute is a touch brighter or darker.
  lab.x *= 1.0 + 0.07 * seen * (fract(sin(idx * 12.9898) * 43758.5453) - 0.5);
  float curve = sin(u * 3.14159265);
  lab.x += (0.05 * exp(-pow((u - 0.28) / 0.07, 2.0)) - 0.04 * (1.0 - curve)) * mix(0.35, 1.0, seen);
  float seamPx = min(u, 1.0 - u) * w * minSide;
  lab.x -= 0.05 * (1.0 - smoothstep(0.0, 1.2, seamPx)) * seen;
  float lightBg = smoothstep(0.55, 0.85, u_bg.x);
  lab.x *= vignette(p, 0.3 * (1.0 - lightBg));
  return filmGrade(lab);
}
`,wgsl:()=>import("./fluted-NZSJ6PIR.js").then(e=>e.wgsl),label:"Fluted",name:"fluted"};var Y={defaults:{background:"#070505",blur:.55,colors:["#ffd8b4","#e0703b","#8a2c1d","#2b1015"],dither:{cell:3,enabled:!1,levels:8},grain:.5,interaction:{pointer:.25,scroll:.15},loopSeconds:16,scale:1,seed:7,speed:.6,warp:.55},description:"A grainy beam of light from one corner, brushed into the dark.",fallbackLayers:e=>[`radial-gradient(60% 45% at 18% 20%, ${r(e,0)} 0%, transparent 60%)`,`linear-gradient(150deg, ${s(e,0,70)}, transparent 85%)`],glsl:`
vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  // The light sits just outside the frame and throws a beam across it.
  float a = seedAngle();
  vec2 dir = vec2(cos(a), sin(a));
  vec2 across = vec2(-dir.y, dir.x);
  vec2 src = -dir * (abs(dir.x) * h.x + abs(dir.y) * h.y + 0.12);
  vec2 q = p - src;
  float u = dot(q, dir);
  float v = dot(q, across);

  float bend = 0.06 * sin(u * 1.4 + 0.6 * u_loop.x + a)
    + 0.12 * u_warp * flowNoise(vec2(u * 0.7, 1.3) * u_scale, 1.0);
  float width = (0.1 + 0.18 * u_blur) * (0.45 + 0.7 * u);
  float vb = v - bend;
  float beam = exp(-vb * vb / (width * width));
  // Brushed streaks: long along the beam, short across it.
  float streak = flowNoise(vec2(u * 0.8, vb * 9.0 / (0.45 + u_blur)) * u_scale, 2.0);
  // A wider, dimmer sheet behind it for depth.
  float vb2 = v + 0.3 - 0.5 * bend;
  float beam2 = exp(-vb2 * vb2 / (width * width * 4.0));
  float fall = exp(-u * 0.75);
  float source = exp(-dot(q, q) * 2.2);

  float intensity = (beam * (0.88 + 0.3 * streak) + 0.35 * beam2 * (0.8 + 0.3 * streak)) * fall * 1.5
    + 0.55 * source;
  float ti = 1.0 - exp(-1.6 * intensity);
  vec3 col = ramp(1.0 - ti);
  vec3 lab = labMix(u_bg, col, smoothstep(0.0, 0.75, ti));
  lab.x += 0.08 * max(intensity - 1.0, 0.0);
  lab.x *= vignette(p, 0.35);
  return filmGrade(lab);
}
`,wgsl:()=>import("./grain-DFAKTKMV.js").then(e=>e.wgsl),label:"Grain",name:"grain"};var X={defaults:{background:"#030306",blur:.4,colors:["#fff4ec","#ffb36b","#e2457a","#3d4dff"],dither:{cell:3,enabled:!1,levels:8},grain:.16,interaction:{pointer:.15,scroll:.1},loopSeconds:16,scale:1,seed:3,speed:.6,warp:.55},description:"A ring of light round a dark core, with a sharp inner rim and colour running round it.",fallbackLayers:e=>[`radial-gradient(circle at 50% 50%, transparent 24%, color-mix(in oklab, ${r(e,0)} 85%, transparent) 25%, color-mix(in oklab, ${r(e,1)} 60%, transparent) 30%, color-mix(in oklab, ${r(e,2)} 30%, transparent) 37%, transparent 52%)`,`radial-gradient(circle at 50% 50%, transparent 30%, color-mix(in oklab, ${r(e,3)} 22%, transparent) 40%, transparent 70%)`],glsl:`
// A thick torus of light: the inner edge is crisp, the body holds its
// brightness then rolls off into a wide haze. warp sets how lopsided the
// light is and how far the hue wanders round the ring; blur softens the
// rim and widens the haze.
float haloBody(float x, float soft, float width) {
  float edge = smoothstep(-soft, soft, x);
  float xo = max(x, 0.0) / width;
  float x4 = xo * xo * xo * xo;
  return edge / (1.0 + x4 * x4);
}

vec3 kindColor(vec2 p, vec2 uv) {
  float lightBg = smoothstep(0.55, 0.85, u_bg.x);
  vec2 h = frameHalf();
  // The seed picks a framing: centred, rising from the bottom edge, off to
  // one side, hanging in a top corner and cropped by the frame, or tilted
  // into an ellipse, as if seen at an angle, centred or low like a portal.
  float framing = floor(fract(u_seed.x * 0.0731 + 0.5) * 6.0);
  float side = sign(u_seed.y + 0.01);
  vec2 centre = vec2(0.0, 0.0);
  float radius = 0.19;
  float tilt = 0.0;
  float squash = 1.0;
  if (framing == 1.0) {
    centre = vec2(0.0, -0.56);
    radius = 0.3;
  } else if (framing == 2.0) {
    centre = vec2(0.34 * h.x * side, -0.02);
    radius = 0.2;
  } else if (framing == 3.0) {
    centre = vec2(-side * (h.x - 0.12), h.y - 0.1);
    radius = 0.3;
  } else if (framing == 4.0) {
    radius = 0.3;
    tilt = 0.22 * side;
    squash = 0.4;
  } else if (framing == 5.0) {
    centre = vec2(0.0, -0.3);
    radius = 0.44;
    tilt = 0.08 * side;
    squash = 0.28;
  }
  radius *= u_scale;

  // The hot side sways slowly round the ring.
  float swing = seedAngle() + 2.4 * u_loop.x;
  vec2 hotDir = vec2(sin(swing), cos(swing));

  vec2 d = rot2(tilt) * (p - centre);
  d.y /= squash;
  float r = length(d);
  vec2 dir = d / max(r, 1e-4);
  float x = r / radius - 1.0;

  float soft = 0.01 + 0.06 * u_blur;
  float width = 0.42 + 0.2 * u_blur;
  float hot = 0.5 + 0.5 * dot(dir, hotDir);
  float key = mix(1.0, 0.22 + 0.78 * hot * hot, 0.3 + 0.6 * u_warp);

  // Noise sampled on the unit circle (so it has no seam) drifts the hue
  // and, a little, the thickness round the ring.
  float around = flowNoise(dir * 0.8 + vec2(3.1, 0.0), 2.0);
  float body = haloBody(x, soft, width * (1.0 + 0.07 * u_warp * flowNoise(dir * 0.7, 1.0)));
  // A ghost exposure, nudged toward the hot side: a doubled, glassy rim.
  vec2 dg = d - hotDir * radius * 0.08;
  float xg = length(dg) / radius - 1.06;
  float ghost = smoothstep(-soft, soft, xg) * exp(-max(xg, 0.0) / (0.05 + 0.08 * u_blur));
  float haze = exp(-max(x, 0.0) / (0.6 + 0.8 * u_blur)) * smoothstep(0.0, width, x);
  // Faint tinted fog inside the core, so the dark has depth.
  float fog = (1.0 - smoothstep(-soft, soft, x)) * exp(x / 0.25);

  float glow = 0.95 * body * key + 0.3 * ghost * (0.3 + 0.7 * hot) + 0.12 * haze * (0.4 + 0.6 * key) + 0.12 * fog * (0.3 + 0.7 * hot);

  // Colour: the inner rim runs hot (colour 0), the body moves through the
  // palette outward, and the hue drifts round the ring.
  float depth = clamp(max(x, 0.0) / (width * 1.6), 0.0, 1.0);
  float t = clamp(0.12 + 0.45 * depth + 0.5 * u_warp * (0.5 + 0.5 * around) + 0.35 * (1.0 - hot), 0.0, 1.0);
  vec3 col = ramp(t);
  float rimLine = smoothstep(-soft, soft, x) * exp(-max(x, 0.0) / (0.06 + 0.1 * u_blur));
  col = labMix(col, paletteColor(0), rimLine * hot * 0.8);
  col = labMix(col, paletteColor(u_count - 1), fog * 0.6);

  vec3 lab = labMix(u_bg, col, clamp(glow, 0.0, 1.0));
  lab.x += 0.08 * max(glow - 0.85, 0.0) * (1.0 - lightBg);
  return filmGrade(lab);
}
`,wgsl:()=>import("./halo-OVH6FUYZ.js").then(e=>e.wgsl),label:"Halo",name:"halo"};var Z={defaults:{background:"#000000",blur:.35,colors:["#b4553a","#c98f8a","#6f8fb0","#3a1f33","#dfe8ff"],dither:{cell:3,enabled:!1,levels:8},grain:.12,interaction:{pointer:.15,scroll:.2},loopSeconds:24,scale:1,seed:7,speed:.6,warp:.5},description:"An event horizon over a void, with lensed light streaks and star flares.",fallbackLayers:(e,o)=>{let t=(a,l)=>`color-mix(in oklab, ${r(e,a)} ${l}%, transparent)`;return[`radial-gradient(1000px 79% at 46% 0%, ${o} 95%, transparent 100%)`,`radial-gradient(1030px 82% at 46% 0%, transparent 93%, ${t(2,45)} 96.5%, transparent 100%)`,`radial-gradient(14% 6% at 47% 98%, ${o} 0%, transparent 100%)`,`radial-gradient(20% 3% at 40% 90%, ${t(4,45)} 0%, transparent 100%)`,`radial-gradient(42% 8% at 16% 76%, ${t(0,75)} 0%, transparent 100%)`,`radial-gradient(38% 6% at 20% 86%, ${t(1,50)} 0%, transparent 100%)`,`radial-gradient(34% 12% at 86% 66%, ${t(1,70)} 0%, transparent 100%)`,`radial-gradient(30% 7% at 80% 84%, ${t(0,65)} 0%, transparent 100%)`,`linear-gradient(180deg, transparent 55%, ${t(3,70)} 100%)`]},glsl:`
vec3 hzCol(int i) { return u_colors[min(i, u_count - 1)]; }

// Sin-free lattice hash (Dave Hoskins), -1..1.
vec2 hzHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

// 2D gradient noise, roughly -0.7..0.7.
float hzNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hzHash(i), f);
  float b = dot(hzHash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hzHash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hzHash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Gradient noise with its analytic derivative: (value, d/dx, d/dy).
vec3 hzNoiseD(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  vec2 ga = hzHash(i);
  vec2 gb = hzHash(i + vec2(1.0, 0.0));
  vec2 gc = hzHash(i + vec2(0.0, 1.0));
  vec2 gd = hzHash(i + vec2(1.0, 1.0));
  float va = dot(ga, f);
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));
  float k = va - vb - vc + vd;
  float v = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;
  vec2 d = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd)
    + du * (u.yx * k + vec2(vb, vc) - va);
  return vec3(v, d);
}

// The loop point rotated by a per-layer angle: still periodic, out of phase.
vec2 hzLoop(float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * u_loop.x - s * u_loop.y, s * u_loop.x + c * u_loop.y);
}

// Sheet coordinates: stretched, drifting on the loop circle, seeded.
vec2 hzSheet(vec2 sp, vec2 freq, float layer) {
  return sp * freq + hzLoop(layer * 2.1) * vec2(0.9, 0.5) + u_seed * 0.37 + layer * 13.7;
}

// Height of the horizon at x, measured against grainient's hero: a wide well
// just right of centre, a gentle shelf on the left and a late climb on the
// right. Portrait frames sit the horizon lower.
float hzRim(float x, float portrait, float breathe) {
  float well = exp(-(x - 0.08) * (x - 0.08) * 4.5);
  float r = max(x - 0.4, 0.0);
  float shelf = -0.145 - 0.035 * (1.0 - smoothstep(-0.6, 0.0, x));
  return shelf - (0.19 + breathe) * well * (1.0 - 0.75 * portrait) + 0.65 * r * r - 0.11 * portrait;
}

// The void: black, with a cool haze bleeding up from the horizon and faint
// ripple rings inside it.
vec3 hzVoid(float inside, float sideGlow) {
  float haze = (exp(-inside * 30.0) * 0.2 + exp(-inside * 10.0) * 0.06) * sideGlow;
  float rings = sin(inside * 210.0 - 0.8 * hzLoop(2.5).y) * exp(-inside * 6.0);
  return vec3(haze * (1.0 + 0.22 * rings) + 0.005 * rings, hzCol(2).yz * haze * 0.55);
}

// Star flares: x in half-widths, y in half-heights, size.
const vec3 HZ_STARS[5] = vec3[5](
  vec3(-0.29, -0.71, 1.2),
  vec3(0.31, -0.88, 1.0),
  vec3(0.79, -0.8, 0.7),
  vec3(-0.53, -0.55, 0.5),
  vec3(0.15, -0.94, 0.45)
);

vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  float portrait = clamp((h.y / h.x - 0.65) / 1.2, 0.0, 1.0);
  float tilt = (fract(u_seed.x * 0.0193) - 0.5) * 0.1;
  float x = p.x - tilt;

  float breathe = 0.01 * hzLoop(0.7).x;
  float rimY = hzRim(x, portrait, breathe);
  float slope = (hzRim(x + 0.01, portrait, breathe) - rimY) * 100.0;
  float out_ = (rimY - p.y) / sqrt(1.0 + slope * slope); // > 0 in the light
  float sideGlow = 0.55 + 0.7 * smoothstep(0.15, 0.85, abs(p.x) / h.x);

  vec2 vq = (uv - 0.5) * vec2(1.0, 1.1);
  float vignette = 1.0 - 0.6 * dot(vq, vq);
  // Most of the frame is void: skip the light entirely there.
  if (out_ < -0.012) {
    vec3 lab = hzVoid(-out_, sideGlow);
    lab.x *= vignette;
    return lab + u_bg;
  }

  // The well: a dark funnel at the bottom centre.
  vec2 vp = vec2(-0.03 + tilt * 0.5, -0.91 * h.y);
  vec2 hq = (p - vp) / vec2(0.19, 0.068);
  float hd = length(hq);
  float landscape = 1.0 - portrait;

  // Deeper bands flatten toward the horizontal, like a ground plane.
  float rimMin = -0.32 - 0.11 * portrait;
  float yRef = mix(rimY, rimMin + (rimY - rimMin) * 0.3, smoothstep(0.0, 0.3, out_));
  float depth = max(yRef - p.y, 0.0);
  // Perspective: bands crowd toward the horizon and widen toward the viewer.
  float across = log(1.0 + depth * 7.0) * 0.32;
  float along = p.x;
  across += 0.035 * u_warp * sin(along * 3.1 + across * 9.0 + hzLoop(4.0).x * 2.0);

  // Near the well the bands dip and dive into it, like light bent by a
  // black hole.
  float wrap = (1.0 - smoothstep(0.9, 2.6, hd)) * landscape;
  across = max(across - 0.09 * wrap * smoothstep(0.0, 0.15, across), 0.0);
  along = mix(along, along * (1.0 + 0.8 * wrap), wrap);

  float sc = u_scale;
  vec2 f0 = vec2(1.0, 6.0) * sc;
  vec2 f1 = vec2(1.7, 14.0) * sc;
  float s0 = hzNoise(hzSheet(vec2(along, across), f0, 0.0));
  vec3 n1 = hzNoiseD(hzSheet(vec2(along + s0 * 0.45, across + s0 * 0.012), f1, 1.0));
  float s1 = n1.x;
  // Turbulence: slanted wisps that cross the bands and fray them, strongest
  // where the streaks climb on the right.
  float rise = smoothstep(0.1, 0.75, p.x / h.x);
  vec2 q2 = vec2(along, across + along * (0.08 + 0.3 * rise));
  float s2 = hzNoise(hzSheet(q2, vec2(2.0, 15.0) * sc, 2.0));

  float env = smoothstep(-0.012, 0.05, out_) * (0.75 + 0.25 * exp(-out_ * 3.0));
  // The well fades from the surrounding light into black over a wide falloff.
  float hole = mix(pow(1.0 - exp(-hd * hd * 0.38), 1.6), 1.0, portrait);
  float nearWell = (1.0 - smoothstep(1.0, 2.6, hd)) * landscape;
  // The band is quieter and darker just under the hero copy.
  float quiet = exp(-p.x * p.x * 9.0) * (1.0 - smoothstep(0.04, 0.16, out_)) * landscape;
  // The hottest light arches over the well and runs down its flanks.
  float flank = smoothstep(-0.7, 0.1, hq.y / max(hd, 1e-3));
  float ring = exp(-max(hd - 1.7, 0.0) * 1.3) * smoothstep(0.9, 2.0, hd) * flank * landscape;
  float side = 0.8 + 0.45 * smoothstep(0.1, 0.8, abs(p.x) / h.x);
  // The bottom corners fall away to teal-black.
  float corner = (1.0 - smoothstep(-h.y, -0.55 * h.y, p.y)) * smoothstep(0.35, 0.9, abs(p.x) / h.x) * landscape;
  side *= 1.0 - 0.55 * corner;

  float glow = clamp(0.5 + 0.9 * s0, 0.0, 1.0);
  float fray = (0.16 + 0.12 * rise) * (1.0 - 0.8 * portrait);
  float v = mix(s1 + 0.4 * s0 + fray * s2 + 0.08 * rise, 0.2 + 0.3 * s0, portrait * 0.85);
  // Long-exposure softness: a wide transfer, and the dark gaps between bands
  // are lifted so few near-black stripes remain inside the band.
  float streak = smoothstep(-0.4 - 0.3 * u_blur, 0.55 + 0.2 * u_blur, v);
  streak = mix(0.18, 1.0, streak);
  // Near the well the streaks smooth out so its outline stays a clean ellipse.
  streak = mix(streak, 0.7, nearWell * 0.25);
  // Where a streak brightens going down, its upper edge catches cool light
  // and the lower edge stays warm.
  float grad = n1.z * f1.y * 0.01;
  float coolEdge = smoothstep(0.02, 0.18, grad) * streak;
  float warmEdge = smoothstep(0.02, 0.18, -grad) * streak;

  // Colour: teal-black gaps, rust and rose bodies, steel-blue upper edges and
  // rim, pale blue-white on the brightest edges.
  vec3 gap = mix(hzCol(3), vec3(hzCol(2).x * 0.45, hzCol(2).yz * 0.7), 0.55 + 0.35 * s0);
  float warmPick = smoothstep(-0.05, 0.5, s1 - 0.5 * s0);
  vec3 body = mix(hzCol(0), hzCol(1), warmPick);
  body = mix(body, hzCol(0), warmEdge * 0.5);
  // Glow, not paint: part of the body falls to desaturated mauve and grey-blue.
  vec3 mauve = mix(body, hzCol(2), 0.25 + 0.25 * (1.0 - smoothstep(-0.3, 0.3, s0)));
  body = mix(body, vec3(mauve.x, mauve.yz * 0.7), (0.1 + 0.12 * rise) * landscape);
  vec3 col = mix(gap, body, smoothstep(0.2, 0.75, streak));
  // Portrait frames grade softly from steel at the edge through rose to rust.
  vec3 tall = mix(hzCol(2), mix(hzCol(1), hzCol(0), 0.6 * smoothstep(0.15, 0.55, out_)), smoothstep(0.03, 0.22, out_));
  col = mix(col, tall, portrait * 0.7);
  float rimness = exp(-max(out_, 0.0) * mix(24.0, 5.0, portrait));
  col = mix(col, hzCol(2), clamp(coolEdge * 0.6 + rimness * 0.9 + ring * 0.5, 0.0, 1.0));
  col = mix(col, gap, 0.65 * corner);
  col = mix(col, hzCol(4), clamp(coolEdge * coolEdge * 0.7 + ring * streak * 0.6 + rimness * glow * 0.25, 0.0, 1.0));

  // A broad bloom where the coarse sheet peaks.
  float bloom = smoothstep(0.2, 0.75, s0) * exp(-out_ * 2.5);
  float energy = env * hole * side * (1.0 - 0.45 * quiet) * (0.12 + 0.1 * rise + glow * glow * 0.3 + streak * 0.8 + coolEdge * 0.45 + bloom * 0.35)
    + env * ring * (0.45 + 1.35 * streak)
    + exp(-abs(out_ - 0.018) * 30.0) * (0.25 + 0.6 * glow) * env;
  energy = mix(energy, env * (0.75 + 0.35 * glow) * (1.0 - 0.5 * smoothstep(0.25, 0.8, out_)), portrait * 0.6);

  // Filmic tone: soft shoulder on lightness, chroma follows the light and
  // rolls off in the highlights.
  float lum = 1.0 - exp(-energy * 1.7);
  float L = col.x * lum * 1.22;
  // Darks desaturate toward black, like a film toe.
  float chroma = smoothstep(0.0, 0.45, lum) * mix(0.5, 1.0, smoothstep(0.25, 0.7, lum));
  vec3 lab = vec3(L, col.yz * chroma * mix(0.87, 1.0, portrait) * (1.0 - 0.45 * smoothstep(0.7, 1.0, L)));

  // Chromatic fringing: a thin cyan line on upper edges, red on lower edges.
  float mid = 4.0 * streak * (1.0 - streak);
  float fringe = mid * mid * mid * clamp(grad * 6.0, -1.0, 1.0) * lum * landscape;
  lab.yz -= fringe * (fringe > 0.0 ? vec2(0.045, 0.034) : vec2(0.03, 0.018));

  // The very peaks run to near-white, over tiny areas.
  float hot = smoothstep(1.2, 2.3, energy);
  lab = mix(lab, vec3(0.965, -0.004, -0.014), hot * 0.85);

  // The haze runs continuously across the edge and fades into the band.
  lab += hzVoid(max(-out_, 0.0), sideGlow) * exp(-max(out_, 0.0) * 30.0);

  // Star flares: a soft glow and core, long hair-fine horizontal flare and a
  // shorter vertical one. Pixels outside a star's reach skip it.
  for (int i = 0; i < 5; i++) {
    vec3 st = HZ_STARS[i];
    vec2 sd = p - vec2(st.x * h.x + tilt, st.y * h.y);
    float size = st.z;
    if (abs(sd.x) > 0.42 * size || abs(sd.y) > 0.22 * size) continue;
    float tw = clamp(0.7 + 0.5 * hzLoop(float(i) * 1.9 + 0.4).x, 0.15, 1.2);
    float r2 = dot(sd, sd);
    float core = exp(-r2 * 45000.0);
    float halo = exp(-r2 * 1800.0 / (size * size)) * 0.1 * smoothstep(0.6, 1.2, size);
    float fx = exp(-abs(sd.y) * 2200.0) * exp(-abs(sd.x) * 6.0 / size)
      * (1.0 - smoothstep(0.25, 0.42, abs(sd.x) / size));
    float fy = exp(-abs(sd.x) * 2200.0) * exp(-abs(sd.y) * 12.0 / size)
      * (1.0 - smoothstep(0.12, 0.22, abs(sd.y) / size));
    float star = (core * 1.4 + halo + (fx + fy) * 0.55) * size * tw * smoothstep(0.0, 0.08, out_);
    lab.x += star * 0.7;
    vec3 tint = i == 1 || i == 2 ? hzCol(4) : hzCol(1);
    lab.yz = mix(lab.yz, tint.yz * 0.6, clamp(star, 0.0, 1.0));
  }

  lab.x *= vignette;
  return lab + u_bg;
}
`,wgsl:()=>import("./horizon-DYVH7MQA.js").then(e=>e.wgsl),label:"Horizon",name:"horizon"};var J={defaults:{background:"#030308",blur:.35,colors:["#e9ecff","#8a8bff","#4b2bd6","#160c3a"],dither:{cell:3,enabled:!1,levels:8},grain:.16,interaction:{pointer:.15,scroll:.1},loopSeconds:20,scale:1,seed:1,speed:.5,warp:.5},description:"The lit edge of a planet or moon against the dark: a thin bright crest over a soft atmosphere.",fallbackLayers:e=>[`radial-gradient(120% 120% at 50% 130%, transparent 58%, color-mix(in oklab, ${r(e,3)} 50%, transparent) 61%, color-mix(in oklab, ${r(e,2)} 70%, transparent) 64%, color-mix(in oklab, ${r(e,1)} 75%, transparent) 66%, color-mix(in oklab, ${r(e,0)} 80%, transparent) 67%, transparent 70%)`],glsl:`
// A planet much larger than the frame, or a moon inside it, lit from one
// side. The light is three layers: a thin crest at the edge, a saturated
// band just inside it, and atmosphere glowing just outside. warp sets how
// far the light wraps round; blur softens every layer.
vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  // The seed picks the body: a planet whose top arc crosses the frame, a
  // horizon tilted across the frame, a moon lit from the side, a planet
  // hanging from the top edge, a planet filling one side, a planet crossing
  // the frame on a diagonal, or a small moon lit from behind, ringed in light.
  float framing = floor(fract(u_seed.x * 0.0731 + 0.5) * 7.0);
  float side = sign(u_seed.y + 0.01);
  float tilt = sin(seedAngle());
  float radius = 0.95;
  vec2 centre = vec2(0.0, -1.02 + (1.0 - u_scale) * 0.3);
  // Arcs are lit from a little off overhead, so one end of the arc fades.
  float lightAngle = 0.5 * tilt;
  float backlit = 0.0;
  if (framing == 1.0) {
    radius = 2.6;
    centre = vec2(0.9 * side, -2.62);
    lightAngle = side * 0.35 + 0.2 * tilt;
  } else if (framing == 2.0) {
    radius = 0.3;
    centre = vec2(0.18 * h.x * side, 0.0);
    lightAngle = side * 1.9 + 0.2 * tilt;
  } else if (framing == 3.0) {
    radius = 1.1;
    centre = vec2(0.2 * side, 1.38);
    lightAngle = 3.14159265 + 0.4 * tilt;
  } else if (framing == 4.0) {
    radius = 1.3;
    centre = vec2(-side * (h.x + 0.98), -0.15);
    lightAngle = side * (1.45 + 0.2 * tilt);
  } else if (framing == 5.0) {
    radius = 1.25;
    centre = vec2(-side * (h.x + 0.5), -h.y - 0.62);
    lightAngle = side * 0.78;
  } else if (framing == 6.0) {
    radius = 0.2;
    centre = vec2(0.0, 0.02);
    lightAngle = 0.4 * tilt;
    backlit = 1.0;
  }
  radius *= u_scale;
  lightAngle += 0.9 * u_loop.y;
  vec2 light = vec2(sin(lightAngle), cos(lightAngle));

  vec2 d = p - centre;
  float r = length(d);
  vec2 dir = d / max(r, 1e-4);
  float x = r - radius;

  // How squarely each point of the rim faces the light. warp lets the
  // light wrap further round the body.
  float facing = dot(dir, light);
  float lit = smoothstep(-0.15 - 0.6 * u_warp, 0.95, facing);
  lit *= lit;
  // A body lit from behind glows all the way round.
  lit = mix(lit, 0.45 + 0.55 * lit, backlit);

  // The atmosphere breathes and drifts along the arc.
  float shimmer = 0.7 + 0.3 * flowNoise(dir * 2.4 + vec2(x * 3.0, 0.0), 1.0);
  // A small backlit moon shows its whole rim, so keep its outline round.
  shimmer = mix(shimmer, 1.0, 0.7 * backlit);

  float b = 0.6 + 0.8 * u_blur;
  float inside = 1.0 - smoothstep(-0.006 * b, 0.004 * b, x);
  // Outside the edge: a pale atmosphere band that holds, then fades.
  // The atmosphere breathes with the loop phase: the same depth at any
  // speed above 0.5, fading out toward a still frame at speed 0, and never
  // thinner than 0.5x, so the falloff below never divides by zero.
  float loopR = length(u_loop);
  float breath = loopR > 1e-4 ? (u_loop.x / loopR) * min(loopR / 0.3, 1.0) : 0.0;
  float atmosW = 0.07 * b * (0.7 + 0.6 * u_warp) * (1.0 + 0.5 * breath);
  float xa = max(x, 0.0) / atmosW;
  float atmos = smoothstep(-0.02 * b, 0.0, x) / (1.0 + xa * xa * xa * xa);
  // The edge itself, in the saturated colour, then the body falling away.
  float edgeBand = exp(-pow(x / (0.03 * b), 2.0));
  float band = inside * exp(x / (0.09 * b));
  float deep = inside * exp(x / (0.35 * b));
  float halo = exp(-max(x, 0.0) / (0.18 * b));

  float glow = (0.6 * atmos * shimmer + 0.8 * edgeBand + 0.6 * band + 0.25 * deep + 0.12 * halo) * lit;

  // The atmosphere in colour 0, the edge in 1, the body through 2 to the last.
  vec3 col = labMix(paletteColor(2), paletteColor(u_count - 1), clamp(1.0 - band, 0.0, 1.0));
  col = labMix(col, paletteColor(1), clamp(edgeBand * 1.1 + 0.5 * band, 0.0, 1.0));
  col = labMix(col, paletteColor(0), clamp(0.8 * atmos * (0.75 + 0.25 * shimmer) * smoothstep(-0.004, 0.025 * b, x), 0.0, 1.0));

  vec3 lab = labMix(u_bg, col, clamp(glow, 0.0, 1.0));
  return filmGrade(lab);
}
`,wgsl:()=>import("./limb-LG5GIHFB.js").then(e=>e.wgsl),label:"Limb",name:"limb"};var Q={defaults:{background:"#06070c",blur:.5,colors:["#c13b3b","#140a0e","#2c55c5","#eef2ff"],dither:{cell:3,enabled:!1,levels:8},grain:.08,interaction:{pointer:.15,scroll:.15},loopSeconds:18,scale:1,seed:21,speed:.5,warp:.22},description:"A directional blend with bowed light lines and a soft light leak.",fallbackLayers:e=>[`linear-gradient(120deg, ${s(e)})`],glsl:`
vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  float angle = 0.6 + 1.2 * (fract(u_seed.y * 0.137) - 0.5) + 0.3 * u_loop.y;
  vec2 dir = vec2(cos(angle), sin(angle));
  vec2 perp = vec2(-dir.y, dir.x);
  float extent = abs(dir.x) * h.x + abs(dir.y) * h.y;
  float a = dot(p, dir) / extent;
  float b = dot(p, perp) / extent;
  // Iso-lines bow, as if the light wraps round a curved surface.
  float s = a + 0.16 * b * b - 0.05;
  s += u_warp * 0.18 * flowNoise(p * 0.6 * u_scale, 1.0);
  float t = clamp(0.5 + 0.5 * s * u_scale, 0.0, 1.0);
  vec3 lab = ramp(t * t * (3.0 - 2.0 * t));

  // Light leak: a soft streak along the iso-lines toward the bright end.
  float w = 0.1 + 0.18 * u_blur;
  float sd = (s - 0.5 + 0.08 * flowNoise(vec2(b * 1.1, 3.0), 2.0)) / w;
  float streak = exp(-sd * sd) * (0.65 + 0.35 * flowNoise(vec2(b * 2.2, 7.0), 3.0));
  lab.x += 0.12 * streak;
  lab.yz *= 1.0 - 0.3 * streak;

  // The dark end falls into shadow and the corners sink toward the base colour.
  float dark = 1.0 - smoothstep(0.55, 0.85, u_bg.x);
  lab.x *= mix(1.0, mix(0.72, 1.0, smoothstep(-1.2, 0.1, s)), dark);
  float corner = smoothstep(0.45, 1.15, length(p / h) * 0.75);
  lab = labMix(lab, u_bg, corner * 0.3);
  lab.x *= vignette(p, 0.2 * dark);
  return filmGrade(lab);
}
`,wgsl:()=>import("./linear-flow-XPQJD2AL.js").then(e=>e.wgsl),label:"Linear flow",name:"linear-flow"};var ee={defaults:{background:"#040407",blur:.55,colors:["#f4d9ff","#a77bff","#3b2a9e","#120d33"],dither:{cell:3,enabled:!1,levels:8},grain:.14,interaction:{pointer:.2,scroll:.15},loopSeconds:18,scale:1,seed:2,speed:.5,warp:.45},description:"Out-of-focus folds of light: a curved edge glowing against the dark.",fallbackLayers:e=>[`radial-gradient(120% 70% at 70% 100%, ${s(e,0,80)}, transparent 100%)`,`linear-gradient(160deg, transparent 40%, color-mix(in oklab, ${r(e,1)} 40%, transparent) 70%, transparent 95%)`],glsl:`
// Signed distance-ish to one fold: a broad S-curve across the frame.
// Negative on the lit side.
float mistFold(vec2 q, float layer, float amp) {
  float bend = amp * sin(q.x * 1.6 * u_scale + 0.9 * layer + 0.35 * u_loop.y)
    + (0.08 + 0.22 * u_warp) * flowNoise(vec2(q.x * 0.55 * u_scale, layer * 2.3), layer);
  return q.y - bend - 0.12 * q.x;
}

vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  float lightBg = smoothstep(0.55, 0.85, u_bg.x);
  float a = seedAngle();
  // Mostly near-horizontal folds; the seed tilts and flips them.
  float tilt = 0.55 * sin(a) + (cos(a) < 0.0 ? 3.14159265 : 0.0);
  vec2 q = rot2(tilt) * p;
  float x = q.x / max(h.x, 1e-3);

  // The fold drifts slowly up and down through the loop.
  float lift = 0.05 * flowNoise(vec2(0.21, 0.67), 7.0);
  float s = mistFold(q + vec2(0.0, lift), 1.0, 0.16);
  // Along-fold shading: long, soft streaks like light on satin.
  float sheen = flowNoise(vec2(q.x * 0.9 * u_scale, s * 4.0 / (0.5 + u_blur)), 2.0);

  // Lit side: the palette runs from the hot lip into its deep colours.
  float span = 0.45 + 0.35 * u_blur;
  float lit = clamp(-s / span, 0.0, 1.0);
  vec3 col = ramp(0.12 + 0.88 * pow(lit, 0.8));
  // Light spilling past the fold takes the second colour, not white.
  col = labMix(col, paletteColor(1), smoothstep(0.0, 0.2, s) * 0.8);
  float soft = 0.02 + 0.09 * u_blur;
  float side = 1.0 - smoothstep(-soft, soft, s);
  // Light falls off into the far side and fades deep into the lit side.
  float spill = exp(-max(s, 0.0) / (0.05 + 0.18 * u_blur));
  float depth = exp(-max(-s - 0.1, 0.0) / (0.35 + 0.45 * u_blur));
  float amount = max(side * mix(0.3, 1.0, depth), spill * 0.7);
  amount *= 0.86 + 0.18 * sheen;
  // Depth of field: the fold sharpens near the middle of the frame.
  amount *= 1.0 - 0.25 * smoothstep(0.6, 1.2, abs(x));

  vec3 lab = labMix(u_bg, col, clamp(amount, 0.0, 1.0));
  // The lip: bright on dark grounds, an ink crease on light ones.
  float lipW = 0.02 + 0.06 * u_blur;
  // The lip sits just inside the lit side, so it reads as light catching the
  // fold rather than a line drawn on it.
  float sl = s + 0.6 * lipW;
  float lip = exp(-sl * sl / (lipW * lipW)) * (0.75 + 0.25 * sheen);
  vec3 hot = vec3(min(1.0, paletteColor(0).x + 0.05), paletteColor(0).yz * 0.85);
  vec3 ink = vec3(paletteColor(u_count - 1).x * 0.6, paletteColor(u_count - 1).yz);
  lab = labMix(lab, mix(hot, ink, lightBg), clamp(lip * (0.22 + 0.05 * lightBg), 0.0, 1.0));

  // A second, fainter fold behind, offset so the frame has depth.
  float s2 = mistFold(q * vec2(0.8, 1.0) + vec2(0.7, -0.32 + lift), 4.0, 0.22);
  float back = (1.0 - smoothstep(-0.25, 0.08 + 0.1 * u_blur, s2)) * exp(-max(-s2, 0.0) / 0.5);
  back *= 1.0 - side;
  lab = labMix(lab, ramp(0.55), clamp(back * 0.35 * (0.8 + 0.2 * sheen), 0.0, 1.0));

  lab.x *= vignette(p, 0.25 * (1.0 - lightBg));
  return filmGrade(lab);
}
`,wgsl:()=>import("./mist-4F5H4D2K.js").then(e=>e.wgsl),label:"Mist",name:"mist"};var te={defaults:{background:"#f4f3f1",blur:.55,colors:["#7a3cff","#ff4fb8","#3d6bff"],dither:{cell:3,enabled:!1,levels:8},grain:.05,interaction:{pointer:.2,scroll:0},loopSeconds:20,scale:1,seed:4,speed:.5,warp:.5},description:"Soft colour drifting behind a wall of square glass blocks, each a small lens.",fallbackLayers:e=>e.map((o,t)=>`radial-gradient(${24-3*t}% ${30-3*t}% at ${34+16*t}% ${50-8*(t%2)}%, ${o}, transparent 72%)`),glsl:`
// The light behind the glass: one soft, elongated blob per colour.
vec3 pgScene(vec2 q, vec2 h) {
  vec3 lab = u_bg;
  float lightBg = smoothstep(0.55, 0.85, u_bg.x);
  float a0 = seedAngle();
  float size = (0.17 + 0.1 * u_blur);
  // The cluster leans off centre, toward an edge picked by the seed.
  vec2 lean = vec2(cos(a0 + 1.3), sin(a0 + 1.3)) * vec2(0.32, 0.3) * h;
  for (int i = 0; i < 6; i++) {
    if (i >= u_count) break;
    float fi = float(i);
    // A loose arc of blobs, big first, each drifting on its own circle.
    float a = a0 + fi * 2.1;
    vec2 base = vec2(cos(a) * 0.42 * h.x, sin(a) * 0.3 * h.y) * min(fi, 1.0) * (0.8 + 0.25 * fi);
    vec2 c = lean + base + vec2(0.55, 0.38) * drift(fi + 1.0);
    float r = size * (1.0 - 0.5 * min(fi, 1.0) / (1.0 + 0.4 * fi)) * mix(1.0, 1.15, lightBg);
    vec2 d = rot2(a * 0.5 + 0.4 * fi) * (q - c);
    d *= vec2(0.62, 1.0);
    float k = dot(d, d) / (r * r);
    float w = exp(-k * (1.3 - 0.6 * u_blur));
    // A brighter, shifted rim, the way colour pools at a blob's edge.
    vec3 col = paletteColor(i);
    vec3 rim = labMix(col, paletteColor(i + 1), 0.55);
    col = labMix(col, rim, smoothstep(0.15, 0.9, k) * 0.7);
    lab = labMix(lab, col, clamp(w * 1.15, 0.0, 1.0));
  }
  return lab;
}

// How far the palette stands from the background. Clear glass over a plain
// ground is invisible, so with nothing to bend the wall disappears and a
// flat palette renders flat.
float pgGlass() {
  float most = 0.0;
  for (int i = 0; i < 6; i++) {
    if (i >= u_count) break;
    most = max(most, length(u_colors[i] - u_bg));
  }
  return clamp(most * 7.0, 0.0, 1.0);
}

// Lightness of the light behind the glass, for a block's shading to face.
float pgLight(vec2 q, vec2 h) {
  return pgScene(q, h).x;
}

vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  float minSide = min(u_full.x, u_full.y);
  float lightBg = smoothstep(0.55, 0.85, u_bg.x);
  // Whole pixels per block, so the grid is crisp at any size.
  float block = max(8.0, floor(minSide * 0.072 / u_scale + 0.5));
  vec2 px = uv * u_full;
  // Centre the grid on the frame.
  vec2 g = px - 0.5 * u_full;
  vec2 id = floor(g / block);
  vec2 inPx = g - id * block;
  vec2 lp = inPx / block - 0.5;
  lp.y = -lp.y;
  vec2 c = (id + 0.5) * block / minSide;
  c.y = -c.y;
  vec2 ci = interact(c);
  float cell = block / minSide;

  // Each block holds one clear tone, the light behind its centre, so the
  // wall reads as crisp cells rather than a smudge. Inside, the block is a
  // small lens: it shows the patch behind it squeezed (warp 0.5) or flipped
  // (warp 1), which keeps every cell's edge distinct from its neighbour's.
  vec3 tone = pgScene(ci, h);
  float lens = mix(0.6, -0.9, u_warp);
  vec3 seenThrough = pgScene(ci + 1.6 * cell * lens * lp, h);
  vec3 lab = labMix(tone, seenThrough, 0.55);

  // Which way the light brightens across this block: the side facing it
  // catches the bevel, the far side falls into shade.
  float e = 0.75 * cell;
  vec2 grad = vec2(
    pgLight(ci + vec2(e, 0.0), h) - pgLight(ci - vec2(e, 0.0), h),
    pgLight(ci + vec2(0.0, e), h) - pgLight(ci - vec2(0.0, e), h)
  );
  float slope = length(grad);
  vec2 toLight = normalize(mix(vec2(-0.7071, 0.7071), grad / max(slope, 1e-4), smoothstep(0.002, 0.03, slope)));

  // How much light this block passes, against the bare background.
  float glow = clamp((tone.x - u_bg.x) * mix(3.0, -3.0, lightBg), 0.0, 1.0);
  // Unlit blocks still show as faint glass, so the wall reads edge to edge.
  float glass = pgGlass();
  float lit = max(glow, mix(0.18, 0.35, lightBg) * glass);

  // A convex block: brighter toward the light, falling off to its rim.
  float r = max(abs(lp.x), abs(lp.y));
  float facing = dot(lp, toLight) / 0.5;
  lab.x += lit * (0.05 * facing - 0.07 * smoothstep(0.22, 0.5, r)) * mix(1.0, 0.5, lightBg);
  // A broad sheen where the lens focuses the light, toward its source.
  vec2 spot = lp - 0.18 * toLight;
  lab.x += glow * 0.05 * exp(-dot(spot, spot) * 9.0) * mix(1.0, 0.4, lightBg);

  // Bevel: a bright lip on the edges that face the light, shade opposite.
  vec2 fromEdge = min(inPx, block - inPx);
  float edgePx = min(fromEdge.x, fromEdge.y);
  float lipWidth = max(1.5, block * 0.07);
  float lip = 1.0 - smoothstep(0.0, lipWidth, edgePx);
  vec2 side = abs(lp.x) > abs(lp.y) ? vec2(sign(lp.x), 0.0) : vec2(0.0, sign(lp.y));
  float toward = dot(side, toLight);
  lab.x += lip * lit * (toward > 0.0 ? 0.11 * toward : 0.06 * toward) * mix(1.0, 0.45, lightBg);

  // Glass blocks are pressed with a recessed inner face: a thin ring a
  // third of the way in, shaded on the side toward the light.
  float ringPx = abs(r - 0.32) * block;
  float ring = 1.0 - smoothstep(0.0, max(1.0, block * 0.022), ringPx);
  float inner = dot(side, toLight);
  lab.x += ring * lit * (0.03 - 0.07 * inner) * mix(1.0, 0.5, lightBg);

  // Grout: a dark seam between blocks, a little wider on big blocks.
  float grout = max(1.0, block * 0.03);
  float seam = 1.0 - smoothstep(grout - 0.5, grout + 0.5, edgePx);
  lab = labMix(lab, u_bg * vec3(mix(0.55, 0.9, lightBg), 1.0, 1.0), seam * glass * mix(0.85, 0.5, lightBg));

  // Where the light is strongest it blooms past the glass and over the
  // grout, so the bright cells glow instead of sitting flat.
  vec2 q = interact(vec2(g.x, -g.y) / minSide);
  vec3 halo = pgScene(q, h);
  float bloom = clamp((halo.x - u_bg.x) * mix(1.0, -1.0, lightBg), 0.0, 1.0);
  lab = labMix(lab, halo, 0.32 * bloom * bloom * (1.0 - lightBg));
  return filmGrade(lab);
}
`,label:"Pixel glass",name:"pixel-glass",wgsl:()=>import("./pixel-glass-Y7SZZP26.js").then(e=>e.wgsl)};function Be(e){let o=Math.max(1,e.length-1);return e.map((t,a)=>`color-mix(in oklab, ${t} ${Math.round(45-30*a/o)}%, transparent) ${(29+40*a/o).toFixed(1)}%`).join(", ")}var oe={defaults:{background:"#020204",blur:.45,colors:["#f3f1ff","#9db4ff","#5a46cb","#1d1240"],dither:{cell:3,enabled:!1,levels:8},grain:.14,interaction:{pointer:.2,scroll:.1},loopSeconds:14,scale:1,seed:11,speed:.6,warp:.5},description:"An eclipse: light spilling round a dark disc, with a corona and god rays.",fallbackLayers:e=>[`radial-gradient(42% 58% at 50% 82%, transparent 54%, color-mix(in oklab, ${r(e,0)} 80%, transparent) 58%, color-mix(in oklab, ${r(e,1)} 45%, transparent) 64%, transparent 82%)`,`radial-gradient(84% 116% at 50% 82%, transparent 27%, ${Be(e)}, transparent 85%)`],glsl:`
vec3 kindColor(vec2 p, vec2 uv) {
  // Light-mode backgrounds get a glowing halo instead of a dark disc.
  float lightBg = smoothstep(0.55, 0.85, u_bg.x);
  // The seed picks a layout: a disc rising from the bottom edge, a full ring
  // in the frame, or the rim of a planet low and off to one side.
  vec2 h = frameHalf();
  float framing = fract(u_seed.x * 0.0731 + 0.5);
  float radius = 0.34;
  vec2 centre = vec2(0.0, -0.3);
  float spread = 0.28;
  if (framing > 0.7) {
    radius = 0.75;
    centre = vec2(0.35 * h.x * sign(u_seed.y), -0.95);
    spread = 0.1;
  } else if (framing > 0.4) {
    radius = 0.26;
    centre = vec2(0.0, -0.04);
    spread = 0.6;
  }
  radius /= u_scale;
  centre.y -= 0.04 * flowNoise(vec2(0.3, 0.7), 1.0);
  vec2 d = p - centre;
  float r = length(d);
  vec2 dir = d / max(r, 1e-4);
  float x = r - radius;
  float xo = max(x, 0.0);
  float soft = (0.01 + 0.045 * u_blur) * (1.0 + 5.0 * lightBg);

  // The source sits behind the disc, so the top of the rim is lit hardest.
  // The source drifts round behind the disc, so the hot side wanders.
  float sweep = 1.3 * u_loop.x;
  vec2 up = vec2(sin(sweep), cos(sweep));
  float facing = 0.5 + 0.5 * dot(dir, up) * smoothstep(0.0, radius, r);
  float key = mix(spread, 1.0, facing * facing);

  // God rays: noise sampled on the unit circle, so they radiate with no seam,
  // fine in angle and drifting slowly outward in radius.
  float rays = 0.5 + 0.5 * flowNoise(dir * 2.6 - vec2(0.0, r * 0.35), 2.0);
  rays = mix(rays, 0.5 + 0.5 * flowNoise(dir * 6.0 - vec2(r * 0.5, 0.0), 3.0), 0.35);
  rays = mix(1.0, 0.25 + 1.3 * rays * rays, u_warp);

  float rim = exp(-xo / soft);
  float corona = exp(-xo / (0.05 + 0.1 * u_blur));
  float haze = exp(-xo / (0.3 + 0.3 * u_blur));
  // A thin halo ring just outside the rim, in the palette's middle colour.
  float ringD = (x - 0.05 - 0.04 * u_blur) / ((0.018 + 0.03 * u_blur) * (1.0 + 2.0 * lightBg));
  float ring = exp(-ringD * ringD);
  float glow = (rim + 0.5 * corona * (0.6 + 0.4 * rays) + (0.4 + 0.35 * lightBg) * haze * mix(1.0, rays, 0.8) + 0.35 * ring) * key;

  // Inside: the occluder, with a hairline of light just inside its edge.
  float inside = 1.0 - smoothstep(-soft * 0.5, soft * 0.5, x);
  float innerRim = exp(min(x, 0.0) / (0.01 + 0.12 * lightBg));
  glow = mix(glow, (0.3 * innerRim + 0.06) * key, inside * (1.0 - 0.85 * lightBg));

  // Palette runs outward from the rim; the hottest light bleaches toward white.
  // A dark disc hides the rim, so colour can rise sharply there; a light
  // glow has no disc edge to hide behind, so it eases in.
  float reach = clamp(xo / (0.6 + 0.3 * u_blur), 0.0, 1.0);
  float t = mix(sqrt(reach), smoothstep(0.0, 0.7, reach), lightBg);
  vec3 col = ramp(t);
  vec3 hot = vec3(min(1.0, paletteColor(0).x + 0.06), paletteColor(0).yz * 0.4);
  col = labMix(col, hot, rim * (1.0 - inside) * (0.45 + 0.5 * lightBg));
  col = labMix(col, paletteColor(2), ring * (0.6 - 0.35 * lightBg) * (1.0 - rim));

  vec3 base = u_bg;
  base.x *= mix(1.0, mix(0.35, 1.0, lightBg), inside);
  vec3 lab = labMix(base, col, clamp(glow, 0.0, 1.0));
  lab.x += 0.1 * max(glow - 0.9, 0.0);
  lab.x *= vignette(p, 0.3 * (1.0 - lightBg));
  return filmGrade(lab);
}
`,wgsl:()=>import("./radial-glow-L7DKHF57.js").then(e=>e.wgsl),label:"Radial glow",name:"radial-glow"};var ae={defaults:{background:"#ffffff",blur:.35,colors:["#ff3d9a","#ff8a3d","#ffc83d","#7a5cff"],dither:{cell:3,enabled:!1,levels:8},grain:.06,interaction:{pointer:.15,scroll:.25},loopSeconds:22,scale:1,seed:2,speed:.6,warp:.45},description:"Twisting ribbons with stripes of colour across their width.",fallbackLayers:e=>[`linear-gradient(155deg, transparent 30%, ${s(e,32,52)}, transparent 54%)`,`linear-gradient(28deg, transparent 52%, color-mix(in oklab, ${r(e,1)} 60%, transparent) 58%, transparent 66%)`],glsl:`
// cos(a - angle), where cs = (cos, sin)(angle); turnSin is its sine twin.
float ribbonCos(float a, vec2 cs) {
  return cos(a) * cs.x + sin(a) * cs.y;
}

// Draws one ribbon over lab. far is 0 for the near ribbon, 1 for the far one.
vec3 ribbonLayer(vec3 lab, vec2 p, float angle, float offset, float layer, float far, float ph, vec2 t1, vec2 t2, float lightBg) {
  vec2 q = rot2(angle) * p * u_scale;
  float s = q.x;
  float amp = 0.1 + 0.12 * u_warp;
  float a1 = 1.5 * s + layer + 2.0 * ph;
  float a2 = 2.9 * s + 2.0 * layer - ph;
  float wobble = 0.03 * flowNoise(vec2(s * 0.6, layer), layer);
  float centre = offset + amp * turnSin(a1, t1) + 0.04 * turnSin(a2, t2) + wobble;
  float dc = amp * 1.5 * ribbonCos(a1, t1) + 0.116 * ribbonCos(a2, t2);
  float dist = (q.y - centre) / sqrt(1.0 + dc * dc);

  // Twist: the strip turns about its centre line as it travels.
  float twist = (0.6 + 1.1 * u_warp) * s + 1.7 * layer + 0.6 + 1.3 * ph;
  float turn = ribbonCos(twist, t1);
  float facing = abs(turn);
  float width = (0.23 - 0.08 * far) * (0.12 + 0.88 * facing) + 0.002;
  float u = dist / width;
  // Which face we see, softened so the flip at edge-on has no seam.
  float side = turn / (facing + 0.12);

  // Focus drifts along the ribbon: crisp in places, soft in others.
  float focus = smoothstep(-0.4, 0.8, sin(0.9 * s + 1.3 * layer + 0.5 - ph));
  float px = u_scale / min(u_full.x, u_full.y);
  float soft = 1.5 * px + (0.004 + 0.05 * u_blur) * (1.0 - focus) + 0.04 * far * (0.4 + u_blur);
  float alpha = 1.0 - smoothstep(width - soft, width + soft, abs(dist));

  // Colour runs across the width; the back of the strip reads the other way.
  float slide = 0.22 * sin(0.8 * s + 2.3 * layer + ph);
  float across = clamp(0.5 + 0.5 * u * side + slide, 0.0, 1.0);
  vec3 col = ramp(across);
  col = labMix(col, u_bg, 0.18 * (1.0 - smoothstep(-0.6, 0.0, side)) + 0.25 * far);
  // A soft highlight across the slight curl of the strip, stronger face-on.
  float curl = exp(-pow((u * side - 0.25) / 0.45, 2.0)) * facing;
  col.x += (0.07 - 0.05 * lightBg) * curl;
  // The strip's face turns toward and away from a light above the viewer.
  float lit = abs(0.85 * turn - 0.5 * turnSin(twist, t1));
  col.x *= mix(mix(0.62, 0.84, lightBg), 1.04, lit);
  // Threads parallel to the edges, only where the ribbon is in focus.
  col.x += 0.024 * (1.0 - u_blur) * focus * facing * sin(u * 120.0) * (1.0 - far);
  // Bright edges, as on a thin sheet of glass.
  float edge = smoothstep(0.7, 1.0, abs(u)) * facing;
  col = labMix(col, labMix(ramp(1.0 - across), vec3(1.0, 0.0, 0.0), 0.5 - 0.5 * lightBg), 0.35 * edge);

  float opacity = mix(0.97, 0.88, lightBg) - 0.3 * far;
  // On a dark ground the ribbon lights the air around it.
  float halo = exp(-max(abs(dist) - width, 0.0) / (0.03 + 0.08 * u_blur)) * (1.0 - lightBg);
  lab = labMix(lab, col, 0.22 * halo * opacity);
  lab = labMix(lab, col, alpha * opacity);
  // Edge-on, the strip collapses to a bright crease.
  float crease = exp(-pow(dist / (0.003 + soft), 2.0)) * pow(1.0 - facing, 6.0);
  vec3 hot = labMix(ramp(0.5), vec3(1.0, 0.0, 0.0), 0.6 - 0.6 * lightBg);
  lab = labMix(lab, hot, clamp(crease * opacity, 0.0, 1.0));
  return lab;
}

vec3 kindColor(vec2 p, vec2 uv) {
  float sa = seedAngle();
  vec2 t1 = loopTurn();
  vec2 t2 = vec2(t1.x * t1.x - t1.y * t1.y, 2.0 * t1.x * t1.y);
  float lightBg = smoothstep(0.55, 0.75, u_bg.x);
  float a0 = 0.5 * sin(sa) + 0.25;
  float a1 = a0 - (0.85 + 0.35 * cos(sa * 1.3));
  vec3 lab = u_bg;
  lab = ribbonLayer(lab, p, a1, -0.08 * sin(sa * 1.7), 3.0, 1.0, sa * 1.7, t1, t2, lightBg);
  lab = ribbonLayer(lab, p, a0, 0.06 * cos(sa * 2.1), 1.0, 0.0, sa * 1.7, t1, t2, lightBg);
  return filmGrade(lab);
}
`,wgsl:()=>import("./ribbon-2JIU5YL2.js").then(e=>e.wgsl),label:"Ribbon",name:"ribbon"};var re={defaults:{background:"#030306",blur:.5,colors:["#fff1e2","#ff8a3d","#a3301a","#2a0d0a"],dither:{cell:3,enabled:!1,levels:8},grain:.12,interaction:{pointer:.15,scroll:.15},loopSeconds:16,scale:1,seed:4,speed:.6,warp:.3},description:"A glow rising from past the edge of the frame, like light over a horizon.",fallbackLayers:(e,o)=>[`radial-gradient(90% 70% at 50% 108%, ${r(e,0)} 0%, ${s(e,22,70)}, ${o} 100%)`],glsl:`
vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  float lightBg = smoothstep(0.55, 0.85, u_bg.x);
  // The seed picks where the light sits: below the frame (most seeds),
  // above it, or past a lower corner. A second digit stacks one or two
  // brighter lips inside the dome, like light caught on layered haze.
  float placement = fract(u_seed.x * 0.0619 + 0.13);
  float angle = 0.0;
  if (placement > 0.85) {
    angle = 3.14159265;
  } else if (placement > 0.7) {
    angle = 0.62;
  } else if (placement > 0.55) {
    angle = -0.62;
  }
  float lips = floor(fract(u_seed.y * 0.0377 + 0.31) * 3.0);
  vec2 q = rot2(angle) * p;
  float reach = abs(cos(angle)) * h.y + abs(sin(angle)) * h.x;

  // A wide dome whose crest sits inside the frame. Small scales make it so
  // large that only its upper ramp shows: a whole-frame sky.
  float radius = 0.62 / u_scale;
  radius *= 1.0 + 0.14 * flowNoise(vec2(0.37, 0.91), 1.0);
  vec2 centre = vec2(0.5 * flowNoise(vec2(1.7, 0.3), 2.0), -reach - 0.3 * radius + 0.1 * u_loop.y);
  vec2 d2 = (q - centre) * vec2(0.62, 1.0);
  float r = length(d2);
  float x = q.x / max(h.x, 1e-3);

  // The horizon undulates; warp sets how much.
  float ripple = 0.06 * flowNoise(vec2(q.x * 0.9, 0.5), 3.0)
    + 0.015 * flowNoise(vec2(q.x * 2.0, 4.5), 4.0);
  float d = r - radius + u_warp * ripple;

  // Falloff: soft at the crest, softer still toward the sides, like a lens
  // that loses focus away from the centre.
  float fall = (0.07 + 0.32 * u_blur) * (1.0 + 0.7 * x * x) * (0.7 + 0.3 * radius);
  float outside = max(d, 0.0);
  float glow = exp(-outside / fall);
  // Inside the dome the light heats toward its source past the edge.
  float inner = (0.12 + 0.2 * u_blur) * max(1.0, radius);
  float t = d < 0.0 ? 0.4 * exp(d / inner) : 0.4 + 0.6 * (1.0 - exp(-outside / (1.8 * fall)));
  vec3 col = ramp(t);

  // A bright lip on the horizon, then stacked lips inside it.
  float lipW = 0.025 + 0.07 * u_blur;
  float lip = exp(-d * d / (lipW * lipW));
  float stack = 0.0;
  for (int i = 1; i < 3; i++) {
    if (float(i) > lips) break;
    float off = d + float(i) * (0.06 + 0.05 * u_blur) * (0.8 + 0.4 * radius);
    off += 0.02 * u_warp * flowNoise(vec2(q.x * 1.4, float(i) * 3.1), 5.0 + float(i));
    stack += exp(-off * off / (lipW * lipW * 0.8)) * (1.0 - 0.25 * float(i));
  }
  vec3 hot = vec3(min(1.0, paletteColor(0).x + 0.05), paletteColor(0).yz * 0.6);
  col = labMix(col, hot, clamp((lip * 0.28 + stack * 0.45) * (1.0 - 0.6 * lightBg), 0.0, 1.0));
  // Each stacked lip is a thin band of brighter haze over the dome.
  col.x += 0.05 * stack * (1.0 - lightBg);

  vec3 lab = labMix(u_bg, col, glow);
  // Faint haze over the dark half so it never reads as flat black.
  float haze = exp(-outside / (0.7 + 0.7 * u_blur)) * (1.0 - glow);
  lab = labMix(lab, ramp(0.8), 0.24 * haze * (1.0 - lightBg));
  lab.x *= vignette(p, 0.25 * (1.0 - lightBg));
  return filmGrade(lab);
}
`,wgsl:()=>import("./rise-UVLWSKYT.js").then(e=>e.wgsl),label:"Rise",name:"rise"};var le={defaults:{background:"#030308",blur:.3,colors:["#3b3fd8","#f3d6c0","#8a7bff"],dither:{cell:3,enabled:!1,levels:8},grain:.08,interaction:{pointer:.15,scroll:.2},loopSeconds:24,scale:1,seed:4,speed:.6,warp:.4},description:"A draped sheet of silk with lit folds and a bright hem.",fallbackLayers:e=>[`linear-gradient(172deg, transparent 30%, color-mix(in oklab, ${r(e,1)} 60%, transparent) 36%, color-mix(in oklab, ${r(e,0)} 70%, transparent) 44%, transparent 85%)`,`radial-gradient(70% 40% at 45% 45%, color-mix(in oklab, ${r(e,2)} 35%, transparent), transparent 70%)`],glsl:`
// Distance across the sheet, in fold units: constant along each fold.
float silkPhase(vec2 q, vec2 t1, vec2 t2, float ph) {
  float x = q.x;
  float centre = 0.075 * turnSin(1.25 * x + 0.7 + ph, t1) + 0.05 * turnSin(2.7 * x - 1.9 + 2.0 * ph, t2);
  float spread = 1.0 + 0.22 * turnSin(1.6 * x + 2.1 - ph, t1) + 0.3 * sin(0.9 * x + 4.0 + 3.0 * ph);
  float twist = flowNoise(vec2(x * 0.5, q.y * 0.8), 2.0);
  return (q.y - centre) * spread + (0.02 + 0.07 * u_warp) * twist;
}

vec3 kindColor(vec2 p, vec2 uv) {
  float sa = seedAngle();
  // The seed picks the drape: its tilt, height, fold size, and whether it
  // hangs from above or rises from below.
  float tilt = 0.4 * sin(sa);
  vec2 q = rot2(tilt) * p;
  q.y -= 0.04 + 0.16 * cos(sa * 1.7);
  q.y *= fract(sa * 0.91) > 0.66 ? -1.0 : 1.0;
  float ph = sa * 2.3;
  vec2 t1 = loopTurn();
  vec2 t2 = vec2(t1.x * t1.x - t1.y * t1.y, 2.0 * t1.x * t1.y);

  float e = 0.0025;
  float v = silkPhase(q, t1, t2, ph);
  vec2 grad = vec2(silkPhase(q + vec2(e, 0.0), t1, t2, ph) - v, silkPhase(q + vec2(0.0, e), t1, t2, ph) - v) / e;

  // Two scales of fold: a broad swell of the whole sheet, and fine strands
  // that gather into bundles along it.
  float x = q.x;
  float bend = 0.45 * turnSin(1.1 * x + 0.4 + ph, t1) + 0.2 * sin(2.3 * x + 1.0 - ph);
  float f1 = 5.5 * u_scale * (0.8 + 0.45 * fract(sa * 1.37));
  float phi1 = v * f1 + bend;
  vec2 slope = 0.7 * cos(phi1) * grad * f1;
  vec3 n = normalize(vec3(-slope, 1.0));

  // Lit like a studio shot: the folds reflect a sharp key, a broad fill and a
  // dimmer bounce below, plus a little diffuse light.
  vec3 light = normalize(vec3(0.3 * cos(sa * 2.3), 0.85, 0.4));
  float diffuse = 0.5 + 0.5 * dot(n, light);
  diffuse *= diffuse;
  vec2 r = 2.0 * n.z * n.xy;
  float w = mix(0.07, 0.3, u_blur);
  float key = exp(-pow((r.y - 0.42) / w, 2.0));
  float bounce = exp(-pow((r.y + 0.35) / (1.6 * w), 2.0));
  // A broad, softer fill band, so the body between the crests has sheen too.
  float fill = exp(-pow((r.y - 0.12) / (2.4 * w), 2.0));
  float spec = key * (0.75 + 0.25 * diffuse) + 0.38 * fill;

  // On a dark ground the folds are lit out of the dark; on a light ground the
  // body is the light and the folds shade toward colour 1.
  float lightBg = smoothstep(0.55, 0.75, u_bg.x);
  vec3 body = mix(
    labMix(u_bg, paletteColor(0), smoothstep(0.12, 0.9, diffuse)),
    labMix(paletteColor(0), u_bg, 0.15 + 0.85 * diffuse),
    lightBg
  );
  float facing = smoothstep(-0.25, 0.25, n.x);
  vec3 tint = labMix(paletteColor(1), paletteColor(u_count > 2 ? 2 : 1), facing);
  // Fine strands gathered into bundles: thin lines along the folds.
  float f2 = 40.0 * u_scale;
  float v2 = v * f2 + 1.5 * sin(v * f1 * 1.7 + 1.0);
  float thread = exp(-pow((fract(v2) - 0.5) / mix(0.08, 0.22, u_blur), 2.0));
  float bundle = smoothstep(0.1, 0.9, sin(phi1 * 0.5 + 2.0)) * (0.4 + 0.6 * u_warp);
  // Strands only show where their fold catches the light.
  float shine = spec + 0.55 * thread * bundle * clamp(key + fill, 0.0, 1.0);
  vec3 lab = labMix(body, paletteColor(u_count > 2 ? 2 : 0), 0.3 * bounce * (1.0 - lightBg));
  lab = labMix(lab, tint, clamp(shine, 0.0, 1.0));
  lab.x += (0.32 - 0.25 * lightBg) * spec * spec + 0.05 * thread * bundle * diffuse;

  // The sheet: everything below the hem fold, fading with depth.
  float top = 0.16;
  float px = length(grad) / min(u_full.x, u_full.y);
  float soft = max(px * 1.5, 1e-4) + 0.03 * u_blur;
  float below = top - v;
  float mask = smoothstep(-soft, soft, below);
  float fade = exp(-max(below, 0.0) * mix(1.8, 1.2, u_blur));
  float rim = exp(-pow(below / (soft + 0.006), 2.0));

  // The top fold rolls toward the light, so the body is brightest just under the hem.
  lab = labMix(lab, labMix(paletteColor(0), tint, 0.35), 0.7 * exp(-max(below, 0.0) * mix(16.0, 8.0, u_blur)) * (1.0 - lightBg));
  vec3 back = labMix(u_bg, paletteColor(0), 0.14 * exp(-abs(below) * 5.0));
  vec3 outLab = labMix(back, lab, mask * fade);
  // The hem catches the light unevenly along its length.
  float catchLight = 0.45 + 0.55 * smoothstep(-0.6, 0.8, flowNoise(vec2(q.x * 0.9, 3.0), 5.0));
  outLab = labMix(outLab, paletteColor(1), 0.9 * rim * catchLight);
  outLab.x += 0.12 * rim * catchLight;
  return filmGrade(outLab);
}
`,wgsl:()=>import("./silk-W2KDQFJA.js").then(e=>e.wgsl),label:"Silk",name:"silk"};var ie={defaults:{background:"#efe8dc",blur:.55,colors:["#f2552c","#f7b23b","#e889b5","#2f6b3f"],dither:{cell:3,enabled:!1,levels:8},grain:.4,interaction:{pointer:.25,scroll:.3},loopSeconds:14,scale:1,seed:9,speed:.7,warp:.4},description:"A long exposure of colour: soft blooms dragged into streaks across the frame.",fallbackLayers:e=>[`radial-gradient(45% 22% at 30% 40%, color-mix(in oklab, ${r(e,0)} 85%, transparent) 0%, transparent 100%)`,`radial-gradient(40% 20% at 68% 62%, color-mix(in oklab, ${r(e,1)} 80%, transparent) 0%, transparent 100%)`,`radial-gradient(35% 18% at 55% 25%, color-mix(in oklab, ${r(e,2)} 70%, transparent) 0%, transparent 100%)`,`linear-gradient(160deg, transparent 30%, color-mix(in oklab, ${r(e,3)} 18%, transparent) 100%)`],glsl:`
// flowNoise with a third of the travel: blooms this stretched would otherwise
// sweep a whole bloom-width each loop.
float smearNoise(vec2 p, float layer) {
  return snoise2(p + u_seed + 0.35 * drift(layer) + vec2(layer * 7.13, layer * 3.71));
}

vec3 kindColor(vec2 p, vec2 uv) {
  float lightBg = smoothstep(0.55, 0.85, u_bg.x);
  // The camera moved along one direction; the seed picks it.
  float a = 0.5 * sin(seedAngle()) + (fract(u_seed.y * 0.071) > 0.5 ? 0.0 : 1.5708) * 0.35;
  vec2 q = rot2(a) * p * u_scale;
  // Streaks bend a little where the hand wobbled.
  q.y += (0.05 + 0.2 * u_warp) * smearNoise(vec2(q.x * 0.45, 0.3), 1.0);
  float stretch = 0.3 + 0.35 * (1.0 - u_blur);
  vec2 s = vec2(q.x * stretch, q.y * 1.5) * 1.6;

  // Blooms: where they are, and which colour each one is.
  float bloom = smearNoise(s, 2.0) + 0.5 * smearNoise(s * vec2(1.7, 2.3) + 3.3, 3.0);
  float hue = 0.5 + 0.5 * smearNoise(s * 0.7 + 11.0, 4.0);
  float edge = 0.04 + 0.32 * u_blur;
  float m = smoothstep(0.12 - edge, 0.12 + edge, bloom);
  // Streaks inside the smear: fine across, long along.
  float streak = smearNoise(vec2(q.x * 0.5, q.y * 12.0 / (0.6 + u_blur)), 5.0);
  vec3 col = ramp(clamp(hue + 0.08 * streak, 0.0, 1.0));
  col.x += 0.045 * streak;

  // The ground is not flat: a faint smear of the deepest colour runs through it.
  vec3 ground = u_bg;
  float shade = 0.5 + 0.5 * smearNoise(s * 0.6 - 7.0, 6.0);
  ground = labMix(ground, paletteColor(u_count - 1), 0.12 * shade);
  ground.x += 0.01 * streak;

  vec3 lab = labMix(ground, col, m * (0.82 + 0.18 * shade));
  // Hot cores where blooms are densest.
  // Dense blooms get a darker heart, like the centre of a flower.
  float core = smoothstep(0.75, 1.25, bloom + 0.2 * streak);
  lab = labMix(lab, paletteColor(u_count - 1), 0.3 * core);
  lab.x *= vignette(p, 0.18 * (1.0 - lightBg));
  return filmGrade(lab);
}
`,wgsl:()=>import("./smear-SF7O3UGL.js").then(e=>e.wgsl),label:"Smear",name:"smear"};var ne={defaults:{background:"#030304",blur:.45,colors:["#6a3cff","#2f8bff","#2fe0c8","#ffd23f","#ff4a3d"],dither:{cell:3,enabled:!1,levels:8},grain:.08,interaction:{pointer:.15,scroll:.1},loopSeconds:20,scale:1,seed:3,speed:.5,warp:.5},description:"Thin arcs of light splitting into their spectrum across the dark.",fallbackLayers:e=>[`radial-gradient(120% 90% at 30% 120%, transparent 58%, ${s(e,60,66)}, transparent 70%)`],glsl:`
// Signed distance (approx) from q to strand k, and the position along it.
vec2 spStrand(vec2 q, vec2 h, float k, float side) {
  float s = 1.0 / u_scale;
  // A wide arc: part of a big ellipse leaning across the frame.
  float a = -0.35 + (side - 0.5) * 0.8 + 0.12 * k;
  vec2 r = rot2(a) * q;
  float bend = (0.55 + 0.1 * k) / s;
  float y0 = -0.08 * h.y + 0.11 * k + 0.12 * flowNoise(vec2(0.2, k), 1.0 + k);
  float x = r.x;
  float wave = 0.09 * flowNoise(vec2(x * 0.9, 0.4 + k), 2.0 + k);
  float curve = y0 + bend * 0.5 * x * x + wave;
  // Slope from the analytic part keeps the width even along the arc.
  float slope = bend * x;
  float d = (r.y - curve) / sqrt(1.0 + slope * slope);
  return vec2(d, x / max(h.x, 1e-3));
}

vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  float lightBg = smoothstep(0.55, 0.85, u_bg.x);
  float side = fract(u_seed.y * 0.0917 + 0.5);
  float strands = 1.0 + floor(fract(u_seed.x * 0.0731 + 0.5) * 3.0);
  // Odd layouts mirror, so arcs sweep either way.
  vec2 q = p;
  if (fract(u_seed.x * 0.31 + u_seed.y * 0.17) > 0.5) q.x = -q.x;
  float halo = 0.02 + 0.06 * u_blur;
  vec3 lab = u_bg;
  float n = float(u_count);
  float hotSum = 0.0;
  for (int k = 0; k < 3; k++) {
    float fk = float(k);
    if (fk >= strands) break;
    vec2 st = spStrand(q, h, fk, side);
    float along = st.y;
    float fade = smoothstep(-1.15, -0.4, along) * (1.0 - 0.35 * fk);
    // The fringe widens along the strand, from a line to a fan.
    float fan = (0.004 + 0.1 * u_warp * smoothstep(-0.9, 1.0, along)) * (1.0 + 0.4 * fk);
    float core = 0.0018 + 0.004 * u_blur;
    // The strand is the lit edge of a ribbon: its surface trails off on
    // one side as a soft body in the palette's middle colour.
    float bodyW = (0.05 + 0.08 * u_blur) * (1.0 + 0.5 * fk);
    float body = st.x < 0.0 ? exp(st.x / bodyW) * smoothstep(-0.006, 0.0, st.x) : 0.0;
    body *= fade * (0.35 + 0.15 * flowNoise(vec2(along * 1.4, fk), 8.0 + fk));
    lab = labMix(lab, ramp(0.35 + 0.15 * fk), clamp(body * mix(0.9, 0.5, lightBg), 0.0, 1.0));
    for (int i = 0; i < 6; i++) {
      if (i >= u_count) break;
      float fi = float(i);
      float off = (fi / max(n - 1.0, 1.0) - 0.5) * fan;
      float dd = st.x - off;
      float band = exp(-dd * dd / ((fan / n + core) * (fan / n + core)));
      float glow = exp(-abs(dd) / halo) * mix(0.35, 0.12, lightBg);
      float wgt = (band + glow) * fade;
      lab = labMix(lab, paletteColor(i), clamp(wgt * mix(0.9, 0.75, lightBg), 0.0, 1.0));
    }
    float hot = exp(-st.x * st.x / (core * core)) * fade;
    hotSum += hot * (1.0 - 0.4 * fk);
  }
  // Where the fringe converges the light burns white on dark grounds.
  vec3 white = vec3(min(1.0, paletteRange().x + 0.05), 0.0, 0.0);
  lab = labMix(lab, white, clamp(hotSum * 0.8 * (1.0 - lightBg), 0.0, 1.0));
  lab.x *= vignette(p, 0.25 * (1.0 - lightBg));
  return filmGrade(lab);
}
`,wgsl:()=>import("./spectrum-TCYSMSVP.js").then(e=>e.wgsl),label:"Spectrum",name:"spectrum"};var se={defaults:{background:"#07060a",blur:.6,colors:["#ffe2c4","#ff9a4d","#d2456b","#3a1f6b"],dither:{cell:3,enabled:!1,levels:8},grain:.16,interaction:{pointer:.25,scroll:.2},loopSeconds:20,scale:1,seed:5,speed:.6,warp:.55},description:"Colour stirred into a slow, blurred vortex around an off-centre eye.",fallbackLayers:e=>[`radial-gradient(70% 80% at 58% 46%, ${s(e,0,75)}, transparent 100%)`],glsl:`
vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  float lightBg = smoothstep(0.55, 0.85, u_bg.x);
  float a = seedAngle();
  // The eye sits off centre and wanders a little.
  vec2 eye = vec2(0.32 * h.x * cos(a), 0.22 * h.y * sin(a * 1.7));
  eye += 0.05 * vec2(flowNoise(vec2(0.2, 0.8), 1.0), flowNoise(vec2(0.9, 0.1), 2.0));
  vec2 d = p - eye;
  float r = length(d);
  // Twist: strongest near the eye, easing out with distance. It breathes
  // with the loop, so the arms wind and unwind.
  float reach = 0.55 / u_scale;
  float twist = (2.2 + 2.8 * u_warp) * exp(-r / reach) + 0.9 * u_loop.x;
  float dir = fract(u_seed.y * 0.113) > 0.5 ? 1.0 : -1.0;
  vec2 q = rot2(dir * twist) * d;

  vec2 s = q * 1.25 * u_scale;
  float fine = 1.0 - 0.8 * u_blur;
  float n = flowNoise(s, 3.0) + 0.4 * fine * flowNoise(s * 2.3 + 5.1, 4.0);
  n /= 1.0 + 0.4 * fine;
  float t = clamp(0.45 + 0.5 * n, 0.0, 1.0);
  // Arms: a soft spiral band the palette rides along.
  float arm = 0.5 + 0.5 * sin(atan(q.y, q.x + 1e-6) * 2.0 + r * 3.0 + 2.0 * n);
  // The arms converge to a point at the eye; let them dissolve there.
  arm = mix(0.5, arm, smoothstep(0.0, 0.2, r));
  t = mix(t, 0.15 + 0.7 * arm, 0.3);
  vec3 col = ramp(t);

  // The eye is the brightest, calmest point; light thins with distance.
  float lit = exp(-r / ((0.35 + 0.35 * u_blur) * max(0.6, 1.0 / u_scale)));
  // Away from the eye the colour thins into the ground along the arms.
  float amount = lit * (0.7 + 0.3 * arm) + (1.0 - lit) * 0.55 * arm * smoothstep(-0.2, 0.6, n);
  // As the light thins it deepens toward the last colour instead of
  // greying out, the way a glow falls off on film.
  col = labMix(col, ramp(1.0), (1.0 - clamp(amount, 0.0, 1.0)) * 0.55 * (1.0 - lightBg));
  vec3 lab = labMix(u_bg, col, clamp(amount, 0.0, 1.0));
  vec3 hot = vec3(min(1.0, paletteColor(0).x + 0.05), paletteColor(0).yz * 0.6);
  lab = labMix(lab, hot, 0.5 * exp(-r * r / (0.02 + 0.04 * u_blur)) * (1.0 - lightBg));
  lab.x *= vignette(p, 0.3 * (1.0 - lightBg));
  return filmGrade(lab);
}
`,wgsl:()=>import("./swirl-UA2FRPTE.js").then(e=>e.wgsl),label:"Swirl",name:"swirl"};var ce={defaults:{background:"#020203",blur:.3,colors:["#c9b6ff","#7b4dff","#2c1670"],dither:{cell:3,enabled:!1,levels:8},grain:.22,interaction:{pointer:.15,scroll:.1},loopSeconds:18,scale:1,seed:4,speed:.6,warp:.6},description:"A dark core inside a field of radial streaks, brightest toward the frame edge.",fallbackLayers:e=>[`radial-gradient(circle at 50% 50%, transparent 30%, color-mix(in oklab, ${r(e,2)} 55%, transparent) 48%, color-mix(in oklab, ${r(e,1)} 65%, transparent) 70%, color-mix(in oklab, ${r(e,0)} 55%, transparent) 100%)`],glsl:`
// Colour streaks radiate from a dark core, like a zoom blur. The streaks
// are noise sampled on circles round the centre: fine in angle, smooth in
// radius, and with no seam. scale sets the core; warp the streak contrast.
vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  // The seed picks where the core sits: near the centre, pushed to one
  // side, sunk below the bottom edge so the streaks fan up from it, or
  // tucked into a top corner so they fan down across the frame.
  float framing = floor(fract(u_seed.x * 0.0731 + 0.5) * 4.0);
  float side = sign(u_seed.y + 0.01);
  vec2 centre = vec2(0.06 * h.x * sin(u_seed.y), 0.03 * cos(u_seed.x));
  float radius = 0.25;
  if (framing == 1.0) {
    centre = vec2(0.5 * h.x * side, 0.04);
    radius = 0.22;
  } else if (framing == 2.0) {
    centre = vec2(0.12 * h.x * side, -h.y - 0.08);
    radius = 0.36;
  } else if (framing == 3.0) {
    centre = vec2(-side * (h.x - 0.05), h.y - 0.05);
    radius = 0.3;
  }
  float breathe = 1.0 + 0.035 * flowNoise(vec2(0.37, 0.71), 1.0);
  radius *= u_scale * breathe;

  vec2 d = p - centre;
  float r = length(d);
  vec2 dir = d / max(r, 1e-4);

  // Fine streaks over a broad angular swell. Blur smears the fine ones.
  float fineAmount = 1.0 - 0.75 * u_blur;
  float broad = flowNoise(dir * 2.2 + vec2(0.0, r * 0.4), 1.5);
  float s1 = flowNoise(dir * 16.0 + vec2(r * 0.5, 0.0), 2.0);
  float s2 = flowNoise(dir * 41.0 - vec2(0.0, r * 0.9), 3.0);
  float fine = (s1 + 0.7 * s2) / 1.7;
  float streak = 1.0 + u_warp * (0.3 * broad + 0.32 * fineAmount * fine);

  // One brighter sector, which drifts slowly round the core.
  float swing = seedAngle() + 1.6 * u_loop.y;
  float sector = 0.5 + 0.5 * dot(dir, vec2(sin(swing), -cos(swing)));

  // Dark inside the core, rising through the streaks to the frame edge.
  float soft = 0.5 + 0.6 * u_blur;
  float rise = smoothstep(radius * (1.0 - 0.25 * soft), radius * (1.0 + 1.8 * soft), r);
  float edge = clamp((r - radius) / max(length(h) + length(centre) - radius, 0.2), 0.0, 1.0);
  float glow = rise * (0.28 + 0.42 * edge) * streak * (0.35 + 0.65 * sector * sector);

  // colour 0 is the brightest light, the last the deepest.
  float t = clamp(1.0 - glow * 1.1 - 0.1 * sector, 0.0, 1.0);
  vec3 col = ramp(t);
  vec3 lab = labMix(u_bg, col, clamp(glow * 1.25, 0.0, 1.0));
  return filmGrade(lab);
}
`,wgsl:()=>import("./void-VD6KKEWU.js").then(e=>e.wgsl),label:"Void",name:"void"};var fe={defaults:{background:"#05070d",blur:.35,colors:["#a9c1df","#5479b0","#24467e","#0f1c38"],dither:{cell:3,enabled:!1,levels:8},grain:.08,interaction:{pointer:.15,scroll:.25},loopSeconds:16,scale:1,seed:11,speed:.6,warp:.4},description:"Satin bands folding over each other, lit from above.",fallbackLayers:(e,o)=>[`linear-gradient(172deg, ${o} 0%, ${s(e,28,100)})`],glsl:`
vec3 kindColor(vec2 p, vec2 uv) {
  vec2 h = frameHalf();
  float tilt = -0.42 + 0.3 * (fract(u_seed.x * 0.173) - 0.5);
  vec2 normal = vec2(sin(tilt), cos(tilt));
  vec2 tangent = vec2(normal.y, -normal.x);
  float y = dot(p, normal) / (2.0 * h.y);
  float along = dot(p, tangent);
  float x = along * u_scale;
  float count = float(u_count);
  // Depth of field: crisp in the middle, softer toward the sides.
  float focus = 0.35 + 0.65 * min(1.0, abs(along) / h.x);
  vec3 lab = u_bg;
  lab.x += 0.05 * smoothstep(-0.2, 0.6, y);
  for (int i = 0; i < 6; i++) {
    if (i >= u_count) break;
    float fi = float(i);
    float base = 0.46 - 0.9 * (fi + 0.25) / count;
    float phase = fi * 1.9 + dot(u_loop, vec2(cos(fi * 1.3), sin(fi * 1.3))) * 1.8;
    float wave = 0.1 * sin(x * (1.3 + 0.3 * fi) + phase)
      + 0.04 * sin(x * (2.7 - 0.2 * fi) - 1.3 * phase + 1.0)
      + u_warp * 0.08 * flowNoise(vec2(x * 0.65, fi * 3.7), 60.0 + fi);
    float edge = base + wave * (0.6 + 0.4 * fi / count);
    float dd = edge - y;
    float soft = 0.002 + (0.01 + 0.06 * u_blur) * focus;
    float m = smoothstep(-soft, soft, dd);
    // The band casts a soft shadow on the one behind it.
    float shadow = exp(-max(-dd, 0.0) / (0.035 + 0.05 * u_blur)) * (1.0 - m);
    lab.x -= 0.08 * shadow * (0.3 + lab.x);
    // Satin: a bright lip at the crest, then the band turns away from the light.
    vec3 c = u_colors[i];
    float body = max(dd, 0.0);
    // Centred on the band's own colour, so a flat palette keeps its value.
    c.x += 0.1 * exp(-body / (0.012 + 0.03 * u_blur)) + 0.09 * (0.38 - smoothstep(0.0, 0.3, body))
      + 0.06 * along / h.x;
    lab = labMix(lab, c, m);
  }
  lab.x *= vignette(p, 0.22);
  return filmGrade(lab);
}
`,wgsl:()=>import("./waves-ZP6QYIQF.js").then(e=>e.wgsl),label:"Waves",name:"waves"};var de=new Map;function Ne(e){de.set(e.name,e)}for(let e of[C,Y,H,fe,oe,Q,Z,j,X,W,ce,J,U,te,V,ne,le,ae,I,re,ee,ie,se])Ne(e);function P(e){return de.get(e)??C}function Re(e,o){let t=(e%o+o)%o;return 2*Math.PI*t/o}function he(e,o,t,a){let l=a===void 0,n=Re(e,o)*(l?1:t),c=l?t*.6:a;return[Math.cos(n)*c,Math.sin(n)*c]}function pe(e,o=.6){return[Math.cos(e)*o,Math.sin(e)*o]}function ue(e,o,t=60){let a=Math.max(1,Math.round(o*t));return(Math.floor(e)%a+a)%a}function me(e,o){return{fullHeight:o,fullWidth:e,height:o,width:e,x:0,y:0}}function De(e){let o=Math.imul(e^2654435769,2246822507);o=Math.imul(o^o>>>13,3266489909),o^=o>>>16;let t=(o&65535)/65535,a=(o>>>16&65535)/65535;return[t*97-48.5,a*97-48.5]}function ge(e,o,t,a,l){let[n,c]=a.phase!==void 0&&e.drift!==void 0?pe(a.phase,e.drift):he(a.timeSeconds,e.loopSeconds,e.speed,e.drift),[u,g]=De(e.seed),b=Math.tanh((a.scroll?.velocity??0)*e.interaction.scroll)*1.2,x=a.pointer;return{bg:[t[0],t[1],t[2]],blur:e.blur,colors:Array.from({length:6},(E,S)=>{let y=o[S]??[0,0,0];return[y[0],y[1],y[2],0]}),count:e.colors.length,dither:[e.dither.enabled?1:0,e.dither.cell,e.dither.levels],frame:ue(a.frameIndex,e.loopSeconds,a.frameRate),full:[l.fullWidth,l.fullHeight],grain:e.grain,loopv:[n,c],pointer:[x?.x??.5,x?.y??.5,(x?.strength??0)*e.interaction.pointer],scale:e.scale,scroll:b,seed:[u,g],tile:[l.x,l.y,l.width,l.height],warp:Math.min(1.6,e.warp+Math.abs(b)*.5)}}var $e=[.5,.5,.5];function R(e){return e<=.04045?e/12.92:((e+.055)/1.055)**2.4}function be(e){let o=R(e[0]),t=R(e[1]),a=R(e[2]),l=Math.cbrt(.4122214708*o+.5363325363*t+.0514459929*a),n=Math.cbrt(.2119034982*o+.6806995451*t+.1073969566*a),c=Math.cbrt(.0883024619*o+.2817188376*t+.6299787005*a);return[.2104542553*l+.793617785*n-.0040720468*c,1.9779984951*l-2.428592205*n+.4505937099*c,.0259040371*l+.7827717662*n-.808675766*c]}var Ke=/^#([0-9a-f]{3,8})$/i,Ee=/^rgba?\(\s*([^)]+)\)$/i;function Fe(e){let o=Number.parseFloat(e);return Number.isNaN(o)?null:e.endsWith("%")?o/100:o/255}function Oe(e){let o=e.trim(),t=Ke.exec(o)?.[1];if(t){let l=t.length<=4?[...t].map(n=>n+n).join(""):t;return l.length!==6&&l.length!==8?null:[Number.parseInt(l.slice(0,2),16)/255,Number.parseInt(l.slice(2,4),16)/255,Number.parseInt(l.slice(4,6),16)/255]}let a=Ee.exec(o)?.[1];if(a){let n=a.split(/[\s,/]+/).filter(Boolean).slice(0,3).map(Fe),[c,u,g]=n;if(n.length===3&&c!=null&&u!=null&&g!=null)return[c,u,g]}return null}var k;function He(){if(k!==void 0)return k;if(k=null,typeof OffscreenCanvas<"u")k=new OffscreenCanvas(1,1).getContext("2d",{willReadFrequently:!0});else if(typeof document<"u"){let e=document.createElement("canvas");e.width=1,e.height=1,k=e.getContext("2d",{willReadFrequently:!0})}return k}function We(e){let o=He();if(!o)return null;let t="#010203";if(o.fillStyle=t,o.fillStyle=e,o.fillStyle===t&&e.trim().toLowerCase()!==t)return null;o.clearRect(0,0,1,1),o.fillRect(0,0,1,1);let[a=0,l=0,n=0]=o.getImageData(0,0,1,1).data;return[a/255,l/255,n/255]}var Ie=/^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/;function D(e,o,t=0){let a=Ie.exec(e.trim());if(!a||t>8)return e.trim();let[,l="",n]=a,c=o&&typeof getComputedStyle<"u"?getComputedStyle(o).getPropertyValue(l).trim():"";return c?D(c,o,t+1):n?D(n,o,t+1):""}var T=new Map;function xe(e,o){let t=D(e,o),a=T.get(t);if(a)return a;let l=Oe(t)??We(t)??$e;return T.size>256&&T.clear(),T.set(t,l),l}function yo(e){return e.some(o=>o.includes("var("))}var ve=`#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`,we=`#version 300 es
precision highp float;
precision highp int;

uniform vec2 u_full;       // full image size in pixels
uniform vec4 u_tile;       // tile x, y (top-left origin), width, height
uniform vec2 u_loop;       // (cos, sin)(phase) * speed * radius
uniform vec2 u_seed;       // seed offset in noise space
uniform float u_scale;
uniform float u_warp;
uniform float u_blur;
uniform float u_grain;
uniform float u_frame;     // grain seed
uniform vec3 u_dither;     // enabled, cell, levels
uniform vec3 u_colors[6];  // OKLab
uniform int u_count;
uniform vec3 u_bg;         // OKLab
uniform vec3 u_pointer;    // x, y in image uv (top-left origin), influence
uniform float u_scroll;    // smoothed scroll velocity * influence

out vec4 outColor;

// 4D simplex noise. Ian McEwan, Stefan Gustavson, Ashima Arts (MIT).
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
float permute(float x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float taylorInvSqrt(float r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec4 grad4(float j, vec4 ip) {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p, s;
  p.xyz = floor(fract(vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz * 2.0 - 1.0) * s.www;
  return p;
}
float snoise(vec4 v) {
  const vec4 C = vec4(0.138196601125011, 0.276393202250021, 0.414589803375032, -0.447213595499958);
  vec4 i = floor(v + dot(v, vec4(0.309016994374947451)));
  vec4 x0 = v - i + dot(i, C.xxxx);
  vec4 i0;
  vec3 isX = step(x0.yzw, x0.xxx);
  vec3 isYZ = step(x0.zww, x0.yyz);
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;
  vec4 i3 = clamp(i0, 0.0, 1.0);
  vec4 i2 = clamp(i0 - 1.0, 0.0, 1.0);
  vec4 i1 = clamp(i0 - 2.0, 0.0, 1.0);
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;
  i = mod289(i);
  float j0 = permute(permute(permute(permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute(permute(permute(permute(
      i.w + vec4(i1.w, i2.w, i3.w, 1.0))
    + i.z + vec4(i1.z, i2.z, i3.z, 1.0))
    + i.y + vec4(i1.y, i2.y, i3.y, 1.0))
    + i.x + vec4(i1.x, i2.x, i3.x, 1.0));
  vec4 ip = vec4(1.0 / 294.0, 1.0 / 49.0, 1.0 / 7.0, 0.0);
  vec4 p0 = grad4(j0, ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4, p4));
  vec3 m0 = max(0.6 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3, x3), dot(x4, x4)), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * (dot(m0 * m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)))
    + dot(m1 * m1, vec2(dot(p3, x3), dot(p4, x4))));
}

// 2D simplex noise, same authors and licence. About a third of the cost of
// snoise(vec4), so kinds use it for structure and keep the 4D noise for the
// few places that need the field itself to morph.
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 10.0) * x); }
float snoise2(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Time coordinates for a noise layer. Every layer moves on its own circle.
vec2 loopAt(float layer) {
  return u_loop + vec2(layer * 1.71, layer * -2.37);
}

// Looping noise: spatial position plus a point on the time circle.
float loopNoise(vec2 p, float layer) {
  return snoise(vec4(p + u_seed, loopAt(layer)));
}

// Three octaves; blur fades out the fine ones.
float fbm(vec2 p, float layer) {
  float fine = 1.0 - 0.85 * u_blur;
  float sum = loopNoise(p, layer);
  sum += 0.5 * fine * loopNoise(p * 2.03 + 17.1, layer + 0.5);
  sum += 0.25 * fine * fine * loopNoise(p * 4.07 - 9.7, layer + 1.0);
  return sum / (1.0 + 0.5 * fine + 0.25 * fine * fine);
}

// The loop point rotated per layer. Translating a field by it is seamless,
// and layers drifting in different directions read as slow morphing.
vec2 drift(float layer) {
  float a = layer * 2.39996;
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c) * u_loop;
}

// Cheap looping noise: a 2D field translated around the loop circle.
float flowNoise(vec2 p, float layer) {
  return snoise2(p + u_seed + drift(layer) + vec2(layer * 7.13, layer * 3.71));
}

// The loop angle as a unit vector, so waves can travel a whole period per
// loop. Frozen when speed is 0.
vec2 loopTurn() {
  float r = length(u_loop);
  return r > 1e-6 ? u_loop / r : vec2(1.0, 0.0);
}

// sin(a - angle), where cs = (cos, sin)(angle).
float turnSin(float a, vec2 cs) {
  return sin(a) * cs.x - cos(a) * cs.y;
}

mat2 rot2(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c);
}

// tanh that stays finite: some GPUs evaluate tanh(x) as a ratio of exps,
// which is inf/inf = NaN for large x.
float safeTanh(float x) {
  return tanh(clamp(x, -9.0, 9.0));
}

// The brightest lightness and strongest chroma among the supplied colours.
vec2 paletteRange() {
  float l = u_bg.x;
  float c = length(u_bg.yz);
  for (int i = 0; i < 6; i++) {
    if (i >= u_count) break;
    l = max(l, u_colors[i].x);
    c = max(c, length(u_colors[i].yz));
  }
  return vec2(l, c);
}

// Filmic grade in OKLab for the light a kind adds. It is an identity map for
// anything inside the palette's own range, so supplied colours and theme
// tokens render as chosen. Only highlights pushed past the brightest colour
// get a soft shoulder, and only chroma pushed past both the most saturated
// colour and a film-like cap (which eases off toward black and white) rolls off.
vec3 filmGrade(vec3 lab) {
  vec2 range = paletteRange();
  float l = max(lab.x, 0.0);
  float shoulder = max(range.x, 0.8);
  if (l > shoulder) {
    float room = max(1.0 - shoulder, 1e-3);
    l = shoulder + room * safeTanh((l - shoulder) / room);
  }
  float c = length(lab.yz);
  float cap = 0.05 + 0.9 * l * (1.0 - l) * (0.5 + 0.5 * l);
  float knee = max(range.y, 0.6 * cap);
  float top = max(cap, knee + 0.02);
  float soft = c <= knee ? c : knee + (top - knee) * safeTanh((c - knee) / (top - knee));
  float k = c > 1e-5 ? soft / c : 1.0;
  return vec3(l, lab.yz * k);
}

// Darkens the corners in OKLab lightness; amount 0..1.
float vignette(vec2 p, float amount) {
  vec2 q = p / (0.5 * u_full / min(u_full.x, u_full.y));
  return 1.0 - amount * smoothstep(0.35, 1.45, dot(q, q) * 0.55);
}

// Half the frame size in p units; the short side spans -0.5..0.5.
vec2 frameHalf() {
  return 0.5 * u_full / min(u_full.x, u_full.y);
}

float seedAngle() {
  return fract(u_seed.x * 0.1371 + u_seed.y * 0.0713) * 6.28318530718;
}

// Mix in OKLab, then pull chroma back toward the endpoints so midpoints stay vivid.
vec3 labMix(vec3 a, vec3 b, float t) {
  vec3 m = mix(a, b, t);
  float target = mix(length(a.yz), length(b.yz), t);
  float current = length(m.yz);
  if (current > 1e-4) {
    m.yz *= mix(1.0, target / current, 0.75);
  }
  return m;
}

vec3 paletteColor(int i) {
  return u_colors[clamp(i, 0, u_count - 1)];
}

// Smooth ramp through the palette, t in 0..1.
vec3 ramp(float t) {
  float x = clamp(t, 0.0, 1.0) * float(u_count - 1);
  int i = int(floor(x));
  float f = x - float(i);
  f = f * f * (3.0 - 2.0 * f);
  return labMix(paletteColor(i), paletteColor(i + 1), f);
}

// Pointer: a soft lens that pulls the field toward the cursor.
// Scroll: velocity shears the field vertically.
vec2 interact(vec2 p) {
  vec2 half_ = frameHalf();
  vec2 ptr = (u_pointer.xy - 0.5) * 2.0 * half_;
  ptr.y = -ptr.y;
  vec2 d = p - ptr;
  float f = exp(-dot(d, d) * 5.0) * u_pointer.z;
  p -= d * f * 0.45;
  p.y += u_scroll * 0.08 * (0.6 + 0.4 * sin(p.x * 3.0));
  return p;
}
`,ye=`
vec3 oklabToLinear(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 linearToSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  vec3 lo = c * 12.92;
  vec3 hi = 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055;
  return mix(hi, lo, vec3(lessThanEqual(c, vec3(0.0031308))));
}

uint hashU(uint x) {
  x ^= x >> 16;
  x *= 0x7feb352du;
  x ^= x >> 15;
  x *= 0x846ca68bu;
  x ^= x >> 16;
  return x;
}

float hash01(uvec2 p, uint s) {
  return float(hashU(p.x ^ hashU(p.y ^ hashU(s)))) / 4294967295.0;
}

const float BAYER[16] = float[16](
  0.0, 8.0, 2.0, 10.0,
  12.0, 4.0, 14.0, 6.0,
  3.0, 11.0, 1.0, 9.0,
  15.0, 7.0, 13.0, 5.0
);

void main() {
  vec2 px = vec2(u_tile.x + gl_FragCoord.x, u_tile.y + (u_tile.w - gl_FragCoord.y));
  bool dither = u_dither.x > 0.5;
  vec2 cell = floor(px / u_dither.y);
  vec2 samplePx = dither ? (cell + 0.5) * u_dither.y : px;

  vec2 uv = samplePx / u_full;
  vec2 p = (samplePx - 0.5 * u_full) / min(u_full.x, u_full.y);
  p.y = -p.y;
  p = interact(p);

  vec3 rgb = linearToSrgb(oklabToLinear(kindColor(p, uv)));

  // Triangular, deterministic grain seeded by the frame. A trace stays on even
  // at grain 0 to break up 8-bit banding.
  uvec2 ip = uvec2(px);
  uint frame = uint(u_frame);
  float n = hash01(ip, frame * 2u + 1u) + hash01(ip, frame * 2u + 2u) - 1.0;
  float lum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
  float amp = u_grain * 0.2 * (0.55 + 0.9 * lum * (1.0 - lum)) + (dither ? 0.0 : 1.0 / 255.0);
  rgb += n * amp;

  if (dither) {
    ivec2 b = ivec2(mod(cell, 4.0));
    float threshold = (BAYER[b.y * 4 + b.x] + 0.5) / 16.0;
    float steps = u_dither.z - 1.0;
    rgb = floor(clamp(rgb, 0.0, 1.0) * steps + threshold) / steps;
  }

  outColor = vec4(clamp(rgb, 0.0, 1.0), 1.0);
}
`;var Ue=["u_full","u_tile","u_loop","u_seed","u_scale","u_warp","u_blur","u_grain","u_frame","u_dither","u_colors","u_count","u_bg","u_pointer","u_scroll"],z=class extends Error{name="ShaderError"};function je(e){return typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas}function Po(e,o){let t={alpha:!0,antialias:!1,depth:!1,powerPreference:"low-power",premultipliedAlpha:!0,preserveDrawingBuffer:o.preserveDrawingBuffer,stencil:!1};try{return je(e),e.getContext("webgl2",t)}catch{return null}}function _e(e,o,t){let a=e.createShader(o);if(!a)throw new z("Unable to create shader");if(e.shaderSource(a,t),e.compileShader(a),!e.getShaderParameter(a,e.COMPILE_STATUS)&&!e.isContextLost()){let l=e.getShaderInfoLog(a)??"";throw e.deleteShader(a),new z(`Shader compile failed: ${l}`)}return a}var Ve=e=>be(xe(e,typeof document>"u"?null:document.documentElement));function To(e){let{canvas:o,gl:t}=e,a=e.resolveColor??Ve,l=N(e.params),n=[],c=[0,0,0],u=new Map,g=null,b=null,x=()=>{n=l.colors.map(h=>a(h)),c=a(l.background)},E=()=>{g=t.createBuffer(),b=t.createVertexArray(),t.bindVertexArray(b),t.bindBuffer(t.ARRAY_BUFFER,g),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),t.STATIC_DRAW),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0),t.bindVertexArray(null)},S=h=>{let v=P(h),m=u.get(v.name);if(m)return m;let q=_e(t,t.VERTEX_SHADER,ve),f=_e(t,t.FRAGMENT_SHADER,`${we}
${v.glsl}
${ye}`),i=t.createProgram();if(!i)throw new z("Unable to create program");if(t.attachShader(i,q),t.attachShader(i,f),t.bindAttribLocation(i,0,"a_position"),t.linkProgram(i),t.deleteShader(q),t.deleteShader(f),!t.getProgramParameter(i,t.LINK_STATUS)&&!t.isContextLost()){let _=t.getProgramInfoLog(i)??"";throw t.deleteProgram(i),new z(`Program link failed: ${_}`)}let G=Object.fromEntries(Ue.map(_=>[_,t.getUniformLocation(i,_)])),A={program:i,uniforms:G};return u.set(v.name,A),A},y=()=>{u=new Map,E(),S(l.kind)};return x(),y(),{get canvas(){return o},destroy(){if(!t.isContextLost()){for(let{program:h}of u.values())t.deleteProgram(h);t.deleteBuffer(g),t.deleteVertexArray(b)}u=new Map},gl:t,get params(){return l},refreshColors:x,renderFrame(h,v){if(t.isContextLost())return;let m=v??me(o.width,o.height);(o.width!==m.width||o.height!==m.height)&&(o.width=m.width,o.height=m.height);let{program:q,uniforms:f}=S(l.kind),i=ge(l,n,c,h,m),G=new Float32Array(18);i.colors.forEach(([A,_,Ae],Pe)=>G.set([A,_,Ae],Pe*3)),t.viewport(0,0,m.width,m.height),t.useProgram(q),t.bindVertexArray(b),t.uniform2f(f.u_full,i.full[0],i.full[1]),t.uniform4f(f.u_tile,i.tile[0],i.tile[1],i.tile[2],i.tile[3]),t.uniform2f(f.u_loop,i.loopv[0],i.loopv[1]),t.uniform2f(f.u_seed,i.seed[0],i.seed[1]),t.uniform1f(f.u_scale,i.scale),t.uniform1f(f.u_warp,i.warp),t.uniform1f(f.u_blur,i.blur),t.uniform1f(f.u_grain,i.grain),t.uniform1f(f.u_frame,i.frame),t.uniform3f(f.u_dither,i.dither[0],i.dither[1],i.dither[2]),t.uniform3fv(f.u_colors,G),t.uniform1i(f.u_count,i.count),t.uniform3f(f.u_bg,i.bg[0],i.bg[1],i.bg[2]),t.uniform3f(f.u_pointer,i.pointer[0],i.pointer[1],i.pointer[2]),t.uniform1f(f.u_scroll,i.scroll),t.drawArrays(t.TRIANGLE_STRIP,0,4),t.bindVertexArray(null)},restore:y,setParams(h){let v=h.colors!==void 0||h.background!==void 0;l=O(l,h),v&&x()}}}var Bo=16,No=96*1024*1024,ke="gradients:gradient-backend",ze="gcn:gradient-backend";function $(e){return e==="auto"||e==="webgpu"||e==="webgl2"}function Ye(){if(typeof window>"u")return"auto";try{let e=new URLSearchParams(window.location.search).get("gradient-backend");if($(e))return e;let o=window.localStorage.getItem(ke),t=o??window.localStorage.getItem(ze);return o===null&&$(t)&&(window.localStorage.setItem(ke,t),window.localStorage.removeItem(ze)),$(t)?t:"auto"}catch{return"auto"}}var qe=Ye(),w=null,Ge=!1,L=null,Ce=0,K=new Set;function Ro(e){return K.add(e),()=>K.delete(e)}function Se(){for(let e of K)e()}function Xe(){return typeof navigator<"u"&&Reflect.get(navigator,"gpu")!==void 0}function Ze(){Ge=!0,import("./webgpu-device-J5IFW4PB.js").then(e=>{w=e,Ce>0&&e.setWebGPUMemoryCap(Ce),Se()},e=>{L=`could not load the WebGPU backend: ${String(e)}`,Se()})}function Do(e){return qe==="webgl2"||P(e).wgsl===void 0?"unavailable":w?w.webgpuStatus(e):L!==null?"unavailable":Xe()?(Ge||Ze(),"pending"):(L="navigator.gpu is missing","unavailable")}function $o(e,o=0){return w?.acquireSurface(e,o)??null}function Ko(e){w?.releaseSurface(e)}function Eo(e){w?.trimSurfaces(e)}function Fo(){return L!==null||(w?.webgpuUnsupported()??!1)}function Oo(){return qe}export{ot as a,N as b,O as c,P as d,be as e,xe as f,yo as g,Re as h,me as i,ge as j,Po as k,Ve as l,To as m,Bo as n,No as o,Ro as p,Se as q,Do as r,$o as s,Ko as t,Eo as u,Fo as v,Oo as w};
