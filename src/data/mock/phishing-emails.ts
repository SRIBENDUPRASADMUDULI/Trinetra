// =============================================================================
// CyberShield Bharat -- Phishing Email Fixtures
// Indian-context phishing samples for PhishGuard analysis module
// =============================================================================

export type SpfResult = 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NEUTRAL' | 'NONE'
export type DkimResult = 'PASS' | 'FAIL' | 'NONE'

export interface EmailIndicator {
  type: 'URL' | 'IP' | 'DOMAIN' | 'ATTACHMENT' | 'EMAIL' | 'PATTERN'
  value: string
  description: string
}

export interface PhishingEmail {
  id: string
  subject: string
  from: string
  replyTo: string
  spfResult: SpfResult
  dkimResult: DkimResult
  receivedHeaders: string[]
  body: string
  indicators: EmailIndicator[]
  isMalicious: true
  category: string
  targetOrg: string
}

export const PHISHING_EMAILS: PhishingEmail[] = [
  {
    id: 'PHISH-001',
    subject: 'URGENT: Your SBI Account KYC Verification Expires in 24 Hours - Action Required',
    from: 'alerts@sbi-kyc-verification.com',
    replyTo: 'noreply-kyc@sbi-secure-portal.tk',
    spfResult: 'FAIL',
    dkimResult: 'FAIL',
    receivedHeaders: [
      'from mail.sbi-kyc-verification.com (185.220.101.134) by inbound.victim.com with SMTP id x7si2341423pfd.123',
      'from [10.8.0.15] (unknown [185.220.101.134]) by mail.sbi-kyc-verification.com (Postfix) with ESMTP id A3F22',
      'Authentication-Results: spf=fail (domain of sbi.co.in does not designate 185.220.101.134 as permitted sender)',
      'X-Spam-Score: 7.4',
      'X-Originating-IP: 185.220.101.134',
    ],
    body: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px">
<div style="max-width:600px;margin:0 auto;background:#fff;border:2px solid #1a4980;padding:30px">
  <div style="text-align:center;margin-bottom:20px">
    <img src="https://185.220.101.134/assets/sbi-logo-fake.png" alt="SBI" width="120">
    <h2 style="color:#1a4980">State Bank of India</h2>
    <p style="color:red;font-weight:bold;font-size:16px">⚠️ IMMEDIATE ACTION REQUIRED ⚠️</p>
  </div>
  <p>Dear Valued Customer,</p>
  <p>Our records indicate that your <strong>KYC (Know Your Customer)</strong> verification has <strong style="color:red">NOT been updated</strong> and will expire within <strong style="color:red">24 HOURS</strong>.</p>
  <p>As per RBI Circular RBI/2024-25/87, failure to update KYC will result in:</p>
  <ul>
    <li>Immediate suspension of all banking services</li>
    <li>Freeze of debit card and UPI transactions</li>
    <li>Block on ATM cash withdrawals</li>
  </ul>
  <div style="text-align:center;margin:30px 0">
    <a href="http://sbi-kyc-update-portal.tk/verify?token=USR_78234_KYC_2024&redirect=collect"
       style="background:#1a4980;color:#fff;padding:15px 40px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block">
      UPDATE KYC NOW
    </a>
  </div>
  <p><strong>Information Required:</strong></p>
  <ol>
    <li>Account Number and CIF Number</li>
    <li>Registered Mobile Number and OTP</li>
    <li>Aadhaar Card Number</li>
    <li>PAN Card Number</li>
    <li>Internet Banking Password</li>
  </ol>
  <p style="color:#666;font-size:12px">This is an automated message. Do not reply to this email. If you have already updated your KYC, please ignore this message.</p>
  <p style="color:#666;font-size:12px">State Bank of India | Corporate Centre, Madame Cama Road, Nariman Point, Mumbai - 400 021</p>
</div>
<!-- tracking pixel: http://185.220.101.134/open.php?id=USR_78234 -->
<img src="http://185.220.101.134/track/open.gif?uid=78234" width="1" height="1" border="0">
</body>
</html>`,
    indicators: [
      { type: 'DOMAIN', value: 'sbi-kyc-verification.com', description: 'Spoofed SBI domain registered 3 days ago via Namecheap' },
      { type: 'DOMAIN', value: 'sbi-kyc-update-portal.tk', description: 'Free Freenom TLD phishing landing page collecting credentials' },
      { type: 'IP', value: '185.220.101.134', description: 'Tor exit node used as mail server — not SBI infrastructure' },
      { type: 'URL', value: 'http://sbi-kyc-update-portal.tk/verify?token=USR_78234_KYC_2024&redirect=collect', description: 'Phishing landing page with credential harvest form' },
      { type: 'URL', value: 'http://185.220.101.134/track/open.gif?uid=78234', description: 'Email open tracking pixel confirming active email addresses' },
      { type: 'PATTERN', value: 'Requests Aadhaar + PAN + Internet Banking Password in one form', description: 'SBI never requests password via email — classic phishing pattern' },
    ],
    isMalicious: true,
    category: 'Bank KYC Fraud',
    targetOrg: 'State Bank of India',
  },
  {
    id: 'PHISH-002',
    subject: 'Income Tax Refund of Rs.18,742 Approved - Verify Bank Account to Receive',
    from: 'refund@incometax-india-gov.net',
    replyTo: 'tax-refund@it-dept-india.xyz',
    spfResult: 'SOFTFAIL',
    dkimResult: 'FAIL',
    receivedHeaders: [
      'from smtp.incometax-india-gov.net (103.75.190.55) by mx.victim.com with ESMTPS',
      'Received-SPF: softfail (google.com: 103.75.190.55 is not permitted sender for incometax.gov.in)',
      'Authentication-Results: dkim=fail header.d=incometax-india-gov.net',
      'X-Google-DKIM-Signature: v=1; a=rsa-sha256; d=incometax-india-gov.net',
      'X-Mailer: PHPMailer 6.0.0 (https://github.com/PHPMailer/PHPMailer)',
    ],
    body: `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#fff8dc;padding:20px">
<div style="max-width:600px;margin:0 auto;background:#fff;border:3px solid #003366;padding:25px">
  <div style="background:#003366;color:#fff;padding:15px;text-align:center">
    <h2>INCOME TAX DEPARTMENT</h2>
    <p>Government of India - Ministry of Finance</p>
  </div>
  <div style="padding:20px">
    <p>Dear Taxpayer,</p>
    <p>We are pleased to inform you that based on your ITR filed for Assessment Year <strong>2024-25</strong>, a tax refund of <strong style="color:#003366;font-size:20px">₹18,742/-</strong> has been approved by the Centralized Processing Centre (CPC), Bengaluru.</p>
    <div style="background:#e8f4e8;border:1px solid #4caf50;padding:15px;margin:15px 0">
      <p><strong>Refund Details:</strong></p>
      <table>
        <tr><td>PAN Number:</td><td>XXXXX1234X (masked)</td></tr>
        <tr><td>AY:</td><td>2024-25</td></tr>
        <tr><td>Refund Amount:</td><td><strong>₹18,742</strong></td></tr>
        <tr><td>Status:</td><td><span style="color:green">APPROVED</span></td></tr>
      </table>
    </div>
    <p>To receive your refund, you must verify and update your bank account details within <strong style="color:red">48 hours</strong>, failing which the refund will be reversed to government treasury as per Section 143(1) IT Act.</p>
    <div style="text-align:center;margin:20px 0">
      <a href="https://it-refund-verify.xyz/claim?pan=XXXXX1234X&amount=18742&token=eyJhbGciOiJub25lIn0.eyJ1c2VyIjoiYWRtaW4ifQ."
         style="background:#003366;color:#fff;padding:12px 35px;text-decoration:none;font-weight:bold">
        CLAIM REFUND NOW
      </a>
    </div>
    <p style="font-size:11px;color:#999">Helpline: 1800-103-0025 (Fake) | www.incometax-india-gov.net</p>
  </div>
</div>
</body>
</html>`,
    indicators: [
      { type: 'DOMAIN', value: 'incometax-india-gov.net', description: 'Typosquat of incometax.gov.in — .net TLD impersonating government site' },
      { type: 'DOMAIN', value: 'it-refund-verify.xyz', description: 'High-risk .xyz TLD hosting credential harvest page' },
      { type: 'URL', value: 'https://it-refund-verify.xyz/claim?pan=XXXXX1234X&amount=18742&token=eyJhbGciOiJub25lIn0.eyJ1c2VyIjoiYWRtaW4ifQ.', description: 'JWT with "alg:none" in URL — attacker-controlled, requests bank account details' },
      { type: 'IP', value: '103.75.190.55', description: 'Chinese IP block — not Indian government infrastructure' },
      { type: 'EMAIL', value: 'tax-refund@it-dept-india.xyz', description: 'Reply-To diverges from From domain — classic phishing indicator' },
      { type: 'PATTERN', value: '48-hour urgency + Section 143(1) IT Act legal threat', description: 'Social engineering using legal fear to bypass rational decision-making' },
    ],
    isMalicious: true,
    category: 'Tax Refund Fraud',
    targetOrg: 'Income Tax Department',
  },
  {
    id: 'PHISH-003',
    subject: 'IRCTC Booking Confirmed - Ticket PNR 4812759623 (Rajdhani Express 12951) - VERIFY NOW',
    from: 'booking@irctc-railway-india.com',
    replyTo: 'support@irctc-help-desk.online',
    spfResult: 'FAIL',
    dkimResult: 'NONE',
    receivedHeaders: [
      'from mail.irctc-railway-india.com (91.108.56.178) by mail.victim.com with SMTP',
      'Authentication-Results: mx.google.com; spf=fail smtp.mailfrom=irctc-railway-india.com',
      'X-Spam-Status: Yes, score=8.7',
      'X-Mailer: Sendgrid v3 API (via compromised account)',
      'Message-ID: <20240914182233.47A2B.91.108.56.178@irctc-railway-india.com>',
    ],
    body: `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f0f0f0;padding:15px">
<div style="max-width:620px;margin:0 auto;background:#fff">
  <div style="background:#00478f;color:#fff;padding:20px;text-align:center">
    <h2>IRCTC | Indian Railway Catering and Tourism Corporation</h2>
  </div>
  <div style="padding:25px">
    <div style="background:#fffde7;border:1px solid #ffc107;padding:15px;margin-bottom:20px">
      <strong style="color:red">⚠️ ACTION REQUIRED: Your ticket is UNCONFIRMED. Payment pending verification.</strong>
    </div>
    <h3>Booking Details</h3>
    <table style="width:100%;border-collapse:collapse">
      <tr style="background:#f5f5f5"><td style="padding:8px">PNR Number</td><td><strong>4812759623</strong></td></tr>
      <tr><td style="padding:8px">Train</td><td>12951 - Mumbai Rajdhani Express</td></tr>
      <tr style="background:#f5f5f5"><td style="padding:8px">Date of Journey</td><td>25-Sep-2024</td></tr>
      <tr><td style="padding:8px">From → To</td><td>Mumbai CSMT → New Delhi</td></tr>
      <tr style="background:#f5f5f5"><td style="padding:8px">Class</td><td>3A (Three Tier AC)</td></tr>
      <tr><td style="padding:8px">Passengers</td><td>2 Adults</td></tr>
      <tr style="background:#f5f5f5"><td style="padding:8px">Fare Paid</td><td>₹3,180 (UNVERIFIED)</td></tr>
    </table>
    <p>Your payment of ₹3,180 could not be verified. To confirm your ticket and avoid cancellation, please re-verify your payment by entering your debit/credit card details.</p>
    <div style="text-align:center;margin:20px">
      <a href="https://irctc-payment-verify.store/repay?pnr=4812759623&amount=3180&session=abc123def456"
         style="background:#e53935;color:#fff;padding:14px 40px;text-decoration:none;font-size:16px;font-weight:bold">
        VERIFY PAYMENT & CONFIRM TICKET
      </a>
    </div>
    <p style="color:#666;font-size:12px">Failure to verify within 2 hours will result in automatic cancellation of PNR 4812759623 without refund.</p>
  </div>
</div>
</body>
</html>`,
    indicators: [
      { type: 'DOMAIN', value: 'irctc-railway-india.com', description: 'Fake IRCTC domain — real is irctc.co.in' },
      { type: 'DOMAIN', value: 'irctc-payment-verify.store', description: 'High-risk .store TLD — card skimming page collecting full card details + CVV' },
      { type: 'URL', value: 'https://irctc-payment-verify.store/repay?pnr=4812759623&amount=3180&session=abc123def456', description: 'Payment re-verification scam — captures card details for immediate fraud' },
      { type: 'IP', value: '91.108.56.178', description: 'Russian Federation IP — Telegram API IP range misused as mail relay' },
      { type: 'PATTERN', value: '"UNCONFIRMED ticket" + 2-hour cancellation threat', description: 'Classic urgency scam exploiting travel anxiety' },
      { type: 'PATTERN', value: 'Fake PNR number in subject line', description: 'Targets users expecting legitimate booking confirmation' },
    ],
    isMalicious: true,
    category: 'E-Commerce / Travel Fraud',
    targetOrg: 'IRCTC',
  },
  {
    id: 'PHISH-004',
    subject: 'UIDAI Notice: Your Aadhaar Card Has Been Temporarily Locked - Verify Immediately',
    from: 'aadhaar-alerts@uidai-india-official.co',
    replyTo: 'verify@aadhaar-secure-unlock.top',
    spfResult: 'FAIL',
    dkimResult: 'FAIL',
    receivedHeaders: [
      'from smtp-out.uidai-india-official.co (45.142.212.200) by inbound.victim.com',
      'Authentication-Results: spf=fail (45.142.212.200 is not in uidai.gov.in SPF record)',
      'X-Originating-IP: 45.142.212.200',
      'Received-SPF: fail (google.com: domain of uidai-india-official.co does not designate 45.142.212.200)',
      'X-PHP-Originating-Script: 0:mailer.php',
    ],
    body: `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f8f8f8">
<div style="max-width:600px;margin:20px auto;background:#fff;border:1px solid #ddd;overflow:hidden">
  <div style="background:#003366;padding:20px;display:flex;align-items:center;gap:10px">
    <img src="https://45.142.212.200/img/aadhaar-logo-fake.png" width="50" alt="UIDAI">
    <div style="color:#fff">
      <div style="font-size:18px;font-weight:bold">UIDAI</div>
      <div style="font-size:12px">Unique Identification Authority of India</div>
    </div>
  </div>
  <div style="padding:25px">
    <div style="background:#ffebee;border-left:4px solid #c62828;padding:15px;margin-bottom:20px">
      <strong style="color:#c62828">🔒 SECURITY ALERT: Aadhaar Temporarily Locked</strong>
    </div>
    <p>Dear Resident,</p>
    <p>Your Aadhaar card <strong>(XXXX XXXX 7823)</strong> has been <strong style="color:red">temporarily suspended</strong> due to:</p>
    <ul>
      <li>Multiple failed biometric authentication attempts</li>
      <li>Suspicious login from unknown device in Hyderabad</li>
      <li>Violation of Aadhaar Act 2016 Section 28(5)</li>
    </ul>
    <p>To unlock your Aadhaar and restore services (banking, SIM verification, DigiLocker), you must complete identity verification within <strong style="color:red">12 hours</strong>.</p>
    <div style="background:#fff9c4;border:1px solid #fbc02d;padding:15px;margin:15px 0">
      <strong>Required for verification:</strong>
      <ul style="margin:5px 0">
        <li>Full 12-digit Aadhaar number</li>
        <li>Registered mobile OTP</li>
        <li>Date of birth and full name as on Aadhaar</li>
      </ul>
    </div>
    <div style="text-align:center;margin:25px 0">
      <a href="https://aadhaar-secure-unlock.top/verify?aid=XXXX_7823&lock_reason=auth_fail&ts=1726327200"
         style="background:#003366;color:#fff;padding:14px 35px;text-decoration:none;font-size:15px;font-weight:bold">
        UNLOCK AADHAAR NOW
      </a>
    </div>
    <p style="font-size:11px;color:#888">Unique Identification Authority of India | 3rd Floor, Tower II, Jeevan Bharati Building, Connaught Circus, New Delhi - 110001</p>
    <p style="font-size:11px;color:#888">Help: 1947 (Fake Helpline)</p>
  </div>
</div>
</body>
</html>`,
    indicators: [
      { type: 'DOMAIN', value: 'uidai-india-official.co', description: 'Lookalike domain — real UIDAI site is uidai.gov.in (.gov.in TLD cannot be used by private entities)' },
      { type: 'DOMAIN', value: 'aadhaar-secure-unlock.top', description: 'High-risk .top TLD phishing page designed to harvest 12-digit Aadhaar numbers' },
      { type: 'URL', value: 'https://aadhaar-secure-unlock.top/verify?aid=XXXX_7823&lock_reason=auth_fail&ts=1726327200', description: 'Aadhaar number harvest page — data sold to identity fraud syndicates' },
      { type: 'IP', value: '45.142.212.200', description: 'German bulletproof hosting IP — known phishing infrastructure' },
      { type: 'EMAIL', value: 'verify@aadhaar-secure-unlock.top', description: 'Reply-To on criminal domain diverges from From header' },
      { type: 'PATTERN', value: 'Citation of "Aadhaar Act 2016 Section 28(5)"', description: 'Fabricated legal reference to create fear of criminal liability' },
      { type: 'PATTERN', value: 'Claims Aadhaar can be "locked" via phishing page', description: 'UIDAI never locks Aadhaar via email — only via official UIDAI portal or 1947 helpline' },
    ],
    isMalicious: true,
    category: 'Identity Document Fraud',
    targetOrg: 'UIDAI / Aadhaar',
  },
  {
    id: 'PHISH-005',
    subject: 'UPI Alert: Pending Debit of Rs.12,500 Detected - Approve or Block Transaction',
    from: 'upi-alerts@npci-upi-security.net',
    replyTo: 'support@upi-fraud-protection.online',
    spfResult: 'NONE',
    dkimResult: 'FAIL',
    receivedHeaders: [
      'from mx1.npci-upi-security.net (194.165.16.11) by inbound.victim.com with ESMTP',
      'Authentication-Results: spf=none smtp.mailfrom=npci-upi-security.net',
      'X-Spam-Flag: YES',
      'X-AntiAbuse: This header was added to track abuse, please include it with any abuse report',
      'X-Source: PHPMailer 5.2.22 (unpatched, CVE-2016-10045)',
    ],
    body: `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;margin:0;padding:0;background:#f5f5f5">
<div style="max-width:600px;margin:20px auto;background:#fff;border-radius:4px;overflow:hidden">
  <div style="background:#0d47a1;padding:18px;text-align:center">
    <h2 style="color:#fff;margin:0">NPCI | UPI Security Alert</h2>
    <p style="color:#90caf9;margin:5px 0 0">National Payments Corporation of India</p>
  </div>
  <div style="padding:25px">
    <div style="background:#fff3e0;border:2px solid #ff6f00;padding:15px;text-align:center;margin-bottom:20px">
      <p style="font-size:20px;font-weight:bold;color:#e65100;margin:0">⚠️ TRANSACTION PENDING APPROVAL</p>
      <p style="font-size:28px;font-weight:bold;color:#bf360c;margin:10px 0">₹12,500.00</p>
      <p style="color:#666;margin:0">To: MERCHANT_UNKNOWN (UPI ID: pay@rbl)</p>
    </div>
    <table style="width:100%;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold">Transaction ID</td><td>UPI2024091412500X78234</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Date/Time</td><td>14-Sep-2024, 18:42 IST</td></tr>
      <tr><td style="padding:8px;background:#f9f9f9;font-weight:bold">Your UPI ID</td><td>user@ybl (masked)</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Status</td><td style="color:orange;font-weight:bold">PENDING — AWAITING APPROVAL</td></tr>
    </table>
    <p style="margin:20px 0">If you <strong>recognize this transaction</strong>, click APPROVE. If you <strong>do NOT recognize</strong> this transaction, click BLOCK to secure your account immediately.</p>
    <div style="display:flex;gap:15px;justify-content:center;margin:25px 0;flex-wrap:wrap">
      <a href="https://upi-fraud-protection.online/approve?txn=UPI2024091412500X78234&action=approve"
         style="background:#2e7d32;color:#fff;padding:14px 30px;text-decoration:none;font-weight:bold;font-size:15px">
        ✓ APPROVE PAYMENT
      </a>
      <a href="https://upi-fraud-protection.online/approve?txn=UPI2024091412500X78234&action=block"
         style="background:#c62828;color:#fff;padding:14px 30px;text-decoration:none;font-weight:bold;font-size:15px">
        ✗ BLOCK & REPORT
      </a>
    </div>
    <!-- CRITICAL: Both buttons go to same phishing endpoint; "action" param ignored -->
    <!-- Real purpose: harvest UPI PIN when user tries to "block" the transaction -->
    <p style="font-size:12px;color:#888;text-align:center">You will be asked to enter your UPI PIN to confirm the block action.</p>
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
    <p style="font-size:11px;color:#aaa">NPCI, 1001A, B Wing, 10th Floor, The Capital, Bandra Kurla Complex, Mumbai - 400051 | npci.org.in</p>
  </div>
</div>
</body>
</html>`,
    indicators: [
      { type: 'DOMAIN', value: 'npci-upi-security.net', description: 'Lookalike NPCI domain — real is npci.org.in; .net impersonation' },
      { type: 'DOMAIN', value: 'upi-fraud-protection.online', description: 'High-risk .online TLD hosting UPI PIN harvest page' },
      { type: 'URL', value: 'https://upi-fraud-protection.online/approve?txn=UPI2024091412500X78234&action=approve', description: 'Both "Approve" and "Block" buttons point to same domain — UPI PIN harvesting endpoint' },
      { type: 'URL', value: 'https://upi-fraud-protection.online/approve?txn=UPI2024091412500X78234&action=block', description: '"Block" pretends to need UPI PIN confirmation — harvests PIN to authorize real fraudulent transfer' },
      { type: 'IP', value: '194.165.16.11', description: 'Russian hosting provider associated with BEC campaigns' },
      { type: 'PATTERN', value: 'Both Approve and Block buttons lead to same phishing domain', description: 'Dual-path social engineering — victim loses UPI PIN regardless of choice made' },
      { type: 'PATTERN', value: 'X-Source header reveals unpatched PHPMailer (CVE-2016-10045)', description: 'Attacker infrastructure itself runs vulnerable software' },
    ],
    isMalicious: true,
    category: 'UPI / Payment Fraud',
    targetOrg: 'NPCI / UPI Ecosystem',
  },
]
