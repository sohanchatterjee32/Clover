export function detectIOSUserAgent(userAgent: string): boolean {
  return /iphone|ipad|ipod/i.test(userAgent);
}

export function isStandaloneDisplayMode(
  matchMediaStandalone: boolean,
  navigatorStandalone?: boolean
): boolean {
  return Boolean(matchMediaStandalone || navigatorStandalone === true);
}

export type InstallActionMode = 'hidden' | 'prompt' | 'ios-guide';

export function resolveInstallActionMode(options: {
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
}): InstallActionMode {
  if (options.isInstalled) {
    return 'hidden';
  }
  if (options.isInstallable) {
    return 'prompt';
  }
  if (options.isIOS) {
    return 'ios-guide';
  }
  return 'hidden';
}
