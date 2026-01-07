"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Copy,
  Link2,
  Loader2,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { listingsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PlatformIcon, getPlatformName } from "@/components/platform-icon";

interface ListingResponse {
  id: string;
  platform: string;
  displayName?: string;
  username?: string;
  verificationCode?: string;
  verificationStatus?: string;
  verificationMethod?: string;
  verificationUrl?: string;
  status?: string;
}

export default function VerifyListingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [listing, setListing] = useState<ListingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState("");

  const listingId = params.id as string;

  useEffect(() => {
    if (!listingId) return;

    const loadListing = async () => {
      try {
        const response = await listingsApi.getById(listingId);
        const data = response.data?.data;
        setListing(data);
        if (data?.verificationUrl) {
          setVerificationUrl(data.verificationUrl);
        }
      } catch (error) {
        toast({
          title: "Unable to load listing",
          description: "Please try again or contact support if this continues.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [listingId, toast]);

  const handleVerify = async () => {
    if (!verificationUrl) {
      toast({
        title: "Add your profile link",
        description: "Paste the public profile URL where you placed the code.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await listingsApi.verifyOwnership(listingId, {
        verificationUrl,
        method: "platform_action",
      });
      setListing(response.data?.data);
      toast({
        title: "Ownership verified",
        description: "Great! Your listing can now move to review.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description:
          error?.response?.data?.message ||
          "We couldn't find the code. Make sure it's visible on your profile and try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const verificationStatus = listing?.verificationStatus || "pending";
  const badgeVariant =
    verificationStatus === "verified"
      ? "default"
      : verificationStatus === "failed"
      ? "destructive"
      : "secondary";

  const handleCopy = async () => {
    if (!listing?.verificationCode) return;
    try {
      await navigator.clipboard.writeText(listing.verificationCode);
      toast({ title: "Code copied", description: "Paste it into your profile bio/story." });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: listing.verificationCode,
        variant: "destructive",
      });
    }
  };

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard/listings");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">Listing not found</h2>
        <Button onClick={() => router.push("/dashboard/listings")}>Back to Listings</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={listing.platform} size={18} />
            <Badge variant="outline">{getPlatformName(listing.platform)}</Badge>
            <Badge variant={badgeVariant}>
              {verificationStatus === "verified"
                ? "Verified"
                : verificationStatus === "failed"
                ? "Needs attention"
                : "Verification required"}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold">
            Verify ownership for {listing.displayName || listing.username || "your listing"}
          </h1>
          <p className="text-muted-foreground">
            Add the code below to your profile and click verify. Listings stay unpublished until ownership is verified.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Platform-based proof (recommended)
          </CardTitle>
          <CardDescription>
            Choose one: update your bio with the code, post a temporary story/post containing it, or set your website link to our verification URL. Keep the profile public while we check.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-3 bg-muted/40">
            <div>
              <p className="text-sm text-muted-foreground">Your unique verification code</p>
              <div className="flex items-center gap-2 text-lg font-semibold">
                {listing.verificationCode || "Generating..."}
                {listing.verificationCode && (
                  <Button variant="ghost" size="icon" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Usually verifies in seconds
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                title: "Change your bio",
                icon: BadgeCheck,
                copy: "Add the code to your profile bio and save it.",
              },
              {
                title: "Post a story/post",
                icon: Sparkles,
                copy: "Publish a temporary story or post including the code.",
              },
              {
                title: "Set website link",
                icon: Link2,
                copy: "Point your website/link field to this verification page.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border p-4 space-y-2 bg-muted/30">
                <item.icon className="h-5 w-5 text-primary" />
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Public profile URL to verify
            </p>
            <Input
              value={verificationUrl}
              onChange={(e) => setVerificationUrl(e.target.value)}
              placeholder="https://instagram.com/your-handle"
            />
            <p className="text-xs text-muted-foreground">
              Make sure the profile is public while we verify. We only scan this page for the code; nothing is stored beyond the URL.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {verificationStatus === "verified" ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" /> Verified and ready for review
                </>
              ) : verificationStatus === "failed" ? (
                <>
                  <XCircle className="h-4 w-4 text-destructive" /> We couldn&apos;t find the code. Update your profile and try again.
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" /> Listing stays unpublished until verification passes.
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/listing/${listing.id}`)}>
                View Listing Preview
              </Button>
              <Button onClick={handleVerify} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-primary" /> Why this step?
          </CardTitle>
          <CardDescription>
            Proof of ownership protects buyers and speeds up approval. Once verified, your listing shows a verification badge and can be published.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex gap-3">
            <ShieldCheck className="h-5 w-5 text-primary mt-1" />
            <div>
              <p className="font-semibold">Trust & visibility</p>
              <p className="text-sm text-muted-foreground">
                Verified listings stand out and are prioritized for moderation and buyers.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <BadgeCheck className="h-5 w-5 text-primary mt-1" />
            <div>
              <p className="font-semibold">Required to publish</p>
              <p className="text-sm text-muted-foreground">Listings remain pending until ownership is confirmed.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-1" />
            <div>
              <p className="font-semibold">Fast checks</p>
              <p className="text-sm text-muted-foreground">Most verifications complete within a minute once the code is visible.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
