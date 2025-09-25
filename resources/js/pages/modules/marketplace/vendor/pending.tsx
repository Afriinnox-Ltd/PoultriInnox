

import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    User,
    Building,
    MapPin,
    Globe,
    Phone,
    Mail,
    CreditCard,
    FileText,
    Camera,
    Save,
    ArrowLeft,
    Shield,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';


export default function Pending() {


    return (
        <AppLayout>
            <Head title="Vendor Profile" />

            <div className="flex gap-3 w-full  justify-center min-h-[60vh]  lg:flex-row flex-col items-center p-6 lg:mb-6">

                <Alert className="w-full lg:w-1/2" variant="destructive">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                        <div className="flex flex-col">
                            <span>Your vendor application is currently under review. This process typically takes 2-3 business days.</span>
                            <span className="mt-2">You will receive an email notification once your application has been reviewed.</span>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        </AppLayout>
    );
}

