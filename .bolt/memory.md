# Project memory

## Product intent & audience

- Educational word-building game where children build simple words (e.g. "cat") from alphabet letters.
- Flip-book interaction model: pages flip to reveal letter cards or prompts.
- Likely audience: young children (early literacy / spelling practice).

## Brand personality & voice

- Playful, kid-friendly; a mascot/helper character named "Hoppy" delivers instructions.

## Visual design & UX direction

- Flip-book metaphor: spiral-bound book with visible page rings, colorful letter cards on pages.
- Visible, labelled flip controls (Back / Flip arrows) must be clearly accessible.
- Instructions panel kept below the game area, not overlapping letters or controls.
- Letters and answer buttons should resize to available space.
- Responsive targets: portrait phones, landscape phones, tablets — no overflow or hidden elements.
- User provided sample images as a visual target; match that aesthetic as closely as possible (images not available to system — rely on described style).

## Decisions, constraints & rationale

- Bug fixes addressed: overlapping instructions hiding letters; missing/blank flip page controls; general UI/UX quality.
- Layout approach: keep instructions separated from game canvas rather than absolutely positioned over letters.
- Flip controls made explicit and labelled rather than implied by gesture alone.
- Could not visually verify on real device or compare directly to uploaded sample images.

## Open questions & assumptions

- Exact sample-image design details are unknown (images uploaded by user but not accessible to system); matching is approximate.
- Target age range and difficulty progression not yet specified.
- Full word list / curriculum scope not defined.
- Platform targets (web only? native wrapper?) not confirmed.