import './main.css';
import { Clock, Scene, LoadingManager, WebGLRenderer, sRGBEncoding, Group, PerspectiveCamera, DirectionalLight, PointLight } from 'three';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const looadingCover = document.getElementById("loading-text-intro");
const mainContainer = document.querySelector('.main-container');
const container = document.getElementById('canvas-container');
const containerDetails = document.getElementById('canvas-container-details');
const customCursor = document.querySelector('.cursor');
const navButtons = document.querySelectorAll('nav > .a');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progressContainer = document.getElementById('progress-container');

const cursor = { x: 0, y: 0 };
const clock = new Clock();
let previousTime = 0;

const scene = new Scene();

const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.autoClear = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
renderer.outputEncoding = sRGBEncoding;
container.appendChild(renderer.domElement);

const renderer2 = new WebGLRenderer({ antialias: true, alpha: true });
renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1));
renderer2.outputEncoding = sRGBEncoding;
containerDetails.appendChild(renderer2.domElement);

const cameraGroup = new Group();
scene.add(cameraGroup);

const camera = new PerspectiveCamera(35, container.clientWidth / container.clientHeight, 1, 100);
camera.position.set(19, 1.54, -0.1);
cameraGroup.add(camera);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const glitchPass = new GlitchPass();
glitchPass.enabled = false; 
composer.addPass(glitchPass);

const camera2 = new PerspectiveCamera(35, containerDetails.clientWidth / containerDetails.clientHeight, 1, 100);
camera2.position.set(-0.08, 4.35, 10);
camera2.rotation.set(-0.26, 0.21, -0.1);
scene.add(camera2);

const composer2 = new EffectComposer(renderer2);
const renderPass2 = new RenderPass(scene, camera2);
composer2.addPass(renderPass2);

const glitchPass2 = new GlitchPass();
glitchPass2.enabled = false; 
composer2.addPass(glitchPass2);

const sunLight = new DirectionalLight(0xE8A265, 0.15);
scene.add(sunLight);
const fillLight = new PointLight(0xFFDAB9, 2.7, 4, 3);
fillLight.position.set(30, 3, 1.8);
scene.add(fillLight);

const loadingManager = new LoadingManager();
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath('./draco/gltf/');
const loader = new GLTFLoader(loadingManager);
loader.setDRACOLoader(dracoLoader);
loader.setMeshoptDecoder(MeshoptDecoder);

loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const progressRatio = itemsLoaded / itemsTotal;
    const percent = Math.floor(progressRatio * 100);
    progressBar.style.width = percent + '%';
    progressText.innerText = percent + '%';
};

const mainTitle = document.querySelector('.first > h1');
// <<< ALTERAÇÃO: Lógica do glitch no hover
mainTitle.addEventListener('mouseenter', () => {
    glitchPass.enabled = true; // Ativa o glitch de forma sutil
    setTimeout(() => {
        glitchPass.enabled = false; // Desativa após um tempo
    }, 400); // Duração do efeito em milissegundos
});

loadingManager.onLoad = function () {
    setTimeout(() => {
        mainContainer.style.visibility = 'visible';
        document.body.style.overflow = 'auto';
        looadingCover.style.opacity = '0';
        progressContainer.style.opacity = '0';

        setTimeout(() => {
            if (looadingCover.parentNode) looadingCover.parentNode.removeChild(looadingCover);
            if (progressContainer.parentNode) progressContainer.parentNode.removeChild(progressContainer);
        }, 1000);

        introAnimation();
        window.scrollTo(0, 0);
    }, 500);
};

loader.load('./models/gltf/2a.glb', function (gltf) {
    gltf.scene.position.set(-1.48, 0.66, 1.5);
    gltf.scene.rotation.y = 0;
    gltf.scene.scale.set(3.58, 3.58, 3.58);
    scene.add(gltf.scene);
});

const cameraEndPositions = {
    desktop: { x: 0, y: 2.4, z: 8.8 },
    mobile: { x: 0, y: 2.4, z: 17.0 }
};

function introAnimation() {
    const isMobile = window.innerWidth <= 768;
    const targetPosition = isMobile ? cameraEndPositions.mobile : cameraEndPositions.desktop;

    new TWEEN.Tween(camera.position)
        .to(targetPosition, 3500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
        .onComplete(() => {
            document.querySelector('.header').classList.add('ended');
            document.querySelector('.first>p').classList.add('ended');
        });
}

function animateCamera(position, rotation) {
    new TWEEN.Tween(camera2.position).to(position, 1800).easing(TWEEN.Easing.Quadratic.InOut).start();
    new TWEEN.Tween(camera2.rotation).to(rotation, 1800).easing(TWEEN.Easing.Quadratic.InOut).start();
}

let secondContainerActive = false;

function rendeLoop() {
    TWEEN.update();
    composer.render();

    const isMobile = window.innerWidth <= 768;
    if (secondContainerActive && !isMobile) {
        composer2.render();
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

window.addEventListener('resize', debounce(() => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;

    renderer.setSize(newWidth, newHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    composer.setSize(newWidth, newHeight);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    const detailsWidth = containerDetails.clientWidth;
    const detailsHeight = containerDetails.clientHeight;
    renderer2.setSize(detailsWidth, detailsHeight);
    renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    composer2.setSize(detailsWidth, detailsHeight);
    composer2.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    camera2.aspect = detailsWidth / detailsHeight;
    camera2.updateProjectionMatrix();
}, 250));

document.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / window.innerWidth - 0.5;
    cursor.y = event.clientY / window.innerHeight - 0.5;
    customCursor.style.left = `${event.clientX}px`;
    customCursor.style.top = `${event.clientY}px`;

    const targetElement = event.target;
    if (window.getComputedStyle(targetElement).cursor === 'pointer') {
        customCursor.classList.add('cursor-dissolve-subtle');
    } else {
        customCursor.classList.remove('cursor-dissolve-subtle');
    }
}, { passive: true });

navButtons.forEach(b => {
    b.addEventListener('mousemove', (e) => {
        const span = b.querySelector('span');
        const { offsetX: x, offsetY: y } = e, { offsetWidth: w, offsetHeight: h } = b;
        const walk = 20, xWalk = (x / w) * (walk * 2) - walk, yWalk = (y / h) * (walk * 2) - walk;
        span.style.cssText = `transform: translate(${xWalk}px, ${yWalk}px);`;
    });
    b.addEventListener('mouseleave', () => {
        b.querySelector('span').style.cssText = '';
    });
});

const sobreContent = {
    filme: `Em um futuro distópico, dois irmãos separados no nascimento vivem em hemisférios opostos: um em meio ao luxo tecnológico do Norte, o outro entre a exploração e o subemprego do Sul. Seus caminhos colidem quando a inteligência artificial criada por um deles ameaça toda a humanidade. A história faz uma crítica social contundente à Divisão Internacional do Trabalho e à ética do uso tecnológico, convidando o público a refletir sobre o papel da humanidade em meio à ascensão da IA.`,
    personagens: `Akin, que mais tarde adota o nome Zheny, é fruto do Hemisfério Norte — um mundo envolto em tecnologia, controle e aparente perfeição. Desde pequeno, demonstrou genialidade incomum, sendo tratado como uma promessa da ciência. Cresceu distante da dor e da escassez, mas profundamente marcado pela ausência e pela saudade do pai. Essa carência o levou a buscar na tecnologia um meio de reviver o passado, criando uma inteligência artificial baseada nas memórias paternas. Akin é racional, metódico e ambicioso, mas também carrega uma solidão disfarçada de superioridade. Seu mergulho na ciência o afastou da empatia, fazendo dele uma peça fundamental no colapso entre os mundos. No fundo, é um personagem em constante conflito entre o que sabe e o que sente, entre o criador e a criatura.`,
    cenarios: `Anakin nasceu e cresceu no Hemisfério Sul, em meio ao pó da mineração e às dores da sobrevivência. Criado por sua mãe, Hazel, aprendeu desde cedo o valor da luta, da família e da esperança. É um jovem sensível, de fala direta e olhar sincero, que carrega no peito as marcas da desigualdade social. Após perder a mãe em um acidente de trabalho, sua vida muda completamente — a dor da perda se transforma em força, e a revolta em liderança. Diferente do irmão, Anakin não busca controlar o mundo, mas compreendê-lo. Sua jornada é movida por amor e justiça, mesmo em um mundo que insiste em negar ambos. Ele representa o humano em sua forma mais crua e verdadeira: falho, mas cheio de fé no que ainda pode ser.`
};
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
document.getElementById('filme').addEventListener('click', () => {
    document.getElementById('filme').classList.add('active');
    document.getElementById('personagens').classList.remove('active');
    document.getElementById('cenarios').classList.remove('active');
    sobreParagraph.innerHTML = sobreContent.filme;
    animateCamera({ x: -0.08, y: 4.35, z: 10 }, { x: -0.26, y: 0.21, z: -0.1 });
});
document.getElementById('personagens').addEventListener('click', () => {
    document.getElementById('personagens').classList.add('active');
    document.getElementById('filme').classList.remove('active');
    document.getElementById('cenarios').classList.remove('active');
    sobreParagraph.innerHTML = sobreContent.personagens;
    animateCamera({ x: -3.77, y: 4.1, z: 4.84 }, { x: -0.26, y: -0.26, z: -0.02 });
});
document.getElementById('cenarios').addEventListener('click', () => {
    document.getElementById('cenarios').classList.add('active');
    document.getElementById('filme').classList.remove('active');
    document.getElementById('personagens').classList.remove('active');
    sobreParagraph.innerHTML = sobreContent.cenarios;
    animateCamera({ x: 5.33, y: 3.36, z: 2.63 }, { x: -0.1, y: 1.44, z: -0.1 });
});

const watchedSection = document.querySelector('.second');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        secondContainerActive = entry.isIntersecting;
        if (entry.isIntersecting) {
            containerDetails.classList.add('visible');
        } else {
            containerDetails.classList.remove('visible');
        }
    });
}, {
    threshold: 0.1
});
observer.observe(watchedSection);

const assistSection = document.querySelector('.section-assistir');
const assistObserver = new IntersectionObserver((entries) => {
}, { threshold: 0.1 });
assistObserver.observe(assistSection);

const playerSection = document.querySelector('.section-assistir');
let playerInitialized = false;

const playerObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !playerInitialized) {
            playerInitialized = true;

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.src = 'https://cdn.plyr.io/3.7.8/plyr.polyfilled.js';
            document.body.appendChild(script);

            script.onload = () => {
                const player = new Plyr('#player');
            };

            observer.unobserve(playerSection);
        }
    });
}, { rootMargin: '200px' });

playerObserver.observe(playerSection);

window.dispatchEvent(new Event('resize'));

rendeLoop();