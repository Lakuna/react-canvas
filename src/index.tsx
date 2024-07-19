import {
	type CanvasHTMLAttributes,
	type DetailedHTMLProps,
	type JSX,
	useCallback,
	useEffect,
	useRef
} from "react";

/** The props that can be applied to a `ReactCanvas`. */
export interface ReactCanvasProps
	extends DetailedHTMLProps<
		CanvasHTMLAttributes<HTMLCanvasElement>,
		HTMLCanvasElement
	> {
	/** The initialization step, which is executed once when the animation starts. It should return a function representing the render step, which is executed once for every frame in the animation. */
	init: (canvas: HTMLCanvasElement) => FrameRequestCallback;
}

/**
 * A React canvas element with a built-in animation.
 * @param props - The properties to apply to the canvas.
 * @returns The canvas.
 */
export default function ReactCanvas({
	init,
	ref,
	...props
}: ReactCanvasProps): JSX.Element {
	// Disregard the passed `ref` so that it doesn't conflict with the built-in `canvas` ref.
	void ref;

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
