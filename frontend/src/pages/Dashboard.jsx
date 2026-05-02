import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Globe, FolderGit2, Activity, ShieldAlert, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';

const mockData = [
  { name: 'XSS', count: 12 },
  { name: 'SQLi', count: 4 },
  { name: 'CSRF', count: 8 },
  { name: 'Secrets', count: 3 },
];

const Dashboard = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleScan = async (type, target) => {
    setScanning(true);
    setSuccessMsg('');
    
    try {
      const { data, error } = await supabase
        .from('scans')
        .insert([{ target, scan_type: type, status: 'pending', score: 0 }]);
        
      if (error) console.error(error);
      else setSuccessMsg(`Scan initiated for ${target}. Status: Pending...`);
    } catch (err) {
      console.error(err);
    }
    
    setTimeout(() => {
      setScanning(false);
    }, 1500);
  };

  return (
    <Container>
      <div className="d-flex align-items-center mb-4">
        <Activity className="me-2 text-primary" size={32} />
        <h1 className="mb-0">Security Dashboard</h1>
      </div>

      {successMsg && <Alert variant="success" className="glass-panel border-success">{successMsg}</Alert>}

      <Row className="metro-grid">
        <Col md={6}>
          <Card className="glass-panel h-100">
            <Card.Body>
              <Card.Title className="d-flex align-items-center">
                <Globe className="me-2 text-info" /> DAST: URL Scanning
              </Card.Title>
              <Card.Text className="text-muted small">
                Acts like an external attacker, testing the live site for vulnerabilities like XSS and SQL injection. Handles authentication.
              </Card.Text>
              <Form onSubmit={(e) => { e.preventDefault(); handleScan('DAST', targetUrl); }}>
                <Form.Group className="mb-3">
                  <Form.Control 
                    type="url" 
                    placeholder="https://example.com" 
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={scanning} className="w-100">
                  {scanning ? 'Initiating...' : 'Launch Active Scan'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="glass-panel h-100">
            <Card.Body>
              <Card.Title className="d-flex align-items-center">
                <FolderGit2 className="me-2 text-info" /> SAST: Repository Scanning
              </Card.Title>
              <Card.Text className="text-muted small">
                Scanning the full repository provides an in-depth analysis of the source code, catching logic flaws, hardcoded secrets, and vulnerable dependencies.
              </Card.Text>
              <Form onSubmit={(e) => { e.preventDefault(); handleScan('SAST', repoUrl); }}>
                <Form.Group className="mb-3">
                  <Form.Control 
                    type="url" 
                    placeholder="https://github.com/user/repo" 
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="info" type="submit" disabled={scanning} className="w-100 text-white">
                  {scanning ? 'Initiating...' : 'Clone & Analyze Code'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={8}>
          <Card className="glass-panel h-100">
            <Card.Body>
              <Card.Title>Recent Findings Summary</Card.Title>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.2)'}} contentStyle={{backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px'}} />
                    <Bar dataKey="count" fill="#c0ff00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="glass-panel h-100">
            <Card.Body>
              <Card.Title>System Status</Card.Title>
              <ul className="list-unstyled mt-3">
                <li className="mb-3 d-flex align-items-center">
                  <CheckCircle className="text-success me-2" size={20} />
                  <span>OWASP ZAP Engine Online</span>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <CheckCircle className="text-success me-2" size={20} />
                  <span>Semgrep Engine Online</span>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <CheckCircle className="text-success me-2" size={20} />
                  <span>TruffleHog Engine Online</span>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <ShieldAlert className="text-warning me-2" size={20} />
                  <span>3 Scans Pending</span>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
