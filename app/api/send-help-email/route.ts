import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { subject, message, from } = await req.json();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: from || "no-reply@hdx.com",
      to: ["alex@heterodoxlabs.com", "zach@heterodoxlabs.com"],
      subject: `[HDX Help] ${subject}`,
      text: message,
      html: `<p>${message.replace(/\n/g, "<br/>")}</p>`
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
} 