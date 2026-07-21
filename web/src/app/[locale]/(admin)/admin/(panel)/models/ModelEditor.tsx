"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AdminInput,
  AdminSelect,
  ConfirmDelete,
  LocalizedField,
  MediaPicker,
  type LocalizedValue,
  type MediaPickerSelection,
} from "@/components/admin";
import { FormField } from "@/components/ui/FormField";
import { adminHref } from "../_lib/nav";
import type { AttributeKeyDto, UnitDto } from "../units/actions";
import type { TemplateDto } from "../templates/actions";
import {
  applyTemplateAction,
  createFeatureSectionAction,
  createModelAction,
  createModelFaqAction,
  createVariantAction,
  deleteFeatureSectionAction,
  deleteModelAction,
  deleteModelFaqAction,
  deleteVariantAction,
  setModelPublishedAction,
  setVariantPublishedAction,
  updateFeatureSectionAction,
  updateModelAction,
  updateModelFaqAction,
  updateVariantAction,
  type FeatureSectionDto,
  type LineDto,
  type ModelDto,
  type ModelFaqDto,
  type SegmentDto,
  type VariantDto,
} from "./actions";
import styles from "./models.module.css";

type Line = LineDto & { segments: SegmentDto[] };
type Model = ModelDto & {
  featureSections: FeatureSectionDto[];
  faqs: ModelFaqDto[];
};
type Attribute = { key: string; value: string; unit: string };
type VariantDraft = Omit<VariantDto, "createdAt" | "updatedAt" | "modelId" | "price" | "attributes"> & {
  price: string;
  attributes: Attribute[];
};
type FeatureDraft = Omit<FeatureSectionDto, "createdAt" | "updatedAt" | "imageMedia"> & {
  image?: MediaPickerSelection | null;
};
type FaqDraft = Omit<ModelFaqDto, "createdAt" | "updatedAt">;
type Tab = "basics" | "attributes" | "variants" | "features" | "faqs" | "media" | "publish";

type Props = {
  model?: Model;
  lines: Line[];
  units: UnitDto[];
  attributeKeys: AttributeKeyDto[];
  templates: TemplateDto[];
};

const EMPTY_LOCALIZED = { vi: "", en: "" };

export function ModelEditor({ model, lines, units, attributeKeys, templates }: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("basics");
  const [notice, setNotice] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [segmentId, setSegmentId] = useState(model?.segmentId ?? lines[0]?.segments[0]?.id ?? "");
  const [name, setName] = useState(model?.name ?? EMPTY_LOCALIZED);
  const [slug, setSlug] = useState(model?.slug ?? EMPTY_LOCALIZED);
  const [tagline, setTagline] = useState(model?.tagline ?? EMPTY_LOCALIZED);
  const [description, setDescription] = useState(model?.description ?? EMPTY_LOCALIZED);
  const [metaTitle, setMetaTitle] = useState({
    vi: model?.meta?.vi.title ?? "",
    en: model?.meta?.en.title ?? "",
  });
  const [metaDescription, setMetaDescription] = useState({
    vi: model?.meta?.vi.description ?? "",
    en: model?.meta?.en.description ?? "",
  });
  const [sortOrder, setSortOrder] = useState(model?.sortOrder ?? 0);
  const [attributes, setAttributes] = useState<Attribute[]>(
    model?.attributes.map((item) => ({ ...item, value: String(item.value ?? "") })) ?? [],
  );
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [templateMode, setTemplateMode] = useState<"merge" | "replace">("merge");
  const [variants, setVariants] = useState<VariantDraft[]>(
    (model?.variants ?? []).map((variant) => ({
      ...variant,
      price: variant.price === null ? "" : String(variant.price),
      attributes: variant.attributes.map((item) => ({ ...item, value: String(item.value ?? "") })),
    })),
  );
  const [features, setFeatures] = useState<FeatureDraft[]>(
    (model?.featureSections ?? []).map(({ imageMedia, ...feature }) => ({
      ...feature,
      image: imageMedia
        ? { mediaId: imageMedia.id, publicUrl: imageMedia.publicUrl }
        : feature.imageMediaId
          ? { mediaId: feature.imageMediaId, publicUrl: "" }
          : null,
    })),
  );
  const [faqs, setFaqs] = useState<FaqDraft[]>(model?.faqs ?? []);
  const [hero, setHero] = useState<MediaPickerSelection | null>(
    model?.heroMediaId ? { mediaId: model.heroMediaId, publicUrl: "" } : null,
  );
  const [gallery, setGallery] = useState<MediaPickerSelection[]>(
    model?.gallery.map((mediaId) => ({ mediaId, publicUrl: "" })) ?? [],
  );
  const [swatches, setSwatches] = useState(
    model?.colorSwatches ?? [],
  );
  const [promoBullets, setPromoBullets] = useState<LocalizedValue[]>(
    model?.promo?.bullets ?? [],
  );
  const [promoDateRange, setPromoDateRange] = useState<LocalizedValue>(
    model?.promo?.dateRange ?? EMPTY_LOCALIZED,
  );

  const run = <T,>(
    operation: () => Promise<{ ok: boolean; data?: T; error?: { message: string } }>,
    success: string,
    done?: (data: T | undefined) => void,
  ) => {
    setNotice(null);
    startTransition(async () => {
      try {
        const result = await operation();
        if (!result.ok) {
          setNotice({ kind: "error", text: result.error?.message ?? t("common.error") });
          return;
        }
        setNotice({ kind: "success", text: success });
        done?.(result.data);
        router.refresh();
      } catch {
        setNotice({ kind: "error", text: t("common.error") });
      }
    });
  };

  const modelInput = {
    segmentId,
    name,
    slug,
    tagline,
    description,
    meta: {
      vi: { title: metaTitle.vi, description: metaDescription.vi },
      en: { title: metaTitle.en, description: metaDescription.en },
    },
    sortOrder,
  };

  const saveBasics = () =>
    run(
      () => model ? updateModelAction(model.id, modelInput) : createModelAction(modelInput),
      t("models.saved"),
      (saved) => {
        if (!model && saved && typeof saved === "object" && "id" in saved) {
          router.push(adminHref(locale, `/admin/models/${String(saved.id)}`));
        }
      },
    );

  const updateAttribute = (index: number, patch: Partial<Attribute>) =>
    setAttributes((current) =>
      current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    );

  const saveAttributes = () => {
    if (!model) return;
    run(
      () => updateModelAction(model.id, { attributes }),
      t("models.saved"),
    );
  };

  const applyTemplate = () => {
    if (!model || !templateId) return;
    run<ModelDto>(
      () => applyTemplateAction({ modelId: model.id, templateId, mode: templateMode }),
      t("models.templateApplied"),
      (saved) => {
        if (saved) {
          setAttributes(saved.attributes.map((item) => ({ ...item, value: String(item.value ?? "") })));
        }
      },
    );
  };

  const saveMedia = () => {
    if (!model) return;
    run(
      () => updateModelAction(model.id, {
        heroMediaId: hero?.mediaId ?? null,
        gallery: gallery.map(({ mediaId }) => mediaId),
        colorSwatches: swatches,
        promo: promoBullets.length || promoDateRange.vi || promoDateRange.en
          ? {
              bullets: promoBullets,
              dateRange: promoDateRange.vi || promoDateRange.en ? promoDateRange : null,
            }
          : null,
      }),
      t("models.saved"),
    );
  };

  const tabs: { key: Tab; label: string }[] = model
    ? [
        { key: "basics", label: t("models.tabs.basics") },
        { key: "attributes", label: t("models.tabs.attributes") },
        { key: "variants", label: t("models.tabs.variants") },
        { key: "features", label: t("models.tabs.features") },
        { key: "faqs", label: t("models.tabs.faqs") },
        { key: "media", label: t("models.tabs.media") },
        { key: "publish", label: t("models.tabs.publish") },
      ]
    : [{ key: "basics", label: t("models.tabs.basics") }];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{model ? model.name.vi : t("models.create")}</h1>
          <p className={styles.muted}>{model ? t("models.editDescription") : t("models.createDescription")}</p>
        </div>
        <Link className={styles.secondaryLink} href={adminHref(locale, "/admin/models")}>{t("models.back")}</Link>
      </header>

      {notice ? (
        <p className={notice.kind === "error" ? styles.error : styles.success} role={notice.kind === "error" ? "alert" : "status"}>
          {notice.text}
        </p>
      ) : null}

      <div className={styles.tabs} role="tablist" aria-label={t("models.editorTabs")}>
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={[styles.tab, tab === item.key && styles.tabActive].filter(Boolean).join(" ")}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "basics" ? (
        <form className={styles.section} onSubmit={(event) => { event.preventDefault(); saveBasics(); }}>
          <div className={styles.grid}>
            <FormField id="model-segment" label={t("models.segment")} required>
              <AdminSelect id="model-segment" required value={segmentId} onChange={(event) => setSegmentId(event.currentTarget.value)}>
                {lines.map((line) => (
                  <optgroup key={line.id} label={line.name.vi}>
                    {line.segments.map((segment) => <option key={segment.id} value={segment.id}>{segment.name.vi}</option>)}
                  </optgroup>
                ))}
              </AdminSelect>
            </FormField>
            <FormField id="model-order" label={t("models.sortOrder")}>
              <AdminInput id="model-order" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.currentTarget.valueAsNumber || 0)} />
            </FormField>
          </div>
          <LocalizedField id="model-name" label={t("models.name")} required value={name} onChange={setName} />
          <LocalizedField id="model-slug" label={t("models.slug")} required value={slug} onChange={setSlug} />
          <LocalizedField id="model-tagline" label={t("models.tagline")} value={tagline} onChange={setTagline} />
          <LocalizedField id="model-description" label={t("models.descriptionField")} multiline value={description} onChange={setDescription} />
          <fieldset className={styles.item}>
            <legend>{t("models.seo")}</legend>
            <LocalizedField id="model-meta-title" label={t("models.seoTitle")} value={metaTitle} onChange={setMetaTitle} />
            <LocalizedField id="model-meta-description" label={t("models.seoDescription")} multiline value={metaDescription} onChange={setMetaDescription} />
          </fieldset>
          <div className={styles.actions}><button type="submit" disabled={pending || !segmentId}>{t("common.save")}</button></div>
        </form>
      ) : null}

      {tab === "attributes" && model ? (
        <section className={styles.section}>
          <div className={styles.itemHeader}>
            <h2>{t("models.attributes")}</h2>
            <button type="button" onClick={() => setAttributes([...attributes, { key: attributeKeys[0]?.key ?? "", value: "", unit: units[0]?.key ?? "" }])}>
              {t("models.addAttribute")}
            </button>
          </div>
          <div className={styles.grid}>
            <AdminSelect id="template" value={templateId} onChange={(event) => setTemplateId(event.currentTarget.value)}>
              {templates.map((template) => <option key={template.id} value={template.id}>{template.name.vi}</option>)}
            </AdminSelect>
            <AdminSelect id="template-mode" value={templateMode} onChange={(event) => setTemplateMode(event.currentTarget.value as "merge" | "replace")}>
              <option value="merge">{t("templates.merge")}</option>
              <option value="replace">{t("templates.replace")}</option>
            </AdminSelect>
            <button type="button" disabled={pending || !templateId} onClick={applyTemplate}>{t("templates.apply")}</button>
          </div>
          <AttributeList attributes={attributes} keys={attributeKeys} units={units} onChange={updateAttribute} onRemove={(index) => setAttributes(attributes.filter((_, itemIndex) => itemIndex !== index))} />
          <div className={styles.actions}><button type="button" disabled={pending} onClick={saveAttributes}>{t("common.save")}</button></div>
        </section>
      ) : null}

      {tab === "variants" && model ? (
        <CollectionSection
          title={t("variants.title")}
          addLabel={t("variants.add")}
          onAdd={() => setVariants([...variants, emptyVariant(`new-${Date.now()}`)])}
        >
          {variants.map((variant, index) => (
            <VariantEditor
              key={variant.id}
              draft={variant}
              keys={attributeKeys}
              units={units}
              pending={pending}
              onChange={(draft) => setVariants(variants.map((item, itemIndex) => itemIndex === index ? draft : item))}
              onSave={() => run<VariantDto>(
                () => variant.id.startsWith("new-")
                  ? createVariantAction(model.id, variantPayload(variant))
                  : updateVariantAction(variant.id, variantPayload(variant)),
                t("variants.saved"),
                (saved) => saved && setVariants(variants.map((item, itemIndex) => itemIndex === index ? toVariantDraft(saved) : item)),
              )}
              onDelete={() => variant.id.startsWith("new-")
                ? setVariants(variants.filter((_, itemIndex) => itemIndex !== index))
                : run(() => deleteVariantAction(variant.id), t("variants.deleted"), () => setVariants(variants.filter((_, itemIndex) => itemIndex !== index)))}
              onPublish={(published) => run<VariantDto>(
                () => setVariantPublishedAction(variant.id, { published }),
                t("variants.saved"),
                (saved) => saved && setVariants(variants.map((item, itemIndex) => itemIndex === index ? toVariantDraft(saved) : item)),
              )}
            />
          ))}
        </CollectionSection>
      ) : null}

      {tab === "features" && model ? (
        <CollectionSection title={t("models.features")} addLabel={t("models.addFeature")} onAdd={() => setFeatures([...features, emptyFeature(model.id)])}>
          {features.map((feature, index) => (
            <FeatureEditor
              key={feature.id}
              draft={feature}
              pending={pending}
              onChange={(draft) => setFeatures(features.map((item, itemIndex) => itemIndex === index ? draft : item))}
              onSave={() => run<FeatureSectionDto>(
                () => feature.id.startsWith("new-")
                  ? createFeatureSectionAction(featurePayload(feature))
                  : updateFeatureSectionAction(feature.id, featurePayload(feature)),
                t("models.saved"),
                (saved) => saved && setFeatures(features.map((item, itemIndex) => itemIndex === index ? { ...saved, image: draftImage(saved.imageMediaId) } : item)),
              )}
              onDelete={() => feature.id.startsWith("new-")
                ? setFeatures(features.filter((_, itemIndex) => itemIndex !== index))
                : run(() => deleteFeatureSectionAction(feature.id), t("models.deleted"), () => setFeatures(features.filter((_, itemIndex) => itemIndex !== index)))}
            />
          ))}
        </CollectionSection>
      ) : null}

      {tab === "faqs" && model ? (
        <CollectionSection title={t("models.faqs")} addLabel={t("models.addFaq")} onAdd={() => setFaqs([...faqs, emptyFaq(model.id)])}>
          {faqs.map((faq, index) => (
            <FaqEditor
              key={faq.id}
              draft={faq}
              pending={pending}
              onChange={(draft) => setFaqs(faqs.map((item, itemIndex) => itemIndex === index ? draft : item))}
              onSave={() => run<ModelFaqDto>(
                () => faq.id.startsWith("new-") ? createModelFaqAction(faq) : updateModelFaqAction(faq.id, faq),
                t("models.saved"),
                (saved) => saved && setFaqs(faqs.map((item, itemIndex) => itemIndex === index ? saved : item)),
              )}
              onDelete={() => faq.id.startsWith("new-")
                ? setFaqs(faqs.filter((_, itemIndex) => itemIndex !== index))
                : run(() => deleteModelFaqAction(faq.id), t("models.deleted"), () => setFaqs(faqs.filter((_, itemIndex) => itemIndex !== index)))}
            />
          ))}
        </CollectionSection>
      ) : null}

      {tab === "media" && model ? (
        <section className={styles.section}>
          <h2>{t("models.media")}</h2>
          <FormField id="hero-media" label={t("models.heroMedia")}>
            <MediaPicker folder="VEHICLES" value={hero} onChange={setHero} />
          </FormField>
          <FormField id="gallery-media" label={t("models.gallery")}>
            <MediaPicker folder="VEHICLES" multiple value={gallery} onChange={setGallery} />
          </FormField>
          <div className={styles.itemHeader}>
            <h3>{t("models.colorSwatches")}</h3>
            <button type="button" onClick={() => setSwatches([...swatches, { name: EMPTY_LOCALIZED, hex: "#000000", swatchMediaId: null }])}>{t("models.addColor")}</button>
          </div>
          {swatches.map((swatch, index) => (
            <div className={styles.item} key={index}>
              <LocalizedField id={`swatch-${index}`} label={t("models.colorName")} required value={swatch.name} onChange={(nameValue) => setSwatches(swatches.map((item, itemIndex) => itemIndex === index ? { ...item, name: nameValue } : item))} />
              <div className={styles.grid}>
                <FormField id={`swatch-hex-${index}`} label={t("models.hex")} required>
                  <AdminInput id={`swatch-hex-${index}`} required pattern="^#[0-9a-fA-F]{6}$" value={swatch.hex} onChange={(event) => setSwatches(swatches.map((item, itemIndex) => itemIndex === index ? { ...item, hex: event.currentTarget.value } : item))} />
                </FormField>
                <span className={styles.swatch} style={{ backgroundColor: swatch.hex }} aria-hidden />
                <button type="button" className={styles.danger} onClick={() => setSwatches(swatches.filter((_, itemIndex) => itemIndex !== index))}>{t("common.delete")}</button>
              </div>
              <MediaPicker
                folder="VEHICLES"
                value={swatch.swatchMediaId ? { mediaId: swatch.swatchMediaId, publicUrl: "" } : null}
                onChange={(image) => setSwatches(swatches.map((item, itemIndex) => itemIndex === index ? { ...item, swatchMediaId: image?.mediaId ?? null } : item))}
              />
            </div>
          ))}
          <div className={styles.itemHeader}>
            <h3>{t("models.promo")}</h3>
            <button type="button" disabled={promoBullets.length >= 5} onClick={() => setPromoBullets([...promoBullets, EMPTY_LOCALIZED])}>{t("models.addBullet")}</button>
          </div>
          {promoBullets.map((bullet, index) => (
            <div className={styles.item} key={index}>
              <LocalizedField id={`promo-${index}`} label={t("models.bullet", { number: index + 1 })} value={bullet} onChange={(value) => setPromoBullets(promoBullets.map((item, itemIndex) => itemIndex === index ? value : item))} />
              <button type="button" className={styles.danger} onClick={() => setPromoBullets(promoBullets.filter((_, itemIndex) => itemIndex !== index))}>{t("common.delete")}</button>
            </div>
          ))}
          <LocalizedField id="promo-date" label={t("models.dateRange")} value={promoDateRange} onChange={setPromoDateRange} />
          <div className={styles.actions}><button type="button" disabled={pending} onClick={saveMedia}>{t("common.save")}</button></div>
        </section>
      ) : null}

      {tab === "publish" && model ? (
        <section className={styles.section}>
          <h2>{t("models.publish")}</h2>
          <p className={styles.muted}>{model.published ? t("models.publishedHelp") : t("models.draftHelp")}</p>
          <div className={styles.actions}>
            <button type="button" disabled={pending} onClick={() => run(() => setModelPublishedAction(model.id, { published: !model.published }), t("models.saved"))}>
              {model.published ? t("models.unpublish") : t("models.publishAction")}
            </button>
            <ConfirmDelete message={t("models.confirmDelete", { name: model.name.vi })} onConfirm={() => run(() => deleteModelAction(model.id), t("models.deleted"), () => router.push(adminHref(locale, "/admin/models")))} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function CollectionSection({ title, addLabel, onAdd, children }: { title: string; addLabel: string; onAdd: () => void; children: React.ReactNode }) {
  return <section className={styles.section}><div className={styles.itemHeader}><h2>{title}</h2><button type="button" onClick={onAdd}>{addLabel}</button></div><div className={styles.items}>{children}</div></section>;
}

function AttributeList({ attributes, keys, units, onChange, onRemove }: { attributes: Attribute[]; keys: AttributeKeyDto[]; units: UnitDto[]; onChange: (index: number, patch: Partial<Attribute>) => void; onRemove: (index: number) => void }) {
  const t = useTranslations("admin");
  return <div className={styles.items}>{attributes.map((attribute, index) => <div className={styles.item} key={`${index}-${attribute.key}`}><div className={styles.grid}><FormField id={`attr-key-${index}`} label={t("attributes.key")} required><AdminSelect id={`attr-key-${index}`} value={attribute.key} onChange={(event) => onChange(index, { key: event.currentTarget.value })}>{keys.map((key) => <option key={key.id} value={key.key}>{key.key}</option>)}</AdminSelect></FormField><FormField id={`attr-value-${index}`} label={t("models.value")} required><AdminInput id={`attr-value-${index}`} value={attribute.value} onChange={(event) => onChange(index, { value: event.currentTarget.value })} /></FormField><FormField id={`attr-unit-${index}`} label={t("templates.unit")} required><AdminSelect id={`attr-unit-${index}`} value={attribute.unit} onChange={(event) => onChange(index, { unit: event.currentTarget.value })}>{units.map((unit) => <option key={unit.id} value={unit.key}>{unit.key} — {unit.value.vi}</option>)}</AdminSelect></FormField><button type="button" className={styles.danger} onClick={() => onRemove(index)}>{t("common.delete")}</button></div></div>)}</div>;
}

function VariantEditor({ draft, keys, units, pending, onChange, onSave, onDelete, onPublish }: { draft: VariantDraft; keys: AttributeKeyDto[]; units: UnitDto[]; pending: boolean; onChange: (draft: VariantDraft) => void; onSave: () => void; onDelete: () => void; onPublish: (published: boolean) => void }) {
  const t = useTranslations("admin");
  return <article className={styles.item}><LocalizedField id={`variant-name-${draft.id}`} label={t("variants.name")} required value={draft.name} onChange={(name) => onChange({ ...draft, name })} /><div className={styles.grid}><FormField id={`variant-price-${draft.id}`} label={t("variants.price")}><AdminInput id={`variant-price-${draft.id}`} type="number" min="0" step="1" value={draft.price} onChange={(event) => onChange({ ...draft, price: event.currentTarget.value })} /></FormField><FormField id={`variant-order-${draft.id}`} label={t("models.sortOrder")}><AdminInput id={`variant-order-${draft.id}`} type="number" value={draft.sortOrder} onChange={(event) => onChange({ ...draft, sortOrder: event.currentTarget.valueAsNumber || 0 })} /></FormField><label className={styles.checkbox}><input type="checkbox" checked={draft.allowDeposit} onChange={(event) => onChange({ ...draft, allowDeposit: event.currentTarget.checked })} />{t("variants.allowDeposit")}</label><label className={styles.checkbox}><input type="checkbox" checked={draft.allowTestDrive} onChange={(event) => onChange({ ...draft, allowTestDrive: event.currentTarget.checked })} />{t("variants.allowTestDrive")}</label></div><AttributeList attributes={draft.attributes} keys={keys} units={units} onChange={(index, patch) => onChange({ ...draft, attributes: draft.attributes.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) })} onRemove={(index) => onChange({ ...draft, attributes: draft.attributes.filter((_, itemIndex) => itemIndex !== index) })} /><button type="button" onClick={() => onChange({ ...draft, attributes: [...draft.attributes, { key: keys[0]?.key ?? "", value: "", unit: units[0]?.key ?? "" }] })}>{t("models.addAttribute")}</button><div className={styles.actions}>{!draft.id.startsWith("new-") ? <button type="button" disabled={pending} onClick={() => onPublish(!draft.published)}>{draft.published ? t("models.unpublish") : t("models.publishAction")}</button> : null}<button type="button" disabled={pending} onClick={onSave}>{t("common.save")}</button><button type="button" className={styles.danger} onClick={onDelete}>{t("common.delete")}</button></div></article>;
}

function FeatureEditor({ draft, pending, onChange, onSave, onDelete }: { draft: FeatureDraft; pending: boolean; onChange: (draft: FeatureDraft) => void; onSave: () => void; onDelete: () => void }) {
  const t = useTranslations("admin");
  return <article className={styles.item}><LocalizedField id={`feature-title-${draft.id}`} label={t("models.featureTitle")} required value={draft.title} onChange={(title) => onChange({ ...draft, title })} /><LocalizedField id={`feature-body-${draft.id}`} label={t("models.featureBody")} required multiline value={draft.body} onChange={(body) => onChange({ ...draft, body })} /><MediaPicker folder="VEHICLES" value={draft.image} onChange={(image) => onChange({ ...draft, image, imageMediaId: image?.mediaId ?? null })} /><FormField id={`feature-order-${draft.id}`} label={t("models.sortOrder")}><AdminInput id={`feature-order-${draft.id}`} type="number" value={draft.sortOrder} onChange={(event) => onChange({ ...draft, sortOrder: event.currentTarget.valueAsNumber || 0 })} /></FormField><div className={styles.actions}><button type="button" disabled={pending} onClick={onSave}>{t("common.save")}</button><button type="button" className={styles.danger} onClick={onDelete}>{t("common.delete")}</button></div></article>;
}

function FaqEditor({ draft, pending, onChange, onSave, onDelete }: { draft: FaqDraft; pending: boolean; onChange: (draft: FaqDraft) => void; onSave: () => void; onDelete: () => void }) {
  const t = useTranslations("admin");
  return <article className={styles.item}><LocalizedField id={`faq-question-${draft.id}`} label={t("models.question")} required value={draft.question} onChange={(question) => onChange({ ...draft, question })} /><LocalizedField id={`faq-answer-${draft.id}`} label={t("models.answer")} required multiline value={draft.answer} onChange={(answer) => onChange({ ...draft, answer })} /><FormField id={`faq-order-${draft.id}`} label={t("models.sortOrder")}><AdminInput id={`faq-order-${draft.id}`} type="number" value={draft.sortOrder} onChange={(event) => onChange({ ...draft, sortOrder: event.currentTarget.valueAsNumber || 0 })} /></FormField><div className={styles.actions}><button type="button" disabled={pending} onClick={onSave}>{t("common.save")}</button><button type="button" className={styles.danger} onClick={onDelete}>{t("common.delete")}</button></div></article>;
}

function emptyVariant(id: string): VariantDraft {
  return { id, name: EMPTY_LOCALIZED, price: "", attributes: [], allowDeposit: true, allowTestDrive: true, published: false, sortOrder: 0 };
}
function toVariantDraft(variant: VariantDto): VariantDraft {
  return { ...variant, price: variant.price === null ? "" : String(variant.price), attributes: variant.attributes.map((item) => ({ ...item, value: String(item.value ?? "") })) };
}
function variantPayload(variant: VariantDraft) {
  return { name: variant.name, price: variant.price ? Number(variant.price) : null, attributes: variant.attributes, allowDeposit: variant.allowDeposit, allowTestDrive: variant.allowTestDrive, published: variant.published, sortOrder: variant.sortOrder };
}
function emptyFeature(modelId: string): FeatureDraft {
  return { id: `new-${Date.now()}`, modelId, title: EMPTY_LOCALIZED, body: EMPTY_LOCALIZED, imageMediaId: null, sortOrder: 0, image: null };
}
function featurePayload(feature: FeatureDraft) {
  return { modelId: feature.modelId, title: feature.title, body: feature.body, imageMediaId: feature.imageMediaId, sortOrder: feature.sortOrder };
}
function draftImage(mediaId: string | null): MediaPickerSelection | null {
  return mediaId ? { mediaId, publicUrl: "" } : null;
}
function emptyFaq(modelId: string): FaqDraft {
  return { id: `new-${Date.now()}`, modelId, question: EMPTY_LOCALIZED, answer: EMPTY_LOCALIZED, sortOrder: 0 };
}
