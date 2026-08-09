import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type FormEvent,
} from "react";
import { CircleDollarSign, ImageIcon, Trash2 } from "lucide-react";

import { useDojiWallet } from "@/components/doji-wallet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { StatusAlert } from "@/components/ui/status-alert";
import {
  CHAIN_MIGRATION_ALERT_TITLE,
  CHAIN_MIGRATION_DESCRIPTION,
  CHAIN_MIGRATION_LOCKED,
} from "@/lib/chain-migration";
import {
  PROJECT_SUBMISSION_LIMITS,
  countGraphemes,
  validateAssetType,
  validateOptionalLink,
  validateOptionalTicker,
  validateProjectImage,
  validateProjectName,
  validateProjectSubmission,
  validateShortDescription,
  type ProjectSubmissionFormErrors,
  type ProjectSubmissionFormValues,
  type ValidatedProjectImage,
  type ValidatedProjectSubmission,
} from "@/lib/project-submission";
import {
  publicProjectSubmissionConfiguration,
  type PublicProjectSubmissionConfiguration,
} from "@/lib/public-config";
import { buildProjectSubmissionPaymentTerms } from "@/lib/registry-payment";
import {
  ProjectSubmissionApiError,
  createRegistrySubmissionApi,
  type ProjectSubmissionApiErrorCode,
  type RegistrySubmissionApi,
} from "@/lib/submission-api";
import { isValidSuiTransactionDigest } from "@/lib/sui-identifiers";

const EMPTY_VALUES: ProjectSubmissionFormValues = {
  assetType: "",
  projectName: "",
  shortDescription: "",
  ticker: "",
  websiteUrl: "",
  xUrl: "",
  telegramUrl: "",
  discordUrl: "",
};
const DEFAULT_REGISTRY_SUBMISSION_API = createRegistrySubmissionApi();

type SubmissionStatus = "idle" | "invalid" | "submitting" | "success" | "failed";

export type SubmitPaidProject = (
  submission: ValidatedProjectSubmission,
  recovery?: { configurationRevision?: string; digest: string },
  onPaymentDigest?: (digest: string) => void,
) => Promise<{ digest: string }>;

export function ProjectSubmissionFlow({
  api = DEFAULT_REGISTRY_SUBMISSION_API,
  configuration = publicProjectSubmissionConfiguration,
  migrationLocked = CHAIN_MIGRATION_LOCKED,
}: {
  api?: RegistrySubmissionApi;
  configuration?: PublicProjectSubmissionConfiguration;
  migrationLocked?: boolean;
}) {
  if (migrationLocked) {
    return (
      <ProjectSubmissionForm
        configuration={configuration}
        isWalletConnected={false}
        migrationLocked
      />
    );
  }

  return <ActiveProjectSubmissionFlow api={api} configuration={configuration} />;
}

function ActiveProjectSubmissionFlow({
  api,
  configuration,
}: {
  api: RegistrySubmissionApi;
  configuration: PublicProjectSubmissionConfiguration;
}) {
  const wallet = useDojiWallet();
  const accountAddress = wallet.accountAddress;
  const accountAddressRef = useRef(accountAddress);
  accountAddressRef.current = accountAddress;

  async function redeemAndUpload(input: {
    configurationRevision?: string;
    digest: string;
    submission: ValidatedProjectSubmission;
    walletAddress: string;
  }) {
    assertWalletUnchanged(accountAddressRef.current, input.walletAddress);
    const challenge = await api.createChallenge({
      digest: input.digest,
      walletAddress: input.walletAddress,
    });
    assertWalletUnchanged(accountAddressRef.current, input.walletAddress);
    const signature = await wallet.signPersonalMessage(new TextEncoder().encode(challenge.message));
    assertWalletUnchanged(accountAddressRef.current, input.walletAddress);
    const redemption = await api.redeemPayment({
      challengeToken: challenge.token,
      digest: input.digest,
      signature,
      walletAddress: input.walletAddress,
      ...(input.configurationRevision
        ? { configurationRevision: input.configurationRevision }
        : {}),
    });
    if (redemption.status === "submission_accepted") {
      return;
    }
    await api.uploadSubmission({
      capability: redemption.capability,
      submission: input.submission,
    });
  }

  const onPayAndSubmit: SubmitPaidProject | undefined = accountAddress
    ? async (submission, recovery, onPaymentDigest) => {
        const terms =
          !recovery && configuration.available && configuration.treasuryAddress
            ? buildProjectSubmissionPaymentTerms({
                configurationRevision: configuration.configurationRevision,
                treasuryAddress: configuration.treasuryAddress,
                executionValidFromMs: configuration.executionValidFromMs,
              })
            : null;
        if (!recovery && !terms) {
          throw new Error("Project submissions are not configured.");
        }
        const digest = recovery ? recovery.digest : await wallet.signAndExecutePayment(terms!);
        onPaymentDigest?.(digest);
        assertWalletUnchanged(accountAddressRef.current, accountAddress);
        await redeemAndUpload({
          digest,
          submission,
          walletAddress: accountAddress,
          ...(recovery?.configurationRevision
            ? { configurationRevision: recovery.configurationRevision }
            : terms
              ? { configurationRevision: terms.configurationRevision }
              : {}),
        });
        return { digest };
      }
    : undefined;

  return (
    <ProjectSubmissionForm
      configuration={configuration}
      isWalletConnected={wallet.status === "connected"}
      migrationLocked={false}
      onPayAndSubmit={onPayAndSubmit}
    />
  );
}

export function ProjectSubmissionForm({
  configuration,
  isWalletConnected,
  migrationLocked = CHAIN_MIGRATION_LOCKED,
  onPayAndSubmit,
}: {
  configuration: PublicProjectSubmissionConfiguration;
  isWalletConnected: boolean;
  migrationLocked?: boolean;
  onPayAndSubmit?: SubmitPaidProject;
}) {
  const [values, setValues] = useState<ProjectSubmissionFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<ProjectSubmissionFormErrors>({});
  const [profileImage, setProfileImage] = useState<ValidatedProjectImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imagePending, setImagePending] = useState(false);
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [paidDigest, setPaidDigest] = useState<string | null>(null);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryDigest, setRecoveryDigest] = useState("");
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [failureCode, setFailureCode] = useState<ProjectSubmissionApiErrorCode | null>(null);
  const imageValidationSequence = useRef(0);

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl],
  );

  function updateField(field: keyof ProjectSubmissionFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status === "invalid" || status === "failed") {
      setStatus("idle");
      setFailureCode(null);
    }
  }

  function validateField(field: keyof ProjectSubmissionFormValues) {
    const result =
      field === "assetType"
        ? validateAssetType(values.assetType)
        : field === "projectName"
          ? validateProjectName(values.projectName)
          : field === "shortDescription"
            ? validateShortDescription(values.shortDescription)
            : field === "ticker"
              ? validateOptionalTicker(values.ticker)
              : validateOptionalLink(
                  values[field],
                  field === "websiteUrl"
                    ? "website"
                    : field === "xUrl"
                      ? "x"
                      : field === "telegramUrl"
                        ? "telegram"
                        : "discord",
                );
    setErrors((current) => ({
      ...current,
      [field]: result.ok ? undefined : result.message,
    }));
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    const sequence = imageValidationSequence.current + 1;
    imageValidationSequence.current = sequence;
    setProfileImage(null);
    setErrors((current) => ({ ...current, profileImage: undefined }));
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (!file) {
      return;
    }
    setImagePending(true);
    const result = await validateProjectImage(file);
    if (sequence !== imageValidationSequence.current) {
      return;
    }
    setImagePending(false);
    if (!result.ok) {
      setErrors((current) => ({ ...current, profileImage: result.message }));
      event.target.value = "";
      return;
    }
    setProfileImage(result.value);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function removeImage() {
    imageValidationSequence.current += 1;
    setImagePending(false);
    setProfileImage(null);
    setErrors((current) => ({ ...current, profileImage: undefined }));
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }

  async function submit(recoveryDigestValue?: string) {
    const result = validateProjectSubmission(values, profileImage);
    if (!result.ok) {
      setErrors(result.errors);
      setStatus("invalid");
      return;
    }
    if (
      !isWalletConnected ||
      !onPayAndSubmit ||
      (!recoveryDigestValue && !configuration.available)
    ) {
      setStatus("failed");
      return;
    }
    setErrors({});
    setFailureCode(null);
    setStatus("submitting");
    setPaidDigest(recoveryDigestValue ?? null);
    try {
      const receipt = await onPayAndSubmit(
        result.value,
        recoveryDigestValue
          ? {
              digest: recoveryDigestValue,
              ...(paidDigest === recoveryDigestValue && configuration.available
                ? { configurationRevision: configuration.configurationRevision }
                : {}),
            }
          : undefined,
        setPaidDigest,
      );
      setPaidDigest(receipt.digest);
      setRecoveryOpen(false);
      setRecoveryDigest("");
      setRecoveryError(null);
      setStatus("success");
    } catch (error) {
      setFailureCode(error instanceof ProjectSubmissionApiError ? error.code : null);
      if (recoveryDigestValue) {
        setRecoveryError(
          "The paid submission could not be recovered. Check the digest and try again.",
        );
      }
      setStatus("failed");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (migrationLocked) {
      return;
    }
    void submit();
  }

  function handleRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (migrationLocked) {
      return;
    }
    const digest = recoveryDigest.trim();
    if (!isValidSuiTransactionDigest(digest)) {
      setRecoveryError("Enter a valid Sui transaction digest.");
      return;
    }
    setRecoveryError(null);
    void submit(digest);
  }

  const paymentEnabled =
    configuration.available &&
    isWalletConnected &&
    onPayAndSubmit !== undefined &&
    status !== "submitting" &&
    !imagePending &&
    !(paidDigest && status !== "success");
  const recoveryEnabled =
    isWalletConnected && onPayAndSubmit !== undefined && status !== "submitting" && !imagePending;

  return (
    <>
      <form className="mx-auto w-full max-w-3xl" noValidate onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project details</CardTitle>
            <CardDescription>
              Enter one Sui asset manually. Its project details and image stay in this page until a
              10 SUI payment has completed.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup className="gap-3">
              <TextField
                autoComplete="off"
                description="Use the complete 0xpackage::module::TypeName. An administrator assigns coin or NFT during review."
                error={errors.assetType}
                label="Sui asset type"
                name="assetType"
                onBlur={() => validateField("assetType")}
                onChange={(value) => updateField("assetType", value)}
                placeholder="0x2::sui::SUI"
                required
                value={values.assetType}
              />
              <TextField
                autoComplete="organization"
                description={`${countGraphemes(values.projectName)}/${PROJECT_SUBMISSION_LIMITS.projectNameMaxGraphemes} characters`}
                error={errors.projectName}
                label="Project name"
                name="projectName"
                onBlur={() => validateField("projectName")}
                onChange={(value) => updateField("projectName", value)}
                placeholder="Project name"
                required
                value={values.projectName}
              />
              <TextField
                autoComplete="off"
                description={`${countGraphemes(values.shortDescription)}/${PROJECT_SUBMISSION_LIMITS.shortDescriptionMaxGraphemes} characters`}
                error={errors.shortDescription}
                label="Short description"
                name="shortDescription"
                onBlur={() => validateField("shortDescription")}
                onChange={(value) => updateField("shortDescription", value)}
                placeholder="A short description of the project"
                required
                value={values.shortDescription}
              />
              <TextField
                autoComplete="off"
                description="Optional. Use letters and numbers only, without a $ prefix."
                error={errors.ticker}
                label="Ticker"
                name="ticker"
                onBlur={() => validateField("ticker")}
                onChange={(value) => updateField("ticker", value)}
                placeholder="DOJI"
                value={values.ticker}
              />

              <Field data-invalid={Boolean(errors.profileImage)}>
                <FieldLabel htmlFor="profileImage">Profile image</FieldLabel>
                <Input
                  accept="image/avif,image/jpeg,image/png,image/webp"
                  aria-describedby="profileImage-description profileImage-error"
                  aria-invalid={Boolean(errors.profileImage)}
                  disabled={imagePending}
                  id="profileImage"
                  name="profileImage"
                  onChange={(event) => void handleImageChange(event)}
                  required
                  type="file"
                />
                <FieldDescription id="profileImage-description">
                  Static JPG, PNG, WebP, or AVIF, up to 5,000,000 bytes and 40 million decoded
                  pixels.
                </FieldDescription>
                {errors.profileImage ? (
                  <FieldError id="profileImage-error">{errors.profileImage}</FieldError>
                ) : null}
                {profileImage && previewUrl ? (
                  <Item className="mt-1" variant="muted">
                    <ItemMedia className="size-16 rounded-2xl" variant="image">
                      <img
                        alt="Selected project profile preview"
                        height={profileImage.height}
                        src={previewUrl}
                        width={profileImage.width}
                      />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{profileImage.file.name}</ItemTitle>
                      <ItemDescription>
                        {profileImage.width} × {profileImage.height}px ·{" "}
                        {formatFileSize(profileImage.file.size)}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Button onClick={removeImage} type="button" variant="outline">
                        <Trash2 aria-hidden="true" />
                        Remove image
                      </Button>
                    </ItemActions>
                  </Item>
                ) : imagePending ? (
                  <Item className="mt-1" variant="muted">
                    <ItemMedia variant="icon">
                      <ImageIcon aria-hidden="true" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Checking image</ItemTitle>
                      <ItemDescription>
                        Checking locally; the image stays on this page.
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                ) : null}
              </Field>

              <div className="grid gap-7 md:grid-cols-2">
                <TextField
                  autoComplete="url"
                  error={errors.websiteUrl}
                  label="Website"
                  name="websiteUrl"
                  onBlur={() => validateField("websiteUrl")}
                  onChange={(value) => updateField("websiteUrl", value)}
                  placeholder="https://project.com"
                  value={values.websiteUrl}
                />
                <TextField
                  autoComplete="url"
                  error={errors.xUrl}
                  label="X"
                  name="xUrl"
                  onBlur={() => validateField("xUrl")}
                  onChange={(value) => updateField("xUrl", value)}
                  placeholder="https://x.com/project"
                  value={values.xUrl}
                />
                <TextField
                  autoComplete="url"
                  error={errors.telegramUrl}
                  label="Telegram"
                  name="telegramUrl"
                  onBlur={() => validateField("telegramUrl")}
                  onChange={(value) => updateField("telegramUrl", value)}
                  placeholder="https://t.me/project"
                  value={values.telegramUrl}
                />
                <TextField
                  autoComplete="url"
                  error={errors.discordUrl}
                  label="Discord"
                  name="discordUrl"
                  onBlur={() => validateField("discordUrl")}
                  onChange={(value) => updateField("discordUrl", value)}
                  placeholder="https://discord.gg/project"
                  value={values.discordUrl}
                />
              </div>
            </FieldGroup>

            <Item variant="muted">
              <ItemMedia variant="icon">
                <CircleDollarSign aria-hidden="true" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>One submission across every Doji app</ItemTitle>
                <ItemDescription>
                  Pay 10 SUI for one asset. Redeem within seven days; unused rights are recoverable
                  for 90 days, but expiry is not refunded. Rejections refund 10 SUI, excluding Sui
                  network fees.
                </ItemDescription>
              </ItemContent>
              <Badge>10 SUI</Badge>
            </Item>
          </CardContent>

          <CardFooter className="flex-col items-stretch">
            {paidDigest && status !== "success" ? (
              <Button
                disabled={migrationLocked ? undefined : !recoveryEnabled}
                onClick={migrationLocked ? undefined : () => setRecoveryOpen(true)}
                type="button"
              >
                Recover payment
              </Button>
            ) : (
              <>
                <Button
                  aria-busy={status === "submitting" || undefined}
                  disabled={migrationLocked ? undefined : !paymentEnabled}
                  type="submit"
                >
                  Pay 10 SUI
                </Button>
                <Button
                  disabled={migrationLocked ? undefined : !recoveryEnabled}
                  onClick={migrationLocked ? undefined : () => setRecoveryOpen(true)}
                  type="button"
                  variant="outline"
                >
                  Recover payment
                </Button>
              </>
            )}
            <SubmissionFeedback
              configurationAvailable={configuration.available}
              isWalletConnected={isWalletConnected}
              migrationLocked={migrationLocked}
              paidDigest={paidDigest}
              serviceAvailable={onPayAndSubmit !== undefined}
              failureCode={failureCode}
              status={status}
            />
          </CardFooter>
        </Card>
      </form>

      <Dialog open={!migrationLocked && recoveryOpen} onOpenChange={setRecoveryOpen}>
        <DialogContent>
          <form className="flex flex-col gap-6" onSubmit={handleRecovery}>
            <DialogHeader>
              <DialogTitle>Recover a project payment</DialogTitle>
              <DialogDescription>
                Re-enter the project details and image, then provide the original 10 SUI payment
                digest. The paying wallet must sign a fresh recovery message.
              </DialogDescription>
            </DialogHeader>
            <Field data-invalid={Boolean(recoveryError)}>
              <FieldLabel htmlFor="submission-payment-digest">Payment digest</FieldLabel>
              <Input
                aria-describedby={recoveryError ? "submission-payment-digest-error" : undefined}
                aria-invalid={Boolean(recoveryError)}
                id="submission-payment-digest"
                onChange={(event) => {
                  setRecoveryDigest(event.target.value);
                  setRecoveryError(null);
                }}
                placeholder="Sui transaction digest"
                value={recoveryDigest}
              />
              {recoveryError ? (
                <FieldError id="submission-payment-digest-error">{recoveryError}</FieldError>
              ) : null}
            </Field>
            <DialogFooter>
              <Button disabled={!recoveryEnabled || !recoveryDigest.trim()} type="submit">
                Recover paid submission
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TextField({
  description,
  error,
  label,
  name,
  onBlur,
  onChange,
  required,
  value,
  ...props
}: Omit<ComponentProps<typeof Input>, "name" | "onBlur" | "onChange" | "value"> & {
  description?: string;
  error?: string;
  label: string;
  name: keyof ProjectSubmissionFormValues;
  onBlur: () => void;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  const descriptionId = description ? `${name}-description` : undefined;
  const errorId = error ? `${name}-error` : undefined;
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        {...props}
        aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
        aria-invalid={Boolean(error)}
        id={name}
        name={name}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      />
      {description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </Field>
  );
}

function SubmissionFeedback({
  configurationAvailable,
  isWalletConnected,
  migrationLocked,
  paidDigest,
  serviceAvailable,
  failureCode,
  status,
}: {
  configurationAvailable: boolean;
  isWalletConnected: boolean;
  migrationLocked: boolean;
  paidDigest: string | null;
  serviceAvailable: boolean;
  failureCode: ProjectSubmissionApiErrorCode | null;
  status: SubmissionStatus;
}) {
  if (migrationLocked) {
    return (
      <StatusAlert
        data-chain-migration-alert=""
        description={CHAIN_MIGRATION_DESCRIPTION}
        live="polite"
        title={CHAIN_MIGRATION_ALERT_TITLE}
        tone="info"
      />
    );
  }

  if (status === "invalid") {
    return (
      <StatusAlert
        description="Correct the highlighted fields before opening a wallet payment request."
        title="Check the project details"
        tone="destructive"
      />
    );
  }
  if (status === "submitting") {
    return (
      <StatusAlert
        description="Keep this page open while the wallet payment and paid submission are completed."
        live="polite"
        shimmerContent
        title="Submitting project"
        tone="info"
      />
    );
  }
  if (status === "success") {
    return (
      <StatusAlert
        description="The proposal is ready for administrator review in the central Registry."
        title="Project submitted"
        tone="success"
      />
    );
  }
  if (status === "failed" && failureCode === "processing_exhausted") {
    return (
      <StatusAlert
        description={
          <>
            Registry has used all three image-processing attempts for this paid right. Automatic
            recovery cannot process another image. Keep this digest for manual support and do not
            pay again: <code className="break-all font-mono">{paidDigest}</code>
          </>
        }
        title="Image processing limit reached"
        tone="warning"
      />
    );
  }
  if (status === "failed" && failureCode === "payment_refund_owed") {
    return (
      <StatusAlert
        description="Registry determined that this payment cannot authorize a submission and recorded a refund obligation. Do not try to reuse the digest."
        title="Refund recorded"
        tone="warning"
      />
    );
  }
  if (
    status === "failed" &&
    (failureCode === "payment_verification_retryable" ||
      failureCode === "processing_unavailable" ||
      failureCode === "network")
  ) {
    return (
      <StatusAlert
        description={
          paidDigest ? (
            <>
              Registry could not finish the paid submission yet. Use Recover payment and do not pay
              again. Keep this digest: <code className="break-all font-mono">{paidDigest}</code>
            </>
          ) : (
            "The Registry could not be reached before payment. Wait a moment, then try again."
          )
        }
        title="Submission temporarily unavailable"
        tone="warning"
      />
    );
  }
  if (status === "failed" && paidDigest) {
    return (
      <StatusAlert
        description={
          <>
            The payment exists, but the submission did not finish. Use Recover payment and do not
            pay again. Keep this digest: <code className="break-all">{paidDigest}</code>
          </>
        }
        title="Submission incomplete after payment"
        tone="warning"
      />
    );
  }
  if (!isWalletConnected) {
    return (
      <StatusAlert
        description="Connect a wallet to pay or recover a payment."
        title="Wallet required"
        tone="info"
      />
    );
  }
  if (!configurationAvailable || !serviceAvailable) {
    return (
      <StatusAlert
        description="New project payments stay disabled until the Registry publishes its wallet configuration."
        title="Project submissions are not available yet"
        tone="warning"
      />
    );
  }
  if (status === "failed") {
    return (
      <StatusAlert
        description="The project submission could not be completed. If payment succeeded, use Recover payment instead of paying again."
        title="Submission incomplete"
        tone="warning"
      />
    );
  }
  return null;
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1_000_000).toFixed(bytes >= 1_000_000 ? 1 : 2)} MB`;
}

function assertWalletUnchanged(currentAddress: string | null, provingAddress: string) {
  if (currentAddress !== provingAddress) {
    throw new Error("The connected wallet changed during project submission.");
  }
}
