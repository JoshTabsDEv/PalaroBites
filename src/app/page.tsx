
"use client"

import FooterSection from "@/components/sections/footer/default";
import Hero from "@/components/sections/hero/default";
import Navbar from "@/components/sections/navbar/default";
import { StoreCard } from "@/components/store-card";
import { useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Store, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { StoreCardSkeleton, ProductCardSkeleton } from "@/components/ui/loading-skeleton";
 
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
  const [currentStorePage, setCurrentStorePage] = useState(1);
  const storesPerPage = 3;
  const supabase = createSupabaseBrowserClient();
  const productsSectionRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((p) => p.category).filter((c) => Boolean(c)))
    ) as string[];
    return unique.sort();
  }, [products]);

  // Pagination logic for stores
  const totalStorePages = Math.ceil(stores.length / storesPerPage);
  const startIndex = (currentStorePage - 1) * storesPerPage;
  const endIndex = startIndex + storesPerPage;
  const currentStores = stores.slice(startIndex, endIndex);

  // Reset to first page when stores change
  useEffect(() => {
    setCurrentStorePage(1);
  }, [stores.length]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Load both stores and products in parallel for better performance
        const [storesResult, productsResult] = await Promise.all([
          supabase
            .from("stores")
            .select("id,name,description,image,rating,delivery_time,location,phone,is_open,categories")
            .eq("is_open", true)
            .order("name", { ascending: true }),
          supabase
            .from("products")
            .select("id,name,description,price,image,store_id,category,is_available,stores(name)")
            .eq("is_available", true)
            .order("name", { ascending: true })
        ]);

        // Process stores data
        if (storesResult.error) {
          console.error("Error loading stores:", storesResult.error);
        } else {
          const rows = (storesResult.data || []) as StoreRow[];
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

        // Process products data
        if (productsResult.error) {
          console.error("Error loading products:", productsResult.error);
        } else {
          const getStoreName = (s: ProductRow["stores"]) => Array.isArray(s) ? s[0]?.name || "" : (s?.name || "");
          const rows = (productsResult.data || []) as ProductRow[];
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
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase]);

  

  const handleStoreSelect = (storeId: string) => {
    // Switch to products view, filter by store, then scroll to products section
    setShowProducts(true);
    setSelectedStore(storeId);
    setTimeout(() => {
      productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handlePreviousPage = () => {
    setCurrentStorePage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentStorePage(prev => Math.min(prev + 1, totalStorePages));
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
              <p className="text-lg text-gray-600">
                Choose from our selection of campus stores
                {!loading && stores.length > 0 && (
                  <span className="block text-sm text-gray-500 mt-1">
                    Showing {currentStores.length} of {stores.length} stores
                  </span>
                )}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                // Show skeleton loading for stores
                Array.from({ length: storesPerPage }).map((_, index) => (
                  <StoreCardSkeleton key={index} />
                ))
              ) : (
                currentStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onSelect={handleStoreSelect}
                  />
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {!loading && stores.length > storesPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={currentStorePage === 1}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <span className="text-sm text-gray-600">
                    Page {currentStorePage} of {totalStorePages}
                  </span>
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(totalStorePages, 5) }, (_, i) => {
                      // Show max 5 page numbers, with smart pagination
                      let pageNum;
                      if (totalStorePages <= 5) {
                        pageNum = i + 1;
                      } else if (currentStorePage <= 3) {
                        pageNum = i + 1;
                      } else if (currentStorePage >= totalStorePages - 2) {
                        pageNum = totalStorePages - 4 + i;
                      } else {
                        pageNum = currentStorePage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentStorePage(pageNum)}
                          className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                            currentStorePage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentStorePage === totalStorePages}
                  className="flex items-center space-x-2"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Products View */
          <div ref={productsSectionRef} className="space-y-8">
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
              {loading ? (
                // Show skeleton loading for products
                Array.from({ length: 12 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))
              ) : (
                filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription className="text-sm">{product.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                    {/* Product Image Preview */}
                    {product.image && product.image !== "/logo.png" && (
                      <div className="mt-3 w-full h-32 border rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
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
                ))
              )}
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
