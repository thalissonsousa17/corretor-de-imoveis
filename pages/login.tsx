import { useAuth } from "@/lib/AuthContext";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { HomeIcon } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          background: #fafaf8;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .login-left {
          flex: 1;
          position: relative;
          display: none;
          overflow: hidden;
          background: #1a1814;
        }
        @media (min-width: 1024px) { .login-left { display: block; } }

        /* subtle grid on dark panel */
        .login-left-grid {
          position: absolute; inset: 0;
          opacity: 0.04;
          background-image:
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px);
          background-size: 72px 72px;
        }
        .login-left-glow {
          position: absolute;
          top: 40%; left: 50%;
          transform: translate(-50%, -50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse, rgba(184,145,42,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-left-content {
          position: relative; z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px;
        }

        .login-logo {
          display: flex; align-items: center; gap: 11px; text-decoration: none;
        }
        .login-logo-icon {
          width: 34px; height: 34px; background: #b8912a;
          display: flex; align-items: center; justify-content: center;
        }
        .login-logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px; font-weight: 500;
          letter-spacing: 0.18em; color: white; text-transform: uppercase;
        }
        .login-logo-text span { color: #b8912a; }

        .login-left-sub {
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(184,145,42,0.7); margin-bottom: 16px;
        }
        .login-left-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px, 4vw, 56px);
          font-weight: 300; line-height: 1.1;
          color: white; letter-spacing: -0.01em;
        }
        .login-left-headline em {
          font-style: italic; color: #b8912a;
        }

        .login-left-badge {
          display: inline-flex; align-items: center; gap: 9px;
          border: 1px solid rgba(184,145,42,0.3);
          background: rgba(184,145,42,0.06);
          padding: 9px 16px; margin-top: 28px; width: fit-content;
        }
        .login-badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #b8912a;
          animation: badgePulse 2s infinite;
        }
        @keyframes badgePulse {
          0%,100%{ opacity:1; transform:scale(1); }
          50%{ opacity:0.45; transform:scale(0.8); }
        }
        .login-badge-text {
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(184,145,42,0.75);
        }

        .login-left-footer {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: rgba(255,255,255,0.18);
        }

        /* ── DIVIDER ── */
        .login-divider {
          width: 1px;
          background: #e8e4dc;
          display: none;
        }
        @media (min-width: 1024px) { .login-divider { display: block; } }

        /* ── RIGHT PANEL ── */
        .login-right {
          width: 100%; max-width: 480px;
          display: flex; flex-direction: column; justify-content: center;
          padding: 52px 44px;
          background: #fafaf8;
          position: relative;
        }
        @media (min-width: 1024px) { .login-right { width: 480px; flex-shrink: 0; } }
        @media (max-width: 1023px) { .login-right { max-width: 100%; margin: 0 auto; } }

        /* grid texture on right panel */
        .login-right-grid {
          position: absolute; inset: 0; opacity: 0.4;
          background-image:
            linear-gradient(#e8e4dc 1px, transparent 1px),
            linear-gradient(90deg, #e8e4dc 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
          pointer-events: none;
        }

        /* mobile logo */
        .login-mobile-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; margin-bottom: 40px;
        }
        @media (min-width: 1024px) { .login-mobile-logo { display: none; } }
        .login-mobile-logo-icon {
          width: 30px; height: 30px; background: #b8912a;
          display: flex; align-items: center; justify-content: center;
        }
        .login-mobile-logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; font-weight: 500;
          letter-spacing: 0.18em; color: #1a1814; text-transform: uppercase;
        }
        .login-mobile-logo-text span { color: #b8912a; }

        .login-eyebrow {
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: #b8912a; margin-bottom: 12px;
        }
        .login-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 4vw, 42px);
          font-weight: 300; color: #1a1814;
          line-height: 1.1; margin-bottom: 8px;
        }
        .login-subtitle {
          font-size: 13.5px; font-weight: 300;
          color: #9c9890; margin-bottom: 36px; letter-spacing: 0.01em;
        }

        /* form */
        .login-field { margin-bottom: 18px; }
        .login-label {
          display: block; font-size: 9.5px;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #9c9890; margin-bottom: 8px; font-weight: 600;
        }
        .login-input {
          width: 100%;
          background: white;
          border: 1px solid #e8e4dc;
          padding: 14px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 300;
          color: #1a1814; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .login-input::placeholder { color: #c8c4bc; }
        .login-input:focus {
          border-color: #b8912a;
          box-shadow: 0 0 0 3px rgba(184,145,42,0.08);
        }

        .login-error {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          margin-bottom: 18px;
          font-size: 12.5px; color: #dc2626; font-weight: 300;
        }

        .login-btn {
          width: 100%; padding: 15px 24px;
          background: #b8912a;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: white; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          margin-top: 6px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .login-btn:hover:not(:disabled) {
          background: #d4aa4a; transform: translateY(-1px);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .login-spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 28px; padding-top: 24px;
          border-top: 1px solid #e8e4dc;
        }
        .login-forgot {
          font-size: 12px; font-weight: 400;
          color: #9c9890; text-decoration: none;
          letter-spacing: 0.03em; transition: color 0.2s;
        }
        .login-forgot:hover { color: #b8912a; }
        .login-register {
          font-size: 12px; font-weight: 300; color: #9c9890;
        }
        .login-register a {
          color: #b8912a; text-decoration: none;
          font-weight: 500; margin-left: 4px; transition: opacity 0.2s;
        }
        .login-register a:hover { opacity: 0.75; }

        /* fade in */
        .login-form-inner {
          position: relative; z-index: 2;
          opacity: 0; transform: translateY(12px);
          animation: loginFadeUp 0.6s ease forwards;
          animation-delay: 0.1s;
        }
        @keyframes loginFadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="login-root">

        {/* ── LEFT — dark branding panel ── */}
        <div className="login-left">
          <div className="login-left-grid" />
          <div className="login-left-glow" />
          <div className="login-left-content">

            <a href="/" className="login-logo">
              <div className="login-logo-icon">
                <HomeIcon size={16} color="white" />
              </div>
              <span className="login-logo-text">Imob<span>Hub</span></span>
            </a>

            <div>
              <p className="login-left-sub">Plataforma Premium</p>
              <h2 className="login-left-headline">
                Bem-vindo de<br />volta ao seu<br /><em>escritório digital.</em>
              </h2>
              <div className="login-left-badge">
                <div className="login-badge-dot" />
                <span className="login-badge-text">Top 1% dos corretores</span>
              </div>
            </div>

            <div className="login-left-footer">© {new Date().getFullYear()} IMOBHUB</div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="login-divider" />

        {/* ── RIGHT — form panel ── */}
        <div className="login-right">
          <div className="login-right-grid" />

          <div className="login-form-inner">

            {/* Mobile logo */}
            <a href="/" className="login-mobile-logo">
              <div className="login-mobile-logo-icon">
                <HomeIcon size={14} color="white" />
              </div>
              <span className="login-mobile-logo-text">Imob<span>Hub</span></span>
            </a>

            <p className="login-eyebrow">Acesso restrito</p>
            <h1 className="login-title">Acessar<br />sua Conta</h1>
            <p className="login-subtitle">Entre com suas credenciais para continuar</p>

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="email" className="login-label">Email</label>
                <input
                  id="email" type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="login-input"
                />
              </div>

              <div className="login-field">
                <label htmlFor="password" className="login-label">Senha</label>
                <input
                  id="password" type="password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="login-input"
                />
              </div>

              {error && (
                <div className="login-error">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.5"/>
                    <path d="M8 5v3.5M8 11v.5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" disabled={isLoading} className="login-btn">
                {isLoading ? (
                  <>
                    <span className="login-spinner" />
                    Entrando...
                  </>
                ) : "Entrar"}
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