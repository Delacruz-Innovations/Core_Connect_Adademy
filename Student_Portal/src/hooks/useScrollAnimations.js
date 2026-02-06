import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook for fade-in animations on scroll
 * @param {string} direction - 'up', 'down', 'left', 'right'
 * @param {number} duration - Animation duration in seconds
 * @param {number} delay - Animation delay in seconds
 */
export const useFadeInOnScroll = (direction = 'up', duration = 0.8, delay = 0) => {
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            const getInitialPosition = () => {
                switch (direction) {
                    case 'up': return { y: 50, x: 0 };
                    case 'down': return { y: -50, x: 0 };
                    case 'left': return { x: 50, y: 0 };
                    case 'right': return { x: -50, y: 0 };
                    default: return { y: 50, x: 0 };
                }
            };

            const initialPos = getInitialPosition();

            gsap.fromTo(
                element,
                {
                    opacity: 0,
                    ...initialPos,
                },
                {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    duration,
                    delay,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        }, element);

        return () => ctx.revert();
    }, [direction, duration, delay]);

    return ref;
};

/**
 * Hook for scale-in animations on scroll
 */
export const useScaleInOnScroll = (duration = 0.6, delay = 0) => {
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                element,
                {
                    opacity: 0,
                    scale: 0.8,
                },
                {
                    opacity: 1,
                    scale: 1,
                    duration,
                    delay,
                    ease: 'back.out(1.4)',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        }, element);

        return () => ctx.revert();
    }, [duration, delay]);

    return ref;
};

/**
 * Hook for stagger animations (children animate one by one)
 */
export const useStaggerOnScroll = (staggerDelay = 0.1) => {
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const ctx = gsap.context(() => {
            const children = element.children;

            gsap.fromTo(
                children,
                {
                    opacity: 0,
                    y: 30,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: staggerDelay,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        }, element);

        return () => ctx.revert();
    }, [staggerDelay]);

    return ref;
};
