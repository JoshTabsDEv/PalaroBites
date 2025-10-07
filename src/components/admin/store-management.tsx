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
import { Plus, Edit, Trash2, MapPin, Clock, Star, Phone, Eye, EyeOff } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

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

export default function StoreManagement() {
  const supabase = createSupabaseBrowserClient();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string; alt: string; title: string }>({
    isOpen: false,
    imageUrl: "",
    alt: "",
    title: ""
  });
  const [newStore, setNewStore] = useState<Partial<Store>>({
    name: "",
    description: "",
    image: "/logo.png",
    rating: 0,
    deliveryTime: "",
    location: "",
    phone: "",
    isOpen: true,
    categories: []
  });

  useEffect(() => {
    const loadStores = async () => {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("stores")
        .select("id,name,description,image,rating,delivery_time,location,phone,is_open,categories")
        .order("name", { ascending: true });
      if (error) {
        setError(error.message);
      } else {
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
        const rows = (data || []) as StoreRow[];
        const mapped: Store[] = rows.map((s) => ({
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
        setStores(mapped);
      }
      setLoading(false);
    };
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddStore = async () => {
    if (!newStore.name) return;
    setError("");
    const payload = {
      name: newStore.name,
      description: newStore.description || "",
      image: newStore.image || "/logo.png",
      rating: newStore.rating || 0,
      delivery_time: newStore.deliveryTime || "",
      location: newStore.location || "",
      phone: newStore.phone || "",
      is_open: newStore.isOpen ?? true,
      categories: newStore.categories || [],
    };
    const { data, error } = await supabase.from("stores").insert(payload).select("*").single();
    if (error) {
      setError(error.message);
      return;
    }
    const created: Store = {
      id: data.id,
      name: data.name,
      description: data.description || "",
      image: data.image || "/logo.png",
      rating: Number(data.rating || 0),
      deliveryTime: data.delivery_time || "",
      location: data.location || "",
      phone: data.phone || "",
      isOpen: Boolean(data.is_open),
      categories: Array.isArray(data.categories) ? data.categories : [],
    };
    setStores([...stores, created]);
    setNewStore({ name: "", description: "", image: "/logo.png", rating: 0, deliveryTime: "", location: "", phone: "", isOpen: true, categories: [] });
    setIsAddDialogOpen(false);
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setIsEditDialogOpen(true);
  };

  const handleUpdateStore = async () => {
    if (!editingStore) return;
    setError("");
    const payload = {
      name: editingStore.name,
      description: editingStore.description,
      image: editingStore.image,
      rating: editingStore.rating,
      delivery_time: editingStore.deliveryTime,
      location: editingStore.location,
      phone: editingStore.phone,
      is_open: editingStore.isOpen,
      categories: editingStore.categories,
    };
    const { error } = await supabase.from("stores").update(payload).eq("id", editingStore.id);
    if (error) {
      setError(error.message);
      return;
    }
    setStores(stores.map(store => store.id === editingStore.id ? editingStore : store));
    setIsEditDialogOpen(false);
    setEditingStore(null);
  };

  const handleDeleteStore = async (storeId: string) => {
    setError("");
    const { error } = await supabase.from("stores").delete().eq("id", storeId);
    if (error) {
      setError(error.message);
      return;
    }
    setStores(stores.filter(store => store.id !== storeId));
  };

  const toggleStoreStatus = async (storeId: string) => {
    const target = stores.find(s => s.id === storeId);
    if (!target) return;
    const next = !target.isOpen;
    const { error } = await supabase.from("stores").update({ is_open: next }).eq("id", storeId);
    if (error) {
      setError(error.message);
      return;
    }
    setStores(stores.map(store => store.id === storeId ? { ...store, isOpen: next } : store));
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Store Management</h2>
          <p className="text-gray-600">Manage your stores and their information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Store
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Store</DialogTitle>
              <DialogDescription>
                Create a new store for your delivery platform
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Store Name</Label>
                  <Input
                    id="name"
                    value={newStore.name}
                    onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                    placeholder="Enter store name"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryTime">Delivery Time</Label>
                  <Input
                    id="deliveryTime"
                    value={newStore.deliveryTime}
                    onChange={(e) => setNewStore({...newStore, deliveryTime: e.target.value})}
                    placeholder="e.g., 15-20 min"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newStore.description}
                  onChange={(e) => setNewStore({...newStore, description: e.target.value})}
                  placeholder="Enter store description"
                />
              </div>
              <div>
                <ImageUpload
                  value={newStore.image}
                  onChange={(value) => setNewStore({...newStore, image: value})}
                  label="Store Image"
                  placeholder="Enter image URL or upload a file"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newStore.location}
                    onChange={(e) => setNewStore({...newStore, location: e.target.value})}
                    placeholder="Enter store location"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newStore.phone}
                    onChange={(e) => setNewStore({...newStore, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStore}>
                Add Store
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-sm text-gray-500">Loading stores...</div>
        ) : stores.map((store) => (
          <Card key={store.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{store.name}</CardTitle>
                  <CardDescription className="text-sm">{store.description}</CardDescription>
                </div>
                <Badge variant={store.isOpen ? "default" : "secondary"}>
                  {store.isOpen ? "Open" : "Closed"}
                </Badge>
              </div>
              {/* Store Image Preview */}
              {store.image && store.image !== "/logo.png" && (
                <div className="mt-3 relative group">
                  <div 
                    className="w-full h-32 border rounded-lg overflow-hidden bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openImageModal(store.image, store.name, `${store.name} - Store Image`)}
                  >
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                    onClick={() => openImageModal(store.image, store.name, `${store.name} - Store Image`)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {store.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {store.deliveryTime} delivery
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {store.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                {store.rating}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {store.categories.map((category, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleStoreStatus(store.id)}
                  className="flex-1"
                >
                  {store.isOpen ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {store.isOpen ? "Close" : "Open"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditStore(store)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteStore(store.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
            <DialogDescription>
              Update store information
            </DialogDescription>
          </DialogHeader>
          {editingStore && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Store Name</Label>
                  <Input
                    id="edit-name"
                    value={editingStore.name}
                    onChange={(e) => setEditingStore({...editingStore, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-deliveryTime">Delivery Time</Label>
                  <Input
                    id="edit-deliveryTime"
                    value={editingStore.deliveryTime}
                    onChange={(e) => setEditingStore({...editingStore, deliveryTime: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingStore.description}
                  onChange={(e) => setEditingStore({...editingStore, description: e.target.value})}
                />
              </div>
              <div>
                <ImageUpload
                  value={editingStore.image}
                  onChange={(value) => setEditingStore({...editingStore, image: value})}
                  label="Store Image"
                  placeholder="Enter image URL or upload a file"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editingStore.location}
                    onChange={(e) => setEditingStore({...editingStore, location: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingStore.phone}
                    onChange={(e) => setEditingStore({...editingStore, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStore}>
              Update Store
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
