const BROWSERS = [
  { pattern: /Edg\//, name: 'Edge' },
  { pattern: /OPR\/|Opera/, name: 'Opera' },
  { pattern: /Firefox\//, name: 'Firefox' },
  { pattern: /Chrome\/|CriOS\//, name: 'Chrome' },
  { pattern: /Safari\//, name: 'Safari' },
];

const SYSTEMS = [
  { pattern: /iPhone/, name: 'iPhone', isMobile: true },
  { pattern: /iPad/, name: 'iPad', isMobile: true },
  { pattern: /Android/, name: 'Android', isMobile: true },
  { pattern: /Windows/, name: 'Windows' },
  { pattern: /Mac OS X|Macintosh/, name: 'macOS' },
  { pattern: /CrOS/, name: 'ChromeOS' },
  { pattern: /Linux/, name: 'Linux' },
];

export function describeDevice(userAgent) {
  if (!userAgent) return { label: 'Unknown device', isMobile: false };

  const browser = BROWSERS.find((item) => item.pattern.test(userAgent));
  const system = SYSTEMS.find((item) => item.pattern.test(userAgent));

  if (!browser && !system) {
    return { label: userAgent.split(' ')[0], isMobile: false };
  }

  return {
    label: [browser?.name, system?.name].filter(Boolean).join(' on '),
    isMobile: Boolean(system?.isMobile),
  };
}
