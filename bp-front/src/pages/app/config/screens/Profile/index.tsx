import { NameForm } from './components/name-form'
import { PasswordForm } from './components/password-form'

export const Profile = () => {
  return (
    <div className="space-y-4">
      <div className="rounded-sm bg-neutral-0 p-6">
        <NameForm />
      </div>

      <div className="rounded-sm bg-neutral-0 p-6">
        <PasswordForm />
      </div>
    </div>
  )
}
