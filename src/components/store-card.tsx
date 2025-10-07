"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Phone } from "lucide-react"
import Image from "next/image"

interface Store {
  id: string
  name: string
  description: string
  image: string
  rating: number
  deliveryTime: string
  location: string
  phone: string
  isOpen: boolean
  categories: string[]
}

interface StoreCardProps {
  store: Store
  onSelect: (storeId: string) => void
}

export function StoreCard({ store, onSelect }: StoreCardProps) {
  return (
    <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={store.image}
            alt={store.name}
            fill
            className="object-cover rounded-t-lg"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
          />
          <div className="absolute top-2 right-2">
            <Badge variant={store.isOpen ? "default" : "secondary"}>
              {store.isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
          {/* Rating removed */}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl mb-2">{store.name}</CardTitle>
        <CardDescription className="text-sm text-gray-600 mb-3">
          {store.description}
        </CardDescription>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            {store.location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            {store.deliveryTime} delivery
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Phone className="w-4 h-4 mr-2" />
            {store.phone}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {store.categories.map((category, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {category}
            </Badge>
          ))}
        </div>

        <Button 
          onClick={() => onSelect(store.id)}
          className="w-full"
          disabled={!store.isOpen}
        >
          {store.isOpen ? "Order Now" : "Currently Closed"}
        </Button>
      </CardContent>
    </Card>
  )
}
