import HomeExperience from '@/components/HomeExperience'
import { siteSchema } from '@/lib/site'

export default function Home() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema).replace(/</g, '\\u003c') }} />
    <HomeExperience />
  </>
}
