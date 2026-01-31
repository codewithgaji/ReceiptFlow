import { useState } from 'react';
import { Save, Send, CheckCircle2, XCircle, Loader2, Building2, Mail, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { defaultBusinessSettings, simulateApiCall } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultBusinessSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    await simulateApiCall(null, 1000);
    setIsSaving(false);
    toast({
      title: 'Settings Saved',
      description: 'Your business settings have been updated',
    });
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter an email address',
      });
      return;
    }

    setIsSendingTest(true);
    await simulateApiCall(null, 1500);
    setIsSendingTest(false);
    toast({
      title: 'Test Email Sent',
      description: `A sample receipt was sent to ${testEmail}`,
    });
    setTestEmail('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-header">Settings</h1>
        <p className="page-description">Configure your receipt generation system</p>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <Cloud className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Cloudinary</p>
                <p className="text-sm text-muted-foreground">Cloud storage connected</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <Mail className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Email Service</p>
                <p className="text-sm text-muted-foreground">SMTP configured</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>This information appears on your receipts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input
                id="taxId"
                value={settings.taxId}
                onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City & Postal Code</Label>
              <Input
                id="city"
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={settings.country}
                onChange={(e) => setSettings({ ...settings, country: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              value={settings.logoUrl}
              onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Template Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Email Template</CardTitle>
              <CardDescription>Preview and test your email template</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Preview */}
          <div className="bg-muted/50 rounded-lg p-6 border border-border">
            <div className="bg-card rounded-lg shadow-sm border border-border max-w-md mx-auto">
              <div className="p-6 text-center border-b border-border">
                <div className="h-8 w-32 bg-primary/20 rounded mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{settings.name}</p>
              </div>
              <div className="p-6 space-y-4">
                <h3 className="font-semibold text-center">Thank you for your purchase!</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Your receipt is attached to this email. You can also download it using the button below.
                </p>
                <div className="flex justify-center">
                  <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium">
                    Download Receipt
                  </div>
                </div>
              </div>
              <div className="p-4 bg-muted/50 text-center text-xs text-muted-foreground">
                <p>{settings.address}</p>
                <p>{settings.city}, {settings.country}</p>
                <p>{settings.email}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Test Email */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="testEmail" className="sr-only">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="Enter email to receive test receipt"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleSendTestEmail} disabled={isSendingTest} variant="outline">
              {isSendingTest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Backend API endpoint settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Endpoint</Label>
            <div className="flex items-center gap-2">
              <Input value="https://api.receiptflow.com/v1" readOnly className="bg-muted" />
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" />
                Connected
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input type="password" value="sk_live_xxxxxxxxxxxxxxxxxxxx" readOnly className="bg-muted" />
          </div>
          <p className="text-xs text-muted-foreground">
            API keys are managed in your FastAPI backend. Changes here will not affect the actual configuration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
