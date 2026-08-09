import { Transaction } from "@mysten/sui/transactions";

import {
  buildProjectSubmissionPaymentMarker,
  PROJECT_SUBMISSION_FEE_MIST,
  validatePositiveU64Mist,
  type ProjectSubmissionPaymentTerms,
} from "@/lib/registry-payment";
import { isValidSuiAddress, normalizeSuiAddress } from "@/lib/sui-identifiers";

export function buildProjectSubmissionPaymentTransaction(input: {
  senderAddress: string;
  terms: ProjectSubmissionPaymentTerms;
}) {
  if (!isValidSuiAddress(input.senderAddress) || !isValidSuiAddress(input.terms.treasuryAddress)) {
    throw new Error("A valid sender and treasury are required.");
  }
  const amountMist = validatePositiveU64Mist(input.terms.amountMist);
  if (amountMist !== PROJECT_SUBMISSION_FEE_MIST) {
    throw new Error("The project submission fee must be exactly 10 SUI.");
  }

  const transaction = new Transaction();
  transaction.setSender(normalizeSuiAddress(input.senderAddress));
  transaction.pure.string(buildProjectSubmissionPaymentMarker(input.terms));
  const [paymentCoin] = transaction.splitCoins(transaction.gas, [
    transaction.pure.u64(BigInt(amountMist)),
  ]);
  transaction.transferObjects(
    [paymentCoin],
    transaction.pure.address(normalizeSuiAddress(input.terms.treasuryAddress)),
  );
  return transaction;
}
