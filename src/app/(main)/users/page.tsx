"use client"

import {useState} from "react"
import {toast} from "sonner"
import {Pencil, Plus, ShieldOff, Trash2} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Page, Card} from "@/app/components/common/Page"
import {EmptyState, ErrorState, ListSkeleton} from "@/app/components/common/States"
import {Field} from "@/app/components/common/Field"
import {Badge} from "@/app/components/common/Badge"
import {ErrorBanner, NO_ERROR, firstError, handleFormError, type FormError} from "@/app/components/common/formError"
import {useI18n} from "@/i18n"
import {useApi} from "@/lib/hooks/useApi"
import {parseApiError} from "@/lib/api/errors"
import {subUsersApi} from "@/lib/api/subUsers"
import type {User} from "@/lib/api/auth"

const fullName = (u: User) => [u.first_name, u.last_name].filter(Boolean).join(" ") || "—"

/** Субпользователи договора. Раздел доступен только менеджерам (`is_user_manager`), иначе бэк отвечает 403. */
export default function UsersPage() {
  const {t} = useI18n()
  const {data: users, error, loading, reload} = useApi(() => subUsersApi.list())
  // undefined — диалог закрыт, null — создание, User — редактирование
  const [editing, setEditing] = useState<User | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<User | null>(null)

  const forbidden = error?.status === 403

  return (
    <Page
      title={t("users.title")}
      description={t("users.description")}
      actions={
        !forbidden && (
          <Button className="bg-brand hover:bg-brand/90 h-10 px-4 text-white" onClick={() => setEditing(null)}>
            <Plus /> {t("users.add")}
          </Button>
        )
      }
    >
      {users?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((u) => (
            <UserCard key={u.id} user={u} onEdit={() => setEditing(u)} onDelete={() => setDeleting(u)} />
          ))}
        </div>
      ) : (
        <Card>
          {loading && !users ? (
            <ListSkeleton />
          ) : forbidden ? (
            <EmptyState
              icon={ShieldOff}
              title={t("users.noAccessTitle")}
              description={t("users.noAccessDescription")}
            />
          ) : error && !users ? (
            <ErrorState error={error} onRetry={reload} />
          ) : (
            <EmptyState title={t("users.emptyTitle")} description={t("users.emptyDescription")} />
          )}
        </Card>
      )}

      <UserDialog
        user={editing}
        onClose={() => setEditing(undefined)}
        onSaved={() => {
          setEditing(undefined)
          reload()
        }}
      />
      <DeleteDialog
        user={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => {
          setDeleting(null)
          reload()
        }}
      />
    </Page>
  )
}

/** Карточка пользователя: аватар с инициалами, имя, должность и email. */
function UserCard({user, onEdit, onDelete}: {user: User; onEdit: () => void; onDelete: () => void}) {
  const {t} = useI18n()
  const name = fullName(user)
  const initials = (name !== "—" ? name : user.email)
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")

  return (
    <Card className="flex flex-col gap-3 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{name !== "—" ? name : user.email}</p>
          <p className="text-muted-foreground truncate text-sm">{user.position ?? t("users.noPosition")}</p>
        </div>
      </div>
      <div className="border-border flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <span className="text-muted-foreground min-w-0 truncate text-sm">{user.email}</span>
        {user.is_user_manager && <Badge tone="brand">{t("users.manager")}</Badge>}
      </div>
      <RowActions user={user} onEdit={onEdit} onDelete={onDelete} />
    </Card>
  )
}

/** Кнопки показываются по правам текущего пользователя на запись. */
function RowActions({user, onEdit, onDelete}: {user: User; onEdit: () => void; onDelete: () => void}) {
  const {t} = useI18n()
  if (!user.permissions.update && !user.permissions.delete) return null
  return (
    <div className="flex gap-2">
      {user.permissions.update && (
        <Button variant="outline" className="h-11 flex-1 text-[15px]" onClick={onEdit}>
          <Pencil /> {t("users.edit")}
        </Button>
      )}
      {user.permissions.delete && (
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive h-11 flex-1 text-[15px]"
          onClick={onDelete}
        >
          <Trash2 /> {t("users.delete")}
        </Button>
      )}
    </div>
  )
}

/* ---------- создание / редактирование ---------- */

function UserDialog({
  user,
  onClose,
  onSaved,
}: {
  user: User | null | undefined
  onClose: () => void
  onSaved: () => void
}) {
  const open = user !== undefined
  // key перемонтирует форму при каждом открытии — состояние полей не «залипает»
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {open && <UserForm key={user?.id ?? "new"} user={user} onClose={onClose} onSaved={onSaved} />}
      </DialogContent>
    </Dialog>
  )
}

function UserForm({user, onClose, onSaved}: {user: User | null; onClose: () => void; onSaved: () => void}) {
  const {t} = useI18n()
  const isEdit = !!user
  const [email, setEmail] = useState(user?.email ?? "")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [firstName, setFirstName] = useState(user?.first_name ?? "")
  const [lastName, setLastName] = useState(user?.last_name ?? "")
  const [position, setPosition] = useState(user?.position ?? "")
  const [isManager, setIsManager] = useState(user?.is_user_manager ?? false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<FormError>(NO_ERROR)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErr(NO_ERROR)
    const payload = {
      email,
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      position: position.trim() || null,
      is_user_manager: isManager,
      // пароль не указан — на бэке не меняется (правка) или генерируется (создание)
      ...(password ? {password, password_confirmation: confirmation} : {}),
    }
    try {
      if (user) await subUsersApi.update(user.id, payload)
      else await subUsersApi.create(payload)
      toast.success(isEdit ? t("users.saved") : t("users.added"))
      onSaved()
    } catch (e) {
      setErr(handleFormError(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{isEdit ? t("users.editTitle") : t("users.newTitle")}</DialogTitle>
        <DialogDescription>{isEdit ? t("users.editHint") : t("users.newHint")}</DialogDescription>
      </DialogHeader>

      <ErrorBanner message={err.banner} />

      <Field
        label={t("users.emailLabel")}
        required
        error={firstError(err, "email")}
        hint={isEdit ? undefined : t("users.emailMaxHint")}
      >
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={isEdit ? 254 : 32}
          aria-invalid={!!firstError(err, "email")}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("users.firstName")} error={firstError(err, "first_name")}>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={50} />
        </Field>
        <Field label={t("users.lastName")} error={firstError(err, "last_name")}>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={50} />
        </Field>
      </div>
      <Field label={t("users.position")} error={firstError(err, "position")}>
        <Input value={position} onChange={(e) => setPosition(e.target.value)} maxLength={255} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("users.password")}
          error={firstError(err, "password")}
          hint={isEdit ? undefined : t("users.passwordHint")}
        >
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!firstError(err, "password")}
          />
        </Field>
        <Field label={t("users.passwordConfirmation")} error={firstError(err, "password_confirmation")}>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            disabled={!password}
          />
        </Field>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={isManager}
          onChange={(e) => setIsManager(e.target.checked)}
          className="accent-brand mt-0.5 size-4"
        />
        <span>
          {t("users.canManage")}
          <span className="text-muted-foreground block text-xs">{t("users.canManageHint")}</span>
        </span>
      </label>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
          {t("users.cancel")}
        </Button>
        <Button type="submit" disabled={saving} className="bg-brand hover:bg-brand/90 text-white">
          {saving ? t("users.saving") : t("users.save")}
        </Button>
      </DialogFooter>
    </form>
  )
}

/* ---------- удаление ---------- */

function DeleteDialog({user, onClose, onDeleted}: {user: User | null; onClose: () => void; onDeleted: () => void}) {
  const {t} = useI18n()
  const [busy, setBusy] = useState(false)

  async function remove() {
    if (!user) return
    setBusy(true)
    try {
      await subUsersApi.remove(user.id)
      toast.success(t("users.deleted"))
      onDeleted()
    } catch (e) {
      // 409 — на пользователя ссылаются заявки или заказы: показываем текст бэка как есть
      toast.error(parseApiError(e).message)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("users.deleteTitle")}</DialogTitle>
          <DialogDescription>
            {user && `${t("users.deleteLosesAccess", {name: fullName(user) !== "—" ? fullName(user) : user.email})} `}
            {t("users.deleteSubordinates")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {t("users.cancel")}
          </Button>
          <Button variant="destructive" onClick={remove} disabled={busy}>
            {busy ? t("users.deleting") : t("users.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
