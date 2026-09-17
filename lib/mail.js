/**
 * Fastmail SMTP transactional mail for Tonaura.
 * Set SMTP_* + MAIL_FROM_* on Vercel. Fails soft if unset (logs, no throw).
 *
 * Colours match the live site: bg #050508, gold #C9A24B, teal #4FB3A9, ink #F3EEE4.
 */
import nodemailer from "nodemailer";
import { escapeHtml, sanitizeEmailSubject } from "@/lib/security";

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
  return `Tonaura <${fromAddress(kind)}>`;
}

function siteUrl() {
  return env("NEXT_PUBLIC_SITE_URL", "https://tonaura.com").replace(/\/$/, "");
}

function logoUrl() {
  return env("MAIL_LOGO_URL", `${siteUrl()}/images/brand/lockup.png`);
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

const FONT = "system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const GOLD = "#C9A24B";
const TEAL = "#4FB3A9";
const BG = "#050508";
const CARD = "#0c0c12";
const INK = "#F3EEE4";

function btn(href, label) {
  return `<a href="${href}" style="display:inline-block;background:${GOLD};color:#1a1608;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:600;font-size:14px;font-family:${FONT};letter-spacing:0.01em;">${label}</a>`;
}

/**
 * Shared branded shell — Tonaura logo + site colour scheme.
 * @param {{ eyebrow?: string, title: string, bodyHtml: string, footerNote?: string }} opts
 */
function wrap({ eyebrow = "Tonaura", title, bodyHtml, footerNote }) {
  const site = siteUrl();
  const logo = logoUrl();
  const note =
    footerNote ||
    `Tonaura · Solfeggio tone therapy<br/><a href="${site}" style="color:${GOLD};text-decoration:none;">tonaura.com</a> · <a href="mailto:support@tonaura.io" style="color:rgba(237,231,217,0.55);text-decoration:none;">support@tonaura.io</a>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};color:${INK};font-family:${FONT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border-collapse:separate;">
        <tr>
          <td style="padding:0 0 18px;text-align:center;">
            <img src="${logo}" alt="Tonaura" width="168" height="54" style="display:inline-block;max-width:168px;height:auto;border:0;outline:none;text-decoration:none;" />
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 14px;text-align:center;">
            <span style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${GOLD};font-weight:600;">${escapeHtml(eyebrow)}</span>
          </td>
        </tr>
        <tr>
          <td style="background:${CARD};border:1px solid rgba(243,238,228,0.1);border-radius:20px;overflow:hidden;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="height:3px;background:linear-gradient(90deg,${GOLD} 0%,${TEAL} 55%,${GOLD} 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
              <tr>
                <td style="padding:32px 28px 8px;">
                  <h1 style="margin:0;font-size:26px;line-height:1.25;font-weight:600;color:${INK};letter-spacing:-0.02em;">${escapeHtml(title)}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 28px 32px;font-size:15px;line-height:1.65;color:rgba(243,238,228,0.78);">
                  ${bodyHtml}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 12px 0;text-align:center;font-size:12px;line-height:1.6;color:rgba(243,238,228,0.4);">
            ${note}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function metaRow(label, valueHtml) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid rgba(243,238,228,0.08);width:110px;vertical-align:top;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:rgba(243,238,228,0.45);font-weight:600;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid rgba(243,238,228,0.08);vertical-align:top;font-size:14px;color:${INK};">${valueHtml}</td>
  </tr>`;
}

async function send({ to, subject, html, text, kind = "support", replyTo }) {
  const tx = getTransporter();
  if (!tx || !to) {
    console.warn("[mail] skipped — set SMTP_USER and SMTP_PASS on Vercel.", {
      subject,
      to: to || null,
      configured: mailConfigured(),
    });
    return { skipped: true, reason: "smtp_not_configured" };
  }
  try {
    const info = await tx.sendMail({
      from: fromHeader(kind),
      to,
      subject: sanitizeEmailSubject(subject),
      html,
      text,
      replyTo: replyTo || fromAddress("support"),
    });
    console.log("[mail] sent", { subject, to, id: info.messageId });
    return { ok: true, id: info.messageId };
  } catch (err) {
    console.error("[mail] send failed", { subject, to, error: err?.message || String(err) });
    return { skipped: true, reason: "send_failed", error: err?.message || String(err) };
  }
}

function topicLabel(topic) {
  const raw = String(topic || "General question").trim();
  const key = raw.toLowerCase().replace(/&amp;/g, "&");
  const map = {
    general: "General question",
    "general question": "General question",
    billing: "Billing & subscriptions",
    "billing & subscriptions": "Billing & subscriptions",
    privacy: "Privacy & data",
    "privacy & data": "Privacy & data",
    technical: "Report a bug",
    "report a bug": "Report a bug",
    feedback: "Feedback",
    other: "Something else",
    "something else": "Something else",
  };
  return map[key] || raw.replace(/[_-]+/g, " ");
}

export function planLabelFromKey(key) {
  if (key === "yearly") return "Yearly Premium";
  if (key === "lifetime") return "Lifetime Premium";
  if (key === "monthly") return "Monthly Premium";
  return "Premium";
}

export async function sendWelcomeEmail({ to }) {
  const site = siteUrl();
  return send({
    kind: "info",
    to,
    subject: "Welcome to Tonaura",
    text: `Welcome to Tonaura.\n\nYour account is ready. Confirm your email if you haven’t yet, then sign in on the website and in the app with this same address.\n\nAccount: ${site}/account\n`,
    html: wrap({
      title: "Welcome to Tonaura",
      bodyHtml: `
        <p style="margin:0 0 14px;">Your account is ready. Confirm the email from us if you haven’t yet, then sign in on the website and in the app with this same address.</p>
        <p style="margin:0 0 22px;">Nine tones. One place to be still — offline by default, honest about what it is.</p>
        <p style="margin:0 0 18px;">${btn(`${site}/account`, "Open your account")}</p>
        <p style="margin:0;font-size:13px;color:rgba(243,238,228,0.5);">Premium is sold on the website. After you subscribe, open the app, sign in, and tap Refresh Premium.</p>
      `,
    }),
  });
}

export async function sendPaymentConfirmedEmail({ to, planLabel }) {
  const site = siteUrl();
  const plan = planLabel || "Premium";
  return send({
    kind: "billing",
    to,
    subject: `Payment confirmed — ${plan}`,
    text: `Thanks — your ${plan} payment for Tonaura went through.\n\nSign in to the app with this email and tap Refresh Premium.\nManage billing: ${site}/account\n`,
    html: wrap({
      eyebrow: "Billing",
      title: "Payment confirmed",
      bodyHtml: `
        <p style="margin:0 0 14px;">Thanks — your <strong style="color:${INK};">${escapeHtml(plan)}</strong> payment went through. Premium is on this account.</p>
        <p style="margin:0 0 22px;">Open the Tonaura app, sign in with this same email, and tap <strong style="color:${INK};">Refresh Premium</strong> if anything still looks locked.</p>
        <p style="margin:0 0 18px;">${btn(`${site}/account`, "Manage billing")}</p>
        <p style="margin:0;font-size:13px;color:rgba(243,238,228,0.5);">Stripe also sends a receipt separately. Keep both for your records.</p>
      `,
    }),
  });
}

export async function sendPaymentFailedEmail({ to, planLabel }) {
  const site = siteUrl();
  const plan = planLabel || "Premium";
  return send({
    kind: "billing",
    to,
    subject: `Payment failed — ${plan}`,
    text: `We couldn’t take your Tonaura ${plan} payment.\n\nUpdate your card so Premium stays on: ${site}/account\n\nIf you already fixed it, you can ignore this.\n`,
    html: wrap({
      eyebrow: "Billing",
      title: "Payment didn’t go through",
      bodyHtml: `
        <p style="margin:0 0 14px;">We couldn’t take your <strong style="color:${INK};">${escapeHtml(plan)}</strong> payment. Premium may pause until billing is fixed.</p>
        <p style="margin:0 0 22px;">Update your payment method on your account — it only takes a moment.</p>
        <p style="margin:0 0 18px;">${btn(`${site}/account`, "Update billing")}</p>
        <p style="margin:0;font-size:13px;color:rgba(243,238,228,0.5);">Already sorted? You can ignore this email.</p>
      `,
    }),
  });
}

export async function sendSubscriptionEmail({ to, planLabel, active }) {
  const site = siteUrl();
  if (!active) {
    return send({
      kind: "billing",
      to,
      subject: "Your Tonaura subscription ended",
      text: `Your Tonaura subscription is no longer active. You can resubscribe anytime at ${site}/account\n`,
      html: wrap({
        eyebrow: "Billing",
        title: "Subscription ended",
        bodyHtml: `
          <p style="margin:0 0 14px;">Your Tonaura subscription is no longer active. Core listening still works; Premium tones and extras lock again.</p>
          <p style="margin:0;">${btn(`${site}/account`, "Resubscribe")}</p>
        `,
      }),
    });
  }
  const plan = planLabel || "Premium";
  return send({
    kind: "billing",
    to,
    subject: `Subscription confirmed — ${plan}`,
    text: `Your Tonaura ${plan} subscription is active.\n\nApp: sign in with this email → Refresh Premium.\nManage: ${site}/account\n`,
    html: wrap({
      eyebrow: "Billing",
      title: "Subscription confirmed",
      bodyHtml: `
        <p style="margin:0 0 14px;">Your <strong style="color:${INK};">${escapeHtml(plan)}</strong> subscription is active. Use this same email in the app, then tap Refresh Premium if needed.</p>
        <p style="margin:0;">${btn(`${site}/account`, "Account &amp; billing")}</p>
      `,
    }),
  });
}

export async function sendContactAckEmail({ to, name, topic }) {
  const first = name ? String(name).split(/\s+/)[0] : "there";
  const who = escapeHtml(first);
  const topicText = topicLabel(topic);
  const site = siteUrl();
  return send({
    kind: "support",
    to,
    subject: "We received your message — Tonaura",
    text: `Hi ${first},\n\nThanks for writing to Tonaura. We’ve received your message${topic ? ` about “${topicText}”` : ""} and will reply from support@tonaura.io — usually within one business day.\n\nIf you need to add anything, just reply to this email.\n\n— Tonaura\n${site}\n`,
    html: wrap({
      eyebrow: "Support",
      title: "We received your message",
      bodyHtml: `
        <p style="margin:0 0 14px;">Hi ${who},</p>
        <p style="margin:0 0 14px;">Thanks for writing. We’ve got your message${topic ? ` about <strong style="color:${INK};">${escapeHtml(topicText)}</strong>` : ""} and a real person will reply from <a href="mailto:support@tonaura.io" style="color:${GOLD};text-decoration:none;">support@tonaura.io</a>.</p>
        <p style="margin:0 0 22px;">Most replies land within <strong style="color:${INK};">one business day</strong>. If you need to add detail, just reply to this email — it stays on the same thread.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(243,238,228,0.04);border:1px solid rgba(243,238,228,0.08);border-radius:12px;margin:0 0 22px;">
          <tr><td style="padding:16px 18px;font-size:13px;line-height:1.55;color:rgba(243,238,228,0.65);">
            <strong style="color:${GOLD};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">While you wait</strong>
            <p style="margin:8px 0 0;">You can keep listening in the app, or browse <a href="${site}/support.html" style="color:${GOLD};text-decoration:none;">Help</a> and <a href="${site}/compare.html" style="color:${GOLD};text-decoration:none;">Compare</a> on the site.</p>
          </td></tr>
        </table>
        <p style="margin:0;font-size:13px;color:rgba(243,238,228,0.5);">Nine tones. One place to be still.</p>
      `,
    }),
  });
}

export async function sendVerifyEmail({ to, verifyUrl }) {
  const site = siteUrl();
  const url = String(verifyUrl || `${site}/login`);
  return send({
    kind: "support",
    to,
    subject: "Confirm your Tonaura email",
    text: `Confirm your Tonaura email by opening this link:\n\n${url}\n\nIf you didn’t create an account, you can ignore this.\n`,
    html: wrap({
      eyebrow: "Account",
      title: "Confirm your email",
      bodyHtml: `
        <p style="margin:0 0 14px;">One tap confirms this address for your Tonaura account — website and app.</p>
        <p style="margin:0 0 22px;">${btn(url, "Confirm email")}</p>
        <p style="margin:0;font-size:13px;color:rgba(243,238,228,0.5);">If you didn’t sign up, you can ignore this email.</p>
      `,
    }),
  });
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  const site = siteUrl();
  const url = String(resetUrl || `${site}/forgot-password`);
  return send({
    kind: "support",
    to,
    subject: "Reset your Tonaura password",
    text: `Reset your Tonaura password:\n\n${url}\n\nThis link expires soon. If you didn’t ask for a reset, ignore this email.\n`,
    html: wrap({
      eyebrow: "Security",
      title: "Reset your password",
      bodyHtml: `
        <p style="margin:0 0 14px;">We got a request to reset the password for this Tonaura account.</p>
        <p style="margin:0 0 22px;">${btn(url, "Choose a new password")}</p>
        <p style="margin:0;font-size:13px;color:rgba(243,238,228,0.5);">Didn’t request this? You can ignore this email — your password stays the same.</p>
      `,
    }),
  });
}

export async function sendMagicLinkEmail({ to, magicUrl }) {
  const site = siteUrl();
  const url = String(magicUrl || `${site}/login`);
  return send({
    kind: "support",
    to,
    subject: "Your Tonaura sign-in link",
    text: `Sign in to Tonaura with this link (expires soon):\n\n${url}\n\nIf you didn’t ask for this, ignore the email.\n`,
    html: wrap({
      eyebrow: "Sign in",
      title: "Your sign-in link",
      bodyHtml: `
        <p style="margin:0 0 14px;">Use this one-time link to sign in to Tonaura. It expires soon for your safety.</p>
        <p style="margin:0 0 22px;">${btn(url, "Sign in to Tonaura")}</p>
        <p style="margin:0;font-size:13px;color:rgba(243,238,228,0.5);">Didn’t request a link? You can ignore this email.</p>
      `,
    }),
  });
}

export async function sendSecurityAlertEmail({ to, eventLabel, detail }) {
  const site = siteUrl();
  const event = String(eventLabel || "Account change").trim();
  const extra = detail ? String(detail).trim() : "";
  return send({
    kind: "support",
    to,
    subject: `Security alert — ${event}`,
    text: `Tonaura security alert: ${event}.${extra ? `\n\n${extra}` : ""}\n\nIf this wasn’t you, reset your password at ${site}/forgot-password and contact support@tonaura.io.\n`,
    html: wrap({
      eyebrow: "Security",
      title: "Something changed on your account",
      bodyHtml: `
        <p style="margin:0 0 14px;"><strong style="color:${INK};">${escapeHtml(event)}</strong> on your Tonaura account.</p>
        ${extra ? `<p style="margin:0 0 14px;">${escapeHtml(extra)}</p>` : ""}
        <p style="margin:0 0 22px;">If this was you, no action needed. If it wasn’t, reset your password and write to support.</p>
        <p style="margin:0 0 18px;">${btn(`${site}/forgot-password`, "Reset password")}</p>
        <p style="margin:0;font-size:13px;color:rgba(243,238,228,0.5);"><a href="mailto:support@tonaura.io" style="color:${GOLD};text-decoration:none;">support@tonaura.io</a></p>
      `,
    }),
  });
}

export async function sendAdminInviteEmail({ to, inviteUrl, invitedBy }) {
  const site = siteUrl();
  const url = String(inviteUrl || `${site}/login`);
  const by = invitedBy ? String(invitedBy).trim() : "";
  return send({
    kind: "support",
    to,
    subject: "You’re invited to Tonaura Admin",
    text: `You’ve been invited to the Tonaura admin console${by ? ` by ${by}` : ""}.\n\nAccept: ${url}\n\nIf you weren’t expecting this, ignore the email.\n`,
    html: wrap({
      eyebrow: "Admin",
      title: "You’re invited to Admin",
      bodyHtml: `
        <p style="margin:0 0 14px;">You’ve been invited to the Tonaura admin console${by ? ` by <strong style="color:${INK};">${escapeHtml(by)}</strong>` : ""}.</p>
        <p style="margin:0 0 22px;">Accept the invite to set your password and open the console.</p>
        <p style="margin:0 0 18px;">${btn(url, "Accept invite")}</p>
        <p style="margin:0;font-size:13px;color:rgba(243,238,228,0.5);">Wasn’t expecting this? You can ignore this email.</p>
      `,
    }),
  });
}

/** Admin reply to a contact form visitor. */
export async function sendContactReplyEmail({ to, name, reply, originalMessage }) {
  const safeName = String(name || "").trim();
  const safeReply = String(reply || "").trim();
  const greeting = safeName ? `Hi ${escapeHtml(safeName)},` : "Hi,";
  return send({
    kind: "support",
    to,
    subject: sanitizeEmailSubject("Reply from Tonaura support"),
    text: `${safeName ? `Hi ${safeName},` : "Hi,"}\n\n${safeReply}\n\n— Tonaura support\n`,
    html: wrap({
      eyebrow: "Support",
      title: "Reply from Tonaura",
      bodyHtml: `
        <p style="margin:0 0 14px;">${greeting}</p>
        <div style="margin:0 0 18px;font-size:15px;line-height:1.65;color:${INK};white-space:pre-wrap;">${escapeHtml(safeReply)}</div>
        ${
          originalMessage
            ? `<div style="margin:18px 0 0;padding:14px;background:rgba(243,238,228,0.04);border:1px solid rgba(243,238,228,0.1);border-radius:12px;font-size:13px;color:rgba(243,238,228,0.55);white-space:pre-wrap;">Your message:<br/>${escapeHtml(String(originalMessage).slice(0, 800))}</div>`
            : ""
        }
      `,
    }),
  });
}

/** One-off broadcast to a subscriber. */
export async function sendBroadcastEmail({ to, subject, bodyHtml }) {
  const safeSubject = sanitizeEmailSubject(String(subject || "Message from Tonaura"));
  const htmlBody = String(bodyHtml || "").trim();
  return send({
    kind: "info",
    to,
    subject: safeSubject,
    text: htmlBody.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    html: wrap({
      eyebrow: "Update",
      title: safeSubject,
      bodyHtml: htmlBody || "<p>Update from Tonaura.</p>",
    }),
  });
}

/**
 * Internal alert when someone submits the contact form.
 * Reply-To is the visitor so you can answer with one click.
 */
export async function notifySupportInbox({ name, email, topic, message }) {
  const inbox = env("MAIL_SUPPORT_INBOX", fromAddress("support"));
  const safeName = String(name || "Unknown").trim();
  const safeEmail = String(email || "").trim().toLowerCase();
  const safeTopic = topicLabel(topic);
  const safeMessage = String(message || "").trim();
  const subject = sanitizeEmailSubject(`New contact · ${safeTopic} · ${safeName}`);

  const text = [
    "New contact form message",
    "",
    `Name: ${safeName}`,
    `Email: ${safeEmail}`,
    `Topic: ${safeTopic}`,
    "",
    "Message:",
    safeMessage,
    "",
    "— Reply to this email to answer the visitor directly.",
  ].join("\n");

  const html = wrap({
    eyebrow: "Inbox",
    title: "New contact message",
    bodyHtml: `
      <p style="margin:0 0 18px;font-size:14px;color:rgba(243,238,228,0.65);">Someone wrote in from the website. Hit <strong style="color:${INK};">Reply</strong> to answer them directly.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
        ${metaRow("Name", escapeHtml(safeName))}
        ${metaRow("Email", `<a href="mailto:${escapeHtml(safeEmail)}" style="color:${GOLD};text-decoration:none;">${escapeHtml(safeEmail)}</a>`)}
        ${metaRow("Topic", escapeHtml(safeTopic))}
      </table>
      <div style="margin:0;padding:18px;background:rgba(243,238,228,0.04);border:1px solid rgba(243,238,228,0.1);border-radius:12px;">
        <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${GOLD};font-weight:600;margin-bottom:10px;">Message</div>
        <div style="font-size:15px;line-height:1.65;color:${INK};white-space:pre-wrap;">${escapeHtml(safeMessage)}</div>
      </div>
    `,
    footerNote: `Internal alert · Tonaura contact form<br/><a href="mailto:${escapeHtml(safeEmail)}" style="color:${GOLD};text-decoration:none;">Reply to visitor</a>`,
  });

  return send({
    kind: "support",
    to: inbox,
    subject,
    text,
    html,
    replyTo: safeEmail || fromAddress("support"),
  });
}

