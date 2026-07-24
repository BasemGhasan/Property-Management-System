import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileImage, Loader2, ReceiptText, Send, UploadCloud } from "lucide-react";
import { api } from "../../app/lib/apiClient";

type SelectOption = {
  id: number;
  name: string;
};

type ScanInvoiceResponse = {
  fileUrl: string;
  maintenanceType: string;
  date: string;
  amount: number;
};

type RequestPriority = "Low" | "Medium" | "High" | "Urgent";

const priorities: RequestPriority[] = ["Low", "Medium", "High", "Urgent"];
const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60";

export default function ClaimForm() {
  const [properties, setProperties] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priority, setPriority] = useState<RequestPriority>("Medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<SelectOption[]>("/api/properties"),
      api.get<SelectOption[]>("/api/categories"),
    ])
      .then(([propertyData, categoryData]) => {
        setProperties(propertyData);
        setCategories(categoryData);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load form options.");
      });
  }, []);

  const canSubmit = useMemo(
    () =>
      Boolean(
        propertyId &&
          categoryId &&
          title.trim() &&
          description.trim() &&
          maintenanceType.trim() &&
          date.trim() &&
          amount.trim() &&
          fileUrl
      ),
    [propertyId, categoryId, title, description, maintenanceType, date, amount, fileUrl]
  );

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError("");
    setSuccess("");

    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Please upload a JPEG or PNG receipt image.");
      event.target.value = "";
      return;
    }

    setScanning(true);
    setFileName(file.name);

    try {
      const result = await api.upload<ScanInvoiceResponse>("/api/maintenance/scan-invoice", file);

      setFileUrl(result.fileUrl);
      setMaintenanceType(result.maintenanceType ?? "");
      setDate(result.date ?? "");
      setAmount(result.amount != null ? String(result.amount) : "");

      const matchedCategory = categories.find(
        (category) => category.name.toLowerCase() === result.maintenanceType?.toLowerCase()
      );
      if (matchedCategory) setCategoryId(String(matchedCategory.id));

      if (!title.trim() && result.maintenanceType) {
        setTitle(`${result.maintenanceType} maintenance claim`);
      }

      setSuccess("Receipt scanned. Review the fields before submitting.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to scan receipt.");
    } finally {
      setScanning(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!canSubmit) {
      setError("Complete the claim details before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const claimSummary = [
        description.trim(),
        "",
        "Self-service claim details:",
        `Maintenance type: ${maintenanceType.trim()}`,
        `Service date: ${date.trim()}`,
        `Amount: ${amount.trim()}`,
      ].join("\n");

      await api.post("/api/requests", {
        propertyId: Number(propertyId),
        categoryId: Number(categoryId),
        priority,
        title: title.trim(),
        description: claimSummary,
        photoUrls: [fileUrl],
      });

      setSuccess("Claim submitted to the property owner.");
      setPropertyId("");
      setCategoryId("");
      setPriority("Medium");
      setTitle("");
      setDescription("");
      setMaintenanceType("");
      setDate("");
      setAmount("");
      setFileName("");
      setFileUrl("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit claim.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl flex-col gap-5 rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ReceiptText size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Self-Service Maintenance Claim</h2>
          <p className="text-sm text-muted-foreground">Upload a receipt, review the extracted fields, then submit.</p>
        </div>
      </div>

      <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition hover:border-primary hover:bg-primary/5">
        <input
          type="file"
          accept="image/png,image/jpeg"
          className="sr-only"
          disabled={scanning || submitting}
          onChange={handleFileChange}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background text-muted-foreground group-hover:text-primary">
          {scanning ? <Loader2 className="animate-spin" size={24} /> : <UploadCloud size={24} />}
        </div>
        <div>
          <p className="font-medium text-foreground">{scanning ? "Scanning receipt..." : "Upload receipt image"}</p>
          <p className="text-sm text-muted-foreground">JPEG or PNG, up to 10 MB</p>
        </div>
        {fileName && (
          <span className="inline-flex items-center gap-2 rounded-md bg-background px-3 py-1 text-sm text-muted-foreground">
            <FileImage size={15} />
            {fileName}
          </span>
        )}
      </label>

      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      {success && (
        <p className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 size={16} />
          {success}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Maintenance Type">
          <input value={maintenanceType} onChange={(e) => setMaintenanceType(e.target.value)} className={inputClass} placeholder="Plumbing" />
        </Field>
        <Field label="Receipt Date">
          <input value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} placeholder="YYYY-MM-DD" />
        </Field>
        <Field label="Amount">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} inputMode="decimal" placeholder="0.00" />
        </Field>
        <Field label="Priority">
          <select value={priority} onChange={(e) => setPriority(e.target.value as RequestPriority)} className={inputClass}>
            {priorities.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Property">
          <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className={inputClass}>
            <option value="">Select property</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>{property.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Category">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Kitchen sink repair claim" />
      </Field>

      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} min-h-28 resize-y`}
          placeholder="Describe what was repaired and why the claim is being submitted."
        />
      </Field>

      <button
        type="submit"
        disabled={!canSubmit || scanning || submitting}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        Submit to Property Owner
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
