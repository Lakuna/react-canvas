import {
	type CanvasHTMLAttributes,
	type DetailedHTMLProps,
	useCallback,
	useEffect,
	useRef
} from "react";

/**
 * A React canvas element with a built-in animation.
 * @param init - The initialization step, which is executed once when the animation starts. It should return a function representing the render step, which is executed once for every frame in the animation.
 * @param props - The properties to apply to the canvas.
 * @returns The canvas.
 */
export default function ReactCanvas(
	init: (canvas: HTMLCanvasElement) => FrameRequestCallback,
	props: DetailedHTMLProps<
		CanvasHTMLAttributes<HTMLCanvasElement>,
		HTMLCanvasElement
	>
) {
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
			return () => void null;
		}

		renderStep.current = init(canvas.current);
		requestAnimationFrame(tick);

		return () => {
			doDisableCanvas.current = true;
		};
	};

	useEffect(effectCallback, [init, tick]);

	return <canvas ref={canvas} {...props} />;
}
