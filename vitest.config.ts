import { defineConfig } from "vitest/config";

export default defineConfig({
  // Résout l'alias "@/..." défini dans tsconfig.json (support natif de Vite)
  resolve: { tsconfigPaths: true },
  test: {
    // Environnement Node : suffisant pour la logique, les routes API et la base mockée
    environment: "node",
    globals: true,
    // Variables d'environnement nécessaires aux tests (ex: signature JWT)
    env: {
      JWT_SECRET: "test-secret-pour-les-tests-unitaires",
      NODE_ENV: "test",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // On ne mesure la couverture que sur NOTRE code applicatif
      include: ["lib/**/*.ts", "server/**/*.ts", "app/api/**/*.ts"],
      // On exclut le code généré, les configs et tout ce qui n'est pas testable unitairement
      exclude: [
        "lib/generated/**",
        "lib/db.ts",
        "server/prisma.ts",
        "**/*.config.*",
        "**/*.d.ts",
      ],
      // Le test échoue si on passe sous 80% : c'est l'exigence de l'examen
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
