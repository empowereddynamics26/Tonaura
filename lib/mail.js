/**
 * Fastmail SMTP transactional mail for Tonaura.
 * Set SMTP_* + MAIL_FROM_* on Vercel. Fails soft if unset (logs, no throw).
 */
import nodemailer from "nodemailer";

function env(name, fallback = "") {
  return (process.env[name] || fallback).trim();
}

export function mailConfigured() {
  return Boolean(env("SMTP_USER") && env("SMTP_PASS"));
}

function fromAddress(kind = "support") {
  if (kind === "info") return env("MAIL_FROM_INFO", env("MAIL_FROM_SUPPORT", "info@tonaura.io"));
  if (kind === "billing") return env("MAIL_FROM_BILLING", env("MAIL_FROM_SUPPORT", "billing@tonaura.io"));
  return env("MAIL_FROM_SUPPORT", "support@tonaura.io");
}

function fromHeader(kind) {
  const addr = fromAddress(kind);
  return `Tonaura <${addr}>`;
}

let transporter;
function getTransporter() {
  if (!mailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env("SMTP_HOST", "smtp.fastmail.com"),
      port: Number(env("SMTP_PORT", "465")),
      secure: env("SMTP_SECURE", "true") !== "false",
      auth: {
        user: env("SMTP_USER"),
        pass: env("SMTP_PASS"),
      },
    });
  }
  return transporter;
}

const wrap = (title, bodyHtml) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#0b0b10;color:#EDE7D9;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b10;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#12121A;border:1px solid rgba(237,231,217,0.12);border-radius:16px;padding:28px 24px;">
        <tr><td style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A24B;font-family:system-ui,sans-serif;">Tonaura</td></tr>
        <tr><td style="padding-top:12px;font-size:24px;line-height:1.25;color:#EDE7D9;">${title}</td></tr>
        <tr><td style="padding-top:16px;font-size:15px;line-height:1.6;color:rgba(237,231,217,0.82);font-family:system-ui,-apple-system,sans-serif;">${bodyHtml}</td></tr>
        <tr><td style="padding-top:28px;font-size:12px;line-height:1.5;color:rgba(237,231,217,0.45);font-family:system-ui,sans-serif;">Questions? Reply to this email or write support@tonaura.io</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

async function send({ to, subject, html, text, kind = "support" }) {
  const tx = getTransporter();
  if (!tx || !to) {
    console.warn(
      "[mail] skipped — set SMTP_USER and SMTP_PASS (Fastmail App Password) on Vercel.",
      { subject, to: to || null, configured: mailConfigured() }
    );
    return { skipped: true, reason: "smtp_not_configured" };
  }
  try {
    const info = await tx.sendMail({
      from: fromHeader(kind),
      to,
      subject,
      html,
      text,
      replyTo: fromAddress("support"),
    });
    console.log("[mail] sent", { subject, to, id: info.messageId });
    return { ok: true, id: info.messageId };
  } catch (err) {
    console.error("[mail] send failed", { subject, to, error: err?.message || String(err) });
    return { skipped: true, reason: "send_failed", error: err?.message || String(err) };
  }
}

export async function sendWelcomeEmail({ to }) {
  const site = env("NEXT_PUBLIC_SITE_URL", "https://tonaura.io");
  return send({
    kind: "info",
    to,
    subject: "Welcome to Tonaura",
    text: `Your Tonaura account is ready.\n\nConfirm your email if you haven’t yet, then open the app and sign in with this same address.\n\nAccount: ${site}/account\n`,
    html: wrap(
      "Welcome to Tonaura",
      `<p>Your account is set up. Confirm the email from us if you haven’t yet, then sign in on the website and in the app with this same address.</p>
       <p style="margin-top:18px"><a href="${site}/account" style="display:inline-block;background:#C9A24B;color:#1a1608;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600;font-family:system-ui,sans-serif;">Open your account</a></p>
       <p style="margin-top:18px">Premium is sold on the website. After you subscribe, open the app, sign in, and tap Refresh Premium.</p>`
    ),
  });
}

export async function sendPaymentConfirmedEmail({ to, planLabel }) {
  const site = env("NEXT_PUBLIC_SITE_URL", "https://tonaura.io");
  const plan = planLabel || "Premium";
  return send({
    kind: "billing",
    to,
    subject: `Payment confirmed — ${plan}`,
    text: `Thanks — your ${plan} payment for Tonaura went through.\n\nSign in to the app with this email and tap Refresh Premium.\nManage billing: ${site}/account\n`,
    html: wrap(
      "Payment confirmed",
      `<p>Thanks — your <strong style="color:#EDE7D9">${plan}</strong> payment went through. Premium is on your account.</p>
       <p>Open the Tonaura app, sign in with this same email, and tap <strong style="color:#EDE7D9">Refresh Premium</strong> if locks are still up.</p>
       <p style="margin-top:18px"><a href="${site}/account" style="display:inline-block;background:#C9A24B;color:#1a1608;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600;font-family:system-ui,sans-serif;">Manage billing</a></p>
       <p style="margin-top:18px;font-size:13px;color:rgba(237,231,217,0.55)">Stripe also sends a receipt separately. Keep both for your records.</p>`
    ),
  });
}

export async function sendSubscriptionEmail({ to, planLabel, active }) {
  const site = env("NEXT_PUBLIC_SITE_URL", "https://tonaura.io");
  if (!active) {
    return send({
      kind: "billing",
      to,
      subject: "Your Tonaura subscription ended",
      text: `Your Tonaura subscription is no longer active. You can resubscribe anytime at ${site}/account\n`,
      html: wrap(
        "Subscription ended",
        `<p>Your Tonaura subscription is no longer active. Core listening still works; Premium tones and extras lock again.</p>
         <p style="margin-top:18px"><a href="${site}/account" style="color:#C9A24B">Resubscribe on your account</a></p>`
      ),
    });
  }
  const plan = planLabel || "Premium";
  return send({
    kind: "billing",
    to,
    subject: `Subscription confirmed — ${plan}`,
    text: `Your Tonaura ${plan} subscription is active.\n\nApp: sign in with this email → Refresh Premium.\nManage: ${site}/account\n`,
    html: wrap(
      "Subscription confirmed",
      `<p>Your <strong style="color:#EDE7D9">${plan}</strong> subscription is active. Same email in the app unlocks Premium after you refresh.</p>
       <p style="margin-top:18px"><a href="${site}/account" style="display:inline-block;background:#C9A24B;color:#1a1608;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600;font-family:system-ui,sans-serif;">Account &amp; billing</a></p>`
    ),
  });
}

export async function sendContactAckEmail({ to, name }) {
  const who = name ? String(name).split(/\s+/)[0] : "there";
  return send({
    kind: "support",
    to,
    subject: "We got your message — Tonaura",
    text: `Hi ${who},\n\nThanks for writing. We’ve received your message and will reply from support@tonaura.io.\n`,
    html: wrap(
      "We got your message",
      `<p>Hi ${who},</p><p>Thanks for writing. We’ve received your message and will reply from support@tonaura.io as soon as we can.</p>`
    ),
  });
}

export async function sendWaitlistAckEmail({ to }) {
  return send({
    kind: "info",
    to,
    subject: "You’re on the Tonaura list",
    text: `You’re on the early access list. We’ll email when there’s news.\n`,
    html: wrap(
      "You’re on the list",
      `<p>Thanks — you’re on the Tonaura early access list. We’ll write when there’s something worth opening.</p>`
    ),
  });
}

export async function notifySupportInbox({ subject, text }) {
  const inbox = env("MAIL_SUPPORT_INBOX", fromAddress("support"));
  return send({
    kind: "support",
    to: inbox,
    subject,
    text,
    html: wrap(subject, `<pre style="white-space:pre-wrap;font-family:system-ui,sans-serif;font-size:14px;color:rgba(237,231,217,0.85)">${String(text).replace(/</g, "&lt;")}</pre>`),
  });
}

export function planLabelFromKey(key) {
  if (key === "yearly") return "Yearly Premium";
  if (key === "lifetime") return "Lifetime Premium";
  if (key === "monthly") return "Monthly Premium";
  return "Premium";
}
