import {SitemapMappingWithUrl, SiteMapXML, SiteMapXMLEntry} from './types.js'
import {parseStringPromise, Builder} from 'xml2js'
import {promises as fs} from 'fs'

export async function readXMLFile(filePath: string): Promise<SiteMapXML> {
  const xmlContent = await fs.readFile(filePath, 'utf-8')
  return await parseStringPromise(xmlContent)
}

export function convertToXmlSitemap(
  sitemapObject: SitemapMappingWithUrl,
  filePath: string
) {
  const builder = new Builder({
    xmldec: {version: '1.0', encoding: 'UTF-8'},
    renderOpts: {pretty: true, indent: '  '}
  })

  const xmlObj: SiteMapXML = {
    urlset: {
      $: {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'xmlns:xhtml': 'http://www.w3.org/1999/xhtml'
      },
      url: Object.entries(sitemapObject).map(([path, data]) => {
        const url: SiteMapXMLEntry = {
          loc: [data.url]
        }

        if (data.alternates?.languages) {
          url['xhtml:link'] = Object.entries(data.alternates.languages).map(
            ([lang, href]) => ({
              $: {
                rel: 'alternate',
                hreflang: lang,
                href: `https://gnaumann.de${href}`
              }
            })
          )
        }

        if (data.lastModified) {
          url.lastmod = [
            data.lastModified instanceof Date
              ? data.lastModified.toISOString()
              : data.lastModified
          ]
        }

        if (data.changeFrequency) {
          url.changefreq = [data.changeFrequency.toLowerCase()]
        }

        if (data.priority) {
          url.priority = [data.priority.toString()]
        }

        return url
      })
    }
  }

  const xmlContent = builder.buildObject(xmlObj)
  fs.writeFile(filePath, xmlContent, 'utf-8')
}
