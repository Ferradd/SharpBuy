// ============================================================================
// SHARPBUY EMAIL DIAGNOSTIC ENDPOINT
// ============================================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const resendKey = process.env.RESEND_API_KEY;
    
    if (!resendKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'RESEND_API_KEY not configured',
        configured: false
      });
    }

    const { email, test = 'basic' } = req.query;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid email required',
        example: '/api/test-email?email=test@example.com'
      });
    }

    console.log(`[TestEmail] Starting diagnostic test for: ${email}`);
    console.log(`[TestEmail] RESEND_API_KEY configured: ${!!resendKey}`);
    console.log(`[TestEmail] RESEND_API_KEY length: ${resendKey.length}`);
    console.log(`[TestEmail] Test type: ${test}`);

    const startTime = Date.now();

    try {
      const testPayload = {
        from: 'SharpBuy Diagnostics <orders@sharpbuy.org>',
        to: [email],
        subject: `🧪 SharpBuy Email Diagnostic Test - ${new Date().toISOString()}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Email Test</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #08090b; color: #f3f1ec;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #101216; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 30px;">
              <h1 style="color: #e8583a;">✅ Email Test Successful</h1>
              <p>This is a diagnostic test email from SharpBuy.</p>
              <p><strong>Test Type:</strong> ${test}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p><strong>Environment:</strong> ${process.env.VERCEL_ENV || 'development'}</p>
              <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;">
              <p style="font-size: 12px; color: #64748b;">If you received this email, the Resend integration is working correctly.</p>
            </div>
          </body>
          </html>
        `
      };

      console.log(`[TestEmail] Sending request to Resend API...`);
      const apiStartTime = Date.now();

      const apiRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });

      const apiEndTime = Date.now();
      const apiDuration = apiEndTime - apiStartTime;

      console.log(`[TestEmail] Resend API response status: ${apiRes.status}`);
      console.log(`[TestEmail] Resend API duration: ${apiDuration}ms`);

      const data = await apiRes.json().catch(() => ({}));
      console.log(`[TestEmail] Resend API response:`, JSON.stringify(data, null, 2));

      if (!apiRes.ok) {
        return res.status(apiRes.status).json({
          success: false,
          error: 'Resend API error',
          status: apiRes.status,
          response: data,
          apiDuration,
          configured: true
        });
      }

      const totalDuration = Date.now() - startTime;

      return res.status(200).json({
        success: true,
        message: 'Test email sent successfully',
        email,
        resendId: data.id,
        timings: {
          api: apiDuration,
          total: totalDuration
        },
        configured: true,
        timestamp: new Date().toISOString()
      });

    } catch (fetchError) {
      console.error(`[TestEmail] Fetch error:`, fetchError);
      return res.status(500).json({
        success: false,
        error: 'Network error connecting to Resend',
        details: fetchError.message,
        configured: true
      });
    }

  } catch (error) {
    console.error('[TestEmail] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unexpected error',
      details: error.message
    });
  }
}