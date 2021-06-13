"use strict";

import * as THREE from 'three';
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";

import {Localization} from "./core/Localization";

const onResize: ((event: UIEvent) => void)[] = [];

window.onresize = (event: UIEvent) => {

   onResize.forEach((callback: Function) => {
      callback(event);
   })
}

const onLoad: ((event: Event) => void)[] = [];
window.onload = (event: Event) => {

   onLoad.forEach((callback: any) => {
      callback(event);
   })
}

const onScroll: ((event: UIEvent) => void)[] = [];

window.onscroll = (event: Event) => {

   onScroll.forEach((callback: Function) => {
      callback(event);
   })
}

/**
 * start navigation
 */

const hamburgers: NodeListOf<HTMLDivElement> = document.querySelectorAll('.b_hamburger');
const mobileNavigation: HTMLDivElement | null = document.querySelector('.b_header__mobile');

const mobileNavigationOpenClass: string = 'this--open';
const hamburgerCrossClass: string = 'this--cross';

function changeHamburgersMode(hamburgers: NodeListOf<HTMLDivElement>) {
   hamburgers.forEach((hamburger: HTMLDivElement) => {
      hamburger.classList.toggle(hamburgerCrossClass);
   })
}

if(mobileNavigation !== null) {

   hamburgers.forEach((hamburger: HTMLDivElement) => {

      hamburger.addEventListener('click', () => {
         mobileNavigation.classList.toggle(mobileNavigationOpenClass);
         changeHamburgersMode(hamburgers);

         document.body.classList.toggle('ynoscroll');
      });
   });
}

/**
 * end navigation
 */

/**
 * start footer attach
 */

const footer: HTMLDivElement | null = document.querySelector('.b_footer');

function attachFooter(footer: HTMLDivElement) {
   footer.style.position = 'absolute';
   footer.style.bottom = '0';
   footer.style.width = '100%';
}

function detachFooter(footer: HTMLDivElement) {
   footer.removeAttribute('style');
}

if(footer !== null) {
   if(innerHeight > document.body.offsetHeight) {
      attachFooter(footer);
   }

   onResize.push((event: UIEvent) => {

      if(footer !== null) {
         if(innerHeight > document.body.offsetHeight) {
            attachFooter(footer);
         } else {
            detachFooter(footer);
         }
      }

   });
}

/**
 * end footer attach
 */

/**
 * start three viewer
 */
const threeContainer: HTMLDivElement | null = document.querySelector('.b_three-viewer');

if(threeContainer !== null) {

   const threeLoaderElm: HTMLDivElement | null = threeContainer.querySelector('.b_three-viewer__loader');

   const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      antialias: true
   });
   renderer.setClearColor(0xffffff);
   renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);

   threeContainer.appendChild(renderer.domElement);

   const scene: THREE.Scene = new THREE.Scene();

   const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(60, threeContainer.clientWidth/threeContainer.clientHeight);

   scene.add(camera);

   onResize.push((event: UIEvent) => {

      if(threeContainer !== null && renderer !== null && camera !== null) {
         renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);

         camera.aspect = threeContainer.clientWidth / threeContainer.clientHeight;
         camera.updateProjectionMatrix();
      }
   });

   let cube: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1,1,1), new THREE.MeshPhysicalMaterial({}));
   cube.position.set(0,0,-2);
   scene.add(cube);

   const light: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 0.3);
   scene.add(light);

   const pointLight: THREE.PointLight = new THREE.PointLight(0xffffff, 0.3);
   pointLight.position.set(0,0, 0);
   scene.add(pointLight);

   let modelGroup: THREE.Group = new THREE.Group();


   const mtlLoader: MTLLoader = new MTLLoader();
   mtlLoader.load('/assets/model/materials.mtl', (materials) => {
      materials.preload();

      const objLoader: OBJLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load('/assets/model/model.obj', (group) => {
         if(threeLoaderElm !== null) threeLoaderElm.classList.add('this--hidden');

         cube.position.setZ(10);

         modelGroup = group;
         modelGroup.position.setZ(-50);

         scene.add(modelGroup);
      });
   });

   let time: number = 0;

   let mouseIsDown: boolean = false;
   let needToReturnDefaultPos: boolean = false;
   let lastMousePos: {x: number, y: number} = {x: 0, y: 0};

   threeContainer.addEventListener('mousedown', () => {
      mouseIsDown = true;
      threeContainer.style.cursor = 'grabbing';
   });

   threeContainer.addEventListener('mouseup', () => {
      mouseIsDown = false;
      threeContainer.style.cursor = 'grab';
   });

   threeContainer.addEventListener('mouseleave', () => {
      mouseIsDown = false;
      threeContainer.style.cursor = 'grab';
   });

   threeContainer.addEventListener('mousemove', (e: MouseEvent) => {

      if(mouseIsDown) {
         const deltaX: number = e.movementX/Math.abs(e.movementX) | 0;
         const deltaY: number = e.movementY/Math.abs(e.movementY) | 0;

         modelGroup.rotateX(deltaY * 0.04);
         modelGroup.rotateY(deltaX * 0.04);

         needToReturnDefaultPos = true;
      }
   });

   // @ts-ignore
   function loop() {
      time++;
      renderer.clear();

      cube.rotateY(.01);

      if(!mouseIsDown && !needToReturnDefaultPos) {
         modelGroup.rotateY(.01);
      }

      if(!mouseIsDown && needToReturnDefaultPos) {
         const modelAngles: number[] = modelGroup.rotation.toArray();

         modelAngles[0] *= 0.98;
         modelAngles[1] *= 0.98;
         modelAngles[2] *= 0.98;

         const flagX: boolean = (modelAngles[0] < 0.01) && (modelAngles[0] > -0.01);
         const flagY: boolean = (modelAngles[1] < 0.01) && (modelAngles[1] > -0.01);
         const flagZ: boolean = (modelAngles[2] < 0.01) && (modelAngles[2] > -0.01);

         modelGroup.rotation.set(modelAngles[0], modelAngles[1], modelAngles[2]);

         if(flagX && flagY && flagZ) needToReturnDefaultPos = false;
      }

      renderer.render(scene, camera);

      requestAnimationFrame(loop);
   }

   loop();
}

/**
 * end three viewer
 */

/**
 * start Localization
 */

let defaultLocale: string | null = localStorage.getItem('locale');

defaultLocale = defaultLocale === null ? 'Ru' : defaultLocale;

const localization: Localization = new Localization(defaultLocale);
localization.loadLocalization('/assets/locale.json', () => {

   // Get all locale containers
   let localeContainers: NodeListOf<HTMLElement> = document.querySelectorAll('.b_header__locale');
   let localeCurrentLocaleElms: NodeListOf<HTMLElement> = document.querySelectorAll('.b_header__current-locale');

   // Set default locacale to html
   localeCurrentLocaleElms.forEach((currentLocale: HTMLElement) => {
      currentLocale.innerText = localization.getCurrentLocale();
   });

   let languages: string[] = localization.getLocalesArray();

   localeContainers.forEach((localeContainer: HTMLElement) => {
      // Generate list
      let localeListElement = document.createElement('ul');
      localeListElement.classList.add('b_header__locale-list');

      languages.forEach((language) => {
         let langItem: HTMLLIElement = document.createElement('li');
         langItem.classList.add('b_header__locale-item');
         langItem.setAttribute('data-lang', language);
         langItem.innerHTML = language;

         langItem.addEventListener('click', () => {
            const lang: string = langItem.getAttribute('data-lang')!;

            localStorage.setItem('locale', lang)
            localization.changeLocale(lang);

            localeCurrentLocaleElms.forEach((elm: HTMLElement) => {
               elm.innerHTML = localization.getCurrentLocale();
            });
         });

         localeListElement.appendChild(langItem);
      });

      localeContainer.appendChild(localeListElement);
   });
});

/**
 * end Localization
 */

/**
 * start animations
 */

function isScrolledIntoView(el: HTMLElement): boolean {
   let rect: DOMRect = el.getBoundingClientRect();
   let elemTop: number = rect.top;
   let elemBottom: number = rect.bottom;

   let isVisible: boolean = (elemTop <= window.innerHeight);

   return isVisible;
}

function makeSomeNodesVisible(element: HTMLElement, index: number): void {
   setTimeout(() => {
      if(isScrolledIntoView(element)) element.classList.add('animation-opacity-visible');
   }, index * 250);
}

const opacityNodes: NodeListOf<HTMLElement> = document.querySelectorAll('.animation-opacity');

onLoad.push(() => {
   opacityNodes.forEach((element, index) => {
      makeSomeNodesVisible(element, index);
   });
});

onScroll.push(() => {
   opacityNodes.forEach((element, index) => {
      makeSomeNodesVisible(element, index);
   });
});

onResize.push(() => {
   opacityNodes.forEach((element, index) => {
      makeSomeNodesVisible(element, index);
   });
})

/**
 * end animations
 */

/**
 * start map
 */

const mapContainer: HTMLElement | null = document.getElementById('contacts-map');

function mapInit() {
   // @ts-ignore
    let map = new ymaps.Map("contacts-map", {
      center: [47.232193, 39.717968],
      zoom: 15
   })

   // @ts-ignore
   let pin = new ymaps.Placemark([47.232193, 39.717968], {}, {
      iconLayout: 'default#image',
      iconImageHref: '/assets/img/pin.png',
      iconImageSize: [34, 46],
   });

   map.geoObjects.add(pin);
}

if(mapContainer !== null) {
   // @ts-ignore
   ymaps.ready(mapInit);
}

/**
 * end map
 */