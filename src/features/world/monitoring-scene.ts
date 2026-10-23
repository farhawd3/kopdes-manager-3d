import {
  ACESFilmicToneMapping,
  Box3,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  type Object3D,
  OrthographicCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  VSMShadowMap,
  WebGLRenderer,
} from 'three';
import { animateIdle, animateWalk, type PersonRig } from './person';
import { disposeCharacter, createCharacter } from './character';
import {
  WAREHOUSE_DOOR,
  AISLE_Z,
  SLOT,
  roomInside,
  roomAnchor,
  roomDoor,
  buildOffice,
  extraSlot,
  type Slot,
} from './monitoring-room';
import { buildWarehouse, type LogisticsInput } from './warehouse-room';
import { buildStores } from './store-room';
import { STORES, storeInfo, type StoreId, type StoreInfo } from './store';
import { OFFICE_ROOMS, type OfficeRoom, type WorldSite } from './office-rooms';
import { MAX_FIGURES, isOffice, type CharacterPlan } from './character-plan';
import { buildIsland } from './island';
import { panorama } from './ambience';
import type { Ambience } from './monitor-data';

/** Batas zoom kamera: cukup jauh untuk melihat seluruh lokasi, cukup dekat untuk membaca meja dan rak di ponsel. */
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 5;

/** Kamera iso: jarak datar R dan tinggi tetap; sudut azimut bisa diputar dalam batas aman. */
const DISTANCE = Math.hypot(25, 25);
const HEIGHT = 29;
/** Putaran dibatasi 15°–75° agar dinding belakang diorama tetap di belakang. */
const START_ANGLE = Math.PI / 4,
  MIN_ANGLE = Math.PI / 12,
  MAX_ANGLE = (5 * Math.PI) / 12,
  ROTATE_STEP = Math.PI / 12;
/** Pin biru (SVG statis) untuk hal yang perlu perhatian di peta. */
const PIN_SVG =
  '<svg viewBox="0 0 32 40" width="30" height="38" aria-hidden="true"><ellipse cx="16" cy="37" rx="7" ry="2.4" fill="#2f48d6" opacity=".22"/><path d="M16 2a12 12 0 0 1 12 12c0 8.6-9.6 18.4-11.2 21a1 1 0 0 1-1.6 0C13.6 32.4 4 22.6 4 14A12 12 0 0 1 16 2Z" fill="#546fff"/><path d="M16 2a12 12 0 0 1 12 12c0 2-.5 4-1.4 6A12 12 0 0 0 6 11.5 12 12 0 0 1 16 2Z" fill="#fff" opacity=".22"/><circle cx="16" cy="14" r="5" fill="#fff"/></svg>';
export type AttentionPin = { key: string; label: string };
const PIN_CLASS =
  'pointer-events-auto absolute top-0 left-0 block h-[38px] w-[30px] border-0 bg-none p-0 transition-[filter] duration-150 [filter:drop-shadow(0_4px_6px_color-mix(in_srgb,var(--accent-ink)_25%,transparent))] hover:[filter:drop-shadow(0_6px_10px_color-mix(in_srgb,var(--accent-ink)_40%,transparent))_brightness(1.08)] [&_svg]:block';
const FLOOR_Y = 0.06;
/** Langkah santai (satuan/detik) dan kecepatan belok; figur berangkat bergiliran. */
const WALK_SPEED = 2.6;
const TURN_SPEED = 9;
const STAGGER = 0.35;
/** Luas pandang minimum (setengah lebar/tinggi dunia) per lokasi agar seluruh ruang terlihat. */
const VIEW_EXTENT: Record<WorldSite, { w: number; h: number }> = {
  pulau: { w: 24, h: 17 },
  gerai: { w: 20.5, h: 11.6 },
  kantor: { w: 27.5, h: 16.5 },
  gudang: { w: 24, h: 15.4 },
  pendingin: { w: 14.5, h: 9.4 },
};

type Figure = {
  plan: CharacterPlan;
  o: PersonRig;
  area: OfficeRoom;
  slot: Slot;
  path: Vector3[];
  phase: number;
  /** Detik menunggu sebelum berangkat agar figur tidak berjalan serempak. */
  delay: number;
};
type SiteScene = ReturnType<typeof buildOffice>;
/** Titik tengah pandang awal per lokasi (kantor melebar ke kanan karena ruang istirahat). */
const CENTER: Record<WorldSite, Vector3> = {
  pulau: new Vector3(0, 0, 0),
  gerai: new Vector3(0, 0, 0),
  kantor: new Vector3(0, 0, 0),
  gudang: new Vector3(0, 0, 0),
  pendingin: new Vector3(0, 0, 0),
};
const OBJECT_NAMES: Record<string, string> = {
  'pintu-pulau': 'Keluar ke pulau koperasi',
  'pintu-gudang': 'Pintu ke gudang',
  'pintu-kantor': 'Pintu ke kantor',
  'pintu-pendingin': 'Pintu ke cold storage',
  'pintu-gerai': 'Pintu ke kawasan gerai',
};

export type MonitoringScene = ReturnType<typeof createMonitoring>;

/**
 * Persegi layar (px) dari kotak batas dunia: delapan sudut diproyeksikan, diambil batas luarnya.
 * Dipakai bingkai siku pilihan agar ukurannya mengikuti objek yang diklik.
 */
export function screenRect(
  bounds: Box3,
  camera: OrthographicCamera,
  width: number,
  height: number,
) {
  const v = new Vector3();
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (let i = 0; i < 8; i++) {
    v.set(
      i & 1 ? bounds.max.x : bounds.min.x,
      i & 2 ? bounds.max.y : bounds.min.y,
      i & 4 ? bounds.max.z : bounds.min.z,
    ).project(camera);
    const x = ((v.x + 1) / 2) * width,
      y = ((1 - v.y) / 2) * height;
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  return { x0, y0, x1, y1 };
}

/** Delta waktu menjaga kamera halus pada berbagai kecepatan layar, berhenti saat tiba. */
export function followCharacter(target: Vector3, position: Vector3, dt: number, reduce = false) {
  const goal = new Vector3(position.x, 0.8, position.z);
  if (reduce || target.distanceTo(goal) < 0.015) {
    target.copy(goal);
    return false;
  }
  target.lerp(goal, 1 - Math.exp(-dt * 7));
  return true;
}

/**
 * Jalur figur: keluar lewat titik `via` tempat lama (dibalik) → dalam pintu → lorong → pintu
 * ruang tujuan → `via` tempat baru → tempat. Semua titik dipilih di area bebas perabot.
 */
export function walkPath(
  from: Vector3,
  previous: { area: OfficeRoom; slot: Slot } | null,
  to: OfficeRoom,
  slot: Slot,
) {
  const t: { x: number; z: number }[] = [];
  if (previous) t.push(...[...previous.slot.via].reverse(), roomInside(previous.area));
  if (previous?.area !== to) {
    if (previous) {
      const exit = roomDoor(previous.area);
      t.push(exit, { x: exit.x, z: AISLE_Z });
    }
    const enter = roomDoor(to);
    t.push({ x: enter.x, z: AISLE_Z }, enter);
  }
  t.push(roomInside(to), ...slot.via, slot);
  const result: Vector3[] = [];
  let prev = from;
  for (const p of t) {
    const v = new Vector3(p.x, FLOOR_Y, p.z);
    if (v.distanceTo(prev) > 0.05) result.push(v);
    prev = v;
  }
  return result;
}

/**
 * Majukan `pos` sejauh `distance` menyusuri `path` (titik yang dicapai dibuang dari path).
 * Mengembalikan arah hadap (radian) selama masih berjalan, null bila sudah tiba.
 */
export function advance(pos: Vector3, path: Vector3[], distance: number): number | null {
  let remaining = distance;
  while (remaining > 0 && path.length) {
    const waypoint = path[0];
    const d = Math.hypot(waypoint.x - pos.x, waypoint.z - pos.z);
    if (d <= remaining) {
      pos.set(waypoint.x, FLOOR_Y, waypoint.z);
      path.shift();
      remaining -= d;
    } else {
      pos.x += ((waypoint.x - pos.x) / d) * remaining;
      pos.z += ((waypoint.z - pos.z) / d) * remaining;
      return Math.atan2(waypoint.x - pos.x, waypoint.z - pos.z);
    }
  }
  return null;
}

/** Sudut a menuju b lewat jalur terpendek. */
function turn(a: number, b: number, t: number) {
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + d * Math.min(1, t);
}

function applyPose(f: Figure) {
  const { o, slot } = f;
  o.root.position.set(slot.x, slot.y ?? FLOOR_Y, slot.z);
  o.root.rotation.y = slot.rot;
  for (const k of o.legs) k.rotation.x = slot.pose === 'berdiri' ? 0 : -Math.PI / 2;
  animateIdle(o, 0, f.phase, slot.pose === 'ketik');
}

function disposeTree(root: Object3D) {
  root.traverse((obj) => {
    // Figur dan pin memakai geometri/material bersama dari cache bentuk; jangan dibuang.
    if (!(obj instanceof Mesh) || obj.userData.shared) return;
    obj.geometry.dispose();
    for (const m of Array.isArray(obj.material) ? obj.material : [obj.material]) {
      (m as { map?: { dispose(): void } | null }).map?.dispose();
      m.dispose();
    }
  });
}

export function createMonitoring(
  host: HTMLElement,
  options: {
    onPick: (key: string) => void;
    tag?: HTMLElement | null;
    hover?: HTMLElement | null;
    pins?: HTMLElement | null;
    /** Bingkai siku HTML yang mengapit objek terpilih. */
    mark?: HTMLElement | null;
    /** Garis tepi lantai (SVG) untuk ruang/unit yang dipilih, mengikuti bentuk isometriknya. */
    markRoom?: SVGSVGElement | null;
  },
) {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = VSMShadowMap;
  renderer.shadowMap.autoUpdate = false;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new Scene();
  scene.add(new HemisphereLight(0xfff7ee, 0xcbb8a4, 1.85));
  const light = new DirectionalLight(0xffeed6, 2.5);
  light.position.set(-12, 22, 16);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.radius = 4;
  light.shadow.blurSamples = 4;
  Object.assign(light.shadow.camera, {
    left: -26,
    right: 26,
    top: 26,
    bottom: -26,
    near: 1,
    far: 80,
  });
  light.shadow.normalBias = 0.04;
  scene.add(light);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 160);
  const target = new Vector3();

  const office: SiteScene = buildOffice();
  const island: SiteScene = buildIsland();
  const figureGroup = new Group();
  office.root.add(figureGroup);
  const figures = new Map<string, Figure>();
  let warehouse: (SiteScene & { key: string }) | null = null;
  let stores:
    (SiteScene & { key: string; slots: Record<StoreId, Slot[]>; info: StoreInfo[] }) | null = null;
  const storeFigures = new Map<string, { plan: CharacterPlan; o: PersonRig }>();
  let currentPlans: CharacterPlan[] = [];
  let site: WorldSite = 'kantor';
  let active: SiteScene = office;
  scene.add(office.root);
  let selected = '';
  let follow = false;
  let ambienceKey = '';
  let ambience: Ambience = { weather: 'cerah', phase: 'siang' };
  let angle = START_ANGLE;
  let pins: { key: string; el: HTMLButtonElement }[] = [];
  let zoom = 1,
    frame = 0,
    last = 0,
    disposed = false,
    count = 0;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  function step(dt: number, t: number) {
    let moving = false;
    for (const f of figures.values()) {
      if (!f.path.length) continue;
      moving = true;
      if (f.delay > 0) {
        f.delay -= dt;
        continue;
      }
      const heading = advance(f.o.root.position, f.path, WALK_SPEED * dt);
      if (heading !== null)
        f.o.root.rotation.y = turn(f.o.root.rotation.y, heading, dt * TURN_SPEED);
      if (f.path.length) animateWalk(f.o, t, f.phase);
      else applyPose(f);
    }
    return moving;
  }

  function anchor(key: string) {
    if (key.startsWith('orang:')) {
      const id = key.slice(6);
      const o =
        site === 'kantor'
          ? figures.get(id)?.o
          : site === 'gerai'
            ? storeFigures.get(id)?.o
            : undefined;
      return o ? o.root.position.clone().setY(1.4) : null;
    }
    if (site === 'kantor' && key in OFFICE_ROOMS) {
      const a = roomAnchor(key as OfficeRoom);
      return new Vector3(a.x, a.y, a.z);
    }
    const mesh = active.areas.get(key);
    if (!mesh) return null;
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox as Box3;
    const c = box.getCenter(new Vector3());
    return c.setY(box.max.y + 0.2);
  }

  let lastInput: LogisticsInput | null = null;
  /** Nama singkat objek di bawah kursor; nama hanya muncul saat diarahkan, bukan papan tetap. */
  function hoverName(key: string) {
    if (key.startsWith('orang:'))
      return (figures.get(key.slice(6)) ?? storeFigures.get(key.slice(6)))?.plan.name ?? '';
    if (key.startsWith('g:')) {
      const g = stores?.info.find((i) => i.id === key.slice(2));
      return g ? `${g.name}${g.open ? '' : ' · belum dibuka'}` : '';
    }
    if (site === 'kantor' && key in OFFICE_ROOMS) return OFFICE_ROOMS[key as OfficeRoom].name;
    if (OBJECT_NAMES[key]) return OBJECT_NAMES[key];
    if (key.startsWith('rak-')) return `Rak ${key.slice(4)}`;
    if (key.startsWith('dok-')) return `Dok ${key.slice(4)}`;
    if (key.startsWith('kirim-')) {
      const d = lastInput?.model.deliveries.find((row) => row.id === key.slice(6));
      return d ? String(d.data.license_plate || d.data.title) : 'Truk';
    }
    return '';
  }
  /** Staf unit gerai yang buka berdiri di belakang meja layanan unitnya (tanpa berjalan). */
  function placeStoreFigures() {
    for (const f of storeFigures.values()) {
      f.o.root.removeFromParent();
      disposeCharacter(f.o);
    }
    storeFigures.clear();
    if (!stores) return;
    const counts = new Map<string, number>();
    for (const plan of currentPlans.slice(0, MAX_FIGURES)) {
      if (isOffice(plan.area)) continue;
      const id = plan.area.slice(6) as StoreId;
      const n = counts.get(id) || 0;
      counts.set(id, n + 1);
      const slot = stores.slots[id]?.[n % 3];
      if (!slot || !STORES[id]) continue;
      const o = createCharacter(plan.look);
      o.root.userData.personId = plan.id;
      o.root.traverse((c) => (c.userData.shared = true));
      o.root.position.set(slot.x + Math.floor(n / 3) * 0.5, slot.y ?? FLOOR_Y, slot.z);
      o.root.rotation.y = slot.rot;
      animateIdle(o, 0, n, false);
      stores.root.add(o.root);
      storeFigures.set(plan.id, { plan, o });
    }
    invalidate();
  }
  const projected = new Vector3();
  const selectionBox = new Box3();
  /** Kotak batas dunia objek terpilih: figur, ruang, rak, dok, truk, atau unit gerai. */
  function selectedBounds(key: string): Box3 | null {
    if (key.startsWith('orang:')) {
      const id = key.slice(6);
      const o =
        site === 'kantor'
          ? figures.get(id)?.o
          : site === 'gerai'
            ? storeFigures.get(id)?.o
            : undefined;
      return o ? selectionBox.setFromObject(o.root) : null;
    }
    const mesh = active.areas.get(key);
    if (!mesh) return null;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    mesh.updateWorldMatrix(true, false);
    return selectionBox.copy(mesh.geometry.boundingBox as Box3).applyMatrix4(mesh.matrixWorld);
  }
  function render() {
    const a = selected ? anchor(selected) : null;
    renderer.render(scene, camera);
    host.dataset.frames = String(++count);
    host.dataset.drawCalls = String(renderer.info.render.calls);
    host.dataset.lokasi = site;
    host.dataset.walking = String([...figures.values()].filter((f) => f.path.length).length);
    host.dataset.following = follow ? selected : '';
    host.dataset.cameraTarget = `${target.x.toFixed(2)},${target.z.toFixed(2)}`;
    for (const p of pins) {
      const at = p.key === selected ? null : anchor(p.key);
      if (!at) {
        p.el.hidden = true;
        continue;
      }
      projected.copy(at).project(camera);
      const px = ((projected.x + 1) / 2) * host.clientWidth,
        py = ((1 - projected.y) / 2) * host.clientHeight;
      p.el.hidden = px < 0 || py < 0 || px > host.clientWidth || py > host.clientHeight;
      p.el.style.transform = `translate(${Math.round(px)}px, ${Math.round(py)}px) translate(-50%, -100%)`;
    }
    // Bingkai siku mengikuti ukuran objek di layar; label pil duduk di atas tengah bingkai.
    const w = host.clientWidth,
      h = host.clientHeight;
    const bounds = selected ? selectedBounds(selected) : null;
    const r = bounds ? screenRect(bounds, camera, w, h) : null;
    const isPerson = selected.startsWith('orang:');
    const pad = isPerson ? 6 : 8;
    const visible = !!r && r.x1 > 0 && r.y1 > 0 && r.x0 < w && r.y0 < h;
    // Ruang kantor dan unit gerai: tepi lantai miring; objek lain: bingkai persegi.
    const isRoom = (site === 'kantor' && selected in OFFICE_ROOMS) || selected.startsWith('g:');
    const svg = options.markRoom;
    if (svg) {
      svg.toggleAttribute('data-on', !!(isRoom && bounds && visible));
      if (isRoom && bounds && visible) {
        const y = bounds.min.y + 0.06;
        const p = [
          [bounds.min.x, bounds.min.z],
          [bounds.max.x, bounds.min.z],
          [bounds.max.x, bounds.max.z],
          [bounds.min.x, bounds.max.z],
        ].map(([x, z]) => {
          projected.set(x, y, z).project(camera);
          return [((projected.x + 1) / 2) * w, ((1 - projected.y) / 2) * h];
        });
        const t = (a: number[], b: number[], k: number) =>
          `${(a[0] + (b[0] - a[0]) * k).toFixed(1)},${(a[1] + (b[1] - a[1]) * k).toFixed(1)}`;
        svg
          .querySelector('polygon')
          ?.setAttribute('points', p.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' '));
        svg
          .querySelector('path')
          ?.setAttribute(
            'd',
            p
              .map(
                (q, i) =>
                  `M${t(q, p[(i + 3) % 4], 0.16)}L${q[0].toFixed(1)},${q[1].toFixed(1)}L${t(q, p[(i + 1) % 4], 0.16)}`,
              )
              .join(''),
          );
      }
    }
    const mark = options.mark;
    if (mark) {
      mark.hidden = !visible || isRoom;
      if (r && visible) {
        const bw = Math.max(24, r.x1 - r.x0 + pad * 2),
          bh = Math.max(24, r.y1 - r.y0 + pad * 2);
        mark.style.width = `${Math.round(bw)}px`;
        mark.style.height = `${Math.round(bh)}px`;
        mark.style.transform = `translate(${Math.round((r.x0 + r.x1) / 2 - bw / 2)}px, ${Math.round((r.y0 + r.y1) / 2 - bh / 2)}px)`;
        mark.style.setProperty(
          '--siku',
          `${Math.round(Math.max(10, Math.min(24, Math.min(bw, bh) * 0.24)))}px`,
        );
        mark.dataset.jenis = isPerson ? 'orang' : 'objek';
      }
    }
    const tag = options.tag;
    if (!tag) return;
    if (!a || !r || !visible) {
      tag.hidden = true;
      return;
    }
    const x = (r.x0 + r.x1) / 2,
      y = r.y0 - pad - 6;
    tag.hidden = x < 0 || y < 0 || x > w || y > h;
    tag.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -100%)`;
  }

  function invalidate() {
    if (frame || disposed || document.hidden) return;
    frame = requestAnimationFrame((now) => {
      frame = 0;
      if (disposed) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      const walking = site === 'kantor' && step(dt, now / 1000);
      const a = follow ? anchor(selected) : null;
      const chasing = a ? followCharacter(target, a, dt, reduce) : false;
      if (a) aimCamera();
      render();
      // Render berhenti setelah figur dan kamera tiba; suasana tidak punya loop idle.
      if (walking || chasing) {
        last = now;
        invalidate();
      } else last = 0;
    });
  }

  function aimCamera() {
    camera.position.set(
      target.x + DISTANCE * Math.cos(angle),
      target.y + HEIGHT,
      target.z + DISTANCE * Math.sin(angle),
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();
  }
  function resize() {
    const w = host.clientWidth || 1,
      h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    const css = getComputedStyle(host);
    const inset = (n: string) => parseFloat(css.getPropertyValue(`--inset-${n}`)) || 0;
    let [t, r, b, l] = ['top', 'right', 'bottom', 'left'].map(inset);
    // Kartu melayang menutupi tepi; bingkai kamera digeser ke area kosong bila masih cukup luas.
    if (w - l - r < w * 0.45) l = r = 0;
    if (h - t - b < 160) t = b = 0;
    const vw = w - l - r,
      vh = h - t - b;
    const fit = VIEW_EXTENT[site];
    // Layar potret: denah memanjang tampak kecil bila dipaskan selebar layar, jadi tampilan awal diperbesar
    // (ponsel ±1,5×, tablet ±1,2×).
    const portraitBoost = vh > vw * 1.2 ? Math.min(1.5, 0.6 + 0.45 * (vh / vw)) : 1;
    const half = Math.max(fit.h, fit.w / (vw / vh)) / (zoom * portraitBoost);
    const ppu = vh / (2 * half);
    camera.left = -(vw / 2 + l) / ppu;
    camera.right = (vw / 2 + r) / ppu;
    camera.top = (vh / 2 + t) / ppu;
    camera.bottom = -(vh / 2 + b) / ppu;
    camera.updateProjectionMatrix();
    invalidate();
  }

  // Interaksi: klik memilih, seret (mouse/pena) menggeser, roda menzoom.
  const ray = new Raycaster(),
    point = new Vector2();
  let press: { x: number; y: number; geser: boolean } | null = null;
  // Sentuh: satu jari menggeser, dua jari mencubit untuk zoom; tombol zoom tetap tersedia.
  const touches = new Map<number, { x: number; y: number }>();
  let pinch = 0;
  const pinchDistance = () => {
    const [a, b] = [...touches.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  function pick(e: PointerEvent) {
    const r = renderer.domElement.getBoundingClientRect();
    point.set(((e.clientX - r.left) / r.width) * 2 - 1, 1 - ((e.clientY - r.top) / r.height) * 2);
    ray.setFromCamera(point, camera);
    // Kaca sekat tidak menghalangi klik ke ruang di belakangnya.
    const targets = active.root.children.filter((c) => !c.userData.glass);
    let o: Object3D | null = ray.intersectObjects(targets, true)[0]?.object ?? null;
    while (o && !o.userData.areaKey && !o.userData.personId) o = o.parent;
    if (!o) return '';
    return o.userData.personId ? `orang:${o.userData.personId}` : String(o.userData.areaKey);
  }
  const down = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2) {
        pinch = pinchDistance();
        if (press) press.geser = true;
        return;
      }
    }
    press = { x: e.clientX, y: e.clientY, geser: false };
  };
  const move = (e: PointerEvent) => {
    if (e.pointerType === 'touch' && touches.has(e.pointerId)) {
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2 && pinch) {
        const d = pinchDistance();
        zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom * (d / pinch)));
        pinch = d;
        follow = false;
        resize();
        return;
      }
    }
    if (press && (e.buttons || e.pointerType === 'touch') && touches.size < 2) {
      const dx = e.clientX - press.x,
        dy = e.clientY - press.y;
      if (!press.geser && Math.hypot(dx, dy) < 5) return;
      press.geser = true;
      follow = false;
      renderer.domElement.style.cursor = 'grabbing';
      const wpp = (camera.top - camera.bottom) / (host.clientHeight || 1);
      const rightVec = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
      const upVec = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
      target.addScaledVector(rightVec, -dx * wpp).addScaledVector(upVec, dy * wpp);
      target.x = Math.max(-24, Math.min(24, target.x));
      target.z = Math.max(-13, Math.min(13, target.z));
      press.x = e.clientX;
      press.y = e.clientY;
      aimCamera();
      invalidate();
      return;
    }
    const key = pick(e);
    renderer.domElement.style.cursor = key ? 'pointer' : '';
    const chip = options.hover;
    if (!chip) return;
    const text = key ? hoverName(key) : '';
    chip.hidden = !text;
    if (!text) return;
    if (chip.textContent !== text) chip.textContent = text;
    const r = renderer.domElement.getBoundingClientRect();
    chip.style.transform = `translate(${Math.round(e.clientX - r.left + 14)}px, ${Math.round(e.clientY - r.top + 14)}px)`;
  };
  const leave = () => {
    if (options.hover) options.hover.hidden = true;
  };
  const up = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      touches.delete(e.pointerId);
      if (touches.size < 2) pinch = 0;
      if (touches.size) return;
    }
    const dragged = press?.geser;
    press = null;
    renderer.domElement.style.cursor = '';
    if (dragged) return;
    const key = pick(e);
    if (key) options.onPick(key);
  };
  const wheel = (e: WheelEvent) => {
    e.preventDefault();
    api.zoom(e.deltaY < 0 ? 0.1 : -0.1);
  };
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else invalidate();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const el = renderer.domElement;
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointerleave', leave);
  el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', wheel, { passive: false });
  document.addEventListener('visibilitychange', visibility);
  target.copy(CENTER.kantor);
  aimCamera();
  renderer.shadowMap.needsUpdate = true;
  resize();

  const api = {
    /** Pindah lokasi; gudang/cold storage dibangun ulang hanya bila datanya berubah. */
    show(next: WorldSite, input: LogisticsInput) {
      lastInput = input;
      if (next === 'gerai') {
        const info = storeInfo(input.model);
        const key = JSON.stringify(info.map((g) => [g.id, g.name, g.open]));
        if (stores?.key !== key) {
          if (stores) {
            stores.root.removeFromParent();
            disposeTree(stores.root);
          }
          stores = { ...buildStores(info), key, info };
          placeStoreFigures();
        }
      } else if (next !== 'kantor' && next !== 'pulau') {
        const m = input.model;
        const key = JSON.stringify([
          next,
          input.stock,
          input.deliveries,
          m.inventory.items.map((i) => [i.id, i.updated_at]),
          m.trucks.map((t) => [t.delivery.id, t.place, t.index]),
        ]);
        if (warehouse?.key !== key) {
          if (warehouse) {
            warehouse.root.removeFromParent();
            disposeTree(warehouse.root);
          }
          warehouse = { ...buildWarehouse(input, next === 'pendingin'), key };
        }
      }
      const nextScene =
        next === 'pulau'
          ? island
          : next === 'kantor'
            ? office
            : next === 'gerai'
              ? stores!
              : warehouse!;
      if (nextScene !== active || next !== site) {
        // Figur yang sedang berjalan langsung tiba bila kantor ditinggalkan.
        for (const f of figures.values()) {
          f.path = [];
          applyPose(f);
        }
        active.root.removeFromParent();
        scene.add(nextScene.root);
        active = nextScene;
        ambienceKey = '';
        site = next;
        follow = false;
        target.copy(CENTER[next]);
        zoom = 1;
        aimCamera();
        renderer.shadowMap.needsUpdate = true;
        resize();
      }
      api.setAmbience(ambience);
      invalidate();
    },
    /** Figur mengikuti rencana aktivitas; perpindahan ruang dianimasikan lewat lorong. */
    setPlans(plans: CharacterPlan[]) {
      currentPlans = plans;
      placeStoreFigures();
      const shown = plans.slice(0, MAX_FIGURES).filter((p) => isOffice(p.area));
      const counts = new Map<OfficeRoom, number>();
      const present = new Set(shown.map((p) => p.id));
      for (const [id, f] of figures) {
        if (present.has(id)) continue;
        f.o.root.removeFromParent();
        disposeCharacter(f.o);
        figures.delete(id);
      }
      let order = 0;
      shown.forEach((plan, i) => {
        if (!isOffice(plan.area)) return;
        const n = counts.get(plan.area) || 0;
        if (plan.action !== 'manage') counts.set(plan.area, n + 1);
        // Meja manajer hanya untuk figur manajer; figur lain memakai tempat sisanya.
        const managerSlot = SLOT[plan.area].find((s) => s.isManager);
        const freeSlots = SLOT[plan.area].filter((s) => !s.isManager);
        const slot =
          plan.action === 'manage' && managerSlot
            ? managerSlot
            : n < freeSlots.length
              ? freeSlots[n]
              : extraSlot(plan.area, n - freeSlots.length);
        let f = figures.get(plan.id);
        if (!f) {
          const o = createCharacter(plan.look);
          o.root.userData.personId = plan.id;
          o.root.traverse((c) => (c.userData.shared = true));
          o.root.position.set(WAREHOUSE_DOOR.x, FLOOR_Y, WAREHOUSE_DOOR.z);
          figureGroup.add(o.root);
          f = {
            plan,
            o,
            area: plan.area,
            slot,
            path: [],
            phase: i * 1.7,
            delay: order++ * STAGGER,
          };
          figures.set(plan.id, f);
          f.path = reduce ? [] : walkPath(o.root.position, null, plan.area, slot);
        } else if (f.area !== plan.area || f.slot.x !== slot.x || f.slot.z !== slot.z) {
          // Figur yang masih berjalan menyelesaikan rute lamanya dulu, lalu berangkat lagi.
          const pathEnd = f.path.at(-1) ?? f.o.root.position;
          if (!f.path.length) f.delay = order++ * STAGGER;
          f.path = reduce
            ? []
            : [...f.path, ...walkPath(pathEnd, { area: f.area, slot: f.slot }, plan.area, slot)];
        }
        f.plan = plan;
        f.area = plan.area;
        f.slot = slot;
        if (!f.path.length) applyPose(f);
      });
      invalidate();
    },
    select(key: string) {
      if (key !== selected && key.startsWith('orang:')) {
        zoom = 1.9;
        resize();
      }
      selected = key;
      follow = key.startsWith('orang:');
      for (const [id, mesh] of active.areas) {
        const selectedArea = key.startsWith('orang:')
          ? (figures.get(key.slice(6))?.area ??
            storeFigures.get(key.slice(6))?.plan.area.replace('gerai:', 'g:'))
          : '';
        const on = id === key || selectedArea === id;
        mesh.material.emissive.set(on ? 0x2f4d8a : 0);
        mesh.material.emissiveIntensity = on ? 0.14 : 0;
      }
      invalidate();
    },
    setAmbience(next: Ambience) {
      ambience = next;
      const key = `${next.weather}:${next.phase}`;
      if (key === ambienceKey) return;
      ambienceKey = key;
      active.root.traverse((obj) => {
        if (!(obj instanceof Mesh) || !obj.userData.panorama) return;
        obj.material.map?.dispose();
        obj.material.map = panorama(next);
        obj.material.needsUpdate = true;
      });
      const night = next.phase === 'malam';
      light.color.set(next.phase === 'senja' ? 0xffc7a0 : night ? 0xc6d5ff : 0xffeed6);
      light.intensity = night ? 1.2 : next.weather === 'hujan' ? 1.8 : 2.5;
      renderer.shadowMap.needsUpdate = true;
      invalidate();
    },
    zoom(delta: number) {
      // Langkah berlipat agar rentang 0,6–5× terasa rata: tiap klik ±20 %, roda ±10 %.
      const factor = delta > 0 ? 1 + delta : 1 / (1 - delta);
      zoom = delta ? Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom * factor)) : 1;
      resize();
    },
    /** Putar kamera satu langkah (−1 kiri, 1 kanan) dalam batas aman; mengembalikan sudut. */
    rotate(heading: number) {
      angle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angle + Math.sign(heading) * ROTATE_STEP));
      aimCamera();
      resize();
      return angle;
    },
    /** Pin biru di atas objek yang perlu perhatian; klik memilih objeknya. */
    setPins(list: AttentionPin[]) {
      const container = options.pins;
      if (!container) return;
      for (const p of pins) p.el.remove();
      pins = list.map(({ key, label }) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = PIN_CLASS;
        el.hidden = true;
        el.setAttribute('aria-label', label);
        el.title = label;
        el.innerHTML = PIN_SVG;
        el.addEventListener('click', () => options.onPick(key));
        container.appendChild(el);
        return { key, el };
      });
      invalidate();
    },
    home() {
      follow = false;
      target.copy(CENTER[site]);
      angle = START_ANGLE;
      zoom = 1;
      aimCamera();
      resize();
    },
    destroy() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
      if (options.hover) options.hover.hidden = true;
      for (const p of pins) p.el.remove();
      for (const f of figures.values()) disposeCharacter(f.o);
      for (const f of storeFigures.values()) disposeCharacter(f.o);
      disposeTree(office.root);
      disposeTree(island.root);
      if (warehouse) disposeTree(warehouse.root);
      if (stores) disposeTree(stores.root);
      if (options.mark) options.mark.hidden = true;
      options.markRoom?.removeAttribute('data-on');
      light.shadow.dispose();
      renderer.dispose();
      el.remove();
    },
  };
  return api;
}
