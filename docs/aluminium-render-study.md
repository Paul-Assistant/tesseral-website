# Aluminium control study 11

Study 11 uses the approved Cycles materials rendered into animation atlases. The interactive controls are a rotary dial, Voice/Type particle selectors, and an anchored power lever. Earlier studies remain separate.

## Rendering

- The approved metallic node settings, fine directional roughness, brushing and radial anisotropy are retained.
- The original studio rig is expanded in proportion to the wider four-seat arrangement, preserving angular softbox sizes and illumination.
- 49 knob poses cover 270 degrees; a small position index makes rotation legible. The switch has 33 intermediate poses.
- Every pose includes physically rendered contact and cast shadows on the panel and flush inserts. The switch crop covers its full off-state shadow. Feathered atlas boundaries avoid denoising seams.
- Voice and Type particles sample colors from two aluminium domes rendered in the same scene. Their shadow mattes are derived from those renders. The particle deformation itself is a live Canvas2D approximation, not live path tracing.

## Interaction

- Drag the knob horizontally, or use arrow keys, Shift+arrow, Page Up/Down, Home and End.
- Tap the physical switch to reverse its travel from the current pose.
- Select Voice or Type to transfer the particles. Arriving material swells, then reveals the particle glyph. Repeated presses add waves without restarting the motion; a pending selection is queued smoothly.
- Hover retains fine scatter and directional attraction. Idle grains remain subtly alive.
- All controls fit one row on mobile. The native hit areas remain at least 44px. Vertical scrolling is preserved.
- Assets load near the viewport. Drawing stops offscreen or while the page is hidden; reduced motion is respected.

These are UI study controls, not microphone capture or a backend service switch. The metal animations use discrete rendered poses, with eased playback. The particle highlights are sampled approximations during deformation.

## Reproduce

From the repository root:

    blender -b --factory-startup -t 8 -P scripts/render-aluminium-study.py
    blender -b --factory-startup -t 8 -P scripts/render-interactive-aluminium.py
    node scripts/pack-aluminium.mjs

The first script saves the source scene to /tmp/tesseral-aluminium-study.blend. The interactive script reconstructs it if missing. PNG intermediates are ignored; the site serves compact WebP atlases and geometry.json.

## Research

Blender Principled metal and anisotropy documentation:
https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/principled.html

Microfacet metal reflections:
https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/glossy.html
