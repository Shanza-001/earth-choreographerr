# Earth Choreographer — Hackathon enhancement outcomes

## Existing experience to preserve
- [x] Retain the cinematic, responsive Earth Choreographer hero and exact tagline: “Every place on Earth is dancing. We make you see the moves.” Keep the 3D Earth explicitly labeled as a static NASA Blue Marble 2004 reference texture, not NISAR imagery.
- [x] Preserve the radar primer, the four illustrative movement signatures (subsidence, glacier flow, flood/wetland, and fire/farming), and the Quetta story card with its sample values, dates, and scenes visibly labeled as illustrative.
- [x] Preserve the interactive 3D Earth and NASA GIBS VIIRS true-colour context map while labeling that map as optical context imagery—not a NISAR radar product or displacement measurement.

## Hackathon-ready NISAR workflow
- [x] State the current NISAR data maturity/release dates accurately and link directly to the ASF Vertex and NASA Earthdata Search catalogs. Explain the difference between VALIDATED and PROVISIONAL coverage and that coverage for Quetta must be confirmed in the catalog rather than assumed; show the dated November 14, 2026 ASF query that confirmed one PROVISIONAL GUNW record intersects the original Quetta search point, without treating that record as evidence of subsidence.
- [x] Explain three fit-for-purpose NISAR Level-2 product paths: GUNW for geocoded unwrapped interferograms and ground-motion studies; GCOV for geocoded polarimetric covariance/backscatter and inundation, ecosystem, soil-moisture, or crop questions; and GOFF for geocoded pixel offsets, especially ice-motion applications.
- [x] Provide an accessible, actionable route from selecting a question and product to searching a study-area/date range in ASF Vertex, obtaining the NISAR science data, and recording product provenance for a public-facing explanation; explain that science-data downloads require Earthdata Login.
- [x] Let users replace the Quetta starting point with a named study area and valid latitude/longitude anywhere in the world; label coordinates as search seeds, not proof that NISAR products cover that footprint.
- [x] Add an in-browser local comparison tool for two user-selected NISAR browse-image files. Keep the comparison and evidence metadata local to the browser; do not upload files. Clearly state that previews are visual-only, do not decode/compute HDF5 science measurements, and do not estimate displacement.
- [x] Require product identifiers and acquisition dates in the evidence record, and allow the user to record product family and polarization/mode. Let the user download the resulting provenance note as JSON without embedding local image contents or inventing scientific values.
- [x] Keep the hackathon narrative compelling and understandable to non-specialists. Explain what changed, possible physical drivers, relevant band/polarization, who may be affected, and the limits of the evidence. Distinguish measured observations from hypotheses and contextual imagery.
- [x] Use Tailwind CSS v4 utility classes extensively in the new data and comparison experience, with responsive layouts, accessible labels/focus states, keyboard-operable controls, readable contrast, and reduced-motion support.
- [x] Provide a complete Data & Sources area with the provided NASA/ASF/CSA links and the exact required notice: “NASA does not endorse any non-U.S. Government entity and is not responsible for information contained on non-U.S. Government websites. For non-U.S. Government websites, participants must comply with any data use parameters of that specific website.”
- [x] Include the challenge-listed NASA Earthdata, ASF Vertex, NISAR User Guide, remote-sensing and SAR fundamentals, ARSET training, StoryMaps, application white papers, JPL UAVSAR postcards, CSA RCM/RADARSAT-1 and Python/QGIS tutorial, and CONAE SAOCOM catalogue/registration; identify partner missions separately from NISAR.
- [x] Document local launch instructions, sources, the NASA-versus-NISAR distinction, product maturity caveats, and the browse-preview/HDF5 boundary. Include an MIT license for project code and visible placeholders for the team name/GitHub repository; do not invent a team identity or repository.

## Explicit evidence limits
- [x] Do not claim the current illustrative Quetta story is verified by real NISAR/ASF measurements. Separately identify the sourced PROVISIONAL GUNW catalog match, its dates, browse image and footprint-intersection result. Do not state that the product demonstrates subsidence.
- [x] Do not claim the browser preview tool performs scientific processing of NISAR HDF5/GeoTIFF values or calculates displacement. A future analysis backend or specialized local processing workflow is needed for that.
- [x] Do not add other location stories with fabricated values or imply that a NISAR view is live when it is not.
- [ ] Full scientific HDF5/GeoTIFF processing, quantitative displacement estimation, uncertainty handling and validated multi-date interpretation remain a future feature; the current site makes no such claim.

## Cinematic visual redesign (November 15, 2026)
- [ ] Reshape the hero to match the supplied reference: panoramic orbital Earth weighted to the right, generous dark negative space for the headline, minimal navigation, refined editorial typography, and restrained teal/amber light. Use the headline “Earth is always in motion.” while keeping the exact tagline “Every place on Earth is dancing. We make you see the moves.”
- [ ] Make Earth visibly move with a gentle, continuous hero-art drift and a slow auto-rotating interactive Three.js globe in the explorer; preserve drag/touch/keyboard controls and honor `prefers-reduced-motion`.
- [ ] Add four distinct custom images—subsidence, glacier flow, flood/wetland, and fire/farming—each placed with the matching movement card; identify them as conceptual artwork, not NISAR measurements or NASA imagery, and retain the animated radar movement signatures.
- [ ] Keep the NISAR evidence desk, real ASF browse preview and scientific-limit disclaimers separate from the conceptual hero and movement images.
- [ ] Ensure the custom visual theme and generated imagery remain responsive and performant on desktop and mobile; retain readable contrast, accessible image descriptions/labels, and the existing source and data notices.
- [ ] Include local visual assets in the downloadable source and update the README with VS Code setup and any asset requirements. Keep Auto Publish off and do not deploy publicly.
