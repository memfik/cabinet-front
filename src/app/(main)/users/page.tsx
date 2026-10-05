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
import {useApi} from "@/lib/hooks/useApi"
import {parseApiError} from "@/lib/api/errors"
import {subUsersApi} from "@/lib/api/subUsers"
import type {User} from "@/lib/api/auth"

const fullName = (u: User) => [u.first_name, u.last_name].filter(Boolean).join(" ") || "—"

/** Субпользователи договора. Раздел доступен только менеджерам (`is_user_manager`), иначе бэк отвечает 403. */
export default function UsersPage() {
  const {data: users, error, loading, reload} = useApi(() => subUsersApi.list())
  // undefined — диалог закрыт, null — создание, User — редактирование
  const [editing, setEditing] = useState<User | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<User | null>(null)

  const forbidden = error?.status === 403

  return (
    <Page
      title="Пользователи"
      description="Сотрудники, у которых есть доступ к кабинету по вашему лицевому счёту."
      actions={
        !forbidden && (
          <Button className="bg-brand hover:bg-brand/90 h-10 px-4 text-white" onClick={() => setEditing(null)}>
            <Plus /> Добавить
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
              title="Нет доступа"
              description="Управлять пользователями могут только менеджеры. Обратитесь к владельцу договора."
            />
          ) : error && !users ? (
            <ErrorState error={error} onRetry={reload} />
          ) : (
            <EmptyState
              title="Пользователей пока нет"
              description="Добавьте сотрудника, чтобы он мог входить в кабинет."
            />
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
  const name = fullName(user)
  const initials = (name !== "—" ? name : user.email).split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")

  return (
    <Card className="flex flex-col gap-3 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="bg-brand/10 text-brand flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{name !== "—" ? name : user.email}</p>
          <p className="text-muted-foreground truncate text-sm">{user.position ?? "Должность не указана"}</p>
        </div>
      </div>
      <div className="border-border flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <span className="text-muted-foreground min-w-0 truncate text-sm">{user.email}</span>
        {user.is_user_manager && <Badge tone="brand">Менеджер</Badge>}
      </div>
      <RowActions user={user} onEdit={onEdit} onDelete={onDelete} />
    </Card>
  )
}

/** Кнопки показываются по правам текущего пользователя на запись. */
function RowActions({user, onEdit, onDelete}: {user: User; onEdit: () => void; onDelete: () => void}) {
  if (!user.permissions.update && !user.permissions.delete) return null
  return (
    <div className="flex gap-2">
      {user.permissions.update && (
        <Button variant="outline" className="h-11 flex-1 text-[15px]" onClick={onEdit}>
          <Pencil /> Изменить
        </Button>
      )}
      {user.permissions.delete && (
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive h-11 flex-1 text-[15px]"
          onClick={onDelete}
        >
          <Trash2 /> Удалить
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
      toast.success(isEdit ? "Изменения сохранены" : "Пользователь добавлен")
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
        <DialogTitle>{isEdit ? "Изменить пользователя" : "Новый пользователь"}</DialogTitle>
        <DialogDescription>
          {isEdit ? "Оставьте пароль пустым, чтобы не менять его." : "Email станет логином для входа в кабинет."}
        </DialogDescription>
      </DialogHeader>

      <ErrorBanner message={err.banner} />

      <Field
        label="Email"
        required
        error={firstError(err, "email")}
        hint={isEdit ? undefined : "Не длиннее 32 символов"}
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
        <Field label="Имя" error={firstError(err, "first_name")}>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={50} />
        </Field>
        <Field label="Фамилия" error={firstError(err, "last_name")}>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={50} />
        </Field>
      </div>
      <Field label="Должность" error={firstError(err, "position")}>
        <Input value={position} onChange={(e) => setPosition(e.target.value)} maxLength={255} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Пароль"
          error={firstError(err, "password")}
          hint={isEdit ? undefined : "Не указан — будет сгенерирован и отправлен на email"}
        >
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!firstError(err, "password")}
          />
        </Field>
        <Field label="Повтор пароля" error={firstError(err, "password_confirmation")}>
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
          Может управлять пользователями
          <span className="text-muted-foreground block text-xs">Доступ к разделу «Пользователи»</span>
        </span>
      </label>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
          Отмена
        </Button>
        <Button type="submit" disabled={saving} className="bg-brand hover:bg-brand/90 text-white">
          {saving ? "Сохранение…" : "Сохранить"}
        </Button>
      </DialogFooter>
    </form>
  )
}

/* ---------- удаление ---------- */

function DeleteDialog({user, onClose, onDeleted}: {user: User | null; onClose: () => void; onDeleted: () => void}) {
  const [busy, setBusy] = useState(false)

  async function remove() {
    if (!user) return
    setBusy(true)
    try {
      await subUsersApi.remove(user.id)
      toast.success("Пользователь удалён")
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
          <DialogTitle>Удалить пользователя?</DialogTitle>
          <DialogDescription>
            {user && `${fullName(user) !== "—" ? fullName(user) : user.email} потеряет доступ к кабинету. `}
            Его подчинённые пользователи перейдут к его руководителю.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={remove} disabled={busy}>
            {busy ? "Удаление…" : "Удалить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
