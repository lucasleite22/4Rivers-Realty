interface Props {
  leadName: string
  propertyInterest: string | null
  agentPhone: string
  agentEmail: string
}

export function leadConfirmationEmail(p: Props): string {
  const firstName = p.leadName.split(' ')[0]

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You — 4Rivers Realty</title>
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
                Where Land Meets Lifestyle
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;">
              <p style="margin:0 0 16px;font-size:24px;font-weight:700;color:#174079;">
                Thank you, ${firstName}!
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
                We've received your message and one of our agents will reach out to you shortly.
                ${p.propertyInterest ? `We noted your interest in <strong>${p.propertyInterest}</strong> and will make sure to share the best available options in Ocala &amp; Sumter County.` : 'We look forward to helping you find your perfect property in Ocala &amp; Sumter County.'}
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#374151;line-height:1.6;">
                In the meantime, feel free to browse our current listings or reach out to us directly:
              </p>

              <!-- Contact cards -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background:#f0f7fc;border-radius:8px;padding:16px 20px;width:48%;">
                    <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;">Phone</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#174079;">${p.agentPhone}</p>
                  </td>
                  <td style="width:4%;"></td>
                  <td style="background:#f0f7fc;border-radius:8px;padding:16px 20px;width:48%;">
                    <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;">Email</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#174079;">${p.agentEmail}</p>
                  </td>
                </tr>
              </table>

              <div style="margin-top:32px;text-align:center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://4riversrealty.com'}/properties"
                   style="display:inline-block;background:#00aeef;color:#ffffff;font-size:14px;font-weight:700;
                          text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">
                  Browse Properties →
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
                You received this email because you contacted us through our website.
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
