/** Uses Cycles frame atlases for the metal and samples the same render for particles. */
export interface AluminiumGeometry {
 width:number;height:number;centers:number[][];regions:number[][];switchFrames:number;knobFrames:number;sphereCenter:number[][];sphereRadius:number
}
export interface AluminiumController {
 value:(value:number)=>void; power:(on:boolean)=>void; mode:(index:number)=>void; pointer:(x:number,y:number)=>void; dispose:()=>void
}
const clamp=(n:number)=>Math.max(0,Math.min(1,n))
const ease=(n:number)=>n*n*(3-2*n)
const base='/lab/aluminium-render/interactive/'
async function picture(name:string){const img=new Image();img.src=base+name+'.webp';await img.decode();return img}
export async function createAluminiumInteraction(canvas:HTMLCanvasElement,geometry:AluminiumGeometry):Promise<AluminiumController>{
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable')
 const [background,knob,switches,material0,material1,shadow0,shadow1]=await Promise.all(['base','knob-atlas','switch-atlas','particle-0','particle-1','shadow-0','shadow-1'].map(picture))
 const {width:W,height:H,centers,regions,sphereCenter,sphereRadius:R}=geometry
 canvas.width=W;canvas.height=H
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
 const coarse=matchMedia('(pointer:coarse)').matches
 let frame=0,visible=true,disposed=false,last=0,currentValue=.5,targetValue=.5,currentPower=0,targetPower=0
 let from=0,to=0,start=-1e5,queued:number|null=null,mouseX=-1e4,mouseY=-1e4,hover=0
 const waves:number[]=[]
 const material=[material0,material1].map(img=>{
  const sample=document.createElement('canvas');sample.width=290;sample.height=300;const c=sample.getContext('2d')!;c.drawImage(img,0,0,290,300);return c.getImageData(0,0,290,300).data
 })
 const rand=(i:number)=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v)}
 const dots=Array.from({length:coarse?10500:17000},(_,i)=>{
  const r=Math.sqrt(rand(i+1)),a=rand(i+9001)*Math.PI*2,x=Math.cos(a)*r,y=Math.sin(a)*r
  const sx=Math.round(sphereCenter[0][0]-regions[1][0]+x*R*.96),sy=Math.round(sphereCenter[0][1]-regions[1][1]+y*R*.90)
  const pos=(Math.max(0,Math.min(299,sy))*290+Math.max(0,Math.min(289,sx)))*4
  const rgb=material.map(p=>[p[pos],p[pos+1],p[pos+2]])
  return {x,y,r,a,delay:rand(i+53000),phase:rand(i+83000)*Math.PI*2,rgb,colors:rgb.map(c=>`rgb(${c.join(',')})`)}
 })
 function choose(index:number,now=performance.now()){
  if(index===to){queued=null;waves.push(now);return}
  if(now-start<1550){queued=index;return}
  from=to;to=index;start=now;waves.push(now+1050)
 }
 const glyphs=[0,1].map(index=>{
  const g=document.createElement('canvas');g.width=220;g.height=220;const c=g.getContext('2d')!;c.strokeStyle='#313638';c.lineWidth=3;c.lineCap='round';c.lineJoin='round';
  c.save();c.translate(110,100);c.scale(1.18,1.18);c.translate(-110,-100)
  if(index===0){c.beginPath();c.roundRect(100,63,20,39,10);c.stroke();c.beginPath();c.arc(110,93,23,0,Math.PI);c.moveTo(110,116);c.lineTo(110,128);c.moveTo(98,128);c.lineTo(122,128);c.stroke()}
  else{c.beginPath();c.roundRect(79,73,62,44,8);c.stroke();for(let y=84;y<=96;y+=12)for(let x=89;x<=125;x+=12){c.beginPath();c.moveTo(x,y);c.lineTo(x+4,y);c.stroke()}c.beginPath();c.moveTo(94,108);c.lineTo(126,108);c.stroke()}
  c.restore();c.fillStyle='#313638';c.font=`38px ${getComputedStyle(canvas).fontFamily}`;c.textAlign='center';c.fillText(index===0?'Voice':'Type',110,171)
  const pixels=c.getImageData(0,0,220,220).data,points=[]
  for(let y=0;y<220;y+=1)for(let x=0;x<220;x+=1){const a=pixels[(y*220+x)*4+3]/255;if(a>.15)points.push({x:x-110,y:y-110,a})}
  return points
 })
 function patch(image:HTMLImageElement,region:number[],alpha=1){ctx!.globalAlpha=alpha;ctx!.drawImage(image,region[0],region[1],region[2],region[3]);ctx!.globalAlpha=1}
 function sprite(image:HTMLImageElement,index:number,columns:number,region:number[]){
  const [x,y,w,h]=region;ctx!.drawImage(image,(index%columns)*w,Math.floor(index/columns)*h,w,h,x,y,w,h)
 }
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake()});observer.observe(canvas)
 function wake(){if(!frame&&!disposed&&visible&&!document.hidden)frame=requestAnimationFrame(draw)}
 function draw(now:number){
  frame=0;if(disposed||!visible||document.hidden)return
  const dt=Math.min((now-last)/1000,.05);if(now-last<(coarse?32:16)){wake();return}last=now
  const damping=reduced?1:1-Math.exp(-dt*10)
  currentValue+=(targetValue-currentValue)*damping;currentPower+=(targetPower-currentPower)*damping
  let progress=reduced?1:clamp((now-start)/1550)
  if(progress===1&&queued!==null){const next=queued;queued=null;choose(next,now);progress=reduced?1:0}
  ctx!.clearRect(0,0,W,H);ctx!.drawImage(background,0,0,W,H)
  sprite(knob,Math.round(currentValue*(geometry.knobFrames-1)),7,regions[0])
  sprite(switches,Math.round(currentPower*(geometry.switchFrames-1)),6,regions[3])
  const p=ease(progress),cx=sphereCenter[from][0]+(sphereCenter[to][0]-sphereCenter[from][0])*p
  const cy=sphereCenter[to][1],dist=Math.hypot(mouseX-cx,mouseY-cy)
  hover+=((reduced?0:clamp(1-dist/(R*1.6)))-hover)*(1-Math.exp(-dt*5))
  const fromAlpha=from===to?1:1-p,toAlpha=from===to?0:p
  patch(from===0?shadow0:shadow1,regions[from+1],fromAlpha)
  if(toAlpha)patch(to===0?shadow0:shadow1,regions[to+1],toAlpha)
  while(waves.length&&now-waves[0]>2500)waves.shift()
  const waveStates=reduced?[]:waves.map(t=>({age:(now-t)/2400})).filter(w=>w.age>=0&&w.age<1)
  const rawEnergy=waveStates.reduce((sum,w)=>sum+Math.sin(w.age*Math.PI)**2,0)
  const energy=Math.min(1.3,rawEnergy),normalization=Math.max(1,rawEnergy/1.3)
  const t=reduced?0:now*.0005
  for(const d of dots){
   const travel=ease(clamp((progress-d.delay*.35)/.65)),flying=Math.sin(travel*Math.PI)
   const x0=sphereCenter[from][0]+(sphereCenter[to][0]-sphereCenter[from][0])*travel
   const wave=waveStates.reduce((sum,w)=>sum+Math.sin(w.age*Math.PI)**2*Math.exp(-Math.pow((d.r-w.age*1.3)/.16,2))*.065,0)/normalization
   const loose=hover*Math.pow(d.r,8)*(.4+d.delay*.6)
   const breathing=reduced?0:Math.sin(t+d.a*3)*.003
   const magnet=dist>R?ease(clamp(1-(dist-R)/(R*.8)))*hover:0
   const lobe=Math.pow(Math.max(0,Math.cos(d.a-Math.atan2(mouseY-cy,mouseX-cx))),10)*magnet*8*Math.pow(d.r,3)
   const radius=R*(.96+wave+energy*.016+breathing)+lobe
   const dx=d.x*radius*(1-flying*.26),dy=d.y*radius*.94*(1-flying*.5)
   const sway=reduced?0:Math.sin(t*1.5+d.phase)*.45
   const x=x0+dx+Math.cos(d.a)*loose*10+sway
   const y=cy+dy+Math.sin(d.a*3+travel*Math.PI*2)*flying*14+Math.sin(d.a)*loose*8+sway*.5
   // Sample the two physical renders in place; no invented silver gradient.
   if(wave<.001&&(travel===0||travel===1))ctx!.fillStyle=d.colors[travel===0?from:to]
   else {
    const shade=1+wave*1.1
    const red=Math.min(255,Math.round((d.rgb[from][0]*(1-travel)+d.rgb[to][0]*travel)*shade))
    const green=Math.min(255,Math.round((d.rgb[from][1]*(1-travel)+d.rgb[to][1]*travel)*shade))
    const blue=Math.min(255,Math.round((d.rgb[from][2]*(1-travel)+d.rgb[to][2]*travel)*shade))
    ctx!.fillStyle=`rgb(${red},${green},${blue})`
   }
   ctx!.globalAlpha=.86-loose*.2
   ctx!.beginPath();ctx!.arc(x,y,coarse?1.15:1.0,0,Math.PI*2);ctx!.fill()
  }
  // Keep the engraved labels unchanged until buried; then reveal fine particle glyphs.
  const reveal=reduced?1:ease(clamp((now-start-1800)/900))
  for(let index=0;index<2;index++){
   const active=index===to,departing=index===from&&from!==to
   const cover=active?ease(clamp((progress-.4)/.45)):departing?1-ease(clamp(progress/.75)):0
   const scale=1+(active?.10*reveal:0)
   const glyphOpacity=active?Math.max(1-cover,reveal):1-cover
   if(glyphOpacity<=0)continue
   ctx!.fillStyle=active&&reveal>0?'#34383a':'#878b8b'
   for(const g of glyphs[index]){
    const emerged=active&&reveal>0?ease(clamp((reveal*1.5-Math.hypot(g.x,g.y)/R*.65)/.35)):1
    ctx!.globalAlpha=g.a*glyphOpacity*emerged
    if(active&&reveal>0){
     const px=Math.max(0,Math.min(289,Math.round(sphereCenter[index][0]-regions[index+1][0]+g.x*scale)))
     const py=Math.max(0,Math.min(299,Math.round(cy-regions[index+1][1]+g.y*scale)))
     const at=(py*290+px)*4
     const luminance=(material[index][at]+material[index][at+1]+material[index][at+2])/3
     ctx!.fillStyle=luminance>135?'#303537':'#edf0ef'
    }
    ctx!.fillRect(sphereCenter[index][0]+g.x*scale,cy+g.y*scale,.86,.86)
   }
  }
  ctx!.globalAlpha=1
  if(!reduced||Math.abs(currentValue-targetValue)>.001||Math.abs(currentPower-targetPower)>.001)wake()
 }
 const onVisibility=()=>wake();document.addEventListener('visibilitychange',onVisibility);wake()
 return {
  value:value=>{targetValue=clamp(value/100);wake()},power:on=>{targetPower=on?0:1;wake()},
  mode:index=>{choose(index);wake()},pointer:(x,y)=>{mouseX=x;mouseY=y;wake()},
  dispose:()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',onVisibility)}
 }
}
