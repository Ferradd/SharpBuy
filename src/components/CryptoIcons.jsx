import React from 'react';

/**
 * SHARPBUY 100% Genuine Official Cryptocurrency Logos & Network Badges
 * Sourced directly from Official TrustWallet & CryptoAssets repositories
 */

export const CryptoIcon = ({ currencyId, className = "h-8 w-8" }) => {
  switch (currencyId) {
    case 'USDT_BEP20':
      return (
        <div className="relative inline-flex items-center justify-center shrink-0">
          <img src="/crypto/usdt.svg" alt="USDT" className={`${className} rounded-full`} />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#181A20] ring-1.5 ring-[#101216]">
            <img src="/crypto/bnb.svg" alt="BSC" className="h-3 w-3 rounded-full" />
          </span>
        </div>
      );

    case 'BNB_BSC':
      return (
        <div className="relative inline-flex items-center justify-center shrink-0">
          <img src="/crypto/bnb.svg" alt="BNB" className={`${className} rounded-full`} />
        </div>
      );

    case 'USDT_POLYGON':
      return (
        <div className="relative inline-flex items-center justify-center shrink-0">
          <img src="/crypto/usdt.svg" alt="USDT" className={`${className} rounded-full`} />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#181A20] ring-1.5 ring-[#101216]">
            <img src="/crypto/polygon.svg" alt="Polygon" className="h-3 w-3 rounded-full" />
          </span>
        </div>
      );

    case 'USDT_ARBITRUM':
      return (
        <div className="relative inline-flex items-center justify-center shrink-0">
          <img src="/crypto/usdt.svg" alt="USDT" className={`${className} rounded-full`} />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#181A20] ring-1.5 ring-[#101216]">
            <img src="/crypto/arbitrum.svg" alt="Arbitrum" className="h-3 w-3 rounded-full" />
          </span>
        </div>
      );

    case 'USDT_BASE':
      return (
        <div className="relative inline-flex items-center justify-center shrink-0">
          <img src="/crypto/usdt.svg" alt="USDT" className={`${className} rounded-full`} />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#181A20] ring-1.5 ring-[#101216]">
            <img src="/crypto/base.svg" alt="Base" className="h-3 w-3 rounded-full" />
          </span>
        </div>
      );

    case 'SOL':
      return (
        <div className="relative inline-flex items-center justify-center shrink-0">
          <img src="/crypto/sol.svg" alt="Solana" className={`${className} rounded-full`} />
        </div>
      );

    case 'TON':
      return (
        <div className="relative inline-flex items-center justify-center shrink-0">
          <img src="/crypto/ton.png" alt="TON" className={`${className} rounded-full`} />
        </div>
      );

    case 'LTC':
      return (
        <div className="relative inline-flex items-center justify-center shrink-0">
          <img src="/crypto/ltc.svg" alt="Litecoin" className={`${className} rounded-full`} />
        </div>
      );

    case 'BTC':
      return (
        <div className="relative inline-flex items-center justify-center shrink-0">
          <img src="/crypto/btc.svg" alt="Bitcoin" className={`${className} rounded-full`} />
        </div>
      );

    case 'TRX':
      return (
        <div className="relative inline-flex items-center justify-center shrink-0">
          <img src="/crypto/trx.svg" alt="TRON" className={`${className} rounded-full`} />
        </div>
      );

    default:
      return (
        <div className="relative inline-flex items-center justify-center shrink-0">
          <img src="/crypto/usdt.svg" alt="Crypto" className={`${className} rounded-full`} />
        </div>
      );
  }
};
