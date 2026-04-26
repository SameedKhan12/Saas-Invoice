"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, FileText, LayoutDashboard } from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [ringVisible, setRingVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Staggered entrance animations
    const t1 = setTimeout(() => setRingVisible(true), 100);
    const t2 = setTimeout(() => setVisible(true), 400);
    const t3 = setTimeout(() => setContentVisible(true), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        .success-page {
          min-height: 100vh;
          background: #fafaf8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        /* Subtle background pattern */
        .success-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 1px 1px, #e8e6e0 1px, transparent 0);
          background-size: 32px 32px;
          opacity: 0.5;
        }

        /* Large decorative circle top-right */
        .success-page::after {
          content: '';
          position: absolute;
          top: -200px;
          right: -200px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, #d4f5e2 0%, transparent 70%);
          pointer-events: none;
        }

        .card {
          position: relative;
          z-index: 1;
          background: #ffffff;
          border: 1px solid #e8e6e0;
          border-radius: 20px;
          padding: 3rem 3.5rem;
          max-width: 480px;
          width: 100%;
          box-shadow:
            0 1px 2px rgba(0,0,0,0.04),
            0 8px 32px rgba(0,0,0,0.06),
            0 32px 64px rgba(0,0,0,0.04);
          text-align: center;
        }

        /* Icon ring */
        .icon-wrap {
          width: 88px;
          height: 88px;
          margin: 0 auto 2rem;
          position: relative;
          transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .icon-wrap.hidden {
          opacity: 0;
          transform: scale(0.5);
        }
        .icon-wrap.visible {
          opacity: 1;
          transform: scale(1);
        }

        .ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid transparent;
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .ring.hidden {
          transform: scale(0.6);
          opacity: 0;
        }
        .ring.visible {
          transform: scale(1);
          opacity: 1;
        }
        .ring-1 {
          border-color: #86efac;
          transform-origin: center;
        }
        .ring-2 {
          inset: 8px;
          border-color: #4ade80;
          transition-delay: 0.1s;
        }

        .icon-inner {
          position: absolute;
          inset: 16px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(34, 197, 94, 0.35);
        }

        /* Check mark draw animation */
        .check-icon {
          color: white;
          width: 28px;
          height: 28px;
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          transition: stroke-dashoffset 0.6s ease 0.5s;
        }
        .check-icon.visible {
          stroke-dashoffset: 0;
        }

        /* Text content */
        .content {
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .content.hidden {
          opacity: 0;
          transform: translateY(16px);
        }
        .content.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .badge {
          display: inline-block;
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 100px;
          margin-bottom: 1.25rem;
        }

        h1 {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 2rem;
          font-weight: 400;
          color: #1a1a14;
          line-height: 1.15;
          margin: 0 0 0.75rem;
          letter-spacing: -0.02em;
        }

        h1 em {
          font-style: italic;
          color: #16a34a;
        }

        .subtitle {
          font-size: 0.9375rem;
          color: #78716c;
          line-height: 1.6;
          margin: 0 0 2rem;
          font-weight: 300;
        }

        /* Divider */
        .divider {
          height: 1px;
          background: #f0ede8;
          margin: 0 0 2rem;
        }

        /* Action buttons */
        .actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #1a1a14;
          color: #fafaf8;
          border: none;
          border-radius: 10px;
          padding: 0.8125rem 1.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.15s ease;
          letter-spacing: -0.01em;
        }
        .btn-primary:hover {
          background: #2d2d24;
          transform: translateY(-1px);
        }
        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: transparent;
          color: #78716c;
          border: 1px solid #e8e6e0;
          border-radius: 10px;
          padding: 0.8125rem 1.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9375rem;
          font-weight: 400;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
          letter-spacing: -0.01em;
        }
        .btn-secondary:hover {
          background: #f5f4f0;
          border-color: #d4d0c8;
          color: #44403c;
        }

        .arrow-icon {
          transition: transform 0.2s ease;
        }
        .btn-primary:hover .arrow-icon {
          transform: translateX(3px);
        }

        /* Session ID */
        .session-ref {
          margin-top: 1.5rem;
          font-size: 0.75rem;
          color: #c4bfb8;
          font-family: 'DM Mono', monospace, monospace;
          letter-spacing: 0.02em;
        }

        @media (max-width: 520px) {
          .card {
            padding: 2rem 1.5rem;
          }
          h1 {
            font-size: 1.65rem;
          }
        }
      `}</style>

      <div className="success-page">
        <div className="card">
          {/* Animated icon */}
          <div className={`icon-wrap ${ringVisible ? "visible" : "hidden"}`}>
            <div className={`ring ring-1 ${ringVisible ? "visible" : "hidden"}`} />
            <div className={`ring ring-2 ${ringVisible ? "visible" : "hidden"}`} />
            <div className="icon-inner">
              <svg
                className={`check-icon ${visible ? "visible" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className={`content ${contentVisible ? "visible" : "hidden"}`}>
            <div className="badge">Payment confirmed</div>

            <h1>
              You&apos;re all <em>paid up</em>
            </h1>

            <p className="subtitle">
              Your payment was processed successfully. A receipt has been sent
              to your email address.
            </p>

            <div className="divider" />

            <div className="actions">
              <Link href="/invoices" className="btn-primary">
                <FileText size={16} />
                View Invoices
                <ArrowRight size={15} className="arrow-icon" />
              </Link>
              <Link href="/" className="btn-secondary">
                <LayoutDashboard size={15} />
                Back to Dashboard
              </Link>
            </div>

            {sessionId && (
              <p className="session-ref">ref: {sessionId.slice(0, 24)}…</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
