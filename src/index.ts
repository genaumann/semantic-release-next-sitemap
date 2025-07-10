import {Context, PluginConfig} from './types.js'
import {
  extractSitemapDates,
  getSitemap,
  mergeSitemapWithXml,
  updateSitemapWithDates
} from './utils.js'
import {convertToXmlSitemap} from './xml.js'

const plugin = {
  async analyzeCommits(pluginConfig: PluginConfig, context: Context) {
    const {commits, logger} = context
    const toolDates = extractSitemapDates(commits, logger)
    const sitemap = await getSitemap(pluginConfig.sitemapFunction)
    const updatedSitemap = updateSitemapWithDates(sitemap, toolDates)

    const finalSitemap = await mergeSitemapWithXml(
      updatedSitemap,
      pluginConfig.sitemapPath,
      pluginConfig.sitemapBaseUrl
    )

    convertToXmlSitemap(finalSitemap, pluginConfig.sitemapPath)
  }
}

export default plugin
