"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/** next/image with a graceful, on-brand fallback so a failed remote photo never leaves a broken icon. */
export function SmartImage({ alt, className = "", ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div role="img" aria-label={alt} className={`absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,var(--surface-2),var(--bg-2))] text-muted ${className}`}>
        <span className="display text-4xl opacity-40">V</span>
      </div>
    );
  }
  return <Image alt={alt} className={className} onError={() => setFailed(true)} {...props} />;
}
