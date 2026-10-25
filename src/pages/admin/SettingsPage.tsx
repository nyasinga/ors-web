import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  Check,
  Clock,
  Cloud,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  FileText,
  Info,
  KeyRound,
  LayoutTemplate,
  Link2,
  Lock,
  Mail,
  MessageSquare,
  Monitor,
  Moon,
  Paintbrush,
  Phone,
  Save,
  Settings as SettingsIcon,
  Shield,
  ShieldCheck,
  Smartphone,
  Sun,
  User,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Donut } from "../../components/ui/Donut";
import { Input } from "../../components/ui/Input";
import { Pill } from "../../components/ui/Pill";
import { ScrollableNav } from "../../components/ui/ScrollableNav";
import { Select } from "../../components/ui/Select";
import { Table } from "../../components/ui/Table";
import { Toggle } from "../../components/ui/Toggle";
import {
  activeSessions,
  loginActivity,
  securityPanels,
  sessionDeviceMix,
  sessionSummary,
  settingsTabs,
} from "../../data/adminOps";
import { useToast } from "../../components/ui/Toast";
import { Modal } from "../../components/ui/Modal";
import { useAuthUser } from "../../hooks/useAuthUser";
import { ApiError } from "../../lib/api";
import {
  displayName,
  formatAccountDate,
  getAuthToken,
  getAuthUser,
  initialsFrom,
  isAccountActive,
  roleLabel,
  saveAuthSession,
  type AuthUser,
  userEmail,
  userPhone,
  wasRemembered,
} from "../../lib/auth";
import { cn } from "../../lib/cn";
import { syncSupportContactsToEvents } from "../../lib/engagements";
import { clearPublicEngagementCache } from "../../lib/publicEvent";
import {
  changePassword,
  createUser,
  listUsers,
  updateMe,
  type CreateUserInput,
} from "../../lib/users";
import {
  loadWorkspaceSettings,
  saveWorkspaceSettings,
  type WorkspaceSettings,
} from "../../lib/workspaceSettings";

async function saveProfileAndSyncEvents(input: {
  fullName: string;
  email: string;
  phoneNo: string;
  language?: string;
}) {
  const updated = await updateMe({
    fullName: input.fullName,
    email: input.email,
    phoneNo: input.phoneNo,
    ...(input.language ? { language: input.language } : {}),
  });
  syncSessionUser({
    fullName: updated?.fullName || input.fullName,
    email: updated?.email || input.email,
    phoneNo: updated?.phoneNo || input.phoneNo,
    ...(input.language
      ? { language: updated?.language || input.language }
      : {}),
  });
  let synced = 0;
  try {
    synced = await syncSupportContactsToEvents({
      contactEmail: input.email,
      contactPhone: input.phoneNo,
      contactName: input.fullName,
    });
    clearPublicEngagementCache();
  } catch {
    synced = 0;
  }
  return { updated, synced };
}

const USER_TYPE_OPTIONS = [
  { value: "admin", label: "Administrator" },
  { value: "superadmin", label: "Super Administrator" },
  { value: "staff", label: "Staff" },
];

const INTEGRATION_CATALOG = [
  { id: "mpesa", name: "M-Pesa", category: "Payments" },
  { id: "ecitizen", name: "eCitizen", category: "Payments" },
  { id: "smtp", name: "SMTP Email", category: "Communications" },
  { id: "sms", name: "SMS Gateway", category: "Communications" },
  { id: "analytics", name: "Analytics", category: "Insights" },
] as const;

const tabIcons: Record<string, typeof SettingsIcon> = {
  general: SettingsIcon,
  account: User,
  notifications: Bell,
  security: ShieldCheck,
  integrations: Link2,
  appearance: Paintbrush,
  system: Wrench,
};

const securityIcons: Record<string, typeof KeyRound> = {
  password: KeyRound,
  "2fa": Smartphone,
  access: Users,
  sessions: Monitor,
  login: Shield,
  data: Database,
};

/** Screen F Settings (General → System + Security subs) */
export function SettingsPage() {
  const { section = "general" } = useParams();
  const navigate = useNavigate();
  const active = settingsTabs.some((t) => t.id === section) ? section : "general";
  const [securityPanel, setSecurityPanel] = useState("access");
  const [workspace, setWorkspace] = useState<WorkspaceSettings>(() => loadWorkspaceSettings());
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const persistWorkspace = () => {
    saveWorkspaceSettings(workspace);
    setSaveNotice("Workspace preferences saved on this device.");
    window.setTimeout(() => setSaveNotice(null), 2500);
  };

  return (
    <div className="grid w-full gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-navy">
            <SettingsIcon size={24} className="text-blue" /> Settings
          </h1>
          <p className="mt-1 text-sm text-mute">Manage your account, preferences and system settings.</p>
          {saveNotice ? <p className="mt-1 text-sm font-semibold text-green">{saveNotice}</p> : null}
        </div>
        {(active === "general" || active === "system" || active === "integrations") && (
          <Button onClick={persistWorkspace}>
            <Save size={16} /> Save Changes
          </Button>
        )}
      </div>

      <ScrollableNav
        activeKey={active}
        aria-label="Settings sections"
        className="border-b border-slate-200"
        trackClassName="gap-0"
      >
        {settingsTabs.map((tab, i) => {
          const Icon = tabIcons[tab.id] ?? SettingsIcon;
          const isActive = active === tab.id;
          return (
            <div key={tab.id} className="flex shrink-0 items-stretch" data-nav-id={tab.id}>
              {i > 0 ? <span className="my-2 w-px bg-slate-200" aria-hidden /> : null}
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => navigate(`/admin/settings/${tab.id}`)}
                className={cn(
                  "inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium",
                  isActive
                    ? "border-blue bg-soft/60 text-blue"
                    : "border-transparent text-mute hover:text-ink",
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            </div>
          );
        })}
      </ScrollableNav>

      {active === "general" ? (
        <GeneralSection workspace={workspace} onChange={setWorkspace} />
      ) : null}
      {active === "account" ? <AccountSection /> : null}
      {active === "notifications" ? <NotificationsSection /> : null}
      {active === "security" ? (
        <SecuritySection panel={securityPanel} onPanelChange={setSecurityPanel} />
      ) : null}
      {active === "integrations" ? (
        <IntegrationsSection workspace={workspace} onChange={setWorkspace} />
      ) : null}
      {active === "appearance" ? <AppearanceSection /> : null}
      {active === "system" ? <SystemSection /> : null}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: typeof User;
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-dotted border-slate-200 py-3 last:border-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-soft text-blue">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-mute">{label}</p>
        <p className="inline-flex flex-wrap items-center gap-2 font-semibold text-navy">
          {value}
          {badge ? <Pill tone="green">{badge}</Pill> : null}
        </p>
      </div>
    </div>
  );
}

function SectionHead({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof User;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-soft text-blue">
        <Icon size={20} />
      </span>
      <div>
        <h2 className="font-bold text-navy">{title}</h2>
        <p className="text-sm text-mute">{description}</p>
      </div>
    </div>
  );
}

function GeneralSection({
  workspace,
  onChange,
}: {
  workspace: WorkspaceSettings;
  onChange: (next: WorkspaceSettings) => void;
}) {
  const toast = useToast();
  const user = useAuthUser();
  const [name, setName] = useState(() => displayName(user, ""));
  const [email, setEmail] = useState(() => userEmail(user, ""));
  const [phone, setPhone] = useState(() => user?.phoneNo?.trim() || "");
  const [saving, setSaving] = useState(false);
  const role = roleLabel(user);
  const created = formatAccountDate(user?.dateCreated);
  const statusBadge = user ? (isAccountActive(user) ? "Active" : "Inactive") : undefined;

  useEffect(() => {
    setName(displayName(user, ""));
    setEmail(userEmail(user, ""));
    setPhone(user?.phoneNo?.trim() || "");
  }, [user]);

  const setField = <K extends keyof WorkspaceSettings>(key: K, value: WorkspaceSettings[K]) => {
    onChange({ ...workspace, [key]: value });
  };

  const onSaveProfile = async () => {
    const fullName = name.trim();
    const nextEmail = email.trim();
    const phoneNo = phone.trim();
    if (!fullName) {
      toast.error("Full name is required.");
      return;
    }
    if (!nextEmail) {
      toast.error("Email is required.");
      return;
    }
    if (!phoneNo) {
      toast.error("Phone number is required.");
      return;
    }
    setSaving(true);
    try {
      const { synced } = await saveProfileAndSyncEvents({
        fullName,
        email: nextEmail,
        phoneNo,
      });
      toast.success(
        synced
          ? "Account updated — registration support contacts refreshed."
          : "Account updated. To refresh registration contacts, open the event → Edit support contacts.",
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-navy">Account Information</h2>
            <p className="text-sm text-mute">
              Updates your profile and the support email/phone shown on registration.
            </p>
          </div>
          <Button size="sm" disabled={saving} onClick={() => void onSaveProfile()}>
            <Save size={16} /> {saving ? "Saving…" : "Save profile"}
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            {statusBadge ? (
              <span className="mt-1.5 inline-flex">
                <Pill tone={statusBadge === "Active" ? "green" : "red"}>{statusBadge}</Pill>
              </span>
            ) : null}
          </div>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254…"
          />
          <InfoRow icon={ShieldCheck} label="Role" value={role} />
          <InfoRow icon={CalendarDays} label="Account Created" value={created} />
          <InfoRow icon={Clock} label="Username" value={user?.username?.trim() || "—"} />
        </div>
      </Card>
      <Card>
        <h2 className="font-bold text-navy">Organization & System</h2>
        <p className="text-sm text-mute">
          Workspace preferences saved on this device (no org settings API yet).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            label="Organization Name"
            value={workspace.organization}
            onChange={(e) => setField("organization", e.target.value)}
          />
          <Input
            label="Time Zone"
            value={workspace.timezone}
            onChange={(e) => setField("timezone", e.target.value)}
          />
          <Input
            label="Language"
            value={workspace.language}
            onChange={(e) => setField("language", e.target.value)}
          />
          <Input
            label="Currency"
            value={workspace.currency}
            onChange={(e) => setField("currency", e.target.value)}
          />
        </div>
      </Card>
      <Card>
        <h2 className="font-bold text-navy">System Preferences</h2>
        <p className="text-sm text-mute">Date, time and display preferences.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Input
            label="Date Format"
            value={workspace.dateFormat}
            onChange={(e) => setField("dateFormat", e.target.value)}
          />
          <Input
            label="Time Format"
            value={workspace.timeFormat}
            onChange={(e) => setField("timeFormat", e.target.value)}
          />
          <Input
            label="First Day of Week"
            value={workspace.firstDay}
            onChange={(e) => setField("firstDay", e.target.value)}
          />
        </div>
      </Card>
    </div>
  );
}

function syncSessionUser(next: Partial<AuthUser>) {
  const token = getAuthToken();
  const current = getAuthUser();
  if (!token || !current) return;
  saveAuthSession({ ...current, ...next }, token, wasRemembered());
}

function AccountSection() {
  const toast = useToast();
  const user = useAuthUser();
  const [name, setName] = useState(() => displayName(user, ""));
  const [email, setEmail] = useState(() => userEmail(user, ""));
  const [phone, setPhone] = useState(() => user?.phoneNo?.trim() || "");
  const [language, setLanguage] = useState(() => user?.language?.trim() || "en-ke");
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const initials = initialsFrom(user);
  const role = roleLabel(user);
  const roleValue = user?.userType?.trim().toLowerCase() || "admin";

  useEffect(() => {
    setName(displayName(user, ""));
    setEmail(userEmail(user, ""));
    setPhone(user?.phoneNo?.trim() || "");
    setLanguage(user?.language?.trim() || "en-ke");
  }, [user]);

  const onSave = async () => {
    const fullName = name.trim();
    const nextEmail = email.trim();
    const phoneNo = phone.trim();
    if (!fullName) {
      toast.error("Full name is required.");
      return;
    }
    if (!nextEmail) {
      toast.error("Email is required.");
      return;
    }
    if (!phoneNo) {
      toast.error("Phone number is required.");
      return;
    }
    setSaving(true);
    try {
      const { synced } = await saveProfileAndSyncEvents({
        fullName,
        email: nextEmail,
        phoneNo,
        language,
      });
      toast.success(
        synced
          ? "Profile updated — registration support contacts refreshed."
          : "Profile updated. To refresh registration contacts, open the event → Edit support contacts.",
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <SectionHead
            icon={User}
            title="Account & Profile"
            description="Update your personal profile details."
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
              <UserPlus size={16} /> Add user
            </Button>
            <Button size="sm" disabled={saving} onClick={() => void onSave()}>
              <Save size={16} /> {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
        <div className="mb-6 flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-blue text-lg font-bold text-white">
            {initials}
          </span>
          <div>
            <Button variant="outline" size="sm" disabled title="Photo upload is not available yet">
              Change photo
            </Button>
            <p className="mt-1 text-sm text-mute">JPG or PNG, max 2MB</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254…"
          />
          <Select
            label="Role"
            value={roleValue}
            disabled
            options={[{ value: roleValue, label: role }]}
          />
          <Select
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            options={[
              { value: "en-ke", label: "English (Kenya)" },
              { value: "en", label: "English" },
              { value: "sw", label: "Kiswahili" },
            ]}
          />
          <Select
            label="Time Zone"
            defaultValue="nairobi"
            options={[{ value: "nairobi", label: "(GMT+03:00) Nairobi" }]}
          />
        </div>
      </Card>
      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

function AddUserModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (user: AuthUser) => void;
}) {
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("admin");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFullName("");
    setEmail("");
    setPhoneNo("");
    setPassword("");
    setUserType("admin");
  }, [open]);

  const onSubmit = async () => {
    const payload: CreateUserInput = {
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNo: phoneNo.trim(),
      userType,
      ...(password.trim() ? { password: password.trim() } : {}),
    };
    if (!payload.fullName || !payload.email || !payload.phoneNo) {
      toast.error("Full name, email and phone are required.");
      return;
    }
    setBusy(true);
    try {
      const created = await createUser(payload);
      toast.success(`User ${created.fullName || payload.fullName} created.`);
      onCreated?.(created);
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create user.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add user"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void onSubmit()} disabled={busy}>
            <UserPlus size={16} /> {busy ? "Creating…" : "Create user"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-3">
        <Input
          label="Full Name *"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />
        <Input
          label="Email *"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          label="Phone *"
          value={phoneNo}
          onChange={(e) => setPhoneNo(e.target.value)}
          placeholder="+254…"
          autoComplete="tel"
        />
        <Select
          label="Role"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          options={USER_TYPE_OPTIONS}
        />
        <Input
          label="Temporary password (optional)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <p className="text-sm text-mute">
          If no password is set, the user can complete signup or reset via email later.
        </p>
      </div>
    </Modal>
  );
}

function NotificationsSection() {
  const [channels, setChannels] = useState({ email: true, push: true, sms: false });
  const [types, setTypes] = useState({
    system: true,
    security: true,
    events: true,
    payments: true,
    messages: true,
    reports: false,
  });

  return (
    <Card>
      <SectionHead
        icon={Bell}
        title="Notifications"
        description="Choose what notifications you want to receive and how."
      />
      <h3 className="mb-1 font-semibold text-navy">Notification Channels</h3>
      <p className="mb-3 text-sm text-mute">Select how you want to receive notifications.</p>
      <div className="mb-6 grid gap-4 divide-y divide-slate-100">
        <Toggle
          className="pt-0"
          icon={Mail}
          checked={channels.email}
          onChange={(v) => setChannels((c) => ({ ...c, email: v }))}
          label="Email Notifications"
          description="Receive important updates via email."
        />
        <Toggle
          className="pt-4"
          icon={Smartphone}
          checked={channels.push}
          onChange={(v) => setChannels((c) => ({ ...c, push: v }))}
          label="Push Notifications"
          description="Receive notifications in the application."
        />
        <Toggle
          className="pt-4"
          icon={MessageSquare}
          checked={channels.sms}
          onChange={(v) => setChannels((c) => ({ ...c, sms: v }))}
          label="SMS Notifications"
          description="Receive critical alerts via SMS."
        />
      </div>
      <h3 className="mb-1 font-semibold text-navy">Notification Types</h3>
      <p className="mb-3 text-sm text-mute">Choose the notifications you want to receive.</p>
      <div className="grid gap-4 divide-y divide-slate-100">
        {(
          [
            ["system", "System Updates", "Important system announcements and maintenance updates.", SettingsIcon],
            ["security", "Security Alerts", "Login alerts, suspicious activity and security related notifications.", Shield],
            ["events", "Events", "Event invitations, reminders and updates.", CalendarDays],
            ["payments", "Payments", "Payment confirmations, receipts and related notifications.", CreditCard],
            ["messages", "Messages", "New messages and communication updates.", Mail],
            ["reports", "Reports", "Scheduled reports and data exports.", FileText],
          ] as const
        ).map(([key, label, desc, Icon], i) => (
          <Toggle
            key={key}
            className={i === 0 ? "pt-0" : "pt-4"}
            icon={Icon}
            checked={types[key]}
            onChange={(v) => setTypes((t) => ({ ...t, [key]: v }))}
            label={label}
            description={desc}
          />
        ))}
      </div>
    </Card>
  );
}

function SecuritySection({
  panel,
  onPanelChange,
}: {
  panel: string;
  onPanelChange: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <Card padded={false} className="self-start overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-bold tracking-wide text-navy uppercase">Security Settings</p>
        </div>
        <nav className="grid p-2" aria-label="Security">
          {securityPanels.map((p) => {
            const Icon = securityIcons[p.id] ?? Shield;
            const isActive = panel === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPanelChange(p.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border-l-2 px-3 py-2.5 text-left text-sm font-medium",
                  isActive
                    ? "border-blue bg-soft text-blue"
                    : "border-transparent text-mute hover:bg-slate-50 hover:text-ink",
                )}
              >
                <Icon size={16} />
                {p.label}
              </button>
            );
          })}
        </nav>
      </Card>
      <div>
        {panel === "password" ? <PasswordPanel /> : null}
        {panel === "2fa" ? <TwoFactorPanel /> : null}
        {panel === "access" ? <AccessControlPanel /> : null}
        {panel === "sessions" ? <SessionsPanel /> : null}
        {panel === "login" ? <LoginSecurityPanel /> : null}
        {panel === "data" ? <DataSecurityPanel /> : null}
      </div>
    </div>
  );
}

function PasswordPanel() {
  const [show, setShow] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const strength = Math.min(4, Math.floor(newPassword.length / 3));

  const onUpdate = async () => {
    setMessage(null);
    setError(null);
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setBusy(true);
    try {
      await changePassword({ oldPassword: currentPassword, newPassword });
      setMessage("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 404
            ? "Password change is not available on this API yet."
            : err.message
          : "Failed to update password.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <SectionHead
          icon={Lock}
          title="Password"
          description="Keep your account secure by using a strong password."
        />
        <div className="grid max-w-md gap-3">
          <Input
            label="Current Password"
            type={show ? "text" : "password"}
            placeholder="Enter your current password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <div>
            <Input
              label="New Password"
              type={show ? "text" : "password"}
              placeholder="Enter new password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="mt-2">
              <div className="mb-1 flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      i < strength
                        ? strength <= 1
                          ? "bg-red"
                          : strength === 2
                            ? "bg-orange-500"
                            : "bg-green"
                        : "bg-slate-200",
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-mute">Password strength</p>
            </div>
          </div>
          <Input
            label="Confirm New Password"
            type={show ? "text" : "password"}
            placeholder="Confirm new password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue"
            onClick={() => setShow((s) => !s)}
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />} {show ? "Hide" : "Show"} passwords
          </button>
          {error ? <p className="text-sm font-semibold text-red">{error}</p> : null}
          {message ? <p className="text-sm font-semibold text-green">{message}</p> : null}
          <div className="flex justify-end">
            <Button onClick={() => void onUpdate()} disabled={busy}>
              {busy ? "Updating…" : "Update Password"}
            </Button>
          </div>
        </div>
      </Card>
      <Card className="bg-soft/40">
        <SectionHead
          icon={Shield}
          title="Password Policy"
          description="Configure password requirements for administrator accounts."
        />
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-blue/20 bg-soft p-3 text-sm text-ink">
          <Info size={16} className="mt-0.5 shrink-0 text-blue" />
          <p>These password policy settings apply only to administrator accounts.</p>
        </div>
        <ul className="grid gap-3">
          {[
            ["Minimum length", "Set the minimum number of characters required."],
            ["Include uppercase letter (A-Z)", "Require at least one uppercase character."],
            ["Include lowercase letter (a-z)", "Require at least one lowercase character."],
            ["Include number (0-9)", "Require at least one numeric digit."],
            ["Include special character", "e.g. ! @ # $ % ^ & *"],
          ].map(([label, desc]) => (
            <li key={label} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-5 w-5 place-items-center rounded bg-blue text-white">
                <Check size={12} />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">{label}</p>
                <p className="text-sm text-mute">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function TwoFactorPanel() {
  const user = useAuthUser();
  const recoveryEmail = userEmail(user);
  const recoveryPhone = userPhone(user);
  const [enabled, setEnabled] = useState(true);
  return (
    <Card>
      <SectionHead
        icon={ShieldCheck}
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account."
      />
      {enabled ? (
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-green/20 bg-green-50 px-4 py-3 text-sm font-semibold text-green">
          <ShieldCheck size={18} /> Two-Factor Authentication is Enabled
        </div>
      ) : null}
      <Toggle
        checked={enabled}
        onChange={setEnabled}
        label="Enable 2FA"
        description="Require a one-time code from your authenticator app when signing in."
      />
      <h3 className="mt-6 mb-3 font-semibold text-navy">Authentication Methods</h3>
      <ul className="grid gap-3">
        {(
          [
            [Smartphone, "Authenticator App", "Use an authenticator app to generate one-time codes."],
            [MessageSquare, "SMS Verification", "Receive verification codes via SMS."],
            [KeyRound, "Backup Codes", "Single-use codes for account recovery."],
          ] as const
        ).map(([Icon, title, desc]) => (
          <li key={title} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-soft text-blue">
              <Icon size={16} />
            </span>
            <div>
              <p className="font-semibold text-navy">{title}</p>
              <p className="text-sm text-mute">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
      <h3 className="mt-6 mb-3 font-semibold text-navy">Recovery Options</h3>
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-soft text-blue">
              <Mail size={16} />
            </span>
            <div>
              <p className="font-semibold text-navy">Recovery Email</p>
              <p className="text-sm text-mute">Used if you lose access to your authenticator.</p>
            </div>
          </div>
          <p className="text-sm font-medium text-ink">{recoveryEmail}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-soft text-blue">
              <Phone size={16} />
            </span>
            <div>
              <p className="font-semibold text-navy">Recovery Phone Number</p>
              <p className="text-sm text-mute">Receive recovery codes by SMS.</p>
            </div>
          </div>
          <p className="text-sm font-medium text-ink">{recoveryPhone}</p>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue/20 bg-soft p-3 text-sm text-ink">
        <Info size={16} className="mt-0.5 shrink-0 text-blue" />
        <div>
          <p className="font-semibold text-navy">Important</p>
          <p className="text-mute">Store backup codes securely. You will need them if you lose your authenticator device.</p>
        </div>
      </div>
      {enabled ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            View backup codes
          </Button>
          <Button variant="outline" size="sm">
            Reset 2FA
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

function AccessControlPanel() {
  const sessionUser = useAuthUser();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await listUsers();
        if (!cancelled) setUsers(Array.isArray(rows) ? rows : []);
      } catch (err) {
        if (!cancelled) {
          setUsers(sessionUser ? [sessionUser] : []);
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not load users from API; showing your session only.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionUser, reloadKey]);

  const rows = (users.length ? users : sessionUser ? [sessionUser] : []).map((u) => ({
    id: u.id,
    name: displayName(u),
    initials: initialsFrom(u),
    email: userEmail(u),
    role: roleLabel(u),
    status: isAccountActive(u) ? "Active" : "Inactive",
    created: formatAccountDate(u.dateCreated),
  }));

  const roleCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.role] = (acc[row.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-soft text-blue">
              <UserPlus size={16} />
            </span>
            <div>
              <p className="font-semibold text-navy">User Management</p>
              <p className="mt-0.5 text-sm text-mute">Live users from GET /users.</p>
              <p className="mt-2 text-xl font-extrabold text-navy">
                {loading ? "…" : `${rows.length} Total Users`}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-soft text-blue">
              <ShieldCheck size={16} />
            </span>
            <div>
              <p className="font-semibold text-navy">Roles in use</p>
              <p className="mt-0.5 text-sm text-mute">Derived from live userType values.</p>
              <p className="mt-2 text-xl font-extrabold text-navy">
                {loading ? "…" : `${Object.keys(roleCounts).length} Roles`}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-soft text-blue">
              <Lock size={16} />
            </span>
            <div>
              <p className="font-semibold text-navy">Roles API</p>
              <p className="mt-0.5 text-sm text-mute">No /roles endpoint on this backend yet.</p>
              <div className="mt-2">
                <Pill tone="neutral">Unavailable</Pill>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-soft text-blue">
              <Users size={16} />
            </span>
            <div>
              <h2 className="font-bold text-navy">Users</h2>
              <p className="text-sm text-mute">Accounts returned by the API for this tenant.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <UserPlus size={16} /> Add user
          </Button>
        </div>
        <AddUserModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onCreated={() => setReloadKey((k) => k + 1)}
        />
        {error ? <p className="mb-3 text-sm font-semibold text-amber-700">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-mute">Loading users…</p>
        ) : (
          <Table
            rowKey={(r) => r.id || r.email}
            columns={[
              {
                key: "name",
                header: "Name",
                render: (r) => (
                  <span className="inline-flex items-center gap-2 font-semibold text-navy">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-soft text-sm font-bold text-blue">
                      {r.initials}
                    </span>
                    {r.name}
                  </span>
                ),
              },
              { key: "email", header: "Email", render: (r) => r.email },
              {
                key: "role",
                header: "Role",
                render: (r) => <Pill tone="blue">{r.role}</Pill>,
              },
              {
                key: "status",
                header: "Status",
                render: (r) => (
                  <Pill tone={r.status === "Active" ? "green" : "red"}>{r.status}</Pill>
                ),
              },
              { key: "created", header: "Created", render: (r) => r.created },
            ]}
            rows={rows}
            empty="No users returned by the API."
          />
        )}
      </Card>
      <Card>
        <div className="mb-4 flex items-start gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-soft text-blue">
            <Shield size={16} />
          </span>
          <div>
            <h2 className="font-bold text-navy">Role distribution</h2>
            <p className="text-sm text-mute">Counted from live users (not a separate roles catalog).</p>
          </div>
        </div>
        {Object.keys(roleCounts).length === 0 ? (
          <p className="text-sm text-mute">No role data yet.</p>
        ) : (
          <ul className="grid gap-2">
            {Object.entries(roleCounts).map(([role, count]) => (
              <li
                key={role}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="font-semibold text-navy">{role}</span>
                <span className="text-mute">{count} user{count === 1 ? "" : "s"}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function SessionsPanel() {
  const [sessions, setSessions] = useState(activeSessions);
  const maxLogin = Math.max(...loginActivity.map((d) => d.value), 1);

  return (
    <div className="grid gap-4">
      <Card>
        <SectionHead
          icon={Monitor}
          title="Active Sessions"
          description="Devices currently signed in to your account."
        />
        <Table
          rowKey={(r) => r.ip + r.device}
          columns={[
            {
              key: "device",
              header: "Device",
              render: (r) => (
                <span className="font-semibold text-navy">
                  {r.device}{" "}
                  {r.current ? <Pill tone="green">Active now</Pill> : null}
                </span>
              ),
            },
            {
              key: "location",
              header: "Location",
              render: (r) => (
                <span>
                  {r.location}
                  <span className="block text-sm text-mute">{r.ip}</span>
                </span>
              ),
            },
            { key: "last", header: "Last Active", render: (r) => r.lastActive },
            {
              key: "status",
              header: "Status",
              render: (r) => (
                <Pill tone={r.current ? "green" : "neutral"}>{r.current ? "Active" : "Idle"}</Pill>
              ),
            },
            {
              key: "actions",
              header: "",
              render: (r) =>
                !r.current ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSessions((prev) => prev.filter((x) => x.ip !== r.ip))}
                  >
                    Revoke
                  </Button>
                ) : null,
            },
          ]}
          rows={sessions}
        />
        <Button variant="danger" size="sm" className="mt-4">
          Sign out all other sessions
        </Button>
      </Card>

      <Card>
        <h3 className="mb-3 font-bold text-navy">Session Activity Summary</h3>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {sessionSummary.map((s) => (
            <div key={s.label} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm text-mute">{s.label}</p>
              <p className="mt-1 text-xl font-extrabold text-navy">{s.value}</p>
              <p
                className={cn(
                  "mt-1 text-sm font-semibold",
                  s.tone === "green" && "text-green",
                  s.tone === "orange" && "text-orange-600",
                  s.tone === "red" && "text-red",
                  s.tone === "neutral" && "text-mute",
                )}
              >
                {s.trend}
              </p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Donut slices={sessionDeviceMix} centerValue="12" centerLabel="Sessions" size={130} />
          <div>
            <p className="mb-2 text-sm font-semibold text-navy">Login Activity (Last 7 Days)</p>
            <div className="flex h-32 items-end gap-2">
              {loginActivity.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-blue"
                      style={{ height: `${(d.value / maxLogin) * 100}%` }}
                    />
                  </div>
                  <span className="text-[13px] text-mute">{d.day.replace(" Sep", "")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function LoginSecurityPanel() {
  const [lockout, setLockout] = useState(true);
  const [enforce2fa, setEnforce2fa] = useState(true);
  const [devices, setDevices] = useState(false);
  const [attempts, setAttempts] = useState("5");
  const [lockoutMins, setLockoutMins] = useState("30");
  const [timeout, setTimeoutMins] = useState("30");

  return (
    <Card>
      <SectionHead
        icon={Shield}
        title="Login Security"
        description="Configure additional security controls for account sign-in."
      />
      <div className="grid gap-6">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-blue">
              <Lock size={14} />
            </span>
            <h3 className="font-semibold text-navy">Account Lockout Protection</h3>
          </div>
          <div className="grid gap-4">
            <Toggle
              checked={lockout}
              onChange={setLockout}
              label="Enable account lockout"
              description="Temporarily lock accounts after repeated failed login attempts."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Maximum failed attempts"
                type="number"
                value={attempts}
                onChange={(e) => setAttempts(e.target.value)}
              />
              <Input
                label="Lockout duration (minutes)"
                type="number"
                value={lockoutMins}
                onChange={(e) => setLockoutMins(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-blue">
              <ShieldCheck size={14} />
            </span>
            <h3 className="font-semibold text-navy">Require Two-Factor Authentication</h3>
          </div>
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-blue/20 bg-soft p-3 text-sm text-ink">
            <Info size={16} className="mt-0.5 shrink-0 text-blue" />
            <p>Administrators must enable two-factor authentication to sign in.</p>
          </div>
          <Toggle
            checked={enforce2fa}
            onChange={setEnforce2fa}
            label="Enforce 2FA for administrators"
            description="Block admin sign-in until 2FA is configured."
          />
        </section>

        <section className="border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-blue">
              <Monitor size={14} />
            </span>
            <h3 className="font-semibold text-navy">Allowed Devices</h3>
          </div>
          <Toggle
            checked={devices}
            onChange={setDevices}
            label="Enable device restrictions"
            description="Only allow sign-in from approved devices."
          />
        </section>

        <section className="border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-blue">
              <Clock size={14} />
            </span>
            <h3 className="font-semibold text-navy">Session Timeout</h3>
          </div>
          <Input
            label="Inactivity timeout (minutes)"
            type="number"
            value={timeout}
            onChange={(e) => setTimeoutMins(e.target.value)}
            className="max-w-xs"
          />
        </section>
      </div>
    </Card>
  );
}

function DataSecurityPanel() {
  return (
    <Card>
      <SectionHead
        icon={Database}
        title="Data Security"
        description="Manage how your data is protected, stored and backed up."
      />
      <div className="grid gap-6">
        <section>
          <div className="mb-3 flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-soft text-blue">
              <ShieldCheck size={16} />
            </span>
            <div>
              <h3 className="font-semibold text-navy">Data Encryption</h3>
              <p className="text-sm text-mute">Your data is protected using industry-standard encryption.</p>
            </div>
          </div>
          <ul className="ml-12 grid gap-3">
            <li className="flex items-start gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-blue">
                <Database size={14} />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">Encryption at rest</p>
                <p className="text-sm text-mute">
                  All data stored in databases and file storage is encrypted using AES-256.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-blue">
                <Shield size={14} />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">Encryption in transit</p>
                <p className="text-sm text-mute">
                  All communication is secured using HTTPS/TLS 1.2 or higher.
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-soft text-blue">
              <Users size={16} />
            </span>
            <div>
              <h3 className="font-semibold text-navy">Access Control</h3>
              <p className="text-sm text-mute">
                Only authorized users can access data based on their roles and permissions.
              </p>
            </div>
          </div>
          <ul className="ml-12 grid gap-3">
            <li className="flex items-start gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-blue">
                <Lock size={14} />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">Role-based access control</p>
                <p className="text-sm text-mute">
                  Access to data and features is restricted based on user roles.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-soft text-blue">
                <ShieldCheck size={14} />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">Account protection</p>
                <p className="text-sm text-mute">
                  Login is protected with Google reCAPTCHA and optional OTP verification.
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-soft text-blue">
              <Clock size={16} />
            </span>
            <div>
              <h3 className="font-semibold text-navy">Data Retention</h3>
              <p className="text-sm text-mute">Control how long your data is kept.</p>
            </div>
          </div>
          <div className="ml-12 rounded-lg border border-blue/20 bg-soft p-3 text-sm text-ink">
            The system retains data for a minimum of three (3) years as per compliance requirements.
          </div>
        </section>

        <section className="border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-soft text-blue">
              <Cloud size={16} />
            </span>
            <div>
              <h3 className="font-semibold text-navy">Backups</h3>
              <p className="text-sm text-mute">
                Your data is regularly backed up to ensure business continuity.
              </p>
            </div>
          </div>
          <div className="ml-12 rounded-lg border border-blue/20 bg-soft p-3 text-sm text-ink">
            <p className="font-semibold text-navy">Automated backups</p>
            <p className="text-mute">
              Database and file backups are performed regularly and stored securely.
            </p>
          </div>
          <Button variant="outline" size="sm" className="mt-4 ml-12">
            <FileText size={14} /> Download audit log
          </Button>
        </section>
      </div>
    </Card>
  );
}

function IntegrationsSection({
  workspace,
  onChange,
}: {
  workspace: WorkspaceSettings;
  onChange: (next: WorkspaceSettings) => void;
}) {
  return (
    <div className="grid gap-4">
      <p className="text-sm text-mute">
        Mark which integrations this workspace intends to use. Secrets are not stored here — there is
        no integrations API yet, so toggles save to this browser only.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {INTEGRATION_CATALOG.map((item) => {
          const connected = Boolean(workspace.integrations[item.id]);
          return (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-mute">
                    {item.category}
                  </p>
                  <h3 className="font-bold text-navy">{item.name}</h3>
                </div>
                <Pill tone={connected ? "green" : "neutral"}>
                  {connected ? "Enabled" : "Not enabled"}
                </Pill>
              </div>
              <div className="mt-4">
                <Toggle
                  checked={connected}
                  onChange={(next) =>
                    onChange({
                      ...workspace,
                      integrations: { ...workspace.integrations, [item.id]: next },
                    })
                  }
                  label={connected ? "Enabled for this workspace" : "Enable for this workspace"}
                  description="Preference only — wire credentials when the integrations API is available."
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function AppearanceSection() {
  const [theme, setTheme] = useState("light");
  const [color, setColor] = useState("green");
  const [layout, setLayout] = useState("default");
  const [reducedMotion, setReducedMotion] = useState(false);
  const colors = [
    { id: "green", label: "Green", swatch: "bg-green" },
    { id: "blue", label: "Blue", swatch: "bg-blue" },
    { id: "purple", label: "Purple", swatch: "bg-purple-600" },
    { id: "red", label: "Red", swatch: "bg-red" },
    { id: "orange", label: "Orange", swatch: "bg-orange-500" },
    { id: "teal", label: "Teal", swatch: "bg-teal-500" },
    { id: "indigo", label: "Indigo", swatch: "bg-indigo-600" },
  ];

  return (
    <Card>
      <SectionHead
        icon={Paintbrush}
        title="Appearance"
        description="Customize how the application looks and feels."
      />
      <h3 className="font-semibold text-navy">Theme</h3>
      <p className="mb-3 text-sm text-mute">Choose your preferred theme for the application.</p>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {(
          [
            { id: "light", label: "Light", desc: "Clean and bright interface.", icon: Sun },
            { id: "dark", label: "Dark", desc: "Reduce eye strain in low light.", icon: Moon },
            { id: "system", label: "System", desc: "Match device setting.", icon: Monitor },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className={cn(
              "relative rounded-lg border p-4 text-left",
              theme === t.id ? "border-blue bg-soft/40 ring-2 ring-blue/20" : "border-slate-200",
            )}
          >
            {theme === t.id ? (
              <span className="absolute top-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-blue text-white">
                <Check size={12} />
              </span>
            ) : null}
            <t.icon size={20} className="text-blue" />
            <p className="mt-2 font-semibold text-navy">{t.label}</p>
            <p className="text-sm text-mute">{t.desc}</p>
          </button>
        ))}
      </div>
      <h3 className="font-semibold text-navy">Color Theme</h3>
      <p className="mb-3 text-sm text-mute">Choose a primary color theme for the interface.</p>
      <div className="mb-6 flex flex-wrap gap-4">
        {colors.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setColor(c.id)}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "h-9 w-9 rounded-full",
                c.swatch,
                color === c.id && "ring-2 ring-offset-2 ring-blue",
              )}
            />
            <span className="text-sm font-medium text-mute">{c.label}</span>
          </button>
        ))}
      </div>
      <h3 className="font-semibold text-navy">Layout</h3>
      <p className="mb-3 text-sm text-mute">Choose how the navigation and content are displayed.</p>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {(
          [
            { id: "default", label: "Default", desc: "Sidebar on the left" },
            { id: "compact", label: "Compact", desc: "Narrow sidebar" },
            { id: "expanded", label: "Expanded", desc: "Wider sidebar with labels" },
          ] as const
        ).map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLayout(l.id)}
            className={cn(
              "relative rounded-lg border p-4 text-left",
              layout === l.id ? "border-blue bg-soft/40 ring-2 ring-blue/20" : "border-slate-200",
            )}
          >
            {layout === l.id ? (
              <span className="absolute top-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-blue text-white">
                <Check size={12} />
              </span>
            ) : null}
            <LayoutTemplate size={20} className="text-blue" />
            <p className="mt-2 font-semibold text-navy">{l.label}</p>
            <p className="text-sm text-mute">{l.desc}</p>
          </button>
        ))}
      </div>
      <h3 className="font-semibold text-navy">Display</h3>
      <p className="mb-3 text-sm text-mute">Adjust display preferences for better readability.</p>
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-soft text-sm font-bold text-blue">
              A
            </span>
            <div>
              <p className="text-sm font-semibold text-navy">Font Size</p>
              <p className="text-sm text-mute">Set the base font size for the application.</p>
            </div>
          </div>
          <Select
            aria-label="Font Size"
            className="w-36"
            defaultValue="medium"
            options={[
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ]}
          />
        </div>
        <Toggle
          icon={Sun}
          checked={reducedMotion}
          onChange={setReducedMotion}
          label="Reduced Motion"
          description="Minimize animations for a simpler experience."
          className="rounded-lg border border-slate-200 p-3"
        />
      </div>
    </Card>
  );
}

function SystemSection() {
  const [onlineEvents, setOnlineEvents] = useState(true);
  const [approval, setApproval] = useState(true);
  const [certs, setCerts] = useState(true);
  const [waitlist, setWaitlist] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [scan, setScan] = useState(true);
  const [exportReq, setExportReq] = useState(true);
  const [anonymize, setAnonymize] = useState(false);

  return (
    <div className="grid gap-4">
      <p className="text-sm text-mute">Advanced configuration and system preferences.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-navy">
            <SettingsIcon size={18} className="text-blue" /> Application Settings
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Application Name" defaultValue="Anti-Counterfeit Authority" />
            <Input label="Application URL" defaultValue="https://aca.go.ke" />
            <Select
              label="Default Timezone"
              defaultValue="nairobi"
              options={[{ value: "nairobi", label: "(GMT+03:00) Nairobi" }]}
            />
            <Select
              label="Default Language"
              defaultValue="en"
              options={[{ value: "en", label: "English" }]}
            />
            <Select
              label="Date Format"
              defaultValue="dd-mmm"
              options={[{ value: "dd-mmm", label: "DD MMM YYYY (15 Nov 2026)" }]}
            />
            <Select
              label="Time Format"
              defaultValue="12"
              options={[{ value: "12", label: "12-hour (09:00 AM)" }]}
            />
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-navy">
            <CalendarDays size={18} className="text-blue" /> Event Settings
          </h3>
          <div className="grid gap-3">
            <Select
              label="Default Event Type"
              defaultValue="conference"
              options={[{ value: "conference", label: "Conference" }]}
            />
            <Select
              label="Default Event Duration"
              defaultValue="1"
              options={[{ value: "1", label: "1 Day" }]}
            />
            <Toggle checked={onlineEvents} onChange={setOnlineEvents} label="Enable online events by default" />
            <Toggle checked={approval} onChange={setApproval} label="Enable registration approval by default" />
            <Toggle checked={certs} onChange={setCerts} label="Enable certificates by default" />
            <Toggle checked={waitlist} onChange={setWaitlist} label="Allow waiting list" />
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-navy">
            <Mail size={18} className="text-blue" /> Email & Communication
          </h3>
          <div className="grid gap-3">
            <Input label="From Name" defaultValue="Anti-Counterfeit Authority" />
            <Input label="From Email" defaultValue="noreply@aca.go.ke" />
            <Input label="Reply To Email" defaultValue="info@aca.go.ke" />
            <Toggle checked={emailNotif} onChange={setEmailNotif} label="Enable email notifications" />
            <Button variant="outline" size="sm" className="w-fit">
              Manage Email Templates
            </Button>
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-navy">
            <FileText size={18} className="text-blue" /> File Management
          </h3>
          <div className="grid gap-3">
            <Select
              label="Maximum File Size"
              defaultValue="10"
              options={[{ value: "10", label: "10 MB" }]}
            />
            <Input label="Allowed File Types" defaultValue="PDF, DOC, DOCX, XLS, XLSX, JPG, PNG" />
            <Select
              label="File Storage"
              defaultValue="local"
              options={[{ value: "local", label: "Local Storage" }]}
            />
            <Input label="Upload Path" defaultValue="/uploads/events" />
            <Toggle checked={scan} onChange={setScan} label="Scan files for viruses" />
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-navy">
            <Database size={18} className="text-blue" /> Data & Retention
          </h3>
          <div className="grid gap-3">
            <Select
              label="Attendee Data Retention"
              defaultValue="3"
              options={[{ value: "3", label: "3 Years" }]}
            />
            <Select
              label="Session Recordings Retention"
              defaultValue="1"
              options={[{ value: "1", label: "1 Year" }]}
            />
            <Toggle checked={exportReq} onChange={setExportReq} label="Allow data export requests" />
            <Toggle checked={anonymize} onChange={setAnonymize} label="Anonymize attendee data in reports" />
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-navy">
            <Wrench size={18} className="text-blue" /> Maintenance
          </h3>
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-navy">Clear Cache</p>
                <p className="text-sm text-mute">Clear application cache and temporary files.</p>
              </div>
              <Button variant="outline" size="sm">
                Clear Cache
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-navy">System Logs</p>
                <p className="text-sm text-mute">View and download system logs.</p>
              </div>
              <Button variant="outline" size="sm">
                View Logs
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <div className="flex justify-end">
        <Button>
          <Save size={16} /> Save Changes
        </Button>
      </div>
    </div>
  );
}
