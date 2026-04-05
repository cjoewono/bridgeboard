import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    video: true,
    videoCompression: 15,
    videosFolder: 'cypress/videos',
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 30000,
    requestTimeout: 60000,
    responseTimeout: 60000,
    screenshotOnRunFailure: true,
    env: {
      // Global command delay for narration-friendly pacing (cypress-slow-down)
      commandDelay: 600,
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
