import { Typography } from '@/components/atoms/Typography';
import { tw } from '@/tailwind';

type Props = {
  title: string;
};

export function SectionTitle({ title }: Props) {
  return (
    <Typography style={tw`font-serif-semibold mb-2 mt-6 text-lg`} variant="heading">
      {title}
    </Typography>
  );
}
