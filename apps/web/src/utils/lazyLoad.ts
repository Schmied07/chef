/**
 * Lazy Loading Utilities
 * Sprint 5.5 - Performance optimization
 */

import { lazy, ComponentType } from 'react';

/**
 * Lazy load with retry logic
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3
) {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = (retriesLeft: number) => {
        componentImport()
          .then(resolve)
          .catch((error) => {
            if (retriesLeft === 0) {
              reject(error);
              return;
            }
            console.warn(
              `Failed to load component, retrying... (${retriesLeft} attempts left)`
            );
            setTimeout(() => attemptImport(retriesLeft - 1), 1000);
          });
      };
      attemptImport(retries);
    });
  });
}

/**
 * Preload a lazy component
 */
export function preloadComponent<T extends ComponentType<any>>(
  LazyComponent: React.LazyExoticComponent<T>
) {
  // @ts-ignore - accessing internal preload
  if (LazyComponent._payload && LazyComponent._payload._result) {
    return;
  }
  // Trigger load
  const promise = (LazyComponent as any)._payload._result;
  if (promise) {
    promise.catch(() => {});
  }
}

/**
 * Image lazy loading with intersection observer
 */
export function useLazyImage(ref: React.RefObject<HTMLImageElement>, src: string) {
  if (typeof window === 'undefined') return;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && ref.current) {
          ref.current.src = src;
          observer.unobserve(ref.current);
        }
      });
    },
    { rootMargin: '50px' }
  );

  if (ref.current) {
    observer.observe(ref.current);
  }

  return () => {
    if (ref.current) {
      observer.unobserve(ref.current);
    }
  };
}
