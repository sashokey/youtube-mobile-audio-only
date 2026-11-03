// ==UserScript==
// @name         YouTube Mobile Audio Only
// @namespace    https://m.youtube.com/
// @version      1.0.3
// @description  Violentmonkey: use YouTube's native audio-only player without custom network requests.
// @homepageURL  https://github.com/sashokey/youtube-mobile-audio-only
// @supportURL   https://github.com/sashokey/youtube-mobile-audio-only/issues
// @source       https://github.com/sashokey/youtube-mobile-audio-only/blob/master/youtube-mobile-audio-only.src.ts
// @updateURL    https://raw.githubusercontent.com/sashokey/youtube-mobile-audio-only/master/youtube-mobile-audio-only.user.js
// @downloadURL  https://raw.githubusercontent.com/sashokey/youtube-mobile-audio-only/master/youtube-mobile-audio-only.user.js
// @license      GPL-3.0
// @match        https://m.youtube.com/*
// @run-at       document-start
// @inject-into  page
// @grant        none
// @noframes
// ==/UserScript==
"use strict";(()=>{const e=Symbol.for("youtube-mobile-audio-only");if(!0===Reflect.get(window,e))return;try{Object.defineProperty(window,e,{value:!0})}catch{return}const t=new WeakMap,r=new WeakSet,o=e=>null!==e&&("object"==typeof e||"function"==typeof e);function n(e,r,n){if(!o(e))return;const c=t.get(e)??new Set;if(!c.has(r)){t.set(e,c);try{const t=Object.getOwnPropertyDescriptor(e,r);if(t&&(!t.configurable||t.get||t.set||!1===t.writable))return;const o=Reflect.get(e,r);let a=n(o);Object.defineProperty(e,r,{configurable:!0,enumerable:t?.enumerable??!0,get:()=>a,set(e){a=n(e)}}),c.add(r)}catch{}}}function c(e,t=!1){if("function"!=typeof e||r.has(e))return e;const a=function(...r){try{const e=r[1],n=t?o(e)?Reflect.get(e,"args"):void 0:r[0];"object"!=typeof n||null===n||Array.isArray(n)||Reflect.set(n,"audio_only",!0)}catch{}const a=Reflect.apply(e,this,r);if(t)for(const e of["loadVideoByPlayerVars","cueVideoByPlayerVars","preloadVideoByPlayerVars"])n(a,e,c);return a};return r.add(a),a}n(window,"yt",e=>(n(e,"player",e=>(n(e,"Application",e=>(n(e,"create",e=>c(e,!0)),n(e,"createAlternate",e=>c(e,!0)),e)),e)),e))})();
