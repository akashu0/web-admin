import { useForm } from '@tanstack/react-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const required = (value: any) => !value ? 'This field is required' : undefined;

export const UniversityForm = () => {
    const navigate = useNavigate();

    const form = useForm({
        defaultValues: {
            name: '',
            country: '',
            ranking: '',
            website: '',
        },
        onSubmit: async ({ value }) => {
            console.log(value);
            toast.success('University saved successfully');
            navigate('/universities');
        },
    });

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create University</CardTitle>
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
                            name="name"
                            validators={{ onChange: ({ value }) => required(value) }}
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="name">University Name</Label>
                                    <Input
                                        id="name"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors ? <p className="text-sm text-red-500">{field.state.meta.errors}</p> : null}
                                </div>
                            )}
                        />

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
                            name="ranking"
                            validators={{ onChange: ({ value }) => required(value) }}
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="ranking">Global Ranking</Label>
                                    <Input
                                        id="ranking"
                                        type="number"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors ? <p className="text-sm text-red-500">{field.state.meta.errors}</p> : null}
                                </div>
                            )}
                        />

                        <form.Field
                            name="website"
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        placeholder="https://..."
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => navigate('/universities')}>Cancel</Button>
                            <Button type="submit">Save University</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
