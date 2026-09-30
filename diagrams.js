// All UML diagrams for the Facturo marketplace, as Mermaid source strings.
// Import with: import { diagrams } from './diagrams.js';
// Do NOT edit these strings inside HTML. Render them with mermaid.render().

export const diagrams = [
  {
    id: 'usecase',
    title: 'Use case diagram',
    code: `flowchart LR
  V([Visitor]) --> U1[View public pages]
  V --> U2[Register or Login]
  V --> U3[Browse open jobs]

  C([Client]) --> C1[Post a job]
  C --> C2[Edit or close a job]
  C --> C3[Review proposals]
  C --> C4[Accept or reject proposal]
  C --> C5[Message freelancer]
  C --> C6[Approve work]
  C --> C7[Pay invoice]
  C --> C8[Leave a review]

  F([Freelancer]) --> F1[Manage profile and skills]
  F --> F2[Search jobs]
  F --> F3[Send proposal]
  F --> F4[Withdraw proposal]
  F --> F5[Track time on contract]
  F --> F6[Create and send invoice]
  F --> F7[Export invoice PDF]
  F --> F8[Leave a review]

  A([Admin]) --> A1[Manage users]
  A --> A2[Moderate jobs]
  A --> A3[Manage categories]

  S([System]) --> S1[Mark overdue invoices]
  S --> S2[Send notifications and reminders]`,
  },

  {
    id: 'class',
    title: 'Class diagram',
    expectedClasses: 15,
    code: `classDiagram
  class User {
    +int id
    +string name
    +string email
    +string password
    +Role role
    +register()
    +login()
    +logout()
  }
  class FreelancerProfile {
    +int id
    +string title
    +text bio
    +decimal hourlyRate
    +string skills
    +string country
    +updateProfile()
  }
  class ClientProfile {
    +int id
    +string company
    +string phone
    +string country
    +updateProfile()
  }
  class Category {
    +int id
    +string name
  }
  class Job {
    +int id
    +string title
    +text description
    +decimal budgetMin
    +decimal budgetMax
    +date deadline
    +JobStatus status
    +publish()
    +close()
    +cancel()
  }
  class Proposal {
    +int id
    +text coverLetter
    +decimal price
    +int deliveryDays
    +string status
    +submit()
    +withdraw()
    +accept()
    +reject()
  }
  class Contract {
    +int id
    +decimal agreedPrice
    +string billingType
    +decimal hourlyRate
    +date startDate
    +string status
    +complete()
    +cancel()
  }
  class TimeEntry {
    +int id
    +datetime startedAt
    +datetime endedAt
    +int minutes
    +string description
    +bool billed
    +start()
    +stop()
  }
  class Invoice {
    +int id
    +string number
    +date issueDate
    +date dueDate
    +decimal subtotal
    +decimal taxRate
    +decimal total
    +string status
    +calculateTotal()
    +send()
    +markPaid()
    +exportPdf()
  }
  class InvoiceItem {
    +int id
    +string description
    +decimal quantity
    +decimal unitPrice
    +decimal amount
  }
  class Payment {
    +int id
    +decimal amount
    +date paidAt
    +string method
  }
  class Message {
    +int id
    +text body
    +datetime sentAt
    +bool isRead
  }
  class Review {
    +int id
    +int rating
    +text comment
  }
  class Role {
    <<enumeration>>
    client
    freelancer
    admin
  }
  class JobStatus {
    <<enumeration>>
    draft
    open
    in_progress
    completed
    cancelled
  }

  User "1" -- "0..1" FreelancerProfile : has
  User "1" -- "0..1" ClientProfile : has
  User "1" --> "*" Job : posts
  Category "1" --> "*" Job : classifies
  Job "1" --> "*" Proposal : receives
  User "1" --> "*" Proposal : sends
  Proposal "1" --> "0..1" Contract : becomes
  Contract "1" --> "*" TimeEntry : logs
  Contract "1" --> "*" Invoice : billed by
  Invoice "1" *-- "1..*" InvoiceItem : contains
  Invoice "1" --> "*" Payment : settled by
  TimeEntry "*" --> "0..1" InvoiceItem : billed in
  Contract "1" --> "*" Message : discussion
  User "1" --> "*" Message : writes
  Contract "1" --> "*" Review : receives
  User "1" --> "*" Review : writes
  User ..> Role : has role
  Job ..> JobStatus : has status`,
  },

  {
    id: 'seq-hiring',
    title: 'Sequence diagram: from job to hiring',
    code: `sequenceDiagram
  autonumber
  actor C as Client
  actor F as Freelancer
  participant W as Web App
  participant API as Laravel API
  participant DB as Database
  participant N as Notification service

  C->>W: Fill the job form
  Note right of C: title = Build a logo, budget = 200 to 400 USD, deadline = 2026-11-30
  W->>API: POST /api/jobs
  API->>API: Validate data and check role is client
  API->>DB: INSERT job with status open
  DB-->>API: job id = 12
  API-->>W: 201 Created, job 12
  W-->>C: Job published

  F->>W: Browse open jobs
  W->>API: GET /api/jobs?status=open
  API->>DB: SELECT open jobs
  DB-->>API: List of jobs
  API-->>W: 200 OK, jobs list
  F->>W: Open job 12 and submit proposal
  Note right of F: price = 300, deliveryDays = 7, coverLetter = I can deliver in a week
  W->>API: POST /api/jobs/12/proposals
  API->>API: Check role is freelancer and no earlier proposal
  API->>DB: INSERT proposal with status pending
  API->>N: Notify client of new proposal
  N-->>C: Email and in-app notification
  API-->>W: 201 Created, proposal 40

  C->>W: Open proposals of job 12
  W->>API: GET /api/jobs/12/proposals
  API-->>W: 200 OK, proposals list
  C->>W: Accept proposal 40
  W->>API: POST /api/proposals/40/accept
  API->>DB: Proposal 40 accepted, other proposals rejected
  API->>DB: INSERT contract with agreedPrice 300, status active
  API->>DB: UPDATE job 12 to in_progress
  API->>N: Notify freelancer and rejected candidates
  N-->>F: You are hired
  API-->>W: 200 OK, contract 7`,
  },

  {
    id: 'seq-billing',
    title: 'Sequence diagram: work, invoice and payment',
    code: `sequenceDiagram
  autonumber
  actor F as Freelancer
  actor C as Client
  participant W as Web App
  participant API as Laravel API
  participant DB as Database
  participant PDF as PDF service
  participant M as Mail queue

  F->>W: Start timer on contract 7
  W->>API: POST /api/contracts/7/time-entries
  Note right of F: startedAt = 09:00, description = Logo sketches
  API->>DB: INSERT time entry, billed = false
  API-->>W: 201 Created, entry 88
  F->>W: Stop timer
  W->>API: POST /api/time-entries/88/stop
  API->>DB: UPDATE endedAt and minutes = 120
  API-->>W: 200 OK

  F->>W: Create invoice from unbilled entries
  W->>API: POST /api/contracts/7/invoices
  Note right of F: entries = 88 and 89, dueDate = 2026-12-15, taxRate = 19
  API->>DB: SELECT unbilled entries of contract 7
  DB-->>API: Entries 88 and 89
  API->>API: calculateTotal, subtotal = 300, tax = 57, total = 357
  API->>DB: INSERT invoice draft and items, entries billed = true
  API-->>W: 201 Created, invoice 15

  F->>W: Send invoice
  W->>API: POST /api/invoices/15/send
  API->>PDF: Generate PDF for invoice 15
  PDF-->>API: invoice-2026-0001.pdf
  API->>DB: UPDATE invoice status sent
  API->>M: Queue email with PDF
  M-->>C: Invoice email
  API-->>W: 200 OK

  C->>W: Pay invoice 15
  W->>API: POST /api/invoices/15/payments
  Note right of C: amount = 357, method = card
  API->>DB: INSERT payment, UPDATE invoice status paid
  API->>M: Queue receipt and notify freelancer
  M-->>F: Invoice paid
  API-->>W: 201 Created, payment 3

  alt Due date passed without payment
    API->>DB: Scheduler sets status overdue
    API->>M: Send reminder to client
    M-->>C: Reminder email
  end`,
  },

  {
    id: 'state-job',
    title: 'State diagram: Job',
    code: `stateDiagram-v2
  [*] --> Draft
  Draft --> Open: publish
  Open --> InProgress: proposal accepted
  Open --> Cancelled: client cancels
  InProgress --> Completed: work approved
  InProgress --> Cancelled: contract cancelled
  Completed --> [*]
  Cancelled --> [*]`,
  },

  {
    id: 'state-proposal',
    title: 'State diagram: Proposal',
    code: `stateDiagram-v2
  [*] --> Pending: submit
  Pending --> Accepted: client accepts
  Pending --> Rejected: client rejects or another accepted
  Pending --> Withdrawn: freelancer withdraws
  Accepted --> [*]
  Rejected --> [*]
  Withdrawn --> [*]`,
  },

  {
    id: 'state-invoice',
    title: 'State diagram: Invoice',
    code: `stateDiagram-v2
  [*] --> Draft
  Draft --> Sent: send
  Sent --> Paid: payment recorded
  Sent --> Overdue: due date passed
  Overdue --> Paid: payment recorded
  Paid --> [*]`,
  },

  {
    id: 'activity',
    title: 'Activity diagram: whole process',
    code: `flowchart TD
  A([Start]) --> B[Client registers and logs in]
  B --> C[Client posts a job]
  C --> D[Freelancers browse and send proposals]
  D --> E{Client accepts a proposal?}
  E -- No --> F[Job stays open or is cancelled]
  E -- Yes --> G[Contract created]
  G --> H[Freelancer works and tracks time]
  H --> I[Freelancer creates and sends invoice]
  I --> J{Paid before due date?}
  J -- No --> K[System marks overdue and sends reminder]
  K --> L[Client pays]
  J -- Yes --> L
  L --> M[Contract completed]
  M --> N[Both leave a review]
  N --> O([End])`,
  },

  {
    id: 'er',
    title: 'Database schema (ER diagram)',
    code: `erDiagram
  USERS ||--o| FREELANCER_PROFILES : has
  USERS ||--o| CLIENT_PROFILES : has
  USERS ||--o{ JOBS : posts
  CATEGORIES ||--o{ JOBS : classifies
  JOBS ||--o{ PROPOSALS : receives
  USERS ||--o{ PROPOSALS : sends
  PROPOSALS ||--o| CONTRACTS : becomes
  CONTRACTS ||--o{ TIME_ENTRIES : logs
  CONTRACTS ||--o{ INVOICES : billed_by
  INVOICES ||--|{ INVOICE_ITEMS : contains
  INVOICES ||--o{ PAYMENTS : settled_by
  CONTRACTS ||--o{ MESSAGES : discussion
  CONTRACTS ||--o{ REVIEWS : receives

  USERS {
    bigint id PK
    string name
    string email
    string password
    string role
  }
  FREELANCER_PROFILES {
    bigint id PK
    bigint user_id FK
    string title
    text bio
    decimal hourly_rate
  }
  CLIENT_PROFILES {
    bigint id PK
    bigint user_id FK
    string company
    string phone
  }
  CATEGORIES {
    bigint id PK
    string name
  }
  JOBS {
    bigint id PK
    bigint client_id FK
    bigint category_id FK
    string title
    text description
    decimal budget_min
    decimal budget_max
    date deadline
    string status
  }
  PROPOSALS {
    bigint id PK
    bigint job_id FK
    bigint freelancer_id FK
    text cover_letter
    decimal price
    int delivery_days
    string status
  }
  CONTRACTS {
    bigint id PK
    bigint proposal_id FK
    decimal agreed_price
    string billing_type
    date start_date
    string status
  }
  TIME_ENTRIES {
    bigint id PK
    bigint contract_id FK
    datetime started_at
    datetime ended_at
    int minutes
    boolean billed
  }
  INVOICES {
    bigint id PK
    bigint contract_id FK
    string number
    date due_date
    decimal total
    string status
  }
  INVOICE_ITEMS {
    bigint id PK
    bigint invoice_id FK
    string description
    decimal quantity
    decimal unit_price
  }
  PAYMENTS {
    bigint id PK
    bigint invoice_id FK
    decimal amount
    date paid_at
    string method
  }
  MESSAGES {
    bigint id PK
    bigint contract_id FK
    bigint sender_id FK
    text body
  }
  REVIEWS {
    bigint id PK
    bigint contract_id FK
    bigint author_id FK
    int rating
    text comment
  }`,
  },
];