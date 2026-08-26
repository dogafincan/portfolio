import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type FormEvent,
} from "react";
import { ImageIcon } from "lucide-react";

import { useDojiWallet } from "@/components/doji-wallet";
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
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
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
    configurationRevision: string;
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
      configurationRevision: input.configurationRevision,
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
    ? async (submission, onPaymentDigest) => {
        const terms =
          configuration.available && configuration.treasuryAddress
            ? buildProjectSubmissionPaymentTerms({
                configurationRevision: configuration.configurationRevision,
                treasuryAddress: configuration.treasuryAddress,
                executionValidFromMs: configuration.executionValidFromMs,
              })
            : null;
        if (!terms) {
          throw new Error("Project submissions are not configured.");
        }
        const digest = await wallet.signAndExecutePayment(terms);
        onPaymentDigest?.(digest);
        assertWalletUnchanged(accountAddressRef.current, accountAddress);
        await redeemAndUpload({
          digest,
          submission,
          walletAddress: accountAddress,
          configurationRevision: terms.configurationRevision,
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
  const [failureCode, setFailureCode] = useState<ProjectSubmissionApiErrorCode | null>(null);
  const imageValidationSequence = useRef(0);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

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

  function browseProfileImage() {
    const input = profileImageInputRef.current;
    if (!input) {
      return;
    }
    input.value = "";
    input.click();
  }

  async function submit() {
    const result = validateProjectSubmission(values, profileImage);
    if (!result.ok) {
      setErrors(result.errors);
      setStatus("invalid");
      return;
    }
    if (!isWalletConnected || !onPayAndSubmit || !configuration.available) {
      setStatus("failed");
      return;
    }
    setErrors({});
    setFailureCode(null);
    setStatus("submitting");
    setPaidDigest(null);
    try {
      const receipt = await onPayAndSubmit(result.value, setPaidDigest);
      setPaidDigest(receipt.digest);
      setStatus("success");
    } catch (error) {
      setFailureCode(error instanceof ProjectSubmissionApiError ? error.code : null);
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

  const paymentEnabled =
    configuration.available &&
    isWalletConnected &&
    onPayAndSubmit !== undefined &&
    status !== "submitting" &&
    !imagePending &&
    !(paidDigest && status !== "success");
  return (
    <>
      <form className="mx-auto w-full max-w-3xl" noValidate onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project details</CardTitle>
            <CardDescription>
              Enter the details shown across Doji apps. Everything stays in this browser until you
              pay and submit.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <TextField
                autoComplete="off"
                description="Use the complete identifier for the asset you want to add or update."
                error={errors.assetType}
                label="Asset identifier"
                name="assetType"
                onBlur={() => validateField("assetType")}
                onChange={(value) => updateField("assetType", value)}
                placeholder="Enter the complete asset identifier"
                required
                value={values.assetType}
              />
              <TextField
                autoComplete="organization"
                counter={`${countGraphemes(values.projectName)}/${PROJECT_SUBMISSION_LIMITS.projectNameMaxGraphemes}`}
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
                counter={`${countGraphemes(values.shortDescription)}/${PROJECT_SUBMISSION_LIMITS.shortDescriptionMaxGraphemes}`}
                error={errors.shortDescription}
                label="Short description"
                name="shortDescription"
                onBlur={() => validateField("shortDescription")}
                onChange={(value) => updateField("shortDescription", value)}
                placeholder="What does this project help people do?"
                required
                value={values.shortDescription}
              />
              <TextField
                autoComplete="off"
                error={errors.ticker}
                label="Ticker (optional)"
                name="ticker"
                onBlur={() => validateField("ticker")}
                onChange={(value) => updateField("ticker", value.replaceAll("$", ""))}
                placeholder="DOJI"
                value={values.ticker}
              />
              <Field data-invalid={Boolean(errors.profileImage)}>
                <FieldContent>
                  <FieldLabel htmlFor="profileImage">Profile image</FieldLabel>
                  <FieldDescription id="profileImage-description">
                    Choose a JPG, PNG, WebP, or AVIF up to 5 MB.
                  </FieldDescription>
                </FieldContent>
                <Input
                  accept="image/avif,image/jpeg,image/png,image/webp"
                  aria-describedby={
                    errors.profileImage
                      ? "profileImage-description profileImage-error"
                      : "profileImage-description profileImage-selection-description"
                  }
                  aria-invalid={Boolean(errors.profileImage)}
                  disabled={imagePending}
                  id="profileImage"
                  name="profileImage"
                  onChange={(event) => void handleImageChange(event)}
                  ref={profileImageInputRef}
                  required
                  className="sr-only"
                  type="file"
                />
                <Item
                  className={`flex-nowrap items-start overflow-hidden ${profileImage && previewUrl ? "border-solid" : "border-dashed"}`}
                  variant="outline"
                >
                  <ItemMedia
                    className={profileImage && previewUrl ? undefined : "bg-muted"}
                    variant="image"
                  >
                    {profileImage && previewUrl ? (
                      <img
                        alt="Selected project profile preview"
                        height={profileImage.height}
                        src={previewUrl}
                        width={profileImage.width}
                      />
                    ) : (
                      <ImageIcon aria-hidden="true" className="size-5 text-muted-foreground" />
                    )}
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle title={profileImage?.file.name}>
                      {profileImage?.file.name ?? "No profile image selected"}
                    </ItemTitle>
                    <ItemDescription id="profileImage-selection-description">
                      {profileImage
                        ? `${profileImage.width} × ${profileImage.height}px · ${formatFileSize(profileImage.file.size)}`
                        : imagePending
                          ? "Checking the image locally…"
                          : "The preview will appear here."}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      aria-label={
                        profileImage ? "Browse for another profile image" : "Browse profile images"
                      }
                      disabled={imagePending}
                      onClick={browseProfileImage}
                      type="button"
                      variant="outline"
                    >
                      Browse
                    </Button>
                  </ItemActions>
                </Item>
                {errors.profileImage ? (
                  <FieldError id="profileImage-error">{errors.profileImage}</FieldError>
                ) : null}
              </Field>

              <FieldSet>
                <FieldLegend>Project links</FieldLegend>
                <FieldDescription>Project links are optional.</FieldDescription>
                <FieldGroup className="grid gap-7 md:grid-cols-2">
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
                    label="X profile"
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
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex-col items-stretch">
            {migrationLocked ? (
              <Button type="submit">Pay submission fee</Button>
            ) : (
              <Button
                aria-busy={status === "submitting" || undefined}
                disabled={!paymentEnabled}
                type="submit"
              >
                Pay submission fee
              </Button>
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
    </>
  );
}

function TextField({
  counter,
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
  counter?: string;
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
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldContent>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        {description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}
      </FieldContent>
      {counter ? (
        <InputGroup>
          <InputGroupInput
            {...props}
            aria-describedby={describedBy}
            aria-invalid={Boolean(error)}
            id={name}
            name={name}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value)}
            required={required}
            value={value}
          />
          <InputGroupAddon align="inline-end" aria-hidden="true">
            {counter}
          </InputGroupAddon>
        </InputGroup>
      ) : (
        <Input
          {...props}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          id={name}
          name={name}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          value={value}
        />
      )}
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
            Registry has used all three image-processing attempts for this paid right. Keep this
            digest for support and do not pay again:{" "}
            <code className="break-all font-mono">{paidDigest}</code>
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
              Registry could not finish the paid submission yet. Do not pay again. Keep this digest
              for support: <code className="break-all font-mono">{paidDigest}</code>
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
            The payment exists, but the submission did not finish. Do not pay again. Keep this
            digest for support: <code className="break-all">{paidDigest}</code>
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
        description="Connect a wallet to pay the submission fee."
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
        description="The project submission could not be completed. Review the wallet result before trying again."
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
