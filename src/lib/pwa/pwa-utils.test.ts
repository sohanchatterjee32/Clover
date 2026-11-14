import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectIOSUserAgent,
  isStandaloneDisplayMode,
  resolveInstallActionMode,
} from './pwa-utils';

test('detectIOSUserAgent identifies iPhone/iPad/iPod and ignores Android/Desktop', () => {
  assert.equal(
    detectIOSUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
    ),
    true
  );
  assert.equal(
    detectIOSUserAgent(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/122.0.0.0 Mobile Safari/537.36'
    ),
    false
  );
});

test('isStandaloneDisplayMode detects installed standalone mode across Chromium and iOS', () => {
  assert.equal(isStandaloneDisplayMode(true, false), true);
  assert.equal(isStandaloneDisplayMode(false, true), true);
  assert.equal(isStandaloneDisplayMode(false, false), false);
});

test('resolveInstallActionMode prioritizes suppression when already installed', () => {
  assert.equal(
    resolveInstallActionMode({
      isInstalled: true,
      isInstallable: true,
      isIOS: false,
    }),
    'hidden'
  );
  assert.equal(
    resolveInstallActionMode({
      isInstalled: false,
      isInstallable: true,
      isIOS: false,
    }),
    'prompt'
  );
  assert.equal(
    resolveInstallActionMode({
      isInstalled: false,
      isInstallable: false,
      isIOS: true,
    }),
    'ios-guide'
  );
  assert.equal(
    resolveInstallActionMode({
      isInstalled: false,
      isInstallable: false,
      isIOS: false,
    }),
    'hidden'
  );
});
