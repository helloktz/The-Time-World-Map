import { describe, it, expect } from 'vitest';
import { latLonToVector, normalizeLongitude, sunPosition, solarAltitude, solarTerms, daylightFraction } from '../src/astronomy';
import { parseBeijing, beijingParts, formatBeijing, startOfBeijingDay, dayProgress, atDayProgress, playbackTime, DAY_END_MS } from '../src/time';

describe('globe coordinates', () => {
  it('places Greenwich, east longitudes and poles consistently', () => {
    expect(latLonToVector(0,0)[0]).toBe(1);
    expect(Math.abs(latLonToVector(0,0)[2])).toBe(0);
    expect(latLonToVector(0,90)[2]).toBeCloseTo(-1,12);
    expect(latLonToVector(90,0)[1]).toBeCloseTo(1,12);
    expect(latLonToVector(-90,0)[1]).toBeCloseTo(-1,12);
    const v=latLonToVector(30,120,2); expect(Math.hypot(...v)).toBeCloseTo(2,12);
    expect(normalizeLongitude(181)).toBe(-179);
  });
});
describe('fixed UTC+8 dates (independent of computer timezone)', () => {
  it('crosses UTC day/year correctly', () => {
    expect(parseBeijing('2026-01-01').toISOString()).toBe('2025-12-31T16:00:00.000Z');
    expect(formatBeijing(new Date('2025-12-31T16:00:00Z'))).toBe('2026-01-01 00:00');
  });
  it('handles leap day and rejects invalid dates and formats', () => {
    expect(parseBeijing('2024-02-29','23:59').toISOString()).toBe('2024-02-29T15:59:00.000Z');
    for (const d of ['2023-02-29','1900-02-29','2026-04-31','2026-00-01','2026-13-01','1899-12-31','2101-01-01']) expect(()=>parseBeijing(d)).toThrow();
    expect(()=>parseBeijing('2026-01-01','24:00')).toThrow();
    expect(()=>parseBeijing('2026-01-01','12:60')).toThrow();
    expect(()=>parseBeijing('2026-1-1')).toThrow();
    expect(parseBeijing('2000-02-29')).toBeInstanceOf(Date);
  });
  it('retains seconds for exact solar-term instants', () => {
    const date = parseBeijing('2026-03-20','22:45:36');
    expect(beijingParts(date).seconds).toBe('36');
    expect(formatBeijing(date,true)).toBe('2026-03-20 22:45:36');
  });
});
describe('continuous day playback', () => {
  it('starts at Beijing midnight, ends at 23:59 without advancing date', () => {
    expect(startOfBeijingDay('2026-12-31').toISOString()).toBe('2026-12-30T16:00:00.000Z');
    for (const duration of [30,60,120]) {
      expect(formatBeijing(playbackTime('2026-12-31',0,duration).date)).toBe('2026-12-31 00:00');
      const end = playbackTime('2026-12-31',duration*1000,duration);
      expect(end.finished).toBe(true);
      expect(formatBeijing(end.date)).toBe('2026-12-31 23:59');
      expect(playbackTime('2026-12-31',duration*2000,duration).date.getTime()).toBe(end.date.getTime());
    }
  });
  it('is linear and scrub/continue preserves progress', () => {
    const a = playbackTime('2024-02-29',5000,60), b=playbackTime('2024-02-29',5001,60);
    expect(b.date.getTime()-a.date.getTime()).toBeCloseTo(DAY_END_MS/60000,0);
    expect(dayProgress(atDayProgress('2024-02-29',.72))).toBeCloseTo(.72,7);
    expect(()=>playbackTime('2026-01-01',0,0)).toThrow();
  });
});
describe('solar terms and seasonal geometry', () => {
  // Independent minute-rounded references: Hong Kong Observatory Almanac 2026, "Solar Terms" table.
  // https://www.hko.gov.hk/en/gts/astron2026/files/HKO_almanac_2026.pdf
  const refs: [string,string,string][] = [
    ['大寒','2026-01-20','09:45'],['雨水','2026-02-18','23:52'],
    ['春分','2026-03-20','22:46'],['谷雨','2026-04-20','09:39'],
    ['小满','2026-05-21','08:37'],['夏至','2026-06-21','16:25'],
    ['大暑','2026-07-23','03:13'],['处暑','2026-08-23','10:19'],
    ['秋分','2026-09-23','08:05'],['霜降','2026-10-23','17:38'],
    ['小雪','2026-11-22','15:23'],['冬至','2026-12-22','04:50'],
  ];
  it('matches all 12 HKO major 2026 solar-term times within two minutes', () => {
    const terms = solarTerms(2026);
    for (const [name,day,time] of refs) {
      const term = terms.find(t=>t.name===name)!;
      expect(Math.abs(term.date.getTime()-parseBeijing(day,time).getTime()), name).toBeLessThan(120_000);
    }
  });
  it('returns every longitude crossing in chronological order throughout supported years', () => {
    for (const year of [1900,1901,1999,2000,2024,2026,2099,2100]) {
      const terms = solarTerms(year); expect(terms).toHaveLength(24);
      expect(new Set(terms.map(t=>t.longitude)).size).toBe(24);
      for (let i=0;i<terms.length;i++) {
        expect(beijingParts(terms[i].date).year).toBe(year);
        if(i) expect(terms[i].date.getTime()).toBeGreaterThan(terms[i-1].date.getTime());
      }
    }
    expect(()=>solarTerms(1899)).toThrow();
    expect(()=>solarTerms(2101)).toThrow();
  });
  it('does not hardcode term dates and cached results cannot be mutated by callers', () => {
    const before=solarTerms(2026)[0].date.getTime(); const mutable=solarTerms(2026); mutable[0].date.setFullYear(1900);
    expect(solarTerms(2026)[0].date.getTime()).toBe(before);
    expect(formatBeijing(solarTerms(2025)[5].date).slice(5)).not.toEqual(formatBeijing(solarTerms(2026)[5].date).slice(5));
  });
  it('has correct equinox and solstice declination', () => {
    for(const t of solarTerms(2026).filter(t=>t.major)) {
      const d=sunPosition(t.date).declination;
      if(t.name==='夏至') expect(d).toBeCloseTo(23.44,1);
      else if(t.name==='冬至') expect(d).toBeCloseTo(-23.44,1);
      else expect(Math.abs(d)).toBeLessThan(.02);
    }
  });
  it('locates sun overhead, darkness on opposite hemisphere and zero-altitude terminator', () => {
    const d=parseBeijing('2026-06-21','12:00'), s=sunPosition(d);
    expect(s.longitude).toBeGreaterThan(115); expect(s.longitude).toBeLessThan(125);
    expect(solarAltitude(d,s.latitude,s.longitude)).toBeCloseTo(90,5);
    expect(solarAltitude(d,-s.latitude,s.longitude+180)).toBeCloseTo(-90,5);
    expect(solarAltitude(d,0,s.longitude+90)).toBeCloseTo(0,8);
    expect(Math.hypot(...s.direction)).toBeCloseTo(1,12);
  });
  it('has plausible eastern China noon/night and seasonal day lengths', () => {
    for(const day of ['2026-03-20','2026-06-21','2026-09-23','2026-12-22']) {
      expect(solarAltitude(parseBeijing(day,'12:00'),31.23,121.47)).toBeGreaterThan(30);
      expect(solarAltitude(parseBeijing(day,'00:00'),31.23,121.47)).toBeLessThan(-30);
    }
    expect(daylightFraction(31,23.44)).toBeGreaterThan(.57);
    expect(daylightFraction(31,-23.44)).toBeLessThan(.43);
    expect(daylightFraction(80,23.44)).toBe(1); expect(daylightFraction(80,-23.44)).toBe(0);
    expect(daylightFraction(0,23.44)).toBe(.5);
  });
});
