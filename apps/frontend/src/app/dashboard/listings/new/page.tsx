'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Plus, X, Upload } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { listingsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PlatformIcon, getPlatformName } from '@/components/platform-icon';

const platforms = [
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'twitch',
  'facebook',
  'linkedin',
  'discord',
  'telegram',
  'reddit',
  'snapchat',
  'pinterest',
  'onlyfans',
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
  description: z.string().min(50, 'Description must be at least 50 characters'),
  platform: z.string().min(1, 'Please select a platform'),
  category: z.string().min(1, 'Please select a category'),
  price: z.number().min(50, 'Minimum price is $50'),
  followers: z.number().min(1000, 'Minimum followers is 1,000'),
  engagement: z.number().min(0.1).max(100, 'Engagement rate must be between 0.1% and 100%'),
  accountAge: z.string().min(1, 'Please enter account age'),
  monthlyRevenue: z.number().optional(),
  handle: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

export default function NewListingPage() {
  const router = useRouter();
  const { toast } = useToast();
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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      platform: '',
      category: '',
      price: 0,
      followers: 0,
      engagement: 0,
    },
  });

  const selectedPlatform = watch('platform');

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

  const onSubmit = async (data: ListingFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
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
        description: 'Your listing has been submitted for review.',
        variant: 'success',
      });

      if (listingId) {
        router.push(`/listing/${listingId}`);
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
        {/* Platform and Category */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              Tell us about the account you&apos;re selling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform *</Label>
                <Select
                  value={selectedPlatform}
                  onValueChange={(value) => setValue('platform', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        <div className="flex items-center gap-2">
                          <PlatformIcon platform={platform} size={16} />
                          {getPlatformName(platform)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.platform && (
                  <p className="text-sm text-destructive">{errors.platform.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select onValueChange={(value) => setValue('category', value)}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="handle">Account Handle (optional)</Label>
              <Input
                id="handle"
                placeholder="@username"
                {...register('handle')}
              />
              <p className="text-xs text-muted-foreground">
                This won&apos;t be shown publicly until a transaction starts
              </p>
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

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your account in detail. Include niche, audience demographics, content style, growth history, monetization potential, etc."
                rows={6}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>
              Provide accurate statistics for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Set your asking price</CardDescription>
          </CardHeader>
          <CardContent>
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
              <p className="text-xs text-muted-foreground">
                Platform fee: 5% of the sale price
              </p>
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
      </form>
    </div>
  );
}
