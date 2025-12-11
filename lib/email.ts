import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.EMAIL_FROM || "Acme <onboarding@resend.dev>";
const TO_EMAIL = process.env.TO_EMAIL!;

export async function sendVerificationEmail({
  email,
  token,
}: {
  email: string;
  token: string;
}): Promise<void> {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL ,
      subject: "Verify your email address - NextUp",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to NextUp!</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
              
              <p style="font-size: 16px; color: #555;">
                Thank you for signing up! Please verify your email address to get started with NextUp.
              </p>
              
              <p style="font-size: 16px; color: #555;">
                Click the button below to verify your email:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 14px 40px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          font-weight: 600; 
                          display: inline-block;
                          font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="font-size: 14px; color: #888; margin-top: 30px;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="font-size: 14px; color: #667eea; word-break: break-all; background: #f5f5f5; padding: 12px; border-radius: 5px;">
                ${verificationUrl}
              </p>
              
              <p style="font-size: 14px; color: #888; margin-top: 30px;">
                This link will expire in 1 hour.
              </p>
              
              <p style="font-size: 14px; color: #888;">
                If you didn't create an account with NextUp, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} NextUp. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
}
