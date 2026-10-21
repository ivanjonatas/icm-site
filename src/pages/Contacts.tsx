import React, {useId, useState} from 'react';
import {churches} from '../data';
import {Icon, Eyebrow} from '../components/ui';
const styles = `
.contacts-instagram{background:var(--light,#f5f6f7)}
.contacts-instagram__heading{max-width:760px;margin-bottom:32px}
.contacts-instagram__heading p{color:var(--muted);font-size:1.06rem}
.contacts-instagram__search{max-width:560px;margin-bottom:24px}
.contacts-instagram__search label{display:block;font-weight:700;margin-bottom:9px}
.contacts-instagram__input{display:flex;align-items:center;gap:12px;background:white;border:1px solid var(--line);border-radius:5px;padding:0 16px}
.contacts-instagram__input input{width:100%;min-width:0;min-height:52px;border:0;background:transparent;color:var(--navy);padding:12px 0;font:inherit}
.contacts-instagram__count{font-size:.88rem;color:var(--muted);margin-bottom:22px}
.contacts-instagram__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.contacts-instagram__card{display:flex;align-items:flex-start;gap:16px;min-width:0;padding:24px;background:white;border:1px solid var(--line);border-radius:7px;transition:transform .2s,border-color .2s,box-shadow .2s}
.contacts-instagram__card:hover{transform:translateY(-3px);border-color:#c13584;box-shadow:0 8px 24px #12263a0b}
.contacts-instagram__icon{width:28px;height:28px;flex-shrink:0;margin-top:3px}
.contacts-instagram__body{min-width:0;flex:1}
.contacts-instagram__card h3{font-size:1.2rem;margin:0 0 7px}
.contacts-instagram__handle{display:block;color:#a51e60;font-size:.9rem;overflow-wrap:anywhere;line-height:1.5}
.contacts-instagram__region{display:block;font-size:.78rem;color:var(--muted);margin-top:8px}
.contacts-instagram__card>.icon{width:16px;height:16px;color:var(--muted);margin-top:6px}
.contacts-instagram__note{margin:28px 0 0;color:var(--muted);font-size:.9rem;max-width:800px}
.contacts-instagram__empty{padding:28px;background:white;border:1px solid var(--line);border-radius:6px}
@media(max-width:1000px){.contacts-instagram__grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:620px){.contacts-instagram__grid{grid-template-columns:1fr}.contacts-instagram__card{padding:22px}.contacts-instagram__heading h2{font-size:2rem}}
@media(prefers-reduced-motion:reduce){.contacts-instagram__card{transition:none}.contacts-instagram__card:hover{transform:none}}
`;

function InstagramIcon(){
  const gradientId=useId().replace(/:/g,'')+'-contact-instagram';
  return <svg className="contacts-instagram__icon" viewBox="0 0 24 24" fill="none" stroke={`url(#${gradientId})`} strokeWidth="1.8" aria-hidden="true">
    <defs><linearGradient id={gradientId} x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#f9a13b"/><stop offset=".45" stopColor="#e1306c"/><stop offset="1" stopColor="#833ab4"/></linearGradient></defs>
    <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".9" fill={`url(#${gradientId})`} stroke="none"/>
  </svg>;
}

function normalise(value:string){
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
}

export function Contacts(){
  const [search,setSearch]=useState('');
  const searchId=useId();
  const profiles=churches
    .filter((church):church is typeof church & {instagram:string}=>Boolean(church.instagram))
    .sort((a,b)=>a.name.localeCompare(b.name,'pt-PT'));
  const query=normalise(search);
  const filtered=profiles.filter(church=>normalise(church.name+' '+church.region+' '+church.instagram).includes(query));

  return <>
    <style>{styles}</style>
    <section className="section contacts-instagram" aria-labelledby="church-instagrams-title">
      <div className="container">
        <div className="contacts-instagram__heading">
          <Eyebrow>Fale com a igreja</Eyebrow>
          <h2 id="church-instagrams-title">Encontre a sua igreja no Instagram.</h2>
          <p>Procura mais informações ou deseja entrar em contacto com uma igreja perto de si? Escolha a congregação e aceda ao seu perfil para acompanhar as publicações ou enviar uma mensagem pelo Instagram.</p>
        </div>

        <div className="contacts-instagram__search">
          <label htmlFor={searchId}>Procurar uma igreja</label>
          <div className="contacts-instagram__input">
            <Icon name="search"/>
            <input id={searchId} type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Cidade, região ou @instagram" aria-controls="church-instagrams-results"/>
          </div>
        </div>

        <p className="contacts-instagram__count" role="status">
          {filtered.length} {filtered.length===1?'perfil encontrado':'perfis encontrados'}
        </p>

        <div id="church-instagrams-results">
          {filtered.length>0?<div className="contacts-instagram__grid">
            {filtered.map(church=>{
              const handle=church.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//i,'').split(/[/?#]/)[0];
              return <a key={church.id} className="contacts-instagram__card" href={church.instagram} target="_blank" rel="noopener noreferrer" aria-label={`Abrir o Instagram da igreja de ${church.name}: @${handle} (novo separador)`}>
                <InstagramIcon/>
                <div className="contacts-instagram__body"><h3>{church.name}</h3><span className="contacts-instagram__handle">@{handle}</span><span className="contacts-instagram__region">{church.region}</span></div>
                <Icon name="external"/>
              </a>;
            })}
          </div>:<div className="contacts-instagram__empty"><p>Não encontrámos um perfil para esta pesquisa.</p><button type="button" className="button button-secondary" onClick={()=>setSearch('')}>Ver todos os perfis</button></div>}
        </div>

        <p className="contacts-instagram__note">Esta lista apresenta as igrejas com perfil de Instagram disponível no nosso diretório. Para consultar todas as congregações, incluindo as que não têm perfil indicado, utilize a página “Igrejas em Portugal”.</p>
      </div>
    </section>
    
  </>;
}