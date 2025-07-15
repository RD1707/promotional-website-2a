import './main.css'
import { Clock, Scene, LoadingManager, WebGLRenderer, sRGBEncoding, Group, PerspectiveCamera, DirectionalLight, PointLight } from 'three'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const ftsLoader = document.querySelector(".lds-roller")
const looadingCover = document.getElementById("loading-text-intro")
const container = document.getElementById('canvas-container')
const customCursor = document.querySelector('.cursor')
const navButtons = document.querySelectorAll('nav > .a')

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

loadingManager.onLoad = function() {
    document.querySelector(".main-container").style.visibility = 'visible'
    document.querySelector("body").style.overflow = 'auto'
    const yPosition = {y: 0}
    new TWEEN.Tween(yPosition).to({y: 100}, 900).easing(TWEEN.Easing.Quadratic.InOut).start()
    .onUpdate(function(){ looadingCover.style.setProperty('transform', `translate( 0, ${yPosition.y}%)`)})
    .onComplete(function () {looadingCover.parentNode.removeChild(document.getElementById("loading-text-intro")); TWEEN.remove(this)})
    introAnimation()
    ftsLoader.parentNode.removeChild(ftsLoader)
    window.scroll(0, 0)
}

loader.load('models/gltf/graces-draco2.glb', function (gltf) {
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
    filme: `Aqui você pode escrever um resumo sobre o enredo do filme, os temas abordados e o que o público pode esperar dessa jornada "entre os mundos". Destaque os elementos que tornam a história única e cativante.`,
    personagens: `Descreva os protagonistas e antagonistas. Quem são eles? Quais são suas motivações, medos e arcos de desenvolvimento ao longo da história? Dê um vislumbre da complexidade de cada um.`,
    cenarios: `Apresente os mundos que o filme explora. Descreva a atmosfera, a estética e a importância de cada cenário para a narrativa. São mundos contrastantes? Mágicos? Tecnológicos?`
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