import type {Church, ChurchEvent, NewsArticle, Resource} from './types';
import directory from './churches.json';
export const churches:Church[]=directory;
export const institutionalUrl='https://www.igrejacristamaranata.org.br';
export const directoryUrl=institutionalUrl+'/enderecos-no-exterior/#local_exterior-portugal';
export const events:ChurchEvent[]=[
 {slug:'esf-setubal-2026',title:'Evangelho Sem Fronteiras em Setúbal',date:'2026-08-29',city:'Setúbal',image:'/images/esf-setubal.webp',description:'Evangelização, louvor e comunhão nas ruas de Setúbal.',paragraphs:['O Evangelho Sem Fronteiras passou por Setúbal a 29 de agosto de 2026. O registo publicado pelo ESF Portugal reúne momentos de evangelização nas ruas e de louvor.','Esta iniciativa da Igreja Cristã Maranata em Portugal partilha a mensagem do Evangelho e aproxima a comunidade. Consulte a galeria no portal ESF Portugal para conhecer o registo fotográfico.'],source:'https://esf.pt/',gallery:'https://esf.pt/fotos-setubal'},
 {slug:'esf-maia-2026',title:'Evangelho Sem Fronteiras na Maia',date:'2026-07-18',city:'Maia',image:'/images/esf-maia.webp',description:'Um encontro marcado pelo louvor e pela partilha do Evangelho.',paragraphs:['A Maia recebeu o Evangelho Sem Fronteiras a 18 de julho de 2026. A iniciativa reuniu participantes para partilhar o Evangelho, através da evangelização e do louvor.','O portal ESF Portugal disponibiliza o registo fotográfico deste encontro.'],source:'https://esf.pt/',gallery:'https://esf.pt/fotos-maia'},
 {slug:'esf-caldas-2026',title:'Evangelho Sem Fronteiras nas Caldas da Rainha',date:'2026-05-30',city:'Caldas da Rainha',image:'/images/esf-caldas.webp',description:'Uma mensagem de fé partilhada com a comunidade.',paragraphs:['A 30 de maio de 2026, o Evangelho Sem Fronteiras esteve nas Caldas da Rainha. A evangelização e o louvor fizeram parte deste encontro com a comunidade.','Conheça os momentos registados na galeria do ESF Portugal.'],source:'https://esf.pt/',gallery:'https://esf.pt/fotos-caldas'},
 {slug:'esf-lisboa-2026',title:'Evangelho Sem Fronteiras em Lisboa',date:'2026-04-11',city:'Lisboa',image:'/images/esf-lisboa.webp',description:'Jovens e comunidade reunidos para anunciar uma mensagem de esperança.',paragraphs:['O Evangelho Sem Fronteiras realizou-se em Lisboa a 11 de abril de 2026, com a participação de jovens da Igreja Cristã Maranata.','Os registos do encontro mostram a partilha da mensagem do Evangelho e momentos de louvor. Consulte a galeria completa no portal ESF Portugal.'],source:'https://esf.pt/',gallery:'https://esf.pt/fotos-lisboa'}
];
export const news:NewsArticle[]=events.slice(0,3).map(e=>({...e,category:'Portugal · Evangelização',source:e.gallery}));
export const resources:Resource[]=[
 {id:'ebd',title:'Escola Bíblica Dominical',category:'Ensino bíblico',description:'Boletins e materiais de estudo da Palavra de Deus no Instituto Bíblico da ICM.',url:'https://www.institutoicm.org.br/',icon:'book'},
 {id:'radio',title:'Rádio Maanaim',category:'Rádio',description:'Louvores, mensagens e programas para ouvir ao longo do dia.',url:'https://www.radiomaanaim.com.br/',icon:'radio'},
 {id:'tv',title:'TV Maanaim',category:'Vídeo',description:'Acompanhe os conteúdos e a programação no portal da TV Maanaim.',url:'https://www.tvwebmaanaim.com.br/',icon:'play'},
 {id:'esf',title:'Evangelho Sem Fronteiras',category:'Portugal',description:'Conheça os encontros de evangelização e as galerias de fotografias em Portugal.',url:'https://esf.pt/',icon:'globe'},
 {id:'louvor',title:'Departamento de Louvor',category:'Louvor',description:'Recursos e conteúdos de louvor no portal institucional.',url:'https://www.louvoricm.org.br/',icon:'music'},
 {id:'acessibilidade',title:'Acessibilidade ICM',category:'Acessibilidade',description:'Conheça os recursos de acessibilidade disponibilizados pela ICM.',url:'https://acessibilidadeicm.org.br/',icon:'access'}
];
export const navigation=[{href:'/',label:'Início'},{href:'/a-igreja',label:'A Igreja'},{href:'/igrejas',label:'Igrejas em Portugal'},{href:'/agenda',label:'Agenda'},{href:'/noticias',label:'Notícias'},{href:'/conteudos',label:'Conteúdos'},{href:'/contactos',label:'Contactos'}];
export function formatDate(date:string,short=false){return new Intl.DateTimeFormat('pt-PT',{day:'numeric',month:short?'short':'long',year:'numeric',timeZone:'Europe/Lisbon'}).format(new Date(date+'T12:00:00Z'));}
export function normalise(s:string){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
export function isFuture(date:string){const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Lisbon',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());return date>=today;}
