import { cn } from '../../utils/cn';

type Props = {
  className?: string;
};

export function Divider(props: Props) {
  const { className } = props;

  return <hr className={cn('h-px w-full border-0 bg-divider dark:bg-dark-divider', className)} />;
}
