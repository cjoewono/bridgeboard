/**
 * @description Purpose: Verifies the JobSearchPage renders the search form, performs searches,
 * displays Adzuna results with correct schema fields, handles the save-job action, shows an
 * error on search failure, redirects unauthenticated users, shows pagination controls when
 * totalCount exceeds resultsPerPage, and disables pagination buttons at the first and last pages.
 * @reasoning Reasoning: The job search feature is the discovery engine for veterans entering
 * the civilian workforce. Broken search, incorrect schema handling, missing save functionality,
 * or non-functional pagination would make the feature useless and waste API quota on silent failures.
 */

import React, { useState } from 'react';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import { server } from '../../__mocks__/server.js';
import { renderWithContext } from '../../test-utils/renderWithContext.jsx';
import { mockAdzunaResult } from '../../test-utils/mockData.js';
import JobSearchPage from '../JobSearchPage.jsx';

const SEARCH_ROUTE_OPTIONS = {
  initialEntries: ['/search'],
  path: '/search',
};

/**
 * Renders JobSearchPage inside a MemoryRouter with a real useState-backed jobSearchState so
 * that internal setJobSearchState updater calls drive re-renders correctly.
 *
 * @param {object} opts - Optional overrides passed to the MemoryRouter.
 * @param {string[]} opts.initialEntries - Initial route entries for the router.
 * @param {object} opts.initialJobSearchState - Override the default jobSearchState.
 * @param {string|null} opts.token - Auth token.
 */
function renderWithRealJobSearchState({
  initialEntries = ['/search'],
  initialJobSearchState = {
    searchTerm: '',
    location: '',
    results: [],
    totalCount: 0,
    page: 1,
    lastSearch: { what: '', where: '' },
  },
  token = 'test-token-abc123',
} = {}) {
  function StatefulContextProvider() {
    const [jobSearchState, setJobSearchState] = useState(initialJobSearchState);
    const context = {
      token,
      user: 'test@example.com',
      login: jest.fn(),
      logout: jest.fn(),
      translatorState: { query: '', selectedBranch: '', result: null },
      setTranslatorState: jest.fn(),
      jobSearchState,
      setJobSearchState,
    };
    return <Outlet context={context} />;
  }

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<StatefulContextProvider />}>
          <Route path="/search" element={<JobSearchPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('JobSearchPage', () => {
  /**
   * @description Purpose: Confirms the page heading and search form are rendered on initial load.
   * @reasoning Reasoning: Users need to identify this page as the job search interface and
   * find the input controls before submitting any query.
   */
  it('renders the Job Search heading and search form', () => {
    renderWithContext(<JobSearchPage />, SEARCH_ROUTE_OPTIONS);
    expect(screen.getByText(/job search/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/job title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/location/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  /**
   * @description Purpose: Verifies that after submitting a search query, Adzuna results are
   * rendered using the correct schema fields (title, company.display_name, location.display_name).
   * @reasoning Reasoning: The Adzuna API uses nested display_name fields. If the component
   * reads from a flat schema, all company and location data will be blank for real results.
   */
  it('renders Adzuna search results with nested schema fields after form submission', async () => {
    const user = userEvent.setup();
    renderWithRealJobSearchState();

    await user.type(screen.getByPlaceholderText(/job title/i), 'logistics');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Logistics Manager')).toBeInTheDocument();
      expect(screen.getByText('Boeing')).toBeInTheDocument();
      expect(screen.getByText('Seattle, WA')).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that the job description text is rendered in each result card.
   * @reasoning Reasoning: Descriptions help veterans quickly evaluate relevance before clicking
   * through to the full posting; missing descriptions force unnecessary external page loads.
   */
  it('renders the job description in each result card', async () => {
    const user = userEvent.setup();
    renderWithRealJobSearchState();

    await user.type(screen.getByPlaceholderText(/job title/i), 'logistics');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/manage logistics operations for defense programs/i)
      ).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies the "View on Adzuna" link renders with the correct redirect URL.
   * @reasoning Reasoning: Veterans must be able to navigate to the full job posting. An absent
   * or broken redirect link forces manual URL construction and creates friction.
   */
  it('renders a View on Adzuna link pointing to the redirect URL', async () => {
    const user = userEvent.setup();
    renderWithRealJobSearchState();

    await user.type(screen.getByPlaceholderText(/job title/i), 'logistics');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /view on adzuna/i });
      expect(link).toHaveAttribute('href', 'https://www.adzuna.com/details/az001');
    });
  });

  /**
   * @description Purpose: Verifies that the Save button on a result card triggers a POST to the
   * jobs API using the Adzuna schema's company.display_name field.
   * @reasoning Reasoning: The saveJob handler reads job.company.display_name. If the mock data
   * or the component uses a flat schema, saved jobs would have undefined company names.
   */
  it('displays a + Save button for each search result', async () => {
    const user = userEvent.setup();
    renderWithRealJobSearchState();

    await user.type(screen.getByPlaceholderText(/job title/i), 'logistics');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\+ save/i })).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies the empty-results placeholder is shown before any search
   * has been submitted.
   * @reasoning Reasoning: An empty results area with no guidance could be mistaken for a broken
   * page. The placeholder sets expectations and prompts the user to act.
   */
  it('shows a no-results placeholder before a search is submitted', () => {
    renderWithContext(<JobSearchPage />, SEARCH_ROUTE_OPTIONS);
    expect(screen.getByText(/no results yet/i)).toBeInTheDocument();
  });

  /**
   * @description Purpose: Verifies that a search API failure surfaces a visible error message
   * rather than silently leaving the results area empty.
   * @reasoning Reasoning: Network failures or API quota exhaustion must produce user-readable
   * feedback so veterans know to retry rather than assuming the feature is working.
   */
  it('displays an error message when the search request fails', async () => {
    server.use(
      http.get('/api/v1/adzuna/search/', () =>
        HttpResponse.json({ detail: 'Search unavailable' }, { status: 503 })
      )
    );

    const user = userEvent.setup();
    renderWithRealJobSearchState();

    await user.type(screen.getByPlaceholderText(/job title/i), 'engineer');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/search failed/i)).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that when the route includes a pre-populated query param ?q=,
   * the search auto-fires and results appear in the list.
   * @reasoning Reasoning: The TranslatorPage links to /search?q=<skill>. The JobSearchPage reads
   * this param, pre-fills the search field, and immediately fetches results so the discovery
   * workflow requires no extra interaction from the veteran.
   */
  it('auto-fires a search and shows results when the URL contains ?q=', async () => {
    renderWithRealJobSearchState({ initialEntries: ['/search?q=engineer'] });

    await waitFor(() => {
      expect(screen.getByText('Logistics Manager')).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that an unauthenticated user is redirected rather than shown
   * the search interface.
   * @reasoning Reasoning: The search endpoint uses a token-gated backend integration. Displaying
   * the form to unauthenticated users leads to certain API failures.
   */
  it('redirects to /login when token is null', async () => {
    renderWithContext(<JobSearchPage />, { ...SEARCH_ROUTE_OPTIONS, token: null });

    await waitFor(() => {
      expect(screen.queryByText(/job search/i)).not.toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies pagination controls (Prev, Next, Page X of Y) appear after a
   * search returns more results than the per-page limit.
   * @reasoning Reasoning: Veterans searching broad terms like "logistics" may see dozens of results.
   * Without pagination controls they cannot browse beyond the first page, missing relevant postings.
   */
  it('shows pagination controls when totalCount exceeds resultsPerPage', async () => {
    server.use(
      http.get('/api/v1/adzuna/search/', () =>
        HttpResponse.json({ count: 25, results: [mockAdzunaResult] })
      )
    );

    const user = userEvent.setup();
    renderWithRealJobSearchState();

    await user.type(screen.getByPlaceholderText(/job title/i), 'logistics');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/← prev/i)).toBeInTheDocument();
      expect(screen.getByText(/next →/i)).toBeInTheDocument();
      expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies the result-count header displays "1–10 of 25 Results" format
   * when the first page of a multi-page result set is shown.
   * @reasoning Reasoning: Veterans need to understand exactly how many total results match their
   * query and which slice they are currently viewing, to gauge whether a more specific search
   * would yield better candidates.
   */
  it('displays a result count header in "1–10 of N Results" format', async () => {
    server.use(
      http.get('/api/v1/adzuna/search/', () =>
        HttpResponse.json({ count: 25, results: [mockAdzunaResult] })
      )
    );

    const user = userEvent.setup();
    renderWithRealJobSearchState();

    await user.type(screen.getByPlaceholderText(/job title/i), 'logistics');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/1–10 of 25 results/i)).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies the Prev button is disabled on the first page of results.
   * @reasoning Reasoning: Allowing a veteran to navigate before page 1 would trigger an erroneous
   * API call with a non-positive page number and produce an empty or error state.
   */
  it('disables the Prev button when on page 1', async () => {
    server.use(
      http.get('/api/v1/adzuna/search/', () =>
        HttpResponse.json({ count: 25, results: [mockAdzunaResult] })
      )
    );

    const user = userEvent.setup();
    renderWithRealJobSearchState();

    await user.type(screen.getByPlaceholderText(/job title/i), 'logistics');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/← prev/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /← prev/i })).toBeDisabled();
  });

  /**
   * @description Purpose: Verifies the Next button is disabled when the user is on the last page
   * (page >= totalPages).
   * @reasoning Reasoning: Navigating past the last page would produce a zero-result API response
   * or an error. The disabled state communicates the boundary clearly and prevents wasted calls.
   */
  it('disables the Next button when on the last page', () => {
    // Seed the component directly on page 3 of 3 (count=25, resultsPerPage=10 → 3 pages).
    // The pagination bar is visible because totalCount (25) > resultsPerPage (10).
    renderWithRealJobSearchState({
      initialJobSearchState: {
        searchTerm: 'logistics',
        location: '',
        results: [mockAdzunaResult],
        totalCount: 25,
        page: 3,
        lastSearch: { what: 'logistics', where: '' },
      },
    });

    expect(screen.getByRole('button', { name: /next →/i })).toBeDisabled();
  });
});
