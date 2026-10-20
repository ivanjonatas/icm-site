import {readFile,mkdir,writeFile} from 'node:fs/promises';
const base=await readFile('dist/index.html','utf8');
const pages=[
 ['','Igreja Cristã Maranata em Portugal','Uma mensagem de esperança. Uma igreja perto de si. Conheça a Igreja Cristã Maranata em Portugal.'],
 ['a-igreja','A Igreja | ICM Portugal','Conheça a fé, a história e a mensagem da Igreja Cristã Maranata.'],
 ['igrejas','Igrejas em Portugal | ICM Portugal','Pesquise igrejas por localidade e consulte moradas e horários em Portugal.'],
 ['agenda','Agenda | ICM Portugal','Eventos confirmados e encontros anteriores da igreja em Portugal.'],
 ['noticias','Notícias | ICM Portugal','Registos de evangelização e comunhão em Portugal.'],
 ['conteudos','Conteúdos | ICM Portugal','Ensino bíblico, Rádio Maanaim, TV Maanaim e canais institucionais.'],
 ['contactos','Contactos | ICM Portugal','Prepare a sua visita e conheça os canais disponíveis em Portugal.'],
 ['privacidade','Privacidade | ICM Portugal','Informações sobre pesquisa, navegação e ligações externas nesta versão privada.'],
 ['404','Página não encontrada | ICM Portugal','Não encontrámos esta página. Regresse ao início ou encontre uma igreja.']
];
for(const [slug,city] of [['setubal','Setúbal'],['maia','Maia'],['caldas','Caldas da Rainha'],['lisboa','Lisboa']]){
 pages.push(['agenda/esf-'+slug+'-2026','Evangelho Sem Fronteiras — '+city+' | ICM Portugal','Conheça o registo do Evangelho Sem Fronteiras em '+city+'.']);
 if(slug!=='lisboa')pages.push(['noticias/esf-'+slug+'-2026','Evangelho Sem Fronteiras — '+city+' | ICM Portugal','Uma mensagem de esperança partilhada com a comunidade em '+city+'.']);
}
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
for(const [route,title,description] of pages){
 let html=base.replace(/<title>[^<]*<\/title>/,'<title>'+escape(title)+'</title>').replace(/(<meta name="description" content=")[^"]*/,(_,prefix)=>prefix+escape(description)).replace(/(<meta property="og:title" content=")[^"]*/,(_,prefix)=>prefix+escape(title)).replace(/(<meta property="og:description" content=")[^"]*/,(_,prefix)=>prefix+escape(description));
 const directory=route?'dist/'+route:'dist';await mkdir(directory,{recursive:true});await writeFile(directory+'/index.html',html);
 if(route==='404')await writeFile('dist/404.html',html);
}
await writeFile('dist/_redirects','/* /index.html 200\n');
await writeFile('dist/robots.txt','User-agent: *\nDisallow: /\n');
console.log('Prepared '+pages.length+' direct routes and a private-review robots policy.');
