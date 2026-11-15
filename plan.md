# Earth Choreographer — Cinematic Refresh Plan

## Goal and boundaries

Use the user-supplied reference image as the art direction: a panoramic orbital Earth against near-black space, the planet weighted to the right, generous headline space on the left, refined serif typography, and restrained mint/amber signals. Keep the existing NISAR data desk, ASF provenance, working explorer, map-source attribution, and scientific caveats intact. New visuals are editorial concept art only; none are NASA imagery, NISAR measurements, or location evidence.

## Implementation approach

1. Replace the hero's oversized brand-name heading with “Earth is always in motion.” and retain the exact tagline “Every place on Earth is dancing. We make you see the moves.” Use one wide, custom orbital hero image with dark gradient layers and a very slow parallax drift.
2. Keep the Three.js globe in the Explore section as the interactive Earth. Make its axial/orbit rotation more noticeable but still slow, honor `prefers-reduced-motion`, and preserve drag, keyboard and zoom controls.
3. Give each of the four movement stories—subsidence, glacier flow, flood/wetland, and fire/farming—its own distinct editorial concept image. Keep the animated `MoveMark` signatures, mark every generated visual as concept art, and label the set “Illustrative artwork — not NISAR or NASA data.”
4. Refine navigation labels and the NISAR data-desk call-to-action to match the reference while keeping a visible route to all current project sections. Maintain mobile layouts and contrast.
5. Use the exact managed-image paths returned by the image tool in Cloud Preview. For the downloadable VS Code project, save local copies in `public/assets/` and select them on localhost so the source package remains visually complete without the hosted storage resolver.

## Design system

- **Design movement:** cinematic space editorial, borrowing the calm scale and asymmetrical Earth composition of the supplied website reference.
- **Core principles:** one commanding visual focal point; preserve negative space; express motion through slow physical-feeling animation; separate evocative concept art from actual Earth-observation evidence.
- **Color philosophy:** near-black/navy creates orbital depth; mint/teal signals radar and living systems; warm amber marks human impact and observation points; warm ivory keeps large editorial type legible.
- **Layout paradigm:** a panoramic, off-centre hero followed by quieter, long-form editorial sections; movement images sit in a four-part field guide, and evidence remains in its separate, tool-like NISAR desk.
- **Signature elements:** thin atmospheric rim light; small numbered field-note markers; restrained orbital/radar pulses.
- **Interaction philosophy:** calm and intentional; the hero drifts subtly while the actual 3D globe can be rotated directly; controls remain operable by keyboard and touch.
- **Animation:** slow, non-looping-feeling hero pan/scale at a long interval; low-speed globe auto-rotation; retain the existing concise card and reveal animations. Disable continuous movement under reduced-motion preference.
- **Typography system:** Playfair Display for large editorial headlines and story titles; DM Sans for navigation, interface, and explanatory text; compact tracked labels for field-note metadata.
- **Brand essence:** an accessible, cinematic guide to how Earth's surface changes, for curious public audiences and hackathon judges; distinctive, credible, exploratory.
- **Brand voice:** poetic at section openings, precise in data notes. Examples: “Earth is always in motion.” “A browse image is a clue—not a displacement measurement.”
- **Wordmark & logo:** keep the existing custom orbital SVG mark and spaced Earth Choreographer wordmark.
- **Signature brand color:** the existing luminous mint `#83dfc2`.

## Project structure

- `src/App.tsx`: hero, navigation, movement-story cards, and section assembly.
- `src/components/EarthGlobe.tsx`: interactive, slowly rotating Three.js globe used in Explore.
- `src/components/MoveMark.tsx`: existing animated radar-style signatures kept atop their dedicated concept artwork.
- `src/components/NisarWorkbench.tsx` and `NisarSampleRecord.tsx`: preserved scientific data discovery, sourced ASF sample, and local comparison tool.
- `src/index.css` and `src/globe.css`: responsive hero, image cards, motion, reduced-motion, and globe presentation.
- `public/assets/`: generated artwork for the web experience and the existing Blue Marble/ASF source images.
- `README.md`: local prerequisites, VS Code commands, asset behavior, and scientific boundaries.

## Dependencies and serving

Reuse the existing React, TypeScript, Vite, Tailwind CSS v4, Framer Motion, and Three.js dependencies. No backend or new runtime package is required. Keep the website on its existing Vite port 3000 and leave `public/manus-routes.json` as the single home-page route. Preserve the current private/unpublished project setting; do not publish publicly.