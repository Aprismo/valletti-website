"use client";

import { useState, FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function VisitForm() {
  const t = useTranslations("visit");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, locale }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="bg-gold/15 border border-gold/40 text-wine-dark p-6 text-sm">
        {t("formSuccess")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          {t("formName")}
          <input
            name="name"
            required
            className="border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:border-wine"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t("formEmail")}
          <input
            type="email"
            name="email"
            required
            className="border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:border-wine"
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          {t("formPhone")}
          <input
            name="phone"
            className="border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:border-wine"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t("formType")}
          <select
            name="type"
            className="border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:border-wine"
          >
            <option value="visit">{t("formTypeVisit")}</option>
            <option value="question">{t("formTypeQuestion")}</option>
            <option value="distribution">{t("formTypeDistribution")}</option>
            <option value="journalist">{t("formTypeJournalist")}</option>
          </select>
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          {t("formCountry")}
          <input
            name="country"
            className="border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:border-wine"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t("formDate")}
          <input
            type="date"
            name="preferredDate"
            className="border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:border-wine"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t("formGuests")}
          <input
            type="number"
            min={1}
            name="guests"
            className="border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:border-wine"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        {t("formMessage")}
        <textarea
          name="message"
          required
          rows={4}
          className="border border-ink/20 px-3 py-2 bg-white focus:outline-none focus:border-wine"
        />
      </label>

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-wine text-cream px-6 py-3 text-sm uppercase tracking-wide hover:opacity-90 disabled:opacity-60 w-fit"
      >
        {status === "sending" ? "…" : t("formSubmit")}
      </button>

      {status === "error" && (
        <p className="text-red-700 text-sm">
          Something went wrong — please try again or email us directly.
        </p>
      )}

      <p className="text-xs text-ink/50">{t("formNote")}</p>
    </form>
  );
}
