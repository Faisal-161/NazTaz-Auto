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
