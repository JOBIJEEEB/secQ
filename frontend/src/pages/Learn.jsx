import { useState } from 'react';
import { Container, Row, Col, Badge, Card, ListGroup } from 'react-bootstrap';
import { BookOpen, ExternalLink, ShieldAlert } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const checkGrid = [
  { icon: '🔐', label: 'Broken Authentication', desc: 'Weak login flows, session hijacking' },
  { icon: '💉', label: 'Injection Attacks', desc: 'SQL, command, and template injection' },
  { icon: '🌐', label: 'Cross-Site Scripting', desc: 'Reflected, stored, and DOM-based XSS' },
  { icon: '🔗', label: 'Insecure Dependencies', desc: 'Outdated packages with known CVEs' },
  { icon: '🛡️', label: 'Security Headers', desc: 'Missing CSP, HSTS, X-Frame-Options' },
  { icon: '🔓', label: 'Exposed Secrets', desc: 'API keys, tokens in source or headers' },
];

const vulnerabilities = [
  {
    id: 1,
    title: 'Cross-Site Scripting (XSS)',
    severity: 'High',
    description:
      'XSS lets attackers inject malicious scripts into pages viewed by other users. These scripts can steal session cookies, redirect users, or deface content — all without the victim realising.',
    before: `// Vulnerable: directly injecting user input as HTML (React)
function UserProfile({ userInput }) {
  return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
}`,
    after: `// Safe: React escapes text automatically
function UserProfile({ userInput }) {
  return <div>{userInput}</div>;
}`,
    refs: [
      { label: 'OWASP XSS Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html' },
      { label: 'PortSwigger XSS Guide', url: 'https://portswigger.net/web-security/cross-site-scripting' },
    ],
  },
  {
    id: 2,
    title: 'SQL Injection (SQLi)',
    severity: 'Critical',
    description:
      'SQLi allows attackers to manipulate database queries by inserting malicious SQL through user input. This can expose, modify, or delete sensitive data and in some cases grant full database access.',
    before: `// Vulnerable: string interpolation in a SQL query (Node.js)
const query = \`SELECT * FROM users WHERE username = '\${req.body.username}'\`;
db.query(query);`,
    after: `// Safe: parameterised query
const query = 'SELECT * FROM users WHERE username = $1';
db.query(query, [req.body.username]);`,
    refs: [
      { label: 'OWASP SQL Injection Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' },
      { label: 'PortSwigger SQL Injection', url: 'https://portswigger.net/web-security/sql-injection' },
    ],
  },
  {
    id: 3,
    title: 'Broken Authentication',
    severity: 'Critical',
    description:
      'Weak login flows — such as missing rate limiting, insecure session tokens, or password reset flaws — allow attackers to take over accounts without knowing the password.',
    before: `// Vulnerable: no rate limiting or lockout on login endpoint
app.post('/login', async (req, res) => {
  const user = await db.findUser(req.body.username, req.body.password);
  if (user) res.json({ token: generateToken(user) });
  else res.status(401).send('Invalid credentials');
});`,
    after: `// Safe: apply rate limiting with express-rate-limit
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many login attempts, please try again later.',
});

app.post('/login', loginLimiter, async (req, res) => {
  const user = await db.findUser(req.body.username, req.body.password);
  if (user) res.json({ token: generateToken(user) });
  else res.status(401).send('Invalid credentials');
});`,
    refs: [
      { label: 'OWASP Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html' },
      { label: 'OWASP Top 10 – Broken Authentication', url: 'https://owasp.org/www-project-top-ten/2017/A2_2017-Broken_Authentication' },
    ],
  },
  {
    id: 4,
    title: 'Cross-Site Request Forgery (CSRF)',
    severity: 'High',
    description:
      'CSRF tricks authenticated users into unknowingly submitting requests to a website they are logged into. A malicious link or embedded image can trigger fund transfers, password changes, or data deletion.',
    before: `<!-- Vulnerable: no CSRF token on a sensitive form -->
<form method="POST" action="/transfer-funds">
  <input name="amount" value="1000" />
  <input name="to"     value="attacker-account" />
  <button type="submit">Transfer</button>
</form>`,
    after: `<!-- Safe: include a server-generated CSRF token -->
<form method="POST" action="/transfer-funds">
  <input type="hidden" name="_csrf" value="<%= csrfToken %>" />
  <input name="amount" value="1000" />
  <input name="to"     value="attacker-account" />
  <button type="submit">Transfer</button>
</form>`,
    refs: [
      { label: 'OWASP CSRF Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html' },
      { label: 'PortSwigger CSRF Guide', url: 'https://portswigger.net/web-security/csrf' },
    ],
  },
  {
    id: 5,
    title: 'Insecure Direct Object Reference (IDOR)',
    severity: 'High',
    description:
      'IDOR occurs when a server uses user-controlled input to access objects (files, records, accounts) without verifying that the requester is authorised to see them.',
    before: `// Vulnerable: fetches any user record by ID — no ownership check
app.get('/api/user/:id', async (req, res) => {
  const user = await db.getUserById(req.params.id);
  res.json(user);
});`,
    after: `// Safe: verify the requesting user owns the record
app.get('/api/user/:id', authenticate, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = await db.getUserById(req.params.id);
  res.json(user);
});`,
    refs: [
      { label: 'OWASP IDOR Guide', url: 'https://owasp.org/www-chapter-ghana/assets/slides/IDOR.pdf' },
      { label: 'PortSwigger Access Control', url: 'https://portswigger.net/web-security/access-control/idor' },
    ],
  },
  {
    id: 6,
    title: 'Missing Security Headers',
    severity: 'Medium',
    description:
      'Security headers instruct browsers to apply protective policies. Without them, sites are vulnerable to clickjacking, MIME-type sniffing, and unencrypted resource loading.',
    before: `// Vulnerable: Express app with no security headers
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello World'));`,
    after: `// Safe: use helmet to set all recommended headers
const express = require('express');
const helmet  = require('helmet');
const app = express();

app.use(helmet()); // sets CSP, HSTS, X-Frame-Options, etc.

app.get('/', (req, res) => res.send('Hello World'));`,
    refs: [
      { label: 'OWASP Secure Headers Project', url: 'https://owasp.org/www-project-secure-headers/' },
      { label: 'MDN – HTTP Security Headers', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security' },
    ],
  },
  {
    id: 7,
    title: 'Sensitive Data Exposure',
    severity: 'High',
    description:
      'Applications that transmit or store sensitive data (passwords, tokens, PII) without proper encryption expose users to credential theft, identity fraud, and regulatory penalties.',
    before: `// Vulnerable: storing plain-text passwords in the database
const newUser = {
  username: req.body.username,
  password: req.body.password, // plain text!
};
await db.users.insert(newUser);`,
    after: `// Safe: hash passwords with bcrypt before storing
import bcrypt from 'bcrypt';

const saltRounds = 12;
const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

const newUser = {
  username: req.body.username,
  password: hashedPassword,
};
await db.users.insert(newUser);`,
    refs: [
      { label: 'OWASP Cryptographic Storage Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html' },
      { label: 'OWASP Password Storage Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html' },
    ],
  },
  {
    id: 8,
    title: 'Server-Side Request Forgery (SSRF)',
    severity: 'Critical',
    description:
      'SSRF lets attackers make the server fetch internal resources (cloud metadata, internal APIs) that are otherwise unreachable from the internet, often leading to full infrastructure compromise.',
    before: `// Vulnerable: fetching a URL supplied directly by the user
app.post('/fetch', async (req, res) => {
  const response = await fetch(req.body.url); // No validation!
  res.send(await response.text());
});`,
    after: `// Safe: validate the URL against an allow-list
import { URL } from 'url';

const ALLOWED_HOSTS = ['api.trusted.com', 'cdn.myapp.io'];

app.post('/fetch', async (req, res) => {
  const parsed = new URL(req.body.url);
  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return res.status(400).json({ error: 'Host not allowed' });
  }
  const response = await fetch(req.body.url);
  res.send(await response.text());
});`,
    refs: [
      { label: 'OWASP SSRF Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html' },
      { label: 'PortSwigger SSRF', url: 'https://portswigger.net/web-security/ssrf' },
    ],
  },
];

const severityVariant = {
  Critical: 'badge-critical',
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
};

const Learn = () => {
  const [activeTab, setActiveTab] = useState(vulnerabilities[0]);

  return (
    <Container>
      <div className="d-flex align-items-center mb-2">
        <BookOpen className="me-2 text-primary" size={32} />
        <h1 className="mb-0 fw-bold">Learn</h1>
      </div>
      <p className="text-muted mb-5" style={{ fontSize: '1.1rem' }}>
        Discover what secQ looks for, understand the mechanics of vulnerabilities, and learn how to secure your codebase.
      </p>

      {/* What we check grid */}
      <h4 className="fw-semibold mb-3">Core Security Checks</h4>
      <Row className="g-3 mb-5">
        {checkGrid.map((item) => (
          <Col key={item.label} xs={12} sm={6} md={4}>
            <Card className="apple-card h-100 p-3">
              <div className="d-flex align-items-start">
                <div style={{ fontSize: '1.8rem', lineHeight: 1 }} className="me-3">{item.icon}</div>
                <div>
                  <h6 className="fw-bold mb-1">{item.label}</h6>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Vulnerability Deep Dive (Side Nav Layout) */}
      <div className="d-flex align-items-center mb-4">
        <ShieldAlert className="me-2 text-warning" size={26} />
        <h4 className="fw-semibold mb-0">Vulnerability Deep Dive</h4>
      </div>
      
      <Row>
        <Col md={4} lg={3} className="mb-4">
          <Card className="apple-card p-2 border-0">
            <ListGroup variant="flush">
              {vulnerabilities.map((vuln) => (
                <ListGroup.Item
                  key={vuln.id}
                  action
                  active={activeTab.id === vuln.id}
                  onClick={() => setActiveTab(vuln)}
                  className="border-0 rounded-3 mb-1 fw-medium"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: activeTab.id === vuln.id ? 'rgba(192, 255, 0, 0.2)' : 'transparent',
                    color: activeTab.id === vuln.id ? '#000' : '#4a4a4a',
                  }}
                >
                  {vuln.title}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>

        <Col md={8} lg={9}>
          <Card className="apple-card p-4 border-0 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fw-bold mb-0">{activeTab.title}</h3>
              <Badge className={severityVariant[activeTab.severity] || 'badge-info-sev'}>
                {activeTab.severity}
              </Badge>
            </div>
            
            <p className="text-muted mb-4" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
              {activeTab.description}
            </p>

            <Row className="mb-4 g-4">
              <Col lg={6}>
                <div className="px-1 mb-2 d-flex justify-content-between">
                  <span className="fw-semibold text-danger">Vulnerable Code</span>
                </div>
                <SyntaxHighlighter language="javascript" style={vscDarkPlus} className="m-0" customStyle={{ fontSize: '0.85rem' }}>
                  {activeTab.before}
                </SyntaxHighlighter>
              </Col>
              <Col lg={6}>
                <div className="px-1 mb-2 d-flex justify-content-between">
                  <span className="fw-semibold text-success">Secure Mitigation</span>
                </div>
                <SyntaxHighlighter language="javascript" style={vscDarkPlus} className="m-0" customStyle={{ fontSize: '0.85rem' }}>
                  {activeTab.after}
                </SyntaxHighlighter>
              </Col>
            </Row>

            <div className="pt-3 border-top mt-auto">
              <h6 className="fw-bold mb-3">Further Reading</h6>
              <div className="d-flex flex-wrap gap-3">
                {activeTab.refs.map((ref) => (
                  <a
                    key={ref.url}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ref-link d-inline-flex align-items-center"
                    style={{ fontSize: '0.9rem' }}
                  >
                    <ExternalLink size={14} className="me-1" />
                    {ref.label}
                  </a>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Learn;
