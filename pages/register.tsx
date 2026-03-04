import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { HomeIcon, Shield } from "lucide-react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [showAdminField, setShowAdminField] = useState(false);
  const [adminExists, setAdminExists] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/check");
        const data = await res.json();
        setAdminExists(data.adminExists);
      } catch {
        setAdminExists(true);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    if (router.query.email) {
      setEmail(String(router.query.email));
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload: { name: string; email: string; password: string; adminCode?: string } = {
        name,
        email,
        password,
      };
      if (showAdminField && adminCode) {
        payload.adminCode = adminCode;
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.status === 201) {
        setMessage(resData.message || "Conta criada com sucesso!");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(resData.message || "Erro ao criar conta.");
      }
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-root {
          min-height: 100vh;
          display: flex;
          background: #fafaf8;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .reg-left {
          flex: 1;
          position: relative;
          display: none;
          overflow: hidden;
          background: #1a1814;
        }
        @media (min-width: 1024px) { .reg-left { display: block; } }

        .reg-left-grid {
          position: absolute; inset: 0;
          opacity: 0.04;
          background-image:
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px);
          background-size: 72px 72px;
        }
        .reg-left-glow {
          position: absolute;
          top: 40%; left: 50%;
          transform: translate(-50%, -50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse, rgba(184,145,42,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .reg-left-content {
          position: relative; z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px;
        }

        .reg-logo {
          display: flex; align-items: center; gap: 11px; text-decoration: none;
        }
        .reg-logo-icon {
          width: 34px; height: 34px; background: #b8912a;
          display: flex; align-items: center; justify-content: center;
        }
        .reg-logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px; font-weight: 500;
          letter-spacing: 0.18em; color: white; text-transform: uppercase;
        }
        .reg-logo-text span { color: #b8912a; }

        .reg-left-sub {
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(184,145,42,0.7); margin-bottom: 16px;
        }
        .reg-left-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px, 4vw, 56px);
          font-weight: 300; line-height: 1.1;
          color: white; letter-spacing: -0.01em;
        }
        .reg-left-headline em {
          font-style: italic; color: #b8912a;
        }

        .reg-left-badge {
          display: inline-flex; align-items: center; gap: 9px;
          border: 1px solid rgba(184,145,42,0.3);
          background: rgba(184,145,42,0.06);
          padding: 9px 16px; margin-top: 28px; width: fit-content;
        }
        .reg-badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #b8912a;
          animation: regBadgePulse 2s infinite;
        }
        @keyframes regBadgePulse {
          0%,100%{ opacity:1; transform:scale(1); }
          50%{ opacity:0.45; transform:scale(0.8); }
        }
        .reg-badge-text {
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(184,145,42,0.75);
        }

        .reg-left-footer {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: rgba(255,255,255,0.18);
        }

        /* ── DIVIDER ── */
        .reg-divider {
          width: 1px;
          background: #e8e4dc;
          display: none;
        }
        @media (min-width: 1024px) { .reg-divider { display: block; } }

        /* ── RIGHT PANEL ── */
        .reg-right {
          width: 100%; max-width: 480px;
          display: flex; flex-direction: column; justify-content: center;
          padding: 52px 44px;
          background: #fafaf8;
          position: relative;
        }
        @media (min-width: 1024px) { .reg-right { width: 480px; flex-shrink: 0; } }
        @media (max-width: 1023px) { .reg-right { max-width: 100%; margin: 0 auto; } }

        .reg-right-grid {
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
        .reg-mobile-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; margin-bottom: 40px;
        }
        @media (min-width: 1024px) { .reg-mobile-logo { display: none; } }
        .reg-mobile-logo-icon {
          width: 30px; height: 30px; background: #b8912a;
          display: flex; align-items: center; justify-content: center;
        }
        .reg-mobile-logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; font-weight: 500;
          letter-spacing: 0.18em; color: #1a1814; text-transform: uppercase;
        }
        .reg-mobile-logo-text span { color: #b8912a; }

        .reg-eyebrow {
          font-size: 9.5px; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: #b8912a; margin-bottom: 12px;
        }
        .reg-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 4vw, 42px);
          font-weight: 300; color: #1a1814;
          line-height: 1.1; margin-bottom: 8px;
        }
        .reg-subtitle {
          font-size: 13.5px; font-weight: 300;
          color: #9c9890; margin-bottom: 32px; letter-spacing: 0.01em;
        }

        /* form */
        .reg-field { margin-bottom: 16px; }
        .reg-label {
          display: block; font-size: 9.5px;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #9c9890; margin-bottom: 8px; font-weight: 600;
        }
        .reg-input {
          width: 100%;
          background: white;
          border: 1px solid #e8e4dc;
          padding: 14px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 300;
          color: #1a1814; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .reg-input::placeholder { color: #c8c4bc; }
        .reg-input:focus {
          border-color: #b8912a;
          box-shadow: 0 0 0 3px rgba(184,145,42,0.08);
        }

        .reg-input-admin {
          width: 100%;
          background: #fffbf0;
          border: 1px solid rgba(184,145,42,0.3);
          padding: 14px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 300;
          color: #1a1814; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .reg-input-admin::placeholder { color: #c8c4bc; }
        .reg-input-admin:focus {
          border-color: #b8912a;
          box-shadow: 0 0 0 3px rgba(184,145,42,0.1);
        }

        .reg-admin-toggle {
          display: flex; align-items: center; gap: 8px;
          padding-top: 16px; margin-top: 4px;
          border-top: 1px solid #e8e4dc;
          background: none; border-left: none; border-right: none; border-bottom: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: #9c9890; transition: color 0.2s;
        }
        .reg-admin-toggle:hover { color: #b8912a; }

        .reg-error {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          margin-bottom: 16px;
          font-size: 12.5px; color: #dc2626; font-weight: 300;
        }

        .reg-success {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px;
          background: rgba(184,145,42,0.06);
          border: 1px solid rgba(184,145,42,0.25);
          margin-bottom: 16px;
          font-size: 12.5px; color: #b8912a; font-weight: 400;
        }

        .reg-btn {
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
        .reg-btn:hover:not(:disabled) {
          background: #d4aa4a; transform: translateY(-1px);
        }
        .reg-btn:active:not(:disabled) { transform: translateY(0); }
        .reg-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .reg-spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: regSpin 0.7s linear infinite;
        }
        @keyframes regSpin { to { transform: rotate(360deg); } }

        .reg-footer {
          display: flex; align-items: center; justify-content: center;
          margin-top: 24px; padding-top: 20px;
          border-top: 1px solid #e8e4dc;
        }
        .reg-login-link {
          font-size: 12px; font-weight: 300; color: #9c9890;
        }
        .reg-login-link a {
          color: #b8912a; text-decoration: none;
          font-weight: 500; margin-left: 4px; transition: opacity 0.2s;
        }
        .reg-login-link a:hover { opacity: 0.75; }

        .reg-form-inner {
          position: relative; z-index: 2;
          opacity: 0; transform: translateY(12px);
          animation: regFadeUp 0.6s ease forwards;
          animation-delay: 0.1s;
        }
        @keyframes regFadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="reg-root">

        {/* ── LEFT — dark branding panel ── */}
        <div className="reg-left">
          <div className="reg-left-grid" />
          <div className="reg-left-glow" />
          <div className="reg-left-content">

            <a href="/" className="reg-logo">
              <div className="reg-logo-icon">
                <HomeIcon size={16} color="white" />
              </div>
              <span className="reg-logo-text">Imob<span>Hub</span></span>
            </a>

            <div>
              <p className="reg-left-sub">Plataforma Premium</p>
              <h2 className="reg-left-headline">
                Comece sua<br />jornada no seu<br /><em>escritório digital.</em>
              </h2>
              <div className="reg-left-badge">
                <div className="reg-badge-dot" />
                <span className="reg-badge-text">Junte-se aos melhores corretores</span>
              </div>
            </div>

            <div className="reg-left-footer">© {new Date().getFullYear()} IMOBHUB</div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="reg-divider" />

        {/* ── RIGHT — form panel ── */}
        <div className="reg-right">
          <div className="reg-right-grid" />

          <div className="reg-form-inner">

            {/* Mobile logo */}
            <a href="/" className="reg-mobile-logo">
              <div className="reg-mobile-logo-icon">
                <HomeIcon size={14} color="white" />
              </div>
              <span className="reg-mobile-logo-text">Imob<span>Hub</span></span>
            </a>

            <p className="reg-eyebrow">Criar conta gratuita</p>
            <h1 className="reg-title">Cadastre-se<br />agora</h1>
            <p className="reg-subtitle">Preencha os dados abaixo para começar</p>

            <form onSubmit={handleSubmit}>
              <div className="reg-field">
                <label htmlFor="name" className="reg-label">Nome Completo</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="reg-input"
                />
              </div>

              <div className="reg-field">
                <label htmlFor="email" className="reg-label">E-mail</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="reg-input"
                />
              </div>

              <div className="reg-field">
                <label htmlFor="password" className="reg-label">Senha</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="reg-input"
                />
              </div>

              {/* Código Admin — só aparece se NÃO existe admin */}
              {!adminExists && (
                <div className="reg-field">
                  <button
                    type="button"
                    onClick={() => setShowAdminField(!showAdminField)}
                    className="reg-admin-toggle"
                  >
                    <Shield size={13} />
                    {showAdminField ? "Ocultar código admin" : "Tenho código de administrador"}
                  </button>

                  {showAdminField && (
                    <div style={{ marginTop: 14 }}>
                      <label htmlFor="adminCode" className="reg-label">Código de Administrador</label>
                      <input
                        id="adminCode"
                        type="password"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        placeholder="Código secreto"
                        className="reg-input-admin"
                      />
                      <p style={{ fontSize: 11, color: "#9c9890", marginTop: 6, letterSpacing: "0.02em" }}>
                        Insira o código fornecido pelo sistema para criar conta de administrador.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="reg-error">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.5" />
                    <path d="M8 5v3.5M8 11v.5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {error}
                </div>
              )}

              {message && (
                <div className="reg-success">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#b8912a" strokeWidth="1.5" />
                    <path d="M5 8l2 2 4-4" stroke="#b8912a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {message}
                </div>
              )}

              <button type="submit" disabled={isLoading} className="reg-btn">
                {isLoading ? (
                  <>
                    <span className="reg-spinner" />
                    Criando conta...
                  </>
                ) : "Criar Conta"}
              </button>
            </form>

            <div className="reg-footer">
              <p className="reg-login-link">
                Já tem uma conta?
                <Link href="/login">Fazer login</Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default RegisterPage;
