import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

type Role = "admin" | "staff" | "student" | "parent" | "driver";
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
  student: "Student",
  parent: "Parent / Guardian",
  driver: "Driver",
};

const profileNames: Record<Role, string> = {
  admin: "Olivia Mensah",
  staff: "Daniel Owusu",
  student: "Ama Boateng",
  parent: "Esi Boateng",
  driver: "Kwame Asare",
};

type NavItem = { label: string; icon: IconName; adminOnly?: boolean };
const portalNav: Record<"staff" | "family" | "driver", NavItem[]> = {
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
  family: [
    { label: "Dashboard", icon: "grid" },
    { label: "Linked Students", icon: "users" },
    { label: "Request Student Update", icon: "calendar" },
    { label: "Upcoming Trips", icon: "route" },
    { label: "My Pickup Status", icon: "location" },
    { label: "Live Journey Status", icon: "clock" },
    { label: "Attendance History", icon: "history" },
    { label: "Notifications", icon: "bell" },
    { label: "Profile", icon: "user" },
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

type BookingRow = { id: string; purpose: string; requester: string; date: string; time: string; van: string; driver: string; status: string };
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

const API_BASE_URL = "http://localhost:5075/api";
const DEMO_ADMIN_ID = "00000000-0000-0000-0000-000000000001";
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
};
type ApiVan = { id: string; registrationNumber: string; name?: string; capacity: number; status: string };
type ApiStudent = { id: string; name: string; email?: string; studentNumber: string; yearLevel?: string; address?: { addressLine: string; suburb?: string; city?: string; postcode?: string } };
type ApiUser = { id: string; fullName: string; email: string; role: string; status: string };

function formatApiDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function formatApiTime(time: string) {
  return time.slice(0, 5);
}

function Status({ children }: { children: string }) {
  return <span className={`status status-${children.toLowerCase().replaceAll(" ", "-")}`}><span />{children}</span>;
}

function Logo() {
  return <div className="logo"><img src="https://visioncollege.ac.nz/img/logo.svg" alt="Vision College" /><div><strong>Fleet Booking</strong><small>Transport Management</small></div></div>;
}

function Sidebar({ role, active, setActive, open, setOpen, onLogout }: { role: Role; active: string; setActive: (value: string) => void; open: boolean; setOpen: (value: boolean) => void; onLogout: () => void }) {
  const group = role === "admin" || role === "staff" ? "staff" : role === "driver" ? "driver" : "family";
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

function Header({ role, setRole, setOpen }: { role: Role; setRole: (value: Role) => void; setOpen: (value: boolean) => void }) {
  return <header className="topbar">
    <button className="icon-button menu-button" onClick={() => setOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button>
    <div className="mobile-logo"><Logo /></div>
    <div className="top-actions">
      <label className="role-switch"><span>Viewing as</span><select value={role} onChange={(e) => setRole(e.target.value as Role)}>{Object.entries(roleNames).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
      <button className="icon-button notification-button" aria-label="Notifications"><Icon name="bell" /><span /></button>
      <div className="profile-chip"><div className="avatar">{profileNames[role].split(" ").map((word) => word[0]).join("")}</div><div><strong>{profileNames[role]}</strong><span>{roleNames[role]}</span></div></div>
    </div>
  </header>;
}

function MetricCard({ icon, value, label, detail, tone = "blue" }: { icon: IconName; value: string; label: string; detail: string; tone?: string }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon name={icon} /></div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}

function PageTitle({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle: string; action?: ReactNode }) {
  return <div className="page-title"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}

function BookingTable({ mine = false, rows: providedRows, onDetails }: { mine?: boolean; rows?: BookingRow[]; onDetails: () => void }) {
  const rows = providedRows ?? (mine ? bookings.filter((b) => b.requester === "Daniel Owusu") : bookings);
  return <div className="table-wrap"><table><thead><tr><th>Booking</th>{!mine && <th>Requested by</th>}<th>Date & time</th><th>Van / driver</th><th>Status</th><th /></tr></thead><tbody>{rows.map((booking) => <tr key={booking.id}><td><strong>{booking.purpose}</strong><span>{booking.id}</span></td>{!mine && <td>{booking.requester}</td>}<td><strong>{booking.date}</strong><span>{booking.time}</span></td><td><strong>{booking.van}</strong><span>{booking.driver}</span></td><td><Status>{booking.status}</Status></td><td><button className="row-action" onClick={onDetails}>View <Icon name="arrow" size={15} /></button></td></tr>)}</tbody></table></div>;
}

function StaffDashboard({ role, setActive }: { role: Role; setActive: (value: string) => void }) {
  const isAdmin = role === "admin";
  return <>
    <PageTitle eyebrow={isAdmin ? "ADMINISTRATION OVERVIEW" : "MY FLEET ACTIVITY"} title={`Good morning, ${profileNames[role].split(" ")[0]}`} subtitle={isAdmin ? "Here’s what’s happening across your fleet today." : "Book transport and keep track of your upcoming journeys."} action={<button className="primary-button" onClick={() => setActive("Create Booking")}><Icon name="plus" size={18} /> Create booking</button>} />
    <div className="metrics-grid">
      <MetricCard icon="calendar" value={isAdmin ? "18" : "3"} label={isAdmin ? "Total bookings" : "My bookings"} detail="This month" />
      <MetricCard icon="clock" value={isAdmin ? "5" : "1"} label="Pending requests" detail={isAdmin ? "Needs your attention" : "Awaiting approval"} tone="amber" />
      <MetricCard icon="bus" value="6" label="Available vans" detail="Out of 8 vehicles" tone="green" />
      <MetricCard icon="route" value={isAdmin ? "9" : "2"} label="Upcoming journeys" detail="Next 7 days" tone="purple" />
    </div>
    <div className="dashboard-grid">
      <section className="panel bookings-panel">
        <div className="panel-head"><div><h2>{isAdmin ? "Recent bookings" : "My recent bookings"}</h2><p>{isAdmin ? "Review and manage the latest booking activity" : "Track the status of your submitted requests"}</p></div><button className="text-button" onClick={() => setActive(isAdmin ? "All Bookings" : "My Bookings")}>View all <Icon name="arrow" size={15} /></button></div>
        <BookingTable mine={!isAdmin} onDetails={() => setActive("Booking Details")} />
      </section>
      <aside className="side-stack">
        <section className="panel attention-card">
          <div className="panel-head"><div><h2>Needs attention</h2><p>Pending actions</p></div><span className="count-badge">{isAdmin ? 5 : 1}</span></div>
          <div className="attention-list">
            <button onClick={() => setActive(isAdmin ? "All Bookings" : "My Bookings")}><span className="attention-icon amber"><Icon name="clock" /></span><span><strong>{isAdmin ? "5 bookings await review" : "1 request is pending"}</strong><small>{isAdmin ? "Oldest submitted 2h ago" : "Submitted yesterday"}</small></span><Icon name="arrow" /></button>
            <button onClick={() => setActive("Available Vans")}><span className="attention-icon blue"><Icon name="bus" /></span><span><strong>2 vans due for service</strong><small>Within the next 14 days</small></span><Icon name="arrow" /></button>
          </div>
        </section>
        <section className="panel availability-card"><div className="panel-head"><div><h2>Fleet availability</h2><p>Live vehicle status</p></div></div><div className="donut-row"><div className="donut"><div><strong>8</strong><span>Total</span></div></div><div className="legend"><span><i className="green-dot" />Available <b>6</b></span><span><i className="navy-dot" />On journey <b>1</b></span><span><i className="grey-dot" />Maintenance <b>1</b></span></div></div></section>
      </aside>
    </div>
  </>;
}

function CreateBooking({ onDone, openRoute }: { onDone: () => void; openRoute: () => void }) {
  const [journeyType, setJourneyType] = useState<"standard" | "student" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  if (submitted) return <div className="success-state"><div className="success-icon"><Icon name="check" size={34} /></div><h1>Booking request submitted</h1><p>Your request BK-1049 has been sent to an administrator for review. We’ll notify you when its status changes.</p><Status>Pending</Status><button className="primary-button" onClick={onDone}>View my bookings</button></div>;
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
        setSaving(true);
        const form = new FormData(e.currentTarget);
        const payload = {
          createdById: DEMO_ADMIN_ID,
          journeyType: "StandardVanBooking",
          title: String(form.get("title") ?? ""),
          description: String(form.get("notes") ?? ""),
          journeyDate: String(form.get("journeyDate") ?? ""),
          plannedStartTime: String(form.get("startTime") ?? ""),
          plannedEndTime: String(form.get("endTime") ?? "") || null,
          standardPickupLocation: String(form.get("pickup") ?? ""),
          destination: String(form.get("destination") ?? ""),
          studentIds: [],
        };
        try {
          const response = await fetch(`${API_BASE_URL}/transport-requests`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!response.ok) throw new Error(await response.text() || `Request failed (${response.status})`);
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
          <label className="full">Available van<select defaultValue=""><option value="" disabled>Select an available van</option><option>VC-01 · Ford Transit · 18 seats</option><option>VC-04 · Toyota Hiace · 15 seats</option><option>VC-06 · Toyota Hiace · 15 seats</option></select></label>
          <label>Departure date<input required name="journeyDate" type="date" defaultValue="2026-10-20" /></label>
          <label>Departure time<input required name="startTime" type="time" defaultValue="08:30" /></label>
          <label>Pickup location<input required name="pickup" placeholder="Select or enter location" /></label>
          <label>Destination<input required name="destination" placeholder="Enter destination" /></label>
          <label>Expected return date<input type="date" defaultValue="2026-10-20" /></label>
          <label>Expected return time<input name="endTime" type="time" defaultValue="16:00" /></label>
        </div>
        <div className="form-divider" />
        <div className="form-section"><div className="section-number">2</div><div><h2>Passengers</h2><p>Add the students and staff who will travel.</p></div></div>
        <div className="passenger-summary"><span className="attention-icon blue"><Icon name="users" /></span><div><strong>12 passengers added</strong><small>10 students · 2 staff members</small></div><button type="button" className="secondary-button">Manage passengers</button></div>
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
          <label>Journey date<input type="date" defaultValue="2025-06-24" /></label>
          <label>Required arrival time<input type="time" defaultValue="08:20" /></label>
          <label>Planned first pickup<input type="time" defaultValue="07:30" /></label>
          <label>Destination<input defaultValue="Vision College Main Campus" /></label>
          <label className="full">Special instructions<textarea rows={3} defaultValue="Call guardian two minutes before arrival. Ama requires assistance with her equipment bag." /></label>
        </div>
        <div className="form-actions"><button type="button" className="secondary-button">Save draft</button><button className="primary-button" type="submit"><Icon name="route" size={17} /> Generate suitable route</button></div>
      </form>
      <aside className="side-stack single-column"><section className="panel transport-summary"><h2>Request summary</h2><div><span>Students</span><strong>{selected.length}</strong></div><div><span>Confirmed addresses</span><strong>{selected.length} of {selected.length}</strong></div><div><span>Journey type</span><strong>Morning pickup</strong></div><div><span>Required arrival</span><strong>08:20 AM</strong></div></section><section className="panel form-tip"><Icon name="shield" /><h3>Private address access</h3><p>Student home details are visible only to authorised administrators and the assigned driver. Families see only their own saved address and timing.</p></section></aside>
    </div>
  </>;
}

function BookingsPage({ mine, onDetails }: { mine: boolean; onDetails: () => void }) {
  const [apiBookings, setApiBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/transport-requests`)
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text() || `Request failed (${response.status})`);
        return response.json() as Promise<ApiBooking[]>;
      })
      .then((data) => { if (active) setApiBookings(data); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load bookings."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const rows = apiBookings.map((booking) => ({
    id: booking.id.slice(0, 8).toUpperCase(),
    purpose: booking.title,
    requester: booking.createdBy ?? "Unknown",
    date: formatApiDate(booking.journeyDate),
    time: formatApiTime(booking.plannedStartTime),
    van: "Unassigned",
    driver: "Unassigned",
    status: booking.status,
  }));

  return <><PageTitle eyebrow={mine ? "MY REQUESTS" : "BOOKING MANAGEMENT"} title={mine ? "My bookings" : "All bookings"} subtitle={mine ? "View and track every booking request you’ve submitted." : "Review, approve and coordinate transport requests across the college."} action={<button className="primary-button"><Icon name="plus" size={18} /> New booking</button>} /><section className="panel"><div className="filter-bar"><div className="search-field"><Icon name="search" size={18} /><input placeholder="Search bookings..." /></div><select aria-label="Filter by status"><option>All statuses</option><option>Pending</option><option>Approved</option><option>Declined</option></select><select aria-label="Filter by date"><option>All dates</option><option>This week</option><option>This month</option></select></div>{loading ? <div className="empty-state"><p>Loading bookings from the database...</p></div> : error ? <div className="empty-state"><h2>Could not load bookings</h2><p>{error}. Check that PostgreSQL and the .NET API are running.</p></div> : <BookingTable rows={rows.filter((row) => !mine || row.requester === "Daniel Owusu")} onDetails={onDetails} />}</section></>;
}

function BookingDetails({ role, back }: { role: Role; back: () => void }) {
  return <><button className="back-button" onClick={back}>← Back to bookings</button><PageTitle eyebrow="BOOKING BK-1048" title="Networking Lab Visit" subtitle="Submitted by Daniel Owusu on 18 June, 2025 at 10:42" action={<Status>Approved</Status>} /><div className="detail-grid"><section className="panel detail-main"><div className="detail-hero"><div className="route-point start"><span /><div><small>PICKUP</small><strong>Vision College Main Campus</strong><p>24 Jun, 2025 · 08:30</p></div></div><div className="route-line" /><div className="route-point end"><span><Icon name="location" size={14} /></span><div><small>DESTINATION</small><strong>Ghana-India Kofi Annan Centre</strong><p>Accra Central · Return at 16:00</p></div></div></div><div className="detail-section"><h2>Journey details</h2><div className="info-grid"><div><span>Purpose</span><strong>Networking Lab Visit</strong></div><div><span>Passengers</span><strong>12 people</strong></div><div><span>Department</span><strong>School of ICT</strong></div><div><span>Contact</span>  <strong>+64 21 555 0182</strong></div></div></div><div className="detail-section"><h2>Passenger overview</h2><div className="passenger-summary"><div className="avatar-stack"><span>AB</span><span>KO</span><span>YA</span><span>+9</span></div><div><strong>10 students, 2 staff</strong><small>Passenger list verified</small></div><button className="text-button">View passenger list <Icon name="arrow" size={15} /></button></div></div></section><aside className="side-stack"><section className="panel assignment"><h2>Vehicle assignment</h2><div className="vehicle-image"><Icon name="bus" size={40} /></div><div className="assignment-row"><span>Assigned van</span><strong>VC-04 · Toyota Hiace</strong></div><div className="assignment-row"><span>Driver</span><strong>Kwame Asare</strong></div><div className="assignment-row"><span>Capacity</span><strong>15 passengers</strong></div>{role === "admin" && <button className="secondary-button full-button">Update assignment</button>}</section>{role === "admin" && <section className="panel admin-actions"><h2>Administrator actions</h2><button className="secondary-button"><Icon name="calendar" size={17} /> Update booking</button><button className="danger-button">Decline booking</button></section>}</aside></div></>;
}

function FleetPage({ users = false }: { users?: boolean }) {
  const [vans, setVans] = useState<ApiVan[]>([]);
  const [apiUsers, setApiUsers] = useState<ApiUser[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const endpoint = users ? "users" : "vans";
    fetch(`${API_BASE_URL}/fleet/${endpoint}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text() || `Request failed (${response.status})`);
        return response.json();
      })
      .then((data: ApiVan[] | ApiUser[]) => users ? setApiUsers(data as ApiUser[]) : setVans(data as ApiVan[]))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load fleet data."));
  }, [users]);
  return <><PageTitle eyebrow={users ? "ACCESS CONTROL" : "FLEET MANAGEMENT"} title={users ? "Manage users and roles" : "Vans and availability"} subtitle={users ? "Control accounts, portal access and role-based permissions." : "Monitor availability, capacity and maintenance across the fleet."} action={<button className="primary-button"><Icon name="plus" size={18} /> {users ? "Add user" : "Add van"}</button>} />{error ? <section className="panel empty-state"><h2>Could not load database data</h2><p>{error}</p></section> : users ? <section className="panel"><div className="filter-bar"><div className="search-field"><Icon name="search" /><input placeholder="Search by name or email..." /></div><select><option>All roles</option><option>Administrator</option><option>Staff</option><option>Driver</option></select></div><div className="user-list">{apiUsers.map((user) => <div className="user-row" key={user.id}><div className="avatar">{user.fullName.split(" ").map((word) => word[0]).join("")}</div><div><strong>{user.fullName}</strong><span>{user.email}</span></div><Status>{user.status === "active" ? "Approved" : "Declined"}</Status><span className="user-role">{user.role}</span><button className="row-action">Manage <Icon name="arrow" size={15} /></button></div>)}</div></section> : <div className="fleet-grid">{vans.map((van) => <article className="panel van-card" key={van.id}><div className="van-visual"><Icon name="bus" size={52} /><Status>{van.status}</Status></div><h2>{van.registrationNumber}</h2><p>{van.name} · {van.capacity} seats</p><div className="van-stats"><span><small>STATUS</small><strong>{van.status}</strong></span><span><small>CAPACITY</small><strong>{van.capacity} seats</strong></span></div><button className="secondary-button full-button">View vehicle</button></article>)}</div>}</>;
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
      fetch(`${API_BASE_URL}/fleet/users`).then(async (response) => response.ok ? response.json() : Promise.reject(new Error(await response.text()))),
      fetch(`${API_BASE_URL}/fleet/students`).then(async (response) => response.ok ? response.json() : Promise.reject(new Error(await response.text()))),
    ])
      .then(async ([userData, studentData]) => {
        setUsers(userData);
        setStudents(studentData);
        if (section === "students" && (role === "admin" || role === "staff")) {
          const response = await fetch(`${API_BASE_URL}/fleet/student-change-requests`, { headers: { "X-Portal-Role": role } });
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
    const response = await fetch(`${API_BASE_URL}/fleet/students${editingId ? `/${editingId}` : ""}`, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json", "X-Portal-Role": role }, body: JSON.stringify(form) });
    if (!response.ok) { setError(await response.text() || "Could not create student."); return; }
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", email: "", studentNumber: "", yearLevel: "", addressLine: "", suburb: "", city: "", postcode: "" });
    const refreshed = await fetch(`${API_BASE_URL}/fleet/students`);
    if (refreshed.ok) setStudents(await refreshed.json());
  };
  const reviewRequest = async (id: string, status: "approved" | "declined") => {
    const response = await fetch(`${API_BASE_URL}/fleet/student-change-requests/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", "X-Portal-Role": role }, body: JSON.stringify({ status }) });
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
    fetch(`${API_BASE_URL}/fleet/students`)
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
    const response = await fetch(`${API_BASE_URL}/fleet/student-change-requests`, {
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
  const [draggedStop, setDraggedStop] = useState<number | null>(null);
  useEffect(() => {
    fetch(`${API_BASE_URL}/journeys/route`)
      .then(async (response) => { if (!response.ok) throw new Error(await response.text() || "Could not load route."); return response.json(); })
      .then((route: { stops: Array<{ order: number; address: string; plannedArrival?: string; actualArrival?: string }> }) => {
        setOrderedStops(route.stops.map((stop, index) => ({
          time: stop.plannedArrival?.slice(0, 5) ?? "--:--",
          name: index === route.stops.length - 1 ? "Vision College" : `Pickup stop ${index + 1}`,
          address: stop.address,
          state: stop.actualArrival ? "Picked Up" : "Waiting",
        })));
      })
      .catch(() => {});
  }, []);
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
    <div className="route-metrics"><MetricCard icon="location" value="4" label="Route stops" detail="3 pickups · 1 destination" /><MetricCard icon="clock" value="50 min" label="Estimated duration" detail="22.4 km total" tone="purple" /><MetricCard icon="bus" value="VC-03" label="Assigned van" detail="Michael Brown" tone="green" /></div>
    <div className="route-planning-grid">
      <section className="panel route-order-panel"><div className="panel-head"><div><h2>{monitor ? "Live route progress" : "Pickup stop order"}</h2><p>{monitor ? "1 of 4 stops completed" : "Generated from distance, travel time and required arrival"}</p></div>{!monitor && <span className="optimised-label"><Icon name="check" size={14} /> Optimised</span>}</div>
        <div className="stop-list">{orderedStops.map((stop, index) => <div className={`stop-order ${index === 1 && monitor ? "next" : ""}`} draggable={!monitor && index !== orderedStops.length - 1} onDragStart={() => setDraggedStop(index)} onDragOver={(event) => { event.preventDefault(); moveStop(index); }} onDragEnd={() => setDraggedStop(null)} key={stop.name}><span className="drag-handle">{monitor ? index + 1 : "⠿"}</span><div className={`stop-marker ${index === orderedStops.length - 1 ? "destination" : ""}`}>{index === orderedStops.length - 1 ? <Icon name="location" size={15} /> : index + 1}</div><div><strong>{stop.name}</strong><span>{stop.address}</span></div><div className="stop-eta"><small>{index === orderedStops.length - 1 ? "ARRIVAL" : "PICKUP"}</small><strong>{stop.time}</strong></div>{monitor ? <Status>{stop.state}</Status> : <button className="icon-button" aria-label="Edit stop">•••</button>}</div>)}</div>
        {!monitor && <div className="route-actions"><button className="secondary-button"><Icon name="plus" size={16} /> Add stop</button><button className="secondary-button" onClick={() => { setOrderedStops(routeStops); setApproved(false); }}><Icon name="route" size={16} /> Regenerate</button><button className="primary-button" onClick={() => setApproved(true)}><Icon name="check" size={16} /> Confirm final route</button></div>}
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
  return <><PageTitle eyebrow={driver ? "ROUTE VC-JR-208" : "UPCOMING JOURNEY"} title="Networking Lab Visit" subtitle="Tuesday, 24 June 2025 · Departure at 08:30 AM" action={<Status>Approved</Status>} /><div className="detail-grid"><section className="panel map-panel"><div className="mock-map"><div className="map-road one" /><div className="map-road two" /><div className="map-road three" /><span className="map-pin start"><Icon name="bus" size={18} /></span><span className="map-pin end"><Icon name="location" size={18} /></span><div className="map-route" /></div><div className="route-summary"><div><small>FROM</small><strong>Vision College Main Campus</strong><span>08:30 AM</span></div><Icon name="arrow" /><div><small>TO</small><strong>Ghana-India Kofi Annan Centre</strong><span>09:15 AM estimated</span></div></div></section><aside className="side-stack"><section className="panel"><h2>Journey information</h2><div className="info-list"><div><Icon name="calendar" /><span><small>Date</small><strong>24 June, 2025</strong></span></div><div><Icon name="bus" /><span><small>Assigned van</small><strong>VC-04 · Toyota Hiace</strong></span></div><div><Icon name="user" /><span><small>Driver</small><strong>Kwame Asare</strong></span></div><div><Icon name="users" /><span><small>Passengers</small><strong>12 confirmed</strong></span></div></div></section>{driver && <button className="primary-button full-button">Start journey <Icon name="arrow" /></button>}</aside></div></>;
}

function AttendancePage({ driver = false }: { driver?: boolean }) {
  const [attendance, setAttendance] = useState<Record<number, string>>({ 0: "Picked Up", 1: "Waiting", 3: "Absent" });
  const [databaseAttendance, setDatabaseAttendance] = useState<Array<{ id: string; name: string; status: string }>>([]);
  useEffect(() => {
    fetch(`${API_BASE_URL}/journeys/attendance`)
      .then(async (response) => { if (!response.ok) throw new Error(await response.text() || "Could not load attendance."); return response.json(); })
      .then(setDatabaseAttendance)
      .catch(() => {});
  }, []);
  const saveAttendance = async (id: string, status: string) => {
    await fetch(`${API_BASE_URL}/journeys/attendance/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: status.toLowerCase().replace(" ", "_") }) });
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
  return <><PageTitle eyebrow={notifications ? "NOTIFICATION CENTRE" : "ACCOUNT SETTINGS"} title={title} subtitle={notifications ? "Review important journey, booking and fleet updates." : "Manage your Vision College portal profile and access preferences."} action={!notifications && <button className="primary-button">Edit profile</button>} /><div className="dashboard-grid"><section className="panel"><div className="panel-head"><div><h2>{notifications ? "Recent notifications" : "Profile information"}</h2><p>{notifications ? "Latest updates from the fleet operations team." : "Your account details and role permissions."}</p></div></div>{(notifications ? [["Booking approved","Networking Lab Visit was approved for 24 June.","Today"],["Route updated","Morning pickup route has been optimised.","Yesterday"],["Attendance recorded","Ama Boateng was marked picked up.","18 Jun"]]   : [["Full name","Olivia Mensah"],["Email address","olivia.mensah@visioncollege.ac.nz"],["Portal role","Administrator"],["Account status","Approved"]]).map((item) => <div className="user-row" key={item[0]}><div className="avatar"><Icon name={notifications ? "bell" : "user"} size={17} /></div><div><strong>{item[0]}</strong><span>{item[1]}</span></div><span className="user-role">{item[2] ?? "Secure access"}</span></div>)}</section><aside className="side-stack"><section className="panel notice"><div className="attention-icon blue"><Icon name="shield" /></div><div><h3>Secure portal access</h3><p>Your Vision College information is protected by role-based access control.</p></div></section><section className="panel form-tip"><Icon name="check" /><h3>Everything is up to date</h3><p>No action is required at this time.</p></section></aside></div></>;
}

function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const [role, setRole] = useState<Role>("admin");
  return <div className="login-page"><section className="login-brand"><Logo /><div className="login-copy"><span className="eyebrow">VISION COLLEGE SCHOOL OF ICT</span><h1>Every journey,<br />managed with care.</h1><p>A secure, connected fleet platform for our staff, students, families and drivers.</p><div className="trust-row"><span><Icon name="shield" /> Role-based access</span><span><Icon name="route" /> Live journey updates</span></div></div><div className="brand-pattern" /></section><section className="login-form-wrap"><form className="login-card" onSubmit={(e) => { e.preventDefault(); onLogin(role); }}><div className="mobile-login-logo"><Logo /></div><span className="eyebrow">SECURE PORTAL</span><h2>Welcome back</h2><p>Sign in to access your fleet portal.</p><label>Portal access<select value={role} onChange={(e) => setRole(e.target.value as Role)}>{Object.entries(roleNames).map(([key, value]) => <option value={key} key={key}>{value}</option>)}</select></label>  <label>Email address<input required type="email" defaultValue="olivia.mensah@visioncollege.ac.nz" /></label><label>Password<div className="password-field"><input required type="password" defaultValue="visioncollege" /><button type="button">Show</button></div></label><div className="login-options"><label><input type="checkbox" defaultChecked />Remember me</label><button type="button">Forgot password?</button></div><button className="primary-button login-button" type="submit">Sign in securely <Icon name="arrow" /></button><div className="login-help"><Icon name="shield" /><span>Having trouble signing in? Contact the ICT support desk.</span></div></form></section></div>;
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(true);
  const [role, setRole] = useState<Role>("admin");
  const [active, setActiveState] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(0);

  const setActive = (value: string) => {
    if (value.startsWith("student:")) {
      setSelectedStudent(Number(value.split(":")[1]));
      setActiveState("Dashboard");
    } else {
      setActiveState(value);
    }
  };

  const changeRole = (next: Role) => {
    setRole(next);
    setActiveState("Dashboard");
  };

  const page = useMemo(() => {
    if (role === "admin" || role === "staff") {
      if (active === "Dashboard") return <StaffDashboard role={role} setActive={setActive} />;
      if (active === "Create Booking") return <CreateBooking onDone={() => setActive("My Bookings")} openRoute={() => setActive(role === "admin" ? "Route Planning" : "Transport Requests")} />;
      if (active === "My Bookings" || active === "All Bookings") return <BookingsPage mine={active === "My Bookings"} onDetails={() => setActive("Booking Details")} />;
      if (active === "Transport Requests") return <BookingsPage mine={role === "staff"} onDetails={() => setActive(role === "admin" ? "Route Planning" : "Booking Details")} />;
      if (active === "Booking Details") return <BookingDetails role={role} back={() => setActive(role === "admin" ? "All Bookings" : "My Bookings")} />;
      if (active === "Route Planning") return <RoutePlanning />;
      if (active === "Live Monitoring") return <RoutePlanning monitor />;
      if (active === "Available Vans" || active === "Manage Vans") return <FleetPage />;
      if (active === "Manage Users") return <FleetPage users />;
      if (active === "Manage Drivers") return <ManagementPage section="drivers" role={role} />;
      if (active === "Manage Students") return <ManagementPage section="students" role={role} />;
      if (active === "Manage Guardians") return <ManagementPage section="guardians" role={role} />;
    }
    if (role === "student" || role === "parent") {
      if (active === "Dashboard") return <FamilyDashboard role={role} selectedStudent={selectedStudent} setActive={setActive} />;
      if (active === "Linked Students") return <LinkedStudents onSelect={(index) => { setSelectedStudent(index); setActiveState("Dashboard"); }} />;
      if (active === "Request Student Update") return <StudentUpdateRequest selectedStudent={selectedStudent} />;
      if (active === "Upcoming Trips" || active === "Journey Details" || active === "My Pickup Status" || active === "Live Journey Status") return <PrivateJourneyStatus selectedStudent={role === "student" ? 0 : selectedStudent} />;
      if (active === "Attendance History") return <AttendancePage />;
      return <GenericPage title={active} />;
    }
    if (role === "driver") {
      if (active === "Dashboard" || active === "Assigned Journeys") return <DriverDashboard setActive={setActive} />;
      if (active === "Complete Route" || active === "Journey Progress") return <DriverRoutePage />;
      if (active === "Passenger List" || active === "Passenger Attendance") return <AttendancePage driver />;
    }
    return <GenericPage title={active} />;
  }, [active, role, selectedStudent]);

  if (!loggedIn) return <Login onLogin={(next) => { changeRole(next); setLoggedIn(true); }} />;

  return <div className="app-shell"><Sidebar role={role} active={active} setActive={setActive} open={menuOpen} setOpen={setMenuOpen} onLogout={() => setLoggedIn(false)} /><div className="main-shell"><Header role={role} setRole={changeRole} setOpen={setMenuOpen} /><main className="page-content">{page}</main><footer><span>© 2025 Vision College School of ICT</span><span>Fleet Operations · Secure portal</span></footer></div></div>;
}
