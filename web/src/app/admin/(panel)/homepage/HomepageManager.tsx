"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  AdminInput,
  AdminModal,
  AdminSelect,
  AdminTable,
  ConfirmDelete,
  LocalizedField,
  MediaPicker,
  type LocalizedValue,
  type MediaPickerSelection,
} from "@/components/admin";
import { FormField } from "@/components/ui/FormField";
import type {
  DeliveryPhotoCreateInput,
  DeliveryPhotoDto,
  HeroSlideCreateInput,
  HeroSlideDto,
  ServiceBlockCreateInput,
  ServiceBlockDto,
} from "@/server/modules/homepage";
import type { MediaAssetDto, MediaFolderDto } from "@/server/modules/media";
import {
  createDeliveryPhotoAction,
  createHeroSlideAction,
  createServiceBlockAction,
  deleteDeliveryPhotoAction,
  deleteHeroSlideAction,
  deleteServiceBlockAction,
  updateDeliveryPhotoAction,
  updateHeroSlideAction,
  updateServiceBlockAction,
} from "./actions";
import styles from "../cms.module.css";

type HeroAdminDto = HeroSlideDto & { imageMedia?: MediaAssetDto | null };
type HeroDraft = {
  title: LocalizedValue;
  subtitle: LocalizedValue;
  promoChip: LocalizedValue;
  ctaLabel: LocalizedValue;
  ctaRouteKey: string;
  image: MediaPickerSelection | null;
  sortOrder: string;
  published: boolean;
};
type ServiceDraft = {
  title: LocalizedValue;
  description: LocalizedValue;
  iconKey: string;
  linkRouteKey: string;
  sortOrder: string;
  published: boolean;
};
type DeliveryDraft = {
  caption: LocalizedValue;
  image: MediaPickerSelection | null;
  folder: Extract<MediaFolderDto, "VEHICLES" | "SITE">;
  sortOrder: string;
  published: boolean;
};
type Modal =
  | { kind: "hero"; id?: string; draft: HeroDraft }
  | { kind: "service"; id?: string; draft: ServiceDraft }
  | { kind: "delivery"; id?: string; draft: DeliveryDraft };

type Props = {
  heroSlides: HeroAdminDto[];
  serviceBlocks: ServiceBlockDto[];
  deliveryPhotos: DeliveryPhotoDto[];
};

const EMPTY_LOCALIZED = { vi: "", en: "" };
const optionalLocalized = (value: LocalizedValue) =>
  value.vi.trim() || value.en.trim()
    ? { vi: value.vi.trim(), en: value.en.trim() }
    : null;
const mediaSelection = (
  mediaId: string | null,
  publicUrl: string | null | undefined,
): MediaPickerSelection | null =>
  mediaId && publicUrl ? { mediaId, publicUrl } : null;

const emptyHero = (): HeroDraft => ({
  title: { ...EMPTY_LOCALIZED },
  subtitle: { ...EMPTY_LOCALIZED },
  promoChip: { ...EMPTY_LOCALIZED },
  ctaLabel: { ...EMPTY_LOCALIZED },
  ctaRouteKey: "",
  image: null,
  sortOrder: "0",
  published: true,
});
const emptyService = (): ServiceDraft => ({
  title: { ...EMPTY_LOCALIZED },
  description: { ...EMPTY_LOCALIZED },
  iconKey: "",
  linkRouteKey: "",
  sortOrder: "0",
  published: true,
});
const emptyDelivery = (): DeliveryDraft => ({
  caption: { ...EMPTY_LOCALIZED },
  image: null,
  folder: "VEHICLES",
  sortOrder: "0",
  published: true,
});

export function HomepageManager({
  heroSlides,
  serviceBlocks,
  deliveryPhotos,
}: Props) {
  const t = useTranslations("admin.homepage");
  const common = useTranslations("admin.common");
  const router = useRouter();
  const [modal, setModal] = useState<Modal | null>(null);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function closeModal() {
    if (!pending) setModal(null);
  }

  function run(operation: () => Promise<{ ok: boolean; error?: { message: string } }>) {
    return new Promise<void>((resolve) => {
      setError(undefined);
      startTransition(async () => {
        try {
          const result = await operation();
          if (!result.ok) setError(result.error?.message ?? common("error"));
          else router.refresh();
        } catch {
          setError(common("error"));
        }
        resolve();
      });
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modal) return;
    setError(undefined);
    startTransition(async () => {
      let result;
      if (modal.kind === "hero") {
        const input: HeroSlideCreateInput = {
          title: {
            vi: modal.draft.title.vi.trim(),
            en: modal.draft.title.en.trim(),
          },
          subtitle: optionalLocalized(modal.draft.subtitle),
          promoChip: optionalLocalized(modal.draft.promoChip),
          ctaLabel: optionalLocalized(modal.draft.ctaLabel),
          ctaRouteKey: modal.draft.ctaRouteKey.trim() || null,
          imageMediaId: modal.draft.image?.mediaId ?? null,
          sortOrder: Number(modal.draft.sortOrder || 0),
          published: modal.draft.published,
        };
        result = modal.id
          ? await updateHeroSlideAction(modal.id, input)
          : await createHeroSlideAction(input);
      } else if (modal.kind === "service") {
        const input: ServiceBlockCreateInput = {
          title: {
            vi: modal.draft.title.vi.trim(),
            en: modal.draft.title.en.trim(),
          },
          description: optionalLocalized(modal.draft.description),
          iconKey: modal.draft.iconKey.trim() || null,
          linkRouteKey: modal.draft.linkRouteKey.trim() || null,
          sortOrder: Number(modal.draft.sortOrder || 0),
          published: modal.draft.published,
        };
        result = modal.id
          ? await updateServiceBlockAction(modal.id, input)
          : await createServiceBlockAction(input);
      } else {
        const input: DeliveryPhotoCreateInput = {
          caption: {
            vi: modal.draft.caption.vi.trim(),
            en: modal.draft.caption.en.trim(),
          },
          imageMediaId: modal.draft.image?.mediaId ?? null,
          sortOrder: Number(modal.draft.sortOrder || 0),
          published: modal.draft.published,
        };
        result = modal.id
          ? await updateDeliveryPhotoAction(modal.id, input)
          : await createDeliveryPhotoAction(input);
      }

      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setModal(null);
      router.refresh();
    });
  }

  const statusButton = (
    published: boolean,
    operation: () => Promise<{ ok: boolean; error?: { message: string } }>,
  ) => (
    <button
      type="button"
      role="switch"
      aria-checked={published}
      disabled={pending}
      onClick={() => void run(operation)}
    >
      {published ? common("published") : common("draft")}
    </button>
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{t("title")}</h1>
          <p className={styles.muted}>{t("description")}</p>
        </div>
        <Link href="/admin/settings">{t("settingsLink")}</Link>
      </header>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <section className={styles.section} aria-labelledby="hero-slides-heading">
        <div className={styles.sectionHeader}>
          <h2 id="hero-slides-heading">{t("hero.title")}</h2>
          <button
            type="button"
            className={styles.primary}
            onClick={() => setModal({ kind: "hero", draft: emptyHero() })}
          >
            {t("hero.add")}
          </button>
        </div>
        <AdminTable
          headers={[
            t("fields.title"),
            t("fields.media"),
            t("fields.sortOrder"),
            t("fields.status"),
            t("fields.actions"),
          ]}
        >
          {heroSlides.map((slide) => (
            <tr key={slide.id}>
              <td>
                <strong>{slide.title.vi}</strong>
                <span className={styles.muted}> {slide.title.en}</span>
              </td>
              <td>{slide.imageMediaId ? t("mediaSelected") : common("empty")}</td>
              <td>{slide.sortOrder}</td>
              <td>
                {statusButton(slide.published, () =>
                  updateHeroSlideAction(slide.id, {
                    published: !slide.published,
                  }),
                )}
              </td>
              <td>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    onClick={() =>
                      setModal({
                        kind: "hero",
                        id: slide.id,
                        draft: {
                          title: slide.title,
                          subtitle: slide.subtitle ?? { ...EMPTY_LOCALIZED },
                          promoChip: slide.promoChip ?? { ...EMPTY_LOCALIZED },
                          ctaLabel: slide.ctaLabel ?? { ...EMPTY_LOCALIZED },
                          ctaRouteKey: slide.ctaRouteKey ?? "",
                          image: mediaSelection(
                            slide.imageMediaId,
                            slide.imageMedia?.publicUrl,
                          ),
                          sortOrder: String(slide.sortOrder),
                          published: slide.published,
                        },
                      })
                    }
                  >
                    {common("edit")}
                  </button>
                  <ConfirmDelete
                    onConfirm={() => run(() => deleteHeroSlideAction(slide.id))}
                  />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </section>

      <section className={styles.section} aria-labelledby="services-heading">
        <div className={styles.sectionHeader}>
          <h2 id="services-heading">{t("service.title")}</h2>
          <button
            type="button"
            className={styles.primary}
            onClick={() => setModal({ kind: "service", draft: emptyService() })}
          >
            {t("service.add")}
          </button>
        </div>
        <AdminTable
          headers={[
            t("fields.title"),
            t("fields.iconKey"),
            t("fields.sortOrder"),
            t("fields.status"),
            t("fields.actions"),
          ]}
        >
          {serviceBlocks.map((block) => (
            <tr key={block.id}>
              <td>
                <strong>{block.title.vi}</strong>
                <span className={styles.muted}> {block.title.en}</span>
              </td>
              <td>{block.iconKey ?? "—"}</td>
              <td>{block.sortOrder}</td>
              <td>
                {statusButton(block.published, () =>
                  updateServiceBlockAction(block.id, {
                    published: !block.published,
                  }),
                )}
              </td>
              <td>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    onClick={() =>
                      setModal({
                        kind: "service",
                        id: block.id,
                        draft: {
                          title: block.title,
                          description:
                            block.description ?? { ...EMPTY_LOCALIZED },
                          iconKey: block.iconKey ?? "",
                          linkRouteKey: block.linkRouteKey ?? "",
                          sortOrder: String(block.sortOrder),
                          published: block.published,
                        },
                      })
                    }
                  >
                    {common("edit")}
                  </button>
                  <ConfirmDelete
                    onConfirm={() =>
                      run(() => deleteServiceBlockAction(block.id))
                    }
                  />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </section>

      <section className={styles.section} aria-labelledby="delivery-heading">
        <div className={styles.sectionHeader}>
          <h2 id="delivery-heading">{t("delivery.title")}</h2>
          <button
            type="button"
            className={styles.primary}
            onClick={() =>
              setModal({ kind: "delivery", draft: emptyDelivery() })
            }
          >
            {t("delivery.add")}
          </button>
        </div>
        <AdminTable
          headers={[
            t("fields.caption"),
            t("fields.media"),
            t("fields.sortOrder"),
            t("fields.status"),
            t("fields.actions"),
          ]}
        >
          {deliveryPhotos.map((photo) => (
            <tr key={photo.id}>
              <td>
                <strong>{photo.caption.vi}</strong>
                <span className={styles.muted}> {photo.caption.en}</span>
              </td>
              <td>{photo.imageMediaId ? t("mediaSelected") : common("empty")}</td>
              <td>{photo.sortOrder}</td>
              <td>
                {statusButton(photo.published, () =>
                  updateDeliveryPhotoAction(photo.id, {
                    published: !photo.published,
                  }),
                )}
              </td>
              <td>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    onClick={() =>
                      setModal({
                        kind: "delivery",
                        id: photo.id,
                        draft: {
                          caption: photo.caption,
                          image: mediaSelection(
                            photo.imageMediaId,
                            photo.imageUrl,
                          ),
                          folder: "VEHICLES",
                          sortOrder: String(photo.sortOrder),
                          published: photo.published,
                        },
                      })
                    }
                  >
                    {common("edit")}
                  </button>
                  <ConfirmDelete
                    onConfirm={() =>
                      run(() => deleteDeliveryPhotoAction(photo.id))
                    }
                  />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </section>

      <AdminModal
        open={modal !== null}
        onClose={closeModal}
        title={
          modal
            ? t(`${modal.kind}.${modal.id ? "edit" : "create"}`)
            : t("title")
        }
      >
        {modal ? (
          <form className={styles.form} onSubmit={submit}>
            {modal.kind === "hero" ? (
              <>
                <LocalizedField
                  id="hero-title"
                  label={t("fields.title")}
                  required
                  value={modal.draft.title}
                  onChange={(title) =>
                    setModal({ ...modal, draft: { ...modal.draft, title } })
                  }
                />
                <LocalizedField
                  id="hero-subtitle"
                  label={t("fields.subtitle")}
                  multiline
                  value={modal.draft.subtitle}
                  onChange={(subtitle) =>
                    setModal({ ...modal, draft: { ...modal.draft, subtitle } })
                  }
                />
                <LocalizedField
                  id="hero-promo-chip"
                  label={t("fields.promoChip")}
                  value={modal.draft.promoChip}
                  onChange={(promoChip) =>
                    setModal({ ...modal, draft: { ...modal.draft, promoChip } })
                  }
                />
                <LocalizedField
                  id="hero-cta-label"
                  label={t("fields.ctaLabel")}
                  value={modal.draft.ctaLabel}
                  onChange={(ctaLabel) =>
                    setModal({ ...modal, draft: { ...modal.draft, ctaLabel } })
                  }
                />
                <FormField id="hero-cta-route" label={t("fields.ctaRouteKey")}>
                  <AdminInput
                    id="hero-cta-route"
                    value={modal.draft.ctaRouteKey}
                    onChange={(event) =>
                      setModal({
                        ...modal,
                        draft: {
                          ...modal.draft,
                          ctaRouteKey: event.currentTarget.value,
                        },
                      })
                    }
                  />
                </FormField>
                <MediaPicker
                  folder="HEROES"
                  label={t("fields.image")}
                  value={modal.draft.image}
                  onChange={(image) =>
                    setModal({ ...modal, draft: { ...modal.draft, image } })
                  }
                />
              </>
            ) : modal.kind === "service" ? (
              <>
                <LocalizedField
                  id="service-title"
                  label={t("fields.title")}
                  required
                  value={modal.draft.title}
                  onChange={(title) =>
                    setModal({ ...modal, draft: { ...modal.draft, title } })
                  }
                />
                <LocalizedField
                  id="service-description"
                  label={t("fields.description")}
                  multiline
                  value={modal.draft.description}
                  onChange={(description) =>
                    setModal({
                      ...modal,
                      draft: { ...modal.draft, description },
                    })
                  }
                />
                <div className={styles.grid}>
                  <FormField id="service-icon" label={t("fields.iconKey")}>
                    <AdminInput
                      id="service-icon"
                      value={modal.draft.iconKey}
                      onChange={(event) =>
                        setModal({
                          ...modal,
                          draft: {
                            ...modal.draft,
                            iconKey: event.currentTarget.value,
                          },
                        })
                      }
                    />
                  </FormField>
                  <FormField
                    id="service-link-route"
                    label={t("fields.linkRouteKey")}
                  >
                    <AdminInput
                      id="service-link-route"
                      value={modal.draft.linkRouteKey}
                      onChange={(event) =>
                        setModal({
                          ...modal,
                          draft: {
                            ...modal.draft,
                            linkRouteKey: event.currentTarget.value,
                          },
                        })
                      }
                    />
                  </FormField>
                </div>
              </>
            ) : (
              <>
                <LocalizedField
                  id="delivery-caption"
                  label={t("fields.caption")}
                  required
                  value={modal.draft.caption}
                  onChange={(caption) =>
                    setModal({ ...modal, draft: { ...modal.draft, caption } })
                  }
                />
                <FormField id="delivery-folder" label={t("fields.folder")}>
                  <AdminSelect
                    id="delivery-folder"
                    value={modal.draft.folder}
                    onChange={(event) =>
                      setModal({
                        ...modal,
                        draft: {
                          ...modal.draft,
                          folder: event.currentTarget.value as
                            | "VEHICLES"
                            | "SITE",
                          image: null,
                        },
                      })
                    }
                  >
                    <option value="VEHICLES">{t("folders.vehicles")}</option>
                    <option value="SITE">{t("folders.site")}</option>
                  </AdminSelect>
                </FormField>
                <MediaPicker
                  folder={modal.draft.folder}
                  label={t("fields.image")}
                  value={modal.draft.image}
                  onChange={(image) =>
                    setModal({ ...modal, draft: { ...modal.draft, image } })
                  }
                />
              </>
            )}

            <div className={styles.grid}>
              <FormField id="homepage-sort-order" label={t("fields.sortOrder")}>
                <AdminInput
                  id="homepage-sort-order"
                  type="number"
                  step="1"
                  value={modal.draft.sortOrder}
                  onChange={(event) =>
                    setModal({
                      ...modal,
                      draft: {
                        ...modal.draft,
                        sortOrder: event.currentTarget.value,
                      },
                    } as Modal)
                  }
                />
              </FormField>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={modal.draft.published}
                  onChange={(event) =>
                    setModal({
                      ...modal,
                      draft: {
                        ...modal.draft,
                        published: event.currentTarget.checked,
                      },
                    } as Modal)
                  }
                />
                {common("published")}
              </label>
            </div>
            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}
            <div className={styles.actions}>
              <button type="button" disabled={pending} onClick={closeModal}>
                {common("cancel")}
              </button>
              <button type="submit" className={styles.primary} disabled={pending}>
                {pending ? t("saving") : common("save")}
              </button>
            </div>
          </form>
        ) : null}
      </AdminModal>
    </div>
  );
}
