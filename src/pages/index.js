import { useState, useEffect } from 'react'
import axios from 'axios'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { SERVICES_CONTEXT, setLoggedUser, MIXPANEL_TOKEN } from 'src/@core/constants/constants.js'
import mixpanel from 'mixpanel-browser'

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&family=Instrument+Serif:ital@0;1&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .login-root {
      min-height: 100vh;
      display: flex;
      font-family: 'DM Sans', sans-serif;
      background: #f8fafc;
    }

    /* ══ PAINEL ESQUERDO ══ */
    .left-panel {
      width: 50%;
      min-height: 100vh;
      background: linear-gradient(160deg, #1e3a5f 0%, #1d4ed8 55%, #2563eb 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 64px 64px;
      position: relative;
      overflow: hidden;
    }

    /* Círculo decorativo de fundo */
    .left-panel::before {
      content: '';
      position: absolute;
      top: -120px; right: -120px;
      width: 380px; height: 380px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      pointer-events: none;
    }
    .left-panel::after {
      content: '';
      position: absolute;
      bottom: -80px; left: -80px;
      width: 280px; height: 280px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
      pointer-events: none;
    }

    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 100px;
      padding: 6px 14px;
      margin-bottom: 36px;
      width: fit-content;
    }
    .brand-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #4ade80;
      box-shadow: 0 0 6px #4ade80;
    }
    .brand-text {
      font-size: 11px;
      font-weight: 600;
      color: rgba(255,255,255,0.85);
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .left-title {
      font-family: 'Instrument Serif', serif;
      font-size: 42px;
      line-height: 1.15;
      color: #fff;
      margin-bottom: 16px;
      letter-spacing: -0.3px;
    }
    .left-title em {
      font-style: italic;
      color: #86efac;
    }

    .left-desc {
      font-size: 15px;
      color: rgba(255,255,255,0.65);
      line-height: 1.75;
      max-width: 380px;
      margin-bottom: 44px;
    }

    /* Cards de feature */
    .features { display: flex; flex-direction: column; gap: 10px; }

    .feature-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 14px;
      padding: 16px 18px;
      transition: background 0.2s, border-color 0.2s;
    }
    .feature-card:hover {
      background: rgba(255,255,255,0.13);
      border-color: rgba(255,255,255,0.22);
    }

    .feature-icon {
      width: 38px; height: 38px;
      border-radius: 10px;
      background: rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      font-size: 17px;
    }
    .feature-icon.amber { background: rgba(251,191,36,0.2); }

    .feature-title {
      font-size: 13.5px;
      font-weight: 600;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 3px;
    }
    .feature-desc {
      font-size: 12.5px;
      color: rgba(255,255,255,0.5);
      line-height: 1.55;
    }

    .soon-badge {
      font-size: 9.5px;
      font-weight: 700;
      color: #fbbf24;
      background: rgba(251,191,36,0.15);
      border: 1px solid rgba(251,191,36,0.3);
      border-radius: 100px;
      padding: 2px 7px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Stat strip */
    .stat-strip {
      display: flex;
      gap: 32px;
      margin-top: 36px;
      padding-top: 28px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .stat-number {
      font-family: 'Instrument Serif', serif;
      font-size: 26px;
      color: #fff;
      line-height: 1;
      margin-bottom: 3px;
    }
    .stat-number span { color: #86efac; }
    .stat-label {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    /* ══ PAINEL DIREITO ══ */
    .right-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 64px 72px;
      background: #f8fafc;
    }

    .form-box { width: 100%; max-width: 360px; }

    .form-eyebrow {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #94a3b8;
      margin-bottom: 12px;
    }

    .form-title {
      font-family: 'Instrument Serif', serif;
      font-size: 36px;
      color: #0f172a;
      margin-bottom: 8px;
    }

    .form-sub {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.65;
      margin-bottom: 32px;
    }
    .form-sub strong { color: #475569; font-weight: 500; }

    /* Input */
    .input-wrap { position: relative; margin-bottom: 14px; }
    .input-field {
      width: 100%;
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 13px 16px 13px 46px;
      font-size: 14.5px;
      font-family: 'DM Sans', sans-serif;
      color: #0f172a;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-field::placeholder { color: #cbd5e1; }
    .input-field:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
    .input-icon {
      position: absolute;
      left: 15px; top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      pointer-events: none;
    }

    /* Código */
    .code-field {
      width: 100%;
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      font-size: 26px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 700;
      color: #0f172a;
      text-align: center;
      letter-spacing: 0.5em;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      margin-bottom: 14px;
    }
    .code-field::placeholder { color: #cbd5e1; font-size: 18px; letter-spacing: 0.15em; }
    .code-field:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }

    /* Botão */
    .btn-primary {
      width: 100%;
      padding: 14px;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      font-family: 'DM Sans', sans-serif;
      cursor: pointer;
      transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
      box-shadow: 0 4px 16px rgba(37,99,235,0.25);
      margin-top: 4px;
    }
    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
      box-shadow: 0 6px 24px rgba(37,99,235,0.35);
    }
    .btn-primary:active:not(:disabled) { transform: scale(0.99); }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

    .btn-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 14px;
    }
    .btn-text {
      background: none;
      border: none;
      font-size: 12.5px;
      font-family: 'DM Sans', sans-serif;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px 0;
      transition: color 0.15s;
    }
    .btn-text:hover:not(:disabled) { color: #64748b; }
    .btn-text:disabled { opacity: 0.4; cursor: not-allowed; }

    .error-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      padding: 11px 14px;
      font-size: 13px;
      color: #ef4444;
      margin-bottom: 12px;
      line-height: 1.5;
    }

    .loading-bar {
      height: 2px;
      border-radius: 2px;
      background: linear-gradient(90deg, #2563eb, #60a5fa, #2563eb);
      background-size: 200% 100%;
      animation: shimmer 1.2s infinite linear;
      margin-bottom: 14px;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .form-footer {
      margin-top: 32px;
      font-size: 11.5px;
      color: #cbd5e1;
      text-align: center;
    }

    @media (max-width: 768px) {
      .left-panel { display: none; }
      .right-panel { padding: 48px 28px; background: #fff; }
      .form-box { max-width: 100%; }
    }
  `}</style>
)

const MSGS_ERRO = {
  OTP_INVALIDO:                    'Código inválido. Verifique e tente novamente.',
  OTP_EXPIRADO:                    'Código expirado. Solicite um novo.',
  OTP_MAX_TENTATIVAS:              'Muitas tentativas incorretas. Solicite um novo código.',
  OTP_RATE_LIMIT:                  'Muitas tentativas. Aguarde alguns minutos.',
  LOGINERROR_USUARIO_BLOQUEADO:    'Usuário bloqueado. Entre em contato com o seu patrocinador.',
  LOGINERROR_EMAIL_NAO_CADASTRADO: 'Este e-mail não está cadastrado no sistema.',
  ERRO_INTERNO:                    'Erro interno. Tente novamente em instantes.',
}

const LoginPage = () => {
  const [etapa, setEtapa] = useState('email')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [reenvioSegundos, setReenvioSegundos] = useState(0)
  const [avisoHotmail, setAvisoHotmail] = useState(false)

  const isMicrosoftEmail = (e) => /^[^\s@]+@(hotmail|outlook|live|msn)\./i.test(e)

  useEffect(() => {
    mixpanel.init(MIXPANEL_TOKEN)
    mixpanel.track('LoginPage_viewed')
    const user = sessionStorage.getItem('loggedUser')
    if (user) window.location.href = '/empreendedores'
  }, [])

  useEffect(() => {
    if (reenvioSegundos <= 0) return
    const t = setTimeout(() => setReenvioSegundos(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [reenvioSegundos])

  const solicitarOTP = async () => {
    const emailNorm = email.trim().toLowerCase()
    if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      setErro('Informe um e-mail válido.'); return
    }
    setErro(null); setCarregando(true)
    try {
      const { data } = await axios.post(`${SERVICES_CONTEXT}/otp/solicitar`, { email: emailNorm, sistema: 'GESTAO_ACESSOS' })
      if (data.result?.error) {
        setErro(MSGS_ERRO[data.result.errorCodes?.[0]] || MSGS_ERRO.ERRO_INTERNO)
      } else {
        setEtapa('otp')
        setReenvioSegundos(60)
        const dominiosLixo = ['hotmail.com', 'hotmail.com.br', 'outlook.com', 'outlook.com.br', 'live.com']
        const dominio = emailNorm.split('@')[1]?.toLowerCase()
        setAvisoHotmail(dominiosLixo.includes(dominio))
      }
    } catch { setErro(MSGS_ERRO.ERRO_INTERNO) }
    finally { setCarregando(false) }
  }

  const verificarOTP = async () => {
    if (!codigo.trim()) { setErro('Informe o código recebido por e-mail.'); return }
    setErro(null); setCarregando(true)
    try {
      const { data } = await axios.post(`${SERVICES_CONTEXT}/otp/verificar`, {
        email: email.trim().toLowerCase(),
        codigo: codigo.trim(),
        sistema: 'GESTAO_ACESSOS',
      })
      if (data.result?.error) {
        const cod = data.result.errorCodes?.[0]
        setErro(MSGS_ERRO[cod] || MSGS_ERRO.ERRO_INTERNO)
        if (cod === 'OTP_EXPIRADO' || cod === 'OTP_MAX_TENTATIVAS') {
          setTimeout(() => { setEtapa('email'); setCodigo(''); setErro(null) }, 2500)
        }
      } else {
        const user = data.result.user
        if (user.idNivelDeAcesso < 5) { setErro('Você não tem permissão para acessar este sistema.'); return }
        setLoggedUser(user)
        mixpanel.identify(user.idUsuario)
        mixpanel.track('LoginPage_userloged_successfully')
        mixpanel.people.set({ first_name: user.nomeCompleto, Email: user.email, idUsuario: user.idUsuario })
        window.location.href = '/empreendedores'
      }
    } catch { setErro(MSGS_ERRO.ERRO_INTERNO) }
    finally { setCarregando(false) }
  }

  return (
    <>
      <GlobalStyle />
      <div className='login-root'>

        {/* ── Painel esquerdo azul ── */}
        <div className='left-panel'>
          <div className='brand-badge'>
            <div className='brand-dot' />
            <span className='brand-text'>Estude Onde Quiser</span>
          </div>

          <h1 className='left-title'>
            Desenvolva sua equipe<br />
            com <em>inteligência</em>
          </h1>
          <p className='left-desc'>
            Libere acessos ao treinamento, acompanhe se a equipe está estudando e, em breve, gerencie as competências de cada distribuidor.
          </p>

          <div className='features'>
            <div className='feature-card'>
              <div className='feature-icon'>🎓</div>
              <div>
                <div className='feature-title'>Liberação de acesso ao EAD</div>
                <div className='feature-desc'>Decida quem da sua equipe tem acesso ao curso de formação.</div>
              </div>
            </div>
            <div className='feature-card'>
              <div className='feature-icon'>📈</div>
              <div>
                <div className='feature-title'>Acompanhamento de estudos</div>
                <div className='feature-desc'>Veja quem está estudando, quantas aulas concluiu e como evolui.</div>
              </div>
            </div>
            <div className='feature-card'>
              <div className='feature-icon amber'>🏆</div>
              <div>
                <div className='feature-title'>
                  Gestão de competências
                  <span className='soon-badge'>Em breve</span>
                </div>
                <div className='feature-desc'>Avalie e desenvolva as competências de cada membro da rede.</div>
              </div>
            </div>
          </div>

          <div className='stat-strip'>
            <div>
              <div className='stat-number'>640<span>+</span></div>
              <div className='stat-label'>Distribuidores</div>
            </div>
            <div>
              <div className='stat-number'>1</div>
              <div className='stat-label'>Curso ativo</div>
            </div>
            <div>
              <div className='stat-number'>100<span>%</span></div>
              <div className='stat-label'>Online</div>
            </div>
          </div>
        </div>

        {/* ── Painel direito branco ── */}
        <div className='right-panel'>
          <div className='form-box'>
            {etapa === 'email' ? (
              <>
                <div className='form-eyebrow'>Acesso seguro · sem senha</div>
                <div className='form-title'>Bem-vindo 👋</div>
                <div className='form-sub'>
                  Digite seu e-mail para receber<br />um código de acesso único.
                </div>

                <div className='input-wrap'>
                  <span className='input-icon'>✉️</span>
                  <input
                    className='input-field'
                    type='email'
                    placeholder='seu@email.com'
                    value={email}
                    disabled={carregando}
                    autoFocus
                    onChange={e => { setEmail(e.target.value); setErro(null) }}
                    onKeyDown={e => e.key === 'Enter' && solicitarOTP()}
                  />
                </div>

                {erro && <div className='error-box'>⚠️ {erro}</div>}
                {carregando && <div className='loading-bar' />}

                <button className='btn-primary' disabled={carregando} onClick={solicitarOTP}>
                  {carregando ? 'Enviando...' : 'Enviar código →'}
                </button>
              </>
            ) : (
              <>
                <div className='form-eyebrow'>Verificação · 6 dígitos</div>
                <div className='form-title'>Confirme o acesso</div>
                <div className='form-sub'>
                  Código enviado para<br /><strong>{email}</strong>
                </div>

                {avisoHotmail && (
                  <div className='error-box' style={{ background: '#fffbeb', borderColor: '#fcd34d', color: '#92400e' }}>
                    📧 <strong>Atenção:</strong> emails Hotmail/Outlook costumam receber o código na pasta <strong>Lixo Eletrônico</strong> ou <strong>Spam</strong>. Verifique lá antes de solicitar um novo código.
                  </div>
                )}

                <input
                  className='code-field'
                  type='text'
                  inputMode='numeric'
                  placeholder='· · · · · ·'
                  maxLength={6}
                  value={codigo}
                  disabled={carregando}
                  autoFocus
                  onChange={e => { setCodigo(e.target.value.replace(/\D/g, '')); setErro(null) }}
                  onKeyDown={e => e.key === 'Enter' && verificarOTP()}
                />

                {erro && <div className='error-box'>⚠️ {erro}</div>}
                {carregando && <div className='loading-bar' />}

                <button className='btn-primary' disabled={carregando} onClick={verificarOTP}>
                  {carregando ? 'Verificando...' : 'Confirmar e entrar →'}
                </button>

                <div className='btn-actions'>
                  <button className='btn-text' onClick={() => { setEtapa('email'); setCodigo(''); setErro(null) }}>
                    ← Trocar e-mail
                  </button>
                  <button className='btn-text' disabled={reenvioSegundos > 0 || carregando}
                    onClick={() => { setCodigo(''); solicitarOTP() }}>
                    {reenvioSegundos > 0 ? `Reenviar em ${reenvioSegundos}s` : 'Reenviar código'}
                  </button>
                </div>
              </>
            )}
            <div className='form-footer'>Acesso restrito a distribuidores cadastrados</div>
          </div>
        </div>

      </div>
    </>
  )
}

LoginPage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default LoginPage
