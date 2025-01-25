// Exported to be defined globally in vite in astro.config.mjs

// Must also be updated in global.d.ts for editor to recognize variables

// The keys will be set as the global variable name `City is ${ADDRESS_CITY}`

const constants = {
	AUTHOR: 'Jacob Lodes',
	ORIGIN: 'https://localhost:4321',
	SITE_NAME: 'Astro Launchpad'
}

const stringifyValues = (obj: Record<string, any>): Record<string, string> => {
	const result: Record<string, string> = {}
	for (const [key, value] of Object.entries(obj)) {
		result[key] = JSON.stringify(value)
	}
	return result
}

const escapedConstants = stringifyValues(constants)

export { constants, escapedConstants }
