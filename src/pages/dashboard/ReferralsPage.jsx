import { Icon } from '@iconify/react';
import { useState, memo } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

import { useAuthContext } from '../../auth/useAuthContext.ts';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import { Button } from '../../components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { CompactLayout } from '../../layouts/dashboard';
import { analytics } from '../../lib/analytics';
import { cn } from '../../lib/utils';

// ----------------------------------------------------------------------

function ReferralsPage() {
  const { user } = useAuthContext();
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const [postLink, setPostLink] = useState('');

  const referralUrl = user?.id ? `https://altan.ai?ref=${user.id}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setShowConfetti(true);

      analytics.track('referral_link_copied', {
        user_id: user?.id,
        referral_url: referralUrl,
      });

      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSubmitPost = () => {
    if (!postLink.trim()) return;

    analytics.track('referral_post_submitted', {
      user_id: user?.id,
      post_link: postLink,
    });

    // TODO: Implement post submission logic
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Altan AI',
          text: 'Check out Altan AI - Build AI agents and workflows!',
          url: referralUrl,
        });

        analytics.track('referral_link_shared', {
          user_id: user?.id,
          referral_url: referralUrl,
          method: 'native_share',
        });
      } catch (err) {
        // Only log if user didn't cancel the share
        if (err.name !== 'AbortError') {
          // eslint-disable-next-line no-console
          console.error('Failed to share: ', err);
        }
      }
    }
  };

  return (
    <CompactLayout title="Referrals · Altan">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            Earn $250+ in Free Credits
          </h1>
          <p className="text-muted-foreground text-lg">
            Share your work or invite friends to get more credits
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Share what you're building Section */}
          <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-700/30 shadow-xl">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl">
                Share what you&apos;re building
              </CardTitle>
              <CardDescription className="text-base">
                Get up to $250 in credits based on post quality and engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion
                type="single"
                collapsible
                className="border rounded-lg bg-white/30 dark:bg-gray-800/30"
              >
                <AccordionItem
                  value="tips"
                  className="border-none"
                >
                  <AccordionTrigger className="px-4 text-sm text-muted-foreground hover:no-underline">
                    How to write a great post that earns max credits
                  </AccordionTrigger>
                  <AccordionContent className="px-4 space-y-3 pb-4">
                    <div>
                      <p className="text-sm font-semibold mb-1">
                        Start with impact:
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Lead with a compelling one-liner about your idea and
                        your hands-on experience building it with Altan.
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-1">
                        Tell your story:
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Share the &quot;why&quot; behind your project—your
                        backstory, inspiration, and who you built it for.
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-1">
                        Keep it authentic:
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Write as yourself, not as AI. Genuine posts outperform
                        marketing copy.
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-1">
                        Show, don&apos;t tell:
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Include screenshots or video demos of your project.
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-1">
                        Boost your reach:
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tag @altanlabs on X or @altan-ai on LinkedIn for bonus
                        credits.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/40 dark:bg-gray-800/40">
                    <Icon
                      icon="mdi:message-text-outline"
                      className="w-5 h-5"
                    />
                  </div>
                  <p className="text-sm">
                    Post about what you&apos;re building on social media
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/40 dark:bg-gray-800/40">
                    <Icon
                      icon="mdi:link"
                      className="w-5 h-5"
                    />
                  </div>
                  <p className="text-sm">Submit a link to your post</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/40 dark:bg-gray-800/40">
                    <Icon
                      icon="mdi:gift-outline"
                      className="w-5 h-5"
                    />
                  </div>
                  <p className="text-sm">
                    Get up to $250 in credits{' '}
                    <span className="text-muted-foreground">
                      (depending on account followers)
                    </span>
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your post link:
                </label>
                <Input
                  placeholder="x.com/yourpost"
                  value={postLink}
                  onChange={(e) => setPostLink(e.target.value)}
                  className="bg-white/30 dark:bg-gray-800/30"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60"
                >
                  <Icon
                    icon="mdi:twitter"
                    className="w-5 h-5"
                  />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60"
                >
                  <Icon
                    icon="mdi:linkedin"
                    className="w-5 h-5"
                  />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60"
                >
                  <Icon
                    icon="mdi:instagram"
                    className="w-5 h-5"
                  />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60"
                >
                  <Icon
                    icon="mdi:facebook"
                    className="w-5 h-5"
                  />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60"
                >
                  <Icon
                    icon="mdi:reddit"
                    className="w-5 h-5"
                  />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60"
                >
                  <Icon
                    icon="ic:baseline-tiktok"
                    className="w-5 h-5"
                  />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60"
                >
                  <Icon
                    icon="mdi:youtube"
                    className="w-5 h-5"
                  />
                </Button>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmitPost}
                disabled={!postLink.trim()}
                variant="secondary"
              >
                Submit post
              </Button>
            </CardContent>
          </Card>

          {/* Invite friends Section */}
          <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-700/30 shadow-xl">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-2xl">Invite friends</CardTitle>
              <CardDescription className="text-base">
                Share Altan with friends and both earn free credits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/40 dark:bg-gray-800/40">
                    <Icon
                      icon="mdi:link"
                      className="w-5 h-5"
                    />
                  </div>
                  <p className="text-sm">Share your invite link</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/40 dark:bg-gray-800/40">
                    <Icon
                      icon="mdi:account-plus-outline"
                      className="w-5 h-5"
                    />
                  </div>
                  <p className="text-sm">They sign up</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/40 dark:bg-gray-800/40">
                    <Icon
                      icon="mdi:star-outline"
                      className="w-5 h-5"
                    />
                  </div>
                  <p className="text-sm">
                    Both get $10 in credits{' '}
                    <span className="text-muted-foreground">
                      once they upgrade to Pro
                    </span>
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="relative">
                <Input
                  readOnly
                  value={referralUrl}
                  className="pr-12 bg-white/30 dark:bg-gray-800/30"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopy}
                  className={cn(
                    'absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7',
                    copied && 'text-green-600',
                  )}
                >
                  {copied ? (
                    <Icon
                      icon="mdi:check"
                      className="w-4 h-4"
                    />
                  ) : (
                    <Icon
                      icon="mdi:content-copy"
                      className="w-4 h-4"
                    />
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleCopy}
                >
                  <Icon
                    icon="mdi:content-copy"
                    className="mr-2 w-4 h-4"
                  />
                  Copy link
                </Button>
                {navigator.share && (
                  <Button
                    className="flex-1"
                    size="lg"
                    variant="outline"
                    onClick={handleShare}
                  >
                    <Icon
                      icon="mdi:share-variant"
                      className="mr-2 w-4 h-4"
                    />
                    Share
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CompactLayout>
  );
}

export default memo(ReferralsPage);
