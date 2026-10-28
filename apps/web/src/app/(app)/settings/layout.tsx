import { heading } from '../../../ui/styles';
import { SettingsTabs } from './SettingsTabs';

/** Settings (R26): every account control in one place. */
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[44rem]">
      <h1 className={heading}>Settings</h1>
      <SettingsTabs />
      <div className="mt-8 grid gap-6">{children}</div>
    </div>
  );
}
