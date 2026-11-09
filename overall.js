import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

/* ============================================================
   CAMPUS LIFE 3D
   Shared module for Menu.html and index.html.
   ============================================================ */

const IS_MENU = document.body.dataset.page === 'menu';
const IS_GAME = document.body.dataset.page === 'game';
const VERSION = '1.0.0';

/* ============================================================
   ASSET MANIFEST
   All URLs are direct GLB file URLs. Licences are recorded in
   the menu Credits panel and in comments here.

   Characters:
     Three.js examples — MIT licence.
   Buildings / furniture / trees / cars:
     Kenney packs — CC0 1.0, via Flockbay direct-file URLs.
   Additional Quaternius packs are referenced in the manifest
   with poly.pizza model pages; if a CDN URL is unavailable the
   loader falls back to the Three.js example characters or
   stylised procedural geometry.
   ============================================================ */
const ASSETS = {
  // ---- Characters (Three.js examples, MIT) ----
  soldier: {
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb',
    kind: 'character', license: 'MIT · Three.js examples'
  },
  xbot: {
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Xbot.glb',
    kind: 'character', license: 'MIT · Three.js examples'
  },
  robot: {
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    kind: 'character', license: 'MIT · Three.js examples'
  },

  // ---- Buildings (Kenney City Kit, CC0, direct GLB) ----
  buildingC: {
    url: 'https://api.flockbay.com/bootstrap/library/models/v1/398257d85bc138af91aee5585bff4d44184e0e399fdf52872736b9e01fe763ea/building-c.glb',
    kind: 'building', license: 'CC0 · Kenney City Kit (Commercial)'
  },
  skyscraper: {
    url: 'https://api.flockbay.com/bootstrap/library/models/v1/7131bee18198d2969ce385279935b8b56c2b30c94dc905539fa9933dda477ea7/building-skyscraper-a.glb',
    kind: 'building', license: 'CC0 · Kenney City Kit (Commercial)'
  },
  buildingR: {
    url: 'https://api.flockbay.com/bootstrap/library/models/v1/6249c8ba5aa8b4a96ec46e4204683cea7119036624019a7e5c68430ac95171bf/building-r.glb',
    kind: 'building', license: 'CC0 · Kenney City Kit (Industrial)'
  },

  // ---- Vehicles (Kenney Car Kit, CC0) ----
  hatchback: {
    url: 'https://api.flockbay.com/bootstrap/library/models/v1/c66cb91dc8b5bf8b1c1512b03d534c939b2f32bb61a3f6f65dde8cfd13b962a8/hatchback-sports.glb',
    kind: 'vehicle', license: 'CC0 · Kenney Car Kit'
  },
  suv: {
    url: 'https://api.flockbay.com/bootstrap/library/models/v1/36a293b49845a4edd0b29b32724d7248fa70c6fc906fbf39a2c27f84f7194a80/suv-luxury.glb',
    kind: 'vehicle', license: 'CC0 · Kenney Car Kit'
  },

  // ---- Furniture (Kenney Furniture Kit, CC0) ----
  chair: {
    url: 'https://api.flockbay.com/bootstrap/library/models/v1/fee3be9509f6caf7a26d329713ccd9a63a85ce63abea01aa1fefbaf823b40b9c/chair.glb',
    kind: 'furniture', license: 'CC0 · Kenney Furniture Kit'
  },
  chairRounded: {
    url: 'https://api.flockbay.com/bootstrap/library/models/v1/57a40eb404e7d4bb1f0d9ffaa0977b7c85bedd14abf18493fded2fcb0f6404ab/chairRounded.glb',
    kind: 'furniture', license: 'CC0 · Kenney Furniture Kit'
  },
  table: {
    url: 'https://api.flockbay.com/bootstrap/library/models/v1/1cd2214d54dbc5093f8a929873bac25bea5f447625adedd05a34e501ba2a2f9c/table.glb',
    kind: 'furniture', license: 'CC0 · Kenney Furniture Kit'
  },
  desk: {
    url: 'https://api.flockbay.com/bootstrap/library/models/v1/8b07be60cca38a1bcc2e6aeaaaad14e5769256dbaeb21b4a75299b5496581b84/desk.glb',
    kind: 'furniture', license: 'CC0 · Kenney Furniture Kit'
  },
  bed: {
    url: 'https://api.flockbay.com/bootstrap/library/models/v1/19e963aab9c948489c208a7fd74f5791e9e6334b83be5b4fdcf6b87794080353/bedDouble.glb',
    kind: 'furniture', license: 'CC0 · Kenney Furniture Kit'
  },

  // ---- Nature (Kenney Nature Kit, CC0) ----
  treeDetailed: {
    url: 'https://api.flockbay.com/bootstrap/library/models/v1/45aa01e39da9d3f48f64448343434c7ad994c5fc63fc651ce7eadac8a2750538/tree_detailed.glb',
    kind: 'nature', license: 'CC0 · Kenney Nature Kit'
  },
  treeDefault: {
    url: 'https://api.flockbay.com/bootstrap/library/models/v1/d1bda7bfbb4953bfc61e9f03411f7eda288bb2d94056e7b244572f3de67c7f7e/tree_default.glb',
    kind: 'nature', license: 'CC0 · Kenney Nature Kit'
  }
};

/* ============================================================
   UTILITY
   ============================================================ */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const todayKey = () => new Date().toISOString().slice(0, 10);

function makeId(prefix = 'id') {
  return prefix + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

function deepClone(obj) {
  return obj == null ? obj : JSON.parse(JSON.stringify(obj));
}

function formatMoney(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function formatTime(minutes) {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = Math.floor(m % 60);
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function toast(msg, ms = 2800) {
  const el = document.getElementById('toast') || document.getElementById('notification');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), ms);
}

/* ============================================================
   INDEXEDDB SAVE MANAGER
   ============================================================ */
class SaveManager {
  constructor() {
    this.dbName = 'campusLifeDB';
    this.storeName = 'saves';
    this.db = null;
  }

  async open() {
    if (this.db) return this.db;
    this.db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt');
        }
      };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    });
    return this.db;
  }

  async save(data, slotId = 'autosave') {
    const db = await this.open();
    const record = {
      id: slotId,
      updatedAt: Date.now(),
      version: VERSION,
      ...deepClone(data)
    };
    await new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).put(record);
      tx.oncomplete = resolve;
      tx.onerror = e => reject(e.target.error);
    });
    return record;
  }

  async load(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const req = tx.objectStore(this.storeName).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = e => reject(e.target.error);
    });
  }

  async list() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const req = tx.objectStore(this.storeName).getAll();
      req.onsuccess = () => resolve((req.result || []).sort((a, b) => b.updatedAt - a.updatedAt));
      req.onerror = e => reject(e.target.error);
    });
  }

  async remove(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).delete(id);
      tx.oncomplete = resolve;
      tx.onerror = e => reject(e.target.error);
    });
  }

  async latest() {
    const all = await this.list();
    return all[0] || null;
  }
}

const saveManager = new SaveManager();

/* ============================================================
   ASSET MANAGER
   ============================================================ */
class AssetManager {
  constructor(onProgress) {
    this.loader = new GLTFLoader();
    this.cache = new Map();
    this.onProgress = onProgress || (() => {});
    this.failed = [];
  }

  load(key) {
    if (this.cache.has(key)) return this.cache.get(key);
    const meta = ASSETS[key];
    if (!meta) return Promise.reject(new Error('Unknown asset: ' + key));

    const promise = new Promise((resolve, reject) => {
      this.loader.load(
        meta.url,
        gltf => {
          gltf.scene.traverse(o => {
            if (o.isMesh) {
              o.castShadow = true;
              o.receiveShadow = true;
              if (o.material) o.material.side = THREE.FrontSide;
            }
          });
          this.cache.set(key, Promise.resolve(gltf));
          this.onProgress(key, true);
          resolve(gltf);
        },
        xhr => {
          if (xhr.total) this.onProgress(key, false, xhr.loaded / xhr.total);
        },
        err => {
          console.warn('[Asset] failed:', key, meta.url, err);
          this.failed.push(key);
          this.cache.delete(key);
          this.onProgress(key, false, 1, true);
          reject(err);
        }
      );
    });

    this.cache.set(key, promise);
    return promise;
  }

  async safeLoad(key) {
    try { return await this.load(key); }
    catch { return null; }
  }

  cloneScene(gltf) {
    if (!gltf || !gltf.scene) return null;
    const scene = cloneSkeleton(gltf.scene);
    scene.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material) o.material = o.material.clone();
      }
    });
    return scene;
  }
}

/* ============================================================
   CHARACTER HELPERS
   ============================================================ */
function findBone(root, names) {
  let found = null;
  root.traverse(o => {
    if (!found && o.isBone && names.some(n => o.name.toLowerCase().includes(n.toLowerCase()))) found = o;
  });
  return found;
}

function tintCharacter(root, color, intensity = 0.75) {
  if (!root || !color) return;
  const c = new THREE.Color(color);
  root.traverse(o => {
    if (o.isMesh && o.material) {
      if (Array.isArray(o.material)) {
        o.material = o.material.map(m => {
          const mm = m.clone();
          if (mm.color) mm.color.lerp(c, intensity);
          return mm;
        });
      } else {
        const mm = o.material.clone();
        if (mm.color) mm.color.lerp(c, intensity);
        o.material = mm;
      }
    }
  });
}

function addHair(root, color = '#2b1d14', style = 'short') {
  if (!root) return;
  const head = findBone(root, ['Head', 'head', 'mixamorigHead']);
  if (!head) return;
  const hairMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  const group = new THREE.Group();
  group.name = 'Hair';

  if (style === 'mohawk') {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.28), hairMat);
    m.position.y = 0.16;
    group.add(m);
  } else if (style === 'bun') {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), hairMat);
    m.position.set(0, 0.17, -0.12);
    group.add(m);
  } else if (style === 'long') {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.28, 4, 8), hairMat);
    m.position.set(0, 0.02, -0.06);
    group.add(m);
  } else if (style === 'curly') {
    for (let i = 0; i < 7; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), hairMat);
      m.position.set(rand(-0.1, 0.1), 0.13 + rand(-0.04, 0.04), rand(-0.1, 0.1));
      group.add(m);
    }
  } else {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.135, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
    m.position.y = 0.09;
    group.add(m);
  }

  group.scale.setScalar(0.9);
  head.add(group);
}

function addAccessory(root, type, color = '#ffffff') {
  if (!root || !type || type === 'none') return;
  const head = findBone(root, ['Head', 'head', 'mixamorigHead']);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.2 });
  const g = new THREE.Group();
  g.name = 'Accessory';

  if (type === 'glasses' && head) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.02), mat);
    frame.position.set(0, 0.04, 0.12);
    g.add(frame);
    const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.015), new THREE.MeshStandardMaterial({ color: '#111827', transparent: true, opacity: 0.5 }));
    lensL.position.set(-0.06, 0.04, 0.13); g.add(lensL);
    const lensR = lensL.clone(); lensR.position.x = 0.06; g.add(lensR);
    head.add(g);
  } else if (type === 'cap' && head) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.08, 12), mat);
    cap.position.y = 0.17; g.add(cap);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.12), mat);
    brim.position.set(0, 0.14, 0.12); g.add(brim);
    head.add(g);
  } else if (type === 'backpack') {
    const torso = findBone(root, ['Spine1', 'Spine', 'mixamorigSpine1']);
    if (torso) {
      const bag = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.16), mat);
      bag.position.set(0, 0.05, -0.18);
      g.add(bag);
      torso.add(g);
    }
  } else if (type === 'watch') {
    const hand = findBone(root, ['RightHand', 'mixamorigRightHand']);
    if (hand) {
      const w = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 12), mat);
      w.rotation.x = Math.PI / 2;
      g.add(w);
      hand.add(g);
    }
  }
}

function createFallbackHuman(color = '#3b6ea8') {
  const g = new THREE.Group();
  g.name = 'FallbackHuman';
  const skin = new THREE.MeshStandardMaterial({ color: '#d9a06b', roughness: 0.8 });
  const cloth = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
  const dark = new THREE.MeshStandardMaterial({ color: '#20242c', roughness: 0.8 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.62, 0.24), cloth);
  torso.position.y = 1.05; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), skin);
  head.position.y = 1.55; g.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.165, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: '#2b1d14' }));
  hair.position.y = 1.61; g.add(hair);
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.56, 0.11), cloth);
  armL.position.set(-0.3, 1.05, 0); g.add(armL);
  const armR = armL.clone(); armR.position.x = 0.3; g.add(armR);
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.6, 0.14), dark);
  legL.position.set(-0.12, 0.4, 0); g.add(legL);
  const legR = legL.clone(); legR.position.x = 0.12; g.add(legR);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

/* ============================================================
   NAMES / PERSONALITY DATA
   ============================================================ */
const FIRST_NAMES = ['Aarav', 'Maya', 'Rohan', 'Isha', 'Kabir', 'Sara', 'Arjun', 'Nina', 'Dev', 'Zara', 'Leo', 'Mira', 'Noah', 'Aisha', 'Vikram', 'Tara', 'Sam', 'Priya', 'Ethan', 'Ananya'];
const LAST_NAMES = ['Sharma', 'Patel', 'Khan', 'Iyer', 'Mehta', 'Nair', 'Singh', 'Bose', 'Kapoor', 'Rao', 'Dutta', 'Joshi', 'Malhotra', 'Verma'];
const PERSONALITIES = ['introverted', 'extroverted', 'confident', 'shy', 'funny', 'sarcastic', 'intelligent', 'ambitious', 'rebellious', 'friendly', 'competitive'];
const ROLES = ['student', 'student', 'student', 'student', 'student', 'professor', 'lecturer', 'security', 'cafeteria', 'librarian', 'admin'];
const DEPARTMENTS = ['Computer Science', 'Business', 'Law', 'Psychology', 'Mechanical Engineering', 'Arts', 'Physics', 'Mathematics'];
const CLOTHES = ['#3b6ea8', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2', '#4b5563', '#be185d'];

/* ============================================================
   MENU SCENE
   ============================================================ */
class MenuScene {
  constructor() {
    this.canvas = document.getElementById('menu-canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#070a14');
    this.scene.fog = new THREE.Fog('#070a14', 40, 170);

    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 500);
    this.clock = new THREE.Clock();
    this.assets = new AssetManager();
    this.walkers = [];
    this.vehicles = [];
    this.ready = false;

    this.setupLights();
    this.setupWorld();
    this.resize();
    addEventListener('resize', () => this.resize());
    this.animate();
  }

  setupLights() {
    const hemi = new THREE.HemisphereLight('#cfe8ff', '#1a2436', 1.1);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight('#fff1d6', 2.2);
    sun.position.set(35, 60, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -80;
    sun.shadow.camera.right = 80;
    sun.shadow.camera.top = 80;
    sun.shadow.camera.bottom = -80;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 200;
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight('#6b8cff', 0.35));
  }

  async setupWorld() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({ color: '#1d3a26', roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const road = new THREE.Mesh(new THREE.PlaneGeometry(26, 220), new THREE.MeshStandardMaterial({ color: '#20242c', roughness: 0.9 }));
    road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, 10); this.scene.add(road);

    const [buildingC, skyscraper, buildingR, tree1, tree2, soldier, xbot, car] = await Promise.all([
      this.assets.safeLoad('buildingC'),
      this.assets.safeLoad('skyscraper'),
      this.assets.safeLoad('buildingR'),
      this.assets.safeLoad('treeDetailed'),
      this.assets.safeLoad('treeDefault'),
      this.assets.safeLoad('soldier'),
      this.assets.safeLoad('xbot'),
      this.assets.safeLoad('hatchback')
    ]);

    const addBuilding = (gltf, x, z, scale, ry = 0) => {
      if (!gltf) return;
      const m = this.assets.cloneScene(gltf);
      m.position.set(x, 0, z);
      m.scale.setScalar(scale);
      m.rotation.y = ry;
      this.scene.add(m);
    };

    addBuilding(skyscraper, -42, -42, 7, 0.2);
    addBuilding(buildingC, 34, -30, 11, -0.4);
    addBuilding(buildingR, -18, -60, 8, 0.6);
    addBuilding(buildingC, 52, 18, 7, 0.9);

    const addTree = (gltf, x, z, s = 1) => {
      if (!gltf) return;
      const m = this.assets.cloneScene(gltf);
      m.position.set(x, 0, z); m.scale.setScalar(s); this.scene.add(m);
    };
    for (let i = 0; i < 28; i++) {
      const gltf = i % 2 ? tree1 : tree2;
      addTree(gltf, rand(-90, 90), rand(-90, 90), rand(1.4, 3.2));
    }

    const addWalker = (gltf, x, z, speed, color) => {
      if (!gltf) return;
      const model = this.assets.cloneScene(gltf);
      model.position.set(x, 0, z);
      model.scale.setScalar(1.1);
      tintCharacter(model, color, 0.55);
      this.scene.add(model);
      const mixer = new THREE.AnimationMixer(model);
      const idle = gltf.animations.find(a => /idle/i.test(a.name));
      const walk = gltf.animations.find(a => /walk/i.test(a.name));
      if (idle) mixer.clipAction(idle).play();
      if (walk) {
        const a = mixer.clipAction(walk);
        a.play(); a.timeScale = speed;
      }
      this.walkers.push({ model, mixer, speed, dir: Math.random() > 0.5 ? 1 : -1, z });
    };

    for (let i = 0; i < 8; i++) addWalker(soldier, rand(-10, 10), rand(-55, 40), rand(0.6, 1.2), pick(CLOTHES));
    for (let i = 0; i < 8; i++) addWalker(xbot, rand(-10, 10), rand(-55, 40), rand(0.6, 1.2), pick(CLOTHES));

    if (car) {
      for (let i = 0; i < 3; i++) {
        const v = this.assets.cloneScene(car);
        v.position.set(rand(-20, 20), 0, rand(-70, 50));
        v.rotation.y = rand(0, Math.PI * 2);
        v.scale.setScalar(2.0);
        this.scene.add(v);
        this.vehicles.push({ model: v, speed: rand(2, 5), z: v.position.z });
      }
    }

    this.ready = true;
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = performance.now() * 0.0001;

    this.camera.position.set(Math.sin(t) * 34, 14 + Math.sin(t * 1.7) * 2, Math.cos(t) * 34 + 8);
    this.camera.lookAt(0, 4, -10);

    for (const w of this.walkers) {
      w.mixer.update(dt);
      w.model.position.z += w.speed * dt * w.dir;
      if (w.model.position.z > 55) w.dir = -1;
      if (w.model.position.z < -70) w.dir = 1;
      w.model.rotation.y = w.dir > 0 ? 0 : Math.PI;
    }
    for (const v of this.vehicles) {
      v.model.position.z += v.speed * dt;
      if (v.model.position.z > 60) v.model.position.z = -80;
    }
    this.renderer.render(this.scene, this.camera);
  }
}

/* ============================================================
   CHARACTER PREVIEW (menu creator)
   ============================================================ */
class CharacterPreview {
  constructor() {
    this.canvas = document.getElementById('preview-canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0b1020');
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    this.camera.position.set(0, 1.5, 3.4);
    this.camera.lookAt(0, 1.05, 0);
    this.scene.add(new THREE.HemisphereLight('#dbeafe', '#1f2937', 1.4));
    const key = new THREE.DirectionalLight('#ffffff', 2.2);
    key.position.set(2, 4, 3); this.scene.add(key);
    const rim = new THREE.DirectionalLight('#5cc8ff', 1.3);
    rim.position.set(-3, 2, -2); this.scene.add(rim);
    this.scene.add(new THREE.AmbientLight('#8090ff', 0.4));

    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.05, 32), new THREE.MeshStandardMaterial({ color: '#1a2740', roughness: 0.8 }));
    disc.position.y = -0.02; this.scene.add(disc);

    this.assets = new AssetManager();
    this.model = null;
    this.gltf = null;
    this.rotation = 0;
    this.dragging = false;
    this.lastX = 0;
    this.resize();
    addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('pointerdown', e => { this.dragging = true; this.lastX = e.clientX; });
    addEventListener('pointerup', () => { this.dragging = false; });
    addEventListener('pointermove', e => {
      if (!this.dragging) return;
      this.rotation += (e.clientX - this.lastX) * 0.01;
      this.lastX = e.clientX;
    });

    this.animate();
    this.load('male');
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    const w = Math.max(r.width, 1), h = Math.max(r.height, 1);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  async load(base) {
    const key = base === 'female' ? 'xbot' : 'soldier';
    try {
      const gltf = await this.assets.load(key);
      this.gltf = gltf;
      if (this.model) this.scene.remove(this.model);
      this.model = this.assets.cloneScene(gltf);
      this.model.scale.setScalar(1.05);
      this.scene.add(this.model);
      this.applyAppearance();
    } catch {
      if (this.model) this.scene.remove(this.model);
      this.model = createFallbackHuman('#3b6ea8');
      this.scene.add(this.model);
    }
  }

  applyAppearance() {
    if (!this.model) return;
    const cloth = document.getElementById('c-cloth')?.value || '#3b6ea8';
    const hairColor = document.getElementById('c-haircolor')?.value || '#2b1d14';
    const hairStyle = document.getElementById('c-hair')?.value || 'short';
    const accessory = document.getElementById('c-accessory')?.value || 'none';
    const skin = document.getElementById('c-skin')?.value || '#d9a06b';
    const height = parseFloat(document.getElementById('c-height')?.value || '1');
    const build = parseFloat(document.getElementById('c-build')?.value || '1');

    tintCharacter(this.model, cloth, 0.7);
    this.model.scale.set(1.05 * build, 1.05 * height, 1.05 * build);

    const oldHair = this.model.getObjectByName('Hair');
    if (oldHair) oldHair.parent.remove(oldHair);
    addHair(this.model, hairColor, hairStyle);

    const oldAcc = this.model.getObjectByName('Accessory');
    if (oldAcc) oldAcc.parent.remove(oldAcc);
    addAccessory(this.model, accessory, '#f8fafc');

    // Skin tint is applied to the head bone's skinned mesh material where possible.
    const headBone = findBone(this.model, ['Head', 'head']);
    if (headBone) {
      this.model.traverse(o => {
        if (o.isSkinnedMesh && o.material) {
          const mm = o.material.clone();
          if (mm.color && /skin|body|head/i.test(o.name)) mm.color.set(skin);
          o.material = mm;
        }
      });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.model) this.model.rotation.y = this.rotation;
    this.renderer.render(this.scene, this.camera);
  }
}

/* ============================================================
   MENU CONTROLLER
   ============================================================ */
class MenuController {
  constructor() {
    this.assets = new AssetManager();
    this.selectedPersonality = new Set(['friendly', 'ambitious']);
    this.preview = null;
    this.initUI();
    this.initPreview();
    this.bind();
  }

  initUI() {
    document.querySelectorAll('.panel-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeAll());
    });
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const p = chip.dataset.p;
        if (this.selectedPersonality.has(p)) {
          this.selectedPersonality.delete(p);
          chip.classList.remove('active');
        } else {
          this.selectedPersonality.add(p);
          chip.classList.add('active');
        }
      });
    });
    ['friendly', 'ambitious'].forEach(p => {
      document.querySelector(`.chip[data-p="${p}"]`)?.classList.add('active');
    });
  }

  initPreview() {
    const canvas = document.getElementById('preview-canvas');
    if (!canvas) return;
    // Delay until the creator panel is visible, then create the preview renderer.
    const observer = new MutationObserver(() => {
      if (!document.getElementById('panel-creator').classList.contains('hidden')) {
        if (!this.preview) this.preview = new CharacterPreview();
        else this.preview.resize();
        this.preview.applyAppearance();
      }
    });
    observer.observe(document.getElementById('panel-creator'), { attributes: true, attributeFilter: ['class'] });
  }

  bind() {
    document.getElementById('btn-new')?.addEventListener('click', () => this.open('creator'));
    document.getElementById('btn-continue')?.addEventListener('click', () => this.continueGame());
    document.getElementById('btn-load')?.addEventListener('click', () => this.openSaves());
    document.getElementById('btn-gallery')?.addEventListener('click', () => this.openGallery());
    document.getElementById('btn-settings')?.addEventListener('click', () => this.open('settings'));
    document.getElementById('btn-credits')?.addEventListener('click', () => this.open('credits'));

    document.getElementById('btn-creator-next')?.addEventListener('click', () => {
      this.saveDraftCharacter();
      this.open('college');
    });
    document.getElementById('btn-college-back')?.addEventListener('click', () => this.open('creator'));
    document.getElementById('btn-randomize')?.addEventListener('click', () => this.randomize());
    document.getElementById('btn-college-generate')?.addEventListener('click', () => this.renderCollegePreview());
    document.getElementById('btn-start-game')?.addEventListener('click', () => this.startGame());
    document.getElementById('btn-settings-save')?.addEventListener('click', () => this.saveSettings());

    const form = document.getElementById('panel-creator');
    form?.addEventListener('input', () => this.preview?.applyAppearance());
    form?.addEventListener('change', e => {
      if (e.target.id === 'c-base') this.preview?.load(e.target.value);
      else this.preview?.applyAppearance();
    });

    document.getElementById('c-first')?.addEventListener('input', () => {
      const badge = document.getElementById('preview-badge');
      if (badge) badge.textContent = 'LIVE · ' + (document.getElementById('c-first').value || 'Student');
    });
  }

  open(name) {
    this.closeAll();
    document.getElementById('panel-' + name)?.classList.remove('hidden');
  }

  closeAll() {
    document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
  }

  saveDraftCharacter() {
    const data = this.collectCharacter();
    localStorage.setItem('campusLife.draftCharacter', JSON.stringify(data));
    const chars = JSON.parse(localStorage.getItem('campusLife.characters') || '[]');
    const existing = chars.findIndex(c => c.id === data.id);
    if (existing >= 0) chars[existing] = data; else chars.push(data);
    localStorage.setItem('campusLife.characters', JSON.stringify(chars.slice(-20)));
  }

  collectCharacter() {
    const val = id => document.getElementById(id)?.value || '';
    return {
      id: localStorage.getItem('campusLife.currentCharacterId') || makeId('char'),
      first: val('c-first') || 'Alex',
      last: val('c-last') || 'Morgan',
      nickname: val('c-nickname'),
      age: parseInt(val('c-age') || '18', 10),
      gender: val('c-gender'),
      pronouns: val('c-pronouns'),
      country: val('c-country'),
      hometown: val('c-hometown'),
      base: val('c-base'),
      hair: val('c-hair'),
      hairColor: val('c-haircolor'),
      skin: val('c-skin'),
      eyes: val('c-eyes'),
      height: parseFloat(val('c-height') || '1'),
      build: parseFloat(val('c-build') || '1'),
      clothing: val('c-cloth'),
      shoes: val('c-shoes'),
      accessory: val('c-accessory'),
      personality: Array.from(this.selectedPersonality),
      wealth: val('c-wealth'),
      familyJob: val('c-familyjob'),
      prevEdu: val('c-prevedu'),
      finance: val('c-finance'),
      history: val('c-history'),
      interests: val('c-interests')
    };
  }

  randomize() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    set('c-first', pick(FIRST_NAMES));
    set('c-last', pick(LAST_NAMES));
    set('c-nickname', '');
    set('c-age', String(Math.floor(rand(17, 24))));
    set('c-base', Math.random() > 0.5 ? 'male' : 'female');
    set('c-hair', pick(['short', 'long', 'bun', 'mohawk', 'curly']));
    set('c-haircolor', pick(['#2b1d14', '#5a3a22', '#c9a46a', '#111827', '#7c2d12']));
    set('c-skin', pick(['#f1c7a5', '#d9a06b', '#b57445', '#7a4a2a', '#4a2c1a']));
    set('c-cloth', pick(CLOTHES));
    set('c-accessory', pick(['none', 'glasses', 'cap', 'backpack', 'watch']));
    set('c-history', 'A student with a complicated past and something to prove.');
    this.selectedPersonality.clear();
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    for (let i = 0; i < 3; i++) {
      const p = pick(PERSONALITIES);
      this.selectedPersonality.add(p);
      document.querySelector(`.chip[data-p="${p}"]`)?.classList.add('active');
    }
    this.preview?.load(document.getElementById('c-base').value);
    this.preview?.applyAppearance();
  }

  collectCollege() {
    const val = id => document.getElementById(id)?.value || '';
    return {
      type: val('col-type'),
      name: val('col-name') || 'Northgate University',
      country: val('col-country'),
      city: val('col-city'),
      reputation: val('col-reputation'),
      size: val('col-size'),
      population: parseInt(val('col-population') || '8000', 10),
      tuition: parseInt(val('col-tuition') || '120000', 10),
      hostel: val('col-hostel'),
      difficulty: val('col-difficulty'),
      culture: val('col-culture'),
      description: val('col-description')
    };
  }

  renderCollegePreview() {
    const c = this.collectCollege();
    const el = document.getElementById('college-preview');
    if (!el) return;
    el.innerHTML = `
      <div class="college-preview-placeholder">
        <span class="big-icon">🏛️</span>
        <h3 style="margin:0 0 4px">${c.name}</h3>
        <p style="margin:0 0 10px">${c.city}, ${c.country}</p>
        <p class="muted" style="font-size:11px;line-height:1.6">${c.type} · ${c.reputation} reputation<br>${c.population.toLocaleString()} students · ${c.culture} culture<br>Hostel: ${c.hostel} · Difficulty: ${c.difficulty}</p>
        <p style="font-size:11px;color:#8d9ab3;max-width:280px;margin:14px auto 0">${c.description}</p>
      </div>`;
  }

  saveSettings() {
    const settings = {
      quality: document.getElementById('set-quality').value,
      shadows: document.getElementById('set-shadows').value,
      proxy: document.getElementById('set-proxy').value.trim(),
      model: document.getElementById('set-model').value.trim(),
      autosave: document.getElementById('set-autosave').value
    };
    localStorage.setItem('campusLife.settings', JSON.stringify(settings));
    toast('Settings saved.');
  }

  async startGame() {
    const character = this.collectCharacter();
    const college = this.collectCollege();
    const config = { character, college, startedAt: Date.now() };
    localStorage.setItem('campusLife.pendingGame', JSON.stringify(config));
    localStorage.setItem('campusLife.currentCharacterId', character.id);
    localStorage.removeItem('campusLife.loadSaveId');
    location.href = 'index.html';
  }

  async continueGame() {
    const latest = await saveManager.latest();
    if (!latest) { toast('No saved game yet. Start a New Game.'); return; }
    localStorage.setItem('campusLife.loadSaveId', latest.id);
    localStorage.removeItem('campusLife.pendingGame');
    location.href = 'index.html';
  }

  async openSaves() {
    this.open('saves');
    const list = document.getElementById('save-list');
    if (!list) return;
    list.innerHTML = '<p class="muted center">Reading IndexedDB…</p>';
    const saves = await saveManager.list();
    if (!saves.length) {
      list.innerHTML = '<p class="muted center">No saves found. Create a New Game first.</p>';
      return;
    }
    list.innerHTML = saves.map(s => `
      <div class="save-card">
        <div>
          <h4>${s.player?.first || 'Student'} ${s.player?.last || ''}</h4>
          <p>${s.college?.name || 'Campus'} · Day ${s.time?.day || 1} · ${formatTime(s.time?.minutes || 480)}</p>
          <p>${new Date(s.updatedAt).toLocaleString()}</p>
        </div>
        <div class="save-actions">
          <button class="btn primary small" data-load="${s.id}">Load</button>
          <button class="btn danger small" data-del="${s.id}">Delete</button>
        </div>
      </div>`).join('');

    list.querySelectorAll('[data-load]').forEach(btn => {
      btn.addEventListener('click', () => {
        localStorage.setItem('campusLife.loadSaveId', btn.dataset.load);
        localStorage.removeItem('campusLife.pendingGame');
        location.href = 'index.html';
      });
    });
    list.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await saveManager.remove(btn.dataset.del);
        this.openSaves();
      });
    });
  }

  openGallery() {
    this.open('gallery');
    const list = document.getElementById('gallery-list');
    if (!list) return;
    const chars = JSON.parse(localStorage.getItem('campusLife.characters') || '[]');
    if (!chars.length) {
      list.innerHTML = '<p class="muted">No characters yet. Create one in New Game.</p>';
      return;
    }
    list.innerHTML = chars.map(c => `
      <div class="gallery-card">
        <h4>${c.first} ${c.last}</h4>
        <p>${c.nickname ? '“' + c.nickname + '”' : ''} · ${c.age} · ${c.gender}</p>
        <p>${c.country} · ${c.hometown}</p>
        <p>${c.personality.join(', ') || 'Balanced'}</p>
        <p>${c.interests}</p>
      </div>`).join('');
  }
}

/* ============================================================
   GAME WORLD / PLAYER / NPC / VEHICLES
   ============================================================ */
const LOCATIONS = {
  gate: { x: 0, z: 70, name: 'Main Entrance' },
  courtyard: { x: 0, z: 22, name: 'Central Courtyard' },
  academic: { x: -32, z: -6, name: 'Academic Block' },
  library: { x: 32, z: -8, name: 'Library' },
  hostel: { x: 0, z: -62, name: 'Hostel' },
  cafeteria: { x: 34, z: 30, name: 'Cafeteria' },
  auditorium: { x: -34, z: 32, name: 'Auditorium' },
  sports: { x: 58, z: 54, name: 'Sports Complex' },
  admin: { x: 0, z: -2, name: 'Administration' },
  parking: { x: -58, z: 42, name: 'Parking Lot' },
  gardens: { x: 16, z: 52, name: 'Campus Gardens' }
};

const BUILDING_DEFS = [
  { id: 'academic', name: 'Academic Block', model: 'buildingC', x: -32, z: -6, scale: 14, h: 14, interior: 'classroom' },
  { id: 'library', name: 'Library', model: 'skyscraper', x: 32, z: -8, scale: 4.5, h: 13, interior: 'library' },
  { id: 'hostel', name: 'Hostel', model: 'buildingR', x: 0, z: -62, scale: 9, h: 12, interior: 'dorm' },
  { id: 'cafeteria', name: 'Cafeteria', model: 'buildingR', x: 34, z: 30, scale: 7, h: 7, interior: 'cafeteria' },
  { id: 'auditorium', name: 'Auditorium', model: 'buildingC', x: -34, z: 32, scale: 11, h: 10, interior: 'lecture' },
  { id: 'sports', name: 'Sports Complex', model: 'buildingR', x: 58, z: 54, scale: 8, h: 9, interior: 'gym' },
  { id: 'admin', name: 'Administration', model: 'buildingC', x: 0, z: -2, scale: 9, h: 8, interior: 'office' }
];

class Player {
  constructor(game) {
    this.game = game;
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 34);
    this.position = this.group.position;
    this.velocity = new THREE.Vector3();
    this.yaw = Math.PI;
    this.pitch = 0.1;
    this.height = 1.7;
    this.radius = 0.35;
    this.speed = 4.6;
    this.sprintSpeed = 8;
    this.crouchSpeed = 2.4;
    this.onGround = true;
    this.mode = 'third';
    this.currentBuilding = null;
    this.vehicle = null;
    this.model = null;
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;
    this.stats = {
      health: 100, energy: 82, hunger: 70, hygiene: 88, happiness: 72,
      stress: 18, confidence: 60, intelligence: 55, fitness: 50, charisma: 50, social: 45, reputation: 50
    };
    this.money = 2500;
    this.bank = 4200;
    this.inventory = [
      { id: 'phone', name: 'Smartphone', type: 'tool' },
      { id: 'student-id', name: 'Student ID', type: 'document' },
      { id: 'notebook', name: 'Notebook', type: 'study' }
    ];
    this.academics = {
      courses: [], attendance: 0, assignmentsDone: 0, assignmentsTotal: 6,
      midterm: 0, final: 0, gpa: 0, semester: 1, year: 1
    };
    this.flags = {};
  }

  async loadAppearance(character) {
    this.character = character;
    const key = character.base === 'female' ? 'xbot' : 'soldier';
    try {
      const gltf = await this.game.assets.load(key);
      this.model = this.game.assets.cloneScene(gltf);
      this.model.scale.setScalar(1.05);
      tintCharacter(this.model, character.clothing || '#3b6ea8', 0.65);
      addHair(this.model, character.hairColor || '#2b1d14', character.hair || 'short');
      addAccessory(this.model, character.accessory || 'none');
      this.group.add(this.model);
      this.mixer = new THREE.AnimationMixer(this.model);
      gltf.animations.forEach(clip => {
        this.actions[clip.name] = this.mixer.clipAction(clip);
      });
      this.idleAction = this.findAction(/idle/i) || Object.values(this.actions)[0];
      this.walkAction = this.findAction(/walk/i);
      this.runAction = this.findAction(/run/i);
      this.playAction('idle');
    } catch {
      this.model = createFallbackHuman(character.clothing || '#3b6ea8');
      this.group.add(this.model);
    }
  }

  findAction(re) {
    const k = Object.keys(this.actions).find(n => re.test(n));
    return k ? this.actions[k] : null;
  }

  playAction(type) {
    if (this.currentAction === type) return;
    const next = type === 'run' ? this.runAction : type === 'walk' ? this.walkAction : this.idleAction;
    if (!next) return;
    if (this.currentActionObj) this.currentActionObj.fadeOut(0.15);
    next.reset().fadeIn(0.15).play();
    this.currentActionObj = next;
    this.currentAction = type;
  }

  update(dt, input) {
    if (this.vehicle) return;

    const move = new THREE.Vector3(
      (input.right ? 1 : 0) - (input.left ? 1 : 0),
      0,
      (input.backward ? 1 : 0) - (input.forward ? 1 : 0)
    );
    if (move.lengthSq() > 0) move.normalize();

    const yaw = this.yaw;
    const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const worldDir = new THREE.Vector3()
      .addScaledVector(right, move.x)
      .addScaledVector(forward, -move.z);
    if (worldDir.lengthSq() > 0) worldDir.normalize();

    let speed = this.speed;
    if (input.crouch) speed = this.crouchSpeed;
    else if (input.sprint && this.stats.energy > 5) speed = this.sprintSpeed;

    const horizontal = worldDir.multiplyScalar(speed);
    this.group.position.x += horizontal.x * dt;
    this.group.position.z += horizontal.z * dt;

    if (input.jump && this.onGround) {
      this.velocity.y = 5.4;
      this.onGround = false;
    }
    this.velocity.y -= 16 * dt;
    this.group.position.y += this.velocity.y * dt;
    if (this.group.position.y <= 0) {
      this.group.position.y = 0;
      this.velocity.y = 0;
      this.onGround = true;
    }

    if (worldDir.lengthSq() > 0) {
      const targetRot = Math.atan2(worldDir.x, worldDir.z);
      this.model && (this.model.rotation.y = lerpAngle(this.model.rotation.y, targetRot, 0.22));
      this.playAction(input.sprint ? 'run' : 'walk');
    } else {
      this.playAction('idle');
    }

    if (input.crouch) this.group.position.y = -0.25;
    else if (this.onGround) this.group.position.y = 0;

    this.mixer?.update(dt);
    this.collide();
    this.game.world.clampToWorld(this.group.position);
  }

  collide() {
    for (const c of this.game.world.colliders) {
      if (c.type === 'building') {
        const box = c.box;
        if (this.group.position.x > box.min.x - this.radius && this.group.position.x < box.max.x + this.radius &&
            this.group.position.z > box.min.z - this.radius && this.group.position.z < box.max.z + this.radius) {
          const dx1 = Math.abs(this.group.position.x - box.min.x);
          const dx2 = Math.abs(box.max.x - this.group.position.x);
          const dz1 = Math.abs(this.group.position.z - box.min.z);
          const dz2 = Math.abs(box.max.z - this.group.position.z);
          const m = Math.min(dx1, dx2, dz1, dz2);
          if (m === dx1) this.group.position.x = box.min.x - this.radius;
          else if (m === dx2) this.group.position.x = box.max.x + this.radius;
          else if (m === dz1) this.group.position.z = box.min.z - this.radius;
          else this.group.position.z = box.max.z + this.radius;
        }
      }
    }
  }
}

function lerpAngle(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

/* ============================================================
   NPC
   ============================================================ */
class NPC {
  constructor(game, data) {
    Object.assign(this, data);
    this.game = game;
    this.group = new THREE.Group();
    this.group.position.set(data.x, 0, data.z);
    this.position = this.group.position;
    this.target = new THREE.Vector3(data.x, 0, data.z);
    this.model = null;
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;
    this.activity = 'idle';
    this.memories = data.memories || [];
    this.relationships = data.relationships || {
      friendship: 0, trust: 0, respect: 0, affection: 0,
      familiarity: 0, rivalry: 0, reputation: 0
    };
    this.schedule = data.schedule || null;
    this.speed = data.speed || rand(1.1, 1.7);
    this.lastInteraction = 0;
  }

  async init() {
    const key = this.modelKey || (this.role === 'professor' || this.role === 'admin' ? 'soldier' : this.gender === 'female' ? 'xbot' : 'soldier');
    try {
      const gltf = await this.game.assets.load(key);
      this.model = this.game.assets.cloneScene(gltf);
      this.model.scale.setScalar(1.0);
      tintCharacter(this.model, this.color, 0.55);
      addHair(this.model, this.hairColor || '#2b1d14', this.hair || 'short');
      addAccessory(this.model, this.accessory || 'none');
      this.group.add(this.model);
      this.mixer = new THREE.AnimationMixer(this.model);
      gltf.animations.forEach(c => { this.actions[c.name] = this.mixer.clipAction(c); });
      this.idle = Object.values(this.actions).find(a => /idle/i.test(a.getClip().name)) || Object.values(this.actions)[0];
      this.walk = Object.values(this.actions).find(a => /walk/i.test(a.getClip().name));
      this.run = Object.values(this.actions).find(a => /run/i.test(a.getClip().name));
      this.idle?.play();
    } catch {
      this.model = createFallbackHuman(this.color);
      this.group.add(this.model);
    }
    this.group.userData.npc = this;
    this.game.scene.add(this.group);
    this.game.npcs.push(this);
    this.game.interactables.push(this.group);
  }

  setActivity(activity) {
    if (this.activity === activity) return;
    this.activity = activity;
    if (!this.mixer) return;
    if (activity === 'walk' || activity === 'run') {
      const a = activity === 'run' ? this.run : this.walk;
      if (a) {
        if (this.currentAction) this.currentAction.fadeOut(0.2);
        a.reset().fadeIn(0.2).play();
        this.currentAction = a;
      }
    } else {
      if (this.currentAction) this.currentAction.fadeOut(0.2);
      this.idle?.reset().fadeIn(0.2).play();
      this.currentAction = this.idle;
    }
  }

  update(dt, hour) {
    // Schedule-driven destination
    if (this.schedule) {
      const slot = this.schedule.find(s => hour >= s.from && hour < s.to);
      if (slot) {
        const loc = LOCATIONS[slot.location] || LOCATIONS.courtyard;
        if (this.activity !== slot.activity) {
          this.target.set(loc.x + rand(-4, 4), 0, loc.z + rand(-4, 4));
          this.setActivity('walk');
        }
        this.currentActivityName = slot.activity;
      }
    }

    const dir = this.target.clone().sub(this.position);
    dir.y = 0;
    const dist = dir.length();
    if (dist > 0.6) {
      dir.normalize();
      this.position.addScaledVector(dir, this.speed * dt);
      if (this.model) this.model.rotation.y = Math.atan2(dir.x, dir.z);
      this.setActivity('walk');
    } else if (this.currentActivityName) {
      this.setActivity(this.currentActivityName === 'sport' ? 'idle' : this.currentActivityName);
    }
    this.mixer?.update(dt);
  }
}

/* ============================================================
   VEHICLE
   ============================================================ */
class Vehicle {
  constructor(game, data) {
    this.game = game;
    this.id = data.id || makeId('vehicle');
    this.modelKey = data.modelKey || 'hatchback';
    this.group = new THREE.Group();
    this.group.position.set(data.x, 0, data.z);
    this.group.rotation.y = data.ry || 0;
    this.speed = 0;
    this.maxSpeed = data.maxSpeed || 18;
    this.steer = 0;
    this.occupied = false;
    this.driver = null;
    this.name = data.name || 'Campus Car';
    this.owned = data.owned || false;
    this.mesh = null;
  }

  async init() {
    try {
      const gltf = await this.game.assets.load(this.modelKey);
      this.mesh = this.game.assets.cloneScene(gltf);
      this.mesh.scale.setScalar(2.4);
      this.group.add(this.mesh);
    } catch {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 4), new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.4 }));
      body.position.y = 0.6; this.group.add(body);
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 1.8), new THREE.MeshStandardMaterial({ color: '#111827' }));
      cabin.position.set(0, 1.1, -0.2); this.group.add(cabin);
      this.mesh = body;
    }
    this.group.userData.vehicle = this;
    this.game.scene.add(this.group);
    this.game.interactables.push(this.group);
    this.game.vehicles.push(this);
  }

  enter(player) {
    this.occupied = true;
    this.driver = player;
    player.vehicle = this;
    player.group.visible = false;
    this.speed = 0;
  }

  exit(player) {
    this.occupied = false;
    this.driver = null;
    player.vehicle = null;
    player.group.visible = true;
    player.group.position.copy(this.group.position).add(new THREE.Vector3(2.2, 0, 0));
  }

  update(dt, input) {
    if (!this.occupied) return;
    const accel = 12;
    const brake = 18;
    const drag = 1.8;
    if (input.forward) this.speed += accel * dt;
    else if (input.backward) this.speed -= brake * dt;
    else this.speed *= Math.max(0, 1 - drag * dt);

    this.speed = clamp(this.speed, -6, this.maxSpeed);
    const steerDir = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    this.group.rotation.y += steerDir * dt * 1.6 * (Math.abs(this.speed) / this.maxSpeed + 0.2);

    const forward = new THREE.Vector3(Math.sin(this.group.rotation.y), 0, Math.cos(this.group.rotation.y));
    this.group.position.addScaledVector(forward, this.speed * dt);
    this.game.world.clampToWorld(this.group.position);

    // Camera follow
    const cam = this.game.camera;
    const desired = this.group.position.clone().add(new THREE.Vector3(0, 6, -10).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y));
    cam.position.lerp(desired, 0.12);
    cam.lookAt(this.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
  }
}

/* ============================================================
   WORLD BUILDER
   ============================================================ */
class WorldBuilder {
  constructor(game) {
    this.game = game;
    this.scene = game.scene;
    this.assets = game.assets;
    this.colliders = [];
    this.buildings = [];
    this.interiors = [];
    this.waypoints = [];
  }

  async build() {
    this.createGround();
    this.createRoads();
    this.createGate();
    this.createSportsField();
    this.createParking();
    await this.createBuildings();
    await this.createTrees();
    this.createBenches();
    this.createWaypoints();
  }

  createGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(420, 420, 1, 1),
      new THREE.MeshStandardMaterial({ color: '#1d3a26', roughness: 0.96 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'Ground';
    this.scene.add(ground);
  }

  createRoads() {
    const mat = new THREE.MeshStandardMaterial({ color: '#20242c', roughness: 0.92 });
    const road = new THREE.Mesh(new THREE.PlaneGeometry(22, 190), mat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.012, 10);
    road.receiveShadow = true;
    this.scene.add(road);

    const cross = new THREE.Mesh(new THREE.PlaneGeometry(130, 14), mat);
    cross.rotation.x = -Math.PI / 2;
    cross.position.set(0, 0.013, 22);
    cross.receiveShadow = true;
    this.scene.add(cross);

    const pathMat = new THREE.MeshStandardMaterial({ color: '#c2b280', roughness: 1 });
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(3, 30), pathMat);
      p.rotation.x = -Math.PI / 2;
      p.position.set(-45 + i * 18, 0.014, -30);
      this.scene.add(p);
    }
  }

  createGate() {
    const pillarMat = new THREE.MeshStandardMaterial({ color: '#3a4a5e', roughness: 0.8 });
    for (const x of [-12, 12]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6, 1.4), pillarMat);
      p.position.set(x, 3, 68); p.castShadow = true; this.scene.add(p);
    }
    const arch = new THREE.Mesh(new THREE.BoxGeometry(26, 1.2, 1.4), new THREE.MeshStandardMaterial({ color: '#5cc8ff', roughness: 0.5 }));
    arch.position.set(0, 6.2, 68); this.scene.add(arch);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.2), new THREE.MeshBasicMaterial({ color: '#0b1020' }));
    sign.position.set(0, 6.2, 68.72); this.scene.add(sign);
  }

  createSportsField() {
    const field = new THREE.Mesh(new THREE.PlaneGeometry(34, 24), new THREE.MeshStandardMaterial({ color: '#14532d', roughness: 0.9 }));
    field.rotation.x = -Math.PI / 2; field.position.set(58, 0.02, 54); this.scene.add(field);
    const lineMat = new THREE.MeshBasicMaterial({ color: '#e5e7eb' });
    for (let i = 0; i < 3; i++) {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(34, 0.15), lineMat);
      l.rotation.x = -Math.PI / 2; l.position.set(58, 0.03, 44 + i * 10); this.scene.add(l);
    }
  }

  createParking() {
    const lot = new THREE.Mesh(new THREE.PlaneGeometry(38, 26), new THREE.MeshStandardMaterial({ color: '#2a2f38', roughness: 0.9 }));
    lot.rotation.x = -Math.PI / 2; lot.position.set(-58, 0.016, 42); this.scene.add(lot);
  }

  async createBuildings() {
    let index = 0;
    for (const def of BUILDING_DEFS) {
      const gltf = await this.assets.safeLoad(def.model);
      if (gltf) {
        const model = this.assets.cloneScene(gltf);
        model.position.set(def.x, 0, def.z);
        model.scale.setScalar(def.scale);
        model.rotation.y = rand(-0.15, 0.15);
        this.scene.add(model);
      } else {
        this.createFallbackBuilding(def);
      }

      const half = 7;
      const box = new THREE.Box3(
        new THREE.Vector3(def.x - half, 0, def.z - half),
        new THREE.Vector3(def.x + half, def.h, def.z + half)
      );
      this.colliders.push({ type: 'building', box, name: def.name });

      const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.6, 0.4), new THREE.MeshStandardMaterial({ color: '#0ea5e9', emissive: '#0ea5e9', emissiveIntensity: 0.6 }));
      door.position.set(def.x, 1.3, def.z + half + 0.2);
      door.userData.door = def.id;
      this.scene.add(door);
      this.game.interactables.push(door);

      const interior = await this.createInterior(def, index);
      this.interiors.push(interior);
      this.buildings.push({ ...def, door, box, interior, half });
      index++;
    }
  }

  createFallbackBuilding(def) {
    const mat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.85 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(14, def.h, 14), mat);
    body.position.set(def.x, def.h / 2, def.z); body.castShadow = true; body.receiveShadow = true;
    this.scene.add(body);
    for (let y = 2; y < def.h; y += 2.5) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(14.2, 0.7, 14.2), new THREE.MeshStandardMaterial({ color: '#93c5fd', emissive: '#93c5fd', emissiveIntensity: 0.25 }));
      strip.position.set(def.x, y, def.z); this.scene.add(strip);
    }
    console.warn('[World] GLB unavailable for', def.name, '— used fallback façade. Check ASSETS URL/CORS.');
  }

  async createInterior(def, index) {
    const group = new THREE.Group();
    group.position.set(-160 + index * 55, -100, 0);
    group.name = 'Interior:' + def.id;

    const roomW = 18, roomD = 14, roomH = 4.2;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomD), new THREE.MeshStandardMaterial({ color: '#d6c7a1', roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; group.add(floor);
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomD), new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9 }));
    ceiling.rotation.x = Math.PI / 2; ceiling.position.y = roomH; group.add(ceiling);

    const wallMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.9 });
    const walls = [
      [0, roomH / 2, -roomD / 2, roomW, roomH, 0.2],
      [0, roomH / 2, roomD / 2, roomW, roomH, 0.2],
      [-roomW / 2, roomH / 2, 0, 0.2, roomH, roomD],
      [roomW / 2, roomH / 2, 0, 0.2, roomH, roomD]
    ];
    for (const [x, y, z, w, h, d] of walls) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
      wall.position.set(x, y, z); wall.castShadow = true; wall.receiveShadow = true; group.add(wall);
    }

    // Door gap visual
    const door = new THREE.Mesh(new THREE.BoxGeometry(2, 2.8, 0.25), new THREE.MeshStandardMaterial({ color: '#0ea5e9', emissive: '#0ea5e9', emissiveIntensity: 0.5 }));
    door.position.set(0, 1.4, roomD / 2 + 0.15);
    door.userData.exit = def.id;
    group.add(door);

    const light = new THREE.PointLight('#fff7ed', 2.2, 30, 2);
    light.position.set(0, 3.8, 0); group.add(light);
    group.add(new THREE.AmbientLight('#64748b', 0.5));

    const furn = await this.assets.safeLoad('chair');
    const deskG = await this.assets.safeLoad('desk');
    const tableG = await this.assets.safeLoad('table');
    const bedG = await this.assets.safeLoad('bed');

    const add = (gltf, x, z, ry = 0, s = 2.2) => {
      if (!gltf) return null;
      const m = this.assets.cloneScene(gltf);
      m.position.set(x, 0, z); m.rotation.y = ry; m.scale.setScalar(s); group.add(m); return m;
    };

    const activities = [];
    const marker = (x, z, activity, label) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(2, 0.05, 2), new THREE.MeshBasicMaterial({ color: '#5cc8ff', transparent: true, opacity: 0.28 }));
      m.position.set(x, 0.03, z); m.userData.activity = activity; m.userData.label = label; group.add(m); activities.push(m);
    };

    if (def.interior === 'classroom' || def.interior === 'lecture') {
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
        add(deskG, -6 + c * 4, -3 + r * 3, 0, 2.8);
        add(furn, -6 + c * 4, -2 + r * 3, 0, 3.1);
      }
      const board = new THREE.Mesh(new THREE.BoxGeometry(8, 3, 0.15), new THREE.MeshStandardMaterial({ color: '#14532d' }));
      board.position.set(0, 2.2, -6.5); group.add(board);
      marker(0, 2, 'lecture', 'Attend Lecture');
    } else if (def.interior === 'library') {
      for (let r = 0; r < 4; r++) {
        add(deskG, -6 + r * 4, -2, 0, 2.8);
        add(furn, -6 + r * 4, -0.8, 0, 3.1);
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3, 4), new THREE.MeshStandardMaterial({ color: '#78350f' }));
        shelf.position.set(-6 + r * 4, 1.5, -5.5); group.add(shelf);
      }
      marker(0, 3, 'study', 'Study in Library');
    } else if (def.interior === 'dorm') {
      add(bedG, -5, -4, 0, 2.8);
      add(deskG, 4, -4, Math.PI, 2.8);
      add(furn, 4, -2.5, Math.PI, 3.1);
      marker(-5, -2, 'sleep', 'Sleep');
      marker(2, 2, 'shower', 'Shower');
      marker(5, 3, 'study', 'Study at Desk');
    } else if (def.interior === 'cafeteria') {
      for (let i = 0; i < 4; i++) {
        add(tableG, -5 + (i % 2) * 8, -3 + Math.floor(i / 2) * 5, 0, 4);
        add(furn, -5 + (i % 2) * 8, -1.5 + Math.floor(i / 2) * 5, 0, 3.1);
      }
      const counter = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 1.8), new THREE.MeshStandardMaterial({ color: '#92400e' }));
      counter.position.set(0, 0.6, 5.5); group.add(counter);
      marker(0, 3, 'eat', 'Buy Food');
    } else if (def.interior === 'gym') {
      const mat = new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.7 });
      for (let i = 0; i < 3; i++) {
        const bench = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 1), mat);
        bench.position.set(-4 + i * 4, 0.5, 0); group.add(bench);
      }
      marker(0, 2, 'workout', 'Work Out');
    } else {
      add(deskG, 0, -3, 0, 2.8);
      add(furn, 0, -1.5, 0, 3.1);
      marker(0, 2, 'office', 'Speak to Staff');
    }

    this.scene.add(group);
    return {
      id: def.id, group, activities,
      spawn: new THREE.Vector3(group.position.x, -97.8, group.position.z + 5),
      exit: new THREE.Vector3(group.position.x, -97.8, group.position.z + 6.8)
    };
  }

  async createTrees() {
    const t1 = await this.assets.safeLoad('treeDetailed');
    const t2 = await this.assets.safeLoad('treeDefault');
    for (let i = 0; i < 46; i++) {
      const gltf = i % 2 ? t1 : t2;
      if (!gltf) continue;
      const m = this.assets.cloneScene(gltf);
      const x = rand(-100, 100), z = rand(-95, 95);
      if (Math.abs(x) < 16 && z > -80 && z < 70) continue;
      m.position.set(x, 0, z);
      m.scale.setScalar(rand(2.2, 4.2));
      m.rotation.y = rand(0, Math.PI * 2);
      this.scene.add(m);
    }
  }

  createBenches() {
    const mat = new THREE.MeshStandardMaterial({ color: '#6b4f2a', roughness: 0.8 });
    for (const [x, z] of [[-8, 12], [8, 12], [-8, 32], [8, 32], [20, 40], [-20, 40]]) {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 0.6), mat);
      seat.position.set(x, 0.55, z); seat.castShadow = true; this.scene.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.12), mat);
      back.position.set(x, 0.9, z - 0.3); this.scene.add(back);
    }
  }

  createWaypoints() {
    for (const key in LOCATIONS) {
      const l = LOCATIONS[key];
      this.waypoints.push(new THREE.Vector3(l.x, 0, l.z));
    }
  }

  clampToWorld(pos) {
    pos.x = clamp(pos.x, -140, 140);
    pos.z = clamp(pos.z, -140, 140);
  }

  getBuildingAt(pos) {
    return this.buildings.find(b => pos.distanceTo(new THREE.Vector3(b.x, 0, b.z)) < b.half + 5);
  }
}

/* ============================================================
   AI SERVICE
   ============================================================ */
class AIService {
  constructor(settings) {
    this.proxyUrl = settings.proxy || '/api/chat';
    this.model = settings.model || 'google/gemma-4-26b-a4b-it:free';
  }

  async request(npc, playerMessage, game) {
    const system = this.buildSystemPrompt(npc, game);
    const history = (npc.memories || []).slice(-6).map(m => ({ role: 'user', content: m }));
    const messages = [
      { role: 'system', content: system },
      ...history,
      { role: 'user', content: playerMessage }
    ];

    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 18000);
      const res = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.85,
          max_tokens: 400,
          response_format: { type: 'json_object' }
        })
      });
      clearTimeout(t);
      if (!res.ok) throw new Error('Proxy HTTP ' + res.status);
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || data.reply || '';
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return this.normalise(parsed, npc);
    } catch (err) {
      console.warn('[AI] falling back to local roleplay:', err.message);
      return this.localFallback(npc, playerMessage, game);
    }
  }

  buildSystemPrompt(npc, game) {
    const p = game.player;
    const rel = npc.relationships;
    return `You are role-playing a single NPC in a college life simulation. Never control the player.
NPC NAME: ${npc.name}
ROLE: ${npc.role} (${npc.department})
PERSONALITY: ${(npc.personality || []).join(', ')}
CURRENT ACTIVITY: ${npc.currentActivityName || npc.activity}
RELATIONSHIP WITH PLAYER: friendship=${rel.friendship}, trust=${rel.trust}, respect=${rel.respect}, affection=${rel.affection}, familiarity=${rel.familiarity}, rivalry=${rel.rivalry}
PLAYER: ${p.character?.first || 'Student'}, ${p.character?.personality?.join(', ') || 'balanced'}
COLLEGE: ${game.config.college.name}, ${game.config.college.culture} culture, ${game.config.college.difficulty} difficulty.
MEMORY: ${(npc.memories || []).slice(-8).join(' | ') || 'No previous conversations.'}

Respond as JSON with:
{
  "reply": "the NPC's spoken response and visible action",
  "mood": "one word",
  "relationshipDelta": { "friendship": 0, "trust": 0, "respect": 0, "affection": 0, "rivalry": 0 },
  "choices": ["contextual action 1", "action 2", "action 3"]
}
Keep reply under 90 words. Choices must be things the PLAYER can do next, not the NPC.
If the player is rude or violates rules, react according to personality and campus rules.
Romance is only allowed between consenting adult characters.`;
  }

  normalise(parsed, npc) {
    const out = parsed && typeof parsed === 'object' ? parsed : {};
    return {
      reply: String(out.reply || 'They look at you, unsure what to say.'),
      mood: String(out.mood || 'neutral'),
      relationshipDelta: out.relationshipDelta || {},
      choices: Array.isArray(out.choices) && out.choices.length ? out.choices.slice(0, 5) : this.defaultChoices(npc)
    };
  }

  defaultChoices(npc) {
    const base = ['Ask how they are doing', 'Talk about classes', 'Say goodbye'];
    if (npc.role === 'professor' || npc.role === 'lecturer') base.unshift('Ask about the assignment');
    if (npc.relationships.friendship > 25) base.unshift('Invite them to hang out');
    if (npc.relationships.rivalry > 20) base.unshift('Try to clear the air');
    return base.slice(0, 5);
  }

  localFallback(npc, playerMessage, game) {
    const p = npc.personality || [];
    const friendly = p.includes('friendly') || p.includes('extroverted');
    const rude = /idiot|stupid|hate|shut up|loser/i.test(playerMessage);
    let reply;
    if (rude) {
      reply = p.includes('confident') || p.includes('rebellious')
        ? `"That's a bit much. Watch your tone." ${npc.name} folds their arms.`
        : `"I… I didn't expect that." ${npc.name} steps back.`;
    } else if (npc.currentActivityName === 'lecture') {
      reply = `"I'm heading to class. We can talk after the lecture."`;
    } else if (npc.currentActivityName === 'eat') {
      reply = friendly ? `"Hey! Grab a seat if you want."` : `"I'm just grabbing a quick bite."`;
    } else {
      const lines = friendly
        ? [`"Hey, good to see you around campus."`, `"What's up? You look like you're exploring."`]
        : [`"Oh — hi. You're in one of my classes, right?"`, `"I'm a little busy, but I can talk for a minute."`];
      reply = pick(lines);
    }

    const delta = rude
      ? { friendship: -4, trust: -3, respect: -2, rivalry: 3 }
      : { friendship: 1, familiarity: 2, trust: 1 };

    return {
      reply,
      mood: rude ? 'annoyed' : 'neutral',
      relationshipDelta: delta,
      choices: this.defaultChoices(npc),
      fallback: true
    };
  }
}

/* ============================================================
   UI MANAGER (game)
   ============================================================ */
class UIManager {
  constructor(game) {
    this.game = game;
    this.dialogueNpc = null;
    this.phoneApp = 'contacts';
    this.cache();
    this.bind();
  }

  cache() {
    this.el = {
      time: document.getElementById('hud-time'),
      date: document.getElementById('hud-date'),
      location: document.getElementById('hud-location'),
      weather: document.getElementById('hud-weather'),
      money: document.getElementById('hud-money'),
      prompt: document.getElementById('interaction-prompt'),
      promptText: document.getElementById('interaction-text'),
      notification: document.getElementById('notification'),
      objective: document.getElementById('objective-text'),
      dialogue: document.getElementById('dialogue-panel'),
      dlgName: document.getElementById('dialogue-name'),
      dlgRole: document.getElementById('dialogue-role'),
      dlgText: document.getElementById('dialogue-text'),
      dlgChoices: document.getElementById('dialogue-choices'),
      dlgInput: document.getElementById('dialogue-input'),
      dlgRel: document.getElementById('dialogue-rel'),
      dlgAvatar: document.getElementById('dialogue-avatar'),
      phone: document.getElementById('phone-panel'),
      phoneApp: document.getElementById('phone-app'),
      phoneTime: document.getElementById('phone-time'),
      inventory: document.getElementById('inventory-panel'),
      inventoryList: document.getElementById('inventory-list'),
      relationship: document.getElementById('relationship-panel'),
      relationshipList: document.getElementById('relationship-list'),
      pause: document.getElementById('pause-menu'),
      minimap: document.getElementById('minimap'),
      loading: document.getElementById('loading-screen'),
      loadingFill: document.getElementById('loading-fill'),
      loadingText: document.getElementById('loading-text')
    };
  }

  bind() {
    document.getElementById('hud-phone')?.addEventListener('click', () => this.togglePhone(true));
    document.getElementById('phone-close')?.addEventListener('click', () => this.togglePhone(false));
    document.getElementById('hud-pause')?.addEventListener('click', () => this.togglePause(true));
    document.getElementById('pause-resume')?.addEventListener('click', () => this.togglePause(false));
    document.getElementById('pause-save')?.addEventListener('click', () => this.game.saveGame('manual'));
    document.getElementById('pause-load')?.addEventListener('click', () => this.game.loadLatest());
    document.getElementById('pause-settings')?.addEventListener('click', () => toast('Settings are available from the main menu.'));
    document.getElementById('pause-quit')?.addEventListener('click', () => location.href = 'Menu.html');
    document.getElementById('dialogue-close')?.addEventListener('click', () => this.closeDialogue());
    document.getElementById('dialogue-send')?.addEventListener('click', () => this.sendDialogue());
    this.el.dlgInput?.addEventListener('keydown', e => { if (e.key === 'Enter') this.sendDialogue(); });
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById(btn.dataset.close + '-panel')?.classList.add('hidden');
      });
    });
    document.querySelectorAll('[data-phone]').forEach(btn => {
      btn.addEventListener('click', () => { this.phoneApp = btn.dataset.phone; this.renderPhone(); });
    });
  }

  setLoading(pct, text) {
    if (this.el.loadingFill) this.el.loadingFill.style.width = pct + '%';
    if (text && this.el.loadingText) this.el.loadingText.textContent = text;
  }

  hideLoading() { this.el.loading?.classList.add('hidden'); }

  updateHUD() {
    const g = this.game;
    this.el.time.textContent = formatTime(g.time.minutes);
    this.el.date.textContent = `Day ${g.time.day} · ${g.time.weekday} · Semester ${g.time.semester}`;
    this.el.money.textContent = formatMoney(g.player.money);
    this.el.phoneTime.textContent = formatTime(g.time.minutes);
    this.el.location.textContent = g.currentLocationName || 'Campus';
    this.el.weather.textContent = `${g.weather.type} · ${Math.round(g.weather.temp)}°C`;

    const bars = {
      health: g.player.stats.health, energy: g.player.stats.energy, hunger: g.player.stats.hunger,
      hygiene: g.player.stats.hygiene, happiness: g.player.stats.happiness, stress: g.player.stats.stress,
      confidence: g.player.stats.confidence, intelligence: g.player.stats.intelligence,
      fitness: g.player.stats.fitness, charisma: g.player.stats.charisma
    };
    for (const k in bars) {
      const el = document.getElementById('stat-' + k);
      if (el) el.style.width = clamp(bars[k], 0, 100) + '%';
    }
    this.drawMinimap();
  }

  showPrompt(text) {
    if (!this.el.prompt) return;
    if (!text) { this.el.prompt.classList.add('hidden'); return; }
    this.el.promptText.textContent = text;
    this.el.prompt.classList.remove('hidden');
  }

  notify(text, ms = 2400) {
    if (!this.el.notification) return;
    this.el.notification.textContent = text;
    this.el.notification.classList.remove('hidden');
    clearTimeout(this._nt);
    this._nt = setTimeout(() => this.el.notification.classList.add('hidden'), ms);
  }

  openDialogue(npc) {
    this.dialogueNpc = npc;
    this.el.dialogue.classList.remove('hidden');
    this.el.dlgName.textContent = npc.name;
    this.el.dlgRole.textContent = `${npc.role} · ${npc.department} · ${npc.currentActivityName || npc.activity}`;
    this.el.dlgAvatar.textContent = npc.name.slice(0, 1).toUpperCase();
    this.el.dlgText.textContent = '…';
    this.el.dlgChoices.innerHTML = '';
    this.el.dlgInput.value = '';
    this.updateRelLabel();
    this.game.pauseForDialogue = true;
    this.generateGreeting(npc);
  }

  updateRelLabel() {
    if (!this.dialogueNpc) return;
    const r = this.dialogueNpc.relationships;
    this.el.dlgRel.textContent = `Friendship ${Math.round(r.friendship)} · Trust ${Math.round(r.trust)}`;
  }

  async generateGreeting(npc) {
    const line = npc.memories.length
      ? `"Hey again. Last time we talked about ${npc.memories[npc.memories.length - 1].slice(0, 60)}…"`
      : `"Hi. I'm ${npc.name}. You're new around here, right?"`;
    this.el.dlgText.textContent = line;
    this.el.dlgChoices.innerHTML = '';
    const choices = [
      'Introduce yourself',
      'Ask about their day',
      'Ask about the campus',
      'Say goodbye'
    ];
    choices.forEach(c => this.addChoice(c));
  }

  addChoice(text) {
    const b = document.createElement('button');
    b.textContent = text;
    b.addEventListener('click', () => this.sendDialogue(text));
    this.el.dlgChoices.appendChild(b);
  }

  async sendDialogue(customText) {
    if (!this.dialogueNpc) return;
    const text = customText || this.el.dlgInput.value.trim();
    if (!text) return;
    this.el.dlgInput.value = '';
    this.el.dlgText.textContent = '…';
    this.el.dlgChoices.innerHTML = '';
    this.el.dlgInput.disabled = true;

    const result = await this.game.ai.request(this.dialogueNpc, text, this.game);
    this.el.dlgText.textContent = result.reply;
    this.el.dlgInput.disabled = false;

    const d = result.relationshipDelta || {};
    const r = this.dialogueNpc.relationships;
    for (const k in d) {
      if (typeof r[k] === 'number' && typeof d[k] === 'number') {
        r[k] = clamp(r[k] + d[k], -100, 100);
      }
    }
    this.dialogueNpc.memories.push(`${text.slice(0, 80)} → ${result.reply.slice(0, 120)}`);
    if (this.dialogueNpc.memories.length > 24) this.dialogueNpc.memories = this.dialogueNpc.memories.slice(-18);
    this.updateRelLabel();

    this.el.dlgChoices.innerHTML = '';
    (result.choices || []).forEach(c => this.addChoice(c));
    if (result.fallback) this.notify('AI proxy unavailable — local roleplay fallback used.', 3000);
  }

  closeDialogue() {
    this.el.dialogue.classList.add('hidden');
    this.dialogueNpc = null;
    this.game.pauseForDialogue = false;
  }

  togglePhone(open) {
    this.el.phone.classList.toggle('hidden', !open);
    if (open) { this.renderPhone(); this.game.pauseForDialogue = true; }
    else this.game.pauseForDialogue = false;
  }

  renderPhone() {
    const g = this.game;
    const app = this.el.phoneApp;
    document.querySelectorAll('[data-phone]').forEach(b => b.classList.toggle('active', b.dataset.phone === this.phoneApp));

    if (this.phoneApp === 'contacts') {
      app.innerHTML = `<h3>Contacts</h3>` + g.npcs.slice(0, 20).map(n =>
        `<div class="phone-item" data-contact="${n.id}">${n.name}<small>${n.role} · Friendship ${Math.round(n.relationships.friendship)}</small></div>`
      ).join('');
      app.querySelectorAll('[data-contact]').forEach(el => {
        el.addEventListener('click', () => {
          const npc = g.npcs.find(n => n.id === el.dataset.contact);
          if (npc) { this.togglePhone(false); this.openDialogue(npc); }
        });
      });
    } else if (this.phoneApp === 'messages') {
      const recent = g.npcs.flatMap(n => n.memories.slice(-1).map(m => ({ n, m }))).slice(-10);
      app.innerHTML = `<h3>Messages</h3>` + (recent.length ? recent.map(({ n, m }) =>
        `<div class="phone-item">${n.name}<small>${m}</small></div>`
      ).join('') : '<p class="muted">No messages yet. Talk to people on campus.</p>');
    } else if (this.phoneApp === 'social') {
      app.innerHTML = `<h3>Campus Feed</h3>` + g.npcs.slice(0, 12).map(n =>
        `<div class="phone-item">${n.name} is ${n.currentActivityName || n.activity}.<small>${n.department} · Day ${g.time.day}</small></div>`
      ).join('');
    } else if (this.phoneApp === 'calendar') {
      app.innerHTML = `<h3>Calendar</h3>
        <div class="phone-item">08:00 — Breakfast<small>Cafeteria</small></div>
        <div class="phone-item">09:00 — Lecture<small>Academic Block</small></div>
        <div class="phone-item">13:00 — Lunch<small>Cafeteria</small></div>
        <div class="phone-item">15:00 — Study<small>Library</small></div>
        <div class="phone-item">18:00 — Free time<small>Campus</small></div>`;
    } else if (this.phoneApp === 'notes') {
      const note = localStorage.getItem('campusLife.note') || '';
      app.innerHTML = `<h3>Notes</h3><textarea id="phone-note" rows="8" style="width:100%">${note}</textarea><button id="save-note" class="btn primary small" style="margin-top:8px">Save Note</button>`;
      document.getElementById('save-note')?.addEventListener('click', () => {
        localStorage.setItem('campusLife.note', document.getElementById('phone-note').value);
        toast('Note saved.');
      });
    } else if (this.phoneApp === 'bank') {
      app.innerHTML = `<h3>Bank</h3>
        <div class="phone-item">Cash: ${formatMoney(g.player.money)}</div>
        <div class="phone-item">Bank balance: ${formatMoney(g.player.bank)}</div>
        <div class="phone-item">Tuition: ${formatMoney(g.config.college.tuition)} / year<small>Paid from student account</small></div>`;
    } else if (this.phoneApp === 'map') {
      app.innerHTML = `<h3>Map</h3><p class="muted">Use the minimap in the bottom-right. Major locations:</p>` +
        Object.values(LOCATIONS).map(l => `<div class="phone-item">${l.name}<small>x ${l.x} · z ${l.z}</small></div>`).join('');
    }
  }

  togglePause(open) {
    this.el.pause.classList.toggle('hidden', !open);
    this.game.paused = open;
    if (open) this.game.pauseForDialogue = true;
    else this.game.pauseForDialogue = false;
  }

  renderInventory() {
    this.el.inventoryList.innerHTML = this.game.player.inventory.map(i =>
      `<div class="inv-item">${i.name}<small>${i.type}</small></div>`
    ).join('') || '<p class="muted">Empty.</p>';
  }

  renderRelationships() {
    this.el.relationshipList.innerHTML = this.game.npcs
      .slice().sort((a, b) => b.relationships.friendship - a.relationships.friendship)
      .slice(0, 30)
      .map(n => `<div class="rel-item">${n.name}<small>${n.role} · Friendship ${Math.round(n.relationships.friendship)} · Trust ${Math.round(n.relationships.trust)} · Rivalry ${Math.round(n.relationships.rivalry)}</small></div>`)
      .join('');
  }

  drawMinimap() {
    const c = this.el.minimap;
    if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width, h = c.height;
    const scale = 1.05;
    const px = this.game.player.position.x, pz = this.game.player.position.z;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a1120'; ctx.fillRect(0, 0, w, h);

    const toMap = (x, z) => [w / 2 + (x - px) * scale, h / 2 + (z - pz) * scale];

    ctx.strokeStyle = '#263247'; ctx.lineWidth = 2;
    const [rx1, rz1] = toMap(0, -90), [rx2, rz2] = toMap(0, 110);
    ctx.beginPath(); ctx.moveTo(rx1, rz1); ctx.lineTo(rx2, rz2); ctx.stroke();

    for (const b of this.game.world.buildings) {
      const [x, z] = toMap(b.x, b.z);
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - 8, z - 8, 16, 16);
      ctx.fillStyle = '#5cc8ff';
      ctx.font = '8px sans-serif';
      ctx.fillText(b.name.slice(0, 10), x + 10, z + 3);
    }
    for (const n of this.game.npcs) {
      const [x, z] = toMap(n.position.x, n.position.z);
      if (x < 0 || x > w || z < 0 || z > h) continue;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(x, z, 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#4ade80';
    ctx.beginPath(); ctx.arc(w / 2, h / 2, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
  }
}

/* ============================================================
   GAME
   ============================================================ */
class Game {
  constructor(config) {
    this.config = config;
    this.settings = JSON.parse(localStorage.getItem('campusLife.settings') || '{}');
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#87ceeb');
    this.scene.fog = new THREE.Fog('#a8c8e0', 90, 320);
    this.camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 600);
    this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = this.settings.shadows !== 'off';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(innerWidth, innerHeight);
    this.clock = new THREE.Clock();
    this.paused = false;
    this.pauseForDialogue = false;
    this.interactables = [];
    this.npcs = [];
    this.vehicles = [];
    this.nearby = null;
    this.currentLocationName = 'Main Courtyard';
    this.time = {
      minutes: 8 * 60, day: 1, weekday: 'Monday', semester: 1, year: 1,
      totalMinutes: 8 * 60
    };
    this.weather = { type: 'Clear', temp: 24, nextChange: 0 };
    this.player = new Player(this);
    this.assets = new AssetManager((key, done, prog, failed) => {
      if (failed) console.warn('[Loading] asset failed:', key);
    });
    this.ai = new AIService(this.settings);
    this.input = {
      forward: false, backward: false, left: false, right: false,
      sprint: false, jump: false, crouch: false
    };
    this.keys = new Set();
    this.touch = { x: 0, y: 0, active: false };
    this.lookTouch = { active: false, lastX: 0, lastY: 0 };
    this.draggingLook = false;
    this.pointerLocked = false;
    this.controls = null;
    this.ui = null;
    this.world = null;
    this.autosaveTimer = 0;
    this.notificationTimer = 0;
  }

  async init() {
    this.ui = new UIManager(this);
    this.ui.setLoading(5, 'Loading character appearance…');
    await this.player.loadAppearance(this.config.character);
    this.scene.add(this.player.group);

    this.setupLights();
    this.ui.setLoading(15, 'Building the campus…');
    this.world = new WorldBuilder(this);
    await this.world.build();
    this.ui.setLoading(55, 'Populating students and faculty…');
    await this.spawnNPCs();
    this.ui.setLoading(75, 'Parking vehicles…');
    await this.spawnVehicles();
    this.ui.setLoading(88, 'Restoring simulation state…');
    this.setupControls();
    this.setupInput();
    this.setupCamera();
    this.bindHUD();
    this.ui.setLoading(100, 'Welcome to campus.');
    setTimeout(() => this.ui.hideLoading(), 500);
    this.animate();
    this.autosave();
  }

  setupLights() {
    this.hemi = new THREE.HemisphereLight('#dbeafe', '#1f2937', 1.2);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight('#fff3d6', 2.3);
    this.sun.position.set(40, 70, 30);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.left = -100;
    this.sun.shadow.camera.right = 100;
    this.sun.shadow.camera.top = 100;
    this.sun.shadow.camera.bottom = -100;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 250;
    this.scene.add(this.sun);
    this.ambient = new THREE.AmbientLight('#8fa8ff', 0.35);
    this.scene.add(this.ambient);
  }

  async spawnNPCs() {
    const count = 26;
    for (let i = 0; i < count; i++) {
      const role = i === 0 ? 'professor' : i < 3 ? 'lecturer' : i < 5 ? 'security' : i < 7 ? 'cafeteria' : 'student';
      const gender = Math.random() > 0.5 ? 'female' : 'male';
      const first = pick(FIRST_NAMES), last = pick(LAST_NAMES);
      const npc = new NPC(this, {
        id: makeId('npc'),
        name: `${first} ${last}`,
        role,
        department: pick(DEPARTMENTS),
        gender,
        personality: Array.from({ length: 3 }, () => pick(PERSONALITIES)),
        color: pick(CLOTHES),
        hairColor: pick(['#2b1d14', '#5a3a22', '#c9a46a', '#111827']),
        hair: pick(['short', 'long', 'bun', 'curly']),
        accessory: pick(['none', 'glasses', 'backpack', 'watch']),
        x: rand(-35, 35),
        z: rand(-40, 40),
        schedule: this.makeSchedule(role),
        modelKey: role === 'professor' || role === 'security' ? 'soldier' : gender === 'female' ? 'xbot' : 'soldier'
      });
      await npc.init();
    }
    // Add room-mate near hostel
    const roommate = this.npcs.find(n => n.role === 'student');
    if (roommate) { roommate.position.set(4, 0, -58); roommate.target.set(4, 0, -58); }
  }

  makeSchedule(role) {
    if (role === 'security') {
      return [
        { from: 6, to: 14, location: 'gate', activity: 'guard' },
        { from: 14, to: 22, location: 'courtyard', activity: 'patrol' },
        { from: 22, to: 6, location: 'admin', activity: 'rest' }
      ];
    }
    if (role === 'cafeteria') {
      return [
        { from: 7, to: 10, location: 'cafeteria', activity: 'work' },
        { from: 10, to: 12, location: 'courtyard', activity: 'break' },
        { from: 12, to: 15, location: 'cafeteria', activity: 'work' },
        { from: 15, to: 19, location: 'courtyard', activity: 'social' },
        { from: 19, to: 7, location: 'hostel', activity: 'rest' }
      ];
    }
    if (role === 'professor' || role === 'lecturer') {
      return [
        { from: 7, to: 8, location: 'hostel', activity: 'wake' },
        { from: 8, to: 9, location: 'cafeteria', activity: 'eat' },
        { from: 9, to: 12, location: 'academic', activity: 'lecture' },
        { from: 12, to: 13, location: 'cafeteria', activity: 'eat' },
        { from: 13, to: 16, location: 'library', activity: 'study' },
        { from: 16, to: 18, location: 'admin', activity: 'office' },
        { from: 18, to: 22, location: 'courtyard', activity: 'social' },
        { from: 22, to: 7, location: 'hostel', activity: 'sleep' }
      ];
    }
    return [
      { from: 7, to: 8, location: 'hostel', activity: 'wake' },
      { from: 8, to: 9, location: 'cafeteria', activity: 'eat' },
      { from: 9, to: 12, location: 'academic', activity: 'lecture' },
      { from: 12, to: 13, location: 'cafeteria', activity: 'eat' },
      { from: 13, to: 15, location: 'library', activity: 'study' },
      { from: 15, to: 17, location: 'sports', activity: 'sport' },
      { from: 17, to: 19, location: 'courtyard', activity: 'social' },
      { from: 19, to: 20, location: 'cafeteria', activity: 'eat' },
      { from: 20, to: 22, location: 'hostel', activity: 'relax' },
      { from: 22, to: 7, location: 'hostel', activity: 'sleep' }
    ];
  }

  async spawnVehicles() {
    const defs = [
      { modelKey: 'hatchback', x: -54, z: 38, ry: 0, name: 'Campus Hatchback' },
      { modelKey: 'suv', x: -58, z: 44, ry: 0, name: 'Campus SUV' },
      { modelKey: 'hatchback', x: -50, z: 46, ry: 0, name: 'Student Car' }
    ];
    for (const d of defs) {
      const v = new Vehicle(this, d);
      await v.init();
    }
  }

  setupCamera() {
    this.camera.position.set(0, 8, 42);
    this.camera.lookAt(0, 1.5, 20);
    this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
    this.renderer.domElement.addEventListener('click', () => {
      if (this.player.mode === 'first' && !this.pointerLocked) this.controls.lock();
    });
    this.controls.addEventListener('lock', () => { this.pointerLocked = true; });
    this.controls.addEventListener('unlock', () => { this.pointerLocked = false; });
  }

  setupControls() {}

  setupInput() {
    addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'shift', ' ', 'c', 'e', 'f', 'v', 'tab', 'm', 'escape'].includes(k) || k === ' ') {
        if (k === ' ' || k === 'tab') e.preventDefault();
      }
      this.keys.add(k);
      if (k === 'v') this.toggleCamera();
      if (k === 'e') this.interact();
      if (k === 'f') this.toggleVehicle();
      if (k === 'tab') { this.ui.renderRelationships(); this.ui.el.relationship.classList.remove('hidden'); }
      if (k === 'm') this.ui.togglePhone(true);
      if (k === 'escape') this.ui.togglePause(true);
      if (k === 'c') this.input.crouch = true;
    });
    addEventListener('keyup', e => {
      const k = e.key.toLowerCase();
      this.keys.delete(k);
      if (k === 'c') this.input.crouch = false;
    });

    addEventListener('mousemove', e => {
      if (this.pointerLocked) {
        this.player.yaw -= e.movementX * 0.002;
        this.player.pitch = clamp(this.player.pitch - e.movementY * 0.002, -1.2, 1.2);
      } else if (this.draggingLook) {
        this.player.yaw -= e.movementX * 0.004;
        this.player.pitch = clamp(this.player.pitch - e.movementY * 0.004, -1.2, 1.2);
      }
    });
    this.renderer.domElement.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && this.player.mode === 'third') this.draggingLook = true;
    });
    addEventListener('pointerup', () => { this.draggingLook = false; });

    // Mobile joystick
    const zone = document.getElementById('joystick-zone');
    const knob = document.getElementById('joystick-knob');
    let joyId = null, base = null;
    if (zone) {
      zone.addEventListener('pointerdown', e => {
        joyId = e.pointerId; base = zone.getBoundingClientRect();
        zone.setPointerCapture(e.pointerId);
      });
      zone.addEventListener('pointermove', e => {
        if (e.pointerId !== joyId || !base) return;
        const dx = e.clientX - (base.left + base.width / 2);
        const dy = e.clientY - (base.top + base.height / 2);
        const len = Math.hypot(dx, dy);
        const max = 45;
        const nx = clamp(dx / max, -1, 1), ny = clamp(dy / max, -1, 1);
        knob.style.transform = `translate(${nx * 32}px,${ny * 32}px)`;
        this.touch.x = nx;
        this.touch.y = ny;
        this.touch.active = len > 8;
      });
      zone.addEventListener('pointerup', e => {
        if (e.pointerId === joyId) { joyId = null; this.touch = { x: 0, y: 0, active: false }; knob.style.transform = ''; }
      });
    }

    document.querySelectorAll('.m-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = btn.dataset.action;
        if (a === 'jump') this.input.jump = true;
        if (a === 'sprint') this.input.sprint = !this.input.sprint;
        if (a === 'crouch') this.input.crouch = !this.input.crouch;
        if (a === 'interact') this.interact();
        if (a === 'vehicle') this.toggleVehicle();
        if (a === 'camera') this.toggleCamera();
        if (a === 'phone') this.ui.togglePhone(true);
        if (a === 'map') this.ui.togglePhone(true);
      });
    });

    // Mobile look on right half
    this.renderer.domElement.addEventListener('touchstart', e => {
      for (const t of e.changedTouches) {
        if (t.clientX > innerWidth * 0.45) {
          this.lookTouch = { active: true, lastX: t.clientX, lastY: t.clientY, id: t.identifier };
        }
      }
    }, { passive: true });
    this.renderer.domElement.addEventListener('touchmove', e => {
      for (const t of e.changedTouches) {
        if (this.lookTouch.active && t.identifier === this.lookTouch.id) {
          const dx = t.clientX - this.lookTouch.lastX;
          const dy = t.clientY - this.lookTouch.lastY;
          this.player.yaw -= dx * 0.005;
          this.player.pitch = clamp(this.player.pitch - dy * 0.005, -1.2, 1.2);
          this.lookTouch.lastX = t.clientX;
          this.lookTouch.lastY = t.clientY;
        }
      }
    }, { passive: true });
    this.renderer.domElement.addEventListener('touchend', () => { this.lookTouch.active = false; }, { passive: true });

    addEventListener('resize', () => {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
    });
  }

  bindHUD() {
    document.getElementById('dialogue-input')?.addEventListener('focus', () => { this.draggingLook = false; });
  }

  toggleCamera() {
    this.player.mode = this.player.mode === 'third' ? 'first' : 'third';
    if (this.player.mode === 'third' && this.pointerLocked) this.controls.unlock();
    this.ui.notify(this.player.mode === 'first' ? 'First-person camera' : 'Third-person camera', 1200);
  }

  async interact() {
    if (this.player.vehicle) return;
    if (this.nearby) {
      if (this.nearby.npc) {
        this.ui.openDialogue(this.nearby.npc);
      } else if (this.nearby.door) {
        this.enterBuilding(this.nearby.door);
      } else if (this.nearby.activity) {
        this.doActivity(this.nearby.activity, this.nearby.label);
      } else if (this.nearby.exit) {
        this.exitBuilding();
      }
    } else {
      this.ui.notify('Nothing to interact with here.', 1200);
    }
  }

  toggleVehicle() {
    if (this.player.vehicle) {
      this.player.vehicle.exit(this.player);
      this.ui.notify('You left the vehicle.');
      return;
    }
    const v = this.vehicles.find(v => v.group.position.distanceTo(this.player.position) < 5);
    if (v) {
      v.enter(this.player);
      this.ui.notify(`Entered ${v.name}. WASD drive · Space brake · F exit.`);
    } else {
      this.ui.notify('No vehicle nearby.');
    }
  }

  enterBuilding(buildingId) {
    const b = this.world.buildings.find(b => b.id === buildingId);
    if (!b) return;
    this.player.currentBuilding = b;
    this.player.group.position.copy(b.interior.spawn);
    this.ui.notify(`Entered ${b.name}.`);
  }

  exitBuilding() {
    if (!this.player.currentBuilding) return;
    const b = this.player.currentBuilding;
    this.player.group.position.set(b.x, 0, b.z + b.half + 3);
    this.player.currentBuilding = null;
    this.ui.notify(`Left ${b.name}.`);
  }

  doActivity(activity, label) {
    const p = this.player;
    const stats = p.stats;
    if (activity === 'lecture') {
      this.advanceTime(60);
      stats.intelligence = clamp(stats.intelligence + 4, 0, 100);
      stats.energy = clamp(stats.energy - 12, 0, 100);
      stats.stress = clamp(stats.stress + 4, 0, 100);
      p.academics.attendance++;
      p.academics.courses.push({ name: 'Lecture', attended: true });
      this.ui.notify('Lecture attended. Intelligence +4, Energy −12.');
      this.setObjective('Study in the library or complete an assignment.');
    } else if (activity === 'study') {
      this.advanceTime(45);
      stats.intelligence = clamp(stats.intelligence + 3, 0, 100);
      stats.stress = clamp(stats.stress + 3, 0, 100);
      stats.energy = clamp(stats.energy - 8, 0, 100);
      p.academics.assignmentsDone = clamp(p.academics.assignmentsDone + 1, 0, p.academics.assignmentsTotal);
      this.ui.notify('Study session complete. Intelligence +3, assignment progress +1.');
    } else if (activity === 'eat') {
      if (p.money >= 120) {
        p.money -= 120;
        stats.hunger = clamp(stats.hunger + 32, 0, 100);
        stats.happiness = clamp(stats.happiness + 3, 0, 100);
        this.ui.notify('Bought food. Hunger +32. ₹120 spent.');
      } else this.ui.notify('Not enough money for food.');
    } else if (activity === 'sleep') {
      this.advanceTime(8 * 60);
      stats.energy = 100;
      stats.stress = clamp(stats.stress - 25, 0, 100);
      stats.hygiene = clamp(stats.hygiene - 15, 0, 100);
      stats.hunger = clamp(stats.hunger - 20, 0, 100);
      this.ui.notify('You slept through the night. Energy restored.');
      this.setObjective('Attend a lecture or study.');
    } else if (activity === 'shower') {
      stats.hygiene = 100;
      stats.happiness = clamp(stats.happiness + 4, 0, 100);
      this.advanceTime(20);
      this.ui.notify('Showered. Hygiene restored.');
    } else if (activity === 'workout') {
      this.advanceTime(50);
      stats.fitness = clamp(stats.fitness + 5, 0, 100);
      stats.energy = clamp(stats.energy - 20, 0, 100);
      stats.hygiene = clamp(stats.hygiene - 18, 0, 100);
      stats.happiness = clamp(stats.happiness + 5, 0, 100);
      this.ui.notify('Workout complete. Fitness +5, Energy −20.');
    } else if (activity === 'office') {
      this.advanceTime(30);
      stats.confidence = clamp(stats.confidence + 2, 0, 100);
      this.ui.notify('You spoke with the administrative staff.');
    } else {
      this.ui.notify(label || 'Activity completed.');
    }
  }

  setObjective(text) {
    const el = document.getElementById('objective-text');
    if (el) el.textContent = text;
  }

  advanceTime(mins) {
    this.time.minutes += mins;
    while (this.time.minutes >= 1440) {
      this.time.minutes -= 1440;
      this.time.day++;
      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      this.time.weekday = weekdays[(this.time.day - 1) % 7];
      if (this.time.day % 7 === 0) {
        this.time.semester++;
        this.ui.notify('A new semester begins.');
      }
    }
    this.time.totalMinutes += mins;
    this.decayStats(mins / 60);
  }

  decayStats(hours) {
    const s = this.player.stats;
    s.hunger = clamp(s.hunger - hours * 4, 0, 100);
    s.energy = clamp(s.energy - hours * 3, 0, 100);
    s.hygiene = clamp(s.hygiene - hours * 2, 0, 100);
    s.stress = clamp(s.stress + hours * 1.2, 0, 100);
    s.happiness = clamp(s.happiness - hours * 0.4, 0, 100);
  }

  updateNearby() {
    if (this.player.vehicle) { this.nearby = null; this.ui.showPrompt(null); return; }
    let best = null, bestD = 4.2;

    for (const npc of this.npcs) {
      const d = npc.group.position.distanceTo(this.player.position);
      if (d < bestD) { bestD = d; best = { npc }; }
    }
    for (const b of this.world.buildings) {
      const d = b.door.position.distanceTo(this.player.position);
      if (d < bestD) { bestD = d; best = { door: b.id }; }
    }
    for (const it of this.interactables) {
      if (it.userData.vehicle) {
        const d = it.position.distanceTo(this.player.position);
        if (d < bestD) { bestD = d; best = { activity: 'vehicle', label: 'Enter Vehicle' }; }
      } else if (it.userData.activity) {
        const d = it.getWorldPosition(new THREE.Vector3()).distanceTo(this.player.position);
        if (d < bestD) { bestD = d; best = { activity: it.userData.activity, label: it.userData.label }; }
      } else if (it.userData.exit) {
        const d = it.getWorldPosition(new THREE.Vector3()).distanceTo(this.player.position);
        if (d < bestD) { bestD = d; best = { exit: true }; }
      }
    }

    this.nearby = best;
    if (best?.npc) this.ui.showPrompt(`Talk to ${best.npc.name}`);
    else if (best?.door) this.ui.showPrompt(`Enter ${this.world.buildings.find(b => b.id === best.door)?.name}`);
    else if (best?.exit) this.ui.showPrompt('Exit building');
    else if (best?.activity) this.ui.showPrompt(best.label);
    else this.ui.showPrompt(null);
  }

  updatePlayerInput() {
    const i = this.input;
    i.forward = this.keys.has('w') || (this.touch.active && this.touch.y < -0.25);
    i.backward = this.keys.has('s') || (this.touch.active && this.touch.y > 0.25);
    i.left = this.keys.has('a') || (this.touch.active && this.touch.x < -0.25);
    i.right = this.keys.has('d') || (this.touch.active && this.touch.x > 0.25);
    i.sprint = this.keys.has('shift');
    i.jump = this.keys.has(' ');
    i.crouch = this.keys.has('c');
  }

  updateCamera(dt) {
    if (this.player.vehicle) return;
    const p = this.player;
    if (p.mode === 'first') {
      this.camera.position.set(p.position.x, p.position.y + 1.62, p.position.z);
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.y = p.yaw;
      this.camera.rotation.x = p.pitch;
      return;
    }

    const target = new THREE.Vector3(p.position.x, p.position.y + 1.45, p.position.z);
    const dist = 6.2;
    const offset = new THREE.Vector3(
      Math.sin(p.yaw) * Math.cos(p.pitch) * dist,
      Math.sin(p.pitch) * dist + 1.4,
      Math.cos(p.yaw) * Math.cos(p.pitch) * dist
    );
    const desired = target.clone().add(offset);
    const ray = new THREE.Raycaster(target, desired.clone().sub(target).normalize(), 0, dist);
    const hits = ray.intersectObjects(this.world.buildings.map(b => b.door), false);
    if (hits.length) desired.copy(target.clone().add(desired.clone().sub(target).normalize().multiplyScalar(Math.max(1.2, hits[0].distance - 0.3))));

    this.camera.position.lerp(desired, 0.18);
    this.camera.lookAt(target);
  }

  updateTimeAndWeather(dt) {
    if (this.paused) return;
    // 1 game minute per real second
    const before = Math.floor(this.time.minutes);
    this.time.minutes += dt * 1.0;
    this.time.totalMinutes += dt * 1.0;
    while (this.time.minutes >= 1440) {
      this.time.minutes -= 1440;
      this.time.day++;
      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      this.time.weekday = weekdays[(this.time.day - 1) % 7];
      if (this.time.day % 7 === 0) {
        this.time.semester++;
        this.ui.notify('A new semester begins.');
      }
    }
    if (Math.floor(this.time.minutes) !== before) {
      this.decayStats(1 / 60);
      if (Math.floor(this.time.minutes) % 60 === 0) this.updateWeather();
    }
    this.updateLighting();
  }

  updateWeather() {
    const types = ['Clear', 'Cloudy', 'Light Rain', 'Windy'];
    this.weather.type = pick(types);
    this.weather.temp = Math.round(rand(18, 34));
    this.ui.notify(`Weather: ${this.weather.type}, ${this.weather.temp}°C`);
  }

  updateLighting() {
    const t = this.time.minutes / 1440;
    const sunAngle = t * Math.PI * 2 - Math.PI / 2;
    this.sun.position.set(Math.cos(sunAngle) * 90, Math.max(4, Math.sin(sunAngle) * 80 + 20), Math.sin(sunAngle * 0.7) * 60);
    const daylight = clamp(Math.sin(sunAngle) * 1.5 + 0.5, 0.08, 1);
    this.hemi.intensity = 0.3 + daylight * 0.9;
    this.sun.intensity = 0.4 + daylight * 2.0;
    this.scene.background.setHSL(0.58, 0.55, 0.08 + daylight * 0.5);
    this.scene.fog.color.setHSL(0.58, 0.35, 0.25 + daylight * 0.4);
  }

  updateLocationName() {
    let closest = null, dist = Infinity;
    for (const key in LOCATIONS) {
      const l = LOCATIONS[key];
      const d = Math.hypot(this.player.position.x - l.x, this.player.position.z - l.z);
      if (d < dist) { dist = d; closest = l; }
    }
    if (dist < 22) this.currentLocationName = closest.name;
    else this.currentLocationName = 'Campus Grounds';
  }

  updateNPCs(dt) {
    const hour = this.time.minutes / 60;
    for (const n of this.npcs) n.update(dt, hour);
  }

  updateVehicles(dt) {
    for (const v of this.vehicles) v.update(dt, this.input);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (!this.paused && !this.pauseForDialogue) {
      this.updatePlayerInput();
      this.player.update(dt, this.input);
      this.updateNPCs(dt);
      this.updateVehicles(dt);
      this.updateTimeAndWeather(dt);
      this.updateLocationName();
      this.updateNearby();
      this.updateCamera(dt);
    }

    this.ui.updateHUD();
    this.autosaveTimer += dt;
    if (this.autosaveTimer > 120) {
      this.autosaveTimer = 0;
      this.autosave();
    }

    this.renderer.render(this.scene, this.camera);
  }

  serialise() {
    return {
      version: VERSION,
      savedAt: Date.now(),
      player: {
        character: this.player.character,
        stats: this.player.stats,
        money: this.player.money,
        bank: this.player.bank,
        inventory: this.player.inventory,
        academics: this.player.academics,
        position: this.player.position.toArray(),
        yaw: this.player.yaw,
        pitch: this.player.pitch,
        mode: this.player.mode
      },
      college: this.config.college,
      time: this.time,
      weather: this.weather,
      npcs: this.npcs.map(n => ({
        id: n.id, name: n.name, role: n.role, department: n.department,
        gender: n.gender, personality: n.personality, color: n.color,
        hairColor: n.hairColor, hair: n.hair, accessory: n.accessory,
        position: n.position.toArray(),
        memories: n.memories,
        relationships: n.relationships,
        modelKey: n.modelKey
      })),
      vehicles: this.vehicles.map(v => ({
        id: v.id, modelKey: v.modelKey, name: v.name,
        position: v.group.position.toArray(), ry: v.group.rotation.y,
        owned: v.owned
      })),
      flags: this.player.flags
    };
  }

  async saveGame(slot = 'autosave') {
    try {
      const data = this.serialise();
      await saveManager.save(data, slot);
      this.ui.notify(`Game saved to ${slot}.`);
    } catch (e) {
      console.error(e);
      this.ui.notify('Save failed. Check console.');
    }
  }

  async autosave() {
    if (this.settings.autosave === 'off') return;
    await this.saveGame('autosave');
  }

  async loadLatest() {
    const latest = await saveManager.latest();
    if (!latest) { this.ui.notify('No save found.'); return; }
    location.reload();
  }

  applySave(data) {
    if (!data) return;
    this.config = { character: data.player.character, college: data.college };
    this.time = data.time;
    this.weather = data.weather;
    this.player.stats = data.player.stats;
    this.player.money = data.player.money;
    this.player.bank = data.player.bank;
    this.player.inventory = data.player.inventory;
    this.player.academics = data.player.academics;
    this.player.position.fromArray(data.player.position);
    this.player.yaw = data.player.yaw;
    this.player.pitch = data.player.pitch;
    this.player.mode = data.player.mode;

    for (const saved of data.npcs || []) {
      const npc = this.npcs.find(n => n.id === saved.id);
      if (npc) {
        npc.position.fromArray(saved.position);
        npc.target.copy(npc.position);
        npc.memories = saved.memories || [];
        npc.relationships = saved.relationships || npc.relationships;
      }
    }
    for (const sv of data.vehicles || []) {
      const v = this.vehicles.find(v => v.id === sv.id);
      if (v) {
        v.group.position.fromArray(sv.position);
        v.group.rotation.y = sv.ry;
      }
    }
    this.player.flags = data.flags || {};
  }
}

/* ============================================================
   BOOT
   ============================================================ */
async function bootGame() {
  const params = new URLSearchParams(location.search);
  const loadId = localStorage.getItem('campusLife.loadSaveId');
  let config = null;
  let saved = null;

  if (loadId) {
    saved = await saveManager.load(loadId);
    if (saved) config = { character: saved.player.character, college: saved.college };
  }

  if (!config) {
    const pending = localStorage.getItem('campusLife.pendingGame');
    if (pending) {
      try { config = JSON.parse(pending); } catch {}
    }
  }

  if (!config) {
    config = {
      character: {
        first: 'Alex', last: 'Morgan', nickname: 'Lex', age: 18, gender: 'male',
        pronouns: 'he/him', country: 'India', hometown: 'Pune',
        base: 'male', hair: 'short', hairColor: '#2b1d14', skin: '#d9a06b',
        eyes: '#3b2a1a', height: 1, build: 1, clothing: '#3b6ea8',
        shoes: '#20242c', accessory: 'backpack', personality: ['friendly', 'ambitious'],
        wealth: 'comfortable', familyJob: 'Teacher', prevEdu: 'Public high school',
        finance: 'savings', history: 'A curious student looking for a fresh start.',
        interests: 'Computer science, psychology'
      },
      college: {
        type: 'university', name: 'Northgate University', country: 'India', city: 'Pune',
        reputation: 'high', size: 'medium', population: 8000, tuition: 120000,
        hostel: 'single', difficulty: 'normal', culture: 'collaborative',
        description: 'A modern campus with strong engineering and arts programmes.'
      }
    };
  }

  const game = new Game(config);
  window.game = game;
  await game.init();
  if (saved) game.applySave(saved);
}

async function bootMenu() {
  const menu = new MenuController();
  window.menuController = menu;
  new MenuScene();
  const settings = JSON.parse(localStorage.getItem('campusLife.settings') || '{}');
  if (settings.proxy) document.getElementById('set-proxy').value = settings.proxy;
  if (settings.model) document.getElementById('set-model').value = settings.model;
  if (settings.quality) document.getElementById('set-quality').value = settings.quality;
  if (settings.shadows) document.getElementById('set-shadows').value = settings.shadows;
  if (settings.autosave) document.getElementById('set-autosave').value = settings.autosave;
}

if (IS_MENU) bootMenu();
else if (IS_GAME) bootGame();

/* ============================================================
   LICENSE / ATTRIBUTION SUMMARY
   ------------------------------------------------------------
   Three.js — MIT.
   Three.js example models (Soldier, Xbot, RobotExpressive) — MIT.
   Kenney City Kit, Car Kit, Furniture Kit, Nature Kit — CC0 1.0.
   Quaternius character and animation packs — CC0 / CC-BY as
     indicated on the original pack pages. The manifest above
     uses stable direct GLB URLs where available.
   OpenRouter API — used only through the server-side proxy.
   ============================================================ */