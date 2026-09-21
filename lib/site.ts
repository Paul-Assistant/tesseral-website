const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL
export const siteUrl = new URL(configuredUrl || 'https://tesseral-website-staging.vercel.app').origin
// Only the configured public production domain should enter search indexes.
export const isIndexable = process.env.VERCEL_ENV === 'production' && Boolean(configuredUrl) && !new URL(siteUrl).hostname.endsWith('.vercel.app')
export const siteTitle = 'Tesseral — AI brand knowledge for creative teams'
export const siteDescription = 'Connect files, links, and brand knowledge in one shared brain. Ask questions, create on-brand prompts, and give your team and AI agents up-to-date context.'
export const siteSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: 'Tesseral', url: siteUrl, logo: `${siteUrl}/icon.png`, parentOrganization: { '@type': 'Organization', name: 'Garcy s.r.o.', address: { '@type': 'PostalAddress', addressCountry: 'CZ' } } },
    { '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: 'Tesseral', url: siteUrl, inLanguage: 'en', publisher: { '@id': `${siteUrl}/#organization` } },
    { '@type': 'WebPage', '@id': `${siteUrl}/#webpage`, url: siteUrl, name: siteTitle, description: siteDescription, inLanguage: 'en', isPartOf: { '@id': `${siteUrl}/#website` }, about: { '@id': `${siteUrl}/#software` }, primaryImageOfPage: { '@type': 'ImageObject', url: `${siteUrl}/social-preview.jpg`, width: 1600, height: 934 } },
    { '@type': 'SoftwareApplication', '@id': `${siteUrl}/#software`, name: 'Tesseral', url: siteUrl, applicationCategory: 'BusinessApplication', operatingSystem: 'Web browser', description: siteDescription, publisher: { '@id': `${siteUrl}/#organization` }, featureList: ['Shared client and brand knowledge from files and links', 'Questions, brainstorming, pitches and presentations', 'Shared prompt library for images, video and copy', 'MCP connection for AI agents', 'Synced sources with manual refresh', 'Client collaboration for studios, agencies, freelancers and brands'] },
  ],
}
