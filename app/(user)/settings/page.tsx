import Account from "@/components/Settings/Account";
import Billing from "@/components/Settings/Billing";
import GeneralSettingsForm from "@/components/Settings/GeneralSettingsForm";
import Privacy from "@/components/Settings/Privacy";
import SettingsTabsShell from "@/components/Settings/SettingsTabsShell";

export default function SettingsPage() {
  const tabs = [
    { value: "general", label: "General", node: <GeneralSettingsForm /> },
    { value: "account", label: "Account", node: <Account /> },
    { value: "privacy", label: "Privacy", node: <Privacy /> },
    { value: "billing", label: "Billing", node: <Billing /> },
  ];

  return (
    <div className="w-full mt-6">
      <SettingsTabsShell tabs={tabs} />
    </div>
  );
}
