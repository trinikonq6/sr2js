const space = document.getElementById('space');
const ranger = document.getElementById('ranger');
const targetLine = document.getElementById('target-line');
const turnBtn = document.getElementById('turn-btn');
const scoreEl = document.getElementById('score');
const modalCloseBtn = document.getElementById('modal-close-btn');

let score = 0;
let rangerPos = { x: window.innerWidth * 0.3, y: window.innerHeight * 0.3 };
let targetPos = null;
const speed = 90;
const objects = [
    { id: 'p1', name: 'Земля', type: 'planet', orbit: 140, speed: 0.03, angle: 0, size: 40, sprite: 'earth.png' },
    { id: 'p2', name: 'Марс', type: 'planet', orbit: 240, speed: 0.015, angle: 1.5, size: 32, sprite: 'mars.avif' },
    { id: 'mc', name: 'Мед. Центр', type: 'station', orbit: 190, speed: -0.02, angle: 3, size: 36, sprite: 'Medical.webp' },
    { id: 'nc', name: 'Науч. Центр', type: 'station', orbit: 300, speed: 0.01, angle: 4.5, size: 38, sprite: 'Sb.webp' },
    { id: 'rc', name: 'РЦ Мутёнок', type: 'station', orbit: 360, speed: -0.008, angle: 2, size: 42, sprite: 'Rangers.webp' }
];
let minerals = [];

const mineralSprites = ['mineral.png'];

function initUniverse() {
    objects.forEach(obj => {
        const el = document.createElement('div');
        el.id = obj.id;
        el.className = `space-object ${obj.type}`;
        el.style.width = `${obj.size}px`;
        el.style.height = `${obj.size}px`;

        const img = document.createElement('img');
        img.src = obj.sprite;
        img.className = 'sprite-img';
        el.appendChild(img);
        const label = document.createElement('div');
        label.className = 'label';
        label.innerText = obj.name;
        el.appendChild(label);
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            setTarget(obj.currentX, obj.currentY);
        });

        space.appendChild(el);
    });

    for (let i = 0; i < 5; i++) spawnMineral();
    updatePositions();
}

function updatePositions() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    objects.forEach(obj => {
        obj.angle += obj.speed;
        obj.currentX = centerX + Math.cos(obj.angle) * obj.orbit;
        obj.currentY = centerY + Math.sin(obj.angle) * obj.orbit;

        const el = document.getElementById(obj.id);
        el.style.left = `${obj.currentX}px`;
        el.style.top = `${obj.currentY}px`;
    });
}

function spawnMineral() {
    const m = document.createElement('div');
    m.className = 'mineral';
    const img = document.createElement('img');
    const randomSprite = mineralSprites[Math.floor(Math.random() * mineralSprites.length)];
    img.src = randomSprite;
    img.className = 'sprite-img';
    m.appendChild(img);

    const x = Math.random() * (window.innerWidth - 100) + 50;
    const y = Math.random() * (window.innerHeight - 100) + 50;
    m.style.left = `${x}px`;
    m.style.top = `${y}px`;
    space.appendChild(m);
    minerals.push({ element: m, x: x, y: y });
}

space.addEventListener('click', (e) => {
    setTarget(e.clientX, e.clientY);
});

function setTarget(x, y) {
    targetPos = { x: x, y: y };
    drawTargetLine();
}

function drawTargetLine() {
    if (!targetPos) return;
    const dx = targetPos.x - rangerPos.x;
    const dy = targetPos.y - rangerPos.y;
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    targetLine.style.left = `${rangerPos.x}px`;
    targetLine.style.top = `${rangerPos.y}px`;
    targetLine.style.width = `${distance}px`;
    targetLine.style.transform = `rotate(${angle}deg)`;
    targetLine.style.display = 'block';
}

function makeTurn() {
    updatePositions();

    if (targetPos) {
        const dx = targetPos.x - rangerPos.x;
        const dy = targetPos.y - rangerPos.y;
        const distance = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        if (distance <= speed) {
            rangerPos = { x: targetPos.x, y: targetPos.y };
            targetPos = null;
            targetLine.style.display = 'none';
        } else {
            rangerPos.x += Math.cos(angle) * speed;
            rangerPos.y += Math.sin(angle) * speed;
            drawTargetLine();
        }
        ranger.style.transform = `translate(-50%, -50%) rotate(${angle * (180 / Math.PI) + 90}deg)`;
    }

    ranger.style.left = `${rangerPos.x}px`;
    ranger.style.top = `${rangerPos.y}px`;

    minerals = minerals.filter(m => {
        const dist = Math.hypot(m.x - rangerPos.x, m.y - rangerPos.y);
        if (dist < 35) {
            m.element.remove();
            score++;
            scoreEl.innerText = score;
            spawnMineral();
            return false;
        }
        return true;
    });
    objects.forEach(obj => {
        const dist = Math.hypot(obj.currentX - rangerPos.x, obj.currentY - rangerPos.y);
        if (dist < (obj.size / 2 + 15)) {
            showModal();
        }
    });
}

function showModal() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('modal').style.display = 'none';
}

turnBtn.addEventListener('click', makeTurn);
modalCloseBtn.addEventListener('click', closeModal);
window.addEventListener('keydown', (e) => { if (e.key === ' ') makeTurn(); });

initUniverse();
