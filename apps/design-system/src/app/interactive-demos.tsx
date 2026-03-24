'use client';

import {
  Avatar,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Divider,
  Label,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToastProvider,
  Typography,
  useToast,
} from '@coparent/ui';

function ToastDemo() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary" size="sm" onClick={() => toast('This is a default toast')}>
        Default
      </Button>
      <Button variant="primary" size="sm" onClick={() => toast('Operation successful!', 'success')}>
        Success
      </Button>
      <Button variant="destructive" size="sm" onClick={() => toast('Something went wrong', 'error')}>
        Error
      </Button>
      <Button variant="secondary" size="sm" onClick={() => toast('Heads up!', 'warning')}>
        Warning
      </Button>
    </div>
  );
}

export function InteractiveDemos() {
  return (
    <ToastProvider>
      {/* Card */}
      <section className="space-y-4">
        <Typography variant="heading" as="h2" className="font-serif-bold text-2xl">
          Card
        </Typography>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Manage your co-parenting schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography className="text-sm">Next handoff: Monday at 5:00 PM</Typography>
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="sm">View Calendar</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
              <CardDescription>Track shared expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography className="text-sm">3 pending items totaling $245.00</Typography>
            </CardContent>
            <CardFooter>
              <Button variant="outlined" size="sm">Review</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <Divider />

      {/* Badge */}
      <section className="space-y-4">
        <Typography variant="heading" as="h2" className="font-serif-bold text-2xl">
          Badge
        </Typography>
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Approved</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="destructive">Disputed</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      <Divider />

      {/* Avatar */}
      <section className="space-y-4">
        <Typography variant="heading" as="h2" className="font-serif-bold text-2xl">
          Avatar
        </Typography>
        <div className="flex items-center gap-4">
          <Avatar alt="Jane Doe" fallback="JD" />
          <Avatar alt="Med Aduh" fallback="MA" className="h-12 w-12" />
          <Avatar alt="No Image" />
          <Avatar
            alt="With Image"
            src="https://api.dicebear.com/9.x/initials/svg?seed=CP"
            className="h-14 w-14"
          />
        </div>
      </section>

      <Divider />

      {/* Tabs */}
      <section className="space-y-4">
        <Typography variant="heading" as="h2" className="font-serif-bold text-2xl">
          Tabs
        </Typography>
        <Tabs defaultValue="schedule">
          <TabsList>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          <TabsContent value="schedule">
            <Card>
              <CardContent className="pt-6">
                <Typography className="text-sm">Your weekly schedule appears here.</Typography>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="expenses">
            <Card>
              <CardContent className="pt-6">
                <Typography className="text-sm">Shared expenses and reimbursements.</Typography>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="messages">
            <Card>
              <CardContent className="pt-6">
                <Typography className="text-sm">Co-parent communication log.</Typography>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <Divider />

      {/* Select */}
      <section className="space-y-4">
        <Typography variant="heading" as="h2" className="font-serif-bold text-2xl">
          Select
        </Typography>
        <div className="max-w-sm">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a child" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emma">Emma</SelectItem>
              <SelectItem value="liam">Liam</SelectItem>
              <SelectItem value="olivia">Olivia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <Divider />

      {/* Checkbox, Switch, RadioGroup */}
      <section className="space-y-4">
        <Typography variant="heading" as="h2" className="font-serif-bold text-2xl">
          Form Controls
        </Typography>
        <div className="max-w-lg space-y-6 rounded-xl border border-divider bg-surface p-6">
          <div>
            <p className="mb-3 text-xs uppercase tracking-wider text-subtitle">Checkbox</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox id="notify" defaultChecked />
                <Label htmlFor="notify">Send notifications</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="share" />
                <Label htmlFor="share">Share calendar with co-parent</Label>
              </div>
            </div>
          </div>
          <Divider />
          <div>
            <p className="mb-3 text-xs uppercase tracking-wider text-subtitle">Switch</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="darkmode">Dark mode</Label>
                <Switch id="darkmode" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reminders">Reminders</Label>
                <Switch id="reminders" defaultChecked />
              </div>
            </div>
          </div>
          <Divider />
          <div>
            <p className="mb-3 text-xs uppercase tracking-wider text-subtitle">Radio Group</p>
            <RadioGroup defaultValue="week">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="day" id="day" />
                <Label htmlFor="day">Day view</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="week" id="week" />
                <Label htmlFor="week">Week view</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="month" id="month" />
                <Label htmlFor="month">Month view</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </section>

      <Divider />

      {/* Alert */}
      <section className="space-y-4">
        <Typography variant="heading" as="h2" className="font-serif-bold text-2xl">
          Alert
        </Typography>
        <div className="space-y-3">
          {/* Using raw Alert markup since it's not a client component */}
          <div className="relative w-full rounded-xl border border-divider bg-surface p-4 text-sm text-foreground">
            <h5 className="mb-1 font-semibold leading-none">Heads up</h5>
            <div className="text-sm opacity-90">Schedule changes require both parents to approve.</div>
          </div>
          <div className="relative w-full rounded-xl border border-success/50 bg-success/10 p-4 text-sm text-success">
            <h5 className="mb-1 font-semibold leading-none">Approved</h5>
            <div className="text-sm opacity-90">The schedule change has been approved by both parents.</div>
          </div>
          <div className="relative w-full rounded-xl border border-warning/50 bg-warning/10 p-4 text-sm text-foreground">
            <h5 className="mb-1 font-semibold leading-none">Pending</h5>
            <div className="text-sm opacity-90">Waiting for your co-parent to review.</div>
          </div>
          <div className="relative w-full rounded-xl border border-error/50 bg-error/10 p-4 text-sm text-error">
            <h5 className="mb-1 font-semibold leading-none">Disputed</h5>
            <div className="text-sm opacity-90">This expense has been flagged for review.</div>
          </div>
        </div>
      </section>

      <Divider />

      {/* Table */}
      <section className="space-y-4">
        <Typography variant="heading" as="h2" className="font-serif-bold text-2xl">
          Table
        </Typography>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Mar 20</TableCell>
                <TableCell>School supplies</TableCell>
                <TableCell>$45.00</TableCell>
                <TableCell><Badge variant="success">Approved</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Mar 18</TableCell>
                <TableCell>Soccer registration</TableCell>
                <TableCell>$120.00</TableCell>
                <TableCell><Badge variant="warning">Pending</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Mar 15</TableCell>
                <TableCell>Doctor visit copay</TableCell>
                <TableCell>$30.00</TableCell>
                <TableCell><Badge variant="destructive">Disputed</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Mar 10</TableCell>
                <TableCell>Groceries</TableCell>
                <TableCell>$85.50</TableCell>
                <TableCell><Badge variant="success">Approved</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </section>

      <Divider />

      {/* Breadcrumb */}
      <section className="space-y-4">
        <Typography variant="heading" as="h2" className="font-serif-bold text-2xl">
          Breadcrumb
        </Typography>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Expenses</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>March 2026</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </section>

      <Divider />

      {/* Pagination */}
      <section className="space-y-4">
        <Typography variant="heading" as="h2" className="font-serif-bold text-2xl">
          Pagination
        </Typography>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>

      <Divider />

      {/* Toast */}
      <section className="space-y-4">
        <Typography variant="heading" as="h2" className="font-serif-bold text-2xl">
          Toast
        </Typography>
        <div className="rounded-xl border border-divider bg-surface p-6">
          <p className="mb-3 text-xs uppercase tracking-wider text-subtitle">Click to trigger</p>
          <ToastDemo />
        </div>
      </section>
    </ToastProvider>
  );
}
