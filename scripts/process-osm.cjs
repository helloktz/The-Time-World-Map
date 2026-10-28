// Development-only conversion; no network access at runtime.
const fs = require('node:fs');
const path = require('node:path');
const convert = require(path.resolve(process.argv[3]));
const raw = process.argv[2];
let elements = [];
for (const file of ['osm-cities.json', 'osm-cities-extra.json']) {
  elements.push(...JSON.parse(fs.readFileSync(path.join(raw, file), 'utf8')).elements);
}
const data = convert({version: 0.6, elements});
const round = x => typeof x[0] === 'number' ? x.map(y => Math.round(y * 1e5) / 1e5) : x.map(round);
data.features = data.features.filter(f => ['Polygon', 'MultiPolygon'].includes(f.geometry.type));
for (const f of data.features) {
  const t = f.properties;
  if (t.tainted) throw new Error('Incomplete OSM geometry: ' + f.id);
  f.properties = {name: t['name:en'] || t.name, nameZh: t['name:zh'] || t.name, sourceId: f.id, license: 'ODbL-1.0', adminLevel: t.admin_level};
  f.geometry.coordinates = round(f.geometry.coordinates);
}
if (data.features.length !== 10) throw new Error('Expected ten city polygons');
fs.writeFileSync(path.join(__dirname, '../assets/cities.json'), JSON.stringify(data));
