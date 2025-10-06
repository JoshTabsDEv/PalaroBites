
"use client"

import FooterSection from "@/components/sections/footer/default";
import Hero from "@/components/sections/hero/default";
import Navbar from "@/components/sections/navbar/default";
import { StoreCard } from "@/components/store-card";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Store, Package } from "lucide-react";
 
import AddToCartButton from "@/components/cart/add-to-cart-button";

interface Store {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  location: string;
  phone: string;
  isOpen: boolean;
  categories: string[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  storeId: string;
  storeName: string;
  category: string;
  isAvailable: boolean;
}

// Supabase row types
type StoreRow = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  rating: number | null;
  delivery_time: string | null;
  location: string | null;
  phone: string | null;
  is_open: boolean | null;
  categories: string[] | null;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image: string | null;
  store_id: string;
  category: string | null;
  is_available: boolean | null;
  stores?: { name: string } | { name: string }[] | null;
};

export default function Home() {
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStore, setSelectedStore] = useState("all");
  const [showProducts, setShowProducts] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((p) => p.category).filter((c) => Boolean(c)))
    ) as string[];
    return unique.sort();
  }, [products]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load stores
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id,name,description,image,rating,delivery_time,location,phone,is_open,categories")
        .eq("is_open", true)
        .order("name", { ascending: true });

      if (storeError) {
        console.error("Error loading stores:", storeError);
      } else {
        const rows = (storeData || []) as StoreRow[];
        const mappedStores: Store[] = rows.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description ?? "",
          image: s.image ?? "/logo.png",
          rating: Number(s.rating ?? 0),
          deliveryTime: s.delivery_time ?? "",
          location: s.location ?? "",
          phone: s.phone ?? "",
          isOpen: Boolean(s.is_open),
          categories: Array.isArray(s.categories) ? s.categories : [],
        }));
        setStores(mappedStores);
      }

      // Load products
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("id,name,description,price,image,store_id,category,is_available,stores(name)")
        .eq("is_available", true)
        .order("name", { ascending: true });

      if (productError) {
        console.error("Error loading products:", productError);
      } else {
        const getStoreName = (s: ProductRow["stores"]) => Array.isArray(s) ? s[0]?.name || "" : (s?.name || "");
        const rows = (productData || []) as ProductRow[];
        const mappedProducts: Product[] = rows.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description ?? "",
          price: Number(p.price ?? 0),
          image: p.image ?? "/logo.png",
          storeId: p.store_id,
          storeName: getStoreName(p.stores),
          category: p.category ?? "",
          isAvailable: Boolean(p.is_available),
        }));
        setProducts(mappedProducts);
      }

      setLoading(false);
    };

    loadData();
  }, [supabase]);

  

  const handleStoreSelect = (storeId: string) => {
    // Switch to products view and filter by the selected store
    setShowProducts(true);
    setSelectedStore(storeId);
    // Optional: scroll to products section
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesStore = selectedStore === "all" || product.storeId === selectedStore;
    
    return matchesSearch && matchesCategory && matchesStore;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stores and products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Hero />

      
      
      {/* Store and Product Browser */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Toggle Buttons */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <Button
              variant={!showProducts ? "default" : "ghost"}
              onClick={() => setShowProducts(false)}
              className="px-6"
            >
              <Store className="h-4 w-4 mr-2" />
              Browse Stores
            </Button>
            <Button
              variant={showProducts ? "default" : "ghost"}
              onClick={() => setShowProducts(true)}
              className="px-6"
            >
              <Package className="h-4 w-4 mr-2" />
              Browse Products
            </Button>
          </div>
        </div>

        {!showProducts ? (
          /* Stores View */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Stores</h2>
              <p className="text-lg text-gray-600">Choose from our selection of campus stores</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onSelect={handleStoreSelect}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Products View */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">All Products</h2>
              <p className="text-lg text-gray-600">Browse all available products across stores</p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription className="text-sm">{product.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Store className="h-4 w-4 mr-2" />
                      {product.storeName}
                    </div>
                    <div className="flex items-center text-lg font-semibold text-green-600">
                      ₱{product.price.toFixed(2)}
                    </div>
                    <div className="space-y-2">
                      <AddToCartButton 
                        product={{
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          storeId: product.storeId,
                          storeName: product.storeName,
                          image: product.image,
                        }}
                        className="w-full"
                      />
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => handleStoreSelect(product.storeId)}
                      >
                        View Store
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      <FooterSection />
    </div>
  );
}
