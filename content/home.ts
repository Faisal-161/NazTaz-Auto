export const home = {
  hero: {
    eyebrow: 'Custom puddle lights',
    /** One line per visual line of the headline (condensed display, uppercase). */
    heading: ['Your name.', 'On the ground.', 'Every time', 'the door opens.'],
    /** The line that lights up. Index into `heading`. */
    glowLine: 1,
    intro:
      'Glass-etched lenses that plug into your factory connector. Pick your car, confirm the housing with a photo, and see your design glowing before you buy.',
    primaryCta: 'Find my fit',
    secondaryCta: 'Preview your design',
    /** Plain facts, not stats. */
    facts: [
      'Glass-etched, never fades',
      'Plugs into the factory connector',
      'Proof before we engrave',
    ],
    /** Text drawn on the ground in the scene. */
    projection: 'ALEX & JORDAN',
    projectionSub: 'EST. 2026',
  },
} as const
