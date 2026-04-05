/**
 * Purpose: Custom Cypress commands for BridgeBoard E2E suite.
 * Reasoning: Centralises authentication so every protected-route test
 * gets a real Django token injected into localStorage before page load,
 * avoiding repetitive UI login flows across the demo spec.
 */

/**
 * Purpose: Authenticate via the real Django API and seed localStorage.
 * Reasoning: Uses cy.request() against the live backend so tests run
 * against actual auth logic; sets token/user keys that App.jsx reads on
 * mount, allowing cy.visit('/protected-route') to succeed immediately.
 */
Cypress.Commands.add('apiLogin', (
  email = 'test@test.com',
  password = 'test'
) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:8000/api/v1/users/login/',
    body: { email, password },
    headers: { 'Content-Type': 'application/json' },
  }).then(({ body }) => {
    window.localStorage.setItem('token', body.token);
    window.localStorage.setItem('user', body.email);
  });
});
