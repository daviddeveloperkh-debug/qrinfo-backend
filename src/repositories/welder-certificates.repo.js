import { eq, ilike, and, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { welderCertificates } from "../db/schema.js";

const getAll = async (page, limit, params) => {
  const conditions = [];

  if (params?.certificateNo) conditions.push(ilike(welderCertificates.certificateNo, `%${params.certificateNo}%`));
  if (params?.city) conditions.push(ilike(welderCertificates.city, `%${params.city}%`));
  if (params?.issuingBody) conditions.push(ilike(welderCertificates.issuingBody, `%${params.issuingBody}%`));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db.select().from(welderCertificates).where(whereClause).limit(limit).offset((page - 1) * limit),
    db.select({ total: sql`count(*)`.mapWith(Number) }).from(welderCertificates).where(whereClause),
  ]);

  return {
    data,
    pagination: { page, limit, total: countResult[0]?.total ?? 0 },
  };
};

const getStaticList = async () => {
  return await db
    .select({ id: welderCertificates.id, name: welderCertificates.certificatesName })
    .from(welderCertificates);
};

const getById = async (id) => {
  return await db.query.welderCertificates.findFirst({
    where: eq(welderCertificates.id, id),
  });
};

const create = async (data) => {
  const [certificate] = await db.insert(welderCertificates).values(data).returning();
  return certificate;
};

const updateById = async (id, data) => {
  const [updated] = await db
    .update(welderCertificates)
    .set(data)
    .where(eq(welderCertificates.id, id))
    .returning();
  return updated;
};

const deleteById = async (id) => {
  await db.delete(welderCertificates).where(eq(welderCertificates.id, id));
};

export default { getAll, getStaticList, getById, create, updateById, deleteById };
