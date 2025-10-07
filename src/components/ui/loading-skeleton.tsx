"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StoreCardSkeleton() {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="p-0">
        <div className="h-48 w-full bg-gray-200 animate-pulse rounded-t-lg" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="flex gap-1">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-16" />
            <div className="h-6 bg-gray-200 animate-pulse rounded w-20" />
          </div>
          <div className="h-10 bg-gray-200 animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
          </div>
          <div className="h-6 bg-gray-200 animate-pulse rounded w-16" />
        </div>
        <div className="mt-3 h-32 bg-gray-200 animate-pulse rounded-lg" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-4 bg-gray-200 animate-pulse rounded" />
        <div className="h-6 bg-gray-200 animate-pulse rounded w-20" />
        <div className="space-y-2">
          <div className="h-10 bg-gray-200 animate-pulse rounded" />
          <div className="h-10 bg-gray-200 animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
