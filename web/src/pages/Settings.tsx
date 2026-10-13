import { useState } from "react";
import { DevicePhoneMobileIcon } from "@heroicons/react/24/outline";

import { useTheme, type ThemePreference } from "@/hooks/useTheme";

import { useToast } from "@components/feedback/Toast";
import { Button } from "@components/ui/Button";
import { Card, CardBody } from "@components/ui/Card";
import { FormField } from "@components/ui/FormField";
import { Input } from "@components/ui/Input";

import { cn } from "@lib/utils";

const ANIMATIONS_KEY = "chainsentinel-animations";
const API_URL_KEY = "chainsentinel-api-url";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { success } = useToast();
  const [animationsEnabled, setAnimationsEnabled] = useState(
    () => window.localStorage.getItem(ANIMATIONS_KEY) !== "false",
  );
  const [apiUrl, setApiUrl] = useState(() => window.localStorage.getItem(API_URL_KEY) ?? "");

  const handleThemeChange = (newTheme: ThemePreference) => {
    setTheme(newTheme);
    success(`Theme set to ${newTheme}`);
  };

  const handleAnimationsChange = (enabled: boolean) => {
    setAnimationsEnabled(enabled);
    window.localStorage.setItem(ANIMATIONS_KEY, String(enabled));
  };

  const handleApiUrlSave = () => {
    window.localStorage.setItem(API_URL_KEY, apiUrl.trim());
    success("API configuration saved");
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Customize your ChainSentinel experience. Preferences are stored locally in your browser.
      </p>

      <div className="mt-8 space-y-6">
        <Card variant="bordered">
          <CardBody className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
            <FormField label="Theme" htmlFor="theme">
              <div className="flex gap-2" role="radiogroup" aria-label="Theme">
                {(["light", "dark", "system"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={theme === option}
                    onClick={() => handleThemeChange(option)}
                    className={cn(
                      "flex-1 rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors",
                      theme === option
                        ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </FormField>
          </CardBody>
        </Card>

        <Card variant="bordered">
          <CardBody className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Accessibility</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DevicePhoneMobileIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Animations</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enable decorative motion and transitions
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={animationsEnabled}
                onClick={() => handleAnimationsChange(!animationsEnabled)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  animationsEnabled ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                    animationsEnabled ? "left-5" : "left-0.5",
                  )}
                />
              </button>
            </div>
          </CardBody>
        </Card>

        <Card variant="bordered">
          <CardBody className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              API Configuration
            </h2>
            <FormField
              label="API Base URL"
              htmlFor="apiUrl"
              helpText="Leave empty to use the same origin (recommended)."
            >
              <Input
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:3000/api/v1"
              />
            </FormField>
            <Button onClick={handleApiUrlSave}>Save Configuration</Button>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
