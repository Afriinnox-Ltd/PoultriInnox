import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/layouts/guest-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Mail,
    Phone,
    MapPin,
    MessageSquare,
    HelpCircle,
    BookOpen,
    FileText,
    ExternalLink,
    Store,

} from 'lucide-react';

export default function Help() {
    return (
        <GuestLayout>
            <Head title="Help & Support" />

            <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
                    <p className="text-muted-foreground">
                        Get in Touch - We're here to help
                    </p>
                </div>

                {/* Contact Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Email Support */}
                    <Card>
                        <CardHeader>
                            <Mail className="h-8 w-8 mb-2 text-primary" />
                            <CardTitle>Email Us</CardTitle>
                            <CardDescription>
                                Send us an email and we'll respond within 24 hours
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm font-medium">info@agriinnox.com</p>
                            <Button variant="outline" className="w-full" asChild>
                                <a href="mailto:info@agriinnox.com">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Phone Support */}
                    <Card>
                        <CardHeader>
                            <Phone className="h-8 w-8 mb-2 text-primary" />
                            <CardTitle>Call Us</CardTitle>
                            <CardDescription>
                                Call us during business hours (Mon-Fri, 9AM-6PM)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm font-medium">+250 795 814 403</p>
                            <p className="text-sm font-medium">+250 789 211 684</p>
                            <Button variant="outline" className="w-full" asChild>
                                <a href="tel:+250795814403">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call Now
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* WhatsApp Support */}
                    <Card>
                        <CardHeader>
                            <MessageSquare className="h-8 w-8 mb-2 text-primary" />
                            <CardTitle>WhatsApp</CardTitle>
                            <CardDescription>
                                Chat with us on WhatsApp for quick support
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm font-medium">+250 795 814 403</p>
                            <Button variant="outline" className="w-full" asChild>
                                <a
                                    href="https://wa.me/250795814403"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Open WhatsApp
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold">Documentation</h3>
                        <p className="text-muted-foreground">Detailed guides to help you get the most out of Agriinox</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => window.location.href = '/docs/marketplace/buyer'}>
                            <CardHeader>
                                <BookOpen className="h-8 w-8 mb-2 text-primary" />
                                <CardTitle>Buyer Guide</CardTitle>
                                <CardDescription>
                                    Everything you need to know about shopping, orders, and reviews.
                                </CardDescription>
                            </CardHeader>
                        </Card> */}

                        <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => window.location.href = '/docs/marketplace/vendor'}>
                            <CardHeader>
                                <Store className="h-8 w-8 mb-2 text-primary" />
                                <CardTitle>Vendor Guide</CardTitle>
                                <CardDescription>
                                    Learn how to set up your shop, manage products, and track earnings.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>

                {/* Office Location */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-6 w-6 text-primary" />
                            <CardTitle>Office Location</CardTitle>
                        </div>
                        <CardDescription>
                            Visit our office during business hours
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="font-medium">Afriinnox Ltd</p>
                            <p className="text-sm text-muted-foreground">
                                Kimisagara, Kigali . Rwanda
                            </p>
                            <p className="text-sm text-muted-foreground mt-4">
                                <strong>Business Hours:</strong><br />
                                Monday - Friday: 9:00 AM - 6:00 PM<br />
                                Saturday: Closed<br />
                                Sunday: Closed
                            </p>
                            <Button variant="outline" className="mt-4" asChild>
                                <a
                                    href="https://maps.google.com/?q=KK+15+Rd+Kigali+Rwanda"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Get Directions
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    );
}
