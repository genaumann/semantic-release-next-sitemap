export type Commit = {
  body: string | null
  committerDate?: string
  authorDate?: string
}

export type Context = {
  commits: Commit[]
  logger: {
    log: (message: string) => void
  }
}

export type PluginConfig = {
  sitemapPath: string
  sitemapFunction: string
  sitemapBaseUrl: string
}

type Restriction = {
  relationship: 'allow' | 'deny'
  content: string
}

type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'
  | undefined

type Videos = {
  title: string
  thumbnail_loc: string
  description: string
  content_loc?: string | undefined
  player_loc?: string | undefined
  duration?: number | undefined
  expiration_date?: Date | string | undefined
  rating?: number | undefined
  view_count?: number | undefined
  publication_date?: Date | string | undefined
  family_friendly?: 'yes' | 'no' | undefined
  restriction?: Restriction | undefined
  platform?: Restriction | undefined
  requires_subscription?: 'yes' | 'no' | undefined
  uploader?:
    | {
        info?: string | undefined
        content?: string | undefined
      }
    | undefined
  live?: 'yes' | 'no' | undefined
  tag?: string | undefined
}

export type SitemapFile = Array<{
  url: string
  lastModified?: string | Date | undefined
  changeFrequency?: ChangeFrequency
  priority?: number | undefined
  alternates?:
    | {
        languages?: string | undefined
      }
    | undefined
  images?: string[] | undefined
  videos?: Videos[] | undefined
}>

export type SitemapMapping = Record<string, Omit<SitemapFile[0], 'url'>>
export type SitemapMappingWithUrl = Record<string, SitemapFile[0]>

export type SiteMapXMLEntry = {
  lastmod?: string[]
  changefreq?: string[]
  priority?: string[]
  loc?: string[]
  'xhtml:link'?: {
    $: {
      rel: string
      hreflang: string
      href: string
    }
  }[]
}

export type SiteMapXML = {
  urlset: {
    $: {
      xmlns: string
      'xmlns:xhtml': string
    }
    url: SiteMapXMLEntry[]
  }
}
