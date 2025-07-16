import './main.css';
import { Clock, Scene, LoadingManager, WebGLRenderer, sRGBEncoding, Group, PerspectiveCamera, DirectionalLight, PointLight } from 'three';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';


const looadingCover = document.getElementById("loading-text-intro");
const mainContainer = document.querySelector('.main-container');
const container = document.getElementById('canvas-container');
const containerDetails = document.getElementById('canvas-container-details'); // Container para o segundo renderer
const customCursor = document.querySelector('.cursor');
const navButtons = document.querySelectorAll('nav > .a');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progressContainer = document.getElementById('progress-container');

let width = container.clientWidth;
let height = container.clientHeight;
let previousTime = 0;
const cursor = { x: 0, y: 0 };
const clock = new Clock();

const scene = new Scene();

// RENDERER PRINCIPAL
const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.autoClear = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
renderer.setSize(width, height);
renderer.outputEncoding = sRGBEncoding;
container.appendChild(renderer.domElement);

// SEGUNDO RENDERER (PARA A SEÇÃO 'SOBRE')
const renderer2 = new WebGLRenderer({ antialias: true, alpha: true });
renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1));
renderer2.setSize(containerDetails.clientWidth, containerDetails.clientHeight);
renderer2.outputEncoding = sRGBEncoding;
containerDetails.appendChild(renderer2.domElement);

// CÂMERAS
const cameraGroup = new Group();
scene.add(cameraGroup);

const camera = new PerspectiveCamera(35, width / height, 1, 100);
camera.position.set(19, 1.54, -0.1);
cameraGroup.add(camera);

const camera2 = new PerspectiveCamera(35, containerDetails.clientWidth / containerDetails.clientHeight, 1, 100);
// Posição inicial da câmera de detalhes (apontando para o primeiro "personagem" ou ponto de interesse)
camera2.position.set(1.9, 2.7, 2.7);
camera2.rotation.set(0, 1.1, 0);
scene.add(camera2);

const gui = new lil.GUI();


const sunLight = new DirectionalLight(0x435c72, 0.08);
scene.add(sunLight);
const fillLight = new PointLight(0x88b2d9, 2.7, 4, 3);
fillLight.position.set(30, 3, 1.8);
scene.add(fillLight);

const loadingManager = new LoadingManager();
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/gltf/');
const loader = new GLTFLoader(loadingManager);
loader.setDRACOLoader(dracoLoader);
loader.setMeshoptDecoder(MeshoptDecoder);

loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
  const progressRatio = itemsLoaded / itemsTotal;
  const percent = Math.floor(progressRatio * 100);
  progressBar.style.width = percent + '%';
  progressText.innerText = percent + '%';
};

loadingManager.onLoad = function() {
    setTimeout(() => {
        mainContainer.style.visibility = 'visible';
        document.body.style.overflow = 'auto';

        looadingCover.style.opacity = '0';
        looadingCover.style.transition = 'opacity 1s ease';
        progressContainer.style.opacity = '0';
        progressContainer.style.transition = 'opacity 1s ease';

        setTimeout(() => {
            if(looadingCover.parentNode) looadingCover.parentNode.removeChild(looadingCover);
            if(progressContainer.parentNode) progressContainer.parentNode.removeChild(progressContainer);
        }, 1000);

        introAnimation();
        window.scrollTo(0, 0);
    }, 500);
};

// Carregue seu modelo 3D
loader.load('./models/gltf/2a.glb', function (gltf) {
    gltf.scene.position.set(-1.48, 0.66, 1.5);
    gltf.scene.rotation.y = 0;
    gltf.scene.scale.set(3.58, 3.58, 3.58);
    scene.add(gltf.scene);
});

function introAnimation() {
    new TWEEN.Tween(camera.position).to({ x: 0, y: 2.4, z: 8.8 }, 3500).easing(TWEEN.Easing.Quadratic.InOut).start()
    .onComplete(function () {
        TWEEN.remove(this);
        document.querySelector('.header').classList.add('ended');
        document.querySelector('.first>p').classList.add('ended');
    });
}

// Função para animar a câmera de detalhes
function animateCamera(position, rotation) {
    new TWEEN.Tween(camera2.position).to(position, 1800).easing(TWEEN.Easing.Quadratic.InOut).start()
    .onComplete(function () { TWEEN.remove(this); });
    new TWEEN.Tween(camera2.rotation).to(rotation, 1800).easing(TWEEN.Easing.Quadratic.InOut).start()
    .onComplete(function () { TWEEN.remove(this); });
}

let secondContainerActive = false; // Flag para controlar qual renderer usar

function rendeLoop() {
    TWEEN.update();
    
    // Decide qual renderer/câmera usar
    if (secondContainerActive) {
        renderer2.render(scene, camera2);
    } else {
        renderer.render(scene, camera);
    }

    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    const parallaxY = cursor.y;
    fillLight.position.y -= (parallaxY * 9 + fillLight.position.y - 2) * deltaTime;
    const parallaxX = cursor.x;
    fillLight.position.x += (parallaxX * 8 - fillLight.position.x) * 2 * deltaTime;

    cameraGroup.position.z -= (parallaxY / 3 + cameraGroup.position.z) * 2 * deltaTime;
    cameraGroup.position.x += (parallaxX / 3 - cameraGroup.position.x) * 2 * deltaTime;

    requestAnimationFrame(rendeLoop);
}

function handleCursor(e) {
    customCursor.style.cssText = `left: ${e.clientX}px; top: ${e.clientY}px;`;
}

function handleNavButtonHover(e) {
    const span = this.querySelector('span');
    if(e.type === 'mouseleave') {
        span.style.cssText = '';
    } else {
        const { offsetX: x, offsetY: y } = e, { offsetWidth: width, offsetHeight: height } = this,
        walk = 20, xWalk = (x / width) * (walk * 2) - walk, yWalk = (y / height) * (walk * 2) - walk;
        span.style.cssText = `transform: translate(${xWalk}px, ${yWalk}px);`;
    }
}

rendeLoop();

document.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / window.innerWidth - 0.5;
    cursor.y = event.clientY / window.innerHeight - 0.5;
    handleCursor(event);
}, false);

navButtons.forEach(b => {
    b.addEventListener('mousemove', handleNavButtonHover);
    b.addEventListener('mouseleave', handleNavButtonHover);
});

window.addEventListener('resize', () => {
    width = container.clientWidth;
    height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    
    // Atualiza o segundo renderer também
    camera2.aspect = containerDetails.clientWidth / containerDetails.clientHeight;
    camera2.updateProjectionMatrix();
    renderer2.setSize(containerDetails.clientWidth, containerDetails.clientHeight);
    renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1));
});

const sobreContent = {
    filme: `Em um futuro distópico, dois irmãos separados no nascimento vivem em hemisférios opostos...`,
    personagens: `Akin, mais tarde chamado de Zheny, é um jovem do Hemisfério Norte...`,
    cenarios: `Os cenários de “2A - Entre os Mundos” são, por si só, personagens silenciosos...`
};

const sobreTabs = document.querySelectorAll('.second-container > ul > li');
const sobreParagraph = document.getElementById('sobre-conteudo');
const navLinks = document.querySelectorAll('nav.header .a');

navLinks.forEach(anchor => {
    if (anchor.getAttribute('href')?.startsWith('#')) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                navLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    }
});

// Lógica de clique nas abas da seção "Sobre"
document.getElementById('filme').addEventListener('click', () => {
    document.getElementById('filme').classList.add('active');
    document.getElementById('personagens').classList.remove('active');
    document.getElementById('cenarios').classList.remove('active');
    sobreParagraph.innerHTML = sobreContent.filme;
    // Posição de câmera para "Sobre o Filme" (visão geral)
    animateCamera({ x: 6.56, y: 3.12, z: 3.85 }, { y: 1.29 });
});

document.getElementById('personagens').addEventListener('click', () => {
    document.getElementById('personagens').classList.add('active');
    document.getElementById('filme').classList.remove('active');
    document.getElementById('cenarios').classList.remove('active');
    sobreParagraph.innerHTML = sobreContent.personagens;
    // Posição de câmera para "Personagens" (um close-up diferente)
    animateCamera({ x: -3.77, y: 4.1, z: 4.84 }, { y: -0.26 });
});

document.getElementById('cenarios').addEventListener('click', () => {
    document.getElementById('cenarios').classList.add('active');
    document.getElementById('filme').classList.remove('active');
    document.getElementById('personagens').classList.remove('active');
    sobreParagraph.innerHTML = sobreContent.cenarios;
    // Posição de câmera para "Cenários" (outro ângulo)
    animateCamera({ x: -0.08, y: 4.35, z: 10 }, { y: 0.21 });
});


// Intersection Observer para ativar/desativar o segundo renderer
const watchedSection = document.querySelector('.second');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        secondContainerActive = entry.isIntersecting;
    });
}, { threshold: 0.05 }); // Ativa quando 5% da seção está visível

observer.observe(watchedSection);


const player = new Plyr('#player');