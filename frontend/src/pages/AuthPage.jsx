import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/scan');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setErrorMsg('Registration successful! Please check your email to verify your account or log in directly if auto-confirm is enabled.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <Card className="apple-card p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center fw-bold mb-4">{isLogin ? 'Sign In' : 'Create Account'}</h3>
        
        {errorMsg && (
          <Alert variant={errorMsg.includes('successful') ? 'success' : 'danger'} className="text-center shadow-sm">
            {errorMsg}
          </Alert>
        )}

        <Form onSubmit={handleAuth}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Button>
        </Form>
        
        <div className="text-center mt-4">
          <p className="text-muted small">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              className="text-primary fw-bold" 
              style={{ cursor: 'pointer', textDecoration: 'underline' }} 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </div>
      </Card>
    </Container>
  );
};

export default AuthPage;
