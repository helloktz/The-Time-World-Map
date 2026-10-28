# Astronomical definitions

## Sun and sphere

The supported civil-calendar range is 1900–2100. `astronomy-engine` computes the apparent geocentric Sun vector with aberration (`GeoVector`), transformed from EQJ to equator/equinox of date (`Rotation_EQJ_EQD`). Declination is the subsolar latitude. Subsolar longitude is wrapped `15 × (RA hours − Greenwich apparent sidereal time hours)`.

Right-handed display coordinates: north +Y, Greenwich +X, east −Z. The shader compares each surface unit normal with the solar unit vector. The Earth uses geographical latitude/longitude on a sphere, not Mercator. No globe projection eliminates perspective foreshortening near the visible limb.

Default geometric terminator: solar center altitude 0°. Optional standard apparent sunrise/sunset: center altitude −0.833°, a conventional average approximation for atmospheric refraction and solar radius. Neither accounts for weather, elevation, horizon mountains or topocentric parallax. A narrow smooth shader transition improves antialiasing; it is not a model of civil twilight.

Earth's seasonal declination and rotation are computed by astronomy, not independently animated with a guessed axial tilt. Night opacity defaults to 40% and remains adjustable.

## Solar terms

Terms solve the Sun's apparent ecliptic longitude with `SearchSunLongitude`. The year list runs 小寒 (285°) through 冬至 (270°), selecting occurrences in the named Gregorian year, shown at UTC+8. No fixed calendar table determines term dates. Times are displayed to the second for interaction; this does not constitute a claim of independently verified subsecond accuracy.

The independent reference is the Hong Kong Observatory 2026 Almanac:
https://www.hko.gov.hk/en/gts/astron2026/files/HKO_almanac_2026.pdf

All 12 major 2026 terms are tested to within 2 minutes of that reference. Additional tests check solstitial subsolar latitude, day/night in eastern China, equinox geometry, and polar day/night. The algorithm library describes broader accuracy separately: https://github.com/cosinekitty/astronomy

## Time and playback

All calendar input/output uses fixed UTC+8, not the browser local timezone and not historical Beijing DST. Internal values are absolute UTC instants. Date parsing validates leap years and rejects invalid rollovers.

Playback spans the requested 00:00 through 23:59 endpoint over 30, 60 or 120 seconds, continuously updating intermediate timestamps. It stops at the endpoint rather than advancing to the next day. This deliberately excludes the final minute because the requested visible endpoint is 23:59, rather than claiming a mathematically complete 86,400-second playback. Choosing realtime uses the operating system clock, whose accuracy is not verified online.
