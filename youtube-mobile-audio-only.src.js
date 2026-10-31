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

(() => {
    'use strict';

    const installed = Symbol.for('youtube-mobile-audio-only');
    if (window[installed]) return;
    Object.defineProperty(window, installed, { value: true });

    const watched = new WeakMap();
    const wrapped = new WeakSet();

    function hook(target, key, transform) {
        if (!target || (typeof target !== 'object' && typeof target !== 'function')) return;
        let keys = watched.get(target);
        if (!keys) watched.set(target, keys = new Set());
        if (keys.has(key)) return;
        keys.add(key);
        const descriptor = Object.getOwnPropertyDescriptor(target, key);
        if (descriptor && (!descriptor.configurable || descriptor.get || descriptor.set)) return;
        let value = transform(target[key]);
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: descriptor?.enumerable ?? true,
            get: () => value,
            set(next) { value = transform(next); }
        });
    }

    function wrap(fn, initialize = false) {
        if (typeof fn !== 'function' || wrapped.has(fn)) return fn;
        const replacement = function (...args) {
            const data = initialize ? args[1]?.args : args[0];
            if (data) data.audio_only = true;
            const result = Reflect.apply(fn, this, args);
            if (initialize) {
                for (const key of ['loadVideoByPlayerVars', 'cueVideoByPlayerVars', 'preloadVideoByPlayerVars']) hook(result, key, wrap);
            }
            return result;
        };
        wrapped.add(replacement);
        return replacement;
    }

    hook(window, 'yt', yt => {
        hook(yt, 'player', player => {
            hook(player, 'Application', application => {
                hook(application, 'create', fn => wrap(fn, true));
                hook(application, 'createAlternate', fn => wrap(fn, true));
                return application;
            });
            return player;
        });
        return yt;
    });
})();
