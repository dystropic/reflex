import "server-only";

export const sendEmailVerification = async (email: string, link: string) => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("EMAIL VERIFICATION LINK for", email, "->", link);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM ?? "REFLEX <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your REFLEX email",
      text: `Welcome to REFLEX.\n\nVerify your email here (valid 24 hours): ${link}\n\nIf this wasn't you, ignore this email.`,
    }),
  });
  if (!res.ok) {
    console.log("verification email failed", res.status, await res.text());
  }
};

export const sendPasswordReset = async (email: string, link: string) => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("PASSWORD RESET LINK for", email, "->", link);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM ?? "REFLEX <onboarding@resend.dev>",
      to: [email],
      subject: "Reset your REFLEX password",
      text: `Someone requested a password reset for your REFLEX account.\n\nReset it here (valid 30 minutes): ${link}\n\nIf this wasn't you, ignore this email.`,
    }),
  });
  if (!res.ok) {
    console.log("password reset email failed", res.status, await res.text());
  }
};
