import { cn } from '../../utils/cn';

type Props = {
  className?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
};

export function Skeleton(props: Props) {
  const { children, className, isLoading = true } = props;

  if (!isLoading) return <>{children}</>;

  return (
    <div
      aria-busy="true"
      className={cn('animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800', className)}
    >
      {children && <div className="invisible">{children}</div>}
    </div>
  );
}
