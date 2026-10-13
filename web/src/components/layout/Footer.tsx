import { Badge } from "@components/ui/Badge";

const techStack = ["Solidity", "Express", "Python ML", "React"];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ChainSentinel — AML/Fraud Detection on Base L2
          </p>
          <div className="flex flex-wrap items-center gap-2" aria-label="Tech stack">
            {techStack.map((tech) => (
              <Badge key={tech} color="purple" badgeStyle="outline">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
          Built with Solidity, Express, and Python ML
        </p>
      </div>
    </footer>
  );
}
