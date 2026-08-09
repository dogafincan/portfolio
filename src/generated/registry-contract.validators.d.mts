type ValidationError = {
  instancePath?: string;
  message?: string;
};

type RegistryContractValidator = {
  (value: unknown): boolean;
  errors?: ValidationError[] | null;
};

export const validateRegistryManifest: RegistryContractValidator;
export const validateRegistryLatestPointer: RegistryContractValidator;
