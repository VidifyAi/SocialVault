'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { 
  AlertTriangle, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  MessageSquare,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface FlaggedMessage {
  id: string;
  content: string;
  flagReason: string;
  flagSeverity: 'low' | 'medium' | 'high';
  detectedItems: {
    type: string;
    value: string;
    masked: string;
  }[];
  createdAt: string;
  sender: {
    id: string;
    username: string;
    email: string;
  };
  conversation: {
    id: string;
    participants: {
      user: {
        id: string;
        username: string;
        email: string;
      };
    }[];
    listing?: {
      id: string;
      displayName: string;
      platform: string;
      price: number;
    };
  };
}

interface FlaggedStats {
  total: number;
  bySeverity: {
    high: number;
    medium: number;
    low: number;
  };
  last24h: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminFlaggedMessagesPage() {
  const [messages, setMessages] = useState<FlaggedMessage[]>([]);
  const [stats, setStats] = useState<FlaggedStats | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<FlaggedMessage | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      if (severityFilter) params.append('severity', severityFilter);

      const [messagesRes, statsRes] = await Promise.all([
        api.get(`/admin/messages/flagged?${params}`),
        api.get('/admin/messages/flagged/stats'),
      ]);

      setMessages(messagesRes.data.data.messages);
      setPagination(messagesRes.data.data.pagination);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch flagged messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentPage, severityFilter]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-500 text-white">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const truncateContent = (content: string, length = 50) => {
    if (content.length <= length) return content;
    return content.substring(0, length) + '...';
  };

  if (loading && !messages.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Flagged Messages</h1>
          <p className="text-muted-foreground">
            Monitor messages with potential contact info or payment mentions
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">← Back to Dashboard</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Flagged</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Severity</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.bySeverity.high}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medium Severity</CardTitle>
              <Shield className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.bySeverity.medium}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.last24h}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Messages</CardTitle>
          <CardDescription>
            Messages that contain potential contact information or payment mentions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No flagged messages found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sender</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Listing</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{message.sender.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {message.sender.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="truncate block">
                          {truncateContent(message.content)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[150px]">
                        <span className="text-sm text-muted-foreground">
                          {truncateContent(message.flagReason, 40)}
                        </span>
                      </TableCell>
                      <TableCell>{getSeverityBadge(message.flagSeverity)}</TableCell>
                      <TableCell>
                        {message.conversation.listing ? (
                          <Link
                            href={`/listing/${message.conversation.listing.id}`}
                            className="text-primary hover:underline"
                          >
                            {message.conversation.listing.displayName}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(message.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === pagination.totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              Review the flagged message content and detected items
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Sender</label>
                  <p>
                    {selectedMessage.sender.username} ({selectedMessage.sender.email})
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p>{formatDate(selectedMessage.createdAt)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Participants</label>
                <p className="text-sm text-muted-foreground">
                  {selectedMessage.conversation.participants
                    .map((p) => `${p.user.username} (${p.user.email})`)
                    .join(' ↔ ')}
                </p>
              </div>

              {selectedMessage.conversation.listing && (
                <div>
                  <label className="text-sm font-medium">Related Listing</label>
                  <p>
                    <Link
                      href={`/listing/${selectedMessage.conversation.listing.id}`}
                      className="text-primary hover:underline"
                    >
                      {selectedMessage.conversation.listing.displayName}
                    </Link>
                    {' '}
                    ({selectedMessage.conversation.listing.platform}) - 
                    ${selectedMessage.conversation.listing.price}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Full Message</label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Flag Reason {getSeverityBadge(selectedMessage.flagSeverity)}
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedMessage.flagReason}
                </p>
              </div>

              {selectedMessage.detectedItems && selectedMessage.detectedItems.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Detected Items</label>
                  <div className="mt-2 space-y-2">
                    {selectedMessage.detectedItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded"
                      >
                        <Badge variant="outline">{item.type}</Badge>
                        <code className="text-sm">{item.value}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
