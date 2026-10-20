import sharp from 'sharp';
for(const name of ['esf-lisboa','esf-caldas','esf-setubal','esf-maia']){
 for(const width of [640,1200,1920]){
  const destination='public/images/'+name+(width===1920?'':'-'+width)+'.webp';
  const result=await sharp('public/images/'+name+'.jpg').rotate().resize({width,withoutEnlargement:true}).webp({quality:80}).toFile(destination);
  console.log(destination+': '+result.size+' bytes');
 }
}
