"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Loader2,
  Check,
  X,
} from "lucide-react";
import {
  createEventType,
  updateEventType,
  deleteEventType,
  createDesignStyle,
  updateDesignStyle,
  deleteDesignStyle,
} from "@/app/admin/actions/catalog";

type ItemStatus = "draft" | "published" | "archived";

type EventType = {
  id: string;
  name_he: string;
  name_en: string;
  slug: string;
  display_order: number;
  status: ItemStatus;
};

type DesignStyle = {
  id: string;
  event_type_id: string;
  name_he: string;
  name_en: string;
  slug: string;
  display_order: number;
  status: ItemStatus;
};

type FormData = {
  name_he: string;
  name_en: string;
  display_order: number;
  status: ItemStatus;
  event_type_id?: string;
};

const EMPTY_FORM: FormData = {
  name_he: "",
  name_en: "",
  display_order: 0,
  status: "published",
};

const STATUS_COLORS: Record<ItemStatus, string> = {
  draft: "bg-stone-100 text-stone-500",
  published: "bg-green-100 text-green-700",
  archived: "bg-red-100 text-red-600",
};

const STATUS_LABELS: Record<ItemStatus, string> = {
  draft: "טיוטה",
  published: "פעיל",
  archived: "ארכיון",
};

function toSlug(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function ItemForm({
  initial,
  onSave,
  onCancel,
  loading,
  error,
  label,
}: {
  initial: FormData;
  onSave: (data: FormData) => void;
  onCancel: () => void;
  loading: boolean;
  error: string;
  label: string;
}) {
  const [form, setForm] = useState<FormData>(initial);

  const set = (key: keyof FormData, val: string | number) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-3">
      <p className="text-xs font-semibold text-stone-600">{label}</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-stone-500 mb-1">שם בעברית</label>
          <input
            value={form.name_he}
            onChange={(e) => set("name_he", e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400"
            placeholder="חתונה"
          />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">שם באנגלית</label>
          <input
            value={form.name_en}
            onChange={(e) => set("name_en", e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400"
            placeholder="Wedding"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-stone-500 mb-1">Slug (URL)</label>
          <input
            value={form.name_en ? toSlug(form.name_en) : ""}
            readOnly
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-100 bg-stone-100 text-stone-400 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-xs text-stone-500 mb-1">סדר תצוגה</label>
          <input
            type="number"
            value={form.display_order}
            onChange={(e) => set("display_order", Number(e.target.value))}
            className="w-full text-sm px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-stone-500 mb-1.5">סטטוס</label>
        <div className="flex gap-2">
          {(["published", "draft"] as ItemStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set("status", s)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                form.status === s
                  ? `${STATUS_COLORS[s]} border-current ring-1 ring-current ring-offset-1`
                  : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onSave(form)}
          disabled={loading || !form.name_he || !form.name_en}
          className="flex items-center gap-1.5 text-sm px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:bg-stone-300 transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          שמור
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
        >
          <X size={14} />
          ביטול
        </button>
      </div>
    </div>
  );
}

export default function CatalogManager({
  initialEventTypes,
  initialStyles,
}: {
  initialEventTypes: EventType[];
  initialStyles: DesignStyle[];
}) {
  const [expanded, setExpanded] = useState<string | null>(
    initialEventTypes[0]?.id ?? null
  );
  const [editingEventType, setEditingEventType] = useState<string | null>(null);
  const [addingEventType, setAddingEventType] = useState(false);
  const [editingStyle, setEditingStyle] = useState<string | null>(null);
  const [addingStyleFor, setAddingStyleFor] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState("");

  function handleAction(fn: () => Promise<{ error?: string; success?: boolean }>) {
    setFormError("");
    startTransition(async () => {
      const res = await fn();
      if (res?.error) {
        setFormError(res.error);
      } else {
        setEditingEventType(null);
        setAddingEventType(false);
        setEditingStyle(null);
        setAddingStyleFor(null);
      }
    });
  }

  const stylesFor = (eventTypeId: string) =>
    initialStyles.filter((s) => s.event_type_id === eventTypeId);

  return (
    <div className="space-y-4">
      {/* Add Event Type Button */}
      {!addingEventType && (
        <button
          onClick={() => setAddingEventType(true)}
          className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 border border-dashed border-stone-300 rounded-xl px-4 py-3 w-full hover:bg-stone-50 transition-colors"
        >
          <Plus size={16} />
          הוסף סוג אירוע
        </button>
      )}

      {addingEventType && (
        <ItemForm
          label="סוג אירוע חדש"
          initial={{ ...EMPTY_FORM, display_order: initialEventTypes.length }}
          loading={isPending}
          error={formError}
          onCancel={() => { setAddingEventType(false); setFormError(""); }}
          onSave={(data) =>
            handleAction(() => createEventType(data))
          }
        />
      )}

      {/* Event Types List */}
      {initialEventTypes.map((et) => {
        const isExpanded = expanded === et.id;
        const styles = stylesFor(et.id);

        return (
          <div
            key={et.id}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
          >
            {/* Event Type Header */}
            {editingEventType === et.id ? (
              <div className="p-4">
                <ItemForm
                  label="עריכת סוג אירוע"
                  initial={{
                    name_he: et.name_he,
                    name_en: et.name_en,
                    display_order: et.display_order,
                    status: et.status,
                  }}
                  loading={isPending}
                  error={formError}
                  onCancel={() => { setEditingEventType(null); setFormError(""); }}
                  onSave={(data) =>
                    handleAction(() => updateEventType(et.id, data))
                  }
                />
              </div>
            ) : (
              <div className="flex items-center px-5 py-4 gap-3">
                <button
                  onClick={() => setExpanded(isExpanded ? null : et.id)}
                  className="flex-1 flex items-center gap-3 text-right min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-800">{et.name_he}</span>
                      <span className="text-stone-400 text-sm">/ {et.name_en}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[et.status]}`}
                      >
                        {STATUS_LABELS[et.status]}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      slug: {et.slug} · {styles.length} סגנונות
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-stone-400 shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-stone-400 shrink-0" />
                  )}
                </button>

                <button
                  onClick={() => { setEditingEventType(et.id); setExpanded(et.id); }}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                  title="עריכה"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleAction(() => deleteEventType(et.id))}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="העבר לארכיון"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {/* Design Styles */}
            {isExpanded && editingEventType !== et.id && (
              <div className="border-t border-stone-100 px-5 py-4 space-y-3">
                <div className="text-xs font-semibold text-stone-500 mb-2">
                  סגנונות עיצוב
                </div>

                {styles.length === 0 && !addingStyleFor && (
                  <p className="text-sm text-stone-400">אין סגנונות עדיין</p>
                )}

                {styles.map((style) =>
                  editingStyle === style.id ? (
                    <ItemForm
                      key={style.id}
                      label="עריכת סגנון"
                      initial={{
                        name_he: style.name_he,
                        name_en: style.name_en,
                        display_order: style.display_order,
                        status: style.status,
                        event_type_id: et.id,
                      }}
                      loading={isPending}
                      error={formError}
                      onCancel={() => { setEditingStyle(null); setFormError(""); }}
                      onSave={(data) =>
                        handleAction(() => updateDesignStyle(style.id, data))
                      }
                    />
                  ) : (
                    <div
                      key={style.id}
                      className="flex items-center gap-3 px-3 py-2.5 bg-stone-50 rounded-xl"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-stone-700">
                            {style.name_he}
                          </span>
                          <span className="text-stone-400 text-xs">/ {style.name_en}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[style.status]}`}
                          >
                            {STATUS_LABELS[style.status]}
                          </span>
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5">
                          slug: {style.slug}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingStyle(style.id)}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleAction(() => deleteDesignStyle(style.id))}
                        disabled={isPending}
                        className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )
                )}

                {addingStyleFor === et.id ? (
                  <ItemForm
                    label="סגנון חדש"
                    initial={{
                      ...EMPTY_FORM,
                      display_order: styles.length,
                      event_type_id: et.id,
                    }}
                    loading={isPending}
                    error={formError}
                    onCancel={() => { setAddingStyleFor(null); setFormError(""); }}
                    onSave={(data) =>
                      handleAction(() =>
                        createDesignStyle({ ...data, event_type_id: et.id })
                      )
                    }
                  />
                ) : (
                  <button
                    onClick={() => setAddingStyleFor(et.id)}
                    className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-800 border border-dashed border-stone-200 rounded-lg px-3 py-2 w-full hover:bg-stone-100 transition-colors"
                  >
                    <Plus size={13} />
                    הוסף סגנון
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {initialEventTypes.length === 0 && !addingEventType && (
        <div className="text-center py-16 text-stone-400 text-sm">
          אין סוגי אירועים עדיין
        </div>
      )}
    </div>
  );
}
