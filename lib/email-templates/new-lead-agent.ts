interface Props {
  leadName: string
  leadEmail: string | null
  leadPhone: string | null
  leadType: string
  leadOrigin: string
  propertyInterest: string | null
  budgetUsd: string | null
  notes: string | null
  adminUrl: string
}

export function newLeadAgentEmail(p: Props): string {
  const originLabel: Record<string, string> = {
    WEBSITE: 'Website',
    REFERRAL: 'Referral',
    ZILLOW: 'Zillow',
    REALTOR_COM: 'Realtor.com',
    INSTAGRAM: 'Instagram',
    OTHER: 'Other',
  }

  const typeLabel: Record<string, string> = {
    BUYER: 'Buyer',
    SELLER: 'Seller',
    INVESTOR: 'Investor',
  }

  const row = (label: string, value: string | null) =>
    value
      ? `<tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;width:140px;vertical-align:top;">${label}</td>
          <td style="padding:8px 0;color:#07162b;font-size:13px;font-weight:600;">${value}</td>
        </tr>`
      : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Lead — 4Rivers Realty</title>
</head>
<body style="margin:0;padding:0;background:#f0f7fc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7fc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#174079;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
                4Rivers Realty
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:#00aeef;letter-spacing:1px;text-transform:uppercase;">
                New Lead Notification
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px 40px;">
              <p style="margin:0 0 4px;font-size:20px;font-weight:700;color:#174079;">
                ${p.leadName}
              </p>
              <p style="margin:0 0 28px;font-size:13px;color:#6b7280;">
                ${originLabel[p.leadOrigin] ?? p.leadOrigin} · ${typeLabel[p.leadType] ?? p.leadType}
              </p>

              <table cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #e5e7eb;">
                <tbody>
                  ${row('Email', p.leadEmail)}
                  ${row('Phone', p.leadPhone)}
                  ${row('Property Interest', p.propertyInterest)}
                  ${row('Budget', p.budgetUsd ? `$${Number(p.budgetUsd).toLocaleString('en-US')}` : null)}
                  ${row('Notes', p.notes)}
                </tbody>
              </table>

              <div style="margin-top:32px;text-align:center;">
                <a href="${p.adminUrl}"
                   style="display:inline-block;background:#00aeef;color:#ffffff;font-size:14px;font-weight:700;
                          text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">
                  View Lead in CRM →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;
                       border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                4Rivers Realty · Ocala &amp; Sumter County, FL<br/>
                This is an automated notification. Do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
