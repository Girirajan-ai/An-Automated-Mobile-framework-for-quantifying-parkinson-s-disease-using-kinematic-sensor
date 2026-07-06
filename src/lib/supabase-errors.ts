export function isMissingTableError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return error.code === "PGRST205" || msg.includes("could not find the table") || msg.includes("schema cache");
}

export function supabaseErrorMessage(error: { message?: string; code?: string }, table?: string): string {
  if (isMissingTableError(error)) {
    return table
      ? `Database table "${table}" is missing. Run supabase-fix-missing-tables.sql in Supabase SQL Editor, then refresh.`
      : "Database tables are missing. Run supabase-fix-missing-tables.sql in Supabase SQL Editor, then refresh.";
  }
  return error.message ?? "Database error";
}
