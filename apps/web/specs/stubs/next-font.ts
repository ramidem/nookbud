/** Stand-in for `next/font/google`, which is not a function under Vitest. */
const font = () => ({ className: '', variable: '--font-stub' });

export const Inter = font;
export const Source_Serif_4 = font;

export default new Proxy(
  {},
  {
    get: () => font,
  },
);
