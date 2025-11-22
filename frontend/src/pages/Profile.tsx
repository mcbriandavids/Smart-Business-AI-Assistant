import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { logout } from "../utils/auth";

type Address = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
};

type Social = {
  whatsapp: string;
  facebook: string;
  instagram: string;
  twitter: string;
};

type FormData = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  social: Social;
};

type UserMeta = {
  email: string;
  role: string;
  isVerified: boolean;
  lastLogin?: string;
};

function formatDateTime(value?: string) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getInitials(first: string, last: string) {
  const firstInitial = first?.trim().charAt(0) || "";
  const lastInitial = last?.trim().charAt(0) || "";
  const result = `${firstInitial}${lastInitial}`.toUpperCase();
  return result || "VP";
}

function toTitleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(
      (segment) =>
        segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
    )
    .join(" ");
}

const defaultForm: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Nigeria",
  },
  social: {
    whatsapp: "",
    facebook: "",
    instagram: "",
    twitter: "",
  },
};

const SOCIAL_CHANNEL_COUNT = Object.keys(defaultForm.social).length;

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [originalForm, setOriginalForm] = useState<FormData | null>(null);
  const [userMeta, setUserMeta] = useState<UserMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(null), 3200);
    return () => window.clearTimeout(timer);
  }, [success]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await api.get("/api/auth/me");
      const me = res.data?.data?.user;
      if (!me) {
        throw new Error("No user data returned");
      }

      let userId = me.id;
      if (userId && typeof userId === "object") {
        userId = userId.$oid || userId.toString?.();
      }
      if (userId && typeof userId !== "string") {
        userId = String(userId);
      }
      if (!userId) {
        console.error("[Profile] Missing user id", me);
        throw new Error(
          "Critical: User identifier is absent. Please contact support."
        );
      }

      const loadedForm: FormData = {
        id: userId,
        firstName: me.firstName || "",
        lastName: me.lastName || "",
        email: me.email || "",
        phone: me.phone || "",
        address: {
          street: me.address?.street || "",
          city: me.address?.city || "",
          state: me.address?.state || "",
          zipCode: me.address?.zipCode || "",
          country: me.address?.country || "Nigeria",
          coordinates: me.address?.coordinates,
        },
        social: {
          whatsapp: me.social?.whatsapp || "",
          facebook: me.social?.facebook || "",
          instagram: me.social?.instagram || "",
          twitter: me.social?.twitter || "",
        },
      };

      setForm(loadedForm);
      setOriginalForm(loadedForm);
      setUserMeta({
        email: me.email || "",
        role: me.role || "vendor",
        isVerified: Boolean(me.isVerified),
        lastLogin: me.lastLogin,
      });
      setError(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load profile details"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!form.id) {
      setError("User identifier is unavailable. Refresh and try again.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const address = { ...form.address };
      const coordinates = address.coordinates;
      if (
        !coordinates ||
        typeof coordinates.lat !== "number" ||
        typeof coordinates.lng !== "number" ||
        Number.isNaN(coordinates.lat) ||
        Number.isNaN(coordinates.lng)
      ) {
        address.coordinates = { lat: 0, lng: 0 };
      }

      await api.put(`/api/users/${form.id}`, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address,
        social: form.social,
      });

      setOriginalForm(form);
      setSuccess("Profile updated successfully");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          (err?.response && JSON.stringify(err.response.data)) ||
          err?.message ||
          "Unable to save profile"
      );
    } finally {
      setSaving(false);
    }
  }

  const initials = useMemo(
    () => getInitials(form.firstName, form.lastName),
    [form.firstName, form.lastName]
  );

  const hasChanges = useMemo(() => {
    if (!originalForm) return false;
    return JSON.stringify(form) !== JSON.stringify(originalForm);
  }, [form, originalForm]);

  const displayPhone = form.phone?.trim() || "Not specified";
  const displayWhatsApp = form.social.whatsapp?.trim() || "Add a number";

  const displayName = useMemo(() => {
    const first = form.firstName?.trim() || "";
    const last = form.lastName?.trim() || "";
    const full = `${first} ${last}`.trim();
    if (full) return full;
    if (userMeta?.email) return userMeta.email;
    return "Vendor workspace";
  }, [form.firstName, form.lastName, userMeta?.email]);

  const connectedChannels = useMemo(() => {
    return Object.values(form.social).filter((value) =>
      Boolean(value && value.trim())
    ).length;
  }, [form.social]);

  const addressCompletion = useMemo(() => {
    const keys: (keyof Address)[] = [
      "street",
      "city",
      "state",
      "zipCode",
      "country",
    ];
    const total = keys.length;
    const filled = keys.filter((key) =>
      Boolean(form.address?.[key]?.toString().trim())
    ).length;
    return Math.round((filled / total) * 100);
  }, [form.address]);

  const profileCompletion = useMemo(() => {
    const checkpoints = [
      form.firstName,
      form.lastName,
      form.phone,
      form.address.street,
      form.address.city,
      form.address.state,
      form.address.zipCode,
      form.address.country,
    ];
    const total = checkpoints.length;
    const filled = checkpoints.filter((value) =>
      Boolean(value && value.trim())
    ).length;
    return Math.round((filled / total) * 100);
  }, [
    form.firstName,
    form.lastName,
    form.phone,
    form.address.street,
    form.address.city,
    form.address.state,
    form.address.zipCode,
    form.address.country,
  ]);

  const roleDisplay = userMeta?.role ? toTitleCase(userMeta.role) : "Vendor";

  const profileSummary = useMemo(() => {
    return `Stay discoverable by keeping contact and location details updated. ${addressCompletion}% of your address is complete with ${connectedChannels}/${SOCIAL_CHANNEL_COUNT} channels live.`;
  }, [addressCompletion, connectedChannels]);

  const timeline = useMemo(
    () =>
      [
        {
          label: "Last activity",
          value: formatDateTime(userMeta?.lastLogin),
          hint: "Most recent sign-in recorded",
        },
        {
          label: "Verification",
          value: userMeta?.isVerified
            ? "Vendor verified"
            : "Awaiting verification",
          hint: userMeta?.isVerified
            ? "You can receive payments and leads without restrictions."
            : "Complete compliance documents to unlock payouts.",
        },
        {
          label: "Workspace email",
          value: userMeta?.email || "Not provided",
          hint: "Used for invoices, alerts, and account recovery.",
        },
        {
          label: "Workspace role",
          value: roleDisplay,
          hint: "Determines which tools are available to you.",
        },
        {
          label: "Primary phone",
          value: displayPhone,
          hint: "Shared with qualified leads who book consultations.",
        },
        {
          label: "WhatsApp channel",
          value: displayWhatsApp,
          hint:
            displayWhatsApp === "Add a number"
              ? "Connect WhatsApp to enable instant quoting."
              : "Your customers can chat with you in real time.",
        },
      ].filter((entry) => Boolean(entry.value && entry.value.trim())),
    [
      userMeta?.lastLogin,
      userMeta?.isVerified,
      userMeta?.email,
      roleDisplay,
      displayPhone,
      displayWhatsApp,
    ]
  );

  const handleAddressChange = (key: keyof Address, value: string) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [key]: value },
    }));
  };

  const handleSocialChange = (key: keyof Social, value: string) => {
    setForm((prev) => ({
      ...prev,
      social: { ...prev.social, [key]: value },
    }));
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <section className="profile-shell">
        <div className="profile-loading glass-panel">
          <span className="profile-spinner" aria-hidden="true" />
          <p>Loading your workspace profile</p>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-shell">
      {error ? (
        <div className="profile-alert profile-alert--error glass-panel">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      ) : null}
      {success ? (
        <div className="profile-alert profile-alert--success glass-panel">
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            aria-label="Dismiss success message"
          >
            &times;
          </button>
        </div>
      ) : null}
      <header className="profile-banner glass-panel">
        <div className="profile-banner__avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="profile-banner__content">
          <span className="profile-banner__eyebrow">Vendor profile</span>
          <h1>{displayName}</h1>
          <p>{profileSummary}</p>
          <div className="profile-banner__chips">
            <span
              className={`profile-chip ${
                userMeta?.isVerified
                  ? "profile-chip--success"
                  : "profile-chip--pending"
              }`}
            >
              {userMeta?.isVerified
                ? "Verified vendor"
                : "Verification pending"}
            </span>
            <span className="profile-chip">{profileCompletion}% complete</span>
            <span className="profile-chip profile-chip--muted">
              {connectedChannels}/{SOCIAL_CHANNEL_COUNT} channels live
            </span>
          </div>
        </div>
        <dl className="profile-banner__stats">
          <div>
            <dt>Profile completeness</dt>
            <dd>{profileCompletion}%</dd>
            <small>Keep your storefront accurate.</small>
          </div>
          <div>
            <dt>Channels live</dt>
            <dd>
              {connectedChannels}/{SOCIAL_CHANNEL_COUNT}
            </dd>
            <small>WhatsApp, Facebook, Instagram, X.</small>
          </div>
          <div>
            <dt>Address quality</dt>
            <dd>{addressCompletion}%</dd>
            <small>Used for in-person services.</small>
          </div>
        </dl>
      </header>

      <div className="profile-dashboard">
        <aside className="profile-aside">
          <article className="profile-card glass-panel">
            <header className="profile-card__header">
              <h2>Account health</h2>
              <p>Snapshot of how complete your storefront profile is today.</p>
            </header>
            <ul className="profile-metrics">
              <li className="profile-metrics__item">
                <div>
                  <span className="profile-metrics__label">
                    Profile completeness
                  </span>
                  <span className="profile-metrics__meta">
                    Add missing contact details to unlock more leads.
                  </span>
                </div>
                <span className="profile-metrics__value">
                  {profileCompletion}%
                </span>
              </li>
              <li className="profile-metrics__item">
                <div>
                  <span className="profile-metrics__label">
                    Address accuracy
                  </span>
                  <span className="profile-metrics__meta">
                    {addressCompletion === 100
                      ? "Customers can find you without friction."
                      : "Complete your location details for site visits."}
                  </span>
                </div>
                <span className="profile-metrics__value">
                  {addressCompletion}%
                </span>
              </li>
              <li className="profile-metrics__item">
                <div>
                  <span className="profile-metrics__label">
                    Channels connected
                  </span>
                  <span className="profile-metrics__meta">
                    Connect every social channel you actively manage.
                  </span>
                </div>
                <span className="profile-metrics__value">
                  {connectedChannels}/{SOCIAL_CHANNEL_COUNT}
                </span>
              </li>
            </ul>
          </article>

          <article className="profile-card glass-panel">
            <header className="profile-card__header">
              <h2>Activity &amp; status</h2>
              <p>Key checkpoints for your workspace identity.</p>
            </header>
            <ol className="profile-timeline">
              {timeline.map((entry) => (
                <li key={entry.label} className="profile-timeline__item">
                  <span className="profile-timeline__label">{entry.label}</span>
                  <span className="profile-timeline__value">{entry.value}</span>
                  <span className="profile-timeline__hint">{entry.hint}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="profile-card glass-panel profile-card--actions">
            <header className="profile-card__header">
              <h2>Quick actions</h2>
              <p>Manage access and keep your workspace in sync.</p>
            </header>
            <div className="profile-card__actions">
              <button
                type="button"
                className="btn btn--ghost btn--wide"
                onClick={fetchProfile}
                disabled={loading}
              >
                Refresh profile data
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--wide"
                onClick={() => navigate("/dashboard")}
              >
                Open vendor dashboard
              </button>
              <button
                type="button"
                className="btn btn--danger btn--wide"
                onClick={logout}
              >
                Sign out
              </button>
            </div>
          </article>
        </aside>

        <form className="profile-form glass-panel" onSubmit={handleSave}>
          <header className="profile-form__header">
            <div>
              <h2>Profile settings</h2>
              <p>
                Align your customer-facing details with your on-ground team.
              </p>
            </div>
            <span className="profile-form__status">
              {hasChanges ? "Unsaved changes" : "All changes saved"}
            </span>
          </header>

          <section className="profile-section">
            <div className="profile-section__header">
              <h3>Contact information</h3>
              <p>Introduce the main point of contact for new customer leads.</p>
            </div>
            <div className="profile-grid profile-grid--two">
              <label>
                <span>First name</span>
                <input
                  value={form.firstName}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      firstName: event.target.value,
                    }))
                  }
                  placeholder="Jane"
                  autoComplete="given-name"
                />
              </label>
              <label>
                <span>Last name</span>
                <input
                  value={form.lastName}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      lastName: event.target.value,
                    }))
                  }
                  placeholder="Doe"
                  autoComplete="family-name"
                />
              </label>
            </div>
            <label>
              <span>Email</span>
              <input value={form.email} readOnly disabled placeholder="Email" />
              <small className="profile-note">
                Email is managed by the platform. Contact support to request a
                change.
              </small>
            </label>
            <label>
              <span>Phone number</span>
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                placeholder="(+234) 000 000 0000"
                autoComplete="tel"
              />
            </label>
          </section>

          <section className="profile-section">
            <div className="profile-section__header">
              <h3>Business location</h3>
              <p>
                Map the exact address customers should visit or schedule with.
              </p>
            </div>
            <div className="profile-grid profile-grid--two">
              <label>
                <span>Street</span>
                <input
                  value={form.address.street}
                  onChange={(event) =>
                    handleAddressChange("street", event.target.value)
                  }
                  placeholder="Street address"
                  autoComplete="address-line1"
                />
              </label>
              <label>
                <span>City</span>
                <input
                  value={form.address.city}
                  onChange={(event) =>
                    handleAddressChange("city", event.target.value)
                  }
                  placeholder="City"
                  autoComplete="address-level2"
                />
              </label>
              <label>
                <span>State / Region</span>
                <input
                  value={form.address.state}
                  onChange={(event) =>
                    handleAddressChange("state", event.target.value)
                  }
                  placeholder="State"
                  autoComplete="address-level1"
                />
              </label>
              <label>
                <span>Postal code</span>
                <input
                  value={form.address.zipCode}
                  onChange={(event) =>
                    handleAddressChange("zipCode", event.target.value)
                  }
                  placeholder="Postal code"
                  autoComplete="postal-code"
                />
              </label>
              <label>
                <span>Country</span>
                <input
                  value={form.address.country}
                  onChange={(event) =>
                    handleAddressChange("country", event.target.value)
                  }
                  placeholder="Country"
                  autoComplete="country-name"
                />
              </label>
            </div>
          </section>

          <section className="profile-section">
            <div className="profile-section__header">
              <h3>Digital presence</h3>
              <p>
                Connect the channels customers use when researching vendors.
              </p>
            </div>
            <div className="profile-grid profile-grid--two">
              <label>
                <span>WhatsApp</span>
                <input
                  value={form.social.whatsapp}
                  onChange={(event) =>
                    handleSocialChange("whatsapp", event.target.value)
                  }
                  placeholder="WhatsApp number or link"
                />
              </label>
              <label>
                <span>Facebook</span>
                <input
                  value={form.social.facebook}
                  onChange={(event) =>
                    handleSocialChange("facebook", event.target.value)
                  }
                  placeholder="Facebook page URL"
                />
              </label>
              <label>
                <span>Instagram</span>
                <input
                  value={form.social.instagram}
                  onChange={(event) =>
                    handleSocialChange("instagram", event.target.value)
                  }
                  placeholder="@yourhandle"
                />
              </label>
              <label>
                <span>Twitter / X</span>
                <input
                  value={form.social.twitter}
                  onChange={(event) =>
                    handleSocialChange("twitter", event.target.value)
                  }
                  placeholder="@yourbrand"
                />
              </label>
            </div>
          </section>

          <footer className="profile-actions">
            <div className="profile-actions__meta">
              {hasChanges
                ? "Review your updates before publishing live to customers."
                : "Your storefront is aligned with the latest details."}
            </div>
            <div className="profile-actions__buttons">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={saving || !hasChanges}
              >
                {saving ? "Saving changes..." : "Save changes"}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </footer>
        </form>
      </div>
    </section>
  );
};

export default ProfilePage;
