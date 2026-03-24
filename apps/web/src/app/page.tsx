import {
  Button,
  Divider,
  Field,
  PageContainer,
  PageHeader,
  Typography,
} from '@coparent/ui';

export default function Index() {
  return (
    <PageContainer>
      <PageHeader title="Coparent Web" subtitle="Shared component library demo" />

      <div className="mt-8 space-y-6">
        <section className="space-y-3">
          <Typography variant="heading" as="h2" className="font-serif-bold text-xl">
            Typography
          </Typography>
          <Typography>Body text using Inter (sans).</Typography>
          <Typography variant="heading" as="h3" className="font-serif-semibold text-lg">
            Heading with EB Garamond (serif)
          </Typography>
        </section>

        <Divider />

        <section className="space-y-3">
          <Typography variant="heading" as="h2" className="font-serif-bold text-xl">
            Buttons
          </Typography>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="md">Primary</Button>
            <Button variant="outlined" size="md">Outlined</Button>
            <Button variant="ghost" size="md">Ghost</Button>
            <Button variant="secondary" size="md">Secondary</Button>
            <Button variant="destructive" size="md">Destructive</Button>
            <Button variant="primary" size="md" isLoading>Loading</Button>
          </div>
        </section>

        <Divider />

        <section className="max-w-md space-y-4">
          <Typography variant="heading" as="h2" className="font-serif-bold text-xl">
            Form Fields
          </Typography>
          <Field.Text label="Email" placeholder="you@example.com" isRequired />
          <Field.Text label="Name" placeholder="Jane Doe" subtitle="Your display name" />
          <Field.Text label="Error example" error="This field is required" />
          <Field.Area label="Notes" placeholder="Write something..." />
        </section>
      </div>
    </PageContainer>
  );
}
