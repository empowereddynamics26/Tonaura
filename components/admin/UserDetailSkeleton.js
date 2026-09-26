"use client";
import { Skeleton } from "@/components/ui/Skeleton";
import "./UserDetailSkeleton.css";

export function UserDetailSkeleton() {
  return (
    <div className="ta-skel-user" aria-busy="true" aria-live="polite">
      {/* Back link */}
      <Skeleton width={110} height={12} radius={4} />

      {/* Profile header */}
      <div className="ta-skel-user-header">
        <div className="ta-skel-user-header-top">
          <Skeleton circle height={56} />
          <div className="ta-skel-user-header-copy">
            <Skeleton width={220} height={22} radius={6} />
            <Skeleton
              width={160}
              height={13}
              radius={4}
              style={{ marginTop: 10 }}
            />
          </div>
        </div>
        <div className="ta-skel-user-header-meta">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="ta-skel-user-meta-item">
              <Skeleton width={60} height={10} radius={3} />
              <Skeleton
                width={90}
                height={20}
                radius={999}
                style={{ marginTop: 8 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Three detail sections */}
      {[0, 1, 2].map((section) => (
        <div key={section} className="ta-skel-user-section">
          <Skeleton width={140} height={16} radius={4} />
          <Skeleton
            width="60%"
            height={12}
            radius={4}
            style={{ marginTop: 8 }}
          />
          <div className="ta-skel-user-section-card">
            <Skeleton width="100%" height={14} radius={4} />
            <Skeleton
              width="100%"
              height={14}
              radius={4}
              style={{ marginTop: 12 }}
            />
            <Skeleton
              width="75%"
              height={14}
              radius={4}
              style={{ marginTop: 12 }}
            />
            <Skeleton
              width={140}
              height={38}
              radius={999}
              style={{ marginTop: 22 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}