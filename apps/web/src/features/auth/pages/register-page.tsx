import { RegisterForm } from "../components/register-form";
import { OAuthButtons } from "../components/oauth-buttons";

export function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Set up your workspace identity and get connected.
        </p>
      </div>
      <RegisterForm />
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-4 text-xs uppercase tracking-wide text-muted-foreground">
          <span className="flex-1 border-t" />
          <span>or</span>
          <span className="flex-1 border-t" />
        </div>
        <OAuthButtons />
      </div>
    </div>
  );
}
