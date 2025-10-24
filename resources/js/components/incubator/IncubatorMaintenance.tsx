import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Calendar,
    Wrench,
    AlertTriangle,
} from 'lucide-react';

interface IncubatorMaintenanceProps {
    incubator: {
        last_maintenance?: string;
        next_maintenance?: string;
        maintenance_due?: boolean;
        maintenance_notes?: string;
    };
    maintenanceForm: any;
    handleMaintenanceRecord: (e: React.FormEvent) => void;
}

export default function IncubatorMaintenance({
    incubator,
    maintenanceForm,
    handleMaintenanceRecord,
}: IncubatorMaintenanceProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Maintenance Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Last Maintenance</Label>
                            <p className="font-medium">
                                {incubator.last_maintenance
                                    ? new Date(incubator.last_maintenance).toLocaleDateString()
                                    : 'No maintenance recorded'
                                }
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Next Maintenance</Label>
                            <div className="flex items-center gap-2">
                                <p className="font-medium">
                                    {incubator.next_maintenance
                                        ? new Date(incubator.next_maintenance).toLocaleDateString()
                                        : 'Not scheduled'
                                    }
                                </p>
                                {incubator.maintenance_due && (
                                    <Badge variant="destructive">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Due
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {incubator.maintenance_notes && (
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Last Notes</Label>
                                <p className="text-sm bg-gray-50 p-2 rounded">
                                    {incubator.maintenance_notes}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Record Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleMaintenanceRecord} className="space-y-4">
                            <div>
                                <Label htmlFor="maintenance_notes">Maintenance Notes</Label>
                                <Textarea
                                    id="maintenance_notes"
                                    placeholder="Describe the maintenance performed..."
                                    value={maintenanceForm.data.maintenance_notes}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => maintenanceForm.setData('maintenance_notes', e.target.value)}
                                />
                                {maintenanceForm.errors.maintenance_notes && <p className="text-sm text-red-600 mt-1">{maintenanceForm.errors.maintenance_notes}</p>}
                            </div>

                            <div>
                                <Label htmlFor="next_maintenance_days">Next Maintenance (days)</Label>
                                <Input
                                    id="next_maintenance_days"
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={maintenanceForm.data.next_maintenance_days}
                                    onChange={(e) => maintenanceForm.setData('next_maintenance_days', parseInt(e.target.value))}
                                />
                                {maintenanceForm.errors.next_maintenance_days && <p className="text-sm text-red-600 mt-1">{maintenanceForm.errors.next_maintenance_days}</p>}
                            </div>

                            <Button type="submit" disabled={maintenanceForm.processing}>
                                <Wrench className="h-4 w-4 mr-2" />
                                Record Maintenance
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
