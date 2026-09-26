"use client";
import { Skeleton } from "@/components/ui/Skeleton";
import "./ContactSkeleton.css";

export function ContactSkeleton() {
  return (
    <div className="ta-skel-contact" aria-busy="true" aria-live="polite">
      <div className="ta-skel-contact-filters">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width={90} height={32} radius={999} />
        ))}
      </div>

      <ul className="ta-skel-contact-list">
        {[0, 1, 2].map((i) => (
          <li key={i} className="ta-skel-contact-item">
            <div className="ta-skel-contact-head">
              <Skeleton circle height={40} />
              <div className="ta-skel-contact-from">
                <Skeleton width={140} height={14} radius={4} />
                <Skeleton
                  width={220}
                  height={11}
                  radius={4}
                  style={{ marginTop: 6 }}
                />
              </div>
              <div className="ta-skel-contact-status">
                <Skeleton width={60} height={22} radius={999} />
                <Skeleton width={50} height={12} radius={4} />
              </div>
            </div>
            <div className="ta-skel-contact-body">
              <Skeleton width="100%" height={13} radius={4} />
              <Skeleton
                width="92%"
                height={13}
                radius={4}
                style={{ marginTop: 8 }}
              />
              <Skeleton
                width="60%"
                height={13}
                radius={4}
                style={{ marginTop: 8 }}
              />
            </div>
            <div className="ta-skel-contact-actions">
              <Skeleton width={80} height={34} radius={8} />
              <Skeleton width={100} height={34} radius={8} />
              <Skeleton width={80} height={34} radius={8} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}