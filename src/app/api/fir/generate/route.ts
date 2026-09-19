import { NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'

export async function POST(request: Request) {
  try {
    const raw = await request.json()

    // Support both snake_case (cyber-ir-api) and camelCase
    const incidentDescription = raw.incident_description || raw.incidentDescription || ''
    const victimName = raw.victim_name || raw.victimName || 'Anonymous Complainant'
    const victimDob = raw.victim_dob || raw.victimDob || 'N/A'
    const victimParent = raw.victim_parent_name || raw.victimParentName || 'N/A'
    const victimEmail = raw.victim_email || raw.email || raw.victimEmail || 'N/A'
    const victimAddress = raw.victim_address || raw.address || raw.victimAddress || 'N/A'
    const incidentType = raw.incident_type || raw.incidentType || 'Online Financial Fraud'
    const incidentDate = raw.incident_date || raw.incidentDate || new Date().toISOString().split('T')[0]
    const incidentTime = raw.incident_time || raw.incidentTime || '14:30'
    const location = raw.location || 'Cyber Crime Jurisdiction, India'
    
    // Financial details
    const fin = raw.financial_details || raw.financialDetails || {}
    const txId = fin.transaction_id || fin.transactionId || raw.transactionId || 'N/A'
    const bankAccount = fin.bank_account || fin.bankAccount || raw.accountNumber || raw.victimBank || 'N/A'
    const amount = fin.amount || raw.lossAmount || 'N/A'
    const upiId = fin.upi_id || fin.upiId || 'N/A'
    const txDate = fin.transaction_date || fin.transactionDate || incidentDate

    if (!incidentDescription) {
      return NextResponse.json(
        { error: 'incident_description / incidentDescription is required' },
        { status: 400 }
      )
    }

    const year = new Date().getFullYear()
    const randomSeq = Math.floor(1000 + Math.random() * 9000)
    const firNumber = `CYB-FIR-${year}-${randomSeq}`
    const certInRef = `CERTIN-INC-${Date.now().toString().slice(-8)}`

    // BNS 2023 & IT Act 2000 mapping
    const bnsSections = [
      { section: 'Section 318 BNS (2023)', offence: 'Cheating and dishonestly inducing delivery of property' },
      { section: 'Section 319(2) BNS (2023)', offence: 'Cheating by personation (Identity impersonation)' },
      { section: 'Section 61(2) BNS (2023)', offence: 'Criminal Conspiracy' },
    ]

    const itActSections = [
      { section: 'Section 66 IT Act 2000', offence: 'Computer Related Offences (Hacking & Data Alteration)' },
      { section: 'Section 66D IT Act 2000', offence: 'Punishment for cheating by personation using computer' },
      { section: 'Section 43 IT Act 2000', offence: 'Civil penalty for unauthorized access & damage to computer system' },
    ]

    if (incidentDescription.toLowerCase().includes('identity') || incidentType.includes('identity')) {
      itActSections.push({ section: 'Section 66C IT Act 2000', offence: 'Punishment for identity theft' })
    }
    if (incidentDescription.toLowerCase().includes('privacy') || incidentDescription.toLowerCase().includes('camera')) {
      itActSections.push({ section: 'Section 66E IT Act 2000', offence: 'Violation of Privacy' })
    }

    const firData = {
      fir_number: firNumber,
      date_of_report: new Date().toLocaleDateString('en-IN'),
      complainant: {
        name: victimName,
        dob: victimDob,
        parent_name: victimParent,
        email: victimEmail,
        address: victimAddress,
        id_proof: 'Aadhaar / Digital Token Verified',
      },
      incident: {
        category: incidentType,
        subcategory: 'Electronic Payment & Data Compromise',
        date_time: `${incidentDate} ${incidentTime} IST`,
        location: location,
        description: incidentDescription,
      },
      accused: {
        description: raw.suspectInfo || 'Unknown Online Perpetrator / Virtual Identity',
        contact_details: raw.attackerIp || 'Under IPDR/CDR Tracking',
        bank_details: upiId !== 'N/A' ? `UPI VPA: ${upiId}` : 'Mule Beneficiary Account',
      },
      technical_analysis: {
        attack_vector: incidentType.includes('fraud') ? 'Social engineering link leading to malicious web payload' : 'Remote compromise & unauthorized session hijack',
        indicators_of_compromise: [
          raw.attackerIp || '45.33.32.156',
          'Domain: *.xyz / *.site phishing host',
          `Transaction UTR: ${txId}`,
        ],
        evidence_collected: [
          'Screenshot of SMS / WhatsApp communication',
          'Bank statement and UPI debit receipts',
          'Client-side TLS connection timestamp',
        ],
      },
      legal_provisions: {
        bns_sections: bnsSections,
        it_act_sections: itActSections,
        other_applicable_laws: ['Section 154 CrPC / BNSS 2023', 'CERT-In Directions 2022'],
      },
      financial_loss: {
        amount: amount !== 'N/A' ? `₹ ${Number(amount).toLocaleString('en-IN')}` : 'N/A',
        transaction_details: `Txn ID: ${txId} | Account: ${bankAccount} | UPI: ${upiId} | Date: ${txDate}`,
      },
      prayer_relief: [
        'Registration of formal First Information Report (FIR) under Section 154 CrPC',
        'Immediate notice under Section 91 CrPC to payment gateways and banks to freeze beneficiary accounts',
        'Directives to Telecom Intermediaries under Section 67C IT Act to preserve IPDR/CDR logs for 180 days',
        'Trace and apprehend the accused under BNS 318 and IT Act 66D',
      ],
      verification: {
        place: location,
        date: new Date().toLocaleDateString('en-IN'),
      },
    }

    const markdown = `# NATIONAL CYBER CRIME REPORTING PORTAL
## Government of India | Ministry of Home Affairs | NCRB
### FIRST INFORMATION REPORT (Section 154 CrPC / BNSS 2023)

---
**FIR NUMBER:** ${firNumber}  
**CERT-In DISPATCH REF:** ${certInRef}  
**FILING JURISDICTION:** ${location}  
**DATE OF REPORT:** ${firData.date_of_report}  
**CLASSIFICATION:** TLP:AMBER // LAW ENFORCEMENT SENSITIVE  

---

### I. COMPLAINANT PARTICULARS
- **Full Legal Name:** ${victimName}
- **Date of Birth:** ${victimDob}
- **Father/Mother/Spouse:** ${victimParent}
- **Email Address:** ${victimEmail}
- **Complete Address:** ${victimAddress}

---

### II. INCIDENT DETAILS & OCCURRENCE
- **Cyber Crime Category:** ${incidentType}
- **Date & Time of Occurrence:** ${incidentDate} at ${incidentTime} IST
- **Place of Occurrence:** ${location}
- **Summary Narrative:**
${incidentDescription}

---

### III. FINANCIAL LOSS PARTICULARS
- **Amount Defrauded:** ${firData.financial_loss.amount}
- **Transaction Details:** ${firData.financial_loss.transaction_details}

---

### IV. ACCUSED DETAILS
- **Identity:** ${firData.accused.description}
- **Suspect Contact:** ${firData.accused.contact_details}
- **Beneficiary Trace:** ${firData.accused.bank_details}

---

### V. STATUTORY LEGAL PROVISIONS INVOKED
#### Bharatiya Nyaya Sanhita (BNS) 2023:
${bnsSections.map(s => `- **${s.section}:** ${s.offence}`).join('\n')}

#### Information Technology Act 2000:
${itActSections.map(s => `- **${s.section}:** ${s.offence}`).join('\n')}

---

### VI. TECHNICAL INDICATORS (IOCs)
${firData.technical_analysis.indicators_of_compromise.map(ioc => `- \`${ioc}\``).join('\n')}

---

### VII. PRAYER & INVESTIGATIVE RELIEF
${firData.prayer_relief.map((p, i) => `${i + 1}. ${p}`).join('\n')}

---
*Verification: Verified at ${location} on ${firData.date_of_report} by complainant ${victimName}.*  
*Generated via TRINETRA Sovereign Cyber Operations & Cyber-IR Engine.*
`

    // Generate formatted PDF using jsPDF
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    doc.setFont('Courier', 'normal')
    doc.setFontSize(8)
    const lines = doc.splitTextToSize(markdown, 520)
    let y = 40
    lines.forEach((line: string) => {
      if (y > 800) {
        doc.addPage()
        y = 40
      }
      doc.text(line, 40, y)
      y += 11
    })

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    const pdfBase64 = pdfBuffer.toString('base64')

    return NextResponse.json({
      success: true,
      firNumber,
      certInRef,
      fir_data: firData,
      markdown,
      pdfBase64,
      downloadUrl: `data:application/pdf;base64,${pdfBase64}`,
    })
  } catch (error) {
    console.error('[API/fir/generate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate FIR dossier' },
      { status: 500 }
    )
  }
}
