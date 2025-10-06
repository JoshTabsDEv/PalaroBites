"use client"

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { ArrowRight, RefreshCcw } from "lucide-react";

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface OrderRow {
  id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  status: OrderStatus;
  created_at: string;
}

export default function OrderManagement() {
  const supabase = createSupabaseBrowserClient();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const statusOptions: Array<{ value: OrderStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const statusBadge = (status: OrderStatus) => {
    const map: Record<OrderStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      out_for_delivery: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return map[status];
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('id,user_id,customer_name,customer_phone,total,status,created_at')
      .order('created_at', { ascending: false });
    if (!error && data) setOrders(data );
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' ? true : o.status === statusFilter;
      const term = search.trim().toLowerCase();
      const matchesSearch = term
        ? (o.customer_name.toLowerCase().includes(term) || o.customer_phone.toLowerCase().includes(term) || o.id.toLowerCase().includes(term))
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, search]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const startChat = async (userId: string) => {
    // Admin-initiated conversation unlocks user sending
    await supabase
      .from('conversations')
      .upsert({ user_id: userId, admin_started: true }, { onConflict: 'user_id' });
    window.open('/chat', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">View, filter, and update orders</p>
        </div>
        <Button variant="outline" onClick={load}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input placeholder="Search by name, phone, or order ID" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading orders...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <Card key={o.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">Order #{o.id.slice(-8)}</span>
                      <Badge className={statusBadge(o.status)}>{o.status.replaceAll('_',' ')}</Badge>
                    </div>
                    <div className="text-sm text-gray-700 mt-1 truncate">{o.customer_name} • {o.customer_phone}</div>
                    <div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right w-full sm:w-auto">
                    <div className="text-lg font-semibold">₱{o.total.toFixed(2)}</div>
                    <div className="mt-2 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateStatus(o.id, 'confirmed')}>Confirm</Button>
                      <Button variant="outline" size="sm" onClick={() => updateStatus(o.id, 'preparing')}>Preparing</Button>
                      <Button variant="outline" size="sm" onClick={() => updateStatus(o.id, 'out_for_delivery')}>Out</Button>
                      <Button variant="outline" size="sm" onClick={() => updateStatus(o.id, 'delivered')}>Delivered</Button>
                      <Button variant="outline" size="sm" onClick={() => updateStatus(o.id, 'cancelled')}>Cancel</Button>
                      <Button variant="default" size="sm" onClick={() => startChat(o.user_id)}>Chat</Button>
                      <Button className="col-span-2 sm:col-span-1" variant="ghost" size="sm" onClick={() => window.open(`/order-success?orderId=${o.id}`, '_blank')}>
                        Details <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-gray-500">No orders match your filters.</div>
          )}
        </div>
      )}
    </div>
  );
}


