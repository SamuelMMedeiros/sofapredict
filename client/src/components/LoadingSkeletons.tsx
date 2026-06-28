import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Match card loading skeleton with pulsing animation
 */
export function MatchCardSkeleton() {
  return (
    <div className="p-4 border border-border rounded-lg bg-card animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      <div className="flex justify-between items-center mb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex justify-between gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  );
}

/**
 * Multiple match cards loading skeleton
 */
export function MatchesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Surebet calculator loading skeleton
 */
export function SurebetCalculatorSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border border-border rounded-lg bg-card">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
      <div className="p-4 border border-border rounded-lg bg-card space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

/**
 * Odds table loading skeleton
 */
export function OddsTableSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="flex gap-2 p-3 bg-muted rounded-lg">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-2 p-3 border border-border rounded-lg">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

/**
 * Spinner with loading text
 */
export function LoadingSpinner({ text = "Carregando..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-muted border-t-primary animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
    </div>
  );
}

/**
 * Shimmer loading effect for hero sections
 */
export function ShimmerLoader() {
  return (
    <div className="space-y-4">
      <div className="h-32 bg-gradient-to-r from-muted via-background to-muted rounded-lg animate-shimmer" />
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-muted via-background to-muted rounded animate-shimmer" />
        <div className="h-4 bg-gradient-to-r from-muted via-background to-muted rounded animate-shimmer w-5/6" />
      </div>
    </div>
  );
}

/**
 * Bookmakers list loading skeleton
 */
export function BookmakersListSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="p-3 border border-border rounded-lg bg-card">
          <Skeleton className="h-5 w-20 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
