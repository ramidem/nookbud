type NoticeProps = {
  title?: string;
  children: React.ReactNode;
  /** `alert` is for real problems only (R19); everything else is a calm status message. */
  tone?: 'status' | 'alert' | 'success';
};

const tones = {
  status: 'bg-neutral-200 text-foreground',
  success: 'bg-tint-sage text-foreground',
  alert: 'border border-error bg-surface text-foreground',
};

/** A message about what just happened. Screen readers announce it when it appears. */
export function Notice({ title, children, tone = 'status' }: NoticeProps) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm leading-[1.5] ${tones[tone]}`}
      role={tone === 'alert' ? 'alert' : 'status'}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? 'mt-0.5' : ''}>{children}</div>
    </div>
  );
}
