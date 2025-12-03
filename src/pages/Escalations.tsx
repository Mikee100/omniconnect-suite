import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface Escalation {
    id: string;
    customerId: string;
    customer: {
        name: string;
        phone: string;
        email: string;
    };
    reason: string;
    status: string;
    createdAt: string;
}

export default function Escalations() {
    const [escalations, setEscalations] = useState<Escalation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEscalations = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/escalations');
            if (!res.ok) throw new Error('Failed to fetch escalations');
            const data = await res.json();
            setEscalations(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEscalations();
    }, []);

    const handleResolve = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:3000/api/escalations/${id}/resolve`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Failed to resolve');
            // Refresh list
            fetchEscalations();
        } catch (err: any) {
            alert('Error resolving escalation: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Escalations & Human Handoff</h1>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {escalations.length === 0 && !error ? (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">All Clear!</AlertTitle>
                    <AlertDescription className="text-green-700">
                        No open escalations. Great job! 🎉
                    </AlertDescription>
                </Alert>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Open Escalations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {escalations.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">{row.customer?.name || 'Unknown'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{row.customer?.phone}</span>
                                                <span className="text-xs text-muted-foreground">{row.customer?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{row.reason || 'No reason provided'}</TableCell>
                                        <TableCell>{format(new Date(row.createdAt), 'MMM d, h:mm a')}</TableCell>
                                        <TableCell>
                                            <Badge variant={row.status === 'OPEN' ? 'destructive' : 'default'}>
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {row.status === 'OPEN' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleResolve(row.id)}
                                                >
                                                    Resolve & Unpause AI
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
