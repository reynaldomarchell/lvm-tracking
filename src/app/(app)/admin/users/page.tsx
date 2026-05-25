import { desc } from "drizzle-orm";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Shield, UserCircle } from "lucide-react";
import { PageContainer } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { AddUserForm } from "./add-user-form";
import { UserRowActions } from "./user-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  const allUsers = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <PageContainer title="Manajemen User">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-slate-600">
            {allUsers.length} user terdaftar
          </p>
          <AddUserForm />
        </div>

        <div className="space-y-2">
          {allUsers.map((u) => {
            const isSelf = u.id === session.sub;
            return (
              <Card
                key={u.id}
                className={!u.isActive ? "opacity-60" : undefined}
              >
                <CardContent className="py-3 flex items-center gap-3">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                      u.role === "admin"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {u.role === "admin" ? (
                      <Shield className="size-5" />
                    ) : (
                      <UserCircle className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-sm text-slate-900 truncate">
                        {u.name}
                      </p>
                      {isSelf && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5"
                        >
                          Kamu
                        </Badge>
                      )}
                      {u.role === "admin" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Admin
                        </Badge>
                      )}
                      {!u.isActive && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 bg-slate-100 text-slate-500"
                        >
                          Non-aktif
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      @{u.username} · dibuat{" "}
                      {format(u.createdAt, "d MMM yyyy", { locale: idLocale })}
                    </p>
                  </div>
                  <UserRowActions user={u} isSelf={isSelf} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
