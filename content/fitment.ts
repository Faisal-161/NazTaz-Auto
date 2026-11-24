import type { FitBadge } from '@/lib/fitment'

/** Fit badge copy. Shown on product cards, PDP and the finder result. */
export const fitBadges: Record<FitBadge, { label: string; description: string }> = {
  verified: {
    label: 'Verified fit',
    description: 'Confirmed on this vehicle and housing by real installs or the OEM part number.',
  },
  likely: {
    label: 'Likely fit',
    description: 'Same housing as confirmed vehicles. Check the housing photo before you order.',
  },
  check: {
    label: 'Check fit',
    description:
      'Not confirmed yet. Compare the housing photo or send us a photo and we will check.',
  },
}

/** Fit finder (/fitment). Plain, specific language: say what to look at, not how great it is. */
export const finder = {
  meta: {
    title: 'Find lights that fit your vehicle',
    description:
      'Confirm the exact puddle light housing on your vehicle in a few taps, then see the lights that plug straight in.',
  },
  eyebrow: 'Fit finder',
  title: 'Find the lights that fit your car',
  intro:
    'Four quick steps. We match your vehicle to its exact light housing, so the lights plug into the factory connector with no guessing and no emailing photos back and forth.',
  steps: {
    factory: { n: '01', title: 'Factory puddle lights', summaryEmpty: 'Not answered' },
    vehicle: {
      n: '02',
      title: 'Your vehicle',
      summaryEmpty: 'Year, make, model',
      skipped: 'Not needed for wireless lights',
    },
    housing: {
      n: '03',
      title: 'Light housing',
      summaryEmpty: 'Matched to your vehicle',
      skipped: 'No housing needed',
      byPart: (pn: string) => `From part number ${pn}`,
    },
    result: { n: '04', title: 'Your lights' },
  },
  edit: 'Change',
  editLabel: (step: string) => `Change ${step}`,

  factory: {
    question: 'Does your car project light on the ground when a door opens?',
    help: 'Open a door at night and look down. Most factory lights sit under the door panel or the side mirror.',
    options: {
      yes: {
        label: 'Yes, it has them',
        hint: 'We replace the factory light. It plugs straight in.',
      },
      no: {
        label: 'No lights',
        hint: 'Our wireless lights stick on. No wiring needed.',
      },
      unsure: {
        label: 'Not sure',
        hint: 'No problem. We will help you check in the next step.',
      },
    },
  },

  vehicle: {
    year: 'Year',
    make: 'Make',
    model: 'Model',
    generation: 'Generation',
    trim: 'Trim',
    choose: (field: string) => `Select ${field.toLowerCase()}`,
    trimOther: 'My trim is not listed',
    generationHelp: 'Your model changed design during this year. Pick the one on your car.',
    trimHelp:
      'Factory lights depend on the trim. It is on your registration or the back of the car.',
    unsureTitle: 'Not sure if you have factory lights?',
    unsureBody:
      'Look at the bottom of each front door, and under each side mirror. A small clear or frosted lens there is a factory light.',
    unsureShowHousings: 'Show me the housings',
    unsureNoLights: 'I checked, there are none',
  },

  housing: {
    question: 'Which one is on your car?',
    help: 'Compare the shape and the connector. Tap the one that matches.',
    housingPhoto: 'Housing',
    connectorPhoto: 'Connector',
    location: { door: 'Under the door', mirror: 'Under the mirror', tailgate: 'Tailgate' },
    code: 'Housing',
    partNumbers: 'OEM part no.',
    select: (name: string) => `This one: ${name}`,
    selected: 'Selected',
  },

  result: {
    confirmed: 'Confirmed',
    savedToGarage: 'Saved to My Garage',
    savedHint: 'The whole site now shows lights for this vehicle.',
    housing: 'Housing',
    productsTitle: 'Lights that fit',
    productsEmpty: 'No lights for this housing yet. Universal lights below work on any car.',
    universalTitle: 'Wireless lights for your car',
    universalBody:
      'Your car has no factory puddle lights, so the wireless lights are the right pick. They stick under the door and turn on when it opens.',
    universalTrimBody:
      'That trim did not come with factory puddle lights. The wireless lights work on any car.',
    designCta: 'Design your lights',
    shopCta: 'See all lights',
    restart: 'Start over',
    from: 'From',
    shipsAfterProof: (days: number) => `Ships ${days} days after proof approval`,
    view: 'View',
  },

  noMatch: {
    title: 'We do not have that vehicle listed yet',
    body: 'You can still confirm the fit. Use one of the options below, or go with the wireless lights.',
  },

  alt: {
    title: 'Other ways to confirm',
    subtitle: 'Already know your part number or VIN?',
    tabs: { part: 'Part no.', vin: 'VIN', photo: 'Photo' },
    part: {
      label: 'OEM part number',
      placeholder: 'e.g. 5L3Z-13A776-A',
      help: 'Printed on the back of the old light or in your parts catalogue.',
      tooShort: 'Type at least 4 characters.',
      none: 'No housing found for that part number. Send us a photo and we will check.',
      exact: 'Exact match',
      prefix: 'Partial match',
      use: 'Use this housing',
    },
    vin: {
      label: 'VIN (17 characters)',
      placeholder: '1FTFW1E50NFA00000',
      help: 'Bottom of the windshield on the driver side, or your registration card.',
      submit: 'Look up',
      checking: 'Looking up…',
      errors: {
        length: 'A VIN has 17 characters.',
        characters: 'VINs never contain the letters I, O or Q.',
        check_digit: 'That VIN does not look right. Check for a typo.',
        lookup: 'We could not decode that VIN. Pick your vehicle above instead.',
        network: 'The VIN service is not responding. Pick your vehicle above instead.',
      },
      found: (label: string) => `Found: ${label}`,
      notListed: (label: string) =>
        `Found: ${label}. That vehicle is not in our list yet: send a photo and we will check.`,
    },
    photo: {
      label: 'Photo of your light housing',
      help: 'A clear photo of the light under the door or mirror, ideally with the connector visible. JPG or PNG, up to 10 MB.',
      submit: 'Send for review',
      sent: 'Thanks! We will check your photo and email you within one business day.',
      tooBig: 'That file is over 10 MB.',
      wrongType: 'Please send a JPG, PNG or HEIC photo.',
      email: 'Email for our reply',
      emailInvalid: 'Enter a valid email address.',
      note: 'Preview only: in this demo the photo stays in your browser.',
    },
  },
} as const
