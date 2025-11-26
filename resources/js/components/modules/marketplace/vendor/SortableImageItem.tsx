import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';

interface SortableImageItemProps {
    id: string;
    url: string;
    index: number;
    onRemove: (index: number) => void;
    isPrimary?: boolean;
}

export function SortableImageItem({ id, url, index, onRemove, isPrimary }: SortableImageItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group bg-white rounded-lg border overflow-hidden"
        >
            <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover"
            />
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 bg-white/80 p-1 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <GripVertical className="h-4 w-4 text-gray-600" />
            </div>
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
                <X className="h-3 w-3" />
            </button>
            {isPrimary && (
                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                    Primary
                </div>
            )}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                #{index + 1}
            </div>
        </div>
    );
}
