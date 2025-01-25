import { fileURLToPath } from 'url'
import path from 'path'
import type { AstroIntegration } from 'astro'
import type { Animations } from './scripts'

const integration = (options: Animations): AstroIntegration => {
	return {
		name: 'font-fallbacks',
		hooks: {
			'astro:config:setup': async ({ injectScript }) => {
				const scriptsPath = new URL('./scripts.ts', import.meta.url)
					.pathname
				const stylesPath = new URL('./styles.css', import.meta.url)
					.pathname

				// Inject client-side script
				injectScript(
					'page',
					`
					import { MotionManager} from '${scriptsPath}';
					new MotionManager(${JSON.stringify(options)});
					`
				)

				// Inject styles
				injectScript('page-ssr', `import "${stylesPath}";`)
			}
		}
	}
}

export default integration
