import React, { useEffect, useState } from "react";
import { BadgeCheck, Building2, Clock3, Mail, MapPin, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import axiosClient from "../api/axiosClient";

interface ProfileData {
  user_id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  last_login: string | null;
  full_name: string | null;
  organization: string | null;
  department: string | null;
  job_title: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  updated_at: string | null;
}

const emptyProfile: Partial<ProfileData> = {
  full_name: "",
  organization: "",
  department: "",
  job_title: "",
  phone: "",
  location: "",
  bio: "",
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState<Partial<ProfileData>>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axiosClient.get<ProfileData>("/auth/profile")
      .then(({ data }) => {
        setProfile(data);
        setForm({
          full_name: data.full_name ?? "",
          organization: data.organization ?? "",
          department: data.department ?? "",
          job_title: data.job_title ?? "",
          phone: data.phone ?? "",
          location: data.location ?? "",
          bio: data.bio ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof ProfileData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const { data } = await axiosClient.patch<ProfileData>("/auth/profile", {
        full_name: form.full_name,
        organization: form.organization,
        department: form.department,
        job_title: form.job_title,
        phone: form.phone,
        location: form.location,
        bio: form.bio,
      });
      setProfile(data);
      setMessage("Profile saved successfully.");
    } catch (error: any) {
      setMessage(error?.response?.data?.detail || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--text-muted)]">Loading profile…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)] text-xl font-bold text-white">
              {(profile?.full_name || profile?.username || "O").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Operator profile</p>
              <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{profile?.full_name || profile?.username}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{profile?.email}</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />{profile?.role}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <div className="rounded-2xl bg-[var(--surface-soft)] px-4 py-3"><span className="text-[var(--text-subtle)]">Account</span><div className="mt-1 font-semibold text-[var(--text-primary)]">Active</div></div>
            <div className="rounded-2xl bg-[var(--surface-soft)] px-4 py-3"><span className="text-[var(--text-subtle)]">Joined</span><div className="mt-1 font-semibold text-[var(--text-primary)]">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</div></div>
            <div className="col-span-2 rounded-2xl bg-[var(--surface-soft)] px-4 py-3 sm:col-span-1"><span className="text-[var(--text-subtle)]">Last login</span><div className="mt-1 font-semibold text-[var(--text-primary)]">{profile?.last_login ? new Date(profile.last_login).toLocaleString() : "First session"}</div></div>
          </div>
        </div>
      </section>

      <form onSubmit={save} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div><h2 className="text-lg font-bold text-[var(--text-primary)]">Personal & organization details</h2><p className="mt-1 text-sm text-[var(--text-muted)]">These details are stored securely with your FedSentry account.</p></div>
          <BadgeCheck className="h-5 w-5 text-[var(--brand)]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["full_name", "Full name", UserRound],
            ["job_title", "Job title", ShieldCheck],
            ["organization", "Organization", Building2],
            ["department", "Department", Building2],
            ["phone", "Phone", Phone],
            ["location", "Location", MapPin],
          ].map(([key, label, Icon]: any) => (
            <label key={key} className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]"><Icon className="h-3.5 w-3.5" />{label}</span>
              <input value={(form as any)[key] ?? ""} onChange={(e) => update(key, e.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3.5 py-3 text-sm text-[var(--input-text)] outline-none transition focus:border-[var(--brand)]" />
            </label>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 text-xs font-semibold text-[var(--text-muted)]">About / SOC responsibilities</span>
          <textarea value={form.bio ?? ""} onChange={(e) => update("bio", e.target.value)} rows={4} className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3.5 py-3 text-sm text-[var(--input-text)] outline-none transition focus:border-[var(--brand)]" placeholder="Example: SOC analyst responsible for network monitoring, incident triage and threat investigation." />
        </label>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
          <div className="flex items-center gap-2 text-xs text-[var(--text-subtle)]"><Clock3 className="h-3.5 w-3.5" />{profile?.updated_at ? `Last updated ${new Date(profile.updated_at).toLocaleString()}` : "Profile details not saved yet"}</div>
          <div className="flex items-center gap-3">
            {message && <span className="text-sm text-[var(--text-muted)]">{message}</span>}
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save profile"}</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
