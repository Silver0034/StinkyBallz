import { createStylesheet, deepValidateOptions } from './utilities'
import type { Options } from './utilities'
import type { AstroIntegration } from 'astro'

const integration = (options: Options): AstroIntegration => {
	return {
		name: 'font-fallbacks',
		hooks: {
			'astro:config:setup': async ({ isRestart, injectScript }) => {
				// Stop if not initial setup
				if (isRestart) return

				if (!deepValidateOptions(options)) return

				const stylesheetPath = await createStylesheet(options)

				injectScript('page-ssr', `import "${stylesheetPath}";`)
			}
		}
	}
}

export default integration
