import { escapedConstants } from './constants'
import { defineConfig } from 'astro/config'
import fontFallbacks from './integrations/font-fallbacks'
import motion from './integrations/motion'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

import icon from 'astro-icon'

// https://astro.build/config
export default defineConfig({
	integrations: [
		fontFallbacks({
			Gabarito:
				'@fontsource/gabarito/files/gabarito-latin-400-normal.woff2',
			'Lilita One':
				'@fontsource/lilita-one/files/lilita-one-latin-400-normal.woff2'
		}),
		sitemap(),
		mdx(),
		motion(),
		icon({
			include: {
				fluent: ['skip-forward-tab-24-filled']
			}
		})
	],
	vite: {
		define: {
			...escapedConstants
		}
	}
})
