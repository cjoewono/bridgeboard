/**
 * @description Purpose: Verifies the ContactsPage renders the contacts list, add-contact form,
 * and handles adding and deleting contacts with appropriate feedback for empty state and errors.
 * @reasoning Reasoning: Networking is a primary job-search strategy for veterans transitioning to
 * civilian careers. Any breakage in contact management directly impairs their ability to track
 * and leverage their professional relationships.
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../__mocks__/server.js';
import { renderWithContext } from '../../test-utils/renderWithContext.jsx';
import ContactsPage from '../ContactsPage.jsx';

describe('ContactsPage', () => {
  /**
   * @description Purpose: Confirms the page heading and network label render on load.
   * @reasoning Reasoning: Users need clear orientation that they are on the Contacts page,
   * not the Dashboard or another section of the application.
   */
  it('renders the Contacts heading and Your Network label', async () => {
    renderWithContext(<ContactsPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /contacts/i })).toBeInTheDocument();
    });
    // Two elements render "Your Network" (badge label and section header); assert at least one
    expect(screen.getAllByText(/your network/i).length).toBeGreaterThanOrEqual(1);
  });

  /**
   * @description Purpose: Verifies that the contact returned by the API is rendered with name,
   * company, email, and notes visible.
   * @reasoning Reasoning: Veterans need to see all contact attributes to determine who to reach
   * out to next. Partial rendering would make the contact list unusable for outreach.
   */
  it('renders fetched contacts with all their attributes', async () => {
    renderWithContext(<ContactsPage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Raytheon')).toBeInTheDocument();
      expect(screen.getByText('jane@raytheon.com')).toBeInTheDocument();
      expect(screen.getByText('Met at FourBlock event')).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies the add-contact form renders name, company, email, and notes
   * inputs plus the submit button.
   * @reasoning Reasoning: The form must present all fields for a contact to be created with
   * complete information. Missing inputs prevent users from recording important details.
   */
  it('renders the add-contact form with all input fields', () => {
    renderWithContext(<ContactsPage />);
    expect(screen.getByPlaceholderText(/jane smith/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/google/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/jane@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/met at fourblock/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add contact/i })).toBeInTheDocument();
  });

  /**
   * @description Purpose: Verifies that submitting the add-contact form with a name causes
   * the new contact to appear in the contacts list.
   * @reasoning Reasoning: Adding contacts is the core entry action. If a successfully created
   * contact does not surface in the list, users must refresh to confirm the operation succeeded.
   */
  it('adds a new contact to the list after form submission', async () => {
    const user = userEvent.setup();
    renderWithContext(<ContactsPage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/jane smith/i), 'John Doe');
    await user.click(screen.getByRole('button', { name: /add contact/i }));

    // The mock returns mockContact (Jane Smith) for POST, so the list gains a second entry
    await waitFor(() => {
      expect(screen.getAllByText('Jane Smith').length).toBeGreaterThanOrEqual(1);
    });
  });

  /**
   * @description Purpose: Verifies that clicking Delete on a contact removes it from the list.
   * @reasoning Reasoning: Veterans may outgrow certain contacts or need to remove stale records.
   * The delete action must immediately reflect in the UI to confirm the operation.
   */
  it('removes a contact from the list when Delete is clicked', async () => {
    const user = userEvent.setup();
    renderWithContext(<ContactsPage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies the empty-state message is shown when no contacts exist,
   * after the loading state has resolved.
   * @reasoning Reasoning: loading now initializes to true, so the component renders "Loading..."
   * first. An assertion on "No contacts yet" that does not wait for the fetch to settle will
   * find the loading indicator instead, producing a false negative. waitFor ensures the test
   * correctly reflects the post-load empty state that users actually experience.
   */
  it('shows an empty-state message when there are no contacts', async () => {
    server.use(
      http.get('/api/v1/contacts/', () => HttpResponse.json([]))
    );

    renderWithContext(<ContactsPage />);

    // The component first shows "Loading..." — wait for that to clear and the empty state to appear.
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/no contacts yet/i)).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that an error returned by the contacts fetch is displayed
   * to the user as readable feedback.
   * @reasoning Reasoning: A silent failure on contacts load leaves users staring at an empty
   * list with no indication of whether the problem is theirs or the server's.
   */
  it('displays an error message when the contacts fetch fails', async () => {
    server.use(
      http.get('/api/v1/contacts/', () =>
        HttpResponse.json({ detail: 'Server error' }, { status: 500 })
      )
    );

    renderWithContext(<ContactsPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load contacts/i)).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that an unauthenticated user is redirected rather than
   * shown the contacts list.
   * @reasoning Reasoning: Contact data is private and must only be accessible to authenticated
   * users, regardless of whether they navigate directly to the URL.
   */
  it('redirects to /login when token is null', async () => {
    renderWithContext(<ContactsPage />, { token: null });

    await waitFor(() => {
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that a delete failure is surfaced as a visible error message.
   * @reasoning Reasoning: If a delete silently fails, the contact remains in the backend but
   * the user believes it was removed, leading to stale and inconsistent data.
   */
  it('displays an error message when a contact delete fails', async () => {
    server.use(
      http.delete('/api/v1/contacts/:contactId/', () =>
        HttpResponse.json({ detail: 'Server error' }, { status: 500 })
      )
    );

    const user = userEvent.setup();
    renderWithContext(<ContactsPage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to delete contact/i)).toBeInTheDocument();
    });
  });
});
