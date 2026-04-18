const Admin = require("../models/admin");

const DEFAULT_ADMIN = {
  email: "admin@nexa.com",
  password: "dev123",
  firstName: "NEXA",
  lastName: "Admin",
  permissions: ["all"],
};

async function ensureDefaultAdmin() {
  const existingAdmin = await Admin.findOne({ email: DEFAULT_ADMIN.email });

  if (existingAdmin) {
    let isDirty = false;

    if (existingAdmin.roleType !== "Admin") {
      existingAdmin.roleType = "Admin";
      isDirty = true;
    }

    if (
      !Array.isArray(existingAdmin.permissions) ||
      existingAdmin.permissions.length === 0 ||
      existingAdmin.password !== DEFAULT_ADMIN.password
    ) {
      existingAdmin.permissions = DEFAULT_ADMIN.permissions;
      existingAdmin.password = DEFAULT_ADMIN.password;
      isDirty = true;
    }

    if (isDirty) {
      await existingAdmin.save();
    }

    return {
      created: false,
      email: existingAdmin.email,
    };
  }

  const createdAdmin = await Admin.create({
    email: DEFAULT_ADMIN.email,
    password: DEFAULT_ADMIN.password,
    firstName: DEFAULT_ADMIN.firstName,
    lastName: DEFAULT_ADMIN.lastName,
    roleType: "Admin",
    permissions: DEFAULT_ADMIN.permissions,
  });

  return {
    created: true,
    email: createdAdmin.email,
  };
}

module.exports = {
  ensureDefaultAdmin,
  DEFAULT_ADMIN,
};
