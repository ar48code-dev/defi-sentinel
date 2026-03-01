import sgMail from "@sendgrid/mail";
import { SECRETS } from "../../config/secrets";

interface AlertData {
    userAddress: string;
    healthFactor: string;
    collateralUSD: string;
    debtUSD: string;
    riskLevel: string;
    txHash?: string;
}

export class NotificationService {
    constructor() {
        if (SECRETS.SENDGRID_API_KEY) {
            sgMail.setApiKey(SECRETS.SENDGRID_API_KEY);
        }
    }

    private getRiskEmoji(level: string): string {
        const emojis: Record<string, string> = {
            safe: "🟢",
            warning: "🟡",
            danger: "🟠",
            critical: "🔴",
        };
        return emojis[level] || "⚪";
    }

    async sendLiquidationAlert(email: string, data: AlertData): Promise<void> {
        const emoji = this.getRiskEmoji(data.riskLevel);
        const subject = `${emoji} DeFi-Sentinel: Position at Risk — Health Factor ${data.healthFactor}`;

        // Email
        if (email && (process.env.SENDGRID_API_KEY || SECRETS.SENDGRID_API_KEY)) {
            try {
                await sgMail.send({
                    to: email,
                    from: process.env.SENDGRID_FROM_EMAIL || "alerts@defi-sentinel.app",
                    subject,
                    html: this.buildLiquidationEmailHTML(data),
                });
                console.log(`Alert email sent to ${email}`);
            } catch (err) {
                console.error("SendGrid email error:", err);
            }
        }
    }

    async sendProtectionExecuted(email: string, data: AlertData & { amount: string }): Promise<void> {
        const subject = `✅ DeFi-Sentinel: Auto-Protection Executed for Your Position`;

        if (email && (process.env.SENDGRID_API_KEY || SECRETS.SENDGRID_API_KEY)) {
            try {
                await sgMail.send({
                    to: email,
                    from: process.env.SENDGRID_FROM_EMAIL || "alerts@defi-sentinel.app",
                    subject,
                    html: this.buildProtectionEmailHTML(data),
                });
                console.log(`Protection email sent to ${email}`);
            } catch (err) {
                console.error("SendGrid error:", err);
            }
        }
    }


    async sendProtocolAlert(email: string, data: { protocol: string; threatLevel: number; description: string }): Promise<void> {
        if (!email || !process.env.SENDGRID_API_KEY) return;
        await sgMail.send({
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL || "alerts@defi-sentinel.app",
            subject: `🚨 DeFi-Sentinel: Protocol Alert — Threat Level ${data.threatLevel}`,
            html: `<h2>Protocol Alert</h2><p><strong>Protocol:</strong> ${data.protocol}</p><p><strong>Threat Level:</strong> ${data.threatLevel}/5</p><p>${data.description}</p>`,
        });
    }

    private buildLiquidationEmailHTML(data: AlertData): string {
        const riskColor: Record<string, string> = {
            safe: "#22c55e", warning: "#f59e0b", danger: "#f97316", critical: "#ef4444",
        };
        const color = riskColor[data.riskLevel] || "#6b7280";
        return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f1a; color: #e2e8f0; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(99,102,241,0.3);">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">⚡ DeFi-Sentinel Alert</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8);">Your position requires attention</p>
          </div>
          <div style="padding: 30px;">
            <div style="background: ${color}22; border: 1px solid ${color}; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; color: ${color}; font-size: 14px; font-weight: 600; text-transform: uppercase;">Health Factor</p>
              <p style="margin: 0; font-size: 48px; font-weight: 800; color: ${color};">${data.healthFactor}</p>
              <p style="margin: 8px 0 0; color: ${color}; font-size: 14px; text-transform: uppercase;">${data.riskLevel}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr><td style="padding: 12px; color: #94a3b8;">Collateral</td><td style="padding: 12px; text-align: right; font-weight: 600;">$${data.collateralUSD}</td></tr>
              <tr style="background: rgba(255,255,255,0.03);"><td style="padding: 12px; color: #94a3b8;">Debt</td><td style="padding: 12px; text-align: right; font-weight: 600;">$${data.debtUSD}</td></tr>
            </table>
            <a href="${process.env.FRONTEND_URL}/dashboard/user" style="display: block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-align: center; padding: 16px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">View Dashboard →</a>
          </div>
          <div style="padding: 20px 30px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; color: #64748b; font-size: 12px;">DeFi-Sentinel · Protecting your DeFi positions</div>
        </div>
      </body>
      </html>
    `;
    }

    private buildProtectionEmailHTML(data: AlertData & { amount: string }): string {
        return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f1a; color: #e2e8f0; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(34,197,94,0.3);">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px;">✅ Auto-Protection Executed!</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8);">Your position has been protected</p>
          </div>
          <div style="padding: 30px;">
            <p>DeFi-Sentinel automatically topped up <strong>$${data.amount}</strong> to your Aave position to prevent liquidation.</p>
            <p><strong>New Health Factor:</strong> ${data.healthFactor}</p>
            ${data.txHash ? `<a href="https://sepolia.etherscan.io/tx/${data.txHash}" style="color: #6366f1;">View Transaction on Etherscan →</a>` : ""}
          </div>
        </div>
      </body>
      </html>
    `;
    }
}

export const notificationService = new NotificationService();
