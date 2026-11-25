import sharp from 'sharp'
import { readFile,writeFile } from 'node:fs/promises'
const dir='public/lab/aluminium-render/interactive/'
const geometry=JSON.parse(await readFile(dir+'geometry.json','utf8'))
await sharp(dir+'base.png').webp({quality:94}).toFile(dir+'base.webp')
for(const [kind,count,columns] of [['knob',49,7],['switch',33,6]]){
 const [, ,tileWidth,tileHeight]=geometry.regions[kind==='knob'?0:3]
 const mask=Buffer.alloc(tileWidth*tileHeight*4,255)
 for(let y=0;y<tileHeight;y++)for(let x=0;x<tileWidth;x++)mask[(y*tileWidth+x)*4+3]=Math.round(255*Math.min(1,x/12,y/12,(tileWidth-1-x)/12,(tileHeight-1-y)/12))
 const alpha=await sharp(mask,{raw:{width:tileWidth,height:tileHeight,channels:4}}).png().toBuffer()
 const tiles=await Promise.all(Array.from({length:count},async(_,i)=>({input:await sharp(dir+`${kind}-${String(i).padStart(2,'0')}.png`).resize(tileWidth,tileHeight).composite([{input:alpha,blend:"dest-in"}]).png().toBuffer(),left:(i%columns)*tileWidth,top:Math.floor(i/columns)*tileHeight})))
 await sharp({create:{width:columns*tileWidth,height:Math.ceil(count/columns)*tileHeight,channels:4,background:'#00000000'}}).composite(tiles).webp({quality:94}).toFile(dir+kind+'-atlas.webp')
}
for(let i=0;i<2;i++){
 const [left,top,width,height]=geometry.regions[i+1]
 const sphere=await sharp(dir+`particle-${i}.png`).resize(width,height).ensureAlpha().raw().toBuffer()
 const panel=await sharp(dir+'base.png').extract({left,top,width,height}).ensureAlpha().raw().toBuffer()
 const rgba=Buffer.alloc(width*height*4)
 const [cx,cy]=geometry.sphereCenter[i];const radius=geometry.sphereRadius
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const at=(y*width+x)*4
  // Only the actual cast shadow outside the dome, never its reflected surface.
  const r=Math.hypot((x+left-cx)/radius,(y+top-cy)/(radius*.97))
  if(r<1.02)continue
  const a=(sphere[at]+sphere[at+1]+sphere[at+2])/3,b=(panel[at]+panel[at+1]+panel[at+2])/3
  rgba[at+3]=Math.round(255*Math.max(0,Math.min(.7,1-a/Math.max(1,b)))*Math.min(1,(r-1.02)*20))
 }
 await sharp(rgba,{raw:{width,height,channels:4}}).webp({lossless:true}).toFile(dir+`shadow-${i}.webp`)
 await sharp(dir+`particle-${i}.png`).resize(width,height).webp({quality:96}).toFile(dir+`particle-${i}.webp`)
}
console.log('Packed interactive render assets')
