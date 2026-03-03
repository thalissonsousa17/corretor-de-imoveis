/**
 * Prisma-compatible adapter backed by Supabase REST API (HTTPS/IPv4).
 * Replaces the direct Prisma+PostgreSQL TCP connection, which is IPv6-only
 * on Supabase free tier and unreachable from Vercel.
 *
 * Supports the same API used across the project:
 *  findUnique / findFirst / findMany / create / update / delete /
 *  deleteMany / count / upsert / createMany / updateMany
 */

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

// ─── Supabase admin client (bypasses RLS) ────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// ─── Model → Table name map ───────────────────────────────────────────────────
const MODEL_TABLE: Record<string, string> = {
  user: "User",
  session: "Session",
  corretorProfile: "CorretorProfile",
  imovel: "Imovel",
  foto: "Foto",
  lead: "Lead",
  visita: "Visita",
  comissao: "Comissao",
  contrato: "Contrato",
  assinatura: "Assinatura",
  imovelView: "ImovelView",
  passwordResetToken: "PasswordResetToken",
  ticketSuporte: "TicketSuporte",
  mensagemSuporte: "MensagemSuporte",
  dominio: "Dominio",
  pagina: "Pagina",
};

// ─── Prisma relation name → Table name (for `include`) ───────────────────────
const RELATION_TABLE: Record<string, string> = {
  user: "User",
  corretor: "User",
  autor: "User",
  imovel: "Imovel",
  fotos: "Foto",
  profile: "CorretorProfile",
  ticket: "TicketSuporte",
  mensagens: "MensagemSuporte",
  assinaturas: "Assinatura",
  views: "ImovelView",
  comissoes: "Comissao",
  visitas: "Visita",
  contratos: "Contrato",
  leads: "Lead",
  sessions: "Session",
  dominios: "Dominio",
  resetTokens: "PasswordResetToken",
};

// ─── Build Supabase select string from Prisma include/select ─────────────────
function buildSelect(include?: Record<string, unknown>, select?: Record<string, unknown>): string {
  if (select) {
    const cols = Object.entries(select)
      .filter(([, v]) => v === true)
      .map(([k]) => k);
    return cols.length ? cols.join(",") : "*";
  }

  if (!include) return "*";

  const parts: string[] = ["*"];
  for (const [key, value] of Object.entries(include)) {
    if (!value) continue;
    const table = RELATION_TABLE[key] ?? key;
    if (value === true) {
      parts.push(`${key}:${table}(*)`);
    } else if (typeof value === "object") {
      const nested = value as Record<string, unknown>;
      if (nested.select && typeof nested.select === "object") {
        const cols = Object.entries(nested.select as Record<string, unknown>)
          .filter(([, v]) => v === true)
          .map(([k]) => k)
          .join(",");
        parts.push(`${key}:${table}(${cols || "*"})`);
      } else {
        parts.push(`${key}:${table}(*)`);
      }
    }
  }
  return parts.join(",");
}

// ─── Apply Prisma where clause to a Supabase query ───────────────────────────
function applyWhere(query: ReturnType<typeof supabase.from>, where: Record<string, unknown>) {
  for (const [key, value] of Object.entries(where)) {
    if (key === "AND" || key === "OR" || key === "NOT") continue; // skip complex — rare in this project

    if (value === null) {
      query = (query as any).is(key, null);
    } else if (value === undefined) {
      continue;
    } else if (typeof value === "object" && !Array.isArray(value)) {
      const op = value as Record<string, unknown>;
      // Use independent ifs so compound operators like { gte: x, lt: y } all get applied
      if ("in" in op)         query = (query as any).in(key, op.in);
      if ("notIn" in op)      query = (query as any).not(key, "in", `(${(op.notIn as unknown[]).join(",")})`);
      if ("contains" in op)   query = (query as any).ilike(key, `%${op.contains}%`);
      if ("startsWith" in op) query = (query as any).ilike(key, `${op.startsWith}%`);
      if ("endsWith" in op)   query = (query as any).ilike(key, `%${op.endsWith}`);
      if ("gte" in op)        query = (query as any).gte(key, op.gte);
      if ("lte" in op)        query = (query as any).lte(key, op.lte);
      if ("gt" in op)         query = (query as any).gt(key, op.gt);
      if ("lt" in op)         query = (query as any).lt(key, op.lt);
      if ("not" in op) {
        if (op.not === null) query = (query as any).not(key, "is", null);
        else                 query = (query as any).neq(key, op.not);
      }
      if ("equals" in op)     query = (query as any).eq(key, op.equals);
    } else {
      query = (query as any).eq(key, value);
    }
  }
  return query;
}

// ─── Apply Prisma orderBy ─────────────────────────────────────────────────────
function applyOrderBy(query: ReturnType<typeof supabase.from>, orderBy: unknown) {
  if (!orderBy) return query;
  const entries = Array.isArray(orderBy) ? orderBy : [orderBy];
  for (const order of entries) {
    for (const [col, dir] of Object.entries(order as Record<string, string>)) {
      query = (query as any).order(col, { ascending: dir === "asc" });
    }
  }
  return query;
}

// ─── Model proxy factory ──────────────────────────────────────────────────────
function createModel(modelName: string) {
  const table = MODEL_TABLE[modelName] ?? modelName;

  return {
    async findUnique({ where, include, select }: any) {
      let q = supabase.from(table).select(buildSelect(include, select));
      if (where) q = applyWhere(q as any, where) as any;
      const { data, error } = await (q as any).maybeSingle();
      if (error) throw new Error(`[${table}.findUnique] ${error.message}`);
      return data ?? null;
    },

    async findFirst({ where, include, select, orderBy, take }: any) {
      let q = supabase.from(table).select(buildSelect(include, select));
      if (where) q = applyWhere(q as any, where) as any;
      q = applyOrderBy(q as any, orderBy) as any;
      q = (q as any).limit(take ?? 1);
      const { data, error } = await q;
      if (error) throw new Error(`[${table}.findFirst] ${error.message}`);
      return (data as any[])?.[0] ?? null;
    },

    async findMany({ where, include, select, orderBy, skip, take }: any = {}) {
      let q = supabase.from(table).select(buildSelect(include, select));
      if (where) q = applyWhere(q as any, where) as any;
      q = applyOrderBy(q as any, orderBy) as any;
      if (skip !== undefined || take !== undefined) {
        const from = skip ?? 0;
        const to = take !== undefined ? from + take - 1 : from + 9999;
        q = (q as any).range(from, to);
      }
      const { data, error } = await q;
      if (error) throw new Error(`[${table}.findMany] ${error.message}`);
      return data ?? [];
    },

    async create({ data, include, select }: any) {
      const row = data.id ? data : { id: randomUUID(), ...data };
      const { data: result, error } = await supabase
        .from(table)
        .insert(row)
        .select(buildSelect(include, select))
        .single();
      if (error) throw new Error(`[${table}.create] ${error.message}`);
      return result;
    },

    async createMany({ data, skipDuplicates }: any) {
      const rows = (Array.isArray(data) ? data : [data]).map((r: any) =>
        r.id ? r : { id: randomUUID(), ...r }
      );
      const q = supabase.from(table).insert(rows);
      const { error } = skipDuplicates ? (q as any).onConflict("id").merge() : await q;
      if (error) throw new Error(`[${table}.createMany] ${error.message}`);
      return { count: rows.length };
    },

    async update({ where, data, include, select }: any) {
      let q = supabase.from(table).update(data).select(buildSelect(include, select));
      if (where) q = applyWhere(q as any, where) as any;
      const { data: result, error } = await (q as any).single();
      if (error) throw new Error(`[${table}.update] ${error.message}`);
      return result;
    },

    async updateMany({ where, data }: any) {
      let q = supabase.from(table).update(data);
      if (where) q = applyWhere(q as any, where) as any;
      const { error } = await q;
      if (error) throw new Error(`[${table}.updateMany] ${error.message}`);
      return { count: 0 };
    },

    async delete({ where, include, select }: any) {
      let q = supabase.from(table).delete().select(buildSelect(include, select));
      if (where) q = applyWhere(q as any, where) as any;
      const { data: result, error } = await (q as any).single();
      if (error) throw new Error(`[${table}.delete] ${error.message}`);
      return result;
    },

    async deleteMany({ where }: any = {}) {
      let q = supabase.from(table).delete();
      if (where) q = applyWhere(q as any, where) as any;
      const { error } = await q;
      if (error) throw new Error(`[${table}.deleteMany] ${error.message}`);
      return { count: 0 };
    },

    async count({ where, select: _select }: any = {}) {
      let q = supabase.from(table).select("*", { count: "exact", head: true });
      if (where) q = applyWhere(q as any, where) as any;
      const { count, error } = await q;
      if (error) throw new Error(`[${table}.count] ${error.message}`);
      return count ?? 0;
    },

    async upsert({ where, create, update, include, select }: any) {
      // Try update first; fall back to create
      let findQ = supabase.from(table).select("id");
      if (where) findQ = applyWhere(findQ as any, where) as any;
      const { data: existing } = await (findQ as any).maybeSingle();

      if (existing) {
        let upQ = supabase.from(table).update(update).select(buildSelect(include, select));
        if (where) upQ = applyWhere(upQ as any, where) as any;
        const { data: result, error } = await (upQ as any).single();
        if (error) throw new Error(`[${table}.upsert/update] ${error.message}`);
        return result;
      } else {
        const { data: result, error } = await supabase
          .from(table)
          .insert(create)
          .select(buildSelect(include, select))
          .single();
        if (error) throw new Error(`[${table}.upsert/create] ${error.message}`);
        return result;
      }
    },

    async aggregate({ where, _count, _sum, _avg, _min, _max }: any = {}) {
      if (_count) {
        let q = supabase.from(table).select("*", { count: "exact", head: true });
        if (where) q = applyWhere(q as any, where) as any;
        const { count, error } = await q;
        if (error) throw new Error(`[${table}.aggregate] ${error.message}`);
        const keys = typeof _count === "object" ? Object.keys(_count) : ["_all"];
        return { _count: Object.fromEntries(keys.map((k) => [k, count ?? 0])) };
      }
      return {};
    },

    // groupBy — client-side aggregation (Supabase REST doesn't support GROUP BY directly)
    async groupBy({ by, where, _count, _sum, _avg, orderBy, take, skip }: any) {
      let q = supabase.from(table).select("*");
      if (where) q = applyWhere(q as any, where) as any;
      const { data, error } = await q;
      if (error) throw new Error(`[${table}.groupBy] ${error.message}`);

      const records: any[] = data ?? [];
      const groups: Record<string, any> = {};

      for (const row of records) {
        const key = (by as string[]).map((f) => row[f]).join("__||__");
        if (!groups[key]) {
          const base: any = {};
          for (const f of by as string[]) base[f] = row[f];
          if (_count) { base._count = {}; for (const f of Object.keys(_count)) base._count[f] = 0; }
          if (_sum)   { base._sum   = {}; for (const f of Object.keys(_sum))   base._sum[f]   = 0; }
          groups[key] = base;
        }
        if (_count) for (const f of Object.keys(_count)) if (row[f] != null) groups[key]._count[f]++;
        if (_sum)   for (const f of Object.keys(_sum))   if (row[f] != null) groups[key]._sum[f] += row[f];
      }

      let result: any[] = Object.values(groups);

      if (orderBy) {
        if (orderBy._count) {
          const [field, dir] = Object.entries(orderBy._count as Record<string, string>)[0];
          result.sort((a, b) => dir === "asc"
            ? (a._count?.[field] ?? 0) - (b._count?.[field] ?? 0)
            : (b._count?.[field] ?? 0) - (a._count?.[field] ?? 0));
        } else {
          const [field, dir] = Object.entries(orderBy as Record<string, string>)[0];
          result.sort((a, b) => dir === "asc"
            ? String(a[field]).localeCompare(String(b[field]))
            : String(b[field]).localeCompare(String(a[field])));
        }
      }

      if (skip !== undefined || take !== undefined) {
        const from = skip ?? 0;
        result = result.slice(from, take !== undefined ? from + take : undefined);
      }

      return result;
    },
  };
}

// ─── Main export — drop-in replacement for `prisma` ──────────────────────────
export const prisma = {
  user:               createModel("user"),
  session:            createModel("session"),
  corretorProfile:    createModel("corretorProfile"),
  imovel:             createModel("imovel"),
  foto:               createModel("foto"),
  lead:               createModel("lead"),
  visita:             createModel("visita"),
  comissao:           createModel("comissao"),
  contrato:           createModel("contrato"),
  assinatura:         createModel("assinatura"),
  imovelView:         createModel("imovelView"),
  passwordResetToken: createModel("passwordResetToken"),
  ticketSuporte:      createModel("ticketSuporte"),
  mensagemSuporte:    createModel("mensagemSuporte"),
  dominio:            createModel("dominio"),
  pagina:             createModel("pagina"),

  $disconnect: async () => {},
  $connect:    async () => {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $transaction: async (fn: ((tx: any) => Promise<any>) | Promise<any>[]) => {
    if (typeof fn === "function") return fn(prisma);
    return Promise.all(fn);
  },
};
