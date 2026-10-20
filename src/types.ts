export interface Church { id:string; name:string; address:string; region:string; schedule:{day:string; time:string}[]; source:string; verifiedAt:string; instagram?:string; }
export interface ChurchEvent {slug:string; title:string; date:string; city:string; image:string; description:string; paragraphs:string[]; source:string; gallery:string;}
export interface NewsArticle {slug:string; title:string; date:string; category:string; image:string; description:string; paragraphs:string[]; source:string;}
export interface Resource {id:string; title:string; category:string; description:string; url:string; icon:'book'|'radio'|'play'|'globe'|'music'|'access';}
