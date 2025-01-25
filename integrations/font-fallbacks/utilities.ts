import fs from 'fs'
import path from 'path'
import { createFontStack } from '@capsizecss/core'
import arial from '@capsizecss/metrics/arial'
import roboto from '@capsizecss/metrics/roboto'
import { fileURLToPath } from 'url'
import { fromFile } from '@capsizecss/unpack'
import type { Style } from 'util'

type Percentage = `${number}%`

type Override = 'normal' | Percentage

type FontArgs = {
	src: string
	ascentOverride?: Override
	descentOverride?: Override
	fontDisplay?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
	fontStretch?:
		| 'normal'
		| 'semi-condensed'
		| 'condensed'
		| 'extra-condensed'
		| 'ultra-condensed'
		| 'semi-expanded'
		| 'expanded'
		| 'extra-expanded'
		| 'ultra-expanded'
		| Percentage
	fontStyle?:
		| 'normal'
		| 'italic'
		| 'oblique'
		| `oblique ${number}deg`
		| `oblique ${number}deg ${number}deg`
	fontWeight?: number | string
	fontFeatureSettings?: string
	fontVariationSettings?: 'normal' | `${string} ${number}`
	lineGapOverride?: Override
	sizeAdjust?: Percentage
	unicodeRange?: string
}

export type Options = Record<string, string | FontArgs[]>

type Fonts = Record<string, FontArgs[]>

async function generateFallbackFontFace(fontName: string, values: FontArgs) {
	const { src } = values

	const font = await fromFile(src)

	font.familyName = fontName
	font.fullName = fontName

	// Default display to 'swap'
	if (!values.fontDisplay) values.fontDisplay = 'swap'

	const { fontFaces } = createFontStack([font, arial, roboto], {
		fontFaceProperties: values
	})

	return fontFaces
}

function generateFontFace(fontName: string, values: FontArgs) {
	const properties = {
		'font-family': `'${fontName}'`,
		src: `url('${values.src}')`,
		'ascent-override': values.ascentOverride,
		'descent-override': values.descentOverride,
		'font-display': values.fontDisplay ?? 'swap',
		'font-stretch': values.fontStretch,
		'font-style': values.fontStyle,
		'font-weight': values.fontWeight,
		'font-feature-settings': values.fontFeatureSettings,
		'font-variation-settings': values.fontVariationSettings,
		'line-gap-override': values.lineGapOverride,
		'size-adjust': values.sizeAdjust,
		'unicode-range': values.unicodeRange
	}

	const fontFace = Object.entries(properties)
		.filter(([, value]) => value !== undefined)
		.map(([key, value]) => `${key}: ${value};`)
		.join(' ')

	return `@font-face { ${fontFace} }`
}

async function generateCSS(fonts: Fonts) {
	let css = ''

	for (const [name, values] of Object.entries(fonts)) {
		for (const value of values) {
			const [fontFace, fallbackFontFace] = await Promise.all([
				generateFontFace(name, value),
				generateFallbackFontFace(name, value)
			])
			css += fontFace + fallbackFontFace
		}
	}

	return css
}

function formatOptionsIntoFonts(options: Options): Fonts {
	const fonts: Fonts = {}

	for (const [key, value] of Object.entries(options)) {
		if (typeof value === 'string') {
			const src = getFontFile(value)
			if (!src) throw new Error(`Font not found: ${value}`)
			fonts[key] = [{ src }]
		} else {
			fonts[key] = value.map((args) => {
				const fontPath = getFontFile(args.src)
				if (!fontPath) throw new Error(`Font not found: ${args.src}`)
				return { ...args, src: fontPath }
			})
		}
	}

	return fonts
}

async function createStylesheet(options: Options) {
	// throw an error if options is not of Options type

	const fonts = formatOptionsIntoFonts(options)

	const css = await generateCSS(fonts)
	const directory = path.dirname(fileURLToPath(import.meta.url))
	const filePath = path.join(directory, 'stylesheet.css')

	fs.writeFileSync(filePath, css)

	return filePath.replace(/\\/g, '/')
}

function getFontFile(fontPath: string) {
	// Construct absolute paths
	const relativePath = path.resolve(fontPath)
	const nodeModulePath = path.resolve('node_modules', fontPath)

	// Check if the paths exist
	if (fs.existsSync(relativePath)) return relativePath
	if (fs.existsSync(nodeModulePath)) return nodeModulePath

	return false
}

function deepValidateOptions(options: Options): boolean {
	// make sure options is an object
	if (typeof options !== 'object') {
		throw new Error('Font fallback options must be an object')
		return false
	}

	// make sure value is either a string, or an array that contains the src key
	for (const [key, value] of Object.entries(options)) {
		if (typeof value === 'string') continue
		if (!Array.isArray(value)) {
			throw new Error(
				`Font fallback value for ${key} must be a string or an array`
			)
			return false
		}
		if (!value.every((v) => typeof v === 'object' && 'src' in v)) {
			throw new Error(
				`Font fallback value for ${key} must be a string or an array of objects with a src key`
			)
			return false
		}
	}

	return true
}

export { createStylesheet, deepValidateOptions }
