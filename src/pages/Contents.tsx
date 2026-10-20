import React, {useEffect,useRef,useState} from 'react';
import {resources} from '../data';
import {PageIntro} from '../components/ui';
import {Invite} from '../components/layout';
import {ResourceLink} from '../components/content';
export function Contents(){const [category,setCategory]=useState('Todos');const selected=resources.filter(r=>category==='Todos'||r.category===category);return <><PageIntro label="Conteúdos" title="Veja alguns dos nossos conteúdos.">Ensino bíblico, louvores e canais institucionais para acompanhar ao seu ritmo.</PageIntro><section className="section"><div className="container"><div className="category-filters" aria-label="Categorias de conteúdos">{['Todos',...new Set(resources.map(r=>r.category))].map(c=><button key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="content-grid" aria-live="polite">{selected.map(r=><ResourceLink key={r.id} resource={r}/>)}</div><p className="small-note">As ligações abrem os portais de origem num novo separador. A programação e os conteúdos são da responsabilidade de cada canal.</p></div></section><Invite/></>;}
