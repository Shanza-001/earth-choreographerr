# Earth Choreographer

**Every place on Earth is dancing. We make you see the moves.**

Earth Choreographer is an open-source NASA Space Apps project for translating radar change into a clear public story. The opening is a draggable Three.js Earth with a drawn radar sweep. The measured centerpiece is one unaltered ASF provisional NISAR L-band GUNW browse whose footprint intersects Quetta, read as a 12-day phase pair. Around it: a polarization and scattering guide, world search seeds that fill the data desk, an illustrated field guide, local browse comparison, the Quetta story shell, and a decision brief that keeps hypothesis separate from a displacement number.

## Important: separate the data from the context

The site now distinguishes four different things. NISAR science products can be discovered in ASF Vertex and NASA Earthdata Search; the data desk helps users choose a relevant product and record its provenance. It also shows one actual ASF PROVISIONAL GUNW browse quicklook whose catalog footprint intersects the original Quetta search point. Users can compare two additional PNG/JPEG browse previews selected from their own device. The hero and four movement cards use AI-generated concept art, visibly identified as artwork rather than NASA or NISAR imagery. The explorer's NASA GIBS VIIRS layer is optical context, and the Three.js globe uses NASA's static Blue Marble 2004 texture. Neither is a NISAR observation.

The Quetta narrative, story dates, map marker, and comparison illustrations in the sample Dance Card are still **illustrative sample data**, not a measured subsidence result. Separately, the data desk pins one dated ASF PROVISIONAL GUNW catalog match and its unaltered browse preview. That proves only that the catalog product footprint intersects the Quetta search point; it does not confirm ground movement or the sample story's proposed groundwater driver. The data desk starts with an editable Quetta search seed; you can enter another place and valid latitude/longitude for a catalog search. The browser comparison tool does not read NISAR HDF5/GeoTIFF science data, estimate displacement, or calculate change. It renders browse images only, keeps them in the current browser session, and downloads a JSON provenance note containing user-entered metadata—not the image data. Confirm all IDs, dates, footprints, maturity, and acquisition settings against the live ASF record before presenting an analysis.

## Current NISAR data status

As reported by the ASF NISAR Data User Guide on November 14, 2026, VALIDATED L-band collections at Level 0–2 were released November 6 for acquisitions beginning October 21, 2026. VALIDATED Level-3 Soil Moisture (SME2) products were not yet available. PROVISIONAL collections span acquisitions beginning June 17, 2026 through partway into October 23; they are calibrated and partially validated, and the known instrument data gap is July 27–August 10. The ASF guide notes remaining product issues and advises caution when combining products with different processing maturities. The pinned sample is one **PROVISIONAL** GUNW record intersecting the Quetta coordinate, checked November 14; it is not a validated deformation result. Recheck current catalog status before reuse.

## Choosing a product

For ground deformation, choose Level-2 GUNW, a Geocoded Unwrapped Interferogram product derived from repeat observations. It supports line-of-sight displacement analysis; converting that to vertical motion requires additional assumptions and processing. For inundation, wetlands, soil moisture, biomass, disturbance, or crop area, inspect Level-2 GCOV, a Geocoded Polarimetric Covariance product. For ice motion and related surface-flow applications, inspect Level-2 GOFF, Geocoded Pixel Offsets derived using speckle tracking. The pinned Quetta example demonstrates that a PROVISIONAL GUNW catalog record intersects that sample point; other places, dates, product families, and data maturities still require a fresh search.

NISAR L-band science files are HDF5. Downloading requires a free Earthdata Login. ASF Vertex provides associated browse images and, for supported Level-2 products, GDAL tools/snippets to extract data to GeoTIFF. Quantitative interpretation needs the science product, suitable calibration/processing, compatible acquisitions, metadata, uncertainty checks, and validation; a colored browse image is not itself a displacement estimate.

## Run locally

Prerequisites: Node.js 20.19 or newer and Corepack (included with current Node.js distributions). `package.json` pins pnpm 11.25.0.

```bash
corepack enable
corepack pnpm install
corepack pnpm dev
```

Open `http://localhost:3000`. Build the production bundle with `corepack pnpm build`. The cinematic generated artwork is packaged in `public/assets/` for a self-contained local preview; the interactive NASA GIBS context tiles require an internet connection. The NISAR browse comparison is client-side and does not send selected images to a server.

## Run from VS Code

1. Extract the source ZIP and install Node.js 20.19 or newer.
2. In VS Code, choose **File → Open Folder…** and open the extracted `earthdance` folder.
3. Open **Terminal → New Terminal**, then run `corepack enable` and `corepack pnpm install`.
4. Run `corepack pnpm dev` and open `http://localhost:3000` in a browser.
5. Use `corepack pnpm build` for a production build. The first install needs internet access to fetch packages.

## Project structure

- `src/App.tsx` contains the cinematic hero, 90-second mission brief, radar primer, movement cards, NISAR data desk, and explorer.
- `src/data/visuals.ts` selects the packaged artwork for local development and the stable Managed Storage artwork addresses in Cloud Preview.
- `src/components/NisarWorkbench.tsx` contains the current-data maturity panel, ASF/Vertex links, product pathways, local PNG/JPEG browse comparison, metadata capture, JSON evidence-note export, and source/legal notices. Its responsive interface is built primarily with Tailwind CSS v4 utilities.
- `src/components/NisarSampleRecord.tsx` presents the independently sourced ASF quicklook, granule ID, point-intersection query, and explicit PROVISIONAL/interpretation cautions.
- `src/components/EarthGlobe.tsx` provides the interactive Three.js globe with NASA Blue Marble context and a location marker.
- `src/components/SarMap.tsx` uses MapLibre to show NASA GIBS VIIRS optical context. It is explicitly labeled as not NISAR radar data.
- `src/components/DanceCard.tsx` renders the sample-story timeline, illustrative before/after visualization, and share-card image.
- `src/data/locations.json` is the single source of truth for the location story plus its optional, dated NISAR product records. Replace illustrative narrative fields only with documented analysis; the browse record includes its maturity and source URLs.
- `src/index.css`, `src/globe.css`, and `src/map-live.css` define the base design system, hero and movement-card artwork presentation, Tailwind theme integration, and globe/map styling.
- `public/assets/earth-blue-marble.webp` is a static NASA Blue Marble texture used only for globe orientation.
- `public/assets/hero-earth-horizon.webp` and the four `public/assets/move-*.webp` files contain AI-generated editorial concept art; the interface labels these images as non-scientific illustrations.
- `public/assets/nisar-quetta-gunw-provisional-latlon.png` is an unaltered ASF NISAR GUNW browse preview of the pinned PROVISIONAL sample record; it is not a displacement measurement.
- `MAP-SOURCES.md` documents official data/product sources, current maturity information, context layers, and usage caveats.
- `LICENSE` applies the MIT License to project code. NASA imagery and other third-party content remain under their own terms.

## Data and attribution

Start with ASF Vertex to draw an area of interest and filter by date, product, polarization, and maturity. See the [NISAR Data User Guide](https://nisar-docs.asf.alaska.edu/) and the official [availability overview](https://nisar-docs.asf.alaska.edu/availability-overview/). The Data & Sources section includes NASA ARSET NISAR training, SAR fundamentals, NISAR StoryMaps and application white papers, JPL UAVSAR postcards, Canadian RCM/RADARSAT-1 and SAR tutorials, CONAE's SAOCOM catalogue, and the separate ISRO S-band portal.

The site includes the required NASA notice for non-U.S. Government resources. It does not imply NASA endorsement of this project or of third-party sources. Add your actual team name and GitHub repository before submission; visible placeholders are intentional.

## Accessibility

The experience includes semantic headings, labelled controls, keyboard-operable buttons and sliders, visible focus states, contrast-conscious colors, responsive layouts, and reduced-motion behavior. Keep these properties when adding project data.
