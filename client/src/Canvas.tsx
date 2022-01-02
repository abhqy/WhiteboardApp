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
    const [penRadius, setPenRadius] = useState<number>(2);
    const [penColor, setPenColor] = useState<string>('black');
    // const [penRadius, setPenRadius] = useState<number>(3);
    // const [penColor, setPenColor] = useState<string>('black');

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

    socket.on('ondraw', ({ mouseCoordinates, newMouseCoordinates, projectedPenColor, projectedPenRadius }) => {
        if (canvasRef.current) {
            const canvas: HTMLCanvasElement = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                context.strokeStyle = projectedPenColor;
                context.lineJoin = 'round';
                context.lineWidth = projectedPenRadius;

                context.beginPath();
                context.moveTo(mouseCoordinates.x, mouseCoordinates.y);
                context.lineTo(newMouseCoordinates.x, newMouseCoordinates.y);
                context.closePath();

                context.stroke();
            }
        }
    })

    const draw = useCallback(
        (event: MouseEvent) => {
            if (isDrawing) {
                const newMouseCoordinates = getCoordinates(event);
                if (mouseCoordinates && newMouseCoordinates) {
                    // Delete this
                    socket.emit('draw', {
                        mouseCoordinates,
                        newMouseCoordinates,
                        projectedPenColor: penColor,
                        projectedPenRadius: penRadius
                    })
                    drawLine(mouseCoordinates, newMouseCoordinates);
                    setMouseCoordinates(newMouseCoordinates);
                }
            }
        },
        [isDrawing, mouseCoordinates, penColor, penRadius]
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
                context.strokeStyle = penColor;
                context.lineJoin = 'round';
                context.lineWidth = penRadius;

                context.beginPath();
                context.moveTo(originalMouseCoordinates.x, originalMouseCoordinates.y);
                context.lineTo(newMouseCoordinates.x, newMouseCoordinates.y);
                context.closePath();

                context.stroke();
            }
        }
    };

    return (
        <div>
            <button onClick={() => {
                setPenColor('white');
                setPenRadius(15);
            }}>Erase</button>
            <button onClick={() => {
                setPenColor('black');
                setPenRadius(2);
            }}>Draw</button>
            <canvas ref={canvasRef} height={props.height} width={props.width} />
        </div>
    );
};
