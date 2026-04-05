/**
 * @description Purpose: Verifies the LoginPage renders correctly and handles authentication
 * flows including successful login, failed login, and form input behavior.
 * @reasoning Reasoning: Authentication is the gateway to the entire application. Broken
 * login behavior blocks all users from accessing their job tracking data, making this the
 * highest-priority page to test behaviorally.
 */

import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../__mocks__/server.js';
import { renderWithContext } from '../../test-utils/renderWithContext.jsx';
import LoginPage from '../LoginPage.jsx';

describe('LoginPage', () => {
  /**
   * @description Purpose: Confirms the login form renders all required input fields and the submit button.
   * @reasoning Reasoning: Users cannot authenticate if any form element is absent; this is a
   * baseline rendering assertion that guards against accidental regressions in markup.
   */
  it('renders email and password fields and a submit button', () => {
    renderWithContext(<LoginPage />);
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  /**
   * @description Purpose: Confirms the heading and brand text are visible on the login page.
   * @reasoning Reasoning: Users need clear visual confirmation they are on the correct page
   * before entering credentials.
   */
  it('renders the BridgeBoard brand heading', () => {
    renderWithContext(<LoginPage />);
    // The h1 splits "Bridge" and "Board" across two nodes; accessible name has a space
    expect(screen.getByRole('heading', { name: /sign in to bridge\s*board/i })).toBeInTheDocument();
    // The badge span contains "Welcome back" as a direct text node
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  /**
   * @description Purpose: Verifies that the login() callback is invoked with the returned token
   * and email when the server responds with a valid credential pair.
   * @reasoning Reasoning: The application relies on login() to store the token in app state.
   * If this callback is not called correctly, no protected route will be accessible.
   */
  it('calls login() with token and email on successful submission', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn();
    renderWithContext(<LoginPage />, { login: mockLogin });

    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test-token-abc123', 'test@example.com');
    });
  });

  /**
   * @description Purpose: Verifies that an error message is displayed when the server returns
   * a 401 response for invalid credentials.
   * @reasoning Reasoning: Users must receive clear feedback when their credentials are incorrect.
   * Silently failing or showing a generic crash would degrade the user experience.
   */
  it('displays an error message when login fails with invalid credentials', async () => {
    server.use(
      http.post('/api/v1/users/login/', () =>
        HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 })
      )
    );

    const user = userEvent.setup();
    renderWithContext(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'wrong@example.com');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Confirms that no error message is visible on initial page load before
   * any interaction occurs.
   * @reasoning Reasoning: Showing an error state before the user has attempted anything
   * creates a confusing and hostile user experience.
   */
  it('does not show an error message on initial render', () => {
    renderWithContext(<LoginPage />);
    expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
  });

  /**
   * @description Purpose: Verifies that a link to the registration page is present for users
   * who do not yet have an account.
   * @reasoning Reasoning: New users need a discoverable path to registration; a missing link
   * forces them to guess or abandon the product.
   */
  it('renders a link to the registration page', () => {
    renderWithContext(<LoginPage />);
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
  });

  /**
   * @description Purpose: Verifies that typing into the email and password fields updates their
   * displayed values, confirming the controlled inputs are wired correctly.
   * @reasoning Reasoning: If onChange handlers are missing or broken, keystrokes will not be
   * reflected in the form and submission will always send empty strings.
   */
  it('accepts input in email and password fields', async () => {
    const user = userEvent.setup();
    renderWithContext(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/);

    await user.type(emailInput, 'soldier@army.mil');
    await user.type(passwordInput, 'secure123');

    expect(emailInput.value).toBe('soldier@army.mil');
    expect(passwordInput.value).toBe('secure123');
  });
});
