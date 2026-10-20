import React from 'react';
type IconName='arrow'|'external'|'pin'|'search'|'menu'|'close'|'book'|'radio'|'play'|'globe'|'music'|'access'|'calendar'|'clock'|'chevron';
export function Icon({name,className=''}:{name:IconName;className?:string}){
 const paths:Record<IconName,React.ReactNode>={arrow:<><path d="M4 12h15M13 6l6 6-6 6"/></>,external:<><path d="M7 17 18 6M7 6h11v11"/></>,pin:<><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,menu:<path d="M4 7h16M4 12h16M4 17h16"/>,close:<path d="m6 6 12 12M6 18 18 6"/>,book:<><path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1ZM12 5v15"/></>,radio:<><rect x="3" y="7" width="18" height="14" rx="2"/><path d="m5 7 12-5M15 11h3M15 15h3"/><circle cx="8" cy="14" r="2.5"/></>,play:<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m10 9 5 3-5 3Z"/></>,globe:<><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4.5" ry="10"/><path d="M2 12h20"/></>,music:<><path d="M9 18V5l12-2v13M9 9l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/></>,access:<><circle cx="12" cy="3" r="2"/><path d="m4 8 8 2 8-2M12 10v6m0 0-5 6m5-6 5 6"/></>,calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 11h18M7 15h3M14 15h3"/></>,clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></>,chevron:<path d="m8 10 4 4 4-4"/>};
 return <svg className={'icon '+className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function navigate(href:string){window.history.pushState(null,'',href);window.dispatchEvent(new PopStateEvent('popstate'));}

export function Link({href,children,className='',...rest}:React.AnchorHTMLAttributes<HTMLAnchorElement>&{href:string}){return <a href={href} className={className} {...rest} onClick={e=>{rest.onClick?.(e);if(!e.defaultPrevented&&href.startsWith('/')&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey&&e.button===0){e.preventDefault();navigate(href);}}}>{children}</a>;}

export function External({href,children,className=''}:{href:string;children:React.ReactNode;className?:string}){return <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}<Icon name="external"/><span className="sr-only"> (abre num novo separador)</span></a>;}

export function Action({href,children,secondary=false,light=false}:{href:string;children:React.ReactNode;secondary?:boolean;light?:boolean}){return <Link href={href} className={`button ${secondary?'button-secondary':''} ${light?'button-light':''}`}>{children}<Icon name="arrow"/></Link>;}

export function Photo({name,alt,className='',priority=false}:{name:string;alt:string;className?:string;priority?:boolean}){return <img className={className} src={`/images/${name}.webp`} srcSet={`/images/${name}-640.webp 640w, /images/${name}-1200.webp 1200w, /images/${name}.webp 1920w`} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 80vw, 60vw" width="1920" height="1280" alt={alt} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async"/>;}

export function Eyebrow({children,light=false}:{children:React.ReactNode;light?:boolean}){return <span className={'eyebrow '+(light?'eyebrow-light':'')}>{children}</span>;}

export function PageIntro({label,title,children}:{label:string;title:string;children:React.ReactNode}){return <section className="page-intro"><div className="container"><div className="breadcrumbs"><Link href="/">Início</Link><span>/</span><span>{label}</span></div><Eyebrow>{label}</Eyebrow><h1>{title}</h1><p>{children}</p></div></section>;}

export function Empty({icon='calendar',title,children}:{icon?:IconName;title:string;children:React.ReactNode}){return <div className="empty-state"><span className="empty-icon"><Icon name={icon}/></span><div><h3>{title}</h3><p>{children}</p></div></div>;}
