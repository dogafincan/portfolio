import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

const walletChooserSource = readFileSync(new URL("./wallet-runtime.tsx", import.meta.url), "utf8");
const walletActionSource = readFileSync(new URL("./wallet-control.tsx", import.meta.url), "utf8");
const appProvidersSource = readFileSync(new URL("./app-providers.tsx", import.meta.url), "utf8");
const walletLoaderSource = readFileSync(
  new URL("./wallet-runtime-loader.tsx", import.meta.url),
  "utf8",
);

describe("connect-wallet drawer contract", () => {
  it("uses the responsive-center migration Drawer with Empty and one primary footer close action", () => {
    expect(walletActionSource).toContain('from "@/components/ui/drawer"');
    expect(walletActionSource).toContain('from "@/components/ui/empty"');
    expect(walletActionSource).toContain("<Drawer");
    expect(walletActionSource).toContain('placement="responsive-center"');
    expect(walletActionSource).toContain("showSwipeHandle");
    expect(walletActionSource).toContain(
      'finalFocus={() => document.querySelector<HTMLElement>("[data-wallet-action]")}',
    );
    expect(walletActionSource).toContain('data-wallet-action=""');
    expect(walletActionSource).toContain("<Empty");
    expect(walletActionSource).toContain("<DrawerFooter");
    expect(walletActionSource).toMatch(
      /<DrawerClose render={<Button className="w-full" \/>}>\s*Close\s*<\/DrawerClose>/,
    );
  });

  it("keeps every dormant sole Drawer footer action primary without changing DrawerClose ownership", () => {
    for (const source of [walletChooserSource, walletActionSource]) {
      const footers = source.match(/<DrawerFooter[\s\S]*?<\/DrawerFooter>/gu) ?? [];

      expect(footers).toHaveLength(1);
      expect(footers[0]).toContain('<DrawerClose render={<Button className="w-full" />}>');
      expect(footers[0]).toContain("Close");
      expect(footers[0]).toContain("</DrawerClose>");
      expect(footers[0]).not.toContain('variant="outline"');
    }
  });

  it("does not fall back to a Dialog or its automatic corner close control", () => {
    expect(walletActionSource).not.toContain('from "@/components/ui/dialog"');
    expect(walletActionSource).not.toContain("<Dialog");
    expect(walletActionSource).not.toContain("showCloseButton");
  });

  it("keeps the Sui wallet implementation intact but unreachable during migration", () => {
    expect(walletLoaderSource).toContain("lazy(async () =>");
    expect(walletLoaderSource).toContain("<Suspense fallback={null}>");
    expect(walletChooserSource).toContain(
      "const [isDrawerReady, setIsDrawerReady] = useState(false);",
    );
    expect(walletChooserSource).toContain("requestAnimationFrame(() => {");
    expect(walletChooserSource).toContain("open={isDrawerReady && wallet.isChooserOpen}");
    expect(appProvidersSource).not.toContain("WalletRuntimeLoader");
    expect(walletActionSource).not.toContain("useDojiWallet");
    expect(walletActionSource).not.toContain("wallet-runtime");
  });
});
