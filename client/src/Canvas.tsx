import React, { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080');

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

    socket.on('ondraw', ({ mouseCoordinates, newMouseCoordinates }) => {
        drawLine(mouseCoordinates, newMouseCoordinates);
        setMouseCoordinates(newMouseCoordinates);
    })

    const draw = useCallback(
        (event: MouseEvent) => {
            if (isDrawing) {
                const newMouseCoordinates = getCoordinates(event);
                if (mouseCoordinates && newMouseCoordinates) {
                    // Delete this
                    socket.emit('draw', {
                        mouseCoordinates,
                        newMouseCoordinates
                    })
                    drawLine(mouseCoordinates, newMouseCoordinates);
                    setMouseCoordinates(newMouseCoordinates);
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

    const drawLine = (originalMouseCoordinates: ICoordinate, newMouseCoordinates: ICoordinate) => {
        if (canvasRef.current) {
            const canvas: HTMLCanvasElement = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                context.strokeStyle = 'black';
                context.lineJoin = 'round';
                context.lineWidth = 2;

                context.beginPath();
                context.moveTo(originalMouseCoordinates.x, originalMouseCoordinates.y);
                context.lineTo(newMouseCoordinates.x, newMouseCoordinates.y);
                context.closePath();

                context.stroke();
            }
        }
    };

    return <canvas ref={canvasRef} height={props.height} width={props.width} />;
};
