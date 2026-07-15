import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { UserPayload } from "@/features/auth/api/types";
import { createDirectConversation } from "@/features/workspace/api/create-direct-conversation";
import { discoverUsers } from "@/features/workspace/api/discover-users";

export function ContactsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [contacts, setContacts] = useState<UserPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setIsLoading(true);
      try {
        const users = await discoverUsers(query);
        if (!active) {
          return;
        }
        setContacts(users);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to search people right now.";
        toast.error(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    const timer = window.setTimeout(() => {
      void loadUsers();
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  async function handleMessage(user: UserPayload) {
    try {
      const conversation = await createDirectConversation(user._id);
      navigate(`/?chat=${encodeURIComponent(conversation._id)}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start conversation.";
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6 lg:mx-auto lg:max-w-4xl">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Contacts</h2>
        <p className="text-sm text-muted-foreground">
          Search by name, username, or email to start a direct conversation.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl border bg-card/80 px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search people"
          className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="rounded-2xl border bg-card/80 px-5 py-8 text-sm text-muted-foreground">
            Loading contacts...
          </div>
        ) : contacts.length ? (
          contacts.map((contact) => (
            <div
              key={contact._id}
              className="flex items-center justify-between gap-4 rounded-2xl border bg-card/80 px-5 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <ProfileAvatar name={contact.name} email={contact.email} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {contact.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    @{contact.username}
                  </p>
                </div>
              </div>

              <Button type="button" onClick={() => void handleMessage(contact)}>
                Message
              </Button>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed bg-card/80 px-5 py-8 text-sm text-muted-foreground">
            No people matched your search.
          </div>
        )}
      </div>
    </div>
  );
}
