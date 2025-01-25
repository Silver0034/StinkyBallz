import { animate } from 'motion/mini'
import { inView, spring, stagger } from 'motion'
import type { AnimationOptions, AnimationGeneratorType } from 'motion/react'
import defaultAnimations from './animations.json'

type KeyframeStyles = {
	[K in Exclude<keyof CSSStyleDeclaration, number>]?: (string | number)[]
}

export type Animations = {
	[key: string]: KeyframeStyles
}

type InViewOptions = {
	amount: number
}

type Styles = {
	[key in 'transform' | 'opacity']?: string | number
}

export class MotionManager {
	#animationAttribute: string
	#animations: Animations
	#bounce: number
	#bounceAttribute: string
	#delay: number
	#delayAttribute: string
	#duration: number
	#durationAttribute: string
	#idCounter: number = 0
	#optionsInView: InViewOptions
	#staggerAttribute: string
	#staggerDelay: number
	#targets: NodeListOf<HTMLElement>
	#type: AnimationGeneratorType

	constructor(animations: Animations) {
		this.#animations = { ...defaultAnimations, ...animations }

		this.#animationAttribute = 'data-motion'
		this.#bounce = 0.3
		this.#bounceAttribute = 'data-motion-bounce'
		this.#delay = 0
		this.#delayAttribute = 'data-motion-delay'
		this.#duration = 0.8
		this.#durationAttribute = 'data-motion-duration'
		this.#optionsInView = {
			amount: 0.5
		}
		this.#staggerDelay = 0.1
		this.#staggerAttribute = 'data-motion-stagger'
		this.#targets = document.querySelectorAll(
			`[${this.#animationAttribute}]`
		)
		this.#type = spring

		if (!this.#targets.length) return

		// Set default styles for each element
		this.#targets.forEach(this.#setStylesOnElementsOutsideView)

		// Animate elements when they are in view
		this.#targets.forEach(this.#setScrollListener)
	}

	set delay(delay: number) {
		this.#delay = delay
	}

	set optionsInView(value: InViewOptions) {
		this.#optionsInView = value
	}

	set staggerDelay(value: number) {
		this.#staggerDelay = value
	}

	#createAnimationOptions = (target: Element): AnimationOptions => {
		const delay = this.#getAnimationDelay(target)

		const shouldStagger = this.#shouldAnimationStagger(target)

		const bounceValue = target.getAttribute(this.#bounceAttribute)
		const bounce = bounceValue ? Number(bounceValue) : this.#bounce

		const durationValue = target.getAttribute(this.#durationAttribute)
		console.log({ durationValue })
		const duration = durationValue ? Number(durationValue) : this.#duration

		return {
			delay: shouldStagger
				? stagger(delay === 0 ? this.#staggerDelay : delay)
				: delay,
			type: this.#type,
			bounce: bounce,
			duration: duration
		}
	}

	#getAnimationDelay = (target: Element) => {
		return Number(target.getAttribute(this.#delayAttribute)) ?? this.#delay
	}

	#getAnimationName = (target: Element) => {
		return target.getAttribute(this.#animationAttribute) ?? ''
	}

	#getAnimationTarget = (target: Element) => {
		if (target.getAttribute(this.#staggerAttribute)) {
			target.setAttribute('data-motion-id', String(this.#idCounter++))
			return `[data-motion-id="${target.getAttribute('data-motion-id')}"] .motion-stagger`
		}
		return target
	}

	#getStartingStyles = (target: Element): Styles | void => {
		const animationName = this.#getAnimationName(target)
		const styles = this.#animations[animationName]
		if (!this.#animations[animationName] || !styles) return

		return Object.fromEntries(
			Object.entries(styles).map(([key, values]) => [key, values[0]])
		)
	}

	#inViewCallback = (observerEntry: IntersectionObserverEntry) => {
		const { target } = observerEntry

		// If the animation is not valid, stop
		const animationName = this.#getAnimationName(target)
		if (!this.#animations[animationName]) return

		const animationTarget = this.#getAnimationTarget(target)
		const options = this.#createAnimationOptions(target)
		console.log({ options })

		animate(animationTarget, this.#animations[animationName], options)
	}

	#setDefaultStylesOnElement = async (
		element: HTMLElement,
		styles: Styles
	) => {
		element.setAttribute(
			'style',
			[
				element.getAttribute('style') ?? '',
				...Object.entries(styles).map(
					([key, value]) => `${key}:${value}`
				)
			]
				.filter(Boolean)
				.join(';')
		)
	}

	#setScrollListener = (element: Element) => {
		inView(element, this.#inViewCallback, this.#optionsInView)
	}

	#setStylesOnElementsOutsideView = (element: HTMLElement) => {
		const { amount } = this.#optionsInView
		const styles = this.#getStartingStyles(element)
		if (!styles) return

		const observer = new IntersectionObserver(
			([entry]) => {
				observer.disconnect()
				if (entry.intersectionRatio >= amount) return

				if (!this.#shouldAnimationStagger(element)) {
					this.#setDefaultStylesOnElement(element, styles)
					return
				}
				// Get all elements that should be staggered
				const selector = element.getAttribute(this.#staggerAttribute)
				if (!selector) return
				element.querySelectorAll(selector).forEach((target) => {
					this.#setDefaultStylesOnElement(
						target as HTMLElement,
						styles
					)
				})
			},
			{ threshold: [amount] }
		)

		observer.observe(element)
	}

	#shouldAnimationStagger = (target: Element) => {
		return target.hasAttribute(this.#staggerAttribute)
	}
}
