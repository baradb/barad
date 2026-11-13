"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";

const RESET_MS = 1800;

/**
 * Shows the address; clicking copies it and the text reads "Copied" for a moment.
 * Both labels share one grid cell so the button never changes width. If the browser
 * blocks clipboard access, it falls back to opening the user's mail app.
 */
export function CopyEmail({
  email,
  className = "",
  labelClassName = "",
}: {
  email: string;
  className?: string;
  labelClassName?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = `mailto:${email}`;
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current); // a second click restarts the countdown
    timer.current = window.setTimeout(() => setCopied(false), RESET_MS);
  }

  const label =
    "col-start-1 row-start-1 transition-[opacity,visibility] duration-150 motion-reduce:transition-none";

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy email address ${email}`}
        className={`cursor-pointer ${className}`}
      >
        <Icon name={copied ? "check" : "mail"} />
        <span className={labelClassName}>
          <span className="inline-grid text-left">
            <span aria-hidden="true" className={`${label} ${copied ? "invisible opacity-0" : ""}`}>
              {email}
            </span>
            <span
              aria-hidden="true"
              className={`${label} text-accent ${copied ? "" : "invisible opacity-0"}`}
            >
              Copied
            </span>
          </span>
        </span>
      </button>
      <span role="status" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </>
  );
}
