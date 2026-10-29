const disk = document.getElementById('disk');
const degOut = document.getElementById('deg-out');
const authBtn = document.getElementById('authBtn');

const D24 = ["子","癸","丑","艮","寅","甲","卯","乙","辰","巽","巳","丙","午","丁","未","坤","申","庚","酉","辛","戌","乾","亥","壬"];
const D8_DIR = ["北","东北","东","东南","南","西南","西","西北"];
const D8_GUA = ["坎","艮","震","巽","离","坤","兑","乾"];
const D8_SYM = ["☵","☶","☳","☴","☲","☷","☱","☰"];

function build() {
    disk.querySelectorAll('.item, .guide-ring').forEach(el => el.remove());
    const R = disk.offsetWidth / 2;
    const frag = document.createDocumentFragment();

    [0.98, 0.82, 0.68, 0.52, 0.24].forEach(ratio => {
        const ring = document.createElement('div');
        ring.className = 'guide-ring';
        ring.style.width = ring.style.height = `${R * 2 * ratio}px`;
        frag.appendChild(ring);
    });

    for (let i = 0; i < 360; i += 2) {
        const isM = i % 10 === 0;
        const t = document.createElement('div');
        t.className = `item ${isM ? 'tick-m' : 'tick'}`;
        t.style.transform = `translate(-50%, -50%) rotate(${i}deg) translateY(-${R * 0.98}px)`;
        frag.appendChild(t);
        if (i % 10 === 0) {
            const d = document.createElement('div');
            d.className = 'item label-deg';
            d.textContent = i;
            d.dataset.deg = i;
            d.style.transform = `translate(-50%, -50%) rotate(${i}deg) translateY(-${R * 0.90}px) rotate(180deg)`;
            frag.appendChild(d);
        }
    }

    D24.forEach((n, i) => {
        const el = document.createElement('div');
        el.className = 'item label-24 ring-24';
        el.textContent = n;
        el.dataset.deg = i * 15;
        el.style.transform = `translate(-50%, -50%) rotate(${i*15}deg) translateY(-${R * 0.75}px) rotate(180deg)`;
        frag.appendChild(el);
    });

    D8_DIR.forEach((n, i) => {
        const el = document.createElement('div');
        el.className = 'item label-8 ring-8';
        el.textContent = n;
        el.dataset.deg = i * 45;
        el.style.transform = `translate(-50%, -50%) rotate(${i*45}deg) translateY(-${R * 0.60}px) rotate(180deg)`;
        frag.appendChild(el);
    });

    D8_GUA.forEach((n, i) => {
        const el = document.createElement('div');
        el.className = 'item label-bgua-txt ring-gua';
        el.textContent = n;
        el.dataset.deg = i * 45;
        el.style.transform = `translate(-50%, -50%) rotate(${i*45}deg) translateY(-${R * 0.45}px) rotate(180deg)`;
        frag.appendChild(el);
    });

    D8_SYM.forEach((n, i) => {
        const el = document.createElement('div');
        el.className = 'item label-bgua-sym ring-sym';
        el.textContent = n;
        el.dataset.deg = i * 45;
        el.style.transform = `translate(-50%, -50%) rotate(${i*45}deg) translateY(-${R * 0.31}px) rotate(180deg)`;
        frag.appendChild(el);
    });

    disk.appendChild(frag);
}

let curH = 0;
function update(h) {
    if(isNaN(h)) return;
    curH = (h < 0 ? h + 360 : h) % 360;
    disk.style.transform = `rotate(${-curH}deg)`;
    degOut.textContent = `${Math.round(curH)}°`;

    const items = disk.querySelectorAll('.item');
    items.forEach(item => {
        const itemDeg = parseFloat(item.dataset.deg);
        if(!isNaN(itemDeg)) {
            let diff = Math.abs(curH - itemDeg);
            if(diff > 180) diff = 360 - diff;
            const threshold = item.classList.contains('label-24') ? 7.5 : 22.5;
            if(diff < threshold) item.classList.add('active');
            else item.classList.remove('active');
        }
    });
}

const startCompass = () => {
    window.addEventListener('deviceorientation', e => {
        const h = e.webkitCompassHeading || (e.alpha !== null ? 360 - e.alpha : 0);
        update(h);
        authBtn.classList.add('working');
    }, true);
};

if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
    authBtn.onclick = () => {
        DeviceOrientationEvent.requestPermission().then(s => {
            if(s==='granted'){ 
                startCompass();
            }
        });
    };
} else {
    startCompass();
}

let isT = false, lx = 0;
document.getElementById('touch-zone').addEventListener('touchstart', e => { isT = true; lx = e.touches[0].clientX; });
window.addEventListener('touchmove', e => {
    if(!isT) return;
    const dx = (lx - e.touches[0].clientX) * 0.3;
    update(curH + dx);
    lx = e.touches[0].clientX;
}, {passive:false});
window.addEventListener('touchend', () => isT = false);
window.addEventListener('resize', () => { setTimeout(build, 200); });
build();
