import {
  Button,
  Divider,
  Field,
  PageContainer,
  PageHeader,
  Skeleton,
  Typography,
} from '@coparent/ui';
import { colors } from '@coparent/design-tokens';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <Typography variant="heading" as="h2" className="font-serif-bold text-2xl">
        {title}
      </Typography>
      {children}
    </section>
  );
}

function ColorSwatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 shrink-0 rounded-lg border border-divider"
        style={{ backgroundColor: value }}
      />
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="font-mono text-xs text-subtitle">{value}</p>
      </div>
    </div>
  );
}

function ColorGroup({
  title,
  swatches,
}: {
  title: string;
  swatches: { name: string; value: string }[];
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-subtitle">{title}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {swatches.map((s) => (
          <ColorSwatch key={s.name} name={s.name} value={s.value} />
        ))}
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <PageContainer className="max-w-6xl space-y-12 py-12">
      <div>
        <Typography variant="heading" as="h1" className="font-serif-bold text-4xl">
          Coparent Design System
        </Typography>
        <Typography className="mt-2 text-lg text-subtitle">
          Shared design tokens from{' '}
          <code className="rounded bg-neutral-200 px-1.5 py-0.5 text-sm">
            @coparent/design-tokens
          </code>{' '}
          and UI components from{' '}
          <code className="rounded bg-neutral-200 px-1.5 py-0.5 text-sm">@coparent/ui</code>
        </Typography>
      </div>

      <Divider />

      {/* Color Tokens */}
      <Section title="Color Tokens">
        <div className="space-y-8">
          <ColorGroup
            title="Brand"
            swatches={[
              { name: 'primary', value: colors.primary },
              { name: 'accent', value: colors.accent },
              { name: 'accent-soft', value: colors['accent-soft'] },
              { name: 'secondary', value: colors.secondary },
            ]}
          />
          <ColorGroup
            title="Semantic"
            swatches={[
              { name: 'background', value: colors.background },
              { name: 'foreground', value: colors.foreground },
              { name: 'surface', value: colors.surface },
              { name: 'divider', value: colors.divider },
              { name: 'subtitle', value: colors.subtitle },
              { name: 'placeholder', value: colors.placeholder },
              { name: 'muted', value: colors.muted },
              { name: 'overlay', value: colors.overlay },
              { name: 'sheet', value: colors.sheet },
            ]}
          />
          <ColorGroup
            title="Feedback"
            swatches={[
              { name: 'error', value: colors.error },
              { name: 'success', value: colors.success },
              { name: 'warning', value: colors.warning },
            ]}
          />
          <ColorGroup
            title="Neutral Scale"
            swatches={Object.entries(colors.neutral).map(([key, value]) => ({
              name: `neutral-${key}`,
              value,
            }))}
          />
        </div>
      </Section>

      <Divider />

      {/* Typography */}
      <Section title="Typography">
        <div className="space-y-4 rounded-xl border border-divider bg-surface p-6">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-subtitle">
              Heading — EB Garamond (serif)
            </p>
            <Typography variant="heading" as="h1" className="font-serif-bold text-4xl">
              The quick brown fox
            </Typography>
            <Typography variant="heading" as="h2" className="font-serif-semibold text-2xl">
              jumps over the lazy dog
            </Typography>
            <Typography variant="heading" as="h3" className="font-serif-medium text-xl">
              Pack my box with five dozen liquor jugs
            </Typography>
          </div>
          <Divider />
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-subtitle">
              Body — Inter (sans)
            </p>
            <Typography className="text-lg">
              Body large — The quick brown fox jumps over the lazy dog.
            </Typography>
            <Typography>Body base — Pack my box with five dozen liquor jugs.</Typography>
            <Typography className="text-sm text-subtitle">
              Body small — How vexingly quick daft zebras jump.
            </Typography>
          </div>
        </div>
      </Section>

      <Divider />

      {/* Buttons */}
      <Section title="Buttons">
        <div className="space-y-6 rounded-xl border border-divider bg-surface p-6">
          <div>
            <p className="mb-3 text-xs uppercase tracking-wider text-subtitle">Variants</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="md">Primary</Button>
              <Button variant="secondary" size="md">Secondary</Button>
              <Button variant="outlined" size="md">Outlined</Button>
              <Button variant="ghost" size="md">Ghost</Button>
              <Button variant="destructive" size="md">Destructive</Button>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs uppercase tracking-wider text-subtitle">Sizes</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs uppercase tracking-wider text-subtitle">States</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="md" isLoading>Loading</Button>
              <Button variant="primary" size="md" isDisabled>Disabled</Button>
              <Button variant="outlined" size="md" isDisabled>Disabled Outlined</Button>
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* Form Fields */}
      <Section title="Form Fields">
        <div className="max-w-lg space-y-4 rounded-xl border border-divider bg-surface p-6">
          <Field.Text label="Email" placeholder="you@example.com" isRequired />
          <Field.Text
            label="Display Name"
            placeholder="Jane Doe"
            subtitle="Visible to your co-parent"
          />
          <Field.Text label="With Error" defaultValue="bad input" error="This field is required" />
          <Field.Text label="Disabled" placeholder="Cannot edit" isDisabled />
          <Field.Area label="Notes" placeholder="Write something..." rows={4} />
        </div>
      </Section>

      <Divider />

      {/* Skeleton */}
      <Section title="Skeleton">
        <div className="max-w-lg space-y-3 rounded-xl border border-divider bg-surface p-6">
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </Section>

      <Divider />

      {/* Divider */}
      <Section title="Divider">
        <div className="rounded-xl border border-divider bg-surface p-6">
          <Typography>Content above</Typography>
          <Divider className="my-4" />
          <Typography>Content below</Typography>
        </div>
      </Section>

      <Divider />

      {/* Page Layout */}
      <Section title="PageHeader">
        <div className="rounded-xl border border-divider bg-surface p-6">
          <PageHeader
            title="Example Page"
            subtitle="This is how PageHeader renders"
            rightAction={<Button variant="primary" size="sm">Action</Button>}
          />
        </div>
      </Section>

      <div className="pb-12">
        <Divider className="my-8" />
        <Typography className="text-center text-sm text-subtitle">
          Built with libs/design-tokens + libs/ui
        </Typography>
      </div>
    </PageContainer>
  );
}
