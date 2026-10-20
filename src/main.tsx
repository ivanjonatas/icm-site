import React, {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {navigation,news,events} from './data';
import {Header,Footer} from './components/layout';
import {Home} from './pages/Home';
import {About} from './pages/About';
import {Directory} from './pages/Directory';
import {Agenda} from './pages/Agenda';
import {News} from './pages/News';
import {Article} from './pages/Article';
import {Contents} from './pages/Contents';
import {Contacts} from './pages/Contacts';
import {Privacy} from './pages/Privacy';
import {NotFound} from './pages/NotFound';
import './fonts.css';
import './style.css';
function App(){const [location,setLocation]=useState(window.location.pathname+window.location.search);const initial=useRef(true);const main=useRef<HTMLElement>(null);const path=location.split('?')[0].replace(/\/$/,'')||'/';useEffect(()=>{const onPop=()=>setLocation(window.location.pathname+window.location.search);window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop);},[]);useEffect(()=>{const nav=navigation.find(n=>n.href===path);const article=[...news,...events].find(n=>path.endsWith('/'+n.slug));const title=path==='/'?'Igreja Cristã Maranata em Portugal':(article?.title||nav?.label||(path==='/privacidade'?'Privacidade':'Página não encontrada'))+' | ICM Portugal';document.title=title;document.querySelector('meta[property="og:title"]')?.setAttribute('content',title);const descriptions:Record<string,string>={'/':'Uma mensagem de esperança. Uma igreja perto de si. Conheça a Igreja Cristã Maranata em Portugal.','/a-igreja':'Conheça a fé, a história e a mensagem da Igreja Cristã Maranata.','/igrejas':'Encontre igrejas em Portugal. Pesquise por localidade e consulte moradas e horários.','/agenda':'Consulte os eventos confirmados e os encontros anteriores em Portugal.','/noticias':'Registos da vida da Igreja Cristã Maranata em Portugal.','/conteudos':'Ensino bíblico, Rádio Maanaim, TV Maanaim e canais institucionais.','/contactos':'Prepare a sua visita e conheça os canais disponíveis em Portugal.'};const desc=article?.description||descriptions[path]||'Igreja Cristã Maranata em Portugal.';document.querySelector('meta[name="description"]')?.setAttribute('content',desc);document.querySelector('meta[property="og:description"]')?.setAttribute('content',desc);window.scrollTo(0,0);if(initial.current)initial.current=false;else main.current?.focus({preventScroll:true});},[path]);let page:React.ReactNode;switch(path){case '/':page=<Home/>;break;case '/a-igreja':page=<About/>;break;case '/igrejas':page=<Directory key={location}/>;break;case '/agenda':page=<Agenda/>;break;case '/noticias':page=<News/>;break;case '/conteudos':page=<Contents/>;break;case '/contactos':page=<Contacts/>;break;case '/privacidade':page=<Privacy/>;break;default:page=path.startsWith('/noticias/')?<Article kind="news" slug={path.split('/')[2]}/>:path.startsWith('/agenda/')?<Article kind="event" slug={path.split('/')[2]}/>:<NotFound/>;}return <><a href="#main" className="skip-link">Saltar para o conteúdo</a><div id="top"/><Header path={path}/><main id="main" ref={main} tabIndex={-1}>{page}</main><Footer/></>;}
createRoot(document.getElementById('root')!).render(<App/>);
