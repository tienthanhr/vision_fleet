import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

type Role = "admin" | "staff" | "driver";
type IconName =
  | "grid"
  | "calendar"
  | "bus"
  | "book"
  | "users"
  | "bell"
  | "user"
  | "route"
  | "check"
  | "clock"
  | "arrow"
  | "menu"
  | "search"
  | "plus"
  | "logout"
  | "shield"
  | "location"
  | "history"
  | "close";

const iconPaths: Record<IconName, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></>,
  bus: <><path d="M6 17h12M6 17v2M18 17v2M5 17a2 2 0 0 1-2-2V7c0-3 2-4 9-4s9 1 9 4v8a2 2 0 0 1-2 2" /><path d="M3 10h18M7 14h.01M17 14h.01M7 6h10" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z" /><path d="M8 7h8M8 11h6" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.7 21h-3.4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  route: <><circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" /><path d="M9 19h3a6 6 0 0 0 6-6v-5M6 16V8" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  arrow: <path d="m9 18 6-6-6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  logout: <><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
  location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>;
}

const roleNames: Record<Role, string> = {
  admin: "Administrator",
  staff: "Staff / Tutor",
  driver: "Driver",
};

const loginRoleNames: Record<Role, string> = {
  admin: "Administrator",
  staff: "Staff / Tutor",
  driver: "Driver",
};

const profileNames: Record<Role, string> = {
  admin: "Olivia Mensah",
  staff: "Daniel Owusu",
  driver: "Kwame Asare",
};

type NavItem = { label: string; icon: IconName; adminOnly?: boolean };
const portalNav: Record<"staff" | "driver", NavItem[]> = {
  staff: [
    { label: "Dashboard", icon: "grid" },
    { label: "Create Booking", icon: "plus" },
    { label: "Available Vans", icon: "bus" },
    { label: "My Bookings", icon: "book" },
    { label: "Transport Requests", icon: "route" },
    { label: "All Bookings", icon: "calendar", adminOnly: true },
    { label: "Route Planning", icon: "location", adminOnly: true },
    { label: "Live Monitoring", icon: "route", adminOnly: true },
    { label: "Manage Vans", icon: "bus", adminOnly: true },
    { label: "Manage Drivers", icon: "user", adminOnly: true },
    { label: "Manage Students", icon: "users" },
    { label: "Manage Guardians", icon: "shield" },
    { label: "Manage Users", icon: "users", adminOnly: true },
  ],
  driver: [
    { label: "Dashboard", icon: "grid" },
    { label: "Assigned Journeys", icon: "route" },
    { label: "Complete Route", icon: "location" },
    { label: "Journey Progress", icon: "clock" },
    { label: "Passenger List", icon: "users" },
    { label: "Passenger Attendance", icon: "check" },
  ],
};

type BookingRow = { id: string; displayId?: string; purpose: string; requester: string; date: string; time: string; van: string; driver: string; status: string };
const bookings: BookingRow[] = [
  { id: "BK-1048", purpose: "Networking Lab Visit", requester: "Daniel Owusu", date: "24 Jun, 2025", time: "08:30", van: "VC-04", driver: "K. Asare", status: "Approved" },
  { id: "BK-1047", purpose: "Industrial Attachment Visit", requester: "Akosua Nyame", date: "25 Jun, 2025", time: "09:15", van: "Unassigned", driver: "Unassigned", status: "Pending" },
  { id: "BK-1046", purpose: "ICT Club Competition", requester: "Samuel Addai", date: "27 Jun, 2025", time: "07:00", van: "VC-02", driver: "M. Tetteh", status: "Approved" },
  { id: "BK-1045", purpose: "Student Field Trip", requester: "Daniel Owusu", date: "21 Jun, 2025", time: "10:00", van: "VC-01", driver: "J. Ansah", status: "Completed" },
  { id: "BK-1044", purpose: "Equipment Collection", requester: "Grace Ofori", date: "20 Jun, 2025", time: "13:30", van: "—", driver: "—", status: "Declined" },
];

const students = [
  { name: "Ama Boateng", programme: "BSc. Information Technology", id: "VC/ICT/23/0142", initials: "AB", color: "blue", home: "14 Nii Martey Street, East Legon" },
  { name: "Kojo Boateng", programme: "Diploma in Cyber Security", id: "VC/ICT/24/0089", initials: "KB", color: "green", home: "8 Boundary Road, Shiashie" },
  { name: "Nana Boateng", programme: "Certificate in Web Design", id: "VC/ICT/24/0176", initials: "NB", color: "amber", home: "27 Jungle Avenue, Dzorwulu" },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5075/api";
const DEMO_ADMIN_ID = "00000000-0000-0000-0000-000000000001";

const presetLocations = [
  { name: "Vision College Hamilton", address: "21 Ruakura Road, Hamilton 3216" },
  { name: "University of Waikato", address: "Gate 1, Knighton Road, Hillcrest, Hamilton 3216" },
  { name: "Hamilton Central Library", address: "9 Garden Place, Hamilton 3204" },
  { name: "Hamilton Gardens", address: "Hungerford Crescent, Hamilton 3216" },
  { name: "The Base", address: "Corner of Te Rapa Road and Wairere Drive, Te Rapa, Hamilton 3200" },
] as const;

const formatPresetLocation = (location: (typeof presetLocations)[number]) =>
  `${location.name} - ${location.address}`;

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTimeForApi = (time: string) => {
  if (!time) return null;
  return time.length === 5 ? `${time}:00` : time;
};

const futureBookingDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return formatDateInput(date);
};
function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, { ...init, credentials: "include", headers: { ...(init.headers ?? {}) } });
}
type ApiBooking = {
  id: string;
  title: string;
  journeyType: string;
  journeyDate: string;
  plannedStartTime: string;
  destination: string;
  status: string;
  createdBy?: string;
  studentCount: number;
  vanRegistration?: string | null;
  driverName?: string | null;
  createdAt?: string;
};
type ApiVan = { id: string; registrationNumber: string; name?: string; capacity: number; status: string };
type ApiStudent = { id: string; name: string; email?: string; studentNumber: string; yearLevel?: string; address?: { addressLine: string; suburb?: string; city?: string; postcode?: string } };
type ApiUser = { id: string; fullName: string; email: string; role: string; status: string };

function formatApiDate(date: string | null | undefined) {
  if (!date) return "Date not specified";
  const normalised = date.trim();
  const value = /^\d{4}-\d{2}-\d{2}$/.test(normalised) ? new Date(`${normalised}T00:00:00`) : new Date(normalised);
  if (Number.isNaN(value.getTime())) return "Date not specified";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

function formatApiTime(time: string | null | undefined) {
  if (!time) return "Time not specified";
  return time.slice(0, 5);
}

function Status({ children }: { children?: string | null }) {
  const label = children?.trim() || "Unknown";
  return <span className={`status status-${label.toLowerCase().replaceAll(" ", "-")}`}><span />{label}</span>;
}

function Logo() {
  return <div className="logo"><img src="https://visioncollege.ac.nz/img/logo.svg" alt="Vision College" /><div><strong>Fleet Booking</strong><small>Transport Management</small></div></div>;
}

function Sidebar({ role, active, setActive, open, setOpen, onLogout }: { role: Role; active: string; setActive: (value: string) => void; open: boolean; setOpen: (value: boolean) => void; onLogout: () => void }) {
  const group = role === "admin" || role === "staff" ? "staff" : "driver";
  const visible = portalNav[group].filter((item) => !item.adminOnly || role === "admin");
  return <>
    {open && <div className="nav-overlay" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-head"><Logo /><button className="icon-button sidebar-close" onClick={() => setOpen(false)} aria-label="Close navigation"><Icon name="close" /></button></div>
      <div className="portal-tag"><Icon name="shield" size={16} /><div><span>{roleNames[role]} portal</span><small>Secure access</small></div></div>
      <nav>
        <span className="nav-label">MAIN MENU</span>
        {visible.map((item) => <button key={item.label} className={`nav-item ${active === item.label ? "active" : ""}`} onClick={() => { setActive(item.label); setOpen(false); }}><Icon name={item.icon} /><span>{item.label}</span>{item.adminOnly && <i>ADMIN</i>}</button>)}
      </nav>
      <div className="sidebar-foot">
        <button className="nav-item" onClick={() => setActive("Profile")}><Icon name="user" /><span>My Profile</span></button>
        <button className="nav-item" onClick={onLogout}><Icon name="logout" /><span>Sign out</span></button>
        <div className="privacy"><Icon name="shield" size={17} /><span>Your data is protected by role-based access.</span></div>
      </div>
    </aside>
  </>;
}

function Header({ role, fullName, setRole, setOpen }: { role: Role; fullName: string; setRole: (value: Role) => void; setOpen: (value: boolean) => void }) {
  return <header className="topbar">
    <button className="icon-button menu-button" onClick={() => setOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button>
    <div className="mobile-logo"><Logo /></div>
    <div className="top-actions">
      <label className="role-switch"><span>Viewing as</span><select value={role} onChange={(e) => setRole(e.target.value as Role)}>{Object.entries(roleNames).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
      <button className="icon-button notification-button" aria-label="Notifications"><Icon name="bell" /><span /></button>
      <div className="profile-chip"><div className="avatar">{fullName.split(" ").map((word) => word[0]).join("").slice(0, 2)}</div><div><strong>{fullName}</strong><span>{roleNames[role]}</span></div></div>
    </div>
  </header>;
}

function MetricCard({ icon, value, label, detail, tone = "blue" }: { icon: IconName; value: string; label: string; detail: string; tone?: string }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon name={icon} /></div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}

function PageTitle({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle: string; action?: ReactNode }) {
  return <div className="page-title"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

function getGreeting(date = new Date()) {
  const hour = Number(new Intl.DateTimeFormat("en-NZ", {
    hour: "numeric",
    hour12: false,
    timeZone: "Pacific/Auckland",
  }).format(date));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function bookingRowsFrom(bookings: ApiBooking[]): BookingRow[] {
  return bookings.map((booking) => ({
    id: booking.id,
    displayId: booking.id.slice(0, 8).toUpperCase(),
    purpose: booking.title,
    requester: booking.createdBy ?? "Unknown",
    date: formatApiDate(booking.journeyDate),
    time: formatApiTime(booking.plannedStartTime),
    van: booking.vanRegistration || "Unassigned",
    driver: booking.driverName || "Unassigned",
    status: booking.status,
  }));
}

function relativeTime(iso: string | undefined) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.max(1, Math.round((Date.now() - then) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function BookingTable({ mine = false, rows: providedRows, onDetails }: { mine?: boolean; rows?: BookingRow[]; onDetails: (id: string) => void }) {
  const rows = providedRows ?? [];
  if (!rows.length) return <div className="empty-state"><p>{mine ? "You have no bookings yet." : "No bookings stored in the database yet."}</p></div>;
  return <div className="table-wrap"><table><thead><tr><th>Booking</th>{!mine && <th>Requested by</th>}<th>Date & time</th><th>Van / driver</th><th>Status</th><th /></tr></thead><tbody>{rows.map((booking) => <tr key={booking.id}><td><strong>{booking.purpose}</strong><span>{booking.displayId ?? booking.id}</span></td>{!mine && <td>{booking.requester}</td>}<td><strong>{booking.date}</strong><span>{booking.time}</span></td><td><strong>{booking.van}</strong><span>{booking.driver}</span></td><td><Status>{booking.status}</Status></td><td><button className="row-action" onClick={() => onDetails(booking.id)}>View <Icon name="arrow" size={15} /></button></td></tr>)}</tbody></table></div>;
}

type FleetSummary = { totalBookings: number; pendingBookings: number; availableVans: number; onJourneyVans: number; maintenanceVans: number; totalVans: number; upcomingJourneys: number };

function StaffDashboard({ role, fullName, setActive, onDetails }: { role: Role; fullName: string; setActive: (value: string) => void; onDetails: (id: string) => void }) {
  const isAdmin = role === "admin";
  const [summary, setSummary] = useState<FleetSummary>({ totalBookings: 0, pendingBookings: 0, availableVans: 0, onJourneyVans: 0, maintenanceVans: 0, totalVans: 0, upcomingJourneys: 0 });
  const [recentBookings, setRecentBookings] = useState<ApiBooking[]>([]);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // The deployed API can take a few seconds to boot (cold start), so retry briefly.
      for (let attempt = 0; attempt < 4; attempt++) {
        if (cancelled) return;
        try {
          const [summaryResponse, bookingsResponse] = await Promise.all([
            apiFetch(`${API_BASE_URL}/fleet/summary`),
            apiFetch(`${API_BASE_URL}/transport-requests`),
          ]);
          if (summaryResponse.ok && bookingsResponse.ok) {
            if (!cancelled) {
              setSummary(await summaryResponse.json() as FleetSummary);
              setRecentBookings(await bookingsResponse.json() as ApiBooking[]);
            }
            return;
          }
        } catch { /* retry below */ }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    };
    load();
    return () => { cancelled = true; };
  }, [role, fullName]);
  const visibleBookings = isAdmin ? recentBookings : recentBookings.filter((booking) => booking.createdBy === fullName);
  const rows = bookingRowsFrom(visibleBookings);
  const pending = visibleBookings.filter((booking) => booking.status === "Pending");
  const oldestPending = pending.reduce<string | undefined>((oldest, booking) => (!oldest || (booking.createdAt && new Date(booking.createdAt) < new Date(oldest))) ? booking.createdAt : oldest, undefined);
  return <>
    <PageTitle eyebrow={isAdmin ? "ADMINISTRATION OVERVIEW" : "MY FLEET ACTIVITY"} title={`${getGreeting()}, ${fullName.split(" ")[0]}`} subtitle={isAdmin ? "Here’s what’s happening across your fleet today." : "Book transport and keep track of your upcoming journeys."} action={<button className="primary-button" onClick={() => setActive("Create Booking")}><Icon name="plus" size={18} /> Create booking</button>} />
    <div className="metrics-grid">
      <MetricCard icon="calendar" value={String(isAdmin ? summary.totalBookings : visibleBookings.length)} label={isAdmin ? "Total bookings" : "My bookings"} detail="Database records" />
      <MetricCard icon="clock" value={String(isAdmin ? summary.pendingBookings : pending.length)} label="Pending requests" detail="Needs attention" tone="amber" />
      <MetricCard icon="bus" value={String(summary.availableVans)} label="Available vans" detail={`Out of ${summary.totalVans} vehicles`} tone="green" />
      <MetricCard icon="route" value={String(summary.upcomingJourneys)} label="Upcoming journeys" detail="Scheduled journeys" tone="purple" />
    </div>
    <div className="dashboard-grid">
      <section className="panel bookings-panel">
        <div className="panel-head"><div><h2>{isAdmin ? "Recent bookings" : "My recent bookings"}</h2><p>{isAdmin ? "Review and manage the latest booking activity" : "Track the status of your submitted requests"}</p></div><button className="text-button" onClick={() => setActive(isAdmin ? "All Bookings" : "My Bookings")}>View all <Icon name="arrow" size={15} /></button></div>
        <BookingTable mine={!isAdmin} rows={rows.slice(0, 5)} onDetails={onDetails} />
      </section>
      <aside className="side-stack">
        <section className="panel attention-card">
          <div className="panel-head"><div><h2>Needs attention</h2><p>Pending actions</p></div><span className="count-badge">{pending.length + summary.maintenanceVans}</span></div>
          <div className="attention-list">
            <button onClick={() => setActive(isAdmin ? "All Bookings" : "My Bookings")}><span className="attention-icon amber"><Icon name="clock" /></span><span><strong>{pending.length === 0 ? "No bookings await review" : pending.length === 1 ? "1 booking awaits review" : `${pending.length} bookings await review`}</strong><small>{pending.length === 0 ? "All caught up" : `Oldest submitted ${relativeTime(oldestPending) || "recently"}`}</small></span><Icon name="arrow" /></button>
            <button onClick={() => setActive("Available Vans")}><span className="attention-icon blue"><Icon name="bus" /></span><span><strong>{summary.maintenanceVans === 0 ? "No vans in maintenance" : `${summary.maintenanceVans} ${summary.maintenanceVans === 1 ? "van is" : "vans are"} in maintenance`}</strong><small>Update status in Manage Vans</small></span><Icon name="arrow" /></button>
          </div>
        </section>
        <section className="panel availability-card"><div className="panel-head"><div><h2>Fleet availability</h2><p>Live vehicle status</p></div></div><div className="donut-row"><div className="donut"><div><strong>{summary.totalVans}</strong><span>Total</span></div></div><div className="legend"><span><i className="green-dot" />Available <b>{summary.availableVans}</b></span><span><i className="navy-dot" />On journey <b>{summary.onJourneyVans}</b></span><span><i className="grey-dot" />Maintenance <b>{summary.maintenanceVans}</b></span></div></div></section>
      </aside>
    </div>
  </>;
}

function CreateBooking({ onDone, openRoute }: { onDone: () => void; openRoute: () => void }) {
  const [journeyType, setJourneyType] = useState<"standard" | "student" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [vans, setVans] = useState<ApiVan[]>([]);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showPassengers, setShowPassengers] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(formatPresetLocation(presetLocations[0]));
  const [destinationLocation, setDestinationLocation] = useState(formatPresetLocation(presetLocations[2]));
  const minimumBookingDate = futureBookingDate();
  const [departureDate, setDepartureDate] = useState(minimumBookingDate);
  const [returnDate, setReturnDate] = useState(minimumBookingDate);

  useEffect(() => {
    Promise.all([
      apiFetch(`${API_BASE_URL}/fleet/vans`).then(async (response) => response.ok ? response.json() : Promise.reject(new Error(await response.text()))),
      apiFetch(`${API_BASE_URL}/fleet/students`).then(async (response) => response.ok ? response.json() : Promise.reject(new Error(await response.text()))),
    ])
      .then(([vanData, studentData]: [ApiVan[], ApiStudent[]]) => {
        setVans(vanData.filter((van) => van.status.toLowerCase() === "available"));
        setStudents(studentData);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load booking options."));
  }, []);

  if (submitted) return (
    <div className="booking-success-page">
      <section className="success-state booking-success-card" aria-live="polite">
        <div className="success-icon"><Icon name="check" size={34} /></div>
        <span className="eyebrow">BOOKING CONFIRMATION</span>
        <h1>Booking request submitted</h1>
        <p className="booking-success-message">
          Your request {submittedId && <strong>({submittedId})</strong>} has been sent to an administrator for review.
          You will be notified when its status changes.
        </p>
        <div className="booking-success-status"><span>Status</span><Status>Pending</Status></div>
        <button className="primary-button booking-success-button" onClick={onDone}>
          View my bookings <Icon name="arrow" size={17} />
        </button>
      </section>
    </div>
  );
  if (!journeyType) return <>
    <PageTitle eyebrow="NEW REQUEST" title="What type of journey do you need?" subtitle="Choose a standard fleet booking or arrange home transport for one or more students." />
    <div className="journey-type-grid">
      <button className="journey-type-card panel" onClick={() => setJourneyType("standard")}><span className="journey-type-icon"><Icon name="bus" size={28} /></span><Status>Standard Van Booking</Status><h2>Standard van booking</h2><p>Book an available van for one pickup, one destination and a passenger group.</p><ul><li>Choose an available van</li><li>Add journey details and passengers</li><li>Submit for administrator approval</li></ul><span className="type-action">Continue with standard booking <Icon name="arrow" /></span></button>
      <button className="journey-type-card panel featured" onClick={() => setJourneyType("student")}><span className="journey-type-icon green"><Icon name="route" size={28} /></span><Status>Student Home Pickup</Status><h2>Student home pickup & drop-off</h2><p>Arrange a multi-stop journey using students’ confirmed saved home addresses.</p><ul><li>Select one or more students</li><li>Confirm private home addresses</li><li>Automatically generate a route</li></ul><span className="type-action">Plan student transport <Icon name="arrow" /></span></button>
    </div>
    <div className="privacy-banner"><Icon name="shield" /><div><strong>Home transport is optional</strong><span>Standard fleet bookings continue to use the existing one-pickup workflow and never require student home addresses.</span></div></div>
  </>;
  if (journeyType === "student") return <StudentTransportForm back={() => setJourneyType(null)} openRoute={openRoute} />;
  return <>
    <button className="back-button" onClick={() => setJourneyType(null)}>← Change journey type</button>
    <PageTitle eyebrow="STANDARD VAN BOOKING" title="Create a van booking" subtitle="Use the existing one-pickup workflow for a college journey." action={<Status>Standard Van Booking</Status>} />
    <div className="form-layout">
      <form className="panel booking-form" onSubmit={async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        const formData = new FormData(e.currentTarget);
        const journeyDate = String(formData.get("journeyDate") ?? "");
        const endDate = String(formData.get("returnDate") ?? "");
        if (journeyDate < minimumBookingDate) {
          setError(`Departure must be at least 48 hours in the future (from ${formatApiDate(minimumBookingDate)}).`);
          return;
        }
        if (endDate && endDate < journeyDate) {
          setError("The expected return date cannot be before the departure date.");
          return;
        }
        setSaving(true);
        const form = new FormData(e.currentTarget);
        const payload = {
          createdById: DEMO_ADMIN_ID,
          journeyType: "StandardVanBooking",
          title: String(form.get("title") ?? ""),
          description: String(form.get("notes") ?? ""),
          journeyDate: String(form.get("journeyDate") ?? ""),
          plannedStartTime: formatTimeForApi(String(form.get("startTime") ?? "")),
          plannedEndTime: formatTimeForApi(String(form.get("endTime") ?? "")),
          standardPickupLocation: String(form.get("pickup") ?? ""),
          destination: String(form.get("destination") ?? ""),
          studentIds: selectedStudentIds,
        };
        try {
          const response = await apiFetch(`${API_BASE_URL}/transport-requests`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!response.ok) throw new Error(await response.text() || `Request failed (${response.status})`);
          const created = await response.json() as { id?: string };
          setSubmittedId(created.id ?? "");
          setSubmitted(true);
        } catch (reason: unknown) {
          setError(reason instanceof Error ? reason.message : "Could not save this booking.");
        } finally {
          setSaving(false);
        }
      }}>
        <div className="form-section"><div className="section-number">1</div><div><h2>Journey information</h2><p>Enter the purpose, date and route for this journey.</p></div></div>
        <div className="form-grid">
          <label className="full">Journey purpose<input required name="title" placeholder="e.g. Networking lab visit" /></label>
          <label className="full">Vehicle preference (optional)<select name="vanId" defaultValue=""><option value="">No preference — assign after approval</option>{vans.map((van) => <option value={van.id} key={van.id}>{van.registrationNumber} · {van.name ?? "College van"} · {van.capacity} seats</option>)}</select></label>
          <label>Departure date<input required name="journeyDate" type="date" min={minimumBookingDate} value={departureDate} onChange={(event) => { setDepartureDate(event.target.value); if (event.target.value > returnDate) setReturnDate(event.target.value); }} /></label>
          <label>Departure time<input required name="startTime" type="time" defaultValue="08:30" /></label>
          <label>Pickup location<select required name="pickup" value={pickupLocation} onChange={(event) => setPickupLocation(event.target.value)}><option value="">Select saved pickup location</option>{presetLocations.map((location) => <option value={formatPresetLocation(location)} key={location.name}>{formatPresetLocation(location)}</option>)}</select></label>
          <label>Destination<select required name="destination" value={destinationLocation} onChange={(event) => setDestinationLocation(event.target.value)}><option value="">Select saved destination</option>{presetLocations.map((location) => <option value={formatPresetLocation(location)} key={location.name}>{formatPresetLocation(location)}</option>)}</select></label>
          <label>Expected return date<input type="date" name="returnDate" min={departureDate} value={returnDate} onChange={(event) => setReturnDate(event.target.value)} /></label>
          <label>Expected return time<input name="endTime" type="time" defaultValue="16:00" /></label>
        </div>
        <div className="form-divider" />
        <div className="form-section"><div className="section-number">2</div><div><h2>Passengers</h2><p>Add the students and staff who will travel.</p></div></div>
        <div className="passenger-summary"><span className="attention-icon blue"><Icon name="users" /></span><div><strong>{selectedStudentIds.length} students selected</strong><small>Staff passengers can be confirmed with the transport coordinator.</small></div><button type="button" className="secondary-button" onClick={() => setShowPassengers((value) => !value)}>{showPassengers ? "Hide passengers" : "Manage passengers"}</button></div>
        {showPassengers && <div className="student-check-grid">{students.map((student) => <label className={`student-check ${selectedStudentIds.includes(student.id) ? "selected" : ""}`} key={student.id}><input type="checkbox" checked={selectedStudentIds.includes(student.id)} onChange={() => setSelectedStudentIds((current) => current.includes(student.id) ? current.filter((id) => id !== student.id) : [...current, student.id])} /><span><strong>{student.name}</strong><small>{student.studentNumber} · {student.yearLevel ?? "Student"}</small></span></label>)}</div>}
        <label className="full notes">Additional notes<textarea name="notes" placeholder="Add accessibility needs, equipment or other information..." rows={4} /></label>
        {error && <div className="form-error" role="alert"><Icon name="close" size={16} />{error}</div>}
        <div className="form-actions"><button type="button" className="secondary-button">Save as draft</button><button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving to database..." : <>Submit request <Icon name="arrow" size={17} /></>}</button></div>
      </form>
      <aside className="panel form-tip"><Icon name="shield" /><h3>Before you submit</h3><p>Requests should be made at least 48 hours before departure. An administrator will assign a van and driver after approval.</p><div><Icon name="check" size={16} />Check journey dates and times</div><div><Icon name="check" size={16} />Confirm all passengers</div><div><Icon name="check" size={16} />Include accessibility needs</div></aside>
    </div>
  </>;
}

function StudentTransportForm({ back, openRoute }: { back: () => void; openRoute: () => void }) {
  const [selected, setSelected] = useState([0, 1, 2]);
  const [destination, setDestination] = useState(formatPresetLocation(presetLocations[0]));
  const minimumBookingDate = futureBookingDate();
  const [journeyDate, setJourneyDate] = useState(minimumBookingDate);
  const toggleStudent = (index: number) => setSelected(selected.includes(index) ? selected.filter((item) => item !== index) : [...selected, index]);
  return <>
    <button className="back-button" onClick={back}>← Change journey type</button>
    <PageTitle eyebrow="STUDENT HOME TRANSPORT" title="Plan pickup and drop-off" subtitle="Select students, confirm their saved addresses and set the required arrival time." action={<Status>Student Home Pickup</Status>} />
    <div className="transport-stepper"><span className="active"><b>1</b>Select students</span><i /><span className="active"><b>2</b>Confirm addresses</span><i /><span><b>3</b>Journey details</span><i /><span><b>4</b>Generate route</span></div>
    <div className="form-layout">
      <form className="panel booking-form" onSubmit={(event) => { event.preventDefault(); openRoute(); }}>
        <div className="form-section"><div className="section-number">1</div><div><h2>Select students</h2><p>Only authorised staff can view saved home addresses.</p></div></div>
        <div className="student-check-grid">{students.map((student, index) => <label className={`student-check ${selected.includes(index) ? "selected" : ""}`} key={student.id}><input type="checkbox" checked={selected.includes(index)} onChange={() => toggleStudent(index)} /><span className={`student-avatar ${student.color}`}>{student.initials}</span><span><strong>{student.name}</strong><small>{student.id}</small></span><Icon name="check" /></label>)}</div>
        <div className="form-divider" />
        <div className="form-section"><div className="section-number">2</div><div><h2>Confirm home pickup addresses</h2><p>Confirm each saved address before route generation.</p></div></div>
        <div className="address-list">{students.filter((_, index) => selected.includes(index)).map((student) => <div className="address-row" key={student.id}><div className={`avatar student-${student.color}`}>{student.initials}</div><div><strong>{student.name}</strong><span><Icon name="location" size={13} /> {student.home}</span></div><label><input type="checkbox" defaultChecked /> Confirmed</label></div>)}</div>
        <div className="form-divider" />
        <div className="form-section"><div className="section-number">3</div><div><h2>Journey details</h2><p>Times will be used to calculate a practical stop order.</p></div></div>
        <div className="form-grid">
          <label className="full">Transport direction<select defaultValue="morning"><option value="morning">Morning pickup</option><option>Return drop-off</option><option>One-way pickup</option><option>One-way drop-off</option><option>Return journey</option></select></label>
          <label>Journey date<input type="date" min={minimumBookingDate} value={journeyDate} onChange={(event) => setJourneyDate(event.target.value)} /></label>
          <label>Required arrival time<input type="time" defaultValue="08:20" /></label>
          <label>Planned first pickup<input type="time" defaultValue="07:30" /></label>
          <label>Destination<select value={destination} onChange={(event) => setDestination(event.target.value)}>{presetLocations.map((location) => <option value={formatPresetLocation(location)} key={location.name}>{formatPresetLocation(location)}</option>)}</select></label>
          <label className="full">Special instructions<textarea rows={3} defaultValue="Call guardian two minutes before arrival. Ama requires assistance with her equipment bag." /></label>
        </div>
        <div className="form-actions"><button type="button" className="secondary-button">Save draft</button><button className="primary-button" type="submit"><Icon name="route" size={17} /> Generate suitable route</button></div>
      </form>
      <aside className="side-stack single-column"><section className="panel transport-summary"><h2>Request summary</h2><div><span>Students</span><strong>{selected.length}</strong></div><div><span>Confirmed addresses</span><strong>{selected.length} of {selected.length}</strong></div><div><span>Journey type</span><strong>Morning pickup</strong></div><div><span>Required arrival</span><strong>08:20 AM</strong></div></section><section className="panel form-tip"><Icon name="shield" /><h3>Private address access</h3><p>Student home details are visible only to authorised administrators and the assigned driver. Families see only their own saved address and timing.</p></section></aside>
    </div>
  </>;
}

function BookingsPage({ mine, onDetails }: { mine: boolean; onDetails: (id: string) => void }) {
  const [apiBookings, setApiBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch(`${API_BASE_URL}/transport-requests`)
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text() || `Request failed (${response.status})`);
        return response.json() as Promise<ApiBooking[]>;
      })
      .then((data) => { if (active) setApiBookings(data); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load bookings."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const rows = bookingRowsFrom(apiBookings);

  return <><PageTitle eyebrow={mine ? "MY REQUESTS" : "BOOKING MANAGEMENT"} title={mine ? "My bookings" : "All bookings"} subtitle={mine ? "View and track every booking request you’ve submitted." : "Review, approve and coordinate transport requests across the college."} action={<button className="primary-button"><Icon name="plus" size={18} /> New booking</button>} /><section className="panel"><div className="filter-bar"><div className="search-field"><Icon name="search" size={18} /><input placeholder="Search bookings..." /></div><select aria-label="Filter by status"><option>All statuses</option><option>Pending</option><option>Approved</option><option>Declined</option></select><select aria-label="Filter by date"><option>All dates</option><option>This week</option><option>This month</option></select></div>{loading ? <div className="empty-state"><p>Loading bookings from the database...</p></div> : error ? <div className="empty-state"><h2>Could not load bookings</h2><p>{error}. Check that the database and the .NET API are running.</p></div> : <BookingTable rows={rows} onDetails={onDetails} />}</section></>;
}

function BookingDetails({ role, bookingId: selectedBookingId, back, onUpdateBooking }: { role: Role; bookingId: string | null; back: () => void; onUpdateBooking: () => void }) {
  const [status, setStatus] = useState("Approved");
  const [bookingId, setBookingId] = useState<string | null>(selectedBookingId);
  const [detail, setDetail] = useState<{ id: string; title: string; journeyType: string; status: string; journeyDate: string; plannedStartTime: string; plannedEndTime?: string; pickupLocation?: string; destination: string; createdBy?: string; students?: Array<{ id: string; name: string; studentNumber?: string; address?: string }> } | null>(null);
  const [showPassengers, setShowPassengers] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [vans, setVans] = useState<ApiVan[]>([]);
  const [drivers, setDrivers] = useState<ApiUser[]>([]);
  const [selectedVanId, setSelectedVanId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  useEffect(() => {
    if (!selectedBookingId) return;
    apiFetch(`${API_BASE_URL}/transport-requests${selectedBookingId ? `/${selectedBookingId}` : ""}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text() || "Could not load booking.");
        return response.json();
      })
      .then((booking) => {
        setDetail({
          ...booking,
          students: Array.isArray(booking?.students) ? booking.students : [],
        });
        setBookingId(booking.id);
        setStatus(booking.status);
      })
      .catch((reason) => setMessage(reason instanceof Error ? reason.message : "Could not load booking."));
  }, [selectedBookingId]);
  useEffect(() => {
    if (role !== "admin") return;
    Promise.all([
      apiFetch(`${API_BASE_URL}/fleet/vans`).then((response) => response.json()),
      apiFetch(`${API_BASE_URL}/fleet/users`).then((response) => response.json()),
    ]).then(([vanData, userData]: [ApiVan[], ApiUser[]]) => {
      setVans(vanData.filter((van) => van.status.toLowerCase() !== "maintenance" && van.status.toLowerCase() !== "inactive"));
      setDrivers(userData.filter((user) => user.role.toLowerCase() === "driver" && user.status === "active"));
    }).catch(() => {});
  }, [role]);
  const saveAssignment = async () => {
    if (!bookingId || !selectedVanId || !selectedDriverId) return;
    setAssignmentSaving(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/transport-requests/${bookingId}/assignment`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vanId: selectedVanId, driverUserId: selectedDriverId }) });
      if (!response.ok) throw new Error(await response.text() || "Could not save assignment.");
      setMessage("Vehicle and driver assignment saved.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Could not save assignment."); }
    finally { setAssignmentSaving(false); }
  };
  const updateStatus = async (nextStatus: string) => {
    if (!bookingId) {
      setMessage("Booking is still loading. Please try again.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await apiFetch(`${API_BASE_URL}/transport-requests/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, reviewNotes: nextStatus === "Declined" ? "Declined by administrator." : null }),
      });
      if (!response.ok) throw new Error(await response.text() || "Could not update booking status.");
      setStatus(nextStatus);
      setMessage(`Booking status updated to ${nextStatus}.`);
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not update booking status.");
    } finally {
      setSaving(false);
    }
  };
  const deleteBooking = async () => {
    if (!bookingId || !window.confirm("Delete this booking permanently?")) return;
    setSaving(true);
    try {
      const response = await apiFetch(`${API_BASE_URL}/transport-requests/${bookingId}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await response.text() || "Could not delete booking.");
      back();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not delete booking.");
    } finally {
      setSaving(false);
    }
  };
  if (!selectedBookingId) return <div className="empty-state"><p>Select a booking from the list to view its details.</p><button className="primary-button" onClick={back}>Back to bookings</button></div>;
  if (!detail) return <div className="empty-state"><p>Loading booking details...</p></div>;
  const passengers = Array.isArray(detail?.students) ? detail.students : [];
  return <><button className="back-button" onClick={back}>← Back to bookings</button><PageTitle eyebrow={`BOOKING ${detail.id?.slice(0, 8).toUpperCase()}`} title={detail.title} subtitle={`Submitted by ${detail.createdBy ?? "Unknown"} on ${formatApiDate(detail.journeyDate)} at ${formatApiTime(detail.plannedStartTime)}`} action={<Status>{status}</Status>} />{message && <div className="form-message">{message}</div>}<div className="detail-grid"><section className="panel detail-main"><div className="detail-hero"><div className="route-point start"><span /><div><small>PICKUP</small><strong>{detail.pickupLocation ?? "Not specified"}</strong><p>{formatApiDate(detail.journeyDate)} · {formatApiTime(detail.plannedStartTime)}</p></div></div><div className="route-line" /><div className="route-point end"><span><Icon name="location" size={14} /></span><div><small>DESTINATION</small><strong>{detail.destination}</strong><p>Return at {detail.plannedEndTime ? formatApiTime(detail.plannedEndTime) : "not specified"}</p></div></div></div><div className="detail-section"><h2>Journey details</h2><div className="info-grid"><div><span>Purpose</span><strong>{detail.title}</strong></div><div><span>Passengers</span><strong>{passengers.length} students</strong></div><div><span>Journey type</span><strong>{detail.journeyType}</strong></div><div><span>Submitted by</span><strong>{detail.createdBy ?? "Unknown"}</strong></div></div></div><div className="detail-section"><h2>Passenger overview</h2><div className="passenger-summary"><div className="avatar-stack">{passengers.slice(0, 3).map((student) => <span key={student.id}>{student.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span>)}{passengers.length > 3 && <span>+{passengers.length - 3}</span>}</div><div><strong>{passengers.length} students</strong><small>Loaded from database</small></div><button className="text-button" onClick={() => setShowPassengers((value) => !value)}>{showPassengers ? "Hide passenger list" : "View passenger list"} <Icon name="arrow" size={15} /></button></div>{showPassengers && <div className="passenger-list">{passengers.map((student) => <div key={student.id}><strong>{student.name}</strong><span>{student.studentNumber ?? "Student"}{student.address ? ` · ${student.address}` : ""}</span></div>)}</div>}</div></section><aside className="side-stack"><section className="panel assignment"><h2>Vehicle assignment</h2><div className="vehicle-image"><Icon name="bus" size={40} /></div>{role === "admin" ? <><label>Van<select value={selectedVanId} onChange={(event) => setSelectedVanId(event.target.value)}><option value="">Select available van</option>{vans.map((van) => <option value={van.id} key={van.id}>{van.registrationNumber} · {van.capacity} seats</option>)}</select></label><label>Driver<select value={selectedDriverId} onChange={(event) => setSelectedDriverId(event.target.value)}><option value="">Select active driver</option>{drivers.map((driver) => <option value={driver.id} key={driver.id}>{driver.fullName}</option>)}</select></label><button className="primary-button full-button" disabled={assignmentSaving || !selectedVanId || !selectedDriverId} onClick={saveAssignment}>{assignmentSaving ? "Saving assignment..." : "Save assignment"}</button></> : <><div className="assignment-row"><span>Assigned van</span><strong>See administrator assignment</strong></div><div className="assignment-row"><span>Driver</span><strong>See administrator assignment</strong></div></>}</section>{role === "admin" &&     <section className="panel admin-actions"><h2>Booking status</h2><label className="status-select-label">Update status<select className="status-select" value={status} disabled={saving} onChange={(event) => updateStatus(event.target.value)}><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Declined">Declined</option></select></label><button className="danger-button full-button" disabled={saving} onClick={deleteBooking}>Delete booking</button></section>}</aside></div></>;
}

function FleetPage({ users = false }: { users?: boolean }) {
  const [vans, setVans] = useState<ApiVan[]>([]);
  const [apiUsers, setApiUsers] = useState<ApiUser[]>([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "staff", registrationNumber: "", name: "", capacity: "15", status: "Available" });
  const refresh = async () => {
    const response = await apiFetch(`${API_BASE_URL}/fleet/${users ? "users" : "vans"}`);
    if (!response.ok) throw new Error(await response.text() || "Could not load data.");
    const data = await response.json();
    if (users) setApiUsers(data); else setVans(data);
  };
  useEffect(() => {
    refresh()
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load fleet data."));
  }, [users]);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      const payload = users
        ? { fullName: form.fullName, email: form.email, password: form.password, role: form.role, status: "active" }
        : { registrationNumber: form.registrationNumber, name: form.name, capacity: Number(form.capacity), status: form.status };
      const response = await apiFetch(`${API_BASE_URL}/fleet/${users ? "users" : "vans"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(await response.text() || "Could not save record.");
      setShowForm(false); await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save record."); }
    finally { setSaving(false); }
  };
  const remove = async (kind: "users" | "vans", id: string) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      const response = await apiFetch(`${API_BASE_URL}/fleet/${kind}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(response.status === 409
          ? "This van is assigned to an active route and cannot be deleted. Unassign it first."
          : detail || "Could not delete record.");
      }
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete record.");
    }
  };
  return <><PageTitle eyebrow={users ? "ACCESS CONTROL" : "FLEET MANAGEMENT"} title={users ? "Manage users and roles" : "Vans and availability"} subtitle={users ? "Control accounts, portal access and role-based permissions." : "Monitor availability, capacity and maintenance across the fleet."} action={<button className="primary-button" onClick={() => setShowForm(true)}><Icon name="plus" size={18} /> {users ? "Add user" : "Add van"}</button>} />{showForm && <form className="panel management-form" onSubmit={save}><div className="form-grid">{users ? <><label>Full name<input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label><label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Password<input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label><label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="staff">Staff / Tutor</option><option value="driver">Driver</option><option value="admin">Administrator</option></select></label></> : <><label>Registration number<input required value={form.registrationNumber} onChange={(event) => setForm({ ...form, registrationNumber: event.target.value })} /></label><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Capacity<input required type="number" min="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} /></label><label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Available</option><option>Maintenance</option><option>Inactive</option></select></label></>}</div><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save"}</button></div></form>}{error ? <section className="panel empty-state"><h2>Could not load database data</h2><p>{error}</p></section> : users ? <section className="panel"><div className="user-list">{apiUsers.map((user) => <div className="user-row" key={user.id}><div className="avatar">{user.fullName.split(" ").map((word) => word[0]).join("")}</div><div><strong>{user.fullName}</strong><span>{user.email}</span></div><Status>{user.status === "active" ? "Approved" : "Declined"}</Status><span className="user-role">{user.role}</span><button className="danger-button" onClick={() => remove("users", user.id)}>Delete</button></div>)}</div></section> : <div className="fleet-grid">{vans.map((van) => <article className="panel van-card" key={van.id}><div className="van-visual"><Icon name="bus" size={52} /><Status>{van.status}</Status></div><h2>{van.registrationNumber}</h2><p>{van.name} · {van.capacity} seats</p><div className="van-stats"><span><small>STATUS</small><strong>{van.status}</strong></span><span><small>CAPACITY</small><strong>{van.capacity} seats</strong></span></div>    <button className={`${van.status.toLowerCase() === "assigned" ? "assigned-button" : "danger-button"} full-button`} disabled={van.status.toLowerCase() === "assigned"} title={van.status.toLowerCase() === "assigned" ? "Unassign this van before deleting it" : "Delete vehicle"} onClick={() => remove("vans", van.id)}>{van.status.toLowerCase() === "assigned" ? "Assigned to route" : "Delete vehicle"}</button></article>)}</div>}</>;
}

type ManagementSection = "drivers" | "students" | "guardians";

function ManagementPage({ section, role }: { section: ManagementSection; role: Role }) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [error, setError] = useState("");
  const [changeRequests, setChangeRequests] = useState<Array<{ id: string; studentName: string; addressLine: string; suburb?: string; city?: string; postcode?: string; status: string }>>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", studentNumber: "", yearLevel: "", addressLine: "", suburb: "", city: "", postcode: "" });
  const content = {
    drivers: { eyebrow: "DRIVER MANAGEMENT", title: "Manage drivers", subtitle: "Review approved drivers, availability and assigned journeys.", action: "Add driver" },
    students: { eyebrow: "STUDENT MANAGEMENT", title: "Manage students", subtitle: "Maintain student records and transport eligibility.", action: "Add student" },
    guardians: { eyebrow: "GUARDIAN MANAGEMENT", title: "Manage guardians", subtitle: "Manage family accounts and linked student access.", action: "Add guardian" },
  }[section];

  useEffect(() => {
    Promise.all([
      apiFetch(`${API_BASE_URL}/fleet/users`).then(async (response) => response.ok ? response.json() : Promise.reject(new Error(await response.text()))),
      apiFetch(`${API_BASE_URL}/fleet/students`).then(async (response) => response.ok ? response.json() : Promise.reject(new Error(await response.text()))),
    ])
      .then(async ([userData, studentData]) => {
        setUsers(userData);
        setStudents(studentData);
        if (section === "students" && (role === "admin" || role === "staff")) {
          const response = await apiFetch(`${API_BASE_URL}/fleet/student-change-requests`, { headers: { "X-Portal-Role": role } });
          if (response.ok) setChangeRequests(await response.json());
        }
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load management data."));
  }, []);

  const listedUsers = section === "drivers"
    ? users.filter((user) => user.role.toLowerCase().includes("driver"))
    : section === "guardians"
      ? users.filter((user) => user.role.toLowerCase().includes("parent") || user.role.toLowerCase().includes("guardian"))
      : [];

  const saveStudent = async (event: FormEvent) => {
    event.preventDefault();
    const response = await apiFetch(`${API_BASE_URL}/fleet/students${editingId ? `/${editingId}` : ""}`, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json", "X-Portal-Role": role }, body: JSON.stringify(form) });
    if (!response.ok) { setError(await response.text() || "Could not create student."); return; }
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", email: "", studentNumber: "", yearLevel: "", addressLine: "", suburb: "", city: "", postcode: "" });
    const refreshed = await apiFetch(`${API_BASE_URL}/fleet/students`);
    if (refreshed.ok) setStudents(await refreshed.json());
  };
  const reviewRequest = async (id: string, status: "approved" | "declined") => {
    const response = await apiFetch(`${API_BASE_URL}/fleet/student-change-requests/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", "X-Portal-Role": role }, body: JSON.stringify({ status }) });
    if (response.ok) setChangeRequests((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  };
  return <><PageTitle eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle} action={<button className="primary-button" onClick={() => { setEditingId(null); setForm({ name: "", email: "", studentNumber: "", yearLevel: "", addressLine: "", suburb: "", city: "", postcode: "" }); setShowForm(true); }}><Icon name="plus" size={18} /> {content.action}</button>} />
    {section === "students" && showForm && <form className="panel booking-form management-form" onSubmit={saveStudent}><div className="panel-head"><div><h2>{editingId ? "Edit student and pickup address" : "Add student and pickup address"}</h2><p>Only staff and administrators can create or directly update student records.</p></div></div><div className="form-grid"><label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Student number<input required value={form.studentNumber} onChange={(event) => setForm({ ...form, studentNumber: event.target.value })} /></label><label>Year level<input value={form.yearLevel} onChange={(event) => setForm({ ...form, yearLevel: event.target.value })} /></label><label className="full">Address line<input required value={form.addressLine} onChange={(event) => setForm({ ...form, addressLine: event.target.value })} /></label><label>Suburb<input value={form.suburb} onChange={(event) => setForm({ ...form, suburb: event.target.value })} /></label><label>City<input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label><label>Postcode<input value={form.postcode} onChange={(event) => setForm({ ...form, postcode: event.target.value })} /></label></div><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" type="submit">Save student</button></div></form>}
    {error ? <section className="panel empty-state"><h2>Could not load database data</h2><p>{error}</p></section> : section === "students" ? <><section className="panel"><div className="filter-bar"><div className="search-field"><Icon name="search" /><input placeholder="Search students..." /></div><select><option>All programmes</option><option>Information Technology</option><option>Cyber Security</option></select></div><div className="user-list">{students.map((student) => <div className="user-row" key={student.id}><div className="avatar">{student.name.split(" ").map((word) => word[0]).join("")}</div><div><strong>{student.name}</strong><span>{student.studentNumber} · {student.yearLevel ?? "Student"} · {student.address?.addressLine ?? "No address recorded"}</span></div><Status>Approved</Status><span className="user-role">Staff/admin editable</span><button className="row-action" onClick={() => { setEditingId(student.id); setForm({ name: student.name, email: student.email ?? "", studentNumber: student.studentNumber, yearLevel: student.yearLevel ?? "", addressLine: student.address?.addressLine ?? "", suburb: student.address?.suburb ?? "", city: student.address?.city ?? "", postcode: student.address?.postcode ?? "" }); setShowForm(true); }}>Edit record <Icon name="arrow" size={15} /></button></div>)}</div></section><section className="panel change-request-panel"><div className="panel-head"><div><h2>Parent change requests</h2><p>Review address updates before they become the current student address.</p></div></div>{changeRequests.length ? changeRequests.map((request) => <div className="user-row" key={request.id}><div className="avatar"><Icon name="shield" size={17} /></div><div><strong>{request.studentName}</strong><span>{request.addressLine}, {request.suburb ?? ""} {request.city ?? ""}</span></div><Status>{request.status === "pending" ? "Pending" : request.status}</Status>{request.status === "pending" && <div className="form-actions"><button className="secondary-button" onClick={() => reviewRequest(request.id, "declined")}>Decline</button><button className="primary-button" onClick={() => reviewRequest(request.id, "approved")}>Approve</button></div>}</div>) : <div className="empty-state"><h2>No pending requests</h2><p>Parent-submitted address changes will appear here for approval.</p></div>}</section></> : <section className="panel"><div className="filter-bar"><div className="search-field"><Icon name="search" /><input placeholder={`Search ${section}...`} /></div><select><option>All statuses</option><option>Active</option><option>Inactive</option></select></div><div className="user-list">{listedUsers.length ? listedUsers.map((user) => <div className="user-row" key={user.id}><div className="avatar">{user.fullName.split(" ").map((word) => word[0]).join("")}</div><div><strong>{user.fullName}</strong><span>{user.email}</span></div><Status>{user.status === "active" ? "Approved" : "Declined"}</Status><span className="user-role">{section === "drivers" ? "Driver account" : "Guardian account"}</span><button className="row-action">Manage <Icon name="arrow" size={15} /></button></div>) : <div className="empty-state"><div className="success-icon"><Icon name={section === "drivers" ? "bus" : "shield"} /></div><h2>No {section} records yet</h2><p>Use “{content.action}” to create the first record.</p></div>}</div></section>}</>;
}

function FamilyDashboard({ role, selectedStudent, setActive }: { role: Role; selectedStudent: number; setActive: (value: string) => void }) {
  const person = role === "student" ? students[0] : students[selectedStudent];
  return <>
    <PageTitle eyebrow={role === "parent" ? "FAMILY OVERVIEW" : "STUDENT JOURNEY PORTAL"} title={`Hello, ${role === "student" ? "Ama" : "Esi"}`} subtitle={role === "parent" ? "Stay up to date with your linked students’ journeys and attendance." : "Here’s your latest journey and attendance information."} />
    {role === "parent" && <div className="student-selector"><div><span>Viewing journey information for</span><strong>{person.name}</strong></div><select value={selectedStudent} onChange={(e) => setActive(`student:${e.target.value}`)}>{students.map((s, i) => <option value={i} key={s.id}>{s.name}</option>)}</select><button className="text-button" onClick={() => setActive("Linked Students")}>View all linked students <Icon name="arrow" size={15} /></button></div>}
    <div className="family-metrics"><MetricCard icon="clock" value="07:34" label="Estimated pickup" detail="Planned for 07:30" /><MetricCard icon="route" value="En route" label="Journey status" detail="Driver approaching" tone="green" /><MetricCard icon="clock" value="08:20" label="Destination ETA" detail="Vision College" tone="purple" /></div>
    <div className="family-grid">
      <section className="panel next-trip"><div className="panel-head"><div><span className="eyebrow">YOUR NEXT PICKUP</span><h2>Morning Student Pickup</h2></div><Status>Driver Approaching</Status></div><div className="approach-banner"><span className="live-pulse" /><div><strong>Driver is approaching your pickup location</strong><small>Estimated in 8 minutes · Updated just now</small></div></div><div className="trip-date"><strong>24</strong><span>JUN<br />TUE</span><div><small>ESTIMATED PICKUP</small><b>07:34 AM</b></div></div><div className="trip-route"><div><span /><small>Your pickup address</small><strong>{person.home}</strong></div><i /><div><span><Icon name="location" size={13} /></span><small>Final destination</small><strong>Vision College Main Campus · ETA 08:20</strong></div></div><div className="trip-assignment"><div className="attention-icon blue"><Icon name="bus" /></div><div><small>VAN</small><strong>VC-03 · Toyota Hiace</strong></div><div className="avatar small">MB</div><div><small>DRIVER</small><strong>Michael Brown</strong></div></div><button className="primary-button full-button" onClick={() => setActive("My Pickup Status")}>View my live pickup status <Icon name="arrow" size={17} /></button></section>
      <aside className="side-stack"><section className="panel attendance-card"><div className="panel-head"><div><h2>Recent attendance</h2><p>Last 3 journeys</p></div><button className="text-button" onClick={() => setActive("Attendance History")}>History</button></div>{[["18 Jun","Cloud Centre Visit","Present","08:24"],["12 Jun","Career Fair","Present","07:52"],["04 Jun","Tech Expo","Absent","—"]].map((a) => <div className="attendance-row" key={a[0]}><div className="date-box"><strong>{a[0].split(" ")[0]}</strong><span>{a[0].split(" ")[1]}</span></div><div><strong>{a[1]}</strong><span>{a[3] === "—" ? "No boarding recorded" : `Boarded at ${a[3]}`}</span></div><Status>{a[2]}</Status></div>)}</section><section className="panel notice"><div className="attention-icon green"><Icon name="bell" /></div><div><h3>Journey reminder</h3><p>{person.name.split(" ")[0]}’s next journey departs in 2 days. Please arrive 15 minutes early.</p></div></section></aside>
    </div>
    <div className="privacy-banner"><Icon name="shield" /><div><strong>Privacy-protected journey view</strong><span>This portal shows only {person.name.split(" ")[0]}’s pickup, timing and final destination. Other students, addresses, ETAs and future stops are never displayed.</span></div></div>
  </>;
}

function LinkedStudents({ onSelect }: { onSelect: (index: number) => void }) {
  const [apiStudents, setApiStudents] = useState<ApiStudent[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    apiFetch(`${API_BASE_URL}/fleet/students`)
      .then(async (response) => { if (!response.ok) throw new Error(await response.text() || `Request failed (${response.status})`); return response.json(); })
      .then(setApiStudents)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load students."));
  }, []);
  return <><PageTitle eyebrow="FAMILY ACCESS" title="Linked students" subtitle="Students connected to your guardian account. Select a student to view their journeys." />{error ? <section className="panel empty-state"><h2>Could not load students</h2><p>{error}</p></section> : <div className="linked-grid">{apiStudents.map((student, i) => <article className="panel student-card" key={student.id}><div className="student-avatar blue">{student.name.split(" ").map((word) => word[0]).join("")}</div><h2>{student.name}</h2><p>{student.yearLevel ?? "Student"}</p><span className="student-id">{student.studentNumber}</span><div className="student-quick"><span><b>2</b> Upcoming</span><span><b>96%</b> Attendance</span></div><button className="primary-button full-button" onClick={() => onSelect(i)}>View journey information <Icon name="arrow" size={16} /></button></article>)}</div>}<div className="privacy-banner"><Icon name="shield" /><div><strong>Private and secure family access</strong><span>You can only view information for students linked to your account. Contact the school office to request a change.</span></div></div></>;
}

function StudentUpdateRequest({ selectedStudent }: { selectedStudent: number }) {
  const person = students[selectedStudent];
  const [address, setAddress] = useState(person.home);
  const [submitted, setSubmitted] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const response = await apiFetch(`${API_BASE_URL}/fleet/student-change-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Portal-Role": "parent" },
      body: JSON.stringify({ studentId: "10000000-0000-0000-0000-000000000001", addressLine: address }),
    });
    if (response.ok) setSubmitted(true);
  };
  return <><PageTitle eyebrow="FAMILY REQUESTS" title="Request student information update" subtitle={`Submit a proposed address change for ${person.name}. A staff member or administrator must approve it before it is used for transport.`} /><section className="panel booking-form"><div className="form-tip"><Icon name="shield" /><div><h3>Approval required</h3><p>Parents and guardians cannot directly change protected student records. Your request will be reviewed by Vision College staff or an administrator.</p></div></div>{submitted ? <div className="empty-state"><div className="success-icon"><Icon name="check" /></div><h2>Request submitted</h2><p>The school transport team will review the proposed address change.</p></div> : <form onSubmit={submit}><div className="form-grid"><label>Student<input value={person.name} readOnly /></label><label>Current address<input value={person.home} readOnly /></label><label className="full">Requested new address<textarea required rows={3} value={address} onChange={(event) => setAddress(event.target.value)} /></label></div><div className="form-actions"><button className="primary-button" type="submit">Submit for approval</button></div></form>}</section></>;
}

const routeStops = [
  { time: "07:30", name: "Ama Boateng", address: "14 Nii Martey Street, East Legon", state: "Picked Up" },
  { time: "07:42", name: "Kojo Boateng", address: "8 Boundary Road, Shiashie", state: "Waiting" },
  { time: "07:55", name: "Nana Boateng", address: "27 Jungle Avenue, Dzorwulu", state: "Waiting" },
  { time: "08:20", name: "Vision College", address: "Main Campus · Final destination", state: "Not Started" },
];

function RoutePlanning({ monitor = false }: { monitor?: boolean }) {
  const [approved, setApproved] = useState(false);
  const [orderedStops, setOrderedStops] = useState(routeStops);
  const [routeId, setRouteId] = useState("");
  const [monitoring, setMonitoring] = useState<{ completedStops: number; totalStops: number } | null>(null);
  const [draggedStop, setDraggedStop] = useState<number | null>(null);
  useEffect(() => {
    apiFetch(`${API_BASE_URL}/journeys/${monitor ? "monitoring" : "route"}`)
      .then(async (response) => { if (!response.ok) throw new Error(await response.text() || "Could not load route."); return response.json(); })
      .then((route: { id?: string; stops: Array<{ order: number; address: string; plannedArrival?: string; actualArrival?: string }>; completedStops?: number; totalStops?: number }) => {
        if (route.id) setRouteId(route.id);
        if (typeof route.completedStops === "number") setMonitoring({ completedStops: route.completedStops, totalStops: route.totalStops ?? route.stops.length });
        setOrderedStops(route.stops.map((stop, index) => ({
          time: stop.plannedArrival?.slice(0, 5) ?? "--:--",
          name: index === route.stops.length - 1 ? "Vision College" : `Pickup stop ${index + 1}`,
          address: stop.address,
          state: stop.actualArrival ? "Picked Up" : "Waiting",
        })));
      })
      .catch(() => {});
  }, []);
  const saveRoute = async () => {
    if (!routeId) return;
    const response = await apiFetch(`${API_BASE_URL}/journeys/route/${routeId}/stops`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stops: orderedStops.map((stop) => ({ address: stop.address, plannedArrival: stop.time === "--:--" ? null : `${stop.time}:00` })) }),
    });
    if (!response.ok) throw new Error(await response.text() || "Could not save route.");
    setApproved(true);
  };
  const moveStop = (target: number) => {
    if (draggedStop === null || draggedStop === target || target === orderedStops.length - 1) return;
    const next = [...orderedStops];
    const [moved] = next.splice(draggedStop, 1);
    next.splice(target, 0, moved);
    setOrderedStops(next);
    setDraggedStop(target);
    setApproved(false);
  };
  return <>
    <PageTitle eyebrow={monitor ? "ACTIVE JOURNEY · JR-208" : "AUTOMATIC ROUTE PLANNING"} title={monitor ? "Morning pickup in progress" : "Review generated route"} subtitle={monitor ? "Track vehicle progress, student boarding and live estimates." : "The route is optimised for arrival by 08:20. Drag stops to manually adjust the order."} action={<Status>{monitor ? "Journey In Progress" : approved ? "Route Approved" : "Awaiting Admin Review"}</Status>} />
    <div className="route-metrics"><MetricCard icon="location" value={String(monitoring?.totalStops ?? orderedStops.length)} label="Route stops" detail={`${monitoring?.completedStops ?? 0} completed`} /><MetricCard icon="clock" value={monitor ? "Live" : "Planned"} label="Journey status" detail={monitor ? "Database monitoring" : "Saved route plan"} tone="purple" /><MetricCard icon="bus" value="Assigned" label="Vehicle status" detail="From route assignment" tone="green" /></div>
    <div className="route-planning-grid">
      <section className="panel route-order-panel">      <div className="panel-head"><div><h2>{monitor ? "Live route progress" : "Pickup stop order"}</h2><p>{monitor ? `${monitoring?.completedStops ?? 0} of ${monitoring?.totalStops ?? orderedStops.length} stops completed` : "Generated from distance, travel time and required arrival"}</p></div>{!monitor && <span className="optimised-label"><Icon name="check" size={14} /> Saved route data</span>}</div>
        <div className="stop-list">{orderedStops.map((stop, index) => <div className={`stop-order ${index === 1 && monitor ? "next" : ""}`} draggable={!monitor && index !== orderedStops.length - 1} onDragStart={() => setDraggedStop(index)} onDragOver={(event) => { event.preventDefault(); moveStop(index); }} onDragEnd={() => setDraggedStop(null)} key={`${stop.name}-${index}`}><span className="drag-handle">{monitor ? index + 1 : "⠿"}</span><div className={`stop-marker ${index === orderedStops.length - 1 ? "destination" : ""}`}>{index === orderedStops.length - 1 ? <Icon name="location" size={15} /> : index + 1}</div><div><strong>{stop.name}</strong><span>{stop.address}</span></div><div className="stop-eta"><small>{index === orderedStops.length - 1 ? "ARRIVAL" : "PICKUP"}</small><strong>{stop.time}</strong></div>{monitor ? <Status>{stop.state}</Status> : <button className="icon-button" aria-label="Edit stop">•••</button>}</div>)}</div>
        {!monitor && <div className="route-actions"><button className="secondary-button" type="button" onClick={() => setOrderedStops((items) => [...items.slice(0, -1), { time: "--:--", name: `Pickup stop ${items.length}`, address: "New stop address", state: "Waiting" }, items[items.length - 1]])}><Icon name="plus" size={16} /> Add stop</button><button className="secondary-button" onClick={() => { setOrderedStops(routeStops); setApproved(false); }}><Icon name="route" size={16} /> Regenerate</button><button className="primary-button" onClick={() => { saveRoute().catch(() => {}); }} disabled={!routeId}><Icon name="check" size={16} /> Confirm final route</button></div>}
      </section>
      <aside className="side-stack single-column"><section className="panel mini-route-map"><div className="mock-map"><div className="map-road one" /><div className="map-road two" /><div className="map-route" /><span className="map-pin start"><Icon name="bus" size={18} /></span><span className="map-pin end"><Icon name="location" size={18} /></span></div><div className="map-caption"><span><i className="green-dot" /> Vehicle {monitor ? "moving" : "start"}</span><span><i className="navy-dot" /> Vision College</span></div></section><section className="panel assignment assign-route"><h2>Driver & van assignment</h2><label>Assigned driver<select defaultValue="Michael Brown"><option>Michael Brown</option><option>Kwame Asare</option></select></label><label>Assigned van<select defaultValue="VC-03"><option>VC-03 · Toyota Hiace</option><option>VC-04 · Toyota Hiace</option></select></label><button className="primary-button full-button">{monitor ? "Contact driver" : "Save assignment"}</button></section></aside>
    </div>
  </>;
}

function PrivateJourneyStatus({ selectedStudent }: { selectedStudent: number }) {
  const person = students[selectedStudent];
  return <>
    <PageTitle eyebrow="PRIVATE STUDENT JOURNEY" title={`${person.name}’s pickup status`} subtitle="Only information related to this student is shown." action={<Status>Driver Approaching</Status>} />
    <div className="private-status-grid">
      <section className="panel pickup-focus"><div className="pickup-orbit"><Icon name="bus" size={30} /><span /></div><span className="eyebrow">DRIVER APPROACHING</span><h2>Estimated pickup at 07:34 AM</h2><p>Michael is on the way to your pickup location. Please be ready at the confirmed address.</p><div className="eta-shift"><span>Planned pickup <strong>07:30</strong></span><Icon name="arrow" /><span>Current estimate <strong>07:34</strong></span></div><div className="own-address"><Icon name="location" /><div><small>YOUR CONFIRMED PICKUP ADDRESS</small><strong>{person.home}</strong></div></div></section>
      <aside className="side-stack single-column"><section className="panel private-timeline"><h2>Your journey timeline</h2>{[["Driver assigned","Michael Brown · VC-03","done"],["Driver en route","07:12 AM","done"],["Driver approaching","Estimated 07:34 AM","current"],["Picked up","Boarding time will appear here",""],["Arrive at Vision College","Estimated 08:20 AM",""]].map((item) => <div className={`private-step ${item[2]}`} key={item[0]}><span>{item[2] === "done" ? <Icon name="check" size={13} /> : ""}</span><div><strong>{item[0]}</strong><small>{item[1]}</small></div></div>)}</section><section className="panel privacy-lock"><Icon name="shield" /><div><strong>Other route stops are hidden</strong><p>For student safety, you cannot see other students, private addresses, stop order or the driver’s exact route.</p></div></section></aside>
    </div>
  </>;
}

function DriverRoutePage() {
  const [states, setStates] = useState<Record<number, string>>({ 0: "Picked Up", 1: "Waiting", 2: "Waiting" });
  return <>
    <PageTitle eyebrow="CURRENT JOURNEY · JR-208" title="Complete morning pickup route" subtitle="Tuesday, 24 June · VC-03 · Required arrival 08:20" action={<Status>Journey In Progress</Status>} />
    <div className="driver-progress-card"><div><span>ROUTE PROGRESS</span><strong>1 of 4 stops completed</strong></div><div className="progress-track"><i /></div><b>25%</b></div>
    <div className="route-planning-grid">
      <section className="panel"><div className="next-stop-head"><span className="live-pulse" /><div><small>NEXT STOP · PLANNED 07:42 AM</small><h2>Kojo Boateng</h2><p><Icon name="location" size={15} /> 8 Boundary Road, Shiashie</p></div><Status>{states[1] || "Waiting"}</Status></div><div className="guardian-note"><div><small>GUARDIAN CONTACT</small>      <strong>Adwoa Boateng · +64 21 555 0173</strong></div><div><small>SPECIAL NOTE</small><strong>Call two minutes before arrival</strong></div></div><div className="driver-primary-actions"><button className="secondary-button"><Icon name="location" /> Open map</button><button className="primary-button"><Icon name="route" /> Start navigation</button></div><div className="driver-status-actions"><button onClick={() => setStates({ ...states, 1: "Picked Up" })}><Icon name="check" /> Mark picked up</button><button onClick={() => setStates({ ...states, 1: "Absent" })}>Mark absent</button><button onClick={() => setStates({ ...states, 1: "Picked Up" })}><Icon name="clock" /> Record boarding time</button></div></section>
      <aside className="panel compact-stop-list"><div className="panel-head"><div><h2>All route stops</h2><p>Complete route visible to assigned driver</p></div></div>{routeStops.map((stop, index) => <div className={`compact-stop ${index === 1 ? "current" : ""}`} key={stop.name}><span>{index + 1}</span><div><strong>{stop.name}</strong><small>{stop.time} · {stop.address}</small></div><Status>{states[index] || stop.state}</Status></div>)}</aside>
    </div>
    <div className="privacy-banner driver-safety"><Icon name="shield" /><div><strong>Authorised route access</strong><span>Addresses and guardian contacts are provided only for this assigned journey. Do not share or retain private student information.</span></div><button className="danger-button">Report route problem</button></div>
  </>;
}

function JourneyDetails({ driver = false }: { driver?: boolean }) {
  return <><PageTitle eyebrow={driver ? "ROUTE VC-JR-208" : "UPCOMING JOURNEY"} title="Networking Lab Visit" subtitle="Tuesday, 24 June 2025 · Departure at 08:30 AM" action={<Status>Approved</Status>} /><div className="detail-grid"><section className="panel map-panel"><div className="saved-location-preview"><div className="saved-location-line"><span className="saved-location-dot start" /><div><small>FROM</small><strong>Vision College Hamilton</strong><p>21 Ruakura Road, Hamilton 3216</p></div></div><div className="saved-location-path"><span /><span /><span /></div><div className="saved-location-line"><span className="saved-location-dot destination"><Icon name="location" size={14} /></span><div><small>TO</small><strong>Hamilton Central Library</strong><p>9 Garden Place, Hamilton 3204</p></div></div></div><div className="route-summary"><div><small>DEPARTURE</small><strong>Vision College Hamilton</strong><span>08:30 AM</span></div><Icon name="arrow" /><div><small>ARRIVAL</small><strong>Hamilton Central Library</strong><span>Estimated from saved route</span></div></div></section><aside className="side-stack"><section className="panel"><h2>Journey information</h2><div className="info-list"><div><Icon name="calendar" /><span><small>Date</small><strong>24 June, 2025</strong></span></div><div><Icon name="bus" /><span><small>Assigned van</small><strong>VC-04 · Toyota Hiace</strong></span></div><div><Icon name="user" /><span><small>Driver</small><strong>Kwame Asare</strong></span></div><div><Icon name="users" /><span><small>Passengers</small><strong>12 confirmed</strong></span></div></div></section>{driver && <button className="primary-button full-button">Start journey <Icon name="arrow" /></button>}</aside></div></>;
}

function AttendancePage({ driver = false }: { driver?: boolean }) {
  const [attendance, setAttendance] = useState<Record<number, string>>({ 0: "Picked Up", 1: "Waiting", 3: "Absent" });
  const [databaseAttendance, setDatabaseAttendance] = useState<Array<{ id: string; name: string; status: string }>>([]);
  useEffect(() => {
    apiFetch(`${API_BASE_URL}/journeys/attendance`)
      .then(async (response) => { if (!response.ok) throw new Error(await response.text() || "Could not load attendance."); return response.json(); })
      .then(setDatabaseAttendance)
      .catch(() => {});
  }, []);
  const saveAttendance = async (id: string, status: string) => {
    await apiFetch(`${API_BASE_URL}/journeys/attendance/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: status.toLowerCase().replace(" ", "_") }) });
  };
  const passengerNames = ["Ama Boateng", "Kojo Boateng", "Nana Boateng", "Yaw Mensah", "Linda Asante", "Richard Koomson"];
  return <><PageTitle eyebrow={driver ? "PASSENGER CHECK-IN" : "STUDENT RECORD"} title={driver ? "Passenger attendance & times" : "Attendance history"} subtitle={driver ? "Morning Student Pickup · Database records" : "Review journey attendance and recorded boarding times."} action={driver ? <button className="primary-button">Save attendance</button> : undefined} /><section className="panel"><div className="attendance-summary"><div><strong>{databaseAttendance.filter((item) => item.status === "picked_up").length}</strong><span>Picked up</span></div><div><strong>{databaseAttendance.filter((item) => item.status === "absent").length}</strong><span>Absent</span></div><div><strong>{databaseAttendance.filter((item) => item.status === "pending").length}</strong><span>Waiting</span></div></div><div className="attendance-table">{databaseAttendance.map((item) => <div className="attendance-record" key={item.id}><div className="avatar">{item.name.split(" ").map((word) => word[0]).join("")}</div><div><strong>{item.name}</strong><span>{item.recordedAt ? `Recorded ${new Date(item.recordedAt).toLocaleTimeString()}` : "No time recorded"}</span></div><div className="attendance-controls four"><button onClick={() => saveAttendance(item.id, "Waiting")}>Waiting</button><button onClick={() => saveAttendance(item.id, "Picked Up")}>Picked Up</button><button onClick={() => saveAttendance(item.id, "Absent")}>Absent</button><button onClick={() => saveAttendance(item.id, "Dropped Off")}>Dropped Off</button></div></div>)}</div></section></>;
}

function DriverDashboard({ setActive }: { setActive: (value: string) => void }) {
  return <><PageTitle eyebrow="DRIVER PORTAL" title="Good morning, Kwame" subtitle="Your current student pickup is in progress. The next stop is planned for 07:42." />
    <div className="driver-current">
      <div className="driver-current-head"><div><span className="live-pulse" /><small>JOURNEY IN PROGRESS</small><h2>Morning Student Pickup</h2><p>Route JR-208 · Van VC-03 · 4 total stops</p></div><Status>Journey In Progress</Status></div>
      <div className="driver-route-progress"><div><span>1</span><small>STOP COMPLETED</small></div><div className="progress-track"><i /></div><div><strong>25%</strong><small>ROUTE PROGRESS</small></div></div>
      <div className="next-stop-card"><span className="next-label">NEXT STOP</span><div className="student-avatar green">KB</div><div><h3>Kojo Boateng</h3><p><Icon name="location" size={14} /> 8 Boundary Road, Shiashie</p><span>Planned pickup · <strong>07:42 AM</strong></span></div><div className="next-eta"><small>ARRIVE IN</small><strong>6 min</strong></div></div>
      <div className="driver-dashboard-actions"><button className="light-button" onClick={() => setActive("Complete Route")}><Icon name="location" /> Open map</button><button className="primary-button" onClick={() => setActive("Complete Route")}><Icon name="route" /> Navigate to next stop</button><button className="light-button" onClick={() => setActive("Passenger Attendance")}><Icon name="check" /> Record pickup</button></div>
    </div>
    <div className="family-metrics"><MetricCard icon="route" value="2" label="Assigned today" detail="1 currently active" /><MetricCard icon="bus" value="VC-03" label="Assigned van" detail="Toyota Hiace · 15 seats" tone="green" /><MetricCard icon="users" value="3 / 4" label="Students remaining" detail="1 student picked up" tone="purple" /></div>
    <section className="panel"><div className="panel-head"><div><h2>Today’s assigned journeys</h2><p>Tuesday, 24 June 2025</p></div><button className="text-button">View all</button></div>{[["07:30","Morning Student Pickup","East Legon → Vision College","3 students"],["15:30","Return Student Transport","Vision College → Home stops","3 students"]].map((j, i) => <div className="journey-row" key={j[0]}><div className="journey-time"><strong>{j[0]}</strong><span>{i ? "PM" : "AM"}</span></div><div className="timeline-dot"><span /><i /></div><div><strong>{j[1]}</strong><span><Icon name="location" size={14} /> {j[2]}</span></div><div className="passenger-count"><Icon name="users" size={17} />{j[3]}</div><Status>{i ? "Driver Assigned" : "Journey In Progress"}</Status><button className="row-action" onClick={() => setActive("Complete Route")}>Details <Icon name="arrow" /></button></div>)}</section></>;
}

function GenericPage({ title }: { title: string }) {
  const notifications = title === "Notifications";
  const [profile, setProfile] = useState<{ fullName: string; email: string; role: string } | null>(null);
  useEffect(() => {
    if (notifications) return;
    apiFetch(`${API_BASE_URL}/auth/me`)
      .then((response) => (response.ok ? response.json() : null))
      .then((session: { fullName: string; email: string; role: string } | null) => setProfile(session))
      .catch(() => {});
  }, [notifications]);
  return <><PageTitle eyebrow={notifications ? "NOTIFICATION CENTRE" : "ACCOUNT SETTINGS"} title={title} subtitle={notifications ? "Review important journey, booking and fleet updates." : "Manage your Vision College portal profile and access preferences."} action={!notifications && <button className="primary-button">Edit profile</button>} /><div className="dashboard-grid"><section className="panel"><div className="panel-head"><div><h2>{notifications ? "Recent notifications" : "Profile information"}</h2><p>{notifications ? "Latest updates from the fleet operations team." : "Your account details and role permissions."}</p></div></div>{(notifications ? [["Booking approved","Networking Lab Visit was approved for 24 June.","Today"],["Route updated","Morning pickup route has been optimised.","Yesterday"],["Attendance recorded","Ama Boateng was marked picked up.","18 Jun"]]   : [["Full name", profile?.fullName ?? "Loading..."], ["Email address", profile?.email ?? "Loading..."], ["Portal role", profile ? (roleNames[profile.role as Role] ?? profile.role) : "Loading..."], ["Account status", "Approved"]]).map((item) => <div className="user-row" key={item[0]}><div className="avatar"><Icon name={notifications ? "bell" : "user"} size={17} /></div><div><strong>{item[0]}</strong><span>{item[1]}</span></div><span className="user-role">{item[2] ?? "Secure access"}</span></div>)}</section><aside className="side-stack"><section className="panel notice"><div className="attention-icon blue"><Icon name="shield" /></div><div><h3>Secure portal access</h3><p>Your Vision College information is protected by role-based access control.</p></div></section><section className="panel form-tip"><Icon name="check" /><h3>Everything is up to date</h3><p>No action is required at this time.</p></section></aside></div></>;
}

function Login({ onLogin }: { onLogin: (role: Role, email: string, password: string, rememberMe: boolean) => Promise<string | null> }) {
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const requestReset = async (event: FormEvent) => {
    event.preventDefault();
    setResetLoading(true);
    setResetMessage("");
    try {
      const response = await apiFetch(`${API_BASE_URL}/auth/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: resetEmail }) });
      if (!response.ok) throw new Error(await response.text() || "Could not request password reset.");
      const result = await response.json() as { message: string };
      setResetMessage(result.message);
    } catch (reason) {
      setResetMessage(reason instanceof Error ? reason.message : "Could not request password reset.");
    } finally {
      setResetLoading(false);
    }
  };
  return <div className="login-page"><section className="login-brand"><Logo /><div className="login-copy"><span className="eyebrow">VISION COLLEGE SCHOOL OF ICT</span><h1>Every journey,<br />managed with care.</h1><p>A secure, connected fleet platform for staff and drivers.</p><div className="trust-row"><span><Icon name="shield" /> Role-based access</span><span><Icon name="route" /> Live journey updates</span></div></div><div className="brand-pattern" /></section><section className="login-form-wrap">{showReset ? <form className="login-card" onSubmit={requestReset}><span className="eyebrow">ACCOUNT RECOVERY</span><h2>Reset your password</h2><p>Enter your college email to request reset instructions.</p>{resetMessage && <div className="form-message">{resetMessage}</div>}<label>College email<input required type="email" autoComplete="email" placeholder="name@visioncollege.ac.nz" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} /></label><button className="primary-button login-button" type="submit" disabled={resetLoading}>{resetLoading ? "Requesting..." : "Request reset instructions"}</button><button className="back-button" type="button" onClick={() => { setShowReset(false); setResetMessage(""); }}>← Back to sign in</button></form> : <form className="login-card" onSubmit={async (e) => { e.preventDefault(); setLoading(true); setError(""); const message = await onLogin(role, email, password, rememberMe); if (message) setError(message); setLoading(false); }}><div className="mobile-login-logo"><Logo /></div><span className="eyebrow">SECURE PORTAL</span><h2>Welcome back</h2><p>Sign in to access your fleet portal.</p>{error && <div className="form-message error">{error}</div>}<label>Portal access<select value={role} onChange={(e) => setRole(e.target.value as Role)}>{Object.entries(loginRoleNames).map(([key, value]) => <option value={key} key={key}>{value}</option>)}</select></label><label>Email address<input required type="email" autoComplete="email" placeholder="name@visioncollege.ac.nz" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<div className="password-field"><input required type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div></label><div className="login-options"><label><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />Remember me</label><button type="button" onClick={() => setShowReset(true)}>Forgot password?</button></div><button className="primary-button login-button" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in securely"} {!loading && <Icon name="arrow" />}</button><div className="login-help"><Icon name="shield" /><span>Having trouble signing in? Contact the ICT support desk.</span></div></form>}</section></div>;
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>("admin");
  const [fullName, setFullName] = useState(profileNames.admin);
  const [checkingSession, setCheckingSession] = useState(true);
  const routeFromLocation = () => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
    const hash = window.location.hash.replace(/^#/, "");
    const route = path || hash;
    const labels: Record<string, string> = {
      dashboard: "Dashboard",
      "create-booking": "Create Booking",
      "available-vans": "Available Vans",
      "my-bookings": "My Bookings",
      "transport-requests": "Transport Requests",
      "all-bookings": "All Bookings",
      "booking-details": "Booking Details",
      "route-planning": "Route Planning",
      "live-monitoring": "Live Monitoring",
      "manage-vans": "Manage Vans",
      "manage-drivers": "Manage Drivers",
      "manage-students": "Manage Students",
      "manage-guardians": "Manage Guardians",
      "manage-users": "Manage Users",
      profile: "Profile",
    };
    return labels[route.split("/")[0]] ?? "Dashboard";
  };
  const bookingIdFromLocation = () => {
    const pathParts = window.location.pathname.replace(/^\/+|\/+$/g, "").split("/");
    return pathParts[0] === "booking-details" && pathParts[1] ? pathParts[1] : null;
  };
  const [active, setActiveState] = useState(routeFromLocation);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(0);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(bookingIdFromLocation);

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/auth/me`)
      .then(async (response) => response.ok ? response.json() : null)
      .then((session: { role: Role; fullName: string } | null) => {
        if (session) {
          setRole(session.role);
          setFullName(session.fullName);
          setLoggedIn(true);
        }
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const setActive = (value: string) => {
    if (value.startsWith("student:")) {
      setSelectedStudent(Number(value.split(":")[1]));
      setActiveState("Dashboard");
    } else {
      const route = value.toLowerCase().replaceAll(" ", "-");
      setActiveState(value);
      window.history.pushState(null, "", `/${route}/`);
    }
  };
  const openBookingDetails = (id: string) => {
    setSelectedBookingId(id);
    setActiveState("Booking Details");
    window.history.pushState(null, "", `/booking-details/${id}/`);
  };

  useEffect(() => {
    const onPopState = () => {
      setActiveState(routeFromLocation());
      setSelectedBookingId(bookingIdFromLocation());
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onPopState);
    };
  }, []);

  useEffect(() => {
    if (active === "Booking Details" && !selectedBookingId) {
      setActive(role === "admin" ? "All Bookings" : "My Bookings");
    }
  }, [active, role, selectedBookingId]);

  const changeRole = (next: Role) => {
    setRole(next);
    setActiveState("Dashboard");
  };

  const page = useMemo(() => {
    if (role === "admin" || role === "staff") {
      if (active === "Dashboard") return <StaffDashboard role={role} fullName={fullName} setActive={setActive} onDetails={openBookingDetails} />;
      if (active === "Create Booking") return <CreateBooking onDone={() => setActive("My Bookings")} openRoute={() => setActive(role === "admin" ? "Route Planning" : "Transport Requests")} />;
      if (active === "My Bookings" || active === "All Bookings") return <BookingsPage mine={active === "My Bookings"} onDetails={openBookingDetails} />;
      if (active === "Transport Requests") return <BookingsPage mine={role === "staff"} onDetails={openBookingDetails} />;
      if (active === "Booking Details") return <BookingDetails role={role} bookingId={selectedBookingId} back={() => setActive(role === "admin" ? "All Bookings" : "My Bookings")} onUpdateBooking={() => setActive("Create Booking")} />;
      if (active === "Route Planning") return <RoutePlanning />;
      if (active === "Live Monitoring") return <RoutePlanning monitor />;
      if (active === "Available Vans" || active === "Manage Vans") return <FleetPage />;
      if (active === "Manage Users") return <FleetPage users />;
      if (active === "Manage Drivers") return <ManagementPage section="drivers" role={role} />;
      if (active === "Manage Students") return <ManagementPage section="students" role={role} />;
      if (active === "Manage Guardians") return <ManagementPage section="guardians" role={role} />;
    }
    if (role === "driver") {
      if (active === "Dashboard" || active === "Assigned Journeys") return <DriverDashboard setActive={setActive} />;
      if (active === "Complete Route" || active === "Journey Progress") return <DriverRoutePage />;
      if (active === "Passenger List" || active === "Passenger Attendance") return <AttendancePage driver />;
    }
    return <GenericPage title={active} />;
  }, [active, role, fullName, selectedStudent, selectedBookingId]);

  if (checkingSession) return <div className="loading-screen">Checking secure session...</div>;
  if (!loggedIn) return <Login onLogin={async (next, email, password, rememberMe) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, rememberMe }) });
      if (!response.ok) return await response.text() || "Unable to sign in.";
      changeRole(next);
      const session = await response.json() as { fullName: string };
      setFullName(session.fullName);
      setLoggedIn(true);
      return null;
    } catch (reason) {
      return reason instanceof Error ? reason.message : "Unable to sign in.";
    }
  }} />;

  return <div className="app-shell"><Sidebar role={role} active={active} setActive={setActive} open={menuOpen} setOpen={setMenuOpen} onLogout={async () => { await apiFetch(`${API_BASE_URL}/auth/logout`, { method: "POST" }); setLoggedIn(false); }} /><div className="main-shell"><Header role={role} fullName={fullName} setRole={changeRole} setOpen={setMenuOpen} /><main className="page-content">{page}</main><footer><span>© 2025 Vision College School of ICT</span><span>Fleet Operations · Secure portal</span></footer></div></div>;
}
