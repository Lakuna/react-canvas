import {
	useEffect,
	useRef,
	type DetailedHTMLProps,
	type CanvasHTMLAttributes,
	type MutableRefObject,
	useCallback,
	type JSX,
	type EffectCallback,
	default as React
} from "react";

/**
 * A React canvas element with a built-in animation.
 * @param initializationStep The initialization step, which is executed once when the animation starts. It should return a function representing the render step, which is executed once for every frame in the animation.
 * @param properties The properties to apply to the canvas.
 * @returns The canvas.
 */
export default function ReactCanvas(
	initializationStep: (canvas: HTMLCanvasElement) => FrameRequestCallback,
	properties: DetailedHTMLProps<
		CanvasHTMLAttributes<HTMLCanvasElement>,
		HTMLCanvasElement
	>
): JSX.Element {
	const canvas: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
	const renderStep: MutableRefObject<((now: number) => void) | null> =
		useRef(null);
	const doDisableCanvas: MutableRefObject<boolean> = useRef(false);

	const tick: FrameRequestCallback = useCallback((now: number): void => {
		if (doDisableCanvas.current) {
			return;
		}

		if (!renderStep.current) {
			return;
		}

		requestAnimationFrame(tick);
		renderStep.current(now);
	}, []);

	const effectCallback: EffectCallback = (): void | (() => void) => {
		if (!canvas.current) {
			return;
		}

		renderStep.current = initializationStep(canvas.current);
		requestAnimationFrame(tick);

		return (): void => {
			doDisableCanvas.current = true;
		};
	};

	useEffect(effectCallback, [initializationStep, tick]);

	return <canvas ref={canvas} {...properties} />;
}
