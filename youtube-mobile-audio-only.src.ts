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

(() => {
  'use strict';
  const installed = Symbol.for('youtube-mobile-audio-only');
  const initialized: unknown = Reflect.get(window, installed);
  if (initialized === true) return;
  try { Object.defineProperty(window, installed, { value: true }); } catch { return; }
  const watched = new WeakMap<object, Set<string>>();
  const wrapped = new WeakSet<object>();
  const object = (value: unknown): value is object => value !== null && (typeof value === 'object' || typeof value === 'function');

  function hook(target: unknown, key: string, transform: (value: unknown) => unknown): void {
    if (!object(target)) return;
    const keys = watched.get(target) ?? new Set<string>();
    if (keys.has(key)) return;
    watched.set(target, keys);
    try {
      const descriptor = Object.getOwnPropertyDescriptor(target, key);
      if (descriptor && (!descriptor.configurable || descriptor.get || descriptor.set || descriptor.writable === false)) return;
      const current: unknown = Reflect.get(target, key);
      let value: unknown = transform(current);
      Object.defineProperty(target, key, {
        configurable: true,
        enumerable: descriptor?.enumerable ?? true,
        get: (): unknown => value,
        set(next: unknown) { value = transform(next); }
      });
      keys.add(key);
    } catch {}
  }

  function wrap(fn: unknown, initialize = false): unknown {
    if (typeof fn !== 'function' || wrapped.has(fn)) return fn;
    const replacement = function (this: unknown, ...args: unknown[]): unknown {
      try {
        const config = args[1];
        const data: unknown = initialize ? object(config) ? Reflect.get(config, 'args') : undefined : args[0];
        if (typeof data === 'object' && data !== null && !Array.isArray(data)) Reflect.set(data, 'audio_only', true);
      } catch {}
      const result: unknown = Reflect.apply(fn, this, args);
      if (initialize) for (const key of ['loadVideoByPlayerVars', 'cueVideoByPlayerVars', 'preloadVideoByPlayerVars']) hook(result, key, wrap);
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
