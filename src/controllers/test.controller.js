import { sql, and, eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { partitionTest } from "../db/partition.js";

// 1. Dinamik partition yaratish funksiyasi
async function ensureYearlyPartition(year) {
  const tableName = `test_partition_${year}`;
  await db.execute(
    sql.raw(`
    CREATE TABLE IF NOT EXISTS ${tableName} 
    PARTITION OF test_partition 
    FOR VALUES FROM (${year}) TO (${year + 1});
  `),
  );
}

// --- CREATE ---
const createTest = async (req, res) => {
  try {
    const requestData = req.body;
    const currentYear = new Date().getFullYear();

    await ensureYearlyPartition(currentYear);

    const [result] = await db
      .insert(partitionTest)
      .values({
        ...requestData,
        year: currentYear,
      })
      .returning();

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("FULL ERROR DETAILS:", error); // <-- Mana buni qo'shing
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- GET ALL (Pagination bilan) ---
const getAllTest = async (req, res) => {
  try {
    // Query params: ?page=1&limit=10&year=2026&name=Ali
    const { page = 1, limit = 10, year, name } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Dinamik where shartlarini yig'amiz
    const filters = [];
    if (year) filters.push(eq(partitionTest.year, Number(year)));
    if (name) filters.push(eq(partitionTest.name, name));

    // So'rovni amalga oshirish
    // Agar year berilmasa, Postgres barcha partitionlardan qidiradi (Parent table kuchi)
    const data = await db
      .select()
      .from(partitionTest)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .limit(Number(limit))
      .offset(offset)
      .orderBy(desc(partitionTest.createdAt));

    // Jami sonini olish
    const totalResult = await db
      .select({ count: sql`count(*)` })
      .from(partitionTest)
      .where(filters.length > 0 ? and(...filters) : undefined);

    res.status(200).json({
      success: true,
      data,
      meta: {
        total: Number(totalResult[0].count),
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- GET BY ID (Year majburiy) ---
const getByIdTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { year } = req.query; // Year query-dan olinadi: /test/:id?year=2026

    if (!year) {
      return res.status(400).json({
        success: false,
        message: "Partitioning uchun 'year' parametri majburiy!",
      });
    }

    const [result] = await db
      .select()
      .from(partitionTest)
      .where(
        and(
          eq(partitionTest.id, id), // UUID bo'lsa string, serial bo'lsa Number(id)
          eq(partitionTest.year, Number(year)),
        ),
      );

    if (!result) {
      return res.status(404).json({ success: false, message: "Ma'lumot topilmadi" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  createTest,
  getAllTest,
  getByIdTest,
};
