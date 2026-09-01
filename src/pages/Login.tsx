import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { setRemember } from '@/lib/authStorage';
import { apiClient, apiErrorMessage } from '@/services/api';

const schema = z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    // Ticked by default: this is how the app has always behaved, and the box is
    // here to opt OUT of it on a machine that is not yours.
    rememberMe: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export const Login = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const token = useAuthStore((state) => state.token);

    const [showPw, setShowPw] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { rememberMe: true },
    });
    const rememberMe = watch('rememberMe');

    if (token) return <Navigate to="/dashboard" replace />;

    const onSubmit = async ({ email, password, rememberMe: keep }: FormValues) => {
        try {
            setIsLoading(true);
            // Before the store is written, so the session lands in the storage
            // the choice selects rather than being moved afterwards.
            setRemember(keep);
            // The CRM's staff login — web-admin has no user list of its own any
            // more. The response carries the identity AND the permission map, so
            // the sidebar can render correctly without a second round trip.
            const response = await apiClient.post('/auth/login', {
                email,
                password,
                deviceName: 'web-admin',
                // The server halves this too: an unremembered sign-in gets a
                // twelve-hour session instead of a week.
                rememberMe: keep,
            });
            const { token, refreshToken, user, role, permissions } = response.data.data;

            login(
                {
                    id: user?._id ?? '',
                    name: user?.username ?? email,
                    email: user?.email ?? email,
                    role: role?.name ?? 'staff',
                },
                token,
                { refreshToken, permissions },
            );
            toast.success('Login successful');
            navigate('/dashboard');
        } catch (error) {
            toast.error(apiErrorMessage(error, 'Invalid email or password'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex h-screen overflow-hidden">
            {/* Brand panel */}
            <section className="brand-gradient relative hidden w-[55%] flex-col justify-between overflow-hidden p-10 lg:flex">
                <div
                    className="absolute inset-0 opacity-40"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 0)',
                        backgroundSize: '24px 24px',
                    }}
                />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-white shadow-lg">
                        <GraduationCap className="size-6 text-brand" />
                    </div>
                    <span className="text-h2 font-semibold tracking-tight text-white">eduGuardian</span>
                </div>
                <div className="relative z-10 max-w-md">
                    <h1 className="mb-4 text-display font-bold leading-[1.05] text-white">
                        The content behind every eduGuardian page
                    </h1>
                    <p className="text-h3 font-normal text-white/80">
                        Author courses, universities, countries and visas once — the website, the
                        academy and the portals all read the same catalog.
                    </p>
                </div>
                <p className="relative z-10 text-xs text-white/50">
                    © 2026 eduGuardian. Content Administration.
                </p>
            </section>

            {/* Form panel */}
            <section className="relative flex w-full flex-col items-center justify-center bg-background p-6 lg:w-[45%] lg:p-10">
                <div className="w-full max-w-[400px]">
                    <header className="mb-8">
                        <h2 className="mb-1 text-h1 font-semibold">Welcome back</h2>
                        <p className="text-muted-foreground">
                            Enter your credentials to access the content admin
                        </p>
                    </header>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@myeduguardian.com"
                                autoComplete="email"
                                disabled={isLoading}
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="pr-10"
                                    disabled={isLoading}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                                    aria-label={showPw ? 'Hide password' : 'Show password'}
                                >
                                    {showPw ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <Checkbox
                                id="rememberMe"
                                checked={rememberMe}
                                onCheckedChange={(v) => setValue('rememberMe', v === true)}
                                disabled={isLoading}
                            />
                            <Label htmlFor="rememberMe" className="text-sm font-normal">
                                Keep me logged in
                            </Label>
                        </div>

                        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" /> Verifying...
                                </>
                            ) : (
                                <>
                                    Sign in <ArrowRight className="size-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-xs text-muted-foreground">
                        Don’t have an account? <span className="font-semibold text-primary">Contact HR</span>
                    </p>
                </div>
            </section>
        </main>
    );
};
