import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Settings as SettingsIcon, Key, User, Shield } from 'lucide-react';

const Settings = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Container>
      <div className="d-flex align-items-center mb-4">
        <SettingsIcon className="me-2 text-secondary" size={32} />
        <h1 className="mb-0">Application Settings</h1>
      </div>

      {saved && <Alert variant="success" className="glass-panel border-success">Settings saved successfully!</Alert>}

      <Row className="metro-grid">
        <Col md={6}>
          <Card className="glass-panel h-100 mb-4">
            <Card.Body>
              <Card.Title className="d-flex align-items-center">
                <User className="me-2 text-info" /> Profile Details
              </Card.Title>
              <Form onSubmit={handleSave} className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control type="email" defaultValue="auditor@secq.io" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Organization</Form.Label>
                  <Form.Control type="text" defaultValue="Google AntiGravity" />
                </Form.Group>
                <Button variant="primary" type="submit">Update Profile</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="glass-panel h-100 mb-4">
            <Card.Body>
              <Card.Title className="d-flex align-items-center">
                <Key className="me-2 text-warning" /> API & Integration
              </Card.Title>
              <Form onSubmit={handleSave} className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label>GitHub OAuth Token (for SAST)</Form.Label>
                  <Form.Control type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" />
                  <Form.Text className="text-muted">Required for scanning private repositories.</Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Default Target Credentials (DAST)</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control type="text" placeholder="Username" />
                    <Form.Control type="password" placeholder="Password" />
                  </div>
                </Form.Group>
                <Button variant="info" type="submit">Save Credentials</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;
