import type { Metadata } from 'next';
import { TempFrame } from '../../temp-landing/TempFrame';
import { VariationTwo } from '../../temp-landing/VariationTwo';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Nookbud — layout 2',
};

export default function TempLandingTwoPage() {
  return (
    <TempFrame id="temp-landing-2">
      <VariationTwo />
    </TempFrame>
  );
}
