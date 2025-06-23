import * as esbuild from 'esbuild'
import * as path from 'path'
import * as fs from 'fs'
import {
  Commit,
  Context,
  SitemapFile,
  SitemapMapping,
  SitemapMappingWithUrl
} from './types.js'
import {readXMLFile} from './xml.js'

export async function importTsDefault(tsFile: string) {
  const absPath = path.resolve(process.cwd(), tsFile)
  const outFile = absPath.replace(/\.ts$/, '.sitemap-tmp.js')

  await esbuild.build({
    entryPoints: [absPath],
    outfile: outFile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: ['node22'],
    sourcemap: false,
    write: true
  })

  const {default: fn} = await import(`file://${outFile}`)
  fs.unlinkSync(outFile)
  return fn
}

export async function getSitemap(lib: string) {
  const generateSitemapFn = await importTsDefault(lib)
  const sitemapEntries = (await generateSitemapFn()) as SitemapFile

  return sitemapEntries.reduce((acc, entry) => {
    acc[entry.url] = {
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: entry.alternates
    }
    return acc
  }, {} as SitemapMapping)
}

export async function mergeSitemapWithXml(
  updatedSitemap: SitemapMapping,
  xmlPath: string
) {
  const xmlContent = await readXMLFile(xmlPath)

  const existingData: Record<string, Date> = {}
  const urlMap: Record<string, string> = {}
  xmlContent.urlset.url.forEach(entry => {
    if (!entry.loc) return
    const loc = entry.loc[0]
    const path = loc.replace(/^https?:\/\/[^\/]+/, '')
    urlMap[path] = loc
    if (entry.lastmod) {
      existingData[path] = new Date(entry.lastmod[0])
    }
  })

  return Object.entries(updatedSitemap).reduce((acc, [path, data]) => {
    acc[path] = {
      ...data,
      url: urlMap[path],
      lastModified: data.lastModified || existingData[path]
    }
    return acc
  }, {} as SitemapMappingWithUrl)
}

export function updateSitemapWithDates(
  sitemapData: SitemapMapping,
  pathDates: Record<string, string>
) {
  const patterns = Object.keys(pathDates).map(pattern => ({
    regex:
      pattern === '*'
        ? new RegExp('^.*$')
        : new RegExp(
            '^' +
              pattern
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                .replace('\\*', '[^/]*') +
              '$'
          ),
    date: pathDates[pattern]
  }))

  return Object.entries(sitemapData).reduce((acc, [url, data]) => {
    acc[url] = {...data}

    for (const {regex, date} of patterns) {
      if (regex.test(url)) {
        acc[url].lastModified = date
        break
      }
    }

    return acc
  }, {} as SitemapMapping)
}

export function extractSitemapDates(
  commits: Commit[],
  logger: Context['logger']
) {
  const pathDates: Record<string, string> = {}
  const sitemapRegex = /sitemap:\s*([a-zA-Z0-9/_\-,*]+)/i

  for (const commit of commits) {
    if (!commit.body) continue
    const match = sitemapRegex.exec(commit.body)
    if (!match) continue

    const paths = match[1].split(',').map(s => s.trim())
    for (const path of paths) {
      const date =
        commit.committerDate || commit.authorDate || new Date().toISOString()

      if (!pathDates[path] || new Date(date) > new Date(pathDates[path])) {
        logger.log(`Found date for path "${path}": ${date}`)
        pathDates[path] = date
      }
    }
  }

  return pathDates
}
