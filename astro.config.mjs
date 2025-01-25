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
			Anton: '@fontsource/anton/files/anton-latin-400-normal.woff2',
			Inter: [
				{
					src: '@fontsource/inter/files/inter-latin-400-normal.woff2',
					fontWeight: 400,
					fontStyle: 'normal'
				},
				{
					src: '@fontsource/inter/files/inter-latin-700-normal.woff2',
					fontWeight: 700,
					fontStyle: 'normal'
				}
			]
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
