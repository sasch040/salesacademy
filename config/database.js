import path from "path"

export default ({ env }) => {
  const client = env("DATABASE_CLIENT", "sqlite")

  const connections = {
    mysql: {
      connection: {
        host: env("DATABASE_HOST", "localhost"),
        port: env.int("DATABASE_PORT", 3306),
        database: env("DATABASE_NAME", "strapi"),
        user: env("DATABASE_USERNAME", "strapi"),
        password: env("DATABASE_PASSWORD", "strapi"),
        ssl: env.bool("DATABASE_SSL", false)
          ? {
              rejectUnauthorized: env.bool("DATABASE_SSL_REJECT_UNAUTHORIZED", false),
            }
          : false,
        charset: "utf8mb4",
        collation: "utf8mb4_unicode_ci",
      },
      pool: {
        min: env.int("DATABASE_POOL_MIN", 2),
        max: env.int("DATABASE_POOL_MAX", 10),
        // 🎯 KORRIGIERT: sql_mode ohne NO_AUTO_CREATE_USER
        afterCreate: (conn, done) => {
          conn.query(
            "SET SESSION sql_mode = 'TRADITIONAL,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';",
            (err) => {
              if (err) {
                console.warn("⚠️ Could not set sql_mode:", err.message)
                // Fallback: Versuche minimalen sql_mode
                conn.query("SET SESSION sql_mode = '';", (fallbackErr) => {
                  if (fallbackErr) {
                    console.error("❌ Fallback sql_mode failed:", fallbackErr.message)
                  } else {
                    console.log("✅ SQL mode set to empty (fallback)")
                  }
                  done(fallbackErr, conn)
                })
              } else {
                console.log("✅ SQL mode set successfully")
                done(err, conn)
              }
            },
          )
        },
      },
    },
    postgres: {
      connection: {
        connectionString: env("DATABASE_URL"),
        host: env("DATABASE_HOST", "localhost"),
        port: env.int("DATABASE_PORT", 5432),
        database: env("DATABASE_NAME", "strapi"),
        user: env("DATABASE_USERNAME", "strapi"),
        password: env("DATABASE_PASSWORD", "strapi"),
        ssl: false,
        schema: env("DATABASE_SCHEMA", "public"),
      },
      pool: {
        min: env.int("DATABASE_POOL_MIN", 2),
        max: env.int("DATABASE_POOL_MAX", 10),
      },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, "..", "..", env("DATABASE_FILENAME", ".tmp/data.db")),
      },
      useNullAsDefault: true,
    },
  }

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
    },
  }
}
