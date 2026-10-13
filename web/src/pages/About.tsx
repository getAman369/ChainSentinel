import { motion } from "framer-motion";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

import { Badge } from "@components/ui/Badge";
import { Card, CardBody } from "@components/ui/Card";

import { cardHover, fadeInUp, staggerContainer } from "@lib/animations";

const STATS = [
  { label: "Risk Levels", value: "5" },
  { label: "ML Features", value: "7" },
  { label: "Networks", value: "2" },
  { label: "Attestations", value: "On-chain" },
];

const TECH_STACK = [
  "Solidity",
  "Hardhat",
  "Express",
  "TypeScript",
  "React 18",
  "Python ML",
  "Base L2",
];

export default function About() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div variants={staggerContainer} initial="initial" animate="animate">
        <motion.div variants={fadeInUp} className="text-center">
          <ShieldCheckIcon
            className="mx-auto h-16 w-16 text-primary-600 dark:text-primary-400"
            aria-hidden="true"
          />
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            About ChainSentinel
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-400">
            ChainSentinel screens Ethereum addresses for AML and fraud risk using machine learning,
            then records an immutable attestation of the result on-chain on Base L2.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <motion.div key={stat.label} variants={cardHover}>
              <Card variant="bordered" className="text-center">
                <CardBody>
                  <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How It Works</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: "1. Screen",
                description:
                  "Enter an Ethereum address. On-chain activity is fetched from Base and analyzed by the ML model across seven risk features.",
              },
              {
                title: "2. Score",
                description:
                  "The model produces a 1–5 risk score with a confidence percentage, classifying addresses from Minimal to Critical.",
              },
              {
                title: "3. Attest",
                description:
                  "The result is attested on-chain via the AttestationRegistry contract, creating a tamper-proof record with an evidence hash.",
              },
            ].map((step) => (
              <Card key={step.title} variant="bordered">
                <CardBody>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tech Stack</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {TECH_STACK.map((tech) => (
              <Badge key={tech} color="purple" badgeStyle="outline">
                {tech}
              </Badge>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
