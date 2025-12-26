import { useForm } from '@tanstack/react-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const Login = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
        onSubmit: async ({ value }) => {
            // Validate with Zod
            const result = loginSchema.safeParse(value);
            if (!result.success) {
                toast.error('Validation failed');
                return;
            }

            try {
                // TODO: Replace with actual API call
                // const response = await api.post('/auth/login', value);

                // Mock Login
                if (value.email === 'admin@example.com' && value.password === 'password') {
                    login(
                        { id: '1', name: 'Admin', email: value.email, role: 'admin' },
                        'fake-jwt-token'
                    );
                    toast.success('Login successful');
                    navigate('/dashboard');
                } else {
                    toast.error('Invalid credentials');
                }
            } catch (error) {
                toast.error('Login failed');
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/5">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access the dashboard
                    </CardDescription>
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
                            name="email"
                            validators={{
                                onChange: ({ value }) => {
                                    const result = loginSchema.shape.email.safeParse(value);
                                    if (result.success) return undefined;
                                    return result.error.issues[0].message;
                                }
                            }}
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="admin@example.com"
                                    />
                                    {field.state.meta.errors ? (
                                        <p className="text-sm text-red-500">{field.state.meta.errors.join(', ')}</p>
                                    ) : null}
                                </div>
                            )}
                        />

                        <form.Field
                            name="password"
                            validators={{
                                onChange: ({ value }) => {
                                    const result = loginSchema.shape.password.safeParse(value);
                                    if (result.success) return undefined;
                                    return result.error.issues[0].message;
                                }
                            }}
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="••••••"
                                    />
                                    {field.state.meta.errors ? (
                                        <p className="text-sm text-red-500">{field.state.meta.errors.join(', ')}</p>
                                    ) : null}
                                </div>
                            )}
                        />

                        <Button type="submit" className="w-full">
                            Sign In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                    <p>Demo: admin@example.com / password</p>
                </CardFooter>
            </Card>
        </div>
    );
};
