// Specific error handling
  if (
   error.code === "INSUFFICIENT_FUNDS" ||
   (error.message && error.message.includes("insufficient funds"))
  ) {
   // Critical error that requires human intervention
   logger.fatal(
    { network, wallet: wallet.address },
    "Insufficient funds for automation"
   );

   // Update DB to mark this automator as having a critical issue
   await prisma.upkeepContract.update({
    where: { automatorAddress },
    data: {
     isActive: false,
     lastError: "INSUFFICIENT_FUNDS",
    },
   });

   // No retry for fund issues
   return false;
  }

  // Retry for transient errors
  const RETRYABLE_ERRORS = [
   "NETWORK_ERROR",
   "TIMEOUT",
   "CALL_EXCEPTION",
   "SERVER_ERROR",
   "UNPREDICTABLE_GAS_LIMIT",
  ];

  const isRetryable = RETRYABLE_ERRORS.some(
   (code) =>
    error.code === code ||
    (error.message && error.message.includes(code))
  );

  if (retryCount < 3 && isRetryable) {
   const delay = 1000 * Math.pow(2, retryCount); // Exponential backoff
   logger.info(
    { automatorAddress, retryCount, delay },
    "Scheduling retry"
   );

   // Use setTimeout for retry to avoid blocking
   setTimeout(() => {
    executeAutomator(automatorAddress, network, retryCount + 1).catch(
     (e) => logger.error({ error: e.message }, "Error in retry")
    );
   }, delay);
  } else {
   // Update DB with error
   await prisma.upkeepContract.update({
    where: { automatorAddress },
    data: {
     lastError: error.message?.substring(0, 255) || "Unknown error",
    },
   });
  }
