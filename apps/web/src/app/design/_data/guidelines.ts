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
      'Pastel cards use the `tint-*` tokens, all mixed from the brand colors; `tint-sage-bold` is for the one high-emphasis banner on a page.',
      'A dark band (`neutral-900`) can carry the hero, at most once per page.',
    ],
    title: 'Color',
  },
  {
    rules: [
      'Inter everywhere: headings, body, labels, buttons, inputs, captions. There is no serif.',
      'Headings are weight 600 with tight leading; display sizes take negative letter spacing (-2px to -0.5px).',
      'Body is 16px at 1.55 line height; buttons and labels 14px at weight 500.',
    ],
    title: 'Type',
  },
  {
    rules: [
      'Buttons and inputs `radius-lg` (8px). Buttons are rectangles, never pills. The main button is `foreground` with `background` text.',
      'Every card `radius-xl` (12px). `radius-full` only for status badges, pill tabs and avatars.',
      'Use the 4px spacing scale with 8px as the main step; cards pad `space-6`, feature cards `space-8`.',
      'Borders before shadows: flat cards have a hairline and no shadow. `shadow-mockup` only for the product mockup on the hero band.',
      'Disabled buttons use the `disabled` fill with a `placeholder` label.',
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
