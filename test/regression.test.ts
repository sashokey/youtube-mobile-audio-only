import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';

for (const artifact of ['unminified', 'minified']) {
  const path = artifact === 'unminified' ? '../.build/youtube-mobile-audio-only.js' : '../youtube-mobile-audio-only.user.js';
  const code = readFileSync(new URL(path, import.meta.url), 'utf8');
  void test(`${artifact}: leaves a non-extensible native namespace usable`, () => {
    const native = Object.preventExtensions({});
    assert.doesNotThrow(() => runInNewContext(code, { window: { yt: native } }));
  });
  void test(`${artifact}: preserves the native call when player arguments are frozen`, () => {
    const args = Object.freeze({ video_id: 'video' });
    const config = { args };
    const result = {};
    let received: unknown;
    const application = {
      create(_element: unknown, value: unknown): object {
        received = value;
        return result;
      }
    };
    runInNewContext(code, { window: { yt: { player: { Application: application } } } });
    let actual: unknown;
    assert.doesNotThrow(() => { actual = application.create(null, config); });
    assert.equal(actual, result);
    assert.equal(received, config);
    assert.deepEqual(args, { video_id: 'video' });
  });
}
