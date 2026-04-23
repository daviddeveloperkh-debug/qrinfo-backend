import bcrypt from "bcryptjs";
import { db } from "./index.js";
import { users } from "./schema.js";
import USER_ROLE from "../enums/user-role.enum.js";

const admins = [
  {
    name: "Super Admin",
    login: "superadmin",
    password: "superadmin123",
    role: USER_ROLE.SUPER_ADMIN,
  },
  {
    name: "Admin",
    login: "admin",
    password: "admin123",
    role: USER_ROLE.ADMIN,
  },
];

const seed = async () => {
  try {
    console.log("Seeding started...");

    for (const admin of admins) {
      const hashedPassword = bcrypt.hashSync(admin.password, 10);

      await db
        .insert(users)
        .values({ ...admin, password: hashedPassword })
        .onConflictDoNothing();

      console.log(`✓ Created: ${admin.login} (${admin.name})`);
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
