import type { Metadata } from 'next';
import { TempFrame } from '../../temp-landing/TempFrame';
import { VariationOne } from '../../temp-landing/VariationOne';

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Nookbud — layout 1',
};

export default function TempLandingOnePage() {
  return (
    <TempFrame id="temp-landing-1">
      <VariationOne />
    </TempFrame>
  );
}
