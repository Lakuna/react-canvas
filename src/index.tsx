import { type JSX, useCallback, useEffect, useRef } from "react";

/**
 * The props that can be applied to a `ReactCanvas`.
 * @public
 */
export interface ReactCanvasProps
	extends Omit<JSX.IntrinsicElements["canvas"], "ref"> {
	/** The initialization step, which is executed once when the animation starts. It should return a function representing the render step, which is executed once for every frame in the animation. */
	init: (canvas: HTMLCanvasElement) => FrameRequestCallback;
}

/**
 * A React canvas element with a built-in animation.
 * @param props - The properties to apply to the canvas.
 * @returns The canvas.
 * @public
 */
export default function ReactCanvas({
	init,
	...props
}: ReactCanvasProps): JSX.Element {
	const canvas = useRef(null as HTMLCanvasElement | null);
	const renderStep = useRef(null as FrameRequestCallback | null);
	const doDisableCanvas = useRef(false);

	const tick = useCallback((time: DOMHighResTimeStamp): void => {
		if (doDisableCanvas.current || renderStep.current === null) {
			return;
		}

		requestAnimationFrame(tick);
		renderStep.current(time);
	}, []);

	const effectCallback = () => {
		if (canvas.current === null) {
			return () => void 0;
		}

		renderStep.current = init(canvas.current);
		doDisableCanvas.current = false;
		requestAnimationFrame(tick);

		return () => {
			doDisableCanvas.current = true;
		};
	};

	useEffect(effectCallback, [init, tick]);

	return <canvas ref={canvas} {...props} />;
}
