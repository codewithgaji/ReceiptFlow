import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Mail, HardDrive, TrendingUp, Plus, ListOrdered } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentReceiptsTable } from '@/components/dashboard/RecentReceiptsTable';
import { ReceiptPreviewModal } from '@/components/dashboard/ReceiptPreviewModal';
import { Button } from '@/components/ui/button';
import { mockReceipts, getStats, simulateApiCall, Receipt } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stats, setStats] = useState({ totalReceipts: 0, todayReceipts: 0, storageUsed: '0', emailsSent: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [receiptsData, statsData] = await Promise.all([
        simulateApiCall(mockReceipts.slice(0, 5)),
        simulateApiCall(getStats()),
      ]);
      setReceipts(receiptsData);
      setStats(statsData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleView = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setModalOpen(true);
  };

  const handleDownload = (receipt: Receipt) => {
    toast({
      title: 'Downloading Receipt',
      description: `${receipt.id} is being downloaded...`,
    });
  };

  const handleResend = (receipt: Receipt) => {
    toast({
      title: 'Email Sent',
      description: `Receipt resent to ${receipt.customerEmail}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Dashboard</h1>
          <p className="page-description">Overview of your receipt generation system</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard/receipts')}>
            <ListOrdered className="h-4 w-4 mr-2" />
            View All Orders
          </Button>
          <Button onClick={() => navigate('/dashboard/orders')}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Receipt
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Receipts"
          value={isLoading ? '—' : stats.totalReceipts}
          subtitle="All time"
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Receipts Today"
          value={isLoading ? '—' : stats.todayReceipts}
          subtitle="Generated today"
          icon={TrendingUp}
        />
        <StatCard
          title="Emails Sent"
          value={isLoading ? '—' : stats.emailsSent}
          subtitle="Successfully delivered"
          icon={Mail}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Storage Used"
          value={isLoading ? '—' : `${stats.storageUsed} MB`}
          subtitle="Cloudinary storage"
          icon={HardDrive}
        />
      </div>

      {/* Recent Receipts */}
      <RecentReceiptsTable
        receipts={receipts}
        onView={handleView}
        onDownload={handleDownload}
        onResend={handleResend}
        isLoading={isLoading}
      />

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        receipt={selectedReceipt}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onDownload={handleDownload}
        onResend={handleResend}
      />
    </div>
  );
}
