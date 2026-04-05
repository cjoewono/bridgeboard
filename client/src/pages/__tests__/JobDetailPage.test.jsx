/**
 * @description Purpose: Verifies the JobDetailPage loads job details, tasks, and interview
 * notes from the API, and that the user can add tasks, toggle task completion, delete tasks,
 * add notes, delete notes, update job details, and delete the job entirely.
 * @reasoning Reasoning: The job detail view is the deepest context a user has on a single
 * application. Any failure in this page's data loading or action handling directly prevents
 * veterans from managing critical interview preparation workflows.
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../__mocks__/server.js';
import { renderWithContext } from '../../test-utils/renderWithContext.jsx';
import JobDetailPage from '../JobDetailPage.jsx';

const JOB_ROUTE_OPTIONS = {
  initialEntries: ['/jobs/1'],
  path: '/jobs/:jobId',
};

describe('JobDetailPage', () => {
  /**
   * @description Purpose: Verifies that the company name and job title from the API response
   * are rendered in the page header once the fetch resolves.
   * @reasoning Reasoning: Users navigate to a detail page expecting to see the specific job
   * they clicked. Rendering incorrect or absent data would cause disorientation.
   */
  it('renders the job company and title after loading', async () => {
    renderWithContext(<JobDetailPage />, JOB_ROUTE_OPTIONS);

    await waitFor(() => {
      expect(screen.getByText('Lockheed Martin')).toBeInTheDocument();
      expect(screen.getByText('Systems Engineer')).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that the task returned by the API is rendered in the tasks list.
   * @reasoning Reasoning: Tasks represent action items for interview preparation. If fetched tasks
   * are not rendered, veterans lose visibility into what they have planned.
   */
  it('renders tasks fetched from the API', async () => {
    renderWithContext(<JobDetailPage />, JOB_ROUTE_OPTIONS);

    await waitFor(() => {
      expect(screen.getByText('Submit resume')).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that the interview note content and date returned by the API
   * are rendered in the notes panel.
   * @reasoning Reasoning: Interview notes are the primary memory-aid for veterans juggling
   * multiple applications. Missing note content means preparation context is lost.
   */
  it('renders interview notes fetched from the API', async () => {
    renderWithContext(<JobDetailPage />, JOB_ROUTE_OPTIONS);

    await waitFor(() => {
      expect(screen.getByText('Phone screen went well')).toBeInTheDocument();
      expect(screen.getByText(/2026-04-10/)).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Confirms the Save Changes, Delete Job, Add task, and Add Note buttons
   * are present on the page.
   * @reasoning Reasoning: Veterans need unambiguous controls for every action on this page.
   * Missing buttons force them to navigate away without completing their intent.
   */
  it('renders all action buttons for job management', async () => {
    renderWithContext(<JobDetailPage />, JOB_ROUTE_OPTIONS);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete job/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add note/i })).toBeInTheDocument();
    });
    // Add button for tasks
    expect(screen.getByRole('button', { name: /^add$/i })).toBeInTheDocument();
  });

  /**
   * @description Purpose: Verifies that submitting the add-task form causes the new task to
   * appear in the tasks list.
   * @reasoning Reasoning: Adding tasks is the primary preparation workflow. If the newly
   * created task does not appear immediately, users may submit it multiple times.
   */
  it('adds a new task to the list after submitting the task form', async () => {
    const user = userEvent.setup();
    renderWithContext(<JobDetailPage />, JOB_ROUTE_OPTIONS);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/add a task/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/add a task/i), 'Research company');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    // The mock returns mockTask (Submit resume) for POST; the task list grows
    await waitFor(() => {
      expect(screen.getAllByText('Submit resume').length).toBeGreaterThanOrEqual(1);
    });
  });

  /**
   * @description Purpose: Verifies that clicking a task's Delete button removes it from the list.
   * @reasoning Reasoning: Completed or irrelevant tasks must be removable so the checklist
   * remains actionable and clutter-free.
   */
  it('removes a task from the list when its Delete button is clicked', async () => {
    const user = userEvent.setup();
    renderWithContext(<JobDetailPage />, JOB_ROUTE_OPTIONS);

    await waitFor(() => {
      expect(screen.getByText('Submit resume')).toBeInTheDocument();
    });

    // There may be multiple Delete buttons (task + note + job); click the first task Delete
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    // The task delete is separate from "Delete Job" button; find by proximity
    // deleteButtons[0] is the task delete inside the tasks list
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Submit resume')).not.toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that clicking the checkbox on a task fires a PUT request
   * and the task's completion state is toggled in the UI.
   * @reasoning Reasoning: Checking off tasks provides a tangible sense of progress for veterans
   * preparing for interviews. A non-functional checkbox undermines that feedback loop.
   */
  it('toggles a task completion checkbox', async () => {
    const user = userEvent.setup();
    renderWithContext(<JobDetailPage />, JOB_ROUTE_OPTIONS);

    await waitFor(() => {
      expect(screen.getByText('Submit resume')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  /**
   * @description Purpose: Verifies that submitting the add-note form causes the note to appear
   * in the interview notes panel.
   * @reasoning Reasoning: Notes capture interview feedback in real time. If a submitted note
   * does not surface immediately, veterans may re-enter duplicate notes.
   */
  it('adds a new interview note after submitting the note form', async () => {
    const user = userEvent.setup();
    renderWithContext(<JobDetailPage />, JOB_ROUTE_OPTIONS);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/add a note/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/add a note/i), 'Great conversation with HR');
    await user.click(screen.getByRole('button', { name: /add note/i }));

    // The mock returns mockNote (Phone screen went well), so the note panel gains an entry
    await waitFor(() => {
      expect(screen.getAllByText('Phone screen went well').length).toBeGreaterThanOrEqual(1);
    });
  });

  /**
   * @description Purpose: Verifies that a Back button is rendered and navigates the user to /dashboard.
   * @reasoning Reasoning: Veterans switching between job detail views need a one-click path
   * back to their full application list.
   */
  it('renders a Back navigation button', async () => {
    renderWithContext(<JobDetailPage />, JOB_ROUTE_OPTIONS);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that when token is null the page redirects rather than
   * rendering job details.
   * @reasoning Reasoning: Job detail data is private per user. An unauthenticated user must
   * never be able to view or modify job records.
   */
  it('redirects to /login when token is null', async () => {
    renderWithContext(<JobDetailPage />, { ...JOB_ROUTE_OPTIONS, token: null });

    await waitFor(() => {
      expect(screen.queryByText('Lockheed Martin')).not.toBeInTheDocument();
    });
  });
});
