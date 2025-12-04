'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Remove authService, we use Amplify directly
import { Loader, Mail, Lock, User as UserIcon, Eye, EyeOff, CheckCircle2, KeyRound } from 'lucide-react';

// --- AWS IMPORTS ---
import { signUp, confirmSignUp, signIn, autoSignIn } from 'aws-amplify/auth';

export default function SignupPage() {
  const router = useRouter();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // Verification State
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // --- HELPER: Password Strength ---
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    return { strength, label: labels[strength], color: colors[strength] };
  };
  const pwStrength = getPasswordStrength();

  // --- STEP 1: Handle Initial Signup ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Split "Full Name" into First/Last for Cognito
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '.'; // Default to '.' if no last name

      // 1. Call AWS SignUp
      const { isSignUpComplete, nextStep } = await signUp({
        username: formData.email,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
            given_name: firstName,
            family_name: lastName,
          },
          autoSignIn: true, // Enable auto-sign in after confirmation
        },
      });

      // 2. Check if we need verification (Usually yes)
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setPendingVerification(true);
      } else if (isSignUpComplete) {
        router.push('/');
      }

    } catch (err: any) {
      console.error('Signup failed:', err);
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: Handle Verification Code ---
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // 1. Confirm the code
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: formData.email,
        confirmationCode: verificationCode
      });

      // 2. Attempt Auto Sign-in
      if (isSignUpComplete) {
        // Sometimes autoSignIn needs explicit triggering
        await autoSignIn(); 
        router.push('/');
      } else {
        // Fallback: Manual Login if auto fails
        await signIn({ username: formData.email, password: formData.password });
        router.push('/');
      }

    } catch (err: any) {
      console.error('Verification failed:', err);
      setError(err.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={0} wishlistCount={0} onSearch={() => {}} isAuthenticated={false} />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">
              {pendingVerification ? 'Check your email for the code' : 'Join BookVerse to start your reading journey'}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{pendingVerification ? 'Verify Email' : 'Sign Up'}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* --- ERROR DISPLAY --- */}
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              {/* --- CONDITIONAL RENDERING: VERIFICATION FORM --- */}
              {pendingVerification ? (
                <form onSubmit={handleVerification} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Verification Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      We sent a code to {formData.email}
                    </p>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? <Loader className="animate-spin mr-2" size={20} /> : 'Verify & Login'}
                  </Button>
                </form>
              ) : (
                /* --- STANDARD SIGNUP FORM --- */
                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        className="pl-10"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="pl-10"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {/* Password Strength Bar */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded ${i <= pwStrength.strength ? pwStrength.color : 'bg-muted'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">{pwStrength.label}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                        className="pl-10 pr-10"
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-1"
                    />
                    <span className="text-sm">I agree to the Terms of Service and Privacy Policy</span>
                  </label>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? <Loader className="animate-spin mr-2" size={20} /> : 'Create Account'}
                  </Button>
                </form>
              )}

              {/* Login Link */}
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}