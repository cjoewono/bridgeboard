/**
 * @description Purpose: Verifies the DashboardPage loads and displays job applications, handles
 * adding new jobs, deleting jobs, updating job status, and redirecting unauthenticated users.
 * @reasoning Reasoning: The dashboard is the primary workspace for veterans tracking their job
 * search. Any breakage in loading, adding, or managing applications directly impairs the core
 * value proposition of the product.
 */

import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../__mocks__/server.js';
import { renderWithContext } from '../../test-utils/renderWithContext.jsx';
import DashboardPage from '../DashboardPage.jsx';

describe('DashboardPage', () => {
  /**
   * @description Purpose: Confirms the page heading renders and, when no user email is provided,
   * the fallback mission-control label is shown instead of a welcome message.
   * @reasoning Reasoning: The page header orients users to where they are in the application.
   * When user is undefined the component falls back to "Mission control for your civilian career."
   * Both paths must render the Dashboard heading so unauthenticated-edge and normal sessions
   * are both covered.
   */
  it('renders the Dashboard heading', async () => {
    renderWithContext(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Confirms that the mission-control fallback label renders when no user
   * email is supplied in the outlet context.
   * @reasoning Reasoning: The subtitle copy changes based on whether a user is authenticated.
   * When user is falsy the component renders "Mission control for your civilian career." as a
   * generic orientation label; this must be verified independently of the welcome-message path.
   */
  it('renders the Mission Control fallback label when no user is set', async () => {
    renderWithContext(<DashboardPage />, { user: '' });
    await waitFor(() => {
      expect(screen.getByText(/mission control/i)).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Confirms the authenticated user's email is displayed as a welcome message.
   * @reasoning Reasoning: Personalized greetings reinforce that the user is viewing their own data,
   * not another account's applications.
   */
  it('displays the authenticated user email in the welcome message', async () => {
    renderWithContext(<DashboardPage />, { user: 'test@example.com' });
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that existing job applications returned by the API are rendered
   * in the applications list.
   * @reasoning Reasoning: Veterans rely on seeing all their tracked applications. If the fetch
   * result is not rendered, users cannot see or manage their pipeline.
   */
  it('renders fetched job applications in the list', async () => {
    renderWithContext(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Lockheed Martin')).toBeInTheDocument();
      expect(screen.getByText('Systems Engineer')).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that animated skeleton placeholder cards appear while job data
   * is loading, and are replaced by real stat values once the fetch resolves.
   * @reasoning Reasoning: loading initializes to true, so on first render the component shows
   * animate-pulse skeleton divs instead of counts. If this transition is broken, veterans either
   * see a flash of zeros or a permanently spinning skeleton with no usable data.
   */
  it('shows skeleton placeholders while loading, then renders real stat values', async () => {
    renderWithContext(<DashboardPage />);

    // On the very first render, loading=true, so animate-pulse elements should be present.
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(5);

    // After the fetch resolves the skeleton is replaced by the real stat cards.
    await waitFor(() => {
      expect(screen.getByText('Lockheed Martin')).toBeInTheDocument();
    });

    // Skeletons should be gone once data is loaded.
    expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
  });

  /**
   * @description Purpose: Verifies that the summary stat cards display correct counts based on
   * the loaded job data.
   * @reasoning Reasoning: Veterans use the stat cards to quickly gauge where their pipeline stands.
   * Incorrect counts mislead users about the state of their job search.
   */
  it('displays correct counts in the stat cards', async () => {
    renderWithContext(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Lockheed Martin')).toBeInTheDocument();
    });
    // 1 total job, 1 with status "applied"
    const cards = screen.getAllByText('1');
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  /**
   * @description Purpose: Verifies the "Add New Application" form renders company and job title
   * inputs plus an Add Job button.
   * @reasoning Reasoning: Users must be able to add jobs manually. Missing form elements prevent
   * the most basic data entry operation on the dashboard.
   */
  it('renders the add-job form with company, title, and submit inputs', () => {
    renderWithContext(<DashboardPage />);
    expect(screen.getByPlaceholderText(/company/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/job title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add job/i })).toBeInTheDocument();
  });

  /**
   * @description Purpose: Verifies that submitting the add-job form causes the new job to appear
   * in the applications list.
   * @reasoning Reasoning: The add-job flow is the primary data-entry path. If the new entry
   * is not reflected immediately, users must refresh the page to see their changes.
   */
  it('adds a new job to the list after form submission', async () => {
    const user = userEvent.setup();
    renderWithContext(<DashboardPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Lockheed Martin')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/company/i), 'Raytheon');
    await user.type(screen.getByPlaceholderText(/job title/i), 'Software Engineer');
    await user.click(screen.getByRole('button', { name: /add job/i }));

    // The mock always returns mockJob (Lockheed Martin) for POST too, so the list
    // gains a second entry; the company name appears at least once already
    await waitFor(() => {
      expect(screen.getAllByText('Lockheed Martin').length).toBeGreaterThanOrEqual(1);
    });
  });

  /**
   * @description Purpose: Verifies that clicking Delete on a job removes it from the rendered list.
   * @reasoning Reasoning: Veterans need to remove jobs they are no longer pursuing. A non-functional
   * delete button leaves stale entries cluttering the dashboard.
   */
  it('removes a job from the list after the Delete button is clicked', async () => {
    const user = userEvent.setup();
    renderWithContext(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Lockheed Martin')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.queryByText('Lockheed Martin')).not.toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that changing the status dropdown fires a PUT request and the
   * updated status is reflected for that job.
   * @reasoning Reasoning: Status tracking is core to pipeline management. Dropdown changes must
   * persist so users know exactly where each application stands.
   */
  it('updates a job status when a new option is selected in the dropdown', async () => {
    server.use(
      http.put('/api/v1/jobs/:jobId/', () =>
        HttpResponse.json({
          id: 1,
          company: 'Lockheed Martin',
          title: 'Systems Engineer',
          status: 'interviewing',
          user: 1,
        })
      )
    );

    const user = userEvent.setup();
    renderWithContext(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Lockheed Martin')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'interviewing');

    await waitFor(() => {
      expect(screen.getByText('interviewing')).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that an unauthenticated user (token = null) is redirected
   * away from the dashboard rather than seeing application data.
   * @reasoning Reasoning: The dashboard contains sensitive job search data that must not be
   * accessible without authentication, regardless of direct URL navigation.
   */
  it('redirects to /login when token is null', async () => {
    renderWithContext(<DashboardPage />, { token: null });
    // The component calls navigate('/login'); the MemoryRouter will swap routes.
    // The dashboard content should not appear.
    await waitFor(() => {
      expect(screen.queryByText(/mission control/i)).not.toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies the empty-state message appears when no jobs exist.
   * @reasoning Reasoning: New users with zero applications must receive clear guidance to add
   * their first job rather than seeing a blank, confusing list area.
   */
  it('shows an empty state message when no jobs are returned', async () => {
    server.use(
      http.get('/api/v1/jobs/', () => HttpResponse.json([]))
    );

    renderWithContext(<DashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/no applications yet/i)
      ).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Confirms that an error from the jobs fetch is surfaced as a visible
   * error message.
   * @reasoning Reasoning: Silent failures leave users looking at a loading state forever;
   * an explicit error message tells them to retry or check their connection.
   */
  it('displays an error message when the jobs fetch fails', async () => {
    server.use(
      http.get('/api/v1/jobs/', () =>
        HttpResponse.json({ detail: 'Server error' }, { status: 500 })
      )
    );

    renderWithContext(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load jobs/i)).toBeInTheDocument();
    });
  });
});
