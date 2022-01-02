import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ICanvasProps {
    width: number;
    height: number;
}

interface ICoordinate {
    x: number;
    y: number;
};

export const Canvas: React.FC<ICanvasProps> = (props: ICanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [mouseCoordinates, setMouseCoordinates] = useState<ICoordinate | undefined>(undefined);

    const startDrawing = useCallback((event: MouseEvent) => {
        const coordinates = getCoordinates(event);
        if (coordinates) {
            setMouseCoordinates(coordinates);
            setIsDrawing(true);
        }
    }, []);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas: HTMLCanvasElement = canvasRef.current;
            canvas.addEventListener('mousedown', startDrawing);
            return () => {
                canvas.removeEventListener('mousedown', startDrawing);
            };
        }
    }, [startDrawing]);

    useEffect(() => {
        console.log(mouseCoordinates);
    }, [startDrawing, mouseCoordinates, isDrawing]);

    const draw = useCallback(
        (event: MouseEvent) => {
            if (isDrawing) {
                const newMousePosition = getCoordinates(event);
                if (mouseCoordinates && newMousePosition) {
                    drawLine(mouseCoordinates, newMousePosition);
                    setMouseCoordinates(newMousePosition);
                }
            }
        },
        [isDrawing, mouseCoordinates]
    );

    useEffect(() => {
        if (canvasRef.current) {
            const canvas: HTMLCanvasElement = canvasRef.current;
            canvas.addEventListener('mousemove', draw);
            return () => {
                canvas.removeEventListener('mousemove', draw);
            };
        }
    }, [draw]);

    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
        setMouseCoordinates(undefined);
    }, []);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas: HTMLCanvasElement = canvasRef.current;
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseleave', stopDrawing);
            return () => {
                canvas.removeEventListener('mouseup', stopDrawing);
                canvas.removeEventListener('mouseleave', stopDrawing);
            };
        }
    }, [stopDrawing]);

    const getCoordinates = (event: MouseEvent): ICoordinate | undefined => {
        if (canvasRef.current) {
            const canvas: HTMLCanvasElement = canvasRef.current;
            return {
                x: event.pageX - canvas.offsetLeft,
                y: event.pageY - canvas.offsetTop
            };
        }
    };

    const drawLine = (originalMousePosition: ICoordinate, newMousePosition: ICoordinate) => {
        if (canvasRef.current) {
            const canvas: HTMLCanvasElement = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                context.strokeStyle = 'black';
                context.lineJoin = 'round';
                context.lineWidth = 2;

                context.beginPath();
                context.moveTo(originalMousePosition.x, originalMousePosition.y);
                context.lineTo(newMousePosition.x, newMousePosition.y);
                context.closePath();

                context.stroke();
            }
        }
    };

    return <canvas ref={canvasRef} height={props.height} width={props.width} />;
};
