import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import bannerLogo from '../assets/secQ_banner.png';
import { useAuth } from '../context/AuthProvider';

const NavigationBar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <Navbar expand="lg" className="apple-navbar sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/scan" className="py-2">
          <img
            src={bannerLogo}
            height="32"
            className="d-inline-block align-top"
            alt="secQ logo"
            style={{ objectFit: 'contain' }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" className="border-0 shadow-none" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {[
              { path: '/scan', label: 'Scan' },
              { path: '/history', label: 'History' },
              { path: '/learn', label: 'Learn' },
              { path: '/sandbox', label: 'Test Sandbox' },
              { path: '/settings', label: 'Settings' }
            ].map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Nav.Link 
                  key={link.path}
                  as={Link} 
                  to={link.path} 
                  className="mx-1 apple-nav-link"
                  style={{
                    borderRadius: '12px',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#000' : 'rgba(0,0,0,0.6)',
                    backgroundColor: isActive && link.label === 'Scan' 
                      ? '#c0ff00' 
                      : isActive 
                        ? 'rgba(0,0,0,0.08)' 
                        : 'transparent'
                  }}
                >
                  {link.label}
                </Nav.Link>
              );
            })}
          </Nav>
          <Nav className="ms-3">
            {user ? (
              <Button variant="outline-secondary" size="sm" onClick={signOut} className="apple-btn-haptic px-3" style={{ borderRadius: '12px' }}>
                Sign Out
              </Button>
            ) : (
              <Button as={Link} to="/auth" variant="primary" size="sm" className="apple-btn-haptic px-3" style={{ borderRadius: '12px' }}>
                Sign In
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
