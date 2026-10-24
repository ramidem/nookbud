export type Guideline = { title: string; rules: string[] };

export const guidelines: Guideline[] = [
  {
    rules: [
      'Write short sentences, one idea at a time.',
      'Address the parent as "you", never "parents" or "users".',
      'Be present and useful, not dramatic, saccharine or clinical: "Added. Both parents can see it."',
      'Alert titles are descriptive phrases ("Verification Failed"), never "Error".',
      'No emoji as decoration; icons carry meaning.',
    ],
    title: 'Voice',
  },
  {
    rules: [
      'Page background is `background`, cards and inputs `surface`, text `foreground`, secondary text `subtitle`.',
      '`primary` for the one main action and active states; `accent` for small warmth highlights.',
      '`error` only for genuine alerts and destructive actions. Pair every status color with a word or icon.',
      'Use the `neutral-*` scale for tinted containers; never cool grays.',
    ],
    title: 'Color',
  },
  {
    rules: [
      'Headings in EB Garamond (`page-title`, `section-header`, `nav-title`).',
      'Everything else in Inter: body, labels, buttons, inputs, data values, captions.',
      'Never set body copy, buttons or labels in the serif.',
    ],
    title: 'Type',
  },
  {
    rules: [
      'Inputs and cards `radius-xl`; buttons, avatars and chips `radius-full`; sheets `radius-3xl`.',
      'Use the 4px spacing scale; `space-4` is the standard padding.',
      'Borders before shadows; `shadow-sm` only on entry cards.',
      'Disabled controls drop to 40% opacity.',
    ],
    title: 'Shape & space',
  },
  {
    rules: [
      'White text on `primary` (3.6:1) and `error` (3.8:1) misses 4.5:1: use it for 16px+ medium labels only.',
      '`subtitle` has no dark value and drops below 4.5:1 in dark: use `foreground` for dark body text.',
      '`placeholder`, `accent` and `accent-soft` are decorative only.',
    ],
    title: 'Contrast',
  },
];
