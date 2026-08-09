/* Generated from the canonical Registry JSON Schemas. Do not edit by hand. */

export type Revision = string;
export type DateTime = string;
export type ProjectSubmissionConfiguration = {
  [k: string]: unknown;
} & {
  enabled: boolean;
  configurationRevision: Revision;
  feeMist: "10000000000";
  treasuryAddress: SuiAddress | null;
  validFrom: DateTime;
};
export type SuiAddress = string;
export type DojiSnapConfiguration = {
  [k: string]: unknown;
} & {
  enabled: boolean;
  treasuryRevision: Revision;
  treasuryAddress: SuiAddress | null;
  pricingFormula: {
    version: "dojisnap-holder-count-v1";
    baseMist: "250000000";
    perHolderMist: "10000";
  };
};
export type Asset = CoinAsset | NftAsset;
export type SuiType = string;
export type DojiSnapAssetTerms = {
  [k: string]: unknown;
} & {
  available: boolean;
  priceMist: Mist | null;
  formulaVersion: "dojisnap-holder-count-v1";
} & {
  available: boolean;
  priceMist: Mist | null;
  formulaVersion: "dojisnap-holder-count-v1";
};
export type Mist = string;

export interface DojiRegistryManifestV1 {
  schemaVersion: 1;
  revision: Revision;
  publishedAt: DateTime;
  network: "mainnet";
  submission: ProjectSubmissionConfiguration;
  products: {
    dojisnap: DojiSnapConfiguration;
  };
  projects: Project[];
}
export interface Project {
  id: string;
  approvedRevision: number;
  name: string;
  description: string;
  ticker: string | null;
  profileImage: ProfileImage;
  links: ProjectLinks;
  /**
   * @minItems 1
   */
  assets: [Asset, ...Asset[]];
}
export interface ProfileImage {
  url: string;
  sha256: string;
  mediaType: "image/avif";
  width: 320;
  height: 320;
}
export interface ProjectLinks {
  website: string | null;
  x: string | null;
  telegram: string | null;
  discord: string | null;
}
export interface CoinAsset {
  id: string;
  suiType: SuiType;
  kind: "coin";
  decimals: number;
  network: "mainnet";
  dojisnap: DojiSnapAssetTerms;
}
export interface NftAsset {
  id: string;
  suiType: SuiType;
  kind: "nft";
  network: "mainnet";
  dojisnap: DojiSnapAssetTerms;
}

/* Generated from the canonical Registry JSON Schemas. Do not edit by hand. */

export interface DojiRegistryLatestPointerV1 {
  schemaVersion: 1;
  revision: string;
  publishedAt: string;
  manifestUrl: string;
  sha256: string;
  previous: null | {
    revision: string;
    manifestUrl: string;
    sha256: string;
    paymentExecutionValidUntil: string;
  };
}
