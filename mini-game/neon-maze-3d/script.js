import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- 定数 ---
const MAZE_SIZE = 21; // 奇数である必要があります
const CELL_SIZE = 10;
const WALL_HEIGHT = 12;
const PLAYER_HEIGHT = 5;
const PLAYER_SPEED = 0.5;

// --- グローバル変数 ---
let scene, camera, renderer, controls;
let maze = [];
let walls = [];
let fragments = [];
let enemies = [];
let sword;
let isAttacking = false;
let playerHP = 100;
let score = 0;
let startTime;
let timerInterval;
let isGameActive = false;

// --- DOM要素 ---
const container = document.getElementById('canvas-wrapper');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const totalScoreElement = document.getElementById('total-score');
const hpElement = document.getElementById('hp');
const hpBar = document.getElementById('hp-bar');
const instructions = document.getElementById('instructions');
const loading = document.getElementById('loading');
const gameOver = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');

// --- テクスチャ生成関数 ---
function createBrickTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // ベースカラー
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, 0, 256, 256);

    // レンガの模様
    ctx.strokeStyle = '#5d2e0a';
    ctx.lineWidth = 4;
    const brickW = 64;
    const brickH = 32;

    for (let y = 0; y < 256; y += brickH) {
        const offset = (y / brickH) % 2 === 0 ? 0 : brickW / 2;
        for (let x = -offset; x < 256; x += brickW) {
            ctx.strokeRect(x, y, brickW, brickH);
            // 質感のためのノイズ
            ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
            ctx.fillRect(x + 2, y + 2, brickW - 4, brickH - 4);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
}

function createDirtTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // 土のベースカラー
    ctx.fillStyle = '#553311';
    ctx.fillRect(0, 0, 256, 256);

    // 土の質感（ランダムな点と色ムラ）
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const size = Math.random() * 2;
        const colorValue = 50 + Math.random() * 50;
        ctx.fillStyle = `rgb(${colorValue}, ${colorValue * 0.7}, ${colorValue * 0.4})`;
        ctx.fillRect(x, y, size, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(MAZE_SIZE, MAZE_SIZE);
    return texture;
}

// --- 初期化 ---
function init() {
    // シーン設定
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1005);
    scene.fog = new THREE.FogExp2(0x1a1005, 0.02);

    // カメラ設定
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    // レンダラー設定
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // コントロール設定
    controls = new PointerLockControls(camera, document.body);

    instructions.addEventListener('click', () => {
        controls.lock();
    });

    controls.addEventListener('lock', () => {
        instructions.style.display = 'none';
        if (!isGameActive) startGame();
    });

    controls.addEventListener('unlock', () => {
        if (isGameActive) {
            instructions.style.display = 'flex';
        }
    });

    // ライト設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // プレイヤーの持ちライト（松明風の暖かい光）
    const playerLight = new THREE.PointLight(0xffaa44, 2, 60);
    playerLight.position.set(0, 0, 0);
    camera.add(playerLight);
    
    // 剣の作成
    createSword();
    scene.add(camera);

    // 迷路生成開始
    generateMaze();
    createMazeObjects();

    // イベントリスナー
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousedown', (e) => {
        if (controls.isLocked && isGameActive && e.button === 0) {
            attack();
        }
    });
    restartButton.addEventListener('click', resetGame);

    animate();
}

function createSword() {
    sword = new THREE.Group();
    
    // 刀身
    const bladeGeo = new THREE.BoxGeometry(0.2, 3, 0.5);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 1.5;
    sword.add(blade);

    // 柄
    const handleGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x5d2e0a });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = -0.5;
    sword.add(handle);

    // つば
    const guardGeo = new THREE.BoxGeometry(0.8, 0.1, 0.8);
    const guardMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 });
    const guard = new THREE.Mesh(guardGeo, guardMat);
    sword.add(guard);

    sword.position.set(1.5, -1.5, -2);
    sword.rotation.set(-0.2, 0, 0.2);
    camera.add(sword);
}

function attack() {
    if (isAttacking) return;
    isAttacking = true;

    // 攻撃アニメーション (簡易)
    const startRot = sword.rotation.clone();
    const startPos = sword.position.clone();

    let step = 0;
    const animateAttack = () => {
        step += 0.15;
        if (step < 1) {
            sword.rotation.x = startRot.x - Math.sin(step * Math.PI) * 1.5;
            sword.position.z = startPos.z - Math.sin(step * Math.PI) * 1;
            requestAnimationFrame(animateAttack);
        } else {
            sword.rotation.copy(startRot);
            sword.position.copy(startPos);
            isAttacking = false;
        }
    };
    animateAttack();

    // 当たり判定
    checkSwordHit();
}

function checkSwordHit() {
    enemies.forEach((enemy, index) => {
        const dist = camera.position.distanceTo(enemy.mesh.position);
        if (dist < 8) {
            // 視界の方向にあるかチェック
            const toEnemy = enemy.mesh.position.clone().sub(camera.position).normalize();
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            const dot = toEnemy.dot(forward);
            
            if (dot > 0.5) { // 前方約60度以内
                damageEnemy(enemy, index);
            }
        }
    });
}

// --- 迷路生成 (穴掘り法) ---
function generateMaze() {
    maze = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(1));

    function walk(x, y) {
        maze[y][x] = 0;
        const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);
        
        for (let [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx > 0 && nx < MAZE_SIZE - 1 && ny > 0 && ny < MAZE_SIZE - 1 && maze[ny][nx] === 1) {
                maze[y + dy / 2][x + dx / 2] = 0;
                walk(nx, ny);
            }
        }
    }

    walk(1, 1);
    
    // 出口を作成
    maze[MAZE_SIZE - 2][MAZE_SIZE - 2] = 0;
}

// --- 3Dオブジェクト作成 ---
function createMazeObjects() {
    const dirtTexture = createDirtTexture();
    const brickTexture = createBrickTexture();

    // 床
    const floorGeo = new THREE.PlaneGeometry(MAZE_SIZE * CELL_SIZE, MAZE_SIZE * CELL_SIZE);
    const floorMat = new THREE.MeshStandardMaterial({ 
        map: dirtTexture,
        roughness: 0.9, 
        metalness: 0.1 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((MAZE_SIZE * CELL_SIZE) / 2 - CELL_SIZE / 2, 0, (MAZE_SIZE * CELL_SIZE) / 2 - CELL_SIZE / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    // 壁のジオメトリとマテリアル
    const wallGeo = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, CELL_SIZE);
    
    const wallMat = new THREE.MeshStandardMaterial({ 
        map: brickTexture,
        roughness: 0.8,
        metalness: 0.1
    });

    for (let y = 0; y < MAZE_SIZE; y++) {
        for (let x = 0; x < MAZE_SIZE; x++) {
            if (maze[y][x] === 1) {
                const wall = new THREE.Mesh(wallGeo, wallMat);
                wall.position.set(x * CELL_SIZE, WALL_HEIGHT / 2, y * CELL_SIZE);
                wall.castShadow = true;
                wall.receiveShadow = true;
                scene.add(wall);
                walls.push(wall);
            } else {
                // 通路にアイテムを配置
                if (Math.random() > 0.93 && !(x === 1 && y === 1)) {
                    createFragment(x, y);
                }
                // 通路に敵を配置
                if (Math.random() > 0.95 && !(x === 1 && y === 1)) {
                    createEnemy(x, y);
                }
            }
        }
    }

    // 出口（コア）の配置
    createCore(MAZE_SIZE - 2, MAZE_SIZE - 2);

    totalScoreElement.textContent = fragments.length;
    loading.style.display = 'none';
}

function createEnemy(x, y) {
    const isSkeleton = Math.random() > 0.5;
    const enemyGroup = new THREE.Group();
    let hp = isSkeleton ? 2 : 1;

    if (isSkeleton) {
        const boneMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9 });
        
        // 頭蓋骨 (詳細)
        const skullGroup = new THREE.Group();
        const skullGeo = new THREE.SphereGeometry(0.8, 16, 12);
        const skull = new THREE.Mesh(skullGeo, boneMat);
        const jawGeo = new THREE.BoxGeometry(0.6, 0.4, 0.6);
        const jaw = new THREE.Mesh(jawGeo, boneMat);
        jaw.position.set(0, -0.6, 0.2);
        
        const eyeGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x220000 });
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(0.3, 0.1, 0.6);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(-0.3, 0.1, 0.6);
        
        skullGroup.add(skull, jaw, eyeL, eyeR);
        skullGroup.position.y = 5;
        enemyGroup.add(skullGroup);

        // 背骨
        for (let i = 0; i < 5; i++) {
            const vertGeo = new THREE.SphereGeometry(0.25, 8, 8);
            const vert = new THREE.Mesh(vertGeo, boneMat);
            vert.position.y = 2.5 + i * 0.5;
            enemyGroup.add(vert);
        }

        // 肋骨 (リングを使用)
        for (let i = 0; i < 4; i++) {
            const ribGeo = new THREE.TorusGeometry(0.8, 0.15, 8, 24, Math.PI * 1.5);
            const rib = new THREE.Mesh(ribGeo, boneMat);
            rib.position.y = 3 + i * 0.5;
            rib.rotation.x = Math.PI / 2;
            rib.rotation.z = Math.PI / 4;
            enemyGroup.add(rib);
        }

        // 腕と脚
        const createBone = (x, y, z, rotZ) => {
            const bone = new THREE.Group();
            const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2, 8), boneMat);
            const joint = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), boneMat);
            cyl.position.y = -1;
            bone.add(cyl, joint);
            bone.position.set(x, y, z);
            bone.rotation.z = rotZ;
            return bone;
        };

        enemyGroup.add(createBone(1, 4.5, 0, -Math.PI/6)); // 右腕
        enemyGroup.add(createBone(-1, 4.5, 0, Math.PI/6)); // 左腕
        enemyGroup.add(createBone(0.6, 2.5, 0, 0)); // 右脚
        enemyGroup.add(createBone(-0.6, 2.5, 0, 0)); // 左脚

    } else {
        // 粘液に塗れたスライム (多層構造)
        const slimeGroup = new THREE.Group();
        
        // 核 (不透明)
        const coreGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const coreMat = new THREE.MeshStandardMaterial({ color: 0x004400 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 1.5;
        slimeGroup.add(core);

        // メインボディ (半透明・高光沢)
        const bodyGeo = new THREE.SphereGeometry(1.8, 32, 24);
        const bodyMat = new THREE.MeshPhysicalMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: 0.6,
            roughness: 0,
            metalness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.8;
        slimeGroup.add(body);

        // 滴る粘液 (小さな球体をランダムに配置)
        for (let i = 0; i < 6; i++) {
            const dripGeo = new THREE.SphereGeometry(0.4, 8, 8);
            const drip = new THREE.Mesh(dripGeo, bodyMat);
            const angle = Math.random() * Math.PI * 2;
            const dist = 1.2 + Math.random() * 0.4;
            drip.position.set(Math.cos(angle) * dist, 0.5 + Math.random() * 1.5, Math.sin(angle) * dist);
            slimeGroup.add(drip);
        }

        enemyGroup.add(slimeGroup);
    }

    enemyGroup.position.set(x * CELL_SIZE, 0, y * CELL_SIZE);
    scene.add(enemyGroup);
    enemies.push({ mesh: enemyGroup, hp, type: isSkeleton ? 'skeleton' : 'slime', lastAttack: 0 });
}

function updateEnemies() {
    const now = Date.now();
    enemies.forEach((enemy, index) => {
        const dist = camera.position.distanceTo(enemy.mesh.position);

        // 追跡AI (一定距離内なら追ってくる)
        if (dist < 40 && dist > 3) {
            const dir = camera.position.clone().sub(enemy.mesh.position).normalize();
            const speed = enemy.type === 'skeleton' ? 0.15 : 0.1;
            
            const nextX = enemy.mesh.position.x + dir.x * speed;
            const nextZ = enemy.mesh.position.z + dir.z * speed;

            // 壁との衝突判定
            if (!checkCollision(nextX, enemy.mesh.position.z)) {
                enemy.mesh.position.x = nextX;
            }
            if (!checkCollision(enemy.mesh.position.x, nextZ)) {
                enemy.mesh.position.z = nextZ;
            }
            
            enemy.mesh.lookAt(camera.position.x, 0, camera.position.z);
        }

        // 攻撃AI
        if (dist < 5 && now - enemy.lastAttack > 1500) {
            damagePlayer(10);
            enemy.lastAttack = now;
            
            // 攻撃時の演出
            enemy.mesh.position.y += 1;
            setTimeout(() => { enemy.mesh.position.y -= 1; }, 200);
        }

        // スライムのバウンドアニメーション
        if (enemy.type === 'slime') {
            enemy.mesh.scale.y = 1 + Math.sin(now * 0.005) * 0.2;
            enemy.mesh.position.y = (1 + Math.sin(now * 0.005) * 0.2) * 1.5;
        }
    });
}

function damageEnemy(enemy, index) {
    enemy.hp -= 1;
    
    // ヒット時の演出 (赤く光らせる)
    enemy.mesh.traverse(child => {
        if (child.isMesh) {
            const originalColor = child.material.color.getHex();
            child.material.color.setHex(0xff0000);
            setTimeout(() => { child.material.color.setHex(originalColor); }, 100);
        }
    });

    if (enemy.hp <= 0) {
        scene.remove(enemy.mesh);
        enemies.splice(index, 1);
    }
}

function damagePlayer(amount) {
    if (!isGameActive) return;
    playerHP -= amount;
    if (playerHP < 0) playerHP = 0;
    
    hpElement.textContent = playerHP;
    hpBar.style.width = `${playerHP}%`;

    // 被ダメージ演出 (画面を一瞬赤くするなどはCSSかオーバーレイが必要だが、簡易的に)
    renderer.domElement.style.filter = 'sepia(1) saturate(5) hue-rotate(-50deg)';
    setTimeout(() => { renderer.domElement.style.filter = ''; }, 100);

    if (playerHP <= 0) {
        endGame(false);
    }
}

function createFragment(x, y) {
    const chestGroup = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });

    // 宝箱の本体 (サイズアップ)
    const baseGeo = new THREE.BoxGeometry(4, 2, 2.5);
    const base = new THREE.Mesh(baseGeo, woodMat);
    base.position.y = 1;
    chestGroup.add(base);

    // かまぼこ型の蓋
    const lidGroup = new THREE.Group();
    const lidGeo = new THREE.CylinderGeometry(1.3, 1.3, 4.1, 12, 1, false, 0, Math.PI);
    const lid = new THREE.Mesh(lidGeo, woodMat);
    lid.rotation.z = Math.PI / 2;
    lidGroup.add(lid);

    // 蓋の装飾（金のバンド）
    const bandGeo = new THREE.TorusGeometry(1.35, 0.1, 8, 24, Math.PI);
    const band1 = new THREE.Mesh(bandGeo, goldMat);
    band1.position.y = 1;
    const band2 = new THREE.Mesh(bandGeo, goldMat);
    band2.position.y = -1;
    lidGroup.add(band1, band2);

    lidGroup.position.y = 2;
    lidGroup.rotation.x = -Math.PI * 0.15; // 少し開ける
    chestGroup.add(lidGroup);

    // 本体の装飾
    const horizBandGeo = new THREE.BoxGeometry(4.2, 0.2, 2.7);
    const hBand = new THREE.Mesh(horizBandGeo, goldMat);
    hBand.position.y = 1.8;
    chestGroup.add(hBand);

    // 豪華な錠前
    const lockGroup = new THREE.Group();
    const lockBaseGeo = new THREE.BoxGeometry(0.6, 0.8, 0.3);
    const lockBase = new THREE.Mesh(lockBaseGeo, goldMat);
    const holeGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
    const hole = new THREE.Mesh(holeGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }));
    hole.rotation.x = Math.PI / 2;
    lockGroup.add(lockBase, hole);
    lockGroup.position.set(0, 1.5, 1.3);
    chestGroup.add(lockGroup);

    chestGroup.position.set(x * CELL_SIZE, 0, y * CELL_SIZE);
    scene.add(chestGroup);
    
    // 中から溢れる黄金の光
    const light = new THREE.PointLight(0xffaa00, 3, 12);
    light.position.set(x * CELL_SIZE, 2.5, y * CELL_SIZE);
    scene.add(light);

    fragments.push({ mesh: chestGroup, x, y });
}

function createCore(x, y) {
    const geo = new THREE.TorusKnotGeometry(2, 0.5, 100, 16);
    const mat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        emissive: 0x00ffff, 
        emissiveIntensity: 1 
    });
    const core = new THREE.Mesh(geo, mat);
    core.position.set(x * CELL_SIZE, 5, y * CELL_SIZE);
    scene.add(core);
    
    const light = new THREE.PointLight(0x00ffff, 5, 40);
    light.position.set(x * CELL_SIZE, 5, y * CELL_SIZE);
    scene.add(light);

    fragments.push({ mesh: core, x, y, isCore: true });
}

// --- ゲームループ ---
const moveState = { forward: false, backward: false, left: false, right: false };

document.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'KeyW': moveState.forward = true; break;
        case 'KeyS': moveState.backward = true; break;
        case 'KeyA': moveState.left = true; break;
        case 'KeyD': moveState.right = true; break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'KeyW': moveState.forward = false; break;
        case 'KeyS': moveState.backward = false; break;
        case 'KeyA': moveState.left = false; break;
        case 'KeyD': moveState.right = false; break;
    }
});

function animate() {
    requestAnimationFrame(animate);

    const now = Date.now();

    if (controls.isLocked && isGameActive) {
        updateMovement();
        updateCollisions();
        updateEnemies();
    }

    // アニメーション演出
    fragments.forEach(f => {
        if (f.isCore) {
            f.mesh.rotation.y += 0.02;
            f.mesh.rotation.z += 0.01;
            f.mesh.rotation.x += 0.01;
        } else {
            // 宝箱はゆっくり浮遊
            f.mesh.position.y = Math.sin(now * 0.002) * 0.2;
            f.mesh.rotation.y = Math.sin(now * 0.001) * 0.05;
        }
    });

    // 敵のボビングアニメーション
    enemies.forEach(enemy => {
        if (enemy.type === 'skeleton') {
            enemy.mesh.position.y = Math.sin(now * 0.003) * 0.1;
        }
        // スライムのアニメーションはupdateEnemies内で処理済み
    });

    renderer.render(scene, camera);
}

function updateMovement() {
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(moveState.backward) - Number(moveState.forward));
    const sideVector = new THREE.Vector3(Number(moveState.left) - Number(moveState.right), 0, 0);

    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(PLAYER_SPEED).applyQuaternion(camera.quaternion);
    
    // Y方向の移動を制限しつつ、XとZの移動を個別にチェック（壁ずり移動を可能にする）
    const nextX = camera.position.x + direction.x;
    const nextZ = camera.position.z + direction.z;

    if (!checkCollision(nextX, camera.position.z)) {
        camera.position.x = nextX;
    }
    if (!checkCollision(camera.position.x, nextZ)) {
        camera.position.z = nextZ;
    }
    
    camera.position.y = PLAYER_HEIGHT;
}

function checkCollision(x, z) {
    const margin = 2.5; // 衝突判定のマージン
    const checkPoints = [
        { x: x + margin, z: z + margin },
        { x: x - margin, z: z + margin },
        { x: x + margin, z: z - margin },
        { x: x - margin, z: z - margin }
    ];

    for (const p of checkPoints) {
        const gx = Math.round(p.x / CELL_SIZE);
        const gz = Math.round(p.z / CELL_SIZE);
        if (maze[gz] && maze[gz][gx] === 1) return true;
    }
    return false;
}

function updateCollisions() {
    // アイテム回収
    fragments.forEach((f, index) => {
        const dx = camera.position.x - f.mesh.position.x;
        const dz = camera.position.z - f.mesh.position.z;
        const dist = Math.sqrt(dx*dx + dz*dz);

        if (dist < 4) {
            if (f.isCore) {
                endGame(true);
            } else {
                scene.remove(f.mesh);
                fragments.splice(index, 1);
                score++;
                scoreElement.textContent = score;
            }
        }
    });
}

function startGame() {
    isGameActive = true;
    startTime = Date.now();
    camera.position.set(CELL_SIZE, PLAYER_HEIGHT, CELL_SIZE);
    camera.lookAt(CELL_SIZE * 2, PLAYER_HEIGHT, CELL_SIZE);
    
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        timerElement.textContent = `${mins}:${secs}`;
    }, 1000);
}

function endGame(success) {
    isGameActive = false;
    clearInterval(timerInterval);
    controls.unlock();
    
    gameOver.style.display = 'flex';
    if (success) {
        document.getElementById('result-title').textContent = 'MISSION COMPLETE!';
        document.getElementById('result-text').textContent = `タイム: ${timerElement.textContent} | 宝箱回収: ${score}`;
    } else {
        document.getElementById('result-title').textContent = 'GAME OVER';
        document.getElementById('result-title').style.color = '#ff0000';
        document.getElementById('result-title').style.textShadow = '0 0 15px #ff0000';
        document.getElementById('result-text').textContent = 'エージェントが力尽きました...';
    }
}

function resetGame() {
    location.reload(); // 簡易的にリロードでリセット
}

function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// 実行
init();
