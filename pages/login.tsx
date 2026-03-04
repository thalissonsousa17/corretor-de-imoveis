import { useAuth } from "@/lib/AuthContext";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/login", { email, password });
      if (response.status === 200) {
        login(response.data.user);
        if (response.data.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/corretor/dashboard");
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Ocorreu um erro ao fazer login.");
      } else {
        setError("Ocorreu um erro desconhecido. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          background: #0a0a0a;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* LEFT PANEL */
        .login-left {
          flex: 1;
          position: relative;
          display: none;
          overflow: hidden;
        }
        @media (min-width: 1024px) { .login-left { display: block; } }

        .login-left-bg {
          position: absolute;
          inset: 0;
          background: 
            linear-gradient(160deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.2) 50%, rgba(10,10,10,0.8) 100%),
            url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80') center/cover no-repeat;
        }

        .login-left-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
        }

        .login-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 500;
          letter-spacing: 0.18em;
          color: #f5f0e8;
          text-transform: uppercase;
        }
        .login-logo span {
          color: #c9a84c;
        }

        .login-left-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 4vw, 52px);
          font-weight: 300;
          line-height: 1.2;
          color: #f5f0e8;
          letter-spacing: -0.01em;
        }
        .login-left-headline em {
          font-style: italic;
          color: #c9a84c;
        }

        .login-left-sub {
          font-size: 13px;
          font-weight: 300;
          color: rgba(245,240,232,0.55);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 16px;
        }

        .login-left-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(201,168,76,0.3);
          padding: 8px 16px;
          border-radius: 2px;
          margin-top: 28px;
          width: fit-content;
        }
        .login-left-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #c9a84c;
          animation: pulse-gold 2s infinite;
        }
        @keyframes pulse-gold {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        .login-left-badge-text {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.65);
        }

        /* DIVIDER LINE */
        .login-divider {
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.25), transparent);
          display: none;
        }
        @media (min-width: 1024px) { .login-divider { display: block; } }

        /* RIGHT PANEL */
        .login-right {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 40px;
          background: #0e0e0e;
          position: relative;
        }
        @media (min-width: 1024px) { .login-right { width: 480px; flex-shrink: 0; } }
        @media (max-width: 1023px) { .login-right { max-width: 100%; margin: 0 auto; } }

        /* Top mobile logo */
        .login-mobile-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 500;
          letter-spacing: 0.18em;
          color: #f5f0e8;
          text-transform: uppercase;
          margin-bottom: 40px;
          display: block;
        }
        .login-mobile-logo span { color: #c9a84c; }
        @media (min-width: 1024px) { .login-mobile-logo { display: none; } }

        .login-eyebrow {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c9a84c;
          margin-bottom: 12px;
        }

        .login-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(30px, 4vw, 40px);
          font-weight: 300;
          color: #f5f0e8;
          line-height: 1.15;
          margin-bottom: 8px;
        }

        .login-subtitle {
          font-size: 13px;
          font-weight: 300;
          color: rgba(245,240,232,0.4);
          margin-bottom: 40px;
          letter-spacing: 0.02em;
        }

        .login-field {
          margin-bottom: 20px;
        }

        .login-label {
          display: block;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.45);
          margin-bottom: 8px;
        }

        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 2px;
          padding: 14px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #f5f0e8;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
        }
        .login-input::placeholder {
          color: rgba(245,240,232,0.2);
        }
        .login-input:focus {
          border-color: rgba(201,168,76,0.5);
          background: rgba(255,255,255,0.06);
        }
        .login-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #111 inset;
          -webkit-text-fill-color: #f5f0e8;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(220,50,50,0.08);
          border: 1px solid rgba(220,50,50,0.2);
          border-radius: 2px;
          margin-bottom: 20px;
          font-size: 12.5px;
          color: #f87171;
          font-weight: 300;
          letter-spacing: 0.01em;
        }

        .login-btn {
          width: 100%;
          padding: 15px 24px;
          background: linear-gradient(135deg, #c9a84c 0%, #e2c06a 50%, #c9a84c 100%);
          background-size: 200% auto;
          border: none;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #0a0a0a;
          cursor: pointer;
          transition: background-position 0.4s, opacity 0.2s, transform 0.15s;
          margin-top: 8px;
        }
        .login-btn:hover:not(:disabled) {
          background-position: right center;
          transform: translateY(-1px);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .login-btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .login-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(10,10,10,0.3);
          border-top-color: #0a0a0a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .login-forgot {
          font-size: 12px;
          font-weight: 300;
          color: rgba(245,240,232,0.35);
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .login-forgot:hover { color: #c9a84c; }

        .login-register {
          font-size: 12px;
          font-weight: 300;
          color: rgba(245,240,232,0.35);
          letter-spacing: 0.04em;
        }
        .login-register a {
          color: #c9a84c;
          text-decoration: none;
          font-weight: 400;
          margin-left: 4px;
          transition: opacity 0.2s;
        }
        .login-register a:hover { opacity: 0.75; }

        .login-right-decor {
          position: absolute;
          top: 0; right: 0;
          width: 180px; height: 180px;
          background: radial-gradient(circle at top right, rgba(201,168,76,0.06), transparent 70%);
          pointer-events: none;
        }
        .login-right-decor-bottom {
          position: absolute;
          bottom: 0; left: 0;
          width: 200px; height: 200px;
          background: radial-gradient(circle at bottom left, rgba(201,168,76,0.04), transparent 70%);
          pointer-events: none;
        }

        /* Fade in animation */
        .login-right-inner {
          opacity: 0;
          transform: translateY(12px);
          animation: fadeUp 0.6s ease forwards;
          animation-delay: 0.1s;
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="login-root">
        {/* LEFT — branding panel */}
        <div className="login-left">
          <div className="login-left-bg" />
          <div className="login-left-content">
            <div className="login-logo">Imob<span>Hub</span></div>

            <div>
              <p className="login-left-sub">Plataforma Premium</p>
              <h2 className="login-left-headline">
                Bem-vindo de<br />volta ao seu<br /><em>escritório digital.</em>
              </h2>
              <div className="login-left-badge">
                <div className="login-left-badge-dot" />
                <span className="login-left-badge-text">Top 1% dos corretores</span>
              </div>
            </div>

            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.25)' }}>
              © 2026 IMOBHUB S.A.
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="login-divider" />

        {/* RIGHT — form panel */}
        <div className="login-right">
          <div className="login-right-decor" />
          <div className="login-right-decor-bottom" />

          <div className="login-right-inner">
            <div className="login-mobile-logo">Imob<span>Hub</span></div>

            <p className="login-eyebrow">Acesso restrito</p>
            <h1 className="login-title">Acessar<br />sua Conta</h1>
            <p className="login-subtitle">Entre com suas credenciais para continuar</p>

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="email" className="login-label">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="login-input"
                />
              </div>

              <div className="login-field">
                <label htmlFor="password" className="login-label">Senha</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="login-input"
                />
              </div>

              {error && (
                <div className="login-error">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.5"/>
                    <path d="M8 5v3.5M8 11v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" disabled={isLoading} className="login-btn">
                {isLoading ? (
                  <span className="login-btn-loading">
                    <span className="login-spinner" />
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>

            <div className="login-footer">
              <Link href="/forgot-password" className="login-forgot">
                Esqueceu a senha?
              </Link>
              <p className="login-register">
                Novo aqui?
                <Link href="/register">Criar conta</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;