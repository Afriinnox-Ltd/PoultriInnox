import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileText, AlertCircle } from 'lucide-react';

interface FileUploadCardProps {
    title: string;
    description: string;
    templateType: string;
    onUpload: (file: File, replaceExisting: boolean) => void;
    onDownloadTemplate: () => void;
    isUploading: boolean;
    sampleColumns: string[];
}

export default function FileUploadCard({
    title,
    description,
    templateType,
    onUpload,
    onDownloadTemplate,
    isUploading,
    sampleColumns
}: FileUploadCardProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [replaceExisting, setReplaceExisting] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setSelectedFile(file);
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            onUpload(selectedFile, replaceExisting);
        }
    };

    const resetFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Sample Columns Info */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Expected CSV columns:</strong> {sampleColumns.join(', ')}
                    </AlertDescription>
                </Alert>

                {/* Download Template Button */}
                <div className="flex justify-start">
                    <Button
                        variant="outline"
                        onClick={onDownloadTemplate}
                        className="flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Download Template
                    </Button>
                </div>

                {/* File Upload Area */}
                <div
                    className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
                        dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <div className="text-center">
                        {selectedFile ? (
                            <div className="space-y-2">
                                <FileText className="h-8 w-8 mx-auto text-emerald-500" />
                                <p className="text-sm font-medium">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        resetFile();
                                    }}
                                >
                                    Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                                <p className="text-sm font-medium">
                                    Drop CSV file here or click to browse
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Only CSV files are supported
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload Options */}
                {selectedFile && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={`replace-${templateType}`}
                                checked={replaceExisting}
                                onCheckedChange={(checked) => setReplaceExisting(checked as boolean)}
                            />
                            <label
                                htmlFor={`replace-${templateType}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Replace existing data
                            </label>
                        </div>

                        {replaceExisting && (
                            <Alert className="border-yellow-200 bg-yellow-50">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <AlertDescription className="text-yellow-800">
                                    Warning: This will delete all existing {templateType.replace('-', ' ')} data before importing new data.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="w-full"
                        >
                            {isUploading ? (
                                <>Uploading...</>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload {title}
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
