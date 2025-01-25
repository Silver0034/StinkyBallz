import { z, defineCollection } from 'astro:content'
import { glob, file } from 'astro/loaders'

const partners = defineCollection({
	loader: file('src/data/partners.json'),
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			image: image()
		})
})

export const collections = {
	partners
}
