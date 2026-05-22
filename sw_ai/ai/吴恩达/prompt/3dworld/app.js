(function() {
'use strict';

/* ================================================================
   常量与状态 (Constants & State)
   ================================================================ */

var WORLD_SIZE = 8;
var TERRAIN = { GRASS: 0, DIRT: 1, WATER: 2, STONE: 3, TREE: 4, HOUSE: 5 };
var TERRAIN_NAMES = ['grass', 'dirt', 'water', 'stone', 'tree', 'house'];
var TERRAIN_LABELS = ['草地', '土路', '水', '石头', '树', '房子', '擦除'];
var TERRAIN_EMOJIS = ['🌿', '🟫', '💧', '🪨', '🌳', '🏠', '🧹'];

var COLORS = {
    grass:     0x7ec850,
    dirt:      0xc4a45a,
    water:     0x4da6d9,
    stone:     0x9e9e9e,
    leaf:      0x3d8b37,
    trunk:     0x8b5e3c,
    houseBody: 0xf5deb3,
    houseRoof: 0xc75b39,
    table:     0xddd2c0
};

var world = [];
var cellGroups = {};
var currentTool = TERRAIN.GRASS;
var currentSlot = 0;

var cameraTheta   = Math.PI / 4;
var cameraPhi     = Math.PI / 3.5;
var cameraRadius  = 10;
var cameraTarget  = new THREE.Vector3(3.5, 0, 3.5);

// 云层 & 烟雾状态
var clouds = [];
var smokeParticles = [];
var chimneyPositions = [];
var smokeTimer = 0;
var lastTime = 0;

/* ================================================================
   场景 (Scene)
   ================================================================ */

var renderer, camera, scene;
var tableMesh, hoverMesh;
var groundPlane;
var raycaster = new THREE.Raycaster();

function initScene() {
    var container = document.getElementById('canvas-container');
    var w = container.clientWidth;
    var h = container.clientHeight;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    updateCamera();

    scene = new THREE.Scene();

    groundPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 14),
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
    );
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.set(4, 0, 4);
    groundPlane.material.visible = false;
    scene.add(groundPlane);

    var tableGeo = new THREE.BoxGeometry(9.6, 0.2, 9.6);
    var tableMat = new THREE.MeshStandardMaterial({ color: COLORS.table, roughness: 0.65, metalness: 0 });
    tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(4, -0.22, 4);
    tableMesh.receiveShadow = true;
    tableMesh.castShadow = true;
    scene.add(tableMesh);

    var hoverGeo = new THREE.BoxGeometry(1.02, 0.03, 1.02);
    var hoverMat = new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0.45, depthTest: false });
    hoverMesh = new THREE.Mesh(hoverGeo, hoverMat);
    hoverMesh.position.y = 0.07;
    hoverMesh.visible = false;
    hoverMesh.renderOrder = 999;
    hoverMesh.material.depthTest = false;
    hoverMesh.material.depthWrite = false;
    scene.add(hoverMesh);

    window.addEventListener('resize', onResize);
}

function updateCamera() {
    camera.position.x = cameraTarget.x + cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta);
    camera.position.y = cameraTarget.y + cameraRadius * Math.cos(cameraPhi);
    camera.position.z = cameraTarget.z + cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta);
    camera.lookAt(cameraTarget);
}

function onResize() {
    var c = document.getElementById('canvas-container');
    var w = c.clientWidth;
    var h = c.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}

/* ================================================================
   光照 (Lighting)
   ================================================================ */

function initLighting() {
    var hemi = new THREE.HemisphereLight(0xffeedd, 0x8d7c6b, 0.55);
    scene.add(hemi);

    var sun = new THREE.DirectionalLight(0xfff5e8, 0.78);
    sun.position.set(8, 12, 4);
    sun.target.position.set(4, 0, 4);
    scene.add(sun.target);
    sun.castShadow = true;
    sun.shadow.mapSize.width  = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near   = 0.5;
    sun.shadow.camera.far    = 50;
    sun.shadow.camera.left   = -10;
    sun.shadow.camera.right  = 10;
    sun.shadow.camera.top    = 10;
    sun.shadow.camera.bottom = -10;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
}

/* ================================================================
   数据 (Data)
   ================================================================ */

function initWorld() {
    for (var x = 0; x < WORLD_SIZE; x++) {
        world[x] = [];
        for (var z = 0; z < WORLD_SIZE; z++) {
            world[x][z] = { terrain: TERRAIN.GRASS, kind: 'grass' };
        }
    }
}

function inBounds(x, z) {
    return x >= 0 && x < WORLD_SIZE && z >= 0 && z < WORLD_SIZE;
}

function setCellSilent(x, z, terrain) {
    if (!inBounds(x, z)) return;
    world[x][z].terrain = terrain;
    world[x][z].kind = TERRAIN_NAMES[terrain];
    buildCell(x, z);
    updateMinimap();
}

function setCell(x, z, terrain) {
    setCellSilent(x, z, terrain);
    save();
}

function clearAllSilent() {
    for (var x = 0; x < WORLD_SIZE; x++) {
        for (var z = 0; z < WORLD_SIZE; z++) {
            world[x][z].terrain = TERRAIN.GRASS;
            world[x][z].kind = 'grass';
        }
    }
    rebuildAllCells();
    updateMinimap();
}

function clearAll() {
    clearAllSilent();
    save();
}

/* ================================================================
   工厂 (Factory)
   ================================================================ */

function buildCell(x, z) {
    var key = x + ',' + z;
    if (cellGroups[key]) {
        disposeGroup(cellGroups[key]);
        scene.remove(cellGroups[key]);
        delete cellGroups[key];
    }

    var group = new THREE.Group();
    var t = world[x][z].terrain;
    var cx = x + 0.5;
    var cz = z + 0.5;

    switch (t) {
        case TERRAIN.GRASS:  buildGrass(group, cx, cz); break;
        case TERRAIN.DIRT:   buildDirt(group, cx, cz); break;
        case TERRAIN.WATER:  buildWater(group, cx, cz); break;
        case TERRAIN.STONE:  buildGrass(group, cx, cz); buildStoneFeature(group, cx, cz); break;
        case TERRAIN.TREE:   buildGrass(group, cx, cz); buildTreeFeature(group, cx, cz); break;
        case TERRAIN.HOUSE:  buildGrass(group, cx, cz); buildHouseFeature(group, cx, cz); break;
    }

    scene.add(group);
    cellGroups[key] = group;
}

function rebuildAllCells() {
    for (var x = 0; x < WORLD_SIZE; x++) {
        for (var z = 0; z < WORLD_SIZE; z++) {
            buildCell(x, z);
        }
    }
    updateChimneyPositions();
}

function disposeGroup(group) {
    group.traverse(function(child) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(function(m) { m.dispose(); });
            } else {
                child.material.dispose();
            }
        }
    });
}

function makeBaseBox(color, roughness, y) {
    var geo = new THREE.BoxGeometry(0.94, 0.12, 0.94);
    var mat = new THREE.MeshStandardMaterial({ color: color, roughness: roughness, metalness: 0 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = y || 0.06;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function buildGrass(group, cx, cz) {
    var m = makeBaseBox(COLORS.grass, 0.8, 0.06);
    m.position.x = cx;
    m.position.z = cz;
    group.add(m);
}

function buildDirt(group, cx, cz) {
    var m = makeBaseBox(COLORS.dirt, 0.85, 0.07);
    m.position.x = cx;
    m.position.z = cz;
    group.add(m);
}

function buildWater(group, cx, cz) {
    var geo = new THREE.BoxGeometry(0.94, 0.08, 0.94);
    var mat = new THREE.MeshStandardMaterial({ color: COLORS.water, roughness: 0.2, metalness: 0.25 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cx, -0.1, cz);
    mesh.receiveShadow = true;
    group.add(mesh);
}

function buildStoneFeature(group, cx, cz) {
    var geo = new THREE.IcosahedronGeometry(0.28, 0);
    var mat = new THREE.MeshStandardMaterial({ color: COLORS.stone, roughness: 0.55, metalness: 0.05 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cx + (Math.random() - 0.5) * 0.15, 0.28, cz + (Math.random() - 0.5) * 0.15);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.4);
    group.add(mesh);

    if (Math.random() < 0.5) {
        var geo2 = new THREE.IcosahedronGeometry(0.18, 0);
        var mesh2 = new THREE.Mesh(geo2, mat);
        mesh2.position.set(cx + (Math.random() - 0.5) * 0.25, 0.15, cz + (Math.random() - 0.5) * 0.25);
        mesh2.castShadow = true;
        mesh2.receiveShadow = true;
        mesh2.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5);
        group.add(mesh2);
    }
}

function buildTreeFeature(group, cx, cz) {
    var trunkGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.4, 8);
    var trunkMat = new THREE.MeshStandardMaterial({ color: COLORS.trunk, roughness: 0.75 });
    var trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(cx, 0.32, cz);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    var leafGeo1 = new THREE.ConeGeometry(0.22, 0.45, 8);
    var leafMat = new THREE.MeshStandardMaterial({ color: COLORS.leaf, roughness: 0.65 });
    var leaves1 = new THREE.Mesh(leafGeo1, leafMat);
    leaves1.position.set(cx, 0.62, cz);
    leaves1.castShadow = true;
    leaves1.receiveShadow = true;
    group.add(leaves1);

    var leafGeo2 = new THREE.ConeGeometry(0.17, 0.35, 8);
    var leaves2 = new THREE.Mesh(leafGeo2, leafMat);
    leaves2.position.set(cx, 0.82, cz);
    leaves2.castShadow = true;
    leaves2.receiveShadow = true;
    group.add(leaves2);
}

function buildHouseFeature(group, cx, cz) {
    var bodyGeo = new THREE.BoxGeometry(0.52, 0.48, 0.52);
    var bodyMat = new THREE.MeshStandardMaterial({ color: COLORS.houseBody, roughness: 0.6 });
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(cx, 0.36, cz);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    var roofGeo = new THREE.ConeGeometry(0.40, 0.32, 4);
    var roofMat = new THREE.MeshStandardMaterial({ color: COLORS.houseRoof, roughness: 0.5 });
    var roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(cx, 0.72, cz);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);

    // 烟囱
    var chimneyGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.28, 8);
    var chimneyMat = new THREE.MeshStandardMaterial({ color: 0xcc8866, roughness: 0.6 });
    var chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimney.position.set(cx + 0.14, 0.78, cz + 0.14);
    chimney.castShadow = true;
    chimney.receiveShadow = true;
    group.add(chimney);
}

/* ================================================================
   云层与烟雾 (Clouds & Smoke)
   ================================================================ */

function initClouds() {
    var cloudCount = 4;
    for (var i = 0; i < cloudCount; i++) {
        var group = new THREE.Group();
        var blobCount = 5 + Math.floor(Math.random() * 7);
        for (var j = 0; j < blobCount; j++) {
            var size = 0.25 + Math.random() * 0.55;
            var geo = new THREE.SphereGeometry(size, 7, 5);
            var mat = new THREE.MeshStandardMaterial({ color: 0xfafaf9, roughness: 0.95, metalness: 0 });
            var blob = new THREE.Mesh(geo, mat);
            blob.position.set(
                (Math.random() - 0.5) * 1.6,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 1.2
            );
            blob.castShadow = true;
            blob.receiveShadow = false;
            group.add(blob);
        }

        var startX = Math.random() * 10 - 1;
        var startZ = i < 2 ? -2 : 9;
        var y = 6.5 + Math.random() * 2.5;
        group.position.set(startX, y, startZ);
        scene.add(group);

        // 云影
        var shadowGeo = new THREE.PlaneGeometry(2.2, 2.2);
        var shadowMat = new THREE.MeshBasicMaterial({
            color: 0x000000, transparent: true, opacity: 0.12,
            side: THREE.DoubleSide, depthWrite: false
        });
        var shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.set(startX, 0.14, startZ);
        shadowPlane.renderOrder = 1;
        shadowPlane.material.depthTest = true;
        shadowPlane.material.depthWrite = false;
        scene.add(shadowPlane);

        clouds.push({
            group: group,
            shadow: shadowPlane,
            speed: 0.08 + Math.random() * 0.22,
            dirX: Math.random() < 0.5 ? 1 : -1,
            dirZ: Math.random() * 0.3 - 0.15,
            y: y
        });
    }
}

function updateClouds(dt) {
    for (var i = 0; i < clouds.length; i++) {
        var c = clouds[i];
        c.group.position.x += c.speed * c.dirX * dt;
        c.group.position.z += c.speed * c.dirZ * dt;
        c.shadow.position.x = c.group.position.x;
        c.shadow.position.z = c.group.position.z;

        // 循环：飘出世界后从另一侧重新进入
        if (c.dirX > 0 && c.group.position.x > 10) { c.group.position.x = -2; c.shadow.position.x = -2; }
        if (c.dirX < 0 && c.group.position.x < -2) { c.group.position.x = 10; c.shadow.position.x = 10; }
        if (c.group.position.z > 10) { c.group.position.z = -2; c.shadow.position.z = -2; }
        if (c.group.position.z < -2) { c.group.position.z = 10; c.shadow.position.z = 10; }
    }
}

function updateChimneyPositions() {
    chimneyPositions = [];
    for (var x = 0; x < WORLD_SIZE; x++) {
        for (var z = 0; z < WORLD_SIZE; z++) {
            if (world[x][z].terrain === TERRAIN.HOUSE) {
                chimneyPositions.push({
                    x: x + 0.64,
                    y: 0.92,
                    z: z + 0.64
                });
            }
        }
    }
}

function spawnSmokeParticle(cx, cy, cz) {
    var size = 0.04 + Math.random() * 0.05;
    var geo = new THREE.SphereGeometry(size, 4, 4);
    var mat = new THREE.MeshBasicMaterial({
        color: 0xcccccc, transparent: true, opacity: 0.55,
        depthWrite: false
    });
    var particle = new THREE.Mesh(geo, mat);
    particle.position.set(cx, cy, cz);
    particle.renderOrder = 998;
    scene.add(particle);
    smokeParticles.push({
        mesh: particle,
        life: 0,
        maxLife: 1.2 + Math.random() * 1.4,
        speedY: 0.25 + Math.random() * 0.35,
        driftX: (Math.random() - 0.5) * 0.15,
        driftZ: (Math.random() - 0.5) * 0.15
    });
}

function updateSmoke(dt) {
    // 定时从烟囱产烟
    smokeTimer += dt;
    var interval = chimneyPositions.length > 0 ? 0.25 + Math.random() * 0.3 : 999;
    if (smokeTimer > interval && chimneyPositions.length > 0 && smokeParticles.length < 35) {
        smokeTimer = 0;
        var ci = Math.floor(Math.random() * chimneyPositions.length);
        var cp = chimneyPositions[ci];
        spawnSmokeParticle(cp.x, cp.y, cp.z);
    }

    // 更新现有粒子
    for (var i = smokeParticles.length - 1; i >= 0; i--) {
        var p = smokeParticles[i];
        p.life += dt;
        var progress = p.life / p.maxLife;
        p.mesh.position.y += p.speedY * dt;
        p.mesh.position.x += p.driftX * dt;
        p.mesh.position.z += p.driftZ * dt;
        p.mesh.material.opacity = 0.55 * (1 - progress);
        p.mesh.scale.setScalar(1 + progress * 1.8);

        if (p.life >= p.maxLife) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
            smokeParticles.splice(i, 1);
        }
    }
}

/* ================================================================
   交互 (Interaction)
   ================================================================ */

var isDragging = false;
var hasDragged = false;
var dragStartX = 0;
var dragStartY = 0;
var lastMouseX = 0;
var lastMouseY = 0;
var hoverCell = null;

function getIntersection(clientX, clientY) {
    var container = document.getElementById('canvas-container');
    var rect = container.getBoundingClientRect();
    var mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width)  * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObject(groundPlane);
    if (intersects.length > 0) {
        var p = intersects[0].point;
        var gx = Math.floor(p.x);
        var gz = Math.floor(p.z);
        if (inBounds(gx, gz)) {
            return { x: gx, z: gz };
        }
    }
    return null;
}

function updateHover(clientX, clientY) {
    var cell = getIntersection(clientX, clientY);
    if (cell && (!hoverCell || hoverCell.x !== cell.x || hoverCell.z !== cell.z)) {
        hoverCell = cell;
        hoverMesh.position.set(cell.x + 0.5, 0.07, cell.z + 0.5);
        hoverMesh.visible = true;
    } else if (!cell && hoverCell) {
        hoverCell = null;
        hoverMesh.visible = false;
    }
}

function handleClick(clientX, clientY) {
    var cell = getIntersection(clientX, clientY);
    if (cell) {
        setCell(cell.x, cell.z, currentTool);
    }
}

function initInteraction() {
    var canvas = renderer.domElement;

    canvas.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        isDragging = true;
        hasDragged = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    window.addEventListener('mousemove', function(e) {
        updateHover(e.clientX, e.clientY);

        if (!isDragging) return;
        var dx = e.clientX - lastMouseX;
        var dy = e.clientY - lastMouseY;
        if (Math.abs(e.clientX - dragStartX) > 2 || Math.abs(e.clientY - dragStartY) > 2) {
            hasDragged = true;
        }
        if (hasDragged) {
            cameraTheta -= dx * 0.008;
            cameraPhi   -= dy * 0.008;
            cameraPhi    = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, cameraPhi));
            updateCamera();
        }
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', function(e) {
        if (!isDragging) return;
        isDragging = false;
        if (!hasDragged && e.button === 0) {
            handleClick(e.clientX, e.clientY);
        }
    });

    canvas.addEventListener('wheel', function(e) {
        e.preventDefault();
        cameraRadius *= e.deltaY > 0 ? 1.08 : 0.93;
        cameraRadius = Math.max(5, Math.min(18, cameraRadius));
        updateCamera();
    }, { passive: false });

    // Touch support
    var touchStartDist = 0;
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            isDragging = true;
            hasDragged = false;
            dragStartX = e.touches[0].clientX;
            dragStartY = e.touches[0].clientY;
            lastMouseX = e.touches[0].clientX;
            lastMouseY = e.touches[0].clientY;
            updateHover(e.touches[0].clientX, e.touches[0].clientY);
        } else if (e.touches.length === 2) {
            isDragging = false;
            var dx = e.touches[0].clientX - e.touches[1].clientX;
            var dy = e.touches[0].clientY - e.touches[1].clientY;
            touchStartDist = Math.sqrt(dx * dx + dy * dy);
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
            var dx = e.touches[0].clientX - lastMouseX;
            var dy = e.touches[0].clientY - lastMouseY;
            if (Math.abs(e.touches[0].clientX - dragStartX) > 2 || Math.abs(e.touches[0].clientY - dragStartY) > 2) {
                hasDragged = true;
            }
            if (hasDragged) {
                cameraTheta -= dx * 0.008;
                cameraPhi   -= dy * 0.008;
                cameraPhi    = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, cameraPhi));
                updateCamera();
            }
            lastMouseX = e.touches[0].clientX;
            lastMouseY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            var dx2 = e.touches[0].clientX - e.touches[1].clientX;
            var dy2 = e.touches[0].clientY - e.touches[1].clientY;
            var dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            if (touchStartDist > 0) {
                cameraRadius *= touchStartDist / dist;
                cameraRadius = Math.max(5, Math.min(18, cameraRadius));
                updateCamera();
            }
            touchStartDist = dist;
        }
    }, { passive: false });

    canvas.addEventListener('touchend', function(e) {
        if (e.touches.length === 0) {
            if (!hasDragged && isDragging) {
                handleClick(lastMouseX, lastMouseY);
            }
            isDragging = false;
        }
    });
}

/* ================================================================
   持久化 (Persistence)
   ================================================================ */

function slotKey(slot) {
    return 'world3d_slot_' + (slot || currentSlot);
}

function save() {
    var data = [];
    for (var x = 0; x < WORLD_SIZE; x++) {
        data[x] = [];
        for (var z = 0; z < WORLD_SIZE; z++) {
            data[x][z] = { terrain: world[x][z].terrain, kind: world[x][z].kind };
        }
    }
    try {
        localStorage.setItem(slotKey(), JSON.stringify(data));
    } catch(e) {}
}

function load() {
    var raw;
    try { raw = localStorage.getItem(slotKey()); } catch(e) {}
    if (raw) {
        try {
            var data = JSON.parse(raw);
            for (var x = 0; x < WORLD_SIZE; x++) {
                for (var z = 0; z < WORLD_SIZE; z++) {
                    if (data[x] && data[x][z] !== undefined) {
                        world[x][z] = data[x][z];
                    } else {
                        world[x][z] = { terrain: TERRAIN.GRASS, kind: 'grass' };
                    }
                }
            }
            rebuildAllCells();
            updateMinimap();
            return true;
        } catch(e) {}
    }
    return false;
}

function switchSlot(slot) {
    if (slot === currentSlot) return;
    save();
    currentSlot = slot;
    clearAllSilent();
    if (!load()) {
        generateVillage();
    }
}

/* ================================================================
   小地图 (Minimap)
   ================================================================ */

var minimapColors = [
    '#7ec850', // grass
    '#c4a45a', // dirt
    '#4da6d9', // water
    '#9e9e9e', // stone
    '#3d8b37', // tree
    '#c75b39'  // house
];

function updateMinimap() {
    var canvas = document.getElementById('minimap');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var cs = canvas.width / WORLD_SIZE;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw terrain
    for (var x = 0; x < WORLD_SIZE; x++) {
        for (var z = 0; z < WORLD_SIZE; z++) {
            var t = world[x][z].terrain;
            var px = x * cs;
            var py = z * cs;
            ctx.fillStyle = minimapColors[t] || '#7ec850';
            ctx.fillRect(px, py, cs, cs);

            // Feature overlays
            if (t === TERRAIN.TREE) {
                ctx.fillStyle = '#2d6e2d';
                ctx.beginPath();
                ctx.arc(px + cs/2, py + cs/2, cs * 0.3, 0, Math.PI * 2);
                ctx.fill();
            } else if (t === TERRAIN.HOUSE) {
                ctx.fillStyle = '#b84a2d';
                ctx.fillRect(px + cs * 0.3, py + cs * 0.3, cs * 0.4, cs * 0.4);
                ctx.fillStyle = '#8b3a22';
                ctx.beginPath();
                ctx.moveTo(px + cs * 0.2, py + cs * 0.3);
                ctx.lineTo(px + cs * 0.5, py + cs * 0.1);
                ctx.lineTo(px + cs * 0.8, py + cs * 0.3);
                ctx.fill();
            } else if (t === TERRAIN.STONE) {
                ctx.fillStyle = '#707070';
                ctx.beginPath();
                ctx.arc(px + cs/2, py + cs/2, cs * 0.22, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= WORLD_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cs, 0);
        ctx.lineTo(i * cs, canvas.width);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cs);
        ctx.lineTo(canvas.width, i * cs);
        ctx.stroke();
    }
}

/* ================================================================
   程序化生成 (Procedural Generation)
   ================================================================ */

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
}

function generatePond() {
    var sx = randInt(1, 6), sz = randInt(1, 6);
    var cells = [[sx, sz]];
    var target = randInt(3, 6);
    while (cells.length < target) {
        var idx = randInt(0, cells.length - 1);
        var px = cells[idx][0], pz = cells[idx][1];
        var dirs = [[1,0], [-1,0], [0,1], [0,-1]];
        shuffle(dirs);
        var added = false;
        for (var d = 0; d < dirs.length; d++) {
            var nx = px + dirs[d][0], nz = pz + dirs[d][1];
            if (inBounds(nx, nz)) {
                var dup = false;
                for (var c = 0; c < cells.length; c++) {
                    if (cells[c][0] === nx && cells[c][1] === nz) { dup = true; break; }
                }
                if (!dup) { cells.push([nx, nz]); added = true; break; }
            }
        }
        if (!added) break;
    }
    return cells;
}

function drawPath(x1, z1, x2, z2) {
    var cx = x1, cz = z1;
    var horizFirst = Math.random() < 0.5;
    if (horizFirst) {
        while (cx !== x2) { cx += cx < x2 ? 1 : -1; if (world[cx][cz].terrain === TERRAIN.GRASS) setCellSilent(cx, cz, TERRAIN.DIRT); }
        while (cz !== z2) { cz += cz < z2 ? 1 : -1; if (world[cx][cz].terrain === TERRAIN.GRASS) setCellSilent(cx, cz, TERRAIN.DIRT); }
    } else {
        while (cz !== z2) { cz += cz < z2 ? 1 : -1; if (world[cx][cz].terrain === TERRAIN.GRASS) setCellSilent(cx, cz, TERRAIN.DIRT); }
        while (cx !== x2) { cx += cx < x2 ? 1 : -1; if (world[cx][cz].terrain === TERRAIN.GRASS) setCellSilent(cx, cz, TERRAIN.DIRT); }
    }
}

function generateVillage() {
    clearAllSilent();

    // 1. Water pond
    var pondCells = generatePond();
    for (var p = 0; p < pondCells.length; p++) {
        setCellSilent(pondCells[p][0], pondCells[p][1], TERRAIN.WATER);
    }

    // 2. Houses with separation
    var numHouses = randInt(3, 5);
    var housePos = [];
    for (var h = 0; h < numHouses; h++) {
        var hx, hz, tries = 0;
        do {
            hx = randInt(0, 7); hz = randInt(0, 7);
            tries++;
        } while (tries < 100 && (
            world[hx][hz].terrain === TERRAIN.WATER ||
            tooClose(hx, hz, housePos, 2)
        ));
        setCellSilent(hx, hz, TERRAIN.HOUSE);
        housePos.push([hx, hz]);
    }

    // 3. Stone clusters
    var numClusters = randInt(2, 3);
    for (var c = 0; c < numClusters; c++) {
        var scx = randInt(1, 6), scz = randInt(1, 6);
        var count = randInt(1, 3);
        for (var s = 0; s < count; s++) {
            var sx = scx + randInt(-1, 1), sz = scz + randInt(-1, 1);
            if (inBounds(sx, sz) && world[sx][sz].terrain === TERRAIN.GRASS) {
                setCellSilent(sx, sz, TERRAIN.STONE);
            }
        }
    }

    // 4. Trees
    var numTrees = randInt(8, 15);
    for (var t = 0; t < numTrees; t++) {
        var tx = randInt(0, 7), tz = randInt(0, 7);
        if (world[tx][tz].terrain === TERRAIN.GRASS) {
            setCellSilent(tx, tz, TERRAIN.TREE);
        }
    }

    // 5. Paths: connect houses in chain, then to pond
    for (var i = 0; i < housePos.length - 1; i++) {
        drawPath(housePos[i][0], housePos[i][1], housePos[i+1][0], housePos[i+1][1]);
    }
    if (housePos.length > 0) {
        var lastH = housePos[housePos.length - 1];
        var nearestPond = pondCells[0];
        var minDist = Infinity;
        for (var p2 = 0; p2 < pondCells.length; p2++) {
            var d = Math.abs(lastH[0] - pondCells[p2][0]) + Math.abs(lastH[1] - pondCells[p2][1]);
            if (d < minDist) { minDist = d; nearestPond = pondCells[p2]; }
        }
        drawPath(lastH[0], lastH[1], nearestPond[0], nearestPond[1]);
    }

    rebuildAllCells();
    updateMinimap();
    save();
}

function tooClose(x, z, positions, minDist) {
    for (var i = 0; i < positions.length; i++) {
        if (Math.abs(x - positions[i][0]) + Math.abs(z - positions[i][1]) < minDist) return true;
    }
    return false;
}

/* ================================================================
   UI 绑定 (UI Bindings)
   ================================================================ */

function buildToolbar() {
    var toolbar = document.getElementById('toolbar');
    if (!toolbar) return;
    toolbar.innerHTML = '';

    for (var i = 0; i <= TERRAIN.HOUSE + 1; i++) {
        var card = document.createElement('div');
        card.className = 'tool-card';
        if (i === TERRAIN.GRASS) card.classList.add('active');

        var emoji = document.createElement('span');
        emoji.className = 'tool-emoji';
        emoji.textContent = TERRAIN_EMOJIS[i];

        var label = document.createElement('span');
        label.className = 'tool-label';
        label.textContent = TERRAIN_LABELS[i];

        card.appendChild(emoji);
        card.appendChild(label);

        // Eraser is the last entry (index = HOUSE + 1)
        if (i > TERRAIN.HOUSE) {
            card.dataset.tool = 'eraser';
        } else {
            card.dataset.tool = i;
        }

        card.addEventListener('click', (function(toolIndex) {
            return function() {
                if (toolIndex > TERRAIN.HOUSE) {
                    currentTool = TERRAIN.GRASS; // eraser = grass
                } else {
                    currentTool = toolIndex;
                }
                document.querySelectorAll('.tool-card').forEach(function(c) { c.classList.remove('active'); });
                card.classList.add('active');
            };
        })(i));

        toolbar.appendChild(card);
    }
}

function initUI() {
    buildToolbar();

    document.getElementById('btn-reset').addEventListener('click', function() {
        generateVillage();
    });

    document.getElementById('btn-clear').addEventListener('click', function() {
        clearAll();
    });

    var slotSelect = document.getElementById('save-slot');
    if (slotSelect) {
        slotSelect.value = currentSlot;
        slotSelect.addEventListener('change', function() {
            switchSlot(parseInt(this.value));
        });
    }

    // Keyboard shortcuts
    window.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'SELECT') return;
        var num = parseInt(e.key);
        if (num >= 1 && num <= 7) {
            e.preventDefault();
            if (num === 7) {
                currentTool = TERRAIN.GRASS; // eraser
            } else {
                currentTool = num - 1;
            }
            var cards = document.querySelectorAll('.tool-card');
            cards.forEach(function(c) { c.classList.remove('active'); });
            if (cards[num - 1]) cards[num - 1].classList.add('active');
        }
        if (e.key === 'r' || e.key === 'R') {
            generateVillage();
        }
        if (e.key === 'c' || e.key === 'C') {
            clearAll();
        }
    });
}

/* ================================================================
   启动 (Startup)
   ================================================================ */

function showTutorial() {
    var el = document.getElementById('tutorial');
    if (!el) return;
    el.classList.add('show');
    setTimeout(function() {
        el.classList.add('fade-out');
        setTimeout(function() {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 800);
    }, 4000);
}

function animate(ts) {
    requestAnimationFrame(animate);
    var dt = lastTime ? Math.min((ts - lastTime) / 1000, 0.1) : 0.016;
    lastTime = ts;
    updateClouds(dt);
    updateSmoke(dt);
    renderer.render(scene, camera);
}

function start() {
    initScene();
    initLighting();
    initWorld();
    initClouds();
    initInteraction();
    initUI();

    if (!load()) {
        generateVillage();
    }

    var tutorialSeen;
    try { tutorialSeen = localStorage.getItem('world3d_tutorial_seen'); } catch(e) {}
    if (!tutorialSeen) {
        showTutorial();
        try { localStorage.setItem('world3d_tutorial_seen', '1'); } catch(e) {}
    }

    animate();
}

start();

})();
