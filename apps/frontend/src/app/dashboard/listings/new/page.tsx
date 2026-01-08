'use client';

// Map platform to URL pattern
const getProfileUrl = (platform: string, username: string) => {
  if (!platform || !username) return '';
  const patterns: Record<string, string> = {
    instagram: 'https://instagram.com/',
    tiktok: 'https://tiktok.com/@',
    twitter: 'https://twitter.com/',
    youtube: 'https://youtube.com/@',
    facebook: 'https://facebook.com/',
    linkedin: 'https://linkedin.com/in/',
    discord: 'https://discord.com/users/',
    telegram: 'https://t.me/',
    reddit: 'https://reddit.com/user/',
    snapchat: 'https://snapchat.com/add/',
    pinterest: 'https://pinterest.com/',
    onlyfans: 'https://onlyfans.com/',
    other: '',
  };
  return patterns[platform] ? patterns[platform] + username.replace(/^@/, '') : '';
};

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Plus, X, Upload, CheckCircle2, Copy, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { listingsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PlatformIcon, getPlatformName } from '@/components/platform-icon';

const platforms = [
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'facebook',
  'other',
];

const categories = [
  'entertainment',
  'lifestyle',
  'gaming',
  'education',
  'business',
  'fashion',
  'fitness',
  'food',
  'travel',
  'technology',
  'music',
  'art',
  'sports',
  'other',
];

const listingSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .refine((val) => !/(https?:\/\/|www\.)/i.test(val), {
      message: 'Do not include links in your description',
    })
    .refine((val) => !/\S+@\S+\.\S+/i.test(val), {
      message: 'Do not include email addresses or contact info',
    })
    .refine((val) => !/@[a-z0-9_.-]{2,}/i.test(val), {
      message: 'Do not include usernames/handles in the description',
    })
    .refine((val) => !/(^|\s)[0-9][\s-()]{0,2}(?:[0-9][\s-()]{0,2}){6,}/.test(val), {
      message: 'Do not include phone numbers or contact details',
    }),
  category: z.string().min(1, 'Please select a category'),
  price: z.number().min(50, 'Minimum price is $50'),
  followers: z.number().min(1000, 'Minimum followers is 1,000'),
  engagement: z.number().min(0.1).max(100, 'Engagement rate must be between 0.1% and 100%'),
  accountAge: z.string().min(1, 'Please enter account age'),
  monthlyRevenue: z.number().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

export default function NewListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<'profile' | 'verify' | 'details'>('profile');
  const [platform, setPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [profilePreview, setProfilePreview] = useState<{ title?: string; bio?: string; image?: string; followers?: number }>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [transferSteps, setTransferSteps] = useState<string[]>([
    'Payment is held in escrow',
    'Seller provides account credentials',
    'Buyer verifies account access',
    'Buyer updates security settings',
    'Payment is released to seller',
  ]);

  const resetVerification = () => {
    setVerified(false);
    setStep('profile');
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      category: '',
      price: 0,
      followers: 0,
      engagement: 0,
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 6 - images.length);
    setImages([...images, ...newFiles]);

    newFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      setImageUrls((prev) => [...prev, url]);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const addTransferStep = () => {
    setTransferSteps([...transferSteps, '']);
  };

  const updateTransferStep = (index: number, value: string) => {
    const updated = [...transferSteps];
    updated[index] = value;
    setTransferSteps(updated);
  };

  const removeTransferStep = (index: number) => {
    setTransferSteps(transferSteps.filter((_, i) => i !== index));
  };

  const handleGetCodeAndPreview = async () => {
    const url = getProfileUrl(platform, username);
    if (!platform || !username || !url) {
      toast({
        title: 'Missing info',
        description: 'Select a platform, add username, and provide a public profile URL.',
        variant: 'destructive',
      });
      return;
    }

    setVerified(false);
    setStep('profile');

    try {
      setProfileLoading(true);
      const codeRes = await listingsApi.getVerificationCode();
      console.log('Verification Code Response:', codeRes.data);
      const code = codeRes.data?.data?.code || codeRes.data?.code || codeRes.data?.data || '';
      setVerificationCode(typeof code === 'string' ? code : JSON.stringify(code));

      setProfileUrl(url);
      console.log('Fetching profile preview for:', url);
      const previewRes = await listingsApi.profilePreview({ profileUrl: url });
      console.log('Profile Preview Response:', previewRes.data);
      const previewData = previewRes.data?.data || previewRes.data;
      setProfilePreview(previewData);
      if (previewData?.title) setValue('title', previewData.title);
      if (previewData?.bio) setValue('description', previewData.bio);
      if (previewData?.followers) setValue('followers', previewData.followers);

      setStep('verify');
    } catch (error) {
      toast({
        title: 'Could not fetch profile',
        description: error instanceof Error ? error.message : 'Please check the URL and try again.',
        variant: 'destructive',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleVerifyProfile = async () => {
    if (!profileUrl || !verificationCode) {
      toast({
        title: 'Missing info',
        description: 'Provide the profile URL and generate a code first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setVerifyLoading(true);
      const verifiedResult = await listingsApi.verifyProfile({
        verificationUrl: profileUrl,
        verificationCode,
      });
      if (verifiedResult.data?.data === true || verifiedResult.data === true || verifiedResult === true) {
        setVerified(true);
        setStep('details');
        toast({ title: 'Profile verified' });
      } else {
        toast({
          title: 'Verification failed',
          description: 'We could not find the code on your profile. Please ensure it is visible and try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Verification error',
        description: error instanceof Error ? error.message : 'Failed to verify profile',
        variant: 'destructive',
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const onSubmit = async (data: ListingFormData) => {
    if (!verified) {
      toast({
        title: 'Verify ownership first',
        description: 'Please add the code to your profile and verify before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!platform || !username || !profileUrl) {
      toast({
        title: 'Missing profile information',
        description: 'Platform, username, and profile URL are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('platform', platform);
      formData.append('handle', username);
      formData.append('profileUrl', profileUrl);
      formData.append('verificationCode', verificationCode);
      formData.append('verificationUrl', profileUrl);

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, String(value));
        }
      });

      formData.append('transferSteps', JSON.stringify(transferSteps.filter(Boolean)));

      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await listingsApi.create(formData);
      
      // Axios wraps response in data, and our API wraps in data again
      const listingId = response.data?.data?.id || response.data?.id;
      
      toast({
        title: 'Listing created!',
        description: 'We captured your verification. We will review and publish it soon.',
        variant: 'success',
      });

      if (listingId) {
        router.push(`/dashboard/listings/${listingId}`);
      } else {
        router.push('/dashboard/listings');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create listing',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Listing</h1>
          <p className="text-muted-foreground">
            Sell your social media account securely
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Profile</CardTitle>
              <CardDescription>Choose your platform and public profile link to prefill details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform *</Label>
                  <Select
                    value={platform}
                    onValueChange={(value) => {
                      setPlatform(value);
                      resetVerification();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p} value={p}>
                          <div className="flex items-center gap-2">
                            <PlatformIcon platform={p} size={16} />
                            {getPlatformName(p)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username / Handle *</Label>
                  <Input
                    id="username"
                    placeholder="@username"
                    value={username}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUsername(val);
                      resetVerification();
                      setProfileUrl(getProfileUrl(platform, val));
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileUrl">Public profile URL *</Label>
                <Input
                  id="profileUrl"
                  placeholder={getProfileUrl(platform, 'username') || 'https://platform.com/your-handle'}
                  value={platform === 'other' ? profileUrl : getProfileUrl(platform, username)}
                  onChange={(e) => platform === 'other' && setProfileUrl(e.target.value)}
                  readOnly={platform !== 'other'}
                  className={platform !== 'other' ? 'bg-muted cursor-not-allowed' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  {platform === 'other' 
                    ? 'Paste the full URL to your public profile.' 
                    : 'This URL is auto-generated based on your username.'}
                </p>
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-muted-foreground">We will generate a verification code next.</div>
                <Button
                  type="button"
                  onClick={handleGetCodeAndPreview}
                  disabled={profileLoading}
                >
                  {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Fetch profile & get code
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'verify' && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Verify Your Account</CardTitle>
              <CardDescription>Confirm ownership of your profile to proceed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Overview (Centered like screenshot) */}
              <div className="flex flex-col items-center text-center space-y-4 py-4 border-b">
                <div className="relative">
                  {profilePreview?.image ? (
                    <img
                      src={profilePreview.image}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg">
                      <PlatformIcon platform={platform} size={40} />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow">
                    <PlatformIcon platform={platform} size={20} />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {profilePreview?.title || username}
                  </h2>
                  {profilePreview?.followers && (
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1">
                      <span className="font-bold text-foreground">
                        {profilePreview.followers.toLocaleString()}
                      </span>
                      {platform === 'youtube' ? 'subscribers' : 'followers'}
                    </p>
                  )}
                </div>
                {profilePreview?.bio && (
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto line-clamp-3 italic">
                    &quot;{profilePreview.bio}&quot;
                  </p>
                )}
              </div>

              {/* Verification Code Box (The yellow-ish box in screenshot) */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-6 text-center space-y-4">
                <p className="text-sm font-medium">
                  Please verify you have access to this account by placing
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-mono font-bold tracking-wider px-4 py-2 bg-background border rounded shadow-sm">
                    {verificationCode}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(verificationCode);
                      toast({ title: 'Code copied' });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm font-medium">
                  in your {platform} {platform === 'youtube' ? 'channel description' : 'profile bio'}, then click Verify.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  type="button" 
                  disabled={verifyLoading} 
                  onClick={handleVerifyProfile} 
                  className="w-full h-12 text-lg"
                >
                  {verifyLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Verify Ownership
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setStep('profile')}
                  className="w-full text-destructive hover:bg-destructive/10"
                >
                  Cancel & Change Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'details' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Description Rules</CardTitle>
                <CardDescription>Listings must follow these rules to be approved</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Don’t include your username. It’s hidden for a reason.</li>
                  <li>Don’t include your contact info or email. Buyers will message you on the platform.</li>
                  <li>Don’t put links to websites in your description.</li>
                  <li>Don’t upload images with your username or contact info in them.</li>
                  <li>Don’t stuff your description with copy‑paste text.</li>
                  <li>Don’t list personal accounts — only niche topic pages, brand and business pages.</li>
                </ul>
                <p className="text-sm font-semibold text-red-600">
                  We will not approve listings that don’t follow description rules. If you repeatedly violate our description rules, we will limit your access.
                </p>
                <p className="text-xs text-muted-foreground">
                  Any changes to active/live listings will trigger a review which may take up to 5 business days.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Listing Details</CardTitle>
                <CardDescription>Provide the specifics buyers care about</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={watch('category')} onValueChange={(value) => setValue('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive">{errors.category.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., 100K+ Fitness Instagram Account with High Engagement"
                      {...register('title')}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your account in detail. Include niche, audience demographics, content style, growth history, monetization potential, etc."
                    rows={6}
                    {...register('description')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Do not include usernames, contact info, email, phone numbers, or links in your description.
                  </p>
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="followers">Followers *</Label>
                    <Input
                      id="followers"
                      type="number"
                      placeholder="e.g., 100000"
                      {...register('followers', { valueAsNumber: true })}
                    />
                    {errors.followers && (
                      <p className="text-sm text-destructive">
                        {errors.followers.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engagement">Engagement Rate (%) *</Label>
                    <Input
                      id="engagement"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 5.5"
                      {...register('engagement', { valueAsNumber: true })}
                    />
                    {errors.engagement && (
                      <p className="text-sm text-destructive">
                        {errors.engagement.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountAge">Account Age *</Label>
                    <Input
                      id="accountAge"
                      placeholder="e.g., 3 years"
                      {...register('accountAge')}
                    />
                    {errors.accountAge && (
                      <p className="text-sm text-destructive">
                        {errors.accountAge.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyRevenue">Monthly Revenue (USD)</Label>
                    <Input
                      id="monthlyRevenue"
                      type="number"
                      placeholder="Optional"
                      {...register('monthlyRevenue', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 5000"
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Platform fee: 5% of the sale price</p>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <CardDescription>
                  Add screenshots of your account (up to 6)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {images.length < 6 && (
                    <label className="aspect-video bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transfer Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Process</CardTitle>
                <CardDescription>
                  Describe how the account will be transferred
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {transferSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <Input
                      value={step}
                      onChange={(e) => updateTransferStep(index, e.target.value)}
                      placeholder="Transfer step..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTransferStep(index)}
                      disabled={transferSteps.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTransferStep}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </CardContent>
            </Card>

            <Separator />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Listing
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
