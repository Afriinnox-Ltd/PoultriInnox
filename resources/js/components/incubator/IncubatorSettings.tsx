import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Shield,
    Users,
    CheckCircle,
    X,
    RotateCcw,
    Save,
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface IncubatorSettingsProps {
    incubator: {
        owner: {
            name: string;
        };
        authorized_users_details?: User[];
        serial_number: string;
    };
    isOwner: boolean;
    searchForm: any;
    handleGrantAccessByEmail: () => void;
    handleRevokeAccess: (userId: number) => void;
    accessForm: any;
    handleUpdate: (e: React.FormEvent) => void;
    processing: boolean;
}

export default function IncubatorSettings({
    incubator,
    isOwner,
    searchForm,
    handleGrantAccessByEmail,
    handleRevokeAccess,
    accessForm,
    handleUpdate,
    processing,
}: IncubatorSettingsProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Access Control & Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">User Access Management</Label>
                            <div className="space-y-2">
                                {/* Owner */}
                                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded border border-emerald-200">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-emerald-600" />
                                        <div>
                                            <span className="text-sm font-medium">{incubator.owner.name}</span>
                                            <Badge variant="outline" className="ml-2 text-xs bg-emerald-100 text-emerald-700 border-emerald-300">Owner</Badge>
                                        </div>
                                    </div>
                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                </div>

                                {/* Currently Authorized Users */}
                                {incubator.authorized_users_details?.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-2 bg-emerald-50 rounded border border-emerald-200">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-emerald-600" />
                                            <div>
                                                <span className="text-sm font-medium">{user.name}</span>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-300">Authorized</Badge>
                                            {isOwner && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRevokeAccess(user.id)}
                                                    disabled={accessForm.processing}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* User Email Input - Only for Owner */}
                                {isOwner && (
                                    <div className="space-y-2 pt-3 border-t">
                                        <Label className="text-xs text-muted-foreground">Grant Access to User</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="email"
                                                placeholder="Enter user's email address"
                                                disabled={searchForm.processing}
                                                value={searchForm.data.email}
                                                onChange={(e) => searchForm.setData('email', e.target.value)}
                                                className="flex-1"
                                                onKeyPress={(e) => e.key === 'Enter' && handleGrantAccessByEmail()}
                                            />
                                            <Button
                                                type="button"
                                                variant="default"
                                                onClick={handleGrantAccessByEmail}
                                                disabled={searchForm.processing || !searchForm.data.email.trim()}
                                                className="bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                {searchForm.processing ? (
                                                    <RotateCcw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Users className="h-4 w-4" />
                                                )}
                                                {searchForm.processing ? 'Adding...' : 'Grant Access'}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Enter the email address and click "Grant Access" to immediately add the user to this incubator.
                                        </p>
                                    </div>
                                )}

                                {/* Non-owner message */}
                                {!isOwner && (
                                    <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                                        <p className="text-sm text-yellow-800">
                                            Only the incubator owner can manage user access settings.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Serial Number</Label>
                            <p className="font-mono text-sm">{incubator.serial_number}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Save Settings Button */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Save Settings</h3>
                            <p className="text-sm text-muted-foreground">
                                Apply all configuration changes to the incubator
                            </p>
                        </div>
                        <Button onClick={handleUpdate} disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            Save All Settings
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
