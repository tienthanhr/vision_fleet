import { useMemo, useState } from "react"

type Page = "staff-login" | "staff-dashboard" | "available-vans" | "create-booking" | "my-bookings" | "booking-detail" | "admin-login" | "admin-dashboard" | "manage-vans" | "edit-van"

type Role = "staff" | "admin"

const A = "/assets/"
const icons = {
  logo: `${A}39771.svg`,
  dashboard: `${A}bb2f3.svg`,
  create: `${A}11a0e.svg`,
  bus: `${A}b4b0a.svg`,
  busLarge: `${A}f620a.svg`,
  bookings: `${A}f9370.svg`,
  profile: `${A}0bba7.svg`,
  shield: `${A}5d3a9.svg`,
  shieldLarge: `${A}08b66.svg`,
  bell: `${A}83af3.svg`,
  cap: `${A}f91ca.svg`,
  info: `${A}ed2dd.svg`,
  check: `${A}1f8d4.svg`,
  calendar: `${A}cd356.svg`,
  clock: `${A}9c74e.svg`,
  search: `${A}d9dd4.svg`,
  alert: `${A}b673e.svg`,
}

const staffNav: { label: string page: Page icon: string }[] = [
  { label: "Dashboard", page: "staff-dashboard", icon: icons.dashboard },
  { label: "Create Booking", page: "create-booking", icon: icons.create },
  { label: "Available Vans", page: "available-vans", icon: icons.bus },
  { label: "My Bookings", page: "my-bookings", icon: icons.bookings },
  { label: "Profile", page: "staff-dashboard", icon: icons.profile },
]

const adminNav: { label: string page: Page icon: string }[] = [
  { label: "Dashboard", page: "admin-dashboard", icon: icons.dashboard },
  { label: "Manage Vans", page: "manage-vans", icon: icons.create },
  { label: "Manage Bookings", page: "admin-dashboard", icon: icons.bus },
  { label: "Profile", page: "admin-dashboard", icon: icons.bookings },
]

const bookings = [
  [
    "BK-1042",
    "School of ICT industry visit",
    "VC-03",
    "8 passengers",
    "15 Oct 2026 • 09:00",
    "Example Partner Campus",
    "Pending",
  ],
  [
    "BK-1039",
    "Internship orientation",
    "VC-01",
    "10 passengers",
    "16 Oct 2026 • 08:30",
    "Example Innovation Hub",
    "Approved",
  ],
  [
    "BK-1035",
    "Teaching resources collection",
    "VC-02",
    "3 passengers",
    "17 Oct 2026 • 10:00",
    "Example Learning Centre",
    "Declined",
  ],
  [
    "BK-1028",
    "ICT workshop",
    "VC-01",
    "9 passengers",
    "13 Oct 2026 • 08:00",
    "Technology Centre",
    "Completed",
  ],
  [
    "BK-1024",
    "Project presentation",
    "VC-03",
    "6 passengers",
    "14 Oct 2026 • 11:00",
    "Enterprise Centre",
    "Cancelled",
  ],
]

const passengers = [
  ["Alex Taylor", "Student", "VC-ICT-24018"],
  ["Sam Taylor", "Student", "VC-ICT-25034"],
  ["Jamie Taylor", "Student", "VC-ICT-23052"],
  ["Casey Brown", "Student", "VC-ICT-24027"],
  ["Riley Wilson", "Student", "VC-ICT-25041"],
  ["Jordan Smith", "Student", "VC-ICT-24063"],
  ["Morgan Reed", "Staff", "Not applicable"],
  ["Sam Reed", "Staff", "Not applicable"],
]

function Icon({ src, className = "" }: { src: string className?: string }) {
  return <img alt="" className={className} src={src} />
}

function Footer() {
  return (
    <footer>
      <div>
        <strong>Vision College Fleet Booking and Tracking System</strong>
        <span>School of ICT · New Zealand</span>
      </div>
      <nav>
        <a>Privacy</a>
        <a>Accessibility</a>
        <a>Contact</a>
      </nav>
    </footer>
  )
}

function Button({
  children,
  onClick,
  secondary = false,
  danger = false,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  secondary?: boolean
  danger?: boolean
  className?: string
}) {
  return (
    <button
      className={`button ${secondary ? "secondary" : ""} ${
        danger ? "danger" : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function Badge({
  children,
  tone = "green",
}: {
  children: React.ReactNode
  tone?: "green" | "amber" | "red" | "grey"
}) {
  return <span className={`badge ${tone}`}>◉ {children}</span>
}

function Notice({
  title,
  children,
  warning = false,
}: {
  title: string
  children?: React.ReactNode
  warning?: boolean
}) {
  return (
    <div className={`notice ${warning ? "warning" : ""}`}>
      <Icon src={warning ? icons.alert : icons.info} />
      <div>
        <strong>{title}</strong>
        {children && <p>{children}</p>}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  type = "text",
  children,
}: {
  label: string
  value?: string
  type?: string
  children?: React.ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children ?? <input type={type} defaultValue={value} />}
    </label>
  )
}

function Shell({
  page,
  role,
  setPage,
  children,
}: {
  page: Page
  role: Role
  setPage: (p: Page) => void
  children: React.ReactNode
}) {
  const nav = role === "staff" ? staffNav : adminNav
  const name = role === "staff" ? "Morgan Reed" : "Taylor James"
  return (
    <div className="shell">
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() =>
            setPage(role === "staff" ? "staff-dashboard" : "admin-dashboard")
          }
        >
          <Icon src={icons.logo} />
          <span>
            <b>Fleet</b> School of ICT
          </span>
        </button>
        <p className="nav-title">
          {role === "staff" ? "STAFF WORKSPACE" : "ADMINISTRATOR"}
        </p>
        <nav className="side-nav">
          {nav.map((item) => (
            <button
              key={item.label}
              className={page === item.page ? "active" : ""}
              onClick={() => setPage(item.page)}
            >
              <Icon src={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="access-card">
          <Icon src={icons.shield} />
          <div>
            <b>
              {role === "staff"
                ? "Staff / Tutor access"
                : "Administrator access"}
            </b>
            <span>Vision College • School of ICT</span>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div>
            Fleet <span>›</span>{" "}
            <b>{nav.find((n) => n.page === page)?.label ?? "My Bookings"}</b>
          </div>
          <div className="user">
            <span>School of ICT</span>
            <Icon src={icons.bell} />
            <i>
              {name
                .split(" ")
                .map((x) => x[0])
                .join("")}
            </i>
            <b>
              {name}
              <small>{role === "staff" ? "Tutor" : "Administrator"}</small>
            </b>
            <span>⌄</span>
          </div>
        </header>
        <main>
          {children}
          <Footer />
        </main>
      </div>
    </div>
  )
}

function LoginPage({
  admin,
  setPage,
}: {
  admin?: boolean
  setPage: (p: Page) => void
}) {
  return (
    <div className="login-page">
      <header className="login-header">
        <div className="login-brand">
          <Icon src={icons.logo} />
          <div>
            <b>Fleet</b>
            <span>School of ICT • Internship Programme</span>
          </div>
        </div>
        <button onClick={() => setPage(admin ? "staff-login" : "admin-login")}>
          {admin ? "RESTRICTED ADMINISTRATOR ACCESS" : "STAFF & TUTOR ACCESS"}
        </button>
      </header>
      <div className="login-workspace">
        <section className="login-intro">
          <div className="intro-icon">
            <Icon src={admin ? icons.shieldLarge : icons.busLarge} />
          </div>
          <b>VISION COLLEGE · SCHOOL OF ICT</b>
          <h1>
            {admin ? (
              <>
                Fleet administration,
                <br />
                with clarity.
              </>
            ) : (
              <>
                College journeys,
                <br />
                carefully planned.
              </>
            )}
          </h1>
          <p>
            {admin
              ? "Review authorised staff requests and keep the college fleet ready for every approved journey."
              : "Request a college van for teaching, industry visits and internship activities. Keep every journey and passenger together in one request."}
          </p>
          <ul>
            {(admin
              ? [
                  "Review and decide on bookings",
                  "Manage vehicle capacity and availability",
                  "Record a reason for every change",
                ]
              : [
                  "Choose a van for your journey",
                  "Record students and staff as passengers",
                  "Follow your own booking status",
                ]
            ).map((x) => (
              <li key={x}>
                <Icon src={icons.check} />
                {x}
              </li>
            ))}
          </ul>
          <div className="intro-foot">
            <b>ICT Internship Programme</b>
            <p>
              Authorised college accounts only. Students are passengers, not
              booking account holders.
            </p>
          </div>
        </section>
        <section className="login-forms">
          <div className="card auth-card">
            <h2>{admin ? "Administrator sign in" : "Staff & Tutor sign in"}</h2>
            <p>
              Use your {admin ? "assigned administrator" : "college staff"}{" "}
              account to{" "}
              {admin
                ? "manage vans and bookings"
                : "request vans and view your own bookings"}
              .
            </p>
            <Field
              label="College email *"
              value={
                admin
                  ? "taylor@visioncollege.ac.nz"
                  : "morgan@visioncollege.ac.nz"
              }
            />
            <Field label="Password *" value="fleetpassword" type="password" />
            <div className="auth-options">
              <label>
                <input type="checkbox" /> Show password
              </label>
              <a>Forgot password?</a>
            </div>
            <Button
              onClick={() =>
                setPage(admin ? "admin-dashboard" : "staff-dashboard")
              }
            >
              Sign in{admin ? " as Administrator" : ""}
            </Button>
            <Notice
              title={
                admin
                  ? "Restricted administrative access"
                  : "Staff-only booking access"
              }
            >
              {admin
                ? "Administrator permissions are assigned by the college. There is no public registration."
                : "Only tutors and authorised staff can submit bookings. Students may be added to passenger lists but cannot book vans."}
            </Notice>
            <p>
              For account access, contact ICT Support at
              support@visioncollege.ac.nz.
            </p>
          </div>
          <h3>Sign-in error example</h3>
          <div className="error-box">
            <span>⊙</span>
            <div>
              <b>Unable to sign in</b>
              <p>
                Check your email and password. Both fields are required. If the
                problem continues, contact ICT Support.
              </p>
            </div>
            <span>×</span>
          </div>
          <div className="card reset-card">
            <h3>Reset your password</h3>
            <p>
              Enter your college email to request password reset instructions.
              Access remains limited to authorised accounts.
            </p>
            <Field
              label="College email *"
              value={
                admin
                  ? "taylor@visioncollege.ac.nz"
                  : "morgan@visioncollege.ac.nz"
              }
            />
            <Button secondary>Request reset instructions</Button>
            <p>
              Confirmation example: If an authorised account exists for this
              email, you will receive reset instructions.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}

function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="stat card">
      <span className="stat-icon">
        <Icon src={icons.cap} />
      </span>
      <div>
        <span>{label}</span>
        <b>{value}</b>
        <small>{detail}</small>
      </div>
    </div>
  )
}

function BookingCards({
  admin = false,
  setPage,
}: {
  admin?: boolean
  setPage: (p: Page) => void
}) {
  const cards = admin
    ? [
        [
          "BK-1042",
          "15 Oct 2026 • 09:00 • VC-03 • 8 passengers",
          "School of ICT industry visit",
          "Example Partner Campus • Morgan Reed",
        ],
        [
          "BK-1043",
          "16 Oct 2026 • 10:00 • VC-02 • 4 passengers",
          "Department planning session",
          "Example Training Centre • Sam Reed",
        ],
      ]
    : [
        [
          "BK-1042",
          "15 Oct 2026 • 09:00 • VC-03 • 8 passengers",
          "School of ICT industry visit",
          "Example Partner Campus",
        ],
        [
          "BK-1039",
          "16 Oct 2026 • 08:30 • VC-01 • 10 passengers",
          "Internship orientation",
          "Example Innovation Hub",
        ],
      ]
  return (
    <div className="booking-cards">
      {cards.map((b, i) => (
        <div className="card booking-card" key={b[0]}>
          <div>
            <b>{b[0]}</b>
            <Badge tone={i ? "green" : "amber"}>
              {i ? (admin ? "Pending" : "Approved") : "Pending"}
            </Badge>
          </div>
          <small>{b[1]}</small>
          <p>
            {b[2]}
            <br />
            {b[3]}
          </p>
          <Button onClick={() => setPage("booking-detail")}>
            {admin ? "→  Review Booking" : "→  View Booking"}
          </Button>
        </div>
      ))}
    </div>
  )
}

function BookingTable({
  admin = false,
  limit,
}: {
  admin?: boolean
  limit?: number
}) {
  return (
    <div className="card table-card">
      <div className="table-title">
        <b>{admin ? "Recent booking requests" : "My submitted bookings"}</b>
        <span>{limit ?? bookings.length} records</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Booking / purpose</th>
              <th>{admin ? "Staff / van" : "Van / passengers"}</th>
              <th>Departure / destination</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.slice(0, limit).map((b, i) => (
              <tr key={b[0]} className={i === 0 ? "selected" : ""}>
                <td>
                  <b>{b[0]}</b>
                  <br />
                  {b[1]}
                </td>
                <td>
                  {admin ? (i % 2 ? "Sam Reed" : "Morgan Reed") : b[2]}
                  <br />
                  {admin ? `${b[2]} • ${b[3]}` : b[3]}
                </td>
                <td>
                  {b[4]}
                  <br />
                  {b[5]}
                </td>
                <td>
                  <Badge
                    tone={
                      b[6] === "Pending"
                        ? "amber"
                        : b[6] === "Declined"
                          ? "red"
                          : b[6] === "Cancelled"
                            ? "grey"
                            : "green"
                    }
                  >
                    {b[6]}
                  </Badge>
                </td>
                <td>
                  <a>
                    {admin
                      ? i < 2
                        ? "Review • Approve / Decline"
                        : "View / Update"
                      : "View details"}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-foot">
        Showing {limit ?? bookings.length} of {limit ?? bookings.length} records{" "}
        <span>Page 1</span>
      </div>
    </div>
  )
}

function StaffDashboard({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <Shell page="staff-dashboard" role="staff" setPage={setPage}>
      <PageTitle
        title="Welcome back, Morgan"
        subtitle="Tuesday, 13 October 2026 · Your college journeys at a glance."
        action={
          <Button onClick={() => setPage("create-booking")}>
            Create Booking
          </Button>
        }
      />
      <div className="stats">
        <Stat
          label="Pending"
          value="1"
          detail="Awaiting administrator review"
        />
        <Stat
          label="Approved"
          value="1"
          detail="Ready for an upcoming journey"
        />
        <Stat label="Declined" value="1" detail="Decision available to view" />
      </div>
      <h3 className="section-title">My upcoming bookings</h3>
      <BookingCards setPage={setPage} />
      <Notice title="Your request is awaiting review">
        BK-1042 is Pending. A request does not reserve a van until an
        administrator approves it.
      </Notice>
      <div className="section-heading">
        <h3>Available Vans</h3>
        <Button secondary onClick={() => setPage("available-vans")}>
          View all vans
        </Button>
      </div>
      <p className="muted">Example search window · 15 Oct 2026, 09:00–14:00</p>
      <VanCards compact setPage={setPage} />
      <BookingTable limit={3} />
      <div className="card draft">
        <div>
          <b>A draft ready to finish</b>
          <p>
            <strong>Draft · Internship site visit</strong>
            <br />
            <span>
              Saved 13 Oct 2026 · No request ID yet · Not submitted for review
            </span>
          </p>
        </div>
        <Button secondary onClick={() => setPage("create-booking")}>
          Continue draft
        </Button>
      </div>
    </Shell>
  )
}

function VanCards({
  compact = false,
  setPage,
}: {
  compact?: boolean
  setPage: (p: Page) => void
}) {
  const vans = [
    ["VC-01", "KFL101", "12 passenger seats", "Available"],
    ["VC-02", "KFL102", "10 passenger seats", "Booked"],
    ["VC-03", "KFL103", "12 passenger seats", "Available"],
  ]
  return (
    <div className={`van-grid ${compact ? "compact" : ""}`}>
      {vans.map((v) => (
        <div className="van-wrap" key={v[0]}>
          <div className="card van-card">
            <div className="van-name">
              <span>
                <Icon src={icons.bus} />
              </span>
              <div>
                <b>{v[0]}</b>
                <small>{v[1]}</small>
              </div>
            </div>
            <Badge tone={v[3] === "Booked" ? "amber" : "green"}>{v[3]}</Badge>
            <hr />
            <p>{v[2]}</p>
            <p>15 Oct 2026 • 09:00–14:00</p>
            <small>
              {v[3] === "Booked"
                ? "Booked during the selected window."
                : "Available for the selected window."}
            </small>
          </div>
          <Button
            secondary={v[3] === "Booked"}
            onClick={() => v[3] !== "Booked" && setPage("create-booking")}
          >
            {v[3] === "Booked" ? "Choose another time" : `Request ${v[0]}`}
          </Button>
        </div>
      ))}
    </div>
  )
}

function AvailableVans({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <Shell page="available-vans" role="staff" setPage={setPage}>
      <PageTitle
        title="Available Vans"
        subtitle="Find a college van that fits your journey and passenger count."
      />
      <section className="card search-panel">
        <h3>Search a journey window</h3>
        <div className="field-grid four">
          <Field label="Departure date *" value="15 Oct 2026" />
          <Field label="Departure time *" value="09:00" />
          <Field label="Return date" value="15 Oct 2026" />
          <Field label="Return time" value="14:00" />
        </div>
        <div className="field-grid search-row">
          <Field label="Minimum passenger seats">
            <select defaultValue="8">
              <option value="8">8 seats or more</option>
            </select>
          </Field>
          <Field label="Availability">
            <select>
              <option>All vans</option>
            </select>
          </Field>
          <Button>Search Vans</Button>
        </div>
        <p className="muted">
          Dates must be 13 Oct 2026 or later. For a return journey, the return
          must be after departure.
        </p>
      </section>
      <Notice title="Availability is not approval">
        Selecting an available van starts a booking request. An administrator
        must approve your request before the van is reserved.
      </Notice>
      <h3 className="section-title">
        3 college vans · 2 available for this window
      </h3>
      <p className="muted">
        15 Oct 2026 · 09:00–14:00 · Minimum 8 passenger seats
      </p>
      <VanCards setPage={setPage} />
      <div className="card info-panel">
        <h3>Before you request</h3>
        <p>
          Have your journey purpose, departure and return times, pickup
          location, destination and complete passenger list ready.
        </p>
        <p className="muted">
          Use one shared pickup location and one destination. Include every
          travelling student and staff member in the seat count.
        </p>
      </div>
    </Shell>
  )
}

function PassengerTable({ editable = false }: { editable?: boolean }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Passenger type</th>
            <th>Student number</th>
            <th>Seats</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {passengers.map((p, i) => (
            <tr key={p[0]} className={i === 0 ? "selected" : ""}>
              <td>{p[0]}</td>
              <td>{p[1]}</td>
              <td>{p[2]}</td>
              <td>
                <Badge>1 seat</Badge>
              </td>
              <td>
                <a>{editable ? "Remove" : "Included"}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CreateBooking({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <Shell page="create-booking" role="staff" setPage={setPage}>
      <PageTitle
        title="Standard Van Booking Request"
        subtitle="Complete your journey and passenger details. Required fields are marked *."
      />
      <Notice title="Requesting as Morgan Reed · Tutor">
        This request will be submitted for administrator review. Choosing VC-03
        does not reserve the van or approve the journey.
      </Notice>
      <div className="form-with-aside">
        <div className="stack">
          <section className="card form-card">
            <h3>Journey details</h3>
            <Field
              label="Journey purpose *"
              value="School of ICT industry visit"
            />
            <Field label="Available van *">
              <select>
                <option>VC-03 · KFL103 · 12 seats</option>
              </select>
            </Field>
            <p className="muted">Available for 15 Oct 2026, 09:00–14:00.</p>
            <div className="field-grid">
              <Field label="Departure date *" value="15 Oct 2026" />
              <Field label="Departure time *" value="09:00" />
            </div>
            <Field
              label="Pickup location *"
              value="Vision College main entrance"
            />
            <Field label="Destination *" value="Example Partner Campus" />
            <label className="checkline">
              <input type="checkbox" /> One-way journey · no return required
            </label>
            <div className="field-grid">
              <Field label="Return date *" value="15 Oct 2026" />
              <Field label="Return time *" value="14:00" />
            </div>
            <Notice title="Schedule checked">
              Departure is in the future and return is after departure.
            </Notice>
          </section>
        </div>
        <aside className="stack">
          <section className="card">
            <h3>Your journey at a glance</h3>
            <p>
              <b>VC-03 · 12 passenger seats</b>
            </p>
            <p>15 Oct 2026 · 09:00–14:00</p>
            <p>Vision College main entrance → Example Partner Campus</p>
            <p className="muted">8 passengers · 4 seats remaining</p>
          </section>
          <section className="card">
            <h3>What happens next?</h3>
            <ol>
              <li>Submit the complete request.</li>
              <li>An administrator checks availability and capacity.</li>
              <li>View Approved or Declined in My Bookings.</li>
            </ol>
          </section>
        </aside>
      </div>
      <section className="card table-card">
        <div className="table-title">
          <b>Passengers · 8 of 12 seats</b>
        </div>
        <Notice title="Capacity within limit">
          8 passengers fit within VC-03's 12 passenger seats.
        </Notice>
        <PassengerTable editable />
        <div className="add-passenger">
          <h3>Add a passenger</h3>
          <div className="field-grid three">
            <Field label="Passenger type *">
              <select>
                <option>Student</option>
                <option>Staff</option>
              </select>
            </Field>
            <Field label="Full name *" value="" />
            <Field label="Student number *" value="" />
          </div>
          <Button secondary>Add Passenger</Button>
        </div>
      </section>
      <section className="card form-card">
        <h3>Additional notes</h3>
        <Field label="Journey notes (optional)">
          <textarea defaultValue="Industry visit for the ICT Internship Programme. Please arrive at the main entrance 15 minutes before departure." />
        </Field>
      </section>
      <div className="validation">
        <Notice warning title="Check your dates">
          Departure cannot be in the past.
        </Notice>
        <Notice warning title="Seat limit exceeded">
          13 passengers exceed 12 seats.
        </Notice>
      </div>
      <div className="card action-bar">
        <div>
          <b>Ready for administrator review</b>
          <span>Saving a draft does not submit or reserve a van.</span>
        </div>
        <div>
          <Button secondary>Save Draft</Button>
          <Button onClick={() => setPage("my-bookings")}>Submit Request</Button>
        </div>
      </div>
    </Shell>
  )
}

function MyBookings({ setPage }: { setPage: (p: Page) => void }) {
  const [query, setQuery] = useState("")
  return (
    <Shell page="my-bookings" role="staff" setPage={setPage}>
      <PageTitle
        title="My Bookings"
        subtitle="Your submitted requests, booking decisions and saved drafts."
        action={
          <Button onClick={() => setPage("create-booking")}>
            Create Booking
          </Button>
        }
      />
      <section className="card search-panel">
        <h3>Search your requests</h3>
        <div className="field-grid three">
          <label className="field">
            <span>Search bookings</span>
            <div className="input-icon">
              <input
                placeholder="Booking ID, purpose or destination"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Icon src={icons.search} />
            </div>
          </label>
          <Field label="Booking status">
            <select>
              <option>All statuses</option>
              <option>Pending</option>
            </select>
          </Field>
          <Field label="Departure from" value="13 Oct 2026" />
        </div>
        <div className="filter-actions">
          <Button secondary>Apply Filters</Button>
          <button onClick={() => setQuery("")}>Clear filters</button>
        </div>
        <p className="muted">
          Showing only requests submitted by Morgan Reed · Tutor
        </p>
      </section>
      <BookingTable />
      <div className="card draft">
        <div>
          <b>Saved drafts · 1</b>
          <p>
            <strong>Draft · Internship site visit</strong>
            <br />
            19 Oct 2026 · 09:00 · VC-02 · Partner Office
            <br />
            <span>
              Passenger list incomplete · Saved 13 Oct 2026 at 08:45 · Not
              submitted
            </span>
          </p>
        </div>
        <Button secondary onClick={() => setPage("create-booking")}>
          Continue draft
        </Button>
      </div>
      <div className="card info-panel">
        <h3>Understanding your status</h3>
        <p>
          Pending: awaiting review. Approved: the journey is authorised.
          Declined: view the administrator's reason. Completed: the booking has
          been closed. Cancelled: the journey will not proceed.
        </p>
        <p className="muted">
          Drafts are separate from booking statuses and are not visible in the
          administrator review queue until submitted.
        </p>
      </div>
    </Shell>
  )
}

function BookingDetail({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <Shell page="booking-detail" role="staff" setPage={setPage}>
      <PageTitle
        title="Booking BK-1042"
        subtitle="School of ICT industry visit · Requested by you."
        action={<Badge tone="amber">Pending</Badge>}
      />
      <Notice title="Pending administrator review">
        You can edit or cancel this pending request. Only an administrator can
        approve or decline bookings.
      </Notice>
      <div className="button-row">
        <Button secondary onClick={() => setPage("create-booking")}>
          Edit pending request
        </Button>
        <Button danger>Cancel Booking</Button>
        <Button secondary onClick={() => setPage("my-bookings")}>
          Back to My Bookings
        </Button>
      </div>
      <section className="card detail-grid">
        <h3>Journey schedule and locations</h3>
        <div>
          <b>Departure</b>
          <strong>15 Oct 2026 · 09:00</strong>
          <span>Vision College main entrance</span>
        </div>
        <div>
          <b>Destination</b>
          <strong>Example Partner Campus</strong>
          <span>One shared college pickup location</span>
        </div>
        <div>
          <b>Return</b>
          <strong>15 Oct 2026 · 14:00</strong>
          <span>Return to Vision College main entrance</span>
        </div>
        <div>
          <b>Requested van</b>
          <strong>VC-03 · KFL103</strong>
          <span>12 seats · 8 passengers · 4 seats remaining</span>
        </div>
      </section>
      <div className="two-col">
        <section className="card">
          <h3>Requested by</h3>
          <p>
            <b>Morgan Reed · Tutor</b>
          </p>
          <p>morgan@visioncollege.ac.nz</p>
          <p className="muted">School of ICT · Submitted 13 Oct 2026, 10:24</p>
        </section>
        <section className="card">
          <h3>Journey purpose</h3>
          <p>
            <b>School of ICT industry visit</b>
          </p>
          <p>
            Industry exposure visit for the School of ICT Internship Programme.
          </p>
          <p className="muted">Return journey · 15 Oct 2026</p>
        </section>
      </div>
      <section className="card table-card">
        <div className="table-title">
          <b>Passenger list · 8 of 12 seats</b>
          <span>8 records</span>
        </div>
        <PassengerTable />
      </section>
      <div className="two-col">
        <section className="card timeline">
          <h3>Booking status timeline</h3>
          <p>
            ✓ <b>Submitted</b>
            <span>13 Oct 2026, 10:24 · Morgan Reed submitted this request</span>
          </p>
          <p>
            ✓ <b>Pending review</b>
            <span>Current stage · Waiting for administrator review</span>
          </p>
          <p>
            ○ <b>Approved or Declined</b>
            <span>Future stage · A decision will appear after review</span>
          </p>
          <p>
            ○ <b>Completed</b>
            <span>Future stage · Closed after the approved journey</span>
          </p>
        </section>
        <section className="card">
          <h3>Additional notes</h3>
          <p>
            Industry visit for the ICT Internship Programme. Please arrive at
            the main entrance 15 minutes before departure.
          </p>
          <Notice title="No decision yet">
            Administrator approval or a decline reason will appear here.
          </Notice>
        </section>
      </div>
    </Shell>
  )
}

function AdminDashboard({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <Shell page="admin-dashboard" role="admin" setPage={setPage}>
      <PageTitle
        title="Fleet administration"
        subtitle="Tuesday, 13 October 2026 · Bookings and fleet readiness."
        action={<Button>Manage Bookings</Button>}
      />
      <div className="stats">
        <Stat
          label="Available vans"
          value="2 / 5"
          detail="For 15 Oct, 09:00–14:00"
        />
        <Stat
          label="Pending bookings"
          value="2"
          detail="Staff requests awaiting review"
        />
        <Stat
          label="Total bookings"
          value="8"
          detail="All submitted demo records"
        />
      </div>
      <Notice warning title="2 requests need your review">
        BK-1042 and BK-1043 are awaiting a decision. Review the schedule,
        vehicle availability and passenger count before approval.
      </Notice>
      <h3 className="section-title">Pending booking queue</h3>
      <BookingCards admin setPage={setPage} />
      <BookingTable admin limit={4} />
      <FleetTable setPage={setPage} compact />
      <div className="two-col">
        <section className="card">
          <h3>Booking overview</h3>
          <p>2 Pending · 3 Approved · 1 Declined</p>
          <p>1 Completed · 1 Cancelled</p>
          <p className="muted">
            Drafts are not included until a staff member submits them.
          </p>
        </section>
        <section className="card">
          <h3>Administrator responsibilities</h3>
          <p>
            Manage vans and all submitted bookings. Approval, decline and
            booking updates must record a clear reason where required.
          </p>
          <Button secondary onClick={() => setPage("manage-vans")}>
            Manage Vans
          </Button>
        </section>
      </div>
    </Shell>
  )
}

const vans = [
  [
    "VC-01",
    "KFL101",
    "12",
    "Available · Active",
    "BK-1039",
    "16 Oct · 08:30–13:00",
  ],
  [
    "VC-02",
    "KFL102",
    "10",
    "Booked · Active",
    "BK-1041",
    "15 Oct · 08:00–16:00",
  ],
  [
    "VC-03",
    "KFL103",
    "12",
    "Available · Active",
    "BK-1042 Pending",
    "15 Oct · 09:00–14:00",
  ],
  [
    "VC-04",
    "KFL104",
    "10",
    "Under Maintenance",
    "Service window",
    "13–20 Oct 2026",
  ],
  ["VC-05", "KFL105", "12", "Inactive", "No upcoming bookings", ""],
]

function FleetTable({
  setPage,
  compact = false,
}: {
  setPage: (p: Page) => void
  compact?: boolean
}) {
  return (
    <div className="card table-card">
      <div className="table-title">
        <b>{compact ? "Vehicle availability overview" : "Fleet inventory"}</b>
        <span>5 records</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Van / registration</th>
              <th>{compact ? "Capacity" : "Seats"}</th>
              <th>{compact ? "Selected window" : "Availability / service"}</th>
              <th>{compact ? "Service status" : "Upcoming usage"}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {vans.map((v, i) => (
              <tr key={v[0]} className={i === 0 ? "selected" : ""}>
                <td>
                  <b>{v[0]}</b>
                  <br />
                  {v[1]}
                </td>
                <td>
                  {v[2]}
                  {compact && " seats"}
                </td>
                <td>{compact ? "15 Oct · 09:00–14:00" : v[3]}</td>
                <td>
                  {compact ? (
                    <Badge
                      tone={
                        v[3].includes("Available")
                          ? "green"
                          : v[3].includes("Maintenance")
                            ? "amber"
                            : "grey"
                      }
                    >
                      {v[3].split(" · ")[0]}
                    </Badge>
                  ) : (
                    <>
                      <Badge tone="grey">{v[4]}</Badge>
                      <br />
                      {v[5]}
                    </>
                  )}
                </td>
                <td>
                  <button
                    className="link-button"
                    onClick={() => setPage("edit-van")}
                  >
                    {i < 3 ? "View / Edit" : "Edit"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-foot">
        Showing 5 of 5 records <span>Page 1</span>
      </div>
    </div>
  )
}

function ManageVans({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <Shell page="manage-vans" role="admin" setPage={setPage}>
      <PageTitle
        title="Manage Vans"
        subtitle="Maintain college vehicle details, service status and booking availability."
        action={<Button onClick={() => setPage("edit-van")}>Add Van</Button>}
      />
      <div className="stats">
        <Stat
          label="Fleet inventory"
          value="5"
          detail="3 active · 1 maintenance · 1 inactive"
        />
        <Stat
          label="Requestable vans"
          value="3"
          detail="Availability depends on booking time"
        />
        <Stat
          label="Needs attention"
          value="1"
          detail="VC-04 under maintenance"
        />
      </div>
      <section className="card search-panel">
        <h3>Search fleet inventory</h3>
        <div className="field-grid search-row">
          <label className="field">
            <span>Search vans</span>
            <div className="input-icon">
              <input placeholder="Van ID or registration" />
              <Icon src={icons.search} />
            </div>
          </label>
          <Field label="Service status">
            <select>
              <option>All statuses</option>
            </select>
          </Field>
          <Button secondary>Apply Filters</Button>
        </div>
        <p className="muted">
          Availability example: 15 Oct 2026, 09:00–14:00. Booked is a
          time-window state; service status remains active.
        </p>
      </section>
      <FleetTable setPage={setPage} />
      <div className="two-col">
        <section className="card">
          <h3>VC-03 · Upcoming bookings</h3>
          <p>
            <b>BK-1042 · Pending · Morgan Reed</b>
          </p>
          <p>15 Oct 2026 · 09:00–14:00 · Example Partner Campus</p>
          <p>
            <b>BK-1040 · Approved · Olivia Reed</b>
          </p>
          <p>15 Oct 2026 · 15:30–17:30 · Central Library</p>
          <Button secondary onClick={() => setPage("edit-van")}>
            View VC-03 usage
          </Button>
        </section>
        <section className="card">
          <h3>Maintenance and availability</h3>
          <p>
            VC-04 is unavailable while its scheduled service is in progress.
            Inactive vehicles do not appear as requestable vans.
          </p>
          <Notice warning title="Protect active bookings">
            Review affected approved and pending bookings before changing a van.
          </Notice>
        </section>
      </div>
    </Shell>
  )
}

function EditVan({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <Shell page="edit-van" role="admin" setPage={setPage}>
      <PageTitle
        title="Edit Van · VC-03"
        subtitle="Update the vehicle record. Required fields are marked *."
        action={
          <Button secondary onClick={() => setPage("manage-vans")}>
            Back to Manage Vans
          </Button>
        }
      />
      <div className="form-with-aside edit-layout">
        <div className="stack">
          <section className="card form-card">
            <h3>Vehicle details</h3>
            <div className="field-grid">
              <Field label="Van identifier *" value="VC-03" />
              <Field label="Registration / plate *" value="KFL103" />
              <Field label="Passenger seats *" value="12" />
              <Field label="Service status *">
                <select>
                  <option>Active</option>
                  <option>Under Maintenance</option>
                  <option>Inactive</option>
                </select>
              </Field>
            </div>
            <p className="muted">
              Van ID and registration must be unique. Seats must be a whole
              number greater than zero.
            </p>
          </section>
          <section className="card form-card">
            <h3>Availability</h3>
            <Field label="Available from *" value="13 Oct 2026" />
            <div className="field-grid">
              <Field
                label="Maintenance starts (optional)"
                value="Not scheduled"
              />
              <Field
                label="Maintenance ends (optional)"
                value="Not scheduled"
              />
            </div>
            <p className="muted">
              Approved bookings make an active van Booked for their journey
              window.
            </p>
            <Notice title="Existing bookings must be checked">
              Seat changes must still accommodate every affected booking.
            </Notice>
          </section>
          <section className="card form-card">
            <h3>Maintenance notes</h3>
            <Field label="Service and maintenance notes">
              <textarea defaultValue="Routine service completed 10 Oct 2026. Tyres and brakes checked. No maintenance window scheduled." />
            </Field>
            <Field label="Change reason *">
              <textarea defaultValue="Confirming VC-03 service details and passenger seat capacity after routine inspection." />
            </Field>
            <p className="muted">
              Record why the vehicle details are changing. The administrator
              name and change date belong in the vehicle's history.
            </p>
          </section>
          <div className="button-row">
            <Button secondary onClick={() => setPage("manage-vans")}>
              Cancel
            </Button>
            <Button onClick={() => setPage("manage-vans")}>Save Van</Button>
          </div>
        </div>
        <aside className="stack">
          <section className="card">
            <h3>Record summary</h3>
            <p>
              <b>VC-03 · KFL103</b>
            </p>
            <p>12 passenger seats · Active</p>
            <p className="muted">Available for 15 Oct 2026, 09:00–14:00</p>
            <p>
              1 approved booking and 1 pending request may be affected by a
              status change.
            </p>
          </section>
          <section className="card">
            <h3>Deactivation guidance</h3>
            <p>
              Do not deactivate the van without reviewing its active bookings.
              Reassign or cancel affected bookings and explain the change.
            </p>
            <Button danger>Deactivate Van</Button>
          </section>
          <h3>Deactivation confirmation example</h3>
          <section className="card confirmation">
            <h2>
              Deactivate VC-03? <span>×</span>
            </h2>
            <p className="muted">
              Vehicle status change · Confirmation required
            </p>
            <p>
              Current service status
              <br />
              <b>Active · 12 passenger seats</b>
            </p>
            <div className="notice">
              <div>
                Affected bookings
                <br />
                <b>
                  BK-1040 Approved
                  <br />
                  BK-1042 Pending
                </b>
              </div>
            </div>
            <p>Reassign or cancel BK-1040 before deactivating this van.</p>
            <p className="muted">
              This confirmation is blocked while an approved booking remains
              assigned.
            </p>
            <div>
              <button>Keep active</button>
              <Button secondary>Deactivate</Button>
            </div>
          </section>
        </aside>
      </div>
    </Shell>
  )
}

export default function App() {
  const initial = (window.location.hash.slice(1) || "staff-login") as Page
  const [page, setPageState] = useState<Page>(initial)
  const setPage = (next: Page) => {
    window.location.hash = next
    setPageState(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const content = useMemo(() => {
    switch (page) {
      case "staff-login":
        return <LoginPage setPage={setPage} />
      case "staff-dashboard":
        return <StaffDashboard setPage={setPage} />
      case "available-vans":
        return <AvailableVans setPage={setPage} />
      case "create-booking":
        return <CreateBooking setPage={setPage} />
      case "my-bookings":
        return <MyBookings setPage={setPage} />
      case "booking-detail":
        return <BookingDetail setPage={setPage} />
      case "admin-login":
        return <LoginPage admin setPage={setPage} />
      case "admin-dashboard":
        return <AdminDashboard setPage={setPage} />
      case "manage-vans":
        return <ManageVans setPage={setPage} />
      case "edit-van":
        return <EditVan setPage={setPage} />
      default:
        return <LoginPage setPage={setPage} />
    }
  }, [page])
  return content
}
