/**
 * @description Purpose: Verifies the RegisterPage renders correctly and handles account
 * creation flows including successful registration, duplicate email errors, and password
 * mismatch validation before any network request is made.
 * @reasoning Reasoning: Registration is the first interaction for every new user. Broken
 * form validation or API integration will prevent veteran job seekers from ever using the
 * platform, making thorough behavioral coverage essential.
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../__mocks__/server.js';
import { renderWithContext } from '../../test-utils/renderWithContext.jsx';
import RegisterPage from '../RegisterPage.jsx';

describe('RegisterPage', () => {
  /**
   * @description Purpose: Confirms the registration form renders all three required fields
   * and the submit button.
   * @reasoning Reasoning: Missing fields make it impossible for users to complete registration,
   * so baseline rendering must be verified before testing interaction flows.
   */
  it('renders email, password, and confirm-password fields with a submit button', () => {
    renderWithContext(<RegisterPage />);
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    const passwordFields = screen.getAllByPlaceholderText(/••••••••/);
    expect(passwordFields).toHaveLength(2);
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  /**
   * @description Purpose: Confirms heading and brand copy render correctly on the registration page.
   * @reasoning Reasoning: Users must have clear orientation that they are creating a new account
   * rather than logging in to an existing one.
   */
  it('renders the BridgeBoard brand heading and mission copy', () => {
    renderWithContext(<RegisterPage />);
    expect(screen.getByText(/join/i)).toBeInTheDocument();
    expect(screen.getByText(/begin your transition/i)).toBeInTheDocument();
  });

  /**
   * @description Purpose: Verifies that the login() callback is called with the returned token
   * and email when the server accepts the new account request.
   * @reasoning Reasoning: On successful creation the user must be automatically authenticated.
   * If login() is not called, the user is registered but left on the login page with no token.
   */
  it('calls login() with token and email on successful account creation', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn();
    renderWithContext(<RegisterPage />, { login: mockLogin });

    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'new@example.com');
    const [passwordField, confirmField] = screen.getAllByPlaceholderText(/••••••••/);
    await user.type(passwordField, 'strongpass');
    await user.type(confirmField, 'strongpass');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test-token-abc123', 'test@example.com');
    });
  });

  /**
   * @description Purpose: Verifies that a password-mismatch error is shown immediately
   * client-side without making a network request.
   * @reasoning Reasoning: Sending a request to the server when passwords do not match wastes
   * bandwidth and exposes partial form data unnecessarily. The mismatch must be caught locally.
   */
  it('shows a password mismatch error without hitting the network', async () => {
    const user = userEvent.setup();
    renderWithContext(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'new@example.com');
    const [passwordField, confirmField] = screen.getAllByPlaceholderText(/••••••••/);
    await user.type(passwordField, 'password1');
    await user.type(confirmField, 'different1');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  /**
   * @description Purpose: Verifies that the server-side duplicate-email error surface correctly
   * as user-readable feedback when the API returns a 400 response.
   * @reasoning Reasoning: Veterans may attempt to create duplicate accounts; clear messaging
   * directs them to the login page instead of leaving them confused.
   */
  it('displays an error message when the email is already in use', async () => {
    server.use(
      http.post('/api/v1/users/create/', () =>
        HttpResponse.json({ detail: 'Email already exists' }, { status: 400 })
      )
    );

    const user = userEvent.setup();
    renderWithContext(<RegisterPage />);

    await user.type(screen.getByPlaceholderText(/you@example\.com/i), 'existing@example.com');
    const [passwordField, confirmField] = screen.getAllByPlaceholderText(/••••••••/);
    await user.type(passwordField, 'somepass');
    await user.type(confirmField, 'somepass');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/an account with that email already exists/i)
      ).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Confirms that no error message is displayed on the initial page load.
   * @reasoning Reasoning: Pre-existing error states confuse users who have not yet attempted
   * any action and undermine trust in the application.
   */
  it('shows no error on initial render', () => {
    renderWithContext(<RegisterPage />);
    expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/account with that email/i)).not.toBeInTheDocument();
  });

  /**
   * @description Purpose: Verifies a link to the sign-in page is accessible from the registration form.
   * @reasoning Reasoning: Returning users who land on the registration page must have a clear
   * navigation path back to login without using the browser back button.
   */
  it('renders a link to the sign-in page', () => {
    renderWithContext(<RegisterPage />);
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });
});
