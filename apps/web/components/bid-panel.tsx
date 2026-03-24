"use client";

import { useEffect, useState, useTransition } from "react";
import { getAuctionRuntime, formatSek, type DemoAuctionRecord, type DemoBuyer } from "../lib/demo-auctions";
import type { BuyerBidSubmitResult } from "../lib/buyer-api";

type BidPanelProps = {
  auction: DemoAuctionRecord;
  buyer: DemoBuyer;
  now: number;
  onSubmit: (priceSekPerKg: number) => Promise<BuyerBidSubmitResult>;
};

export function BidPanel({ auction, buyer, now, onSubmit }: BidPanelProps) {
  const runtime = getAuctionRuntime(auction, now);
  const [price, setPrice] = useState(runtime.bidFloor.toFixed(2));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPrice((current) => {
      const parsed = Number(current);
      if (Number.isFinite(parsed) && parsed >= runtime.bidFloor) {
        return current;
      }
      return runtime.bidFloor.toFixed(2);
    });
  }, [runtime.bidFloor]);

  const numericPrice = Number(price);
  const priceIsValid = Number.isFinite(numericPrice) && numericPrice >= runtime.bidFloor;
  const actionDisabled = !runtime.canBid || !buyer.approved || !priceIsValid || isPending;

  const disabledReason = !runtime.canBid
    ? `Bidding closed because the auction is ${runtime.statusLabel}.`
    : !buyer.approved
      ? "This buyer profile is pending approval."
      : !priceIsValid
        ? `Minimum next bid is ${formatSek(runtime.bidFloor)}.`
        : "";

  function submit() {
    if (actionDisabled) {
      setMessage(disabledReason);
      return;
    }

    startTransition(() => {
      void onSubmit(numericPrice).then((result) => {
        if (result.ok) {
          setMessage(`Bid accepted by the API at ${formatSek(result.bid.priceSekPerKg)}.`);
          return;
        }

        setMessage(result.error);
      });
    });
  }

  return (
    <section className="panel bid-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Bid panel</p>
          <h2>Place a live bid</h2>
        </div>
        <span className={`status-badge status-${runtime.statusTone.toLowerCase()}`}>{runtime.statusLabel}</span>
      </div>

      <div className="info-grid">
        <div>
          <span className="label">Buyer</span>
          <strong>{buyer.name}</strong>
          <p className="muted">{buyer.approved ? "Approved buyer" : "Approval pending"}</p>
        </div>
        <div>
          <span className="label">Minimum</span>
          <strong>{formatSek(runtime.bidFloor)}</strong>
          <p className="muted">Current reserve + increment</p>
        </div>
      </div>

      <label className="field">
        <span>Bid price per kg</span>
        <input
          className="input"
          type="number"
          min={runtime.bidFloor}
          step="0.25"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          inputMode="decimal"
        />
      </label>

      <button className="button button-primary" type="button" onClick={submit} disabled={actionDisabled}>
        {isPending ? "Submitting..." : "Submit bid"}
      </button>

      <p className={`message ${message ? "message-visible" : ""}`} aria-live="polite">
        {message || disabledReason || "Bids are validated locally before the API call is sent to the live backend."}
      </p>
    </section>
  );
}
