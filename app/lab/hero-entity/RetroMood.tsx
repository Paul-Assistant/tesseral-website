'use client'
import PhotographicSky from './PhotographicSky'
import './retro-mood.css'
const moods=[['original','Original','The current soft, abstract atmosphere.'],['observatory','Lost observatory','Fine film grain, distant stars and a faded monochrome horizon.']] as const
export default function RetroMood({mood,onMood}:{mood:string;onMood:(value:string)=>void}){
 return <><div className="mood-panel"><div className="mood-options" role="group" aria-label="Background mood">{moods.map(([id,label])=><button key={id} type="button" aria-pressed={mood===id} onClick={()=>onMood(id)}>{label}</button>)}</div><div className="mood-caption"><span>{moods.find(m=>m[0]===mood)?.[2]}</span></div></div>
 <div className="retro-world" aria-hidden="true"><PhotographicSky/><div className="retro-orb"/><div className="retro-ring"/><div className="retro-nebula"/><div className="retro-land"/><div className="retro-print"/></div>
 </>
}
