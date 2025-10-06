"use client"

import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    storeId: string;
    storeName: string;
    image: string;
  };
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export default function AddToCartButton({ 
  product, 
  variant = "default", 
  size = "sm",
  className = ""
}: AddToCartButtonProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      storeId: product.storeId,
      storeName: product.storeName,
      image: product.image,
    });
  };

  return (
    <Button
      onClick={handleAddToCart}
      variant={variant}
      size={size}
      className={className}
    >
      <Plus className="h-4 w-4 mr-2" />
      Add to Cart
    </Button>
  );
}
