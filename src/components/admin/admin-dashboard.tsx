"use client"

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Package, Users, DollarSign, Plus } from "lucide-react";
import StoreManagement from "@/components/admin/store-management";
import ProductManagement from "@/components/admin/product-management";
import OrderManagement from "./order-management";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'products' | 'orders'>('overview');
  const supabase = createSupabaseBrowserClient();

  const [storeCount, setStoreCount] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);
  const [activeOrders, setActiveOrders] = useState<number>(0);
  const [todaysRevenue, setTodaysRevenue] = useState<number>(0);
  const [activity, setActivity] = useState<Array<{ kind: 'Store'|'Product'|'Order'; title: string; when: string }>>([]);

  useEffect(() => {
    const loadStats = async () => {
      // total stores
      const { count: storesCnt } = await supabase
        .from('stores')
        .select('id', { count: 'exact', head: true });
      setStoreCount(storesCnt || 0);

      // total products
      const { count: productsCnt } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true });
      setProductCount(productsCnt || 0);

      // active orders (not delivered/cancelled)
      const { count: activeCnt } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending','confirmed','preparing','out_for_delivery']);
      setActiveOrders(activeCnt || 0);

      // today's revenue (sum total where created_at is today and status not cancelled)
      const start = new Date();
      start.setHours(0,0,0,0);
      const { data: revenueRows } = await supabase
        .from('orders')
        .select('total,status,created_at')
        .gte('created_at', start.toISOString());
      const revenue = (revenueRows || [])
        .filter(r => r.status !== 'cancelled')
        .reduce((sum, r: any) => sum + Number(r.total || 0), 0);
      setTodaysRevenue(revenue);

      // recent activity: latest stores/products/orders
      type StoreRecentRow = { name: string; updated_at: string | null; created_at: string };
      type ProductRecentRow = { name: string; updated_at: string | null; created_at: string };
      type OrderRecentRow = { customer_name: string; total: number | null; created_at: string };
      const [storesRecent, productsRecent, ordersRecent] = await Promise.all([
        supabase.from('stores').select('name,updated_at,created_at').order('updated_at', { ascending: false }).limit(5),
        supabase.from('products').select('name,updated_at,created_at').order('updated_at', { ascending: false }).limit(5),
        supabase.from('orders').select('customer_name,total,created_at').order('created_at', { ascending: false }).limit(5)
      ]);
      const items: Array<{ kind: 'Store'|'Product'|'Order'; title: string; when: string; ts: string }> = [];
      if (storesRecent.data) {
        (storesRecent.data as StoreRecentRow[]).forEach((s) => items.push({ kind: 'Store', title: `${s.name} updated`, when: new Date(s.updated_at || s.created_at).toLocaleString(), ts: (s.updated_at || s.created_at) }));
      }
      if (productsRecent.data) {
        (productsRecent.data as ProductRecentRow[]).forEach((p) => items.push({ kind: 'Product', title: `New/updated product: ${p.name}`, when: new Date(p.updated_at || p.created_at).toLocaleString(), ts: (p.updated_at || p.created_at) }));
      }
      if (ordersRecent.data) {
        (ordersRecent.data as OrderRecentRow[]).forEach((o) => items.push({ kind: 'Order', title: `Order from ${o.customer_name} • ₱${Number(o.total||0).toFixed(2)}`, when: new Date(o.created_at).toLocaleString(), ts: o.created_at }));
      }
      items.sort((a,b) => (new Date(b.ts).getTime() - new Date(a.ts).getTime()));
      const trimmed = items.slice(0,6).map((i) => ({ kind: i.kind, title: i.title, when: i.when }));
      setActivity(trimmed);
    };
    loadStats();
  }, [supabase]);

  const stats = [
    { title: "Total Stores", value: String(storeCount), icon: Store, color: "text-blue-600" },
    { title: "Total Products", value: String(productCount), icon: Package, color: "text-green-600" },
    { title: "Active Orders", value: String(activeOrders), icon: Users, color: "text-orange-600" },
    { title: "Today's Revenue", value: `₱${todaysRevenue.toFixed(2)}`, icon: DollarSign, color: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.email?.split('@')[0]}</p>
            </div>
            <Button onClick={() => window.location.href = '/'} variant="dark">
              Back to Site
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'overview' ? 'dark' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="px-6"
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'stores' ? 'dark' : 'ghost'}
            onClick={() => setActiveTab('stores')}
            className="px-6"
          >
            Stores
          </Button>
          <Button
            variant={activeTab === 'products' ? 'dark' : 'ghost'}
            onClick={() => setActiveTab('products')}
            className="px-6"
          >
            Products
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'dark' : 'ghost'}
            onClick={() => setActiveTab('orders')}
            className="px-6"
          >
            Orders
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Store Management
                  </CardTitle>
                  <CardDescription>
                    Add, edit, or remove stores from your platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setActiveTab('stores')} className="w-full" variant="dark">
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Stores
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Management
                  </CardTitle>
                  <CardDescription>
                    Add, edit, or remove products and set prices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setActiveTab('products')} className="w-full" variant="dark">
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Products
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Order Management
                  </CardTitle>
                  <CardDescription>
                    View and update customer orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setActiveTab('orders')} className="w-full" variant="dark">
                    <Plus className="h-4 w-4 mr-2" />
                    Manage Orders
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activity.length === 0 ? (
                    <div className="text-sm text-gray-500">No recent activity yet.</div>
                  ) : (
                    activity.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{item.kind}</Badge>
                          <span className="text-sm">{item.title}</span>
                        </div>
                        <span className="text-xs text-gray-500">{item.when}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'stores' && <StoreManagement />}
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'orders' && <OrderManagement />}
      </div>
    </div>
  );
}
