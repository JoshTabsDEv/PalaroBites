"use client"

import { useEffect, useRef, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Package, Users, DollarSign, Plus, RefreshCw } from "lucide-react";
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
  const [newOrderNotice, setNewOrderNotice] = useState<{ visible: boolean; title: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const refreshIntervalRef = useRef<number | null>(null);
  const previousActivityRef = useRef<Array<{ kind: 'Store'|'Product'|'Order'; title: string; when: string }>>([]);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      };
      
      // Load voices immediately and when they change
      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
      
      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const playActivitySound = () => {
    try {
      type AudioContextWindow = { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const w = window as unknown as AudioContextWindow;
      const AudioContextCtor = w.AudioContext ?? w.webkitAudioContext;
      if (AudioContextCtor) {
        const ctx = new AudioContextCtor();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 660; // E5 - different from order notification sound
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0.001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        o.start();
        o.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // ignore audio errors
    }
  };

  const playOrderNotificationSound = (enableVoice = true) => {
    console.log('playOrderNotificationSound called, voice enabled:', enableVoice);
    try {
      // Play AI voice saying "new order" only if enabled
      if (enableVoice && 'speechSynthesis' in window) {
        console.log('Playing AI voice: "New order"');
        
        // Cancel any ongoing speech first
        speechSynthesis.cancel();
        
        // Try multiple approaches to ensure speech works
        const speakText = () => {
          const utterance = new SpeechSynthesisUtterance('New order');
          utterance.volume = 1.0; // Maximum volume
          utterance.rate = 0.8; // Slower for clarity
          utterance.pitch = 1.0; // Normal pitch
          utterance.lang = 'en-US'; // Explicit language
          
          // Try to use a better voice if available
          const voices = speechSynthesis.getVoices();
          const preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Alex') || voice.name.includes('Samantha'))
          );
          if (preferredVoice) {
            utterance.voice = preferredVoice;
            console.log('Using voice:', preferredVoice.name);
          } else if (voices.length > 0) {
            // Use first available English voice
            const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
            if (englishVoice) {
              utterance.voice = englishVoice;
              console.log('Using English voice:', englishVoice.name);
            }
          }
          
          utterance.onstart = () => console.log('Speech started');
          utterance.onend = () => console.log('Speech ended');
          utterance.onerror = (e) => {
            console.error('Speech error:', e);
            // Try again with simpler settings if first attempt fails
            if (e.error === 'not-allowed') {
              console.log('Speech blocked, trying alternative approach...');
              setTimeout(() => {
                const simpleUtterance = new SpeechSynthesisUtterance('New order');
                simpleUtterance.volume = 0.5;
                simpleUtterance.rate = 1.0;
                speechSynthesis.speak(simpleUtterance);
              }, 200);
            }
          };
          
          speechSynthesis.speak(utterance);
        };
        
        // Try immediately and with a delay
        speakText();
        setTimeout(speakText, 100);
      } else if (!enableVoice) {
        console.log('Voice disabled for this notification');
      } else {
        console.log('Speech synthesis not available');
      }

      // Play enhanced sound notification
      type AudioContextWindow = { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const w = window as unknown as AudioContextWindow;
      const AudioContextCtor = w.AudioContext ?? w.webkitAudioContext;
      if (AudioContextCtor) {
        console.log('Creating audio context for sound notification');
        const ctx = new AudioContextCtor();
        
        // Create a more complex sound with multiple frequencies
        const frequencies = [880, 1100, 1320]; // A5, C#6, E6 - pleasant chord
        const oscillators = frequencies.map(freq => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = freq;
          o.connect(g);
          g.connect(ctx.destination);
          return { oscillator: o, gain: g };
        });

        const duration = 0.8; // Longer duration
        const now = ctx.currentTime;

        oscillators.forEach(({ oscillator, gain }) => {
          // Louder volume with smooth fade
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.4, now + 0.05); // Much louder
          gain.gain.exponentialRampToValueAtTime(0.3, now + duration * 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
          
          oscillator.start(now);
          oscillator.stop(now + duration);
        });
        console.log('Audio oscillators started');
      } else {
        console.log('AudioContext not available');
      }
    } catch (error) {
      console.error('Error in playOrderNotificationSound:', error);
    }
  };

  const loadStats = async () => {
    setIsRefreshing(true);
    try {
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
      type RevenueRow = { total: number | null; status: string; created_at: string };
      const { data: revenueRows } = await supabase
        .from('orders')
        .select('total,status,created_at')
        .gte('created_at', start.toISOString());
      const revenue = ((revenueRows as RevenueRow[]) || [])
        .filter((r) => r.status !== 'cancelled')
        .reduce((sum, r) => sum + Number(r.total ?? 0), 0);
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
      
      // Check for new activity items and play sound
      const previousActivity = previousActivityRef.current;
      if (previousActivity.length > 0 && trimmed.length > 0) {
        const newItems = trimmed.filter(newItem => 
          !previousActivity.some(prevItem => 
            prevItem.title === newItem.title && prevItem.when === newItem.when
          )
        );
        if (newItems.length > 0) {
          playActivitySound();
        }
      }
      
      setActivity(trimmed);
      previousActivityRef.current = trimmed;
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [supabase]);

  // Realtime: notify on new orders with sound
  useEffect(() => {
    console.log('Setting up realtime order notifications...');
    const channel = supabase
      .channel('orders-inserts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        console.log('New order detected:', payload);
        try {
          const record = payload.new as { customer_name?: string; total?: number; id?: string };
          const customer = record?.customer_name || 'New customer';
          const total = Number(record?.total || 0);
          console.log('Order details:', { customer, total, id: record?.id });
          
          setNewOrderNotice({ visible: true, title: `New order from ${customer} • ₱${total.toFixed(2)}` });

          // Increment active orders optimistically
          setActiveOrders((v) => v + 1);

          // Play enhanced order notification sound with AI voice
          console.log('Playing order notification sound...');
          playOrderNotificationSound(voiceEnabled);

          // Auto-hide after 4s
          if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
          hideTimerRef.current = window.setTimeout(() => setNewOrderNotice(null), 4000);
        } catch (error) {
          console.error('Error processing new order:', error);
        }
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefreshEnabled) {
      refreshIntervalRef.current = window.setInterval(() => {
        loadStats();
      }, 5000); // Refresh every 5 seconds
    } else {
      if (refreshIntervalRef.current) {
        window.clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        window.clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefreshEnabled]);

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };

  const handleManualRefresh = () => {
    loadStats();
  };

  const enableVoiceNotifications = () => {
    if ('speechSynthesis' in window) {
      // Test speech synthesis to enable it for future use
      const utterance = new SpeechSynthesisUtterance('Voice notifications enabled');
      utterance.volume = 0.1; // Very quiet test
      utterance.rate = 1.5; // Fast
      speechSynthesis.speak(utterance);
      setVoiceEnabled(true);
      console.log('Voice notifications enabled');
    }
  };

  const stats = [
    { title: "Total Stores", value: String(storeCount), icon: Store, color: "text-blue-600" },
    { title: "Total Products", value: String(productCount), icon: Package, color: "text-green-600" },
    { title: "Active Orders", value: String(activeOrders), icon: Users, color: "text-orange-600" },
    { title: "Today's Revenue", value: `₱${todaysRevenue.toFixed(2)}`, icon: DollarSign, color: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* New Order Notification */}
      {newOrderNotice?.visible && (
        <div className="fixed top-4 right-4 z-50">
          <div className="rounded-lg shadow-lg border bg-white px-4 py-3 max-w-sm">
            <div className="flex items-start gap-3">
              <Badge>Order</Badge>
              <div className="text-sm text-gray-900">{newOrderNotice.title}</div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.email?.split('@')[0]}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleManualRefresh} 
                variant="outline" 
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button 
                onClick={toggleAutoRefresh} 
                variant={autoRefreshEnabled ? "dark" : "outline"}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {autoRefreshEnabled ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
              </Button>
              <Button 
                onClick={() => playOrderNotificationSound(true)} 
                variant="outline"
                className="flex items-center gap-2"
              >
                🔊 Test Sound
              </Button>
              <Button 
                onClick={enableVoiceNotifications} 
                variant={voiceEnabled ? "dark" : "outline"}
                className="flex items-center gap-2"
              >
                🎤 {voiceEnabled ? 'Voice ON' : 'Enable Voice'}
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="dark">
                Back to Site
              </Button>
            </div>
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
