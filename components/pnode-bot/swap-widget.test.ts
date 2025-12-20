/**
 * Property Test: Swap Quote Display Completeness
 *
 * Property 6: Swap Quote Display Completeness
 * For any valid swap quote response from Jupiter, the UI should display
 * the estimated output amount and price impact percentage.
 *
 * Validates: Requirements 4.3, 4.6
 * Feature: pnode-bot-and-cleanup, Property 6: Swap Quote Display Completeness
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  formatSwapQuote,
  isAcceptablePriceImpact,
  type SwapQuote,
  SWAP_ERROR_MESSAGES,
} from "./swap-widget";

// Arbitrary for generating valid swap quotes
const swapQuoteArb: fc.Arbitrary<SwapQuote> = fc.record({
  inputAmount: fc.double({ min: 0.0001, max: 1000000, noNaN: true }),
  outputAmount: fc.double({ min: 0.0001, max: 1000000, noNaN: true }),
  priceImpact: fc.double({ min: 0, max: 1, noNaN: true }), // 0-100%
  route: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
});

// Arbitrary for max impact thresholds
const maxImpactArb = fc.double({ min: 0.001, max: 0.5, noNaN: true });

describe("Property 6: Swap Quote Display Completeness", () => {
  /**
   * Property: formatSwapQuote always includes output amount
   */
  it("should always include output amount in formatted quote", () => {
    fc.assert(
      fc.property(swapQuoteArb, (quote: SwapQuote) => {
        const formatted = formatSwapQuote(quote);
        
        // Output amount should be present in the formatted string
        expect(formatted).toContain("Output:");
        
        // The formatted string should contain a number representation
        // Either the actual number or a formatted version
        const hasOutputValue = /Output:\s*[\d.]+/.test(formatted);
        expect(hasOutputValue).toBe(true);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: formatSwapQuote always includes price impact
   */
  it("should always include price impact in formatted quote", () => {
    fc.assert(
      fc.property(swapQuoteArb, (quote: SwapQuote) => {
        const formatted = formatSwapQuote(quote);
        
        // Price impact should be present
        expect(formatted).toContain("Impact:");
        
        // Should contain percentage indicator
        expect(formatted).toContain("%");
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Very small price impacts display as "<0.01%"
   */
  it("should display very small price impacts as <0.01%", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 0.0001, noNaN: true }),
        fc.double({ min: 0.0001, max: 1000000, noNaN: true }),
        fc.double({ min: 0.0001, max: 1000000, noNaN: true }),
        (priceImpact: number, inputAmount: number, outputAmount: number) => {
          const quote: SwapQuote = {
            inputAmount,
            outputAmount,
            priceImpact,
            route: ["SOL", "XAND"],
          };
          
          const formatted = formatSwapQuote(quote);
          
          // Very small impacts should show as <0.01%
          expect(formatted).toContain("<0.01%");
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Larger price impacts display actual percentage
   */
  it("should display actual percentage for larger price impacts", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 1, noNaN: true }),
        fc.double({ min: 0.0001, max: 1000000, noNaN: true }),
        fc.double({ min: 0.0001, max: 1000000, noNaN: true }),
        (priceImpact: number, inputAmount: number, outputAmount: number) => {
          const quote: SwapQuote = {
            inputAmount,
            outputAmount,
            priceImpact,
            route: ["SOL", "XAND"],
          };
          
          const formatted = formatSwapQuote(quote);
          
          // Should not show <0.01% for larger impacts
          expect(formatted).not.toContain("<0.01%");
          
          // Should contain a percentage value
          expect(formatted).toMatch(/\d+\.\d+%/);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: isAcceptablePriceImpact returns true when impact <= maxImpact
   */
  it("should return true when price impact is within threshold", () => {
    fc.assert(
      fc.property(
        maxImpactArb,
        (maxImpact: number) => {
          // Generate impact that's definitely below threshold
          const impact = maxImpact * 0.5;
          const quote: SwapQuote = {
            inputAmount: 1,
            outputAmount: 1,
            priceImpact: impact,
            route: ["SOL", "XAND"],
          };
          
          const isAcceptable = isAcceptablePriceImpact(quote, maxImpact);
          expect(isAcceptable).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: isAcceptablePriceImpact returns false when impact > maxImpact
   */
  it("should return false when price impact exceeds threshold", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 0.4, noNaN: true }),
        (maxImpact: number) => {
          // Generate impact that's definitely above threshold
          const impact = maxImpact + 0.1;
          const quote: SwapQuote = {
            inputAmount: 1,
            outputAmount: 1,
            priceImpact: impact,
            route: ["SOL", "XAND"],
          };
          
          const isAcceptable = isAcceptablePriceImpact(quote, maxImpact);
          expect(isAcceptable).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Default max impact threshold is 5%
   */
  it("should use 5% as default max impact threshold", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 0.049, noNaN: true }),
        (priceImpact: number) => {
          const quote: SwapQuote = {
            inputAmount: 1,
            outputAmount: 1,
            priceImpact,
            route: ["SOL", "XAND"],
          };
          
          // Should be acceptable with default threshold (0.05)
          const isAcceptable = isAcceptablePriceImpact(quote);
          expect(isAcceptable).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Quotes with impact > 5% are not acceptable by default
   */
  it("should reject quotes with impact > 5% by default", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.051, max: 1, noNaN: true }),
        (priceImpact: number) => {
          const quote: SwapQuote = {
            inputAmount: 1,
            outputAmount: 1,
            priceImpact,
            route: ["SOL", "XAND"],
          };
          
          // Should not be acceptable with default threshold (0.05)
          const isAcceptable = isAcceptablePriceImpact(quote);
          expect(isAcceptable).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Error messages are defined for all error types
   */
  it("should have error messages for all swap error types", () => {
    const errorTypes = [
      "no_wallet",
      "insufficient_balance",
      "slippage",
      "transaction_failed",
      "load_error",
    ] as const;

    for (const errorType of errorTypes) {
      expect(SWAP_ERROR_MESSAGES[errorType]).toBeDefined();
      expect(typeof SWAP_ERROR_MESSAGES[errorType]).toBe("string");
      expect(SWAP_ERROR_MESSAGES[errorType].length).toBeGreaterThan(0);
    }
  });

  /**
   * Property: formatSwapQuote output is deterministic
   */
  it("should produce deterministic output for same input", () => {
    fc.assert(
      fc.property(swapQuoteArb, (quote: SwapQuote) => {
        const formatted1 = formatSwapQuote(quote);
        const formatted2 = formatSwapQuote(quote);
        
        expect(formatted1).toBe(formatted2);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Output amount in formatted string reflects quote output
   */
  it("should reflect actual output amount in formatted string", () => {
    fc.assert(
      fc.property(swapQuoteArb, (quote: SwapQuote) => {
        const formatted = formatSwapQuote(quote);
        
        // The formatted output should contain the output amount (to 4 decimal places)
        const expectedOutput = quote.outputAmount.toFixed(4);
        expect(formatted).toContain(expectedOutput);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
