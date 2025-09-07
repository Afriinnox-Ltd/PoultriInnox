import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
    Upload, 
    File, 
    CheckCircle, 
    AlertCircle, 
    X, 
    Download,
    FileText,
    Eye,
    Pill,
    Syringe,
    ChevronLeft
} from 'lucide-react';

interface UploadResult {
    success: boolean;
    message: string;
    errors?: string[];
    imported_count?: number;
    failed_count?: number;
    failed_rows?: Array<{
        row: number;
        errors: string[];
        data: any;
    }>;
}

interface ProtocolUploadProps {
    type: 'medication' | 'vaccination';
    flash?: {
        success?: string;
        error?: string;
    };
}

const ProtocolUpload: React.FC<ProtocolUploadProps> = ({ type, flash }) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const protocolTypeTitle = type === 'medication' ? 'Medication' : 'Vaccination';
    const protocolIcon = type === 'medication' ? Pill : Syringe;
    const ProtocolIcon = protocolIcon;

    const acceptedFileTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
    ];

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileSelect = (file: File) => {
        // Validate file type
        if (!acceptedFileTypes.includes(file.type) && !file.name.endsWith('.csv')) {
            setUploadResult({
                success: false,
                message: 'Invalid file type. Please upload a CSV or Excel file.',
                errors: ['Only CSV and Excel files are supported']
            });
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setUploadResult({
                success: false,
                message: 'File too large. Please upload a file smaller than 10MB.',
                errors: ['File size exceeds 10MB limit']
            });
            return;
        }

        setSelectedFile(file);
        setUploadResult(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setUploadProgress(0);
        setUploadResult(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            const response = await fetch(`/admin/smart-scheduling/protocols/${type}/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            const result = await response.json();
            
            if (response.ok) {
                setUploadResult({
                    success: true,
                    message: result.message || `Successfully imported ${result.imported_count || 0} ${type} protocols`,
                    imported_count: result.imported_count,
                    failed_count: result.failed_count,
                    failed_rows: result.failed_rows
                });
                
                // Clear the selected file after successful upload
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                setUploadResult({
                    success: false,
                    message: result.message || 'Upload failed',
                    errors: result.errors || ['Unknown error occurred'],
                    failed_count: result.failed_count,
                    failed_rows: result.failed_rows
                });
            }
        } catch (error) {
            setUploadResult({
                success: false,
                message: 'Network error occurred during upload',
                errors: ['Please check your connection and try again']
            });
        } finally {
            setUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setUploadResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const downloadTemplate = () => {
        window.open(`/admin/smart-scheduling/protocols/${type}/template`, '_blank');
    };

    const downloadFailedRows = () => {
        if (!uploadResult?.failed_rows) return;
        
        const csv = [
            'Row,Errors,Data',
            ...uploadResult.failed_rows.map(row => 
                `${row.row},"${row.errors.join('; ')}","${JSON.stringify(row.data).replace(/"/g, '""')}"`
            )
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `failed-${type}-imports.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <AdminLayout>
            <Head title={`Upload ${protocolTypeTitle} Protocols`} />

            <div className="space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center space-x-4">
                    <Button asChild variant="outline">
                        <Link href="/admin/smart-scheduling">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back to Protocols
                        </Link>
                    </Button>
                    <div className="flex items-center space-x-3">
                        <ProtocolIcon className="h-8 w-8 text-indigo-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Upload {protocolTypeTitle} Protocols</h1>
                            <p className="text-gray-600">Bulk import {type} protocols from CSV or Excel files</p>
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                            {flash.error}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upload Area */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Upload className="h-5 w-5" />
                                    <span>Upload File</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* File Drop Zone */}
                                <div
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                        dragOver
                                            ? 'border-indigo-400 bg-indigo-50'
                                            : selectedFile
                                            ? 'border-green-400 bg-green-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {selectedFile ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-center">
                                                <File className="h-12 w-12 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-medium text-green-700">{selectedFile.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={clearFile}
                                                className="mt-2"
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-center">
                                                <Upload className="h-12 w-12 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-medium text-gray-700">
                                                    Drop your file here, or{' '}
                                                    <button
                                                        type="button"
                                                        className="text-indigo-600 hover:text-indigo-500"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        browse
                                                    </button>
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Supports CSV and Excel files up to 10MB
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileInputChange}
                                    accept=".csv,.xlsx,.xls"
                                    className="hidden"
                                />

                                {/* Upload Progress */}
                                {uploading && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <Progress value={uploadProgress} className="h-2" />
                                    </div>
                                )}

                                {/* Upload Button */}
                                <div className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={downloadTemplate}
                                        className="flex items-center space-x-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>Download Template</span>
                                    </Button>
                                    
                                    <Button
                                        onClick={handleUpload}
                                        disabled={!selectedFile || uploading}
                                        className="flex items-center space-x-2"
                                    >
                                        <Upload className="h-4 w-4" />
                                        <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upload Results */}
                        {uploadResult && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        {uploadResult.success ? (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                        )}
                                        <span>Upload Results</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <Alert className={uploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                                            <AlertDescription className={uploadResult.success ? 'text-green-700' : 'text-red-700'}>
                                                {uploadResult.message}
                                            </AlertDescription>
                                        </Alert>

                                        {uploadResult.success && uploadResult.imported_count !== undefined && (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h4 className="font-medium text-gray-900 mb-2">Import Summary</h4>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Successfully imported:</span>
                                                        <span className="ml-2 font-medium text-green-600">
                                                            {uploadResult.imported_count} protocols
                                                        </span>
                                                    </div>
                                                    {uploadResult.failed_count !== undefined && uploadResult.failed_count > 0 && (
                                                        <div>
                                                            <span className="text-gray-500">Failed to import:</span>
                                                            <span className="ml-2 font-medium text-red-600">
                                                                {uploadResult.failed_count} protocols
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {uploadResult.failed_rows && uploadResult.failed_rows.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium text-red-700">Failed Imports</h4>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={downloadFailedRows}
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download Failed Rows
                                                    </Button>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto border rounded-lg">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="text-left p-2">Row</th>
                                                                <th className="text-left p-2">Errors</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {uploadResult.failed_rows.map((row, index) => (
                                                                <tr key={index} className="border-t">
                                                                    <td className="p-2 font-medium">{row.row}</td>
                                                                    <td className="p-2 text-red-600">
                                                                        {row.errors.join(', ')}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {uploadResult.errors && uploadResult.errors.length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="font-medium text-red-700">Errors</h4>
                                                <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                                                    {uploadResult.errors.map((error, index) => (
                                                        <li key={index}>{error}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {uploadResult.success && (
                                            <div className="flex justify-end">
                                                <Button asChild>
                                                    <Link href="/admin/smart-scheduling">
                                                        View Protocols
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Instructions Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5" />
                                    <span>File Format</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Supported Formats</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• CSV (.csv)</li>
                                        <li>• Excel (.xlsx, .xls)</li>
                                        <li>• Maximum file size: 10MB</li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Required Columns</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {type === 'medication' ? (
                                            <>
                                                <li>• medication_name</li>
                                                <li>• medication_type</li>
                                                <li>• dosage</li>
                                                <li>• administration_method</li>
                                                <li>• target_disease (optional)</li>
                                                <li>• side_effects (optional)</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>• vaccine_name</li>
                                                <li>• prevents_disease</li>
                                                <li>• administration_method</li>
                                                <li>• recommended_age_days</li>
                                                <li>• priority_level</li>
                                                <li>• is_mandatory (true/false)</li>
                                            </>
                                        )}
                                    </ul>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={downloadTemplate}
                                    className="w-full flex items-center justify-center space-x-2"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Download Template</span>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Eye className="h-5 w-5" />
                                    <span>Tips</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• Use the provided template for best results</li>
                                    <li>• Ensure all required fields are filled</li>
                                    <li>• Remove empty rows before uploading</li>
                                    <li>• Check for duplicate entries</li>
                                    <li>• Save Excel files as CSV for faster processing</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProtocolUpload;
