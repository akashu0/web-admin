import { useForm } from '@tanstack/react-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const required = (value: any) => !value ? 'This field is required' : undefined;

export const VisaForm = () => {
    const navigate = useNavigate();

    const form = useForm({
        defaultValues: {
            country: '',
            type: '',
            processingTime: '',
            cost: '',
        },
        onSubmit: async ({ value }) => {
            console.log(value);
            toast.success('Visa saved successfully');
            navigate('/visas');
        },
    });

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create Visa</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit();
                        }}
                        className="space-y-4"
                    >
                        <form.Field
                            name="country"
                            validators={{ onChange: ({ value }) => required(value) }}
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors ? <p className="text-sm text-red-500">{field.state.meta.errors}</p> : null}
                                </div>
                            )}
                        />

                        <form.Field
                            name="type"
                            validators={{ onChange: ({ value }) => required(value) }}
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="type">Visa Type</Label>
                                    <Input
                                        id="type"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors ? <p className="text-sm text-red-500">{field.state.meta.errors}</p> : null}
                                </div>
                            )}
                        />

                        <form.Field
                            name="processingTime"
                            validators={{ onChange: ({ value }) => required(value) }}
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="processingTime">Processing Time</Label>
                                    <Input
                                        id="processingTime"
                                        placeholder="e.g. 2 weeks"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors ? <p className="text-sm text-red-500">{field.state.meta.errors}</p> : null}
                                </div>
                            )}
                        />

                        <form.Field
                            name="cost"
                            validators={{ onChange: ({ value }) => required(value) }}
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="cost">Cost (USD)</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors ? <p className="text-sm text-red-500">{field.state.meta.errors}</p> : null}
                                </div>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => navigate('/visas')}>Cancel</Button>
                            <Button type="submit">Save Visa</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
