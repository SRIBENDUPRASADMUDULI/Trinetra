// =============================================================================
// CyberShield Bharat -- Breach Fixtures
// Mock breach database for demo mode when HIBP API is unavailable
// =============================================================================

export interface BreachEntry {
  source: string
  year: number
  recordsExposed: number
  dataTypes: string[]
  description: string
  verified: boolean
}

export const BREACH_FIXTURES: BreachEntry[] = [
  {
    source: 'RockYou2024',
    year: 2024,
    recordsExposed: 9948575739,
    dataTypes: ['Passwords', 'Email Addresses', 'Usernames'],
    description:
      'Compilation of nearly 10 billion unique plaintext passwords aggregated from thousands of data breaches spanning two decades. Published on a hacking forum in July 2024. The largest password collection ever leaked publicly. Supersedes RockYou2021 (8.4B passwords). Majority of passwords are in cleartext with no associated email, making credential stuffing more feasible than ever.',
    verified: true,
  },
  {
    source: 'LinkedIn',
    year: 2021,
    recordsExposed: 700000000,
    dataTypes: ['Email Addresses', 'Full Names', 'Phone Numbers', 'Geolocation', 'Job Titles', 'LinkedIn Profile URLs'],
    description:
      'Data scraped from 700 million LinkedIn profiles using LinkedIn\'s official API and automated profile access. While not a traditional database breach, the aggregated data set was offered for sale on a hacking forum. Includes professional details enabling highly targeted spearphishing attacks on corporate email addresses.',
    verified: true,
  },
  {
    source: 'Facebook',
    year: 2021,
    recordsExposed: 533000000,
    dataTypes: ['Phone Numbers', 'Full Names', 'Email Addresses', 'Birthdays', 'Locations', 'Relationship Status', 'Employer'],
    description:
      'Phone numbers and profile data of 533 million Facebook users from 106 countries scraped via a vulnerability in the "Add Friend" contact import feature. Data patched in 2019 but the scraped dataset was published freely in April 2021. India had ~6 million records in the leak. Data enables SIM-swap fraud targeting Indian mobile numbers.',
    verified: true,
  },
  {
    source: 'Aadhaar Data Breach (Alleged)',
    year: 2023,
    recordsExposed: 815000000,
    dataTypes: ['Aadhaar Numbers', 'Names', 'Phone Numbers', 'Addresses', 'Passport Numbers'],
    description:
      'A dataset claiming to contain 815 million Indian Aadhaar and passport records was listed for sale on BreachForums in October 2023. The seller "pwn0001" claimed data originated from the Indian Council of Medical Research (ICMR) COVID-19 testing database. UIDAI and ICMR denied any breach of Aadhaar infrastructure. The authenticity of the full dataset was not independently verified but sample records matched real individuals.',
    verified: false,
  },
  {
    source: 'MobiKwik',
    year: 2021,
    recordsExposed: 100000000,
    dataTypes: ['Email Addresses', 'Phone Numbers', 'Hashed Passwords', 'Partial Credit Card Numbers', 'IP Addresses', 'Aadhaar Numbers', 'Addresses'],
    description:
      'Indian digital payments platform MobiKwik reportedly suffered a breach of 100 million user records in January 2021. A threat actor posted 8.2 TB of data including KYC documents containing Aadhaar and PAN card images. MobiKwik denied any breach. The searchable leak was accessible on a dark web portal before being taken down. CERT-In initiated an inquiry.',
    verified: false,
  },
  {
    source: 'Adobe',
    year: 2013,
    recordsExposed: 152445165,
    dataTypes: ['Email Addresses', 'Password Hints', 'Encrypted Passwords', 'Usernames'],
    description:
      'Adobe\'s breach in October 2013 exposed 153 million user records including encrypted passwords and unencrypted password hints. The symmetric encryption used (3DES with a single key) made the passwords decryptable. The public release of password hints alongside encrypted passwords allowed researchers to crack millions of passwords through pattern analysis.',
    verified: true,
  },
  {
    source: 'Domino\'s India',
    year: 2021,
    recordsExposed: 18000000,
    dataTypes: ['Full Names', 'Phone Numbers', 'Email Addresses', 'Delivery Addresses', 'Payment Card Details (partial)', 'Order History'],
    description:
      'Jubilant FoodWorks, which operates Domino\'s Pizza in India, suffered a 13 TB data breach in April 2021. The threat actor "ShinyHunters" leaked 18 crore (180 million) order records and 10 crore customer records. A searchable dark web portal allowed anyone to look up phone numbers and retrieve associated addresses — posing a severe physical safety risk for domestic violence victims and public figures.',
    verified: true,
  },
  {
    source: 'Air India',
    year: 2021,
    recordsExposed: 4500000,
    dataTypes: ['Full Names', 'Dates of Birth', 'Contact Information', 'Passport Numbers', 'Ticket Information', 'Star Alliance Member Data', 'Credit Card Data (unencrypted CVVs)'],
    description:
      'Air India disclosed a breach of its SITA Passenger Service System (PSS) in May 2021 affecting 4.5 million passengers globally. The breach occurred via SITA, a third-party aviation IT provider, between August and October 2020. Notably, credit card data including CVV codes were allegedly stored unencrypted, violating PCI-DSS requirements. Star Alliance and OneWorld frequent flyer data also exposed.',
    verified: true,
  },
  {
    source: 'BigBasket',
    year: 2020,
    recordsExposed: 20000000,
    dataTypes: ['Email Addresses', 'Full Names', 'Hashed Passwords', 'Phone Numbers', 'Delivery Addresses', 'Dates of Birth'],
    description:
      'Indian online grocery platform BigBasket suffered a breach in October 2020. A dataset of 20 million user records was offered for sale on a dark web marketplace for $40,000. Data included SHA-1 hashed passwords (crackable) and extensive personal information. Tata Group subsequently acquired BigBasket in 2021 post-breach remediation.',
    verified: true,
  },
  {
    source: 'JusPay',
    year: 2020,
    recordsExposed: 100000000,
    dataTypes: ['Card Fingerprints', 'Masked Card Numbers', 'Email Addresses', 'Phone Numbers', 'Transaction Data', 'Merchant IDs'],
    description:
      'Juspay, a payment processing startup serving Amazon, Swiggy, Flipkart, and other Indian platforms, suffered a breach in August 2020. 100 million masked card fingerprints and 35 million records with PII were exposed. The card fingerprints do not contain actual card numbers but can be used for card fraud if linked with data from other breaches. Juspay confirmed the breach in January 2021 only after the data appeared on dark web.',
    verified: true,
  },
]
