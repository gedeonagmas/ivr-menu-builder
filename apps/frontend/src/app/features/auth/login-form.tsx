import { useState } from 'react';
import { Button } from '@synergycodes/axiom';
import { useAuth } from './auth-provider';
import styles from './auth.module.css';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAsGuest } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['auth-container']}>
      <div className={styles['auth-card']}>
        <h2 className={styles['auth-title']}>IVR Builder</h2>
        <p className={styles['auth-subtitle']}>Sign in to your account</p>

        <form onSubmit={handleSubmit} className={styles['auth-form']}>
          {error && <div className={styles['error']}>{error}</div>}

          <div className={styles['form-group']}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={isLoading} className={styles['submit-button']}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className={styles['divider']}>
          <span>or</span>
        </div>

        <Button
          onClick={loginAsGuest}
          variant="secondary"
          className={styles['guest-button']}
        >
          Continue as Guest
        </Button>

        <p className={styles['auth-footer']}>
          Demo: demo@ivrbuilder.com / demo123456
        </p>
      </div>
    </div>
  );
}

