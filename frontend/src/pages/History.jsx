import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Accordion, Spinner } from 'react-bootstrap';
import { History as HistoryIcon, Globe, AlertOctagon, Flame, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';

const severityConfig = {
  Critical: { cls: 'badge-critical', icon: <AlertOctagon size={12} className="me-1 mb-1" /> },
  High:     { cls: 'badge-high',     icon: <Flame size={12} className="me-1 mb-1" /> },
  Medium:   { cls: 'badge-medium',   icon: <ShieldAlert size={12} className="me-1 mb-1" /> },
  Low:      { cls: 'badge-low',      icon: <CheckCircle2 size={12} className="me-1 mb-1" /> },
  Info:     { cls: 'badge-info-sev', icon: <Info size={12} className="me-1 mb-1" /> },
};

const getScoreColor = (score) => {
  if (score >= 80) return '#38B000';
  if (score >= 50) return '#f0a500';
  return '#D00000';
};

const getHostname = (url) => {
  try { return new URL(url).hostname; } catch { return url; }
};

const History = () => {
  const [history, setHistory] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [selectedScan, setSelectedScan] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [vulnData, setVulnData] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) setHistory(data);
    };
    fetchHistory();
  }, []);

  const sorted = [...history].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'score') return (a.score ?? 0) - (b.score ?? 0);
    const order = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };
    return (order[a.status] ?? 5) - (order[b.status] ?? 5);
  });

  const handleViewReport = async (scan) => {
    setSelectedScan(scan);
    setShowReportModal(true);
    setLoadingReport(true);
    
    try {
      const { data, error } = await supabase
        .from('vulnerabilities')
        .select('*')
        .eq('scan_id', scan.id);
        
      if (error) throw error;
      setVulnData(data || []);
    } catch (err) {
      console.error("Error fetching vulnerabilities:", err);
      setVulnData([]);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <Container>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center">
          <HistoryIcon className="me-2 text-info" size={28} />
          <h1 className="mb-0">Scan History</h1>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small fw-semibold">Sort by:</span>
          {['date', 'score', 'severity'].map((opt) => (
            <button
              key={opt}
              id={`sort-${opt}`}
              onClick={() => setSortBy(opt)}
              className={`btn btn-sm ${sortBy === opt ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{ borderRadius: '20px', textTransform: 'capitalize' }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Scan Cards Grid */}
      <Row xs={1} sm={2} lg={3} className="g-4">
        {sorted.map((scan) => {
          const sev = severityConfig[scan.status] ?? severityConfig['Info'];
          const hostname = getHostname(scan.target);
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;

          return (
            <Col key={scan.id}>
              <Card className="glass-panel scan-card h-100 border-0">
                {/* Thumbnail Preview */}
                <div className="thumbnail-preview">
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={faviconUrl}
                      alt={`${hostname} favicon`}
                      width={48}
                      height={48}
                      style={{ borderRadius: '8px', marginBottom: '8px', display: 'block', margin: '0 auto 8px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="text-muted small fw-medium" style={{ wordBreak: 'break-all' }}>{hostname}</span>
                  </div>
                </div>

                {/* Card Body */}
                <Card.Body className="pt-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        className="fw-semibold mb-0 text-truncate"
                        title={scan.target}
                        style={{ fontSize: '0.9rem' }}
                      >
                        <Globe size={14} className="me-1 text-muted" />
                        {scan.target}
                      </p>
                    </div>
                    <Badge
                      className={`ms-2 text-white ${sev.cls}`}
                      style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                    >
                      {sev.icon} {scan.status || 'Info'}
                    </Badge>
                  </div>

                  {/* Score bar */}
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="text-muted small fw-bold">Security Score</span>
                    <div className="score-track" style={{ flex: 1 }}>
                      <div
                        className="score-fill"
                        style={{
                          width: `${scan.score ?? 0}%`,
                          background: getScoreColor(scan.score ?? 0),
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                    <span
                      className="fw-bold small"
                      style={{ color: '#000', minWidth: '34px' }}
                    >
                      {scan.score ?? '—'}/100
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                      Scan Completed
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <hr className="my-2" style={{ borderColor: 'rgba(0,0,0,0.05)' }} />
                  <Button 
                    variant="light" 
                    className="w-100 mt-1 apple-btn-haptic text-dark fw-bold" 
                    size="sm"
                    style={{ backgroundColor: '#F5F5F7', borderRadius: '10px' }}
                    onClick={() => handleViewReport(scan)}
                  >
                    View Report
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {sorted.length === 0 && (
        <div className="text-center py-5 text-muted">
          <p className="fs-5">No scans yet. Go to <strong>Scan</strong> to analyse your first website!</p>
        </div>
      )}

      {/* Security Report Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} size="lg" centered contentClassName="squircle-card border-0">
        <Modal.Header closeButton className="border-0 pb-0">
          <div>
            <Modal.Title className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>Security Report</Modal.Title>
            <div className="text-muted small">
              Target: <strong className="text-dark">{selectedScan?.target}</strong> &bull; Score: <strong className="text-dark">{selectedScan?.score}/100</strong>
            </div>
            {selectedScan && (
              <div className="text-muted small mt-1">
                Generated: {new Date(selectedScan.created_at).toLocaleString()}
              </div>
            )}
          </div>
        </Modal.Header>
        <Modal.Body className="pb-4 pt-4">
          {loadingReport ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : vulnData.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <CheckCircle2 size={48} className="text-success mb-3" />
              <h5 className="fw-bold">No Vulnerabilities Found</h5>
              <p>Great job! This scan returned a clean bill of health.</p>
            </div>
          ) : (
            <Accordion className="apple-accordion">
              {vulnData.map((vuln, idx) => {
                const sevColor = (vuln.severity === 'Critical' || vuln.severity === 'High') ? '#FF3B30' : 
                                 vuln.severity === 'Medium' ? '#FF9500' : 
                                 vuln.severity === 'Low' ? '#34C759' : '#007AFF';
                return (
                  <Accordion.Item eventKey={String(idx)} key={vuln.id || idx} className="mb-3 border-0 rounded-4 overflow-hidden shadow-sm" style={{ background: '#F5F5F7' }}>
                    <Accordion.Header>
                      <div className="d-flex align-items-center w-100">
                        <Badge style={{ backgroundColor: sevColor, width: '70px', padding: '6px' }} className="me-3 text-white rounded-pill">
                          {vuln.severity}
                        </Badge>
                        <strong style={{ fontSize: '1.05rem', color: '#1D1D1F' }}>{vuln.title || vuln.name}</strong>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="bg-white m-2 rounded-3 p-4 shadow-sm">
                      <h6 className="fw-bold mb-2 text-dark">Description</h6>
                      <p className="small text-muted mb-4">{vuln.description}</p>
                      
                      {vuln.evidence && (
                        <>
                          <h6 className="fw-bold mb-2 text-dark">Evidence / Trigger</h6>
                          <pre className="p-3 rounded-3 overflow-auto" style={{ background: '#1D1D1F', color: '#c0ff00', fontSize: '0.85rem' }}>
                            <code>{vuln.evidence}</code>
                          </pre>
                        </>
                      )}
                      
                      {vuln.mitigation && (
                        <>
                          <h6 className="fw-bold mb-2 mt-4 text-dark">Mitigation / Suggestion</h6>
                          <div className="p-3 rounded-3 border" style={{ background: '#FAFAFC', fontSize: '0.9rem' }}>
                            {vuln.mitigation}
                          </div>
                        </>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          )}
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default History;
