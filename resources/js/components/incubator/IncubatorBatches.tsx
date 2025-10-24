import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Users } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Batch {
    id: number;
    batch_code: string;
    name: string;
    breed: string;
    status: {
        value: string;
        label: string;
        color: string;
    };
    current_count: number;
    start_date: string;
    hatch_date: string;
    age_days: number;
    manager: {
        name: string;
    };
}

interface IncubatorBatchesProps {
    batches: Batch[];
    getStatusColor: (status: string) => string;
}

export default function IncubatorBatches({ batches, getStatusColor }: IncubatorBatchesProps) {
    return (
        <div className="space-y-4">
            {batches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {batches.map((batch) => (
                        <Card key={batch.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{batch.name}</CardTitle>
                                    <Badge className={getStatusColor(batch.status.value)}>
                                        {batch.status.label}
                                    </Badge>
                                </div>
                                <CardDescription>{batch.batch_code}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Breed</span>
                                    <span className="text-sm font-medium">{batch.breed}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Count</span>
                                    <span className="text-sm font-medium">{batch.current_count}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Age</span>
                                    <span className="text-sm font-medium">{batch.age_days} days</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Manager</span>
                                    <span className="text-sm font-medium">{batch.manager.name}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Hatch Date</span>
                                    <span className="text-sm font-medium">
                                        {new Date(batch.hatch_date).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Active Batches</h3>
                        <p className="text-sm text-muted-foreground text-center mb-4">
                            This incubator currently has no active batches assigned.
                        </p>
                        <Button asChild>
                            <Link href="/batch-incubator/batches/create">
                                Add Batch
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
