import { LoginForm } from "../components/login-form";
import { OAuthButtons } from "../components/oauth-buttons";

export function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Continue to your conversations and calls.
        </p>
      </div>
      <LoginForm />
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
