# Offline map data: sources, licensing, precision and limitations

Audit/download date: **2026-10-28**. All runtime assets are bundled locally. No map API, online tile cache, geocoding service or remote texture is called by the application. The application source-code license does **not** replace the separate data licenses below.

## Important boundary disclaimer

This is an educational astronomy visualization using non-authoritative, generalized open geographic data. **It is not an officially approved Chinese standard map, has no map-review number, and is not suitable for navigation, land/title decisions, legal boundary determinations or claims of official administrative accuracy.** Open-data redistribution permission does not establish compliance with every jurisdiction's map-publication rules. The province dataset is a historical 2019 representation, not a certified current administrative register. Small islands, coast detail and maritime claims are not guaranteed complete. National boundary completeness and official Chinese map approval remain **unverified requirements**, not completed deliverables.

No international boundary was invented, redrawn to assert a claim, or manually patched. Province geometries are preserved except coordinate rounding. City data represents community-maintained administrative relations, not circles around city coordinates. The background relief contains no political borders. Different source dates, cartographic generalization and coastal/water treatment can make province/city boundaries fail to align perfectly. Showing or hiding a layer does not resolve those differences.

### Why not simply copy the official Chinese map service?

The [Ministry of Natural Resources standard-map service](https://bzdt.tianditu.gov.cn/) provides free JPG/EPS standard maps. Its published instructions require displaying the review number for direct use; editing, including scaling/cropping, requires review before public use. That is not a blanket permission to convert and redistribute every feature as interactive GeoJSON. No such official files or Tianditu API tiles were scraped or repackaged here. Users preparing a regulated public map must obtain suitable approved data and review independently. We do not claim a legal determination or government endorsement.

## Bundled datasets

### 1. Terrain: Natural Earth cross-blended hypsometric tints

- Asset: `assets/earth-relief.jpg`, **8192 × 4096**, global plate carrée/equirectangular image, longitude −180°..180°, latitude 90°..−90°.
- Source: [Natural Earth Cross-blended Hypsometric Tints](https://www.naturalearthdata.com/downloads/10m-raster-data/10m-cross-blend-hypso/), variant **HYP_LR_SR_W**, shaded relief and water.
- Exact download: https://naturalearth.s3.amazonaws.com/10m_raster/HYP_LR_SR_W.zip
- Original raster: **16200 × 8100** GeoTIFF, nominal 1:10 million cartography. The downloaded archive's `VERSION.txt` says **2.0.0**; the present webpage advertises **3.2.0**. We record the actual archive label, not an assumed newer version. The archive does not supply a reliable modern terrain observation date.
- Processing: RGB conversion, Lanczos downsampling to 8192 × 4096, optimized JPEG quality 87. This corresponds to roughly 4.9 km/pixel at the equator in the delivered texture, **not** a 30 m DEM or surveyed elevation accuracy. Shading is baked cartographic hillshade; simulated sunlight/day-night shading is computed separately.
- Underlying relief is actual DEM-derived terrain, not procedural noise. The authors' [Natural Earth paper](https://shadedrelief.com/borsa/natural_earth_paper.pdf) describes shaded relief and cross-blended hypsometric tints derived from NASA SRTM Plus elevation data. The official product page describes elevation-based land coloring with shaded relief.
- License: **public domain**, including modified and electronic redistribution, per [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/). Notice archived in `docs/licenses/Natural-Earth.txt`.
- Limitations: generalized visual terrain, no recoverable numeric heights, no local terrain mesh, current land cover or local terrain-occlusion simulation. Large plateaus/basins/mountain belts are represented; small terrain features and seasonal water variation are not.

### 2. Province polygons: geoBoundaries gbOpen CHN ADM1

- Asset: `assets/provinces.json`, 34 Polygon/MultiPolygon features in geographic longitude/latitude.
- Metadata: https://www.geoboundaries.org/api/current/gbOpen/CHN/ADM1/
- Pinned data: https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/CHN/ADM1/geoBoundaries-CHN-ADM1.geojson
- Boundary ID **CHN-ADM1-43563684**, represented year **2019**, source update January 19, 2023, build December 12, 2023, commit `9469f09`.
- Upstream source attribution: **geoBoundaries, Wikimedia Commons**. Metadata declares original license **Public Domain**. geoBoundaries distributes gbOpen as CC-BY-4.0-compliant and requests attribution; we credit geoBoundaries and its original source. See [API documentation](https://www.geoboundaries.org/api.html). This is an upstream licensing declaration, not an independent reconstruction of every original contributor's rights.
- Original metadata's source/license URL is incomplete (`commons.wikimedia.org/wiki/File`), a provenance limitation worth retaining. This is one reason the dataset is not described as authoritative.
- Precision: heavily generalized, mean approximately **173 vertices per unit**; no published positional accuracy. Five-decimal coordinate storage does not imply meter-level source accuracy.
- Processing: preserve polygon topology and membership; round coordinates to five decimals; retain source ID; add Chinese display names. Correct only an evident label typo **“Guangzhou Province” → “Guangdong Province”** for 广东; no geometry modification beyond rounding. One Ningxia source label is also redundant, retained in English as upstream.
- Treat the source's administrative grouping as a dataset convention, not a statement of recognition, legal status, control, sovereign title or official boundary endorsement.

### 3. Actual city administrative polygons: OpenStreetMap

- Asset: `assets/cities.json`, **10** Polygon/MultiPolygon features, separate from the province database.
- Source: © **OpenStreetMap contributors**, [copyright and license](https://www.openstreetmap.org/copyright).
- License: **Open Data Commons Open Database License 1.0 (ODbL)**. The extracted/processed city database is distributed under ODbL 1.0, not the application's source-code license. Attribution must remain visible, and adaptations of this database must retain applicable share-alike obligations. The machine-readable editable data is provided directly in `assets/cities.json`.
- License text: https://opendatacommons.org/licenses/odbl/1-0/ ; notice: `docs/licenses/CITIES-ODbL-NOTICE.txt`.
- Acquisition: one-time development-time Overpass API requests to `https://overpass-api.de/api/interpreter`; no requests from the delivered app. Server base snapshots **2026-10-28T02:32:50Z** and **2026-10-28T02:33:53Z**. OSM is continuously edited; these are snapshot timestamps, not official effective dates.
- Relation IDs: Beijing **912940**, Shanghai **913067**, Chongqing **913069**, Chengdu **2110264**, Nanjing **2131524**, Wuhan **3076268**, Hangzhou **3221112**, Xi'an **3226004**, Guangzhou **3287346**, Shenzhen **3464353**. Each can be inspected at `https://www.openstreetmap.org/relation/ID`.
- Beijing/Shanghai/Chongqing are OSM admin level 4 municipalities; the seven other requested cities are level 5 prefecture-level boundaries. These are full administrative jurisdictions, **not** built-up urban footprints.
- Processing: resolve relation outer/inner way rings using `osmtogeojson@3.0.0-beta.5` (development-only), discard label/admin-centre point features, retain every polygon part/hole, round geographic coordinates to five decimals and retain relation IDs. All 10 polygons converted without a `tainted` incomplete-geometry flag. No arbitrary circle or generated urban boundary is used.
- Accuracy: community-maintained, no guaranteed survey accuracy; coastal water limits and enclaves may be included. Relation changes are not automatically updated offline.

### 4. Rivers and lakes: Natural Earth vector v5.1.2

- Assets: `assets/rivers.json` (**258** features), `assets/lakes.json` (**228** features).
- Pinned sources:
  - https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_rivers_lake_centerlines.geojson
  - https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_lakes.geojson
- License: public domain; same Natural Earth terms/notice as the terrain.
- Scale: nominal **1:10 million**. Rivers include line and lake-centreline geometries; lakes are polygons. This is generalized cartography, not hydrological engineering data. Individual features have mixed source dates; the pinned release is not a claim that water extent was observed on that release date.
- Processing: retain whole features with a coordinate in the China-centered rectangle 70–140°E, 15–56°N; this includes neighboring-country context and is **not a sovereign-area classification**. Retain source feature IDs and names; round to five decimals. The source includes Yangtze/Chang Jiang/Jinsha, Huang (Yellow River), Qinghai Hu, Poyang Hu and Dongting Hu.
- Seasonal lake outlines, small tributaries and fine shoreline detail are outside the scale's capability.

## Coordinates and reproducibility

GeoJSON is unprojected geographic longitude/latitude (WGS84-style GeoJSON), not GCJ-02, BD-09 or Web Mercator. No proprietary coordinate-shift conversion is applied. The raster's world-file extent is global equirectangular. The renderer maps these coordinates onto a sphere; raster-to-vector coast mismatch at small scales is a source-generalization limitation.

Output hashes, byte counts, source versions and snapshot IDs are in `docs/DATA_MANIFEST.json`. To reproduce the vector processing, place the pinned source files in a temporary directory with names `provinces.json`, `ne_10m_rivers_lake_centerlines.json`, `ne_10m_lakes.json`, then run:

```sh
python scripts/process-map-vectors.py /path/to/raw-data
```

To regenerate city data, use the relation IDs above with an Overpass `relation(id:...); out geom;` query. Cache its two response files as `osm-cities.json` and `osm-cities-extra.json`. Install the optional converter in a separate development-tools directory, not in the runtime bundle:

```sh
npm install --prefix /tmp/map-tools --ignore-scripts osmtogeojson@3.0.0-beta.5
node scripts/process-osm.cjs /path/to/raw-data /tmp/map-tools/node_modules/osmtogeojson
```

New OSM snapshots will naturally have different hashes. Do not claim bit-for-bit reproducibility against a live changing server. For exact historical snapshots, obtain archived OSM data; the checked-in GeoJSON is the delivered editable database snapshot. The converter is development-only and uses JSON, not XML.

Terrain regeneration uses the downloaded TIFF and Python Pillow:

```python
from PIL import Image
Image.MAX_IMAGE_PIXELS = None  # known trusted 16200 × 8100 source
image = Image.open('HYP_LR_SR_W.tif').convert('RGB')
image.thumbnail((8192, 4096), Image.Resampling.LANCZOS)
image.save('assets/earth-relief.jpg', quality=87, optimize=True)
```

## Investigated but not bundled

- Official China standard JPG/EPS maps and Tianditu tiles: no verified blanket permission for conversion/repackaging into this interactive public dataset.
- geoBoundaries CHN ADM2: actually describes **county-level** units, not the requested prefecture-city polygons. Never substitute them as city limits.
- GADM: do not assume its download terms authorize unrestricted public/commercial redistribution.
- `cn-atlas`/CTAmap mirrors: convenient city polygons exist, but this build instead uses directly attributable OSM data with a clear database license; no uncertain mirror data was bundled.

No data licensing statement here constitutes official map approval. Full official boundary compliance requires separate expert review and appropriate source authorization.
