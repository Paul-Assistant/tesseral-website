'use client'
import PhotographicSky from './PhotographicSky'
import './retro-mood.css'
const moods=[['original','Original','The current soft, abstract atmosphere.'],['atlas','Silver atlas','Monochrome star charts, etched planetary rings and aged photographic grain.'],['eclipse','Lime eclipse','A huge eclipsed sun, faded olive light and a dark paper sky.'],['observatory','Lost observatory','A faded monochrome exposure: silver haze, soft horizons and scanned-film grain.']] as const
export default function RetroMood({mood,onMood}:{mood:string;onMood:(value:string)=>void}){
 return <><div className="mood-panel"><div className="mood-options" role="group" aria-label="Background mood">{moods.map(([id,label])=><button key={id} type="button" aria-pressed={mood===id} onClick={()=>onMood(id)}>{label}</button>)}</div><div className="mood-caption"><span>{moods.find(m=>m[0]===mood)?.[2]}</span></div></div>
 <div className="retro-world" aria-hidden="true"><PhotographicSky/><div className="retro-orb"/><div className="retro-ring"/><div className="retro-nebula"/><div className="retro-land"/><div className="retro-print"/></div>
 </>
}
