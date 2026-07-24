// ============================================================================
// SubmitRequestPage — form for residents to report a new maintenance issue.
// ============================================================================

// Imports
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Send, X, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "../../layouts/dashboardLayout";
import { InputField } from "../../components/auth/inputField";
import { SelectField } from "../../components/auth/selectField";
import { TextAreaField } from "../../components/auth/textAreaField";
import { PrimaryButton, SecondaryButton } from "../../components/auth/buttons";
import { FileUploadCard, type UploadedFile } from "../../components/dashboard/fileUploadCard";
import { api } from "../../lib/apiClient";
import { RESIDENT_ROUTES, PRIORITY_OPTIONS, type RequestPriority } from "../../constants/resident";
import { isRequired } from "../../services/validators";

interface FormErrors {
  property?: string;
  category?: string;
  priority?: string;
  title?: string;
  description?: string;
}

interface PropertyOption { id: number; name: string; }
interface CategoryOption { id: number; name: string; }

function mapPriorityToApi(p: string): string {
  if (p === "critical") return "Urgent";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export default function SubmitRequestPage() {
  const navigate = useNavigate();

  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [property, setProperty] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<PropertyOption[]>("/api/properties"),
      api.get<CategoryOption[]>("/api/categories"),
    ]).then(([props, cats]) => {
      setPropertyOptions(props);
      setCategoryOptions(cats);
    });
  }, []);

  const validate = useCallback((): FormErrors => {
    const next: FormErrors = {};
    if (!isRequired(property))    next.property    = "Select a property.";
    if (!isRequired(category))    next.category    = "Select a category.";
    if (!isRequired(priority))    next.priority    = "Select a priority.";
    if (!isRequired(title))       next.title       = "Add a short title.";
    if (!isRequired(description)) next.description = "Describe the issue.";
    return next;
  }, [property, category, priority, title, description]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setLoading(true);

    try {
      // Upload photos to S3 first
      const photoUrls: string[] = [];
      for (const f of files) {
        const result = await api.upload<{ url: string }>("/api/upload", f.file);
        photoUrls.push(result.url);
      }

      await api.post("/api/requests", {
        propertyId: Number(property),
        categoryId: Number(category),
        priority: mapPriorityToApi(priority),
        title,
        description,
        photoUrls,
      });

      setSuccess(true);
      toast.success("Maintenance request submitted successfully.");
      setTimeout(() => navigate(RESIDENT_ROUTES.dashboard), 1600);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit request.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [validate, property, category, priority, title, description, files, navigate]);

  return (
    <DashboardLayout title="Submit Request">
      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-2xl border border-border bg-card/40 p-5 sm:p-7"
          noValidate
        >
          {/* Property + Category */}
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Property"
              name="property"
              placeholder="Select your property"
              options={propertyOptions.map((p) => ({ value: String(p.id), label: p.name }))}
              value={property}
              error={errors.property}
              onChange={(e) => setProperty(e.target.value)}
            />
            <SelectField
              label="Issue Category"
              name="category"
              placeholder="Select a category"
              options={categoryOptions.map((c) => ({ value: String(c.id), label: c.name }))}
              value={category}
              error={errors.category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          {/* Priority + Title */}
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Priority"
              name="priority"
              placeholder="Select priority"
              options={PRIORITY_OPTIONS}
              value={priority}
              error={errors.priority}
              onChange={(e) => setPriority(e.target.value)}
            />
            <InputField
              label="Issue Title"
              name="title"
              placeholder="e.g. Kitchen sink leaking"
              value={title}
              error={errors.title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <TextAreaField
            label="Issue Description"
            name="description"
            placeholder="Describe the issue in detail so the team can prepare..."
            rows={5}
            value={description}
            error={errors.description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Photo upload */}
          <FileUploadCard files={files} onChange={setFiles} />

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <PrimaryButton type="submit" fullWidth={false} loading={loading} className="sm:flex-1">
              {!loading && (success ? <CheckCircle2 size={18} /> : <Send size={18} />)}
              Submit Request
            </PrimaryButton>
            <SecondaryButton
              type="button"
              fullWidth={false}
              onClick={() => navigate(RESIDENT_ROUTES.dashboard)}
            >
              <X size={18} />
              Cancel
            </SecondaryButton>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
