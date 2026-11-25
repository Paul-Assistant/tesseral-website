# Aluminium rendering study

The interactive 09 switch now has a short fixed bearing and transverse axle, retaining the complete upper lever. Its environment reflection strength no longer changes artificially between poses.

Study 11 is an offline Cycles benchmark, not a claim that the existing Three.js renderer has become photorealistic. It has two rendered poses with a native switch for comparison. Study 10 remains available alongside it.

## Reproduce

Run from the repository root:

    blender -b --factory-startup -t 8 -P scripts/render-aluminium-study.py

The script writes PNGs to public/lab/aluminium-render and a complete scene to /tmp/tesseral-aluminium-study.blend. The website serves WebP conversions of the renders.

## What changed in the pipeline

- One metallic material family, fine directional roughness and bump; radial anisotropy on the machined dial cap.
- Real bevelled solids and modeled grip relief on both faces of the switch.
- Physical panel bores and flush inserts; controls cast shadows onto those inserts.
- Shared area lights, indirect illumination and a negative-fill studio card.
- 128-sample Cycles path tracing and denoising. No painted contact shadows or pose-dependent brightness.

## Research

Blender's Principled shader documentation describes metallic reflection, anisotropy and tangent direction:
https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/principled.html

The Glossy BSDF documentation explains microfacet reflection and directional metal highlights:
https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/glossy.html

## Remaining work

This benchmark does not provide continuous rotary interaction or an animated switch transition. It establishes a separately inspectable lighting/material target. A production implementation needs either rendered animation frames or a real-time renderer matched against this target, with mobile performance measured. Rendering choice alone does not guarantee photorealism; surface machining, geometry and reflection composition still need visual approval.
