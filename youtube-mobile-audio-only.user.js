// ==UserScript==
// @name         YouTube Mobile Audio Only
// @namespace    https://m.youtube.com/
// @version      1.0.2
// @description  Use YouTube's native audio-only player without custom network requests.
// @homepageURL  https://github.com/sashokey/youtube-mobile-audio-only
// @supportURL   https://github.com/sashokey/youtube-mobile-audio-only/issues
// @source       https://github.com/sashokey/youtube-mobile-audio-only/blob/master/youtube-mobile-audio-only.src.js
// @updateURL    https://raw.githubusercontent.com/sashokey/youtube-mobile-audio-only/master/youtube-mobile-audio-only.user.js
// @downloadURL  https://raw.githubusercontent.com/sashokey/youtube-mobile-audio-only/master/youtube-mobile-audio-only.user.js
// @license      GPL-3.0
// @match        https://m.youtube.com/*
// @run-at       document-start
// @sandbox      raw
// @grant        none
// @noframes
// ==/UserScript==
(()=>{"use strict";const e=Symbol.for("youtube-mobile-audio-only");if(window[e])return;Object.defineProperty(window,e,{value:!0});const t=new WeakMap,n=new WeakSet;function o(e,n,o){if(!e||"object"!=typeof e&&"function"!=typeof e)return;let r=t.get(e);if(r||t.set(e,r=new Set),r.has(n))return;r.add(n);const a=Object.getOwnPropertyDescriptor(e,n);if(a&&(!a.configurable||a.get||a.set))return;let i=o(e[n]);Object.defineProperty(e,n,{configurable:!0,enumerable:a?.enumerable??!0,get:()=>i,set(e){i=o(e)}})}function r(e,t=!1){if("function"!=typeof e||n.has(e))return e;const a=function(...n){const a=t?n[1]?.args:n[0];a&&(a.audio_only=!0);const i=Reflect.apply(e,this,n);if(t)for(const e of["loadVideoByPlayerVars","cueVideoByPlayerVars","preloadVideoByPlayerVars"])o(i,e,r);return i};return n.add(a),a}o(window,"yt",e=>(o(e,"player",e=>(o(e,"Application",e=>(o(e,"create",e=>r(e,!0)),o(e,"createAlternate",e=>r(e,!0)),e)),e)),e))})();