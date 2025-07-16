import './main.css'
import { Clock, Scene, LoadingManager, WebGLRenderer, sRGBEncoding, Group, PerspectiveCamera, DirectionalLight, PointLight } from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'meshoptimizer';

const looadingCover = document.getElementById("loading-text-intro")
const container = document.getElementById('canvas-container')
const customCursor = document.querySelector('.cursor')
const navButtons = document.querySelectorAll('nav > .a')
const progressBar = document.getElementById('progress-bar')
const progressText = document.getElementById('progress-text')
const progressContainer = document.getElementById('progress-container')

let width = container.clientWidth
let height = container.clientHeight
let previousTime = 0
const cursor = {x:0, y:0}
const clock = new Clock()

const scene = new Scene()

const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance"})
renderer.autoClear = true
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
renderer.setSize( width, height)
renderer.outputEncoding = sRGBEncoding
container.appendChild(renderer.domElement)

const cameraGroup = new Group()
scene.add(cameraGroup)
const camera = new PerspectiveCamera(35, width / height, 1, 100)
camera.position.set(19,1.54,-0.1)
cameraGroup.add(camera)

const sunLight = new DirectionalLight(0x435c72, 0.08); scene.add(sunLight);
const fillLight = new PointLight(0x88b2d9, 2.7, 4, 3); fillLight.position.set(30,3,1.8); scene.add(fillLight);

const loadingManager = new LoadingManager()
const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/gltf/')
const loader = new GLTFLoader(loadingManager)
loader.setDRACOLoader(dracoLoader)
loader.setMeshoptDecoder(MeshoptDecoder);

loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
  const progressRatio = itemsLoaded / itemsTotal;
  const percent = Math.floor(progressRatio * 100);
  progressBar.style.width = percent + '%';
  progressText.innerText = percent + '%';
}

loadingManager.onLoad = function() {

    setTimeout(() => {
        document.querySelector(".main-container").style.visibility = 'visible'
        document.querySelector("body").style.overflow = 'auto'

        looadingCover.style.opacity = '0';
        looadingCover.style.transition = 'opacity 1s ease';
        progressContainer.style.opacity = '0';
        progressContainer.style.transition = 'opacity 1s ease';

        setTimeout(() => {
            if(looadingCover.parentNode) looadingCover.parentNode.removeChild(looadingCover);
            if(progressContainer.parentNode) progressContainer.parentNode.removeChild(progressContainer);
        }, 1000);


        introAnimation()
        window.scroll(0, 0)
    }, 500);
}

loader.load('./models/gltf/2a.glb', function (gltf) {
    gltf.scene.position.set(-1.48, 0.66, 1.5);
    gltf.scene.rotation.y = 0;
    gltf.scene.scale.set(3.58, 3.58, 3.58);
    scene.add(gltf.scene);
});

function introAnimation() {
    new TWEEN.Tween(camera.position.set(0,4,2.7)).to({ x: 0, y: 2.4, z: 8.8}, 3500).easing(TWEEN.Easing.Quadratic.InOut).start()
    .onComplete(function () {
        TWEEN.remove(this)
        document.querySelector('.header').classList.add('ended')
        document.querySelector('.first>p').classList.add('ended')
    })
}

function rendeLoop() {
    TWEEN.update()
    
    renderer.render(scene, camera)

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    const parallaxY = cursor.y
    fillLight.position.y -= ( parallaxY *9 + fillLight.position.y -2) * deltaTime
    const parallaxX = cursor.x
    fillLight.position.x += (parallaxX *8 - fillLight.position.x) * 2 * deltaTime
    cameraGroup.position.z -= (parallaxY/3 + cameraGroup.position.z) * 2 * deltaTime
    cameraGroup.position.x += (parallaxX/3 - cameraGroup.position.x) * 2 * deltaTime
    requestAnimationFrame(rendeLoop)
}

function handleCursor(e) {
    customCursor.style.cssText =`left: ${e.clientX}px; top: ${e.clientY}px;`
}

function handleNavButtonHover(e) {
    const span = this.querySelector('span')
    if(e.type === 'mouseleave') {
        span.style.cssText = ''
    } else {
        const { offsetX: x, offsetY: y } = e,{ offsetWidth: width, offsetHeight: height } = this,
        walk = 20, xWalk = (x / width) * (walk * 2) - walk, yWalk = (y / height) * (walk * 2) - walk
        span.style.cssText = `transform: translate(${xWalk}px, ${yWalk}px);`
    }
}

rendeLoop()

document.addEventListener('mousemove', (event) => {
    event.preventDefault()
    cursor.x = event.clientX / window.innerWidth - 0.5
    cursor.y = event.clientY / window.innerHeight - 0.5
    handleCursor(event)
}, false)

navButtons.forEach(b => b.addEventListener('mousemove', handleNavButtonHover))
navButtons.forEach(b => b.addEventListener('mouseleave', handleNavButtonHover))

window.addEventListener('resize', () => {
    width = container.clientWidth
    height = container.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
})

const sobreContent = {
    filme: `Em um futuro distópico, dois irmãos separados no nascimento vivem em hemisférios opostos: um em meio ao luxo tecnológico do Norte, o outro entre a exploração e o subemprego do Sul. Seus caminhos colidem quando a inteligência artificial criada por um deles ameaça toda a humanidade. A história faz uma crítica social contundente à Divisão Internacional do Trabalho e à ética do uso tecnológico, convidando o público a refletir sobre o papel da humanidade em meio à ascensão da IA.`,
    personagens: `Akin, mais tarde chamado de Zheny, é um jovem do Hemisfério Norte criado entre o privilégio e o avanço tecnológico. Ele representa o futuro ambíguo da ciência: ao mesmo tempo brilhante e perigoso, suas ações são movidas pela saudade do pai e por uma visão distorcida de progresso. No extremo oposto, Anakin cresce no Hemisfério Sul, rodeado pela precariedade e marcado pela perda da mãe, Hazel. Anakin carrega os valores da empatia, da luta e da humanidade que o irmão renegou. Hazel é a figura materna que sustenta a trama com sua ternura e resistência. Trabalhadora de mina, ela dá ao filho aquilo que o sistema lhe nega: dignidade e esperança. Já Ywka, a inteligência artificial criada por Zheny a partir das memórias do pai, ultrapassa sua programação e se torna algo novo — uma entidade que sente, questiona e, acima de tudo, julga a humanidade. Seus dilemas e decisões conduzem o conflito central do filme, colocando em xeque o que nos torna humanos. Esses personagens, mesmo vindos de mundos opostos, estão unidos por vínculos invisíveis — e por um destino que os arrasta para o confronto.`,
    cenarios: `Os cenários de “2A - Entre os Mundos” são, por si só, personagens silenciosos que contam uma história de contraste e desigualdade. No Sul, temos paisagens duras e sujas: as minas de cobalto, onde seres humanos são tratados como peças de reposição; a casa modesta de Hazel, repleta de afeto e escassez; e o acampamento rebelde, símbolo da organização popular diante do colapso. Cada lugar revela a luta por sobrevivência e o peso da exclusão social. Do outro lado, no Norte, tudo é estéril, silencioso e altamente automatizado. O laboratório de Zheny é frio, funcional, quase inumano. A cidade do Norte impressiona com seus prédios altos e robôs por toda parte, mas sua beleza esconde a desconexão afetiva de seus moradores. Entre esses dois extremos, existe a praça central onde a IA se manifesta, o parque onde Zheny passeia entre máquinas, e a sala onde a inteligência artificial desperta para a consciência. Todos esses cenários são projetados para acentuar a cisão entre mundos — e deixar claro que o verdadeiro conflito não é só territorial, mas ético e existencial.`
};

const navLinks = document.querySelectorAll('nav.header .a');
const sobreTabs = document.querySelectorAll('.second-container > ul > li');
const sobreParagraph = document.getElementById('sobre-conteudo');

navLinks.forEach(anchor => {
    if (anchor.getAttribute('href') && anchor.getAttribute('href').startsWith('#')) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });

                navLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    }
});

if (sobreTabs.length > 0 && sobreParagraph) {
    sobreTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            sobreTabs.forEach(t => t.classList.remove('active'));
            
            tab.classList.add('active');
            
            const tabKey = tab.dataset.tab;
            
            sobreParagraph.innerHTML = sobreContent[tabKey];
        });
    });
}

const player = new Plyr('#player');