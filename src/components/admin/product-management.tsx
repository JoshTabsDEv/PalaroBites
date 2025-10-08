"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { ImageModal } from "@/components/ui/image-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, DollarSign, Package, Eye, Filter, SortAsc, SortDesc, Search } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

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
interface StoreOption { id: string; name: string }
const defaultStores: StoreOption[] = []

// Strongly-typed rows from Supabase for products with joined store name
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

const categories = [
  "Coffee", "Sandwiches", "Pastries", "Pizza", "Italian", "Fast Food",
  "Healthy", "Salads", "Smoothies", "Burgers", "American", "Comfort Food"
];

export default function ProductManagement() {
  const supabase = createSupabaseBrowserClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreOption[]>(defaultStores);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const pageSize = 20;
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created_at' | 'category'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStore, setFilterStore] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string; alt: string; title: string }>({
    isOpen: false,
    imageUrl: "",
    alt: "",
    title: ""
  });
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    image: "/logo.png",
    storeId: "",
    category: "",
    isAvailable: true
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      // Build query with filters
      let productQuery = supabase
        .from("products")
        .select("id,name,description,price,image,store_id,category,is_available,stores(name)");
      
      // Apply search filter
      if (searchTerm) {
        productQuery = productQuery.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      // Apply store filter
      if (filterStore !== 'all') {
        productQuery = productQuery.eq('store_id', filterStore);
      }
      
      // Apply category filter
      if (filterCategory !== 'all') {
        productQuery = productQuery.eq('category', filterCategory);
      }
      
      // Apply availability filter
      if (filterAvailability !== 'all') {
        productQuery = productQuery.eq('is_available', filterAvailability === 'available');
      }
      
      // Apply sorting
      const ascending = sortOrder === 'asc';
      productQuery = productQuery.order(sortBy, { ascending });
      
      // Create count query (without pagination)
      let countQuery = supabase
        .from("products")
        .select("id", { count: "exact", head: true });
      
      // Apply same filters to count query
      if (searchTerm) {
        countQuery = countQuery.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      if (filterStore !== 'all') {
        countQuery = countQuery.eq('store_id', filterStore);
      }
      if (filterCategory !== 'all') {
        countQuery = countQuery.eq('category', filterCategory);
      }
      if (filterAvailability !== 'all') {
        countQuery = countQuery.eq('is_available', filterAvailability === 'available');
      }
      
      // Apply pagination to main query
      productQuery = productQuery.range(from, to);
      
      const [
        { data: storeRows, error: storeErr },
        { count: totalCnt },
        { data: productRows, error: productErr }
      ] = await Promise.all([
        supabase.from("stores").select("id,name"),
        countQuery,
        productQuery
      ]);
      setTotalProducts(totalCnt || 0);
      if (storeErr) setError(storeErr.message);
      if (productErr) setError(productErr.message);
      if (!storeErr && storeRows) {
        setStores((storeRows as StoreOption[]).map((s) => ({ id: s.id, name: s.name })));
      }
      const getStoreName = (s: ProductRow["stores"]) => Array.isArray(s) ? s[0]?.name || "" : (s?.name || "");
      if (!productErr && productRows) {
        const rows = productRows as ProductRow[];
        if (rows.length === 0 && page > 0) {
          // If we navigated past the end (e.g., after deletions), step back a page
          setPage(page - 1);
          return;
        }
        setProducts(rows.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description ?? "",
          price: Number(p.price ?? 0),
          image: p.image ?? "/logo.png",
          storeId: p.store_id,
          storeName: getStoreName(p.stores),
          category: p.category ?? "",
          isAvailable: Boolean(p.is_available),
        })));
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, supabase, sortBy, sortOrder, searchTerm, filterStore, filterCategory, filterAvailability]);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.storeId) return;
    setError("");
    const payload = {
      name: newProduct.name,
      description: newProduct.description || "",
      price: newProduct.price || 0,
      image: newProduct.image || "/logo.png",
      store_id: newProduct.storeId,
      category: newProduct.category || "",
      is_available: newProduct.isAvailable ?? true,
    };
    const { data, error } = await supabase.from("products").insert(payload).select("id,name,description,price,image,store_id,category,is_available,stores(name)").single();
    if (error) { setError(error.message); return; }
    const d = data as ProductRow;
    const createdStoreName = Array.isArray(d.stores)
      ? (d.stores as { name: string }[])[0]?.name ?? ""
      : (d.stores as { name: string } | undefined)?.name ?? "";
    const created: Product = {
      id: d.id,
      name: d.name,
      description: d.description || "",
      price: Number(d.price || 0),
      image: d.image || "/logo.png",
      storeId: d.store_id,
      storeName: createdStoreName,
      category: d.category || "",
      isAvailable: Boolean(d.is_available),
    };
    // Refresh to first page to include new item deterministically
    setProducts((prev) => prev);
    setPage(0);
    setNewProduct({ name: "", description: "", price: 0, image: "/logo.png", storeId: "", category: "", isAvailable: true });
    setIsAddDialogOpen(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    setError("");
    const payload = {
      name: editingProduct.name,
      description: editingProduct.description,
      price: editingProduct.price,
      image: editingProduct.image,
      store_id: editingProduct.storeId,
      category: editingProduct.category,
      is_available: editingProduct.isAvailable,
    };
    const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
    if (error) { setError(error.message); return; }
    setProducts(products.map(product => product.id === editingProduct.id ? editingProduct : product));
    setIsEditDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    setError("");
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) { setError(error.message); return; }
    const remaining = products.length - 1;
    if (remaining === 0 && page > 0) {
      setPage(page - 1);
    } else {
      setProducts(products.filter(product => product.id !== productId));
    }
  };

  const openImageModal = (imageUrl: string, alt: string, title: string) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      alt,
      title
    });
  };

  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      imageUrl: "",
      alt: "",
      title: ""
    });
  };

  const toggleProductAvailability = async (productId: string) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;
    const next = !target.isAvailable;
    const { error } = await supabase.from("products").update({ is_available: next }).eq("id", productId);
    if (error) { setError(error.message); return; }
    setProducts(products.map(product => product.id === productId ? { ...product, isAvailable: next } : product));
  };

  const handleSortChange = (newSortBy: 'name' | 'price' | 'created_at' | 'category') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    setPage(0); // Reset to first page when sorting changes
  };

  const handleFilterChange = () => {
    setPage(0); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStore('all');
    setFilterCategory('all');
    setFilterAvailability('all');
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600">Manage products, prices, and availability</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product for your stores
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Enter product description"
                />
              </div>
              <div>
                <ImageUpload
                  value={newProduct.image}
                  onChange={(value) => setNewProduct({...newProduct, image: value})}
                  label="Product Image"
                  placeholder="Enter image URL or upload a file"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store">Store</Label>
                  <Select value={newProduct.storeId} onValueChange={(value) => setNewProduct({...newProduct, storeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct}>
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleFilterChange();
                }}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Store Filter */}
          <div>
            <Label htmlFor="store-filter">Store</Label>
            <Select value={filterStore} onValueChange={(value) => {
              setFilterStore(value);
              handleFilterChange();
            }}>
              <SelectTrigger>
                <SelectValue placeholder="All Stores" />
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

          {/* Category Filter */}
          <div>
            <Label htmlFor="category-filter">Category</Label>
            <Select value={filterCategory} onValueChange={(value) => {
              setFilterCategory(value);
              handleFilterChange();
            }}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
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
          </div>

          {/* Availability Filter */}
          <div>
            <Label htmlFor="availability-filter">Availability</Label>
            <Select value={filterAvailability} onValueChange={(value) => {
              setFilterAvailability(value);
              handleFilterChange();
            }}>
              <SelectTrigger>
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="available">Available Only</SelectItem>
                <SelectItem value="unavailable">Unavailable Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div>
            <Label htmlFor="sort-options">Sort By</Label>
            <div className="flex gap-1">
              <Select value={sortBy} onValueChange={(value: 'name' | 'price' | 'created_at' | 'category') => handleSortChange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || filterStore !== 'all' || filterCategory !== 'all' || filterAvailability !== 'all') && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchTerm}"
                <button onClick={() => { setSearchTerm(''); handleFilterChange(); }} className="ml-1 hover:text-red-500">×</button>
              </Badge>
            )}
            {filterStore !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Store: {stores.find(s => s.id === filterStore)?.name}
                <button onClick={() => { setFilterStore('all'); handleFilterChange(); }} className="ml-1 hover:text-red-500">×</button>
              </Badge>
            )}
            {filterCategory !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {filterCategory}
                <button onClick={() => { setFilterCategory('all'); handleFilterChange(); }} className="ml-1 hover:text-red-500">×</button>
              </Badge>
            )}
            {filterAvailability !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filterAvailability === 'available' ? 'Available Only' : 'Unavailable Only'}
                <button onClick={() => { setFilterAvailability('all'); handleFilterChange(); }} className="ml-1 hover:text-red-500">×</button>
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-sm text-gray-500">Loading products...</div>
        ) : products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="text-sm">{product.description}</CardDescription>
                </div>
                <Badge variant={product.isAvailable ? "default" : "secondary"}>
                  {product.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>
              {/* Product Image Preview */}
              {product.image && product.image !== "/logo.png" && (
                <div className="mt-3 relative group">
                  <div 
                    className="w-full h-32 border rounded-lg overflow-hidden bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openImageModal(product.image, product.name, `${product.name} - Product Image`)}
                  >
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                    onClick={() => openImageModal(product.image, product.name, `${product.name} - Product Image`)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-4 w-4 mr-2" />
                {product.storeName}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                ${product.price.toFixed(2)}
              </div>
              
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleProductAvailability(product.id)}
                  className="flex-1"
                >
                  {product.isAvailable ? "Mark Unavailable" : "Mark Available"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditProduct(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteProduct(product.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-gray-600">
          Page {page + 1} of {Math.max(1, Math.ceil(totalProducts / pageSize))}
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={(page + 1) * pageSize >= totalProducts}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information and pricing
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                />
              </div>
              <div>
                <ImageUpload
                  value={editingProduct.image}
                  onChange={(value) => setEditingProduct({...editingProduct, image: value})}
                  label="Product Image"
                  placeholder="Enter image URL or upload a file"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-store">Store</Label>
                  <Select value={editingProduct.storeId} onValueChange={(value) => {
                    const selectedStore = stores.find(store => store.id === value);
                    setEditingProduct({...editingProduct, storeId: value, storeName: selectedStore?.name || ""});
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={editingProduct.category} onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct}>
              Update Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        imageUrl={imageModal.imageUrl}
        alt={imageModal.alt}
        title={imageModal.title}
      />
    </div>
  );
}
