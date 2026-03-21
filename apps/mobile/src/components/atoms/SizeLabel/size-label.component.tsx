import { Typography } from '@/components/atoms/Typography';
import { tw } from '@/tailwind';

type Props = {
  label: string;
};

export function SizeLabel({ label }: Props) {
  return (
    <Typography style={tw`text-subtitle mb-1 text-xs uppercase tracking-wide`}>{label}</Typography>
  );
}
