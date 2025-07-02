'use client';

import { AuthGuard } from '@/components/auth';
import { AppLayout } from '@/components/layout';
import { GmailToTaskConverter } from '@/components/gmail';
import { useGoogleAuth } from '@/hooks/useGoogleIntegration';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Mail } from 'lucide-react';
import { withFeatureFlag } from '@/components/FeatureFlag';

function GmailIntegrationPage() {
  usePageTitle('Gmail to Tasks - Personal Hub');
  const { hasIntegration, initiateAuth } = useGoogleAuth();

  if (!hasIntegration) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Gmail Integration
              </CardTitle>
              <CardDescription>
                Connect your Gmail account to convert emails into tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This feature allows you to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Search and browse your Gmail messages</li>
                <li>Convert important emails into actionable tasks</li>
                <li>Set priorities and due dates for email-based tasks</li>
                <li>Keep track of email-related work items</li>
              </ul>
              <Button onClick={initiateAuth} className="w-full">
                Connect Gmail Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gmail to Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Convert your emails into actionable tasks
          </p>
        </div>

        <GmailToTaskConverter />
      </div>
    </AppLayout>
  );
}

const FeatureFlaggedGmailPage = withFeatureFlag(
  'gmailIntegration',
  <AppLayout>
    <div className="max-w-2xl mx-auto py-8">
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gmail Integration Temporarily Unavailable
          </CardTitle>
          <CardDescription>
            This feature is currently under maintenance and will be available soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
)(GmailIntegrationPage);

export default function GmailIntegration() {
  return (
    <AuthGuard>
      <FeatureFlaggedGmailPage />
    </AuthGuard>
  );
}