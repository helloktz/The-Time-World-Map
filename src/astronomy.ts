import { Body, GeoVector, EquatorFromVector, Rotation_EQJ_EQD, RotateVector, SearchSunLongitude, SiderealTime } from 'astronomy-engine';

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;
const DEG = Math.PI / 180;
export type Vector3Tuple = [number, number, number];
export interface SunPosition { latitude: number; longitude: number; direction: Vector3Tuple; declination: number; rightAscension: number }
export interface SolarTerm { name: string; longitude: number; date: Date; description: string; major: boolean }

/** Right-handed globe convention: north +Y, Greenwich +X, 90° east −Z. */
export function latLonToVector(latitude: number, longitude: number, radius = 1): Vector3Tuple {
  const lat = latitude * DEG, lon = longitude * DEG;
  return [radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), -radius * Math.cos(lat) * Math.sin(lon)];
}
export function normalizeLongitude(longitude: number): number { return ((longitude + 180) % 360 + 360) % 360 - 180; }
/** Apparent geocentric Sun, true equator/equinox of date and GAST. No observer parallax/refraction. */
export function sunPosition(date: Date): SunPosition {
  if (!Number.isFinite(date.getTime())) throw new RangeError('Invalid date');
  const eq = EquatorFromVector(RotateVector(Rotation_EQJ_EQD(date), GeoVector(Body.Sun, date, true)));
  const longitude = normalizeLongitude(15 * (eq.ra - SiderealTime(date)));
  return { latitude: eq.dec, longitude, direction: latLonToVector(eq.dec, longitude), declination: eq.dec, rightAscension: eq.ra };
}
/** Geometric solar-centre altitude for a spherical Earth. */
export function solarAltitude(date: Date, latitude: number, longitude: number): number {
  const n = latLonToVector(latitude, longitude), s = sunPosition(date).direction;
  return Math.asin(Math.max(-1, Math.min(1, n[0]*s[0] + n[1]*s[1] + n[2]*s[2]))) / DEG;
}
/** Analytic geometric daylight fraction at constant solar declination, including polar day/night. */
export function daylightFraction(latitude: number, declination: number): number {
  const x = -Math.tan(latitude * DEG) * Math.tan(declination * DEG);
  return x <= -1 ? 1 : x >= 1 ? 0 : Math.acos(x) / Math.PI;
}
const NAMES = ['小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];
const DETAILS: Record<string, string> = {
  春分: '太阳视黄经 0°，直射点由南向北越过赤道。',
  夏至: '太阳视黄经 90°，北半球白昼接近全年最长。',
  秋分: '太阳视黄经 180°，直射点由北向南越过赤道。',
  冬至: '太阳视黄经 270°，北半球白昼接近全年最短。',
};
const termsCache = new Map<number, SolarTerm[]>();
/** All 24 apparent geocentric longitude crossings in a Gregorian year; not fixed calendar dates. */
export function solarTerms(year: number): SolarTerm[] {
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) throw new RangeError(`Supported years: ${MIN_YEAR}–${MAX_YEAR}`);
  const cached = termsCache.get(year);
  if (cached) return cached.map(t => ({...t, date: new Date(t.date)}));
  const terms = NAMES.map((name, index) => {
    const longitude = (285 + index * 15) % 360;
    // Each crossing falls in one of two half-month windows. Windows overlap deliberately.
    const month = Math.floor(index / 2);
    const from = new Date(Date.UTC(year, month, index % 2 ? 14 : 1));
    const result = SearchSunLongitude(longitude, from, 16);
    if (!result) throw new Error(`Solar longitude search failed: ${year} ${name}`);
    return { name, longitude, date: result.date, major: name in DETAILS, description: DETAILS[name] ?? `太阳视黄经达到 ${longitude}°；节气由真实天文位置计算。` };
  });
  termsCache.set(year, terms);
  return terms.map(t => ({...t, date: new Date(t.date)}));
}
