import { useState } from 'react';
import { Container, Card, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { Code2, Play } from 'lucide-react';

const LANGUAGE_CONFIG = {
  python: {
    name: 'Python 3',
    compiler: 'cpython-head',
    defaultCode: 'print("Hello from Python!")\n',
  },
  javascript: {
    name: 'JavaScript (Node)',
    compiler: 'nodejs-20.17.0',
    defaultCode: 'console.log("Hello from JavaScript!");\n',
  },
  java: {
    name: 'Java',
    compiler: 'openjdk-jdk-21+35',
    defaultCode: `class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}`,
  },
  cpp: {
    name: 'C++',
    compiler: 'gcc-13.2.0',
    defaultCode: `#include <iostream>

int main() {
    std::cout << "Hello from C++!" << std::endl;
    return 0;
}`,
  }
};

const TestSandbox = () => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(LANGUAGE_CONFIG['python'].defaultCode);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(LANGUAGE_CONFIG[lang].defaultCode);
    setResult(null);
  };

  const handleRunCode = async () => {
    setRunning(true);
    setResult(null);

    const compiler = LANGUAGE_CONFIG[language].compiler;
    
    try {
      const response = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: compiler,
          code: code,
          save: false
        })
      });

      const data = await response.json();
      
      if (data.status === '0') {
        setResult({ success: true, output: data.program_message || 'Success (No output)' });
      } else {
        let errOut = data.compiler_error || data.program_error || 'Unknown Error';
        if (errOut.includes('OCI runtime error') || errOut.includes('Resource temporarily unavailable') || errOut.includes('catatonit:2')) {
          errOut = 'Wandbox code execution API is currently overloaded or experiencing downtime for this language. Please try again in a few moments or try a different language.';
        }
        setResult({ success: false, output: errOut });
      }
    } catch (err) {
      setResult({ success: false, output: 'Failed to connect to execution engine. Please try again.' });
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Container>
      <div className="d-flex align-items-center mb-4">
        <Code2 className="me-2 text-primary" size={32} />
        <h1 className="mb-0">Test Sandbox</h1>
      </div>
      <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
        Write, test, and verify your code in real-time. Check for syntax errors or experiment with different programming languages.
      </p>

      <Card className="apple-card mb-4">
        <Card.Body className="p-4">
          <Row className="mb-3 align-items-end">
            <Col md={4} lg={3}>
              <Form.Group>
                <Form.Label className="fw-bold mb-2">Language</Form.Label>
                <Form.Select 
                  value={language} 
                  onChange={handleLanguageChange}
                  className="shadow-sm"
                  style={{ borderRadius: '10px' }}
                >
                  {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col className="text-md-end mt-3 mt-md-0">
              <Button variant="primary" onClick={handleRunCode} disabled={running}>
                <Play size={18} className="me-2" />
                {running ? 'Running...' : 'Run Code'}
              </Button>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Control 
              as="textarea" 
              rows={12} 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              style={{ 
                fontFamily: 'monospace', 
                backgroundColor: '#1E1E1E', 
                color: '#D4D4D4',
                fontSize: '0.95rem',
                border: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {result && (
        <Alert variant={result.success ? 'success' : 'danger'} className="mb-5 shadow-sm">
          <h5 className="mb-2 fw-bold">{result.success ? 'Execution Successful' : 'Error / Syntax Issue'}</h5>
          <pre className="mb-0 mt-2" style={{ 
            background: 'rgba(0,0,0,0.05)', 
            border: 'none', 
            boxShadow: 'none',
            color: 'inherit',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {result.output}
          </pre>
        </Alert>
      )}
    </Container>
  );
};

export default TestSandbox;
