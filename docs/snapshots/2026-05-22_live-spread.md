# Live cross-venue spread snapshot — 2026-05-22 23:59 UTC

Captured directly via `kraken-cli` (v0.3.2) and DotSwap's `/brc20swap/swap_info` endpoint.

## BTC reference
- Kraken XBT/USD mid: **$75,471.35**

## DOG (DOG•GO•TO•THE•MOON, Rune 840000:3)
- Kraken bid/ask:        0.000701 / 0.000704
- Kraken mid:            0.0007025
- DotSwap pool USD mid:  0.0007077  (BTC/DOG = 9.3772e-9)
- **Spread (Kraken − DotSwap): −0.74%** — inside arb floor, no edge.

## MIM (MAGIC•INTERNET•MONEY, Rune 840000:45)
- Kraken bid/ask:        0.0002673 / 0.0002690
- Kraken mid:            0.0002681
- DotSwap pool USD mid:  0.0002507  (BTC/MIM = 3.3218e-9)
- **Spread (Kraken − DotSwap): +6.96%** — clear edge over fees.

## Arb floor (round-trip)
- DotSwap one-way fee:   2.00%  (0.4% platform + 1.6% LP)
- Kraken taker:          0.26%  (Starter tier)
- BTC tx fee:           ~$1-5 absolute
- Slippage budget:       1-2% rule of thumb
- **Net round-trip floor ≈ 4.5% + tx fee**

## Implication
At capture time, an agent could:
1. Buy MIM on DotSwap (≈ $0.000251/MIM)
2. Withdraw MIM to Kraken Bitcoin Runes deposit address
3. Sell MIM on Kraken (≈ $0.000267/MIM)
4. Withdraw USD; convert back to BTC; redeposit to DotSwap LP

Round-trip edge is roughly **6.96% − 4.5% ≈ 2.5% net, before withdrawal delays.**

This is the demo. It's real, with your own asset, against your own pool.
