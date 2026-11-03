import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && (typeof value === 'object' || typeof value === 'function');
}
function record(value: unknown): Record<string, unknown> {
  if (isRecord(value)) return value;
  throw new Error('Expected a native object');
}
function call(target: unknown, key: string, ...args: unknown[]): unknown {
  const owner = record(target);
  const fn = owner[key];
  if (typeof fn !== 'function') throw new Error('Expected a native function');
  const result: unknown = Reflect.apply(fn, target, args);
  return result;
}

for (const artifact of ['unminified', 'minified']) {
  const path = artifact === 'unminified' ? '../.build/youtube-mobile-audio-only.js' : '../youtube-mobile-audio-only.user.js';
  const code = readFileSync(new URL(path, import.meta.url), 'utf8');
  function install(window: Record<string, unknown> = {}) {
    const context = { window };
    runInNewContext(code, context);
    return { window, repeat: (): void => { runInNewContext(code, context); } };
  }
  for (const factory of ['create', 'createAlternate']) {
    for (const timing of ['existing', 'late']) {
      void test(artifact + ': ' + timing + ' ' + factory + ' enables audio before native initialization', () => {
        const result = {};
        let received: { self: unknown; args: unknown[] } | undefined;
        const native = function (this: unknown, ...args: unknown[]): object {
          received = { self: this, args };
          assert.equal(record(record(args[1])['args'])['audio_only'], true);
          return result;
        };
        const application: Record<string, unknown> = { [factory]: native };
        const tree = { player: { Application: application } };
        const state = install(timing === 'existing' ? { yt: tree } : {});
        if (timing === 'late') {
          state.window['yt'] = {};
          record(state.window['yt'])['player'] = {};
          record(record(state.window['yt'])['player'])['Application'] = application;
        }
        const args = { video_id: 'fixture-video', start: '12' };
        const config = { args };
        assert.equal(call(application, factory, 'player-element', config, 'extra'), result);
        assert.ok(received);
        assert.equal(received.self, application);
        assert.deepEqual(received.args, ['player-element', config, 'extra']);
        assert.deepEqual(args, { video_id: 'fixture-video', start: '12', audio_only: true });
      });
    }
  }
  for (const method of ['loadVideoByPlayerVars', 'cueVideoByPlayerVars', 'preloadVideoByPlayerVars']) {
    for (const timing of ['existing', 'replacement']) {
      void test(artifact + ': ' + timing + ' ' + method + ' applies audio mode to subsequent loads', () => {
        let received: { self: unknown; args: unknown[] } | undefined;
        const native = function (this: unknown, ...args: unknown[]): string {
          received = { self: this, args };
          assert.equal(record(args[0])['audio_only'], true);
          return 'native-result';
        };
        const player: Record<string, unknown> = { [method]: native };
        const application = { create: (): object => player };
        install({ yt: { player: { Application: application } } });
        call(application, 'create', null, { args: {} });
        if (timing === 'replacement') player[method] = native;
        const args = { video_id: 'next-video' };
        assert.equal(call(player, method, args), 'native-result');
        assert.ok(received);
        assert.equal(received.self, player);
        assert.equal(received.args[0], args);
        assert.deepEqual(args, { video_id: 'next-video', audio_only: true });
      });
    }
  }
  void test(artifact + ': repeated execution preserves one native initialization', () => {
    let calls = 0;
    const application = { create(this: void, _element: unknown, config: unknown): object { calls++; assert.equal(record(record(config)['args'])['audio_only'], true); return {}; } };
    const state = install({ yt: { player: { Application: application } } });
    const first = application.create;
    state.repeat();
    call(application, 'create', null, { args: {} });
    assert.equal(calls, 1);
    assert.equal(application.create, first);
  });
  void test(artifact + ': replacement namespaces retain audio mode', () => {
    const state = install();
    for (let i = 0; i < 2; i++) {
      let mode: unknown;
      const application = { create(_element: unknown, config: unknown): object { mode = record(record(config)['args'])['audio_only']; return {}; } };
      state.window['yt'] = { player: { Application: application } };
      call(application, 'create', null, { args: {} });
      assert.equal(mode, true);
    }
  });
  void test(artifact + ': native errors propagate without another initialization', () => {
    const expected = new Error('Native initialization failed');
    let calls = 0;
    const application = { create(): never { calls++; throw expected; } };
    install({ yt: { player: { Application: application } } });
    assert.throws(() => call(application, 'create', null, { args: {} }), error => error === expected);
    assert.equal(calls, 1);
  });
  void test(artifact + ': missing player configuration preserves the native result', () => {
    const application = { create: (): null => null };
    install({ yt: { player: { Application: application } } });
    assert.equal(call(application, 'create', 'player'), null);
  });
  void test(artifact + ': protected globals remain callable', () => {
    const window = {};
    const application = { create: (): string => 'unchanged' };
    const native = { player: { Application: application } };
    Object.defineProperty(window, 'yt', { value: native, configurable: false });
    install(window);
    assert.equal(call(application, 'create'), 'unchanged');
  });
}
