CoParent = a tamper-resistant, verifiable record system for co-parenting.

Think:
👉 part timeline
👉 part evidence locker
👉 part coordination system

⸻

🧠 Core Product Definition

CoParent is a legally defensible record of co-parenting activity.

It must answer, with proof:
	•	What happened?
	•	When did it happen?
	•	Who did it?
	•	Was it acknowledged?
	•	Has it been altered?

⸻

⚖️ Core Principles (Court-Ready Design)
	1.	Immutability (no silent edits)
	2.	Traceability (full history)
	3.	Authenticity (who did what)
	4.	Integrity (data not tampered)
	5.	Exportability (usable in court)

If you nail these → you win.

⸻

🧱 System Architecture Overview

Entities
	•	Users (Parent A, Parent B)
	•	Children
	•	Entries (core record unit)
	•	Attachments
	•	Acknowledgments
	•	Disputes
	•	Audit Logs

⸻

🧩 Core Features (Extended)

1️⃣ Timeline (Evidence Feed)

Every action = immutable entry

Entry Types:
	•	Expense
	•	Event
	•	Agreement
	•	Communication (structured)
	•	Upload (media/documents)

Each entry includes:
	•	UUID
	•	timestamp (server-side)
	•	created_by
	•	child_id
	•	type
	•	content (JSON)
	•	attachments
	•	status (active, amended, disputed)

⸻

2️⃣ Audit Trail (CRITICAL)

Every change creates a new record, never overwrites.

Example:
	•	Entry v1 (original)
	•	Entry v2 (edited)
	•	Entry v3 (corrected)

Each includes:
	•	timestamp
	•	who edited
	•	diff of changes

👉 This is what makes it court defensible

⸻

3️⃣ Acknowledgment System

Entries can be:
	•	pending
	•	acknowledged
	•	disputed

Each action logs:
	•	user_id
	•	timestamp
	•	optional comment

⸻

4️⃣ Dispute Layer

Any entry can be flagged:
	•	dispute_reason
	•	counter-evidence upload
	•	threaded responses

👉 You’re capturing both sides of the story

⸻

5️⃣ Calendar (Responsibility Ledger)

Not just dates — responsibility mapping

Each event:
	•	assigned parent
	•	status (completed, missed)
	•	notes

Logs:
	•	who changed schedule
	•	when

⸻

6️⃣ Media & Document Storage

Supported:
	•	images (receipts, photos)
	•	PDFs (school docs, medical)
	•	videos (optional)

Each file:
	•	hashed (SHA-256)
	•	timestamped
	•	linked to entry

👉 proves file integrity

⸻

🔐 Security & Encryption (EXTENSIVE)

1️⃣ Data Encryption

At Rest
	•	AES-256 encryption for:
	•	database
	•	file storage

In Transit
	•	TLS 1.3 (HTTPS)

⸻

2️⃣ File Integrity

Each uploaded file:
	•	generate SHA-256 hash
	•	store hash with record

During export:
	•	re-verify hash

👉 proves file was not altered

⸻

3️⃣ Identity & Access
	•	email + password (hashed with bcrypt/argon2)
	•	optional 2FA (later)
	•	device/session tracking

⸻

4️⃣ Role-Based Access

Roles:
	•	Parent A
	•	Parent B
	•	Viewer (lawyer / court export)

Permissions:
	•	no deletion
	•	limited edits (with audit)

⸻

5️⃣ Tamper Resistance
	•	no hard delete
	•	soft delete only (visible in logs)
	•	all actions logged in audit_log table

⸻

6️⃣ Audit Log (separate system)

Every action logs:
	•	user_id
	•	action_type
	•	entity_id
	•	timestamp
	•	IP/device (optional)

⸻

📄 Court-Ready Export System (KILLER FEATURE)

1️⃣ Export Types

A. Timeline Report (PDF)

Includes:
	•	all entries
	•	timestamps
	•	authors
	•	status (acknowledged/disputed)
	•	attachments inline

⸻

B. Evidence Bundle (ZIP)

Contains:
	•	JSON data (machine-readable)
	•	PDF summary
	•	all attachments
	•	hash manifest file

⸻

C. Audit Report
	•	full edit history
	•	acknowledgment logs
	•	dispute logs

⸻

2️⃣ Export Features
	•	date range filter
	•	child filter
	•	entry type filter

⸻

3️⃣ Verification Layer

Include:
	•	file hashes
	•	export timestamp
	•	system signature (future: digital signing)

⸻

4️⃣ Formatting (important)

Readable by:
	•	lawyers
	•	judges
	•	non-technical people

👉 clean, chronological, labeled

⸻

🧠 Data Model (Simplified)

users
children
entries
entry_versions
attachments
acknowledgments
disputes
audit_logs


⸻

⚙️ MVP Scope (Court-Ready Version)

Must-have:
	•	timeline
	•	entries (all types)
	•	file uploads
	•	audit trail
	•	acknowledgment
	•	export (PDF + ZIP)

Nice-to-have later:
	•	digital signatures
	•	blockchain anchoring (optional, not needed early)
	•	lawyer access portal

⸻

🧠 UX Considerations

Neutral language

Avoid:
	•	“You owe”
	•	“Debt”

Use:
	•	“Recorded”
	•	“Submitted”
	•	“Acknowledged”

⸻

Conflict-aware UI
	•	no aggressive notifications
	•	no public “blame”

⸻

Simplicity

Even though backend is complex:
👉 frontend must feel simple

⸻

🧠 Competitive Advantage

Most apps:
	•	track expenses
	•	allow chat

You:
👉 create legally usable truth

⸻

🔥 Positioning

CoParent

“A secure, court-ready record system for co-parenting.”

⸻

🔥 Taglines
	•	“Document everything. Clearly.”
	•	“Shared records. Verified.”
	•	“When memory isn’t enough.”
	•	“Built for clarity. Ready for court.”

⸻

🧠 Final Insight (important)

You are not building:

👉 a productivity tool

You are building:

👉 a conflict-resolution infrastructure

If done right, this becomes:
	•	indispensable in disputes
	•	useful even in peaceful co-parenting

