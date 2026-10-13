import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import type { ScreenRequest, ScreenResponse } from "@/types";

import { ErrorBoundary } from "@components/common/ErrorBoundary";
import { ScreenForm } from "@components/forms/ScreenForm";

import { fadeInUp, staggerContainer } from "@lib/animations";

export default function Home() {
  const navigate = useNavigate();

  const handleSubmit = async (request: ScreenRequest) => {
    const result: ScreenResponse = {
      address: request.address,
      riskScore: 3,
      riskLabel: "Medium",
      confidence: 0.85,
      evidenceHash: `0x${"ab".repeat(32)}`,
      attestationTx: `0x${"cd".repeat(32)}`,
      attestationId: 1,
      timestamp: new Date().toISOString(),
    };
    navigate("/results", { state: { result } });
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-900 dark:to-primary-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary-200/30 blur-3xl dark:bg-primary-900/30"
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/30"
          animate={{ y: [0, -25, 0], x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl"
          >
            Screen Ethereum Addresses for AML Risk
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400"
          >
            Enter an address to check AML/fraud risk. Results include an ML risk score and an
            on-chain attestation reference on Base L2.
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mx-auto mt-12 max-w-2xl"
        >
          <ErrorBoundary>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-card dark:border-gray-700 dark:bg-gray-800 sm:p-8">
              <ScreenForm onSubmit={handleSubmit} />
            </div>
          </ErrorBoundary>
        </motion.div>
      </section>
    </div>
  );
}
