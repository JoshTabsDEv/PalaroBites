"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, Clock } from "lucide-react";

interface OrderListItem {
  id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: Array<{ product_name: string; quantity: number; store_name: string }>;
}

export default function OrdersPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id;
      if (!userId) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`id,total,status,created_at,order_items(product_name,quantity,store_name)`) 
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) setOrders(data as any);
      setLoading(false);
    };
    loadOrders();
  }, [router, supabase]);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      out_for_delivery: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">View your recent orders and their status</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No orders yet</CardTitle>
              <CardDescription>Start adding items to your cart and checkout.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="font-medium">Order #{order.id.slice(-8)}</span>
                        <Badge className={statusBadge(order.status)}>{order.status.replaceAll('_',' ')}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-700 mt-2">
                        {order.order_items.slice(0,2).map((i) => `${i.product_name} x${i.quantity}`).join(', ')}{order.order_items.length > 2 ? '...' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">₱{order.total.toFixed(2)}</div>
                      <Button className="mt-2" variant="outline" onClick={() => router.push(`/order-success?orderId=${order.id}`)}>
                        View Details <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


