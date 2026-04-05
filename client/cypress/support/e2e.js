/**
 * Purpose: Global configuration for Cypress E2E.
 * Reasoning: Initialises cypress-slow-down with the 600ms commandDelay env
 * var so every command pauses for narration; also loads Testing Library
 * commands for behavioral queries (findByRole, etc.).
 */
import { slowCypressDown } from 'cypress-slow-down';
import './commands';
import '@testing-library/cypress/add-commands';

// Reads commandDelay from cypress.config.js env (600ms) and wraps every
// Cypress command with that delay for a demo-ready pace.
slowCypressDown();
