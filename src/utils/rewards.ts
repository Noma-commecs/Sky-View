import { CabinClass, FareFlexibility, Flight, MembershipTier } from '../types';

export interface PointsCalculationResult {
  baseMiles: number;
  destinationMultiplier: number;
  classMultiplier: number;
  tierMultiplier: number;
  flexibilityMultiplier: number;
  totalPoints: number;
  breakdown: string[];
}

export function calculateFlightPoints(
  flight: Flight,
  cabinClass: CabinClass,
  flexibility: FareFlexibility,
  tier: MembershipTier = 'Silver'
): PointsCalculationResult {
  const baseMiles = flight.distanceMiles;
  const destinationMultiplier = flight.destination.rewardBaseMultiplier || 1.2;

  let classMultiplier = 1.0;
  if (cabinClass === 'premium_economy') classMultiplier = 1.5;
  if (cabinClass === 'business') classMultiplier = 2.25;
  if (cabinClass === 'first') classMultiplier = 3.25;

  let tierMultiplier = 1.0;
  if (tier === 'Gold') tierMultiplier = 1.25;
  if (tier === 'Platinum') tierMultiplier = 1.5;
  if (tier === 'Diamond Club') tierMultiplier = 2.0;

  let flexibilityMultiplier = 1.0;
  if (flexibility === 'flex') flexibilityMultiplier = 1.1;
  if (flexibility === 'superflex') flexibilityMultiplier = 1.25;

  const totalPoints = Math.round(
    baseMiles * destinationMultiplier * classMultiplier * tierMultiplier * flexibilityMultiplier * 0.5
  );

  const breakdown = [
    `Base route distance: ${baseMiles.toLocaleString()} miles`,
    `Destination prestige (${flight.destination.city}): x${destinationMultiplier.toFixed(2)}`,
    `Cabin class (${cabinClass.replace('_', ' ')}): x${classMultiplier} bonus`,
    `Member tier (${tier}): x${tierMultiplier} status boost`,
    `Fare flexibility (${flexibility}): x${flexibilityMultiplier}`,
  ];

  return {
    baseMiles,
    destinationMultiplier,
    classMultiplier,
    tierMultiplier,
    flexibilityMultiplier,
    totalPoints,
    breakdown,
  };
}

export function pointsToCurrencyValue(points: number): number {
  // 100 points = $1.00 USD
  return Math.floor(points / 100);
}

export function calculateCancellationRefund(
  totalPaid: number,
  flexibility: FareFlexibility,
  pointsUsed: number = 0
): { refundAmount: number; penalty: number; policyNotice: string; pointsRefunded: number } {
  if (flexibility === 'superflex') {
    return {
      refundAmount: totalPaid,
      penalty: 0,
      policyNotice: 'SuperFlex Guarantee: 100% full refund with $0 cancellation fee.',
      pointsRefunded: pointsUsed,
    };
  }

  if (flexibility === 'flex') {
    const penalty = Math.round(totalPaid * 0.15); // 15% cancellation fee
    const refundAmount = Math.max(0, totalPaid - penalty);
    return {
      refundAmount,
      penalty,
      policyNotice: 'Flex Policy: 85% refunded to original payment method. 15% administration fee applied.',
      pointsRefunded: Math.round(pointsUsed * 0.85),
    };
  }

  // standard
  const penalty = Math.min(totalPaid, 250); // $250 non-refundable charge
  const refundAmount = Math.max(0, Math.round(totalPaid * 0.25)); // taxes only
  return {
    refundAmount,
    penalty: totalPaid - refundAmount,
    policyNotice: 'Standard Non-Refundable Fare: Only airport taxes and government surcharges are eligible for refund.',
    pointsRefunded: 0,
  };
}
