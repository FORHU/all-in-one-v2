import { SectionSubTabs } from "@/shared/components/SectionSubTabs";
import { ADMIN_NAV_ITEMS } from "@/shared/navigation/nav-items";

type SectionTabsLayoutProps = {
  sectionHref: string;
  children: React.ReactNode;
};

export function SectionTabsLayout({
  sectionHref,
  children,
}: SectionTabsLayoutProps) {
  const section = ADMIN_NAV_ITEMS.find((item) => item.href === sectionHref);
  const tabs = section?.children;

  if (!tabs?.length) {
    return <>{children}</>;
  }

  return (
    <>
      <SectionSubTabs items={tabs} />
      {children}
    </>
  );
}
