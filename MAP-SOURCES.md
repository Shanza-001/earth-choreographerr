# Data, imagery, and product sources

## NISAR science products

As of November 14, 2026, ASF's [NISAR Data User Guide — availability overview](https://nisar-docs.asf.alaska.edu/availability-overview/) reports that VALIDATED L-band Level 0–2 products were released November 6, 2026 for acquisitions beginning October 21. VALIDATED Level-3 Soil Moisture (SME2) is not yet available. PROVISIONAL products were released July 20 for acquisitions starting June 17 and continuing through partway into October 23, 2026. The guide documents a persistent instrument data gap from July 27 to August 10, 2026, and warns that product-specific known issues remain. The site includes one Quetta-point catalog match, described below; do not treat its browse image as evidence of subsidence.

The product-selection panel links to ASF Vertex filtered to VALIDATED or PROVISIONAL data, and to [NASA Earthdata Search](https://search.earthdata.nasa.gov/search?q=nisar&fdc=Alaska%2BSatellite%2BFacility). For the NASA notice on public L-band data, see [NISAR L-Band Data Now Publicly Available](https://www.earthdata.nasa.gov/data/alerts-outages/nisar-l-band-data-now-publicly-available). Vertex allows geographic search and filtering by date, science product, data maturity, polarization, orbit direction, track, and frame. Product downloads require Earthdata Login. See ASF's [Vertex guide](https://nisar-docs.asf.alaska.edu/vertex/) and [data-access overview](https://nisar-docs.asf.alaska.edu/access-overview/).

### Product paths used by the interface

- **GUNW (Level 2):** Geocoded Unwrapped Interferogram; supports line-of-sight ground-displacement analysis from repeat-pass interferometric observations. It does not make a browse image into a displacement estimate.
- **GCOV (Level 2):** Geocoded Polarimetric Covariance; terrain-corrected backscatter products support inundation mapping, ecosystem/biomass, soil-moisture, disturbance, and crop-area studies.
- **GOFF (Level 2):** Geocoded Pixel Offsets; speckle-tracking pixel-offset products are especially relevant to cryosphere and ice-motion applications.

See the official [NISAR data products overview](https://nisar-docs.asf.alaska.edu/products-overview/). NISAR science files use HDF5. ASF Vertex provides browse imagery and GDAL snippets for extracting supported geocoded Level-2/3 science layers to GeoTIFF. The in-browser workbench accepts only PNG/JPEG browse previews; it does not read HDF5 or GeoTIFF, compute pixel differences, or derive motion. Uploaded browse images remain in browser memory; only user-entered metadata is written to the downloadable evidence-note JSON.

## Dated Quetta ASF catalog example

An ASF [SearchAPI](https://docs.asf.alaska.edu/api/basics/) query checked November 14, 2026 using `dataset=NISAR`, `processingLevel=GUNW`, `dataMaturity=PROVISIONAL`, `intersectsWith=POINT(66.975 30.1798)` (longitude, latitude), an acquisition window of June 17–October 24, 2026, and `output=geojson` returned the following product record intersecting the Quetta search point:

- Product: `NISAR_L2_PR_GUNW_032_092_D_073_033_2000_SH_20261006T141233_20261006T141307_20261018T141233_20261018T141307_P05023_N_F_J_001.h5`
- Product family and maturity: Level-2 GUNW, PROVISIONAL
- Pair timing: 2026-10-06 14:12:33 UTC to 2026-10-18 14:13:07 UTC
- Original ASF browse image: [LATLON PNG](https://nisar.asf.earthdatacloud.nasa.gov/BROWSE/NISAR_L2_GUNW_PROVISIONAL_V1/NISAR_L2_PR_GUNW_032_092_D_073_033_2000_SH_20261006T141233_20261006T141307_20261018T141233_20261018T141307_P05023_N_F_J_001/NISAR_L2_PR_GUNW_032_092_D_073_033_2000_SH_20261006T141233_20261006T141307_20261018T141233_20261018T141307_P05023_N_F_J_001_LATLON.png)
- Reproducible [catalog query](https://api.daac.asf.alaska.edu/services/search/param?dataset=NISAR&processingLevel=GUNW&dataMaturity=PROVISIONAL&intersectsWith=POINT%2866.975%2030.1798%29&start=2026-06-17T00%3A00%3A00Z&end=2026-10-24T23%3A59%3A59Z&output=geojson&maxResults=20)

`public/assets/nisar-quetta-gunw-provisional-latlon.png` is a local, byte-for-byte copy of the ASF browse preview above for portable local development. It is a visualization of the unwrapped-interferogram product, not a scaled displacement map or a measured finding. The catalog footprint intersecting a search point does not establish that the ground at that point moved, nor does it validate the separate illustrative Quetta groundwater/subsidence narrative. Re-check the live catalog before presenting this dated example.

## NASA optical context map

The explorer's “NASA context” map uses NASA Global Imagery Browse Services (GIBS) WMTS layer `VIIRS_SNPP_CorrectedReflectance_TrueColor`, in Web Mercator (`EPSG:3857`). The tile template uses `GoogleMapsCompatible_Level9` and GIBS's `default` time value. NASA's [GIBS access guide](https://nasa-gibs.github.io/gibs-api-docs/access-basics/) documents public WMTS/XYZ tile access. This VIIRS layer is optical context imagery, not NISAR radar imagery or a surface-displacement product. “Latest available” imagery can lag acquisition while processing completes.

## 3D globe texture

`public/assets/earth-blue-marble.webp` is a web-optimized copy of NASA's Blue Marble: Next Generation January 2004 global topography-and-bathymetry composite, originally 5400 × 2700 at 8 km/pixel. See NASA's [Blue Marble source page](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/). It is static visual orientation, not current imagery, a NISAR product, or a displacement measurement.

## Other challenge resources

- [NASA NISAR StoryMaps](https://science.nasa.gov/mission/nisar/arcgis-storymaps/) and [societal-benefit application white papers](https://science.nasa.gov/mission/nisar/societal-benefits/)
- NASA [Earth observation basics](https://www.earthdata.nasa.gov/learn/earth-observation-data-basics), [SAR fundamentals](https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar), and the [ARSET NISAR training](https://www.earthdata.nasa.gov/learn/trainings/harnessing-nisar-next-generation-radar-observations-earth-applications)
- [JPL UAVSAR Postcards](https://uavsar.jpl.nasa.gov/education/postcards.html) — airborne SAR false-colour examples, not NISAR observations
- [CSA RADARSAT Constellation data](https://donnees-data.asc-csa.gc.ca/en/dataset/rcm) and the [SAR Python/QGIS tutorial](https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial); check each dataset's licence and terms
- [CSA RADARSAT-1 archive](https://donnees-data.asc-csa.gc.ca/en/dataset/radarsat1) — supplemental SAR data, not NISAR
- [CONAE SAOCOM catalogue](https://catalog.saocom.conae.gov.ar/catalog/) and its [registration portal](https://registro.conae.gov.ar/registracion/view/) — Argentina's separate SAR mission
- [ISRO Bhoonidhi](https://bhoonidhi.nrsc.gov.in/bhoonidhi/home.html) — access path for NISAR S-band products, separate from ASF's L-band catalog

## Required notice

NASA does not endorse any non-U.S. Government entity and is not responsible for information contained on non-U.S. Government websites. For non-U.S. Government websites, participants must comply with any data use parameters of that specific website.
