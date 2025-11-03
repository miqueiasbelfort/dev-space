import React, { useState, useRef, useEffect } from "react";
import "./Card.css";

interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

interface CardProps {
    children: React.ReactNode;
}

const randomPosition = () => {
    const width = 800;
    const height = 600;

    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;

    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);

    return { x, y };
  };

const Index = ({children}: CardProps) => {
    const [position, setPosition] = useState<Position>({ x: randomPosition().x, y: randomPosition().y });
    const [size, setSize] = useState<Size>({ width: 800, height: 600 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    
    const cardRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef<Position>({ x: 0, y: 0 });
    const resizeStartPos = useRef<Position>({ x: 0, y: 0 });
    const resizeStartSize = useRef<Size>({ width: 0, height: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
            target.classList.contains('resize-handle') ||
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'BUTTON' ||
            target.closest('input') ||
            target.closest('textarea') ||
            target.closest('button')
        ) {
            return;
        }
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        e.preventDefault();
    };

    const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
        setIsResizing(true);
        setResizeHandle(handle);
        resizeStartPos.current = { x: e.clientX, y: e.clientY };
        resizeStartSize.current = { ...size };
        e.preventDefault();
        e.stopPropagation();
    };

    // Global mouse move handler
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = e.clientX - dragStartPos.current.x;
                const newY = e.clientY - dragStartPos.current.y;
                
                // Constrain to viewport
                const maxX = window.innerWidth - size.width;
                const maxY = window.innerHeight - size.height;
                
                setPosition({
                    x: Math.max(0, Math.min(newX, maxX)),
                    y: Math.max(0, Math.min(newY, maxY))
                });
            } else if (isResizing && resizeHandle) {
                const deltaX = e.clientX - resizeStartPos.current.x;
                const deltaY = e.clientY - resizeStartPos.current.y;
                
                let newWidth = resizeStartSize.current.width;
                let newHeight = resizeStartSize.current.height;
                let newX = position.x;
                let newY = position.y;
                
                const minSize = 150;
                
                if (resizeHandle.includes('right')) {
                    newWidth = Math.max(minSize, resizeStartSize.current.width + deltaX);
                }
                if (resizeHandle.includes('left')) {
                    newWidth = Math.max(minSize, resizeStartSize.current.width - deltaX);
                    newX = position.x + (resizeStartSize.current.width - newWidth);
                }
                if (resizeHandle.includes('bottom')) {
                    newHeight = Math.max(minSize, resizeStartSize.current.height + deltaY);
                }
                if (resizeHandle.includes('top')) {
                    newHeight = Math.max(minSize, resizeStartSize.current.height - deltaY);
                    newY = position.y + (resizeStartSize.current.height - newHeight);
                }
                
                // Constrain to viewport
                if (newX < 0) {
                    newWidth += newX;
                    newX = 0;
                }
                if (newY < 0) {
                    newHeight += newY;
                    newY = 0;
                }
                if (newX + newWidth > window.innerWidth) {
                    newWidth = window.innerWidth - newX;
                }
                if (newY + newHeight > window.innerHeight) {
                    newHeight = window.innerHeight - newY;
                }
                
                setSize({ width: newWidth, height: newHeight });
                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setResizeHandle(null);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, resizeHandle, position, size]);

    return (
        <div
            ref={cardRef}
            className={`card ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="card-content">
                {children}
            </div>
            
            {/* Resize handles */}
            {/* <div className="resize-handle resize-handle-top" onMouseDown={(e) => handleResizeMouseDown(e, 'top')}></div> */}
            <div className="resize-handle resize-handle-right" onMouseDown={(e) => handleResizeMouseDown(e, 'right')}></div>
            <div className="resize-handle resize-handle-bottom" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}></div>
            {/* <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleResizeMouseDown(e, 'left')}></div> */}
            {/* <div className="resize-handle resize-handle-top-left" onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}></div> */}
            {/* <div className="resize-handle resize-handle-top-right" onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}></div> */}
            {/* <div className="resize-handle resize-handle-bottom-left" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}></div> */}
            <div className="resize-handle resize-handle-bottom-right" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}></div>
        </div>
    );
};

export default Index;