import React, {useEffect, useId, useRef, useState} from 'react';
import {navigation, institutionalUrl} from '../data';
import {Icon, Link, External, Action, Eyebrow} from './ui';
import './HeaderFooter.css';
type Network = 'instagram' | 'youtube';

const profiles: Record<Network, {name: string; handle: string; url: string}[]> = {
  instagram: [
    {name: 'ESF Portugal', handle: '@esf_portugal', url: 'https://www.instagram.com/esf_portugal/#'},
    {name: 'ICM Portugal', handle: '@igrejacristamaranata_portugal', url: 'https://www.instagram.com/igrejacristamaranata_portugal/#'},
    {name: 'ICM Oficial', handle: '@igrejacristamaranata_oficial', url: 'https://www.instagram.com/igrejacristamaranata_oficial/#'},
  ],
  youtube: [
    {name: 'Igreja Cristã Maranata Oficial', handle: '@IgrejaCristaMaranataOficial', url: 'https://www.youtube.com/@IgrejaCristaMaranataOficial'},
  ],
};

function SocialIcon({network}: {network: Network}) {
  return network === 'instagram' ? (
    <svg className="social-channels__icon social-channels__icon--instagram"
      viewBox="0 0 24 24" width="24" height="24" fill="none"
      aria-hidden="true" focusable="false">
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="#fff" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.7" stroke="#fff" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.9" r="1.1" fill="#fff" />
    </svg>
  ) : (
    <svg className="social-channels__icon social-channels__icon--youtube"
      viewBox="0 0 24 24" width="24" height="24"
      aria-hidden="true" focusable="false">
      <path fill="#ff0033"
        d="M22.5 7.2a3 3 0 0 0-2.1-2.1C18.5 4.6 12 4.6 12 4.6s-6.5 0-8.4.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 1 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.4.5 8.4.5s6.5 0 8.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23 12a31 31 0 0 0-.5-4.8Z" />
      <path fill="#fff" d="m9.7 15.6 6.2-3.6-6.2-3.6Z" />
    </svg>
  );
}

function SocialChannels() {
  const [active, setActive] = useState<Network | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!active) return;

    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setActive(null);
      }
    };

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const element = root.current;
      if (element?.contains(document.activeElement)) {
        element.querySelector<HTMLButtonElement>(
          `button[data-network="${active}"]`
        )?.focus();
      }
      setActive(null);
    };

    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeWithEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeWithEscape);
    };
  }, [active]);

  return (
    <div ref={root} className="social-channels" data-active={active ?? 'none'}
      onPointerLeave={event => {
        if (event.pointerType === 'mouse' &&
          !event.currentTarget.contains(document.activeElement)) {
          setActive(null);
        }
      }}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setActive(null);
        }
      }}>
      <Link href="/conteudos" className="social-channels__label">
        Acompanhe os nossos canais digitais: 
      </Link>

      <div className="social-channels__networks">
        {(['instagram', 'youtube'] as const).map(network => {
          const name = network === 'instagram' ? 'Instagram' : 'YouTube';
          const open = active === network;
          const panelId = `${id}-${network}`;

          return (
            <div key={network} className="social-channels__network">
              <button type="button" className="social-channels__trigger"
                data-network={network} aria-label={`Mostrar canais do ${name}`}
                aria-expanded={open} aria-controls={panelId}
                onPointerEnter={event => {
                  if (event.pointerType === 'mouse') setActive(network);
                }}
                onFocus={() => setActive(network)}
                onClick={() => setActive(network)}>
                <SocialIcon network={network} />
              </button>

              <div id={panelId} role="group" aria-label={`Canais do ${name}`}
                className={`social-channels__panel social-channels__panel--${network}${open ? ' is-open' : ''}`}
                aria-hidden={!open} inert={!open}>
                {profiles[network].map(profile => (
                  <a key={profile.url} href={profile.url}
                    className="social-channels__profile"
                    target="_blank" rel="noopener noreferrer"
                    title={profile.handle}
                    aria-label={`${profile.name} no ${name}: ${profile.handle} (abre num novo separador)`}>
                    <strong>{profile.name}</strong>
                    <span className="social-channels__handle">
                      {network === 'instagram' && <SocialIcon network="instagram" />}
                      <span className="social-channels__handle-text">{profile.handle}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PortugalFlag() {
  const shields = [[12, 8.2], [10.7, 9.7], [12, 9.7], [13.3, 9.7], [12, 11.2]];
  const castles = [[9.4, 6.1], [12, 6.1], [14.6, 6.1], [9.2, 8.8], [14.8, 8.8], [10.1, 11.6], [13.9, 11.6]];

  return (
    <svg className="brand__flag" viewBox="0 0 30 20" width="21" height="14"
      aria-hidden="true" focusable="false">
      <path fill="#ff0000" d="M0 0h30v20H0z" />
      <path fill="#006600" d="M0 0h12v20H0z" />
      <g fill="none" stroke="#ffcc00" strokeWidth=".55">
        <circle cx="12" cy="10" r="5.1" />
        <ellipse cx="12" cy="10" rx="2.4" ry="5.1" />
        <ellipse cx="12" cy="10" rx="5.1" ry="1.8" />
        <path d="m8.2 6.6 7.6 6.8M7.1 11.4l9.8-2.8M12 4.9v10.2" />
      </g>
      <path fill="#cc0000" stroke="#ffcc00" strokeWidth=".35"
        d="M8.4 5.5h7.2v4.8c0 2.1-1.5 3.5-3.6 4.3-2.1-.8-3.6-2.2-3.6-4.3z" />
      <path fill="#fff"
        d="M9.8 7.2h4.4v3.1c0 1.4-.8 2.4-2.2 3-1.4-.6-2.2-1.6-2.2-3z" />
      {shields.map(([x, y]) => (
        <g key={x + '-' + y} transform={`translate(${x} ${y})`}>
          <path fill="#003399" d="M-.4-.5h.8v.6c0 .3-.2.5-.4.6-.2-.1-.4-.3-.4-.6z" />
          <g fill="#fff">
            <circle cx="-.17" cy="-.28" r=".07" />
            <circle cx=".17" cy="-.28" r=".07" />
            <circle cx="0" cy="-.05" r=".07" />
            <circle cx="-.17" cy=".17" r=".07" />
            <circle cx=".17" cy=".17" r=".07" />
          </g>
        </g>
      ))}
      {castles.map(([x, y]) => (
        <g key={x + '-' + y} transform={`translate(${x} ${y})`} fill="#ffcc00">
          <path d="M-.4-.4h.2v.15h.1V-.5h.2v.25h.1V-.4h.2v.8h-.8z" />
          <path fill="#cc0000" d="M-.09.4V.1a.09.09 0 0 1 .18 0v.3z" />
        </g>
      ))}
    </svg>
  );
}

export function Brand({white = false}: {white?: boolean}) {
  return (
    <Link href="/" className={`brand${white ? ' brand--white' : ''}`}
      aria-label="Igreja Cristã Maranata em Portugal — Início">
      <img className="brand__logo" src="/images/logo-icm.svg"
        width="1023" height="288" alt="Igreja Cristã Maranata" />
      <span className="brand__country">
        <PortugalFlag />
        <span className="brand__country-name">Portugal</span>
      </span>
    </Link>
  );
}

export function Header({path}: {path: string}) {
  const [mobile, setMobile] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMobile(false);
  }, [path]);

  useEffect(() => {
    if (mobile) {
      dialog.current?.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      dialog.current?.close();
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobile]);

  return (
    <>
      <div className="utility">
        <div className="container">
          <span>A paz do Senhor Jesus!</span>
          <SocialChannels />
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav aria-label="Navegação principal" className="desktop-nav">
            {navigation.filter(n => !['/', '/igrejas'].includes(n.href)).map(n => (
              <Link key={n.href} href={n.href}
                aria-current={path.startsWith(n.href) ? 'page' : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/igrejas" className="button header-cta">
            <Icon name="pin" />
            Encontrar uma igreja mais próxima de mim
          </Link>
          <button ref={opener} className="icon-button menu-button"
            aria-label="Abrir menu" aria-expanded={mobile}
            aria-controls="mobile-navigation" onClick={() => setMobile(true)}>
            <Icon name="menu" />
          </button>
        </div>
      </header>

      <dialog id="mobile-navigation" className="mobile-dialog" ref={dialog}
        aria-labelledby="mobile-title"
        onCancel={() => setMobile(false)}
        onClose={() => {
          setMobile(false);
          opener.current?.focus();
        }}>
        <div className="mobile-heading">
          <span id="mobile-title">Menu</span>
          <button className="icon-button" onClick={() => setMobile(false)}
            aria-label="Fechar menu">
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label="Navegação em telemóvel">
          {navigation.map((n, i) => (
            <Link href={n.href} key={n.href}
              aria-current={path === n.href ? 'page' : undefined}
              onClick={() => setMobile(false)}>
              <span className="menu-number">0{i + 1}</span>
              {n.label}
              <Icon name="arrow" />
            </Link>
          ))}
        </nav>
        <p>Igreja Cristã Maranata<br />O Senhor Jesus Vem!</p>
      </dialog>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-intro">
          <Brand white />
          <p>Maranata.<br />O Senhor Jesus vem!</p>
        </div>
        <div>
          <h2>Conheça a Igreja Cristã Maranata</h2>
          {navigation.filter(n => n.href !== '/').map(n => (
            <Link href={n.href} key={n.href}>{n.label}</Link>
          ))}
        </div>
        <div>
          <h2>Canais institucionais</h2>
          <External href="https://www.igrejacristamaranata.org.br/">Igreja Cristã Maranata</External>
          <External href="https://esf.pt/">Evangelho Sem Fronteiras em Portugal</External>
          <External href="https://www.instagram.com/esf_portugal/">ESF Portugal no Instagram</External>
        </div>
        <div className="footer-visit">
          <Icon name="pin" />
          <h2>Visite uma de nossas igrejas.</h2>
          <p>Consulte a morada e os horários da igreja mais próxima de si.</p>
          <Link className="text-link" href="/igrejas">
            Encontrar uma igreja <Icon name="arrow" />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Igreja Cristã Maranata em Portugal</span>
        <Link href="/privacidade">Privacidade</Link>
        <a href="#top" onClick={e => {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'instant' : 'smooth',
          });
        }}>Voltar ao topo ↑</a>
      </div>
    </footer>
  );
}

export function Invite() {
  return (
    <section className="invite">
      <div className="container invite-inner">
        <div>
          <Eyebrow light>Venha conhecer-nos</Eyebrow>
          <h2>Há um lugar para si.<br />Será um gosto recebê-lo.</h2>
        </div>
        <Action href="/igrejas" light>Encontrar uma igreja</Action>
      </div>
    </section>
  );
}

