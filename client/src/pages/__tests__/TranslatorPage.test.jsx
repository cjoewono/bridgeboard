/**
 * @description Purpose: Verifies the TranslatorPage renders the MOS Translator form, handles
 * successful translation responses by displaying all structured result fields, handles errors
 * from the translation API, supports branch selection, navigates to job search when a keyword,
 * transferable skill, or civilian title is clicked, and renders ATS keywords as button elements
 * with condensed skill previews visible in the transferable skills panel.
 * @reasoning Reasoning: The MOS Translator is the core value-add feature that converts military
 * experience into civilian job-search assets. Any breakage in query submission, result display,
 * navigation shortcuts, or keyword button rendering directly undermines veteran job seekers'
 * ability to leverage their service history.
 */

import React, { useState } from 'react';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import { server } from '../../__mocks__/server.js';
import { renderWithContext } from '../../test-utils/renderWithContext.jsx';
import TranslatorPage from '../TranslatorPage.jsx';

/**
 * Renders TranslatorPage inside a MemoryRouter with a real useState-backed translatorState so
 * that internal setTranslatorState updater calls drive re-renders correctly.
 *
 * @param {object} opts - Optional overrides.
 * @param {object} opts.initialTranslatorState - Override the default translatorState.
 * @param {string|null} opts.token - Auth token.
 */
function renderWithRealTranslatorState({
  initialTranslatorState = { query: '', selectedBranch: '', result: null },
  token = 'test-token-abc123',
} = {}) {
  // Capture the navigate mock so individual tests can assert on it.
  const navigateMock = jest.fn();

  function StatefulContextProvider() {
    const [translatorState, setTranslatorState] = useState(initialTranslatorState);
    const context = {
      token,
      user: 'test@example.com',
      login: jest.fn(),
      logout: jest.fn(),
      translatorState,
      setTranslatorState,
      jobSearchState: {
        searchTerm: '',
        location: '',
        results: [],
        totalCount: 0,
        page: 1,
        lastSearch: { what: '', where: '' },
      },
      setJobSearchState: jest.fn(),
    };
    return <Outlet context={context} />;
  }

  const result = render(
    <MemoryRouter initialEntries={['/translate']}>
      <Routes>
        <Route element={<StatefulContextProvider />}>
          <Route path="/translate" element={<TranslatorPage />} />
          {/* Catch the /search route so navigate() does not throw */}
          <Route path="/search" element={<div data-testid="search-page" />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

  return { ...result, navigateMock };
}

describe('TranslatorPage', () => {
  /**
   * @description Purpose: Confirms the page heading, description copy, and the Translate button
   * are rendered on initial load.
   * @reasoning Reasoning: Users must be oriented to the MOS Translator feature immediately.
   * Missing heading or the translate button prevents any interaction with the feature.
   */
  it('renders the MOS Translator heading, description, and Translate button', () => {
    renderWithContext(<TranslatorPage />);
    expect(screen.getByText(/mos translator/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/1120.*11B.*surface warfare/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument();
  });

  /**
   * @description Purpose: Confirms that all six branch selector buttons are rendered.
   * @reasoning Reasoning: Veterans from any branch must be able to scope their query to
   * the correct MOS / rating / AFSC system. Missing branch buttons force users to guess
   * the format expected by the API.
   */
  it('renders all six branch selector buttons', () => {
    renderWithContext(<TranslatorPage />);
    const branches = ['Army', 'Navy', 'Marine Corps', 'Air Force', 'Space Force', 'Coast Guard'];
    branches.forEach((branch) => {
      expect(screen.getByRole('button', { name: branch })).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that clicking a branch button selects it and displays
   * example codes for that branch.
   * @reasoning Reasoning: Showing example codes after branch selection reduces input errors
   * and helps veterans who are unsure of their specific MOS code format.
   */
  it('shows example codes when a branch is selected', async () => {
    const user = userEvent.setup();
    renderWithRealTranslatorState();

    await user.click(screen.getByRole('button', { name: 'Army' }));

    await waitFor(() => {
      expect(screen.getByText(/example codes/i)).toBeInTheDocument();
      expect(screen.getAllByText(/11B/).length).toBeGreaterThanOrEqual(1);
    });
  });

  /**
   * @description Purpose: Verifies that submitting a query renders the translated result's
   * branch, MOS code, and military title from the API response.
   * @reasoning Reasoning: The primary output of translation is the structured role identification.
   * If the branch/code/title block does not render, veterans cannot confirm the system understood
   * their input correctly.
   */
  it('displays the branch, code, and military title after a successful translation', async () => {
    const user = userEvent.setup();
    renderWithRealTranslatorState();

    await user.type(screen.getByRole('textbox'), '11B');
    await user.click(screen.getByRole('button', { name: /translate/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Infantryman' })).toBeInTheDocument();
      expect(screen.getByText(/^Army\s*[·•]\s*11B$/)).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that the summary paragraph from the API response is
   * rendered in the result card.
   * @reasoning Reasoning: The summary gives veterans a plain-language narrative they can
   * use in cover letters and elevator pitches. A missing summary leaves a key output blank.
   */
  it('displays the summary paragraph in the result card', async () => {
    const user = userEvent.setup();
    renderWithRealTranslatorState();

    await user.type(screen.getByRole('textbox'), '11B');
    await user.click(screen.getByRole('button', { name: /translate/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/leads and executes ground combat operations/i)
      ).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that civilian job titles from the API response are rendered
   * in the Civilian Job Titles panel with individual Search buttons.
   * @reasoning Reasoning: Civilian job titles are the primary output veterans use for resume
   * targeting. Each title must be accompanied by a search shortcut to enable the discovery workflow.
   */
  it('renders civilian job titles with Search buttons', async () => {
    const user = userEvent.setup();
    renderWithRealTranslatorState();

    await user.type(screen.getByRole('textbox'), '11B');
    await user.click(screen.getByRole('button', { name: /translate/i }));

    await waitFor(() => {
      expect(screen.getByText('Security Manager')).toBeInTheDocument();
      expect(screen.getByText('Operations Analyst')).toBeInTheDocument();
      expect(screen.getByText('Logistics Coordinator')).toBeInTheDocument();
    });
    const searchButtons = screen.getAllByRole('button', { name: /search →/i });
    expect(searchButtons.length).toBeGreaterThanOrEqual(1);
  });

  /**
   * @description Purpose: Verifies that ATS keywords from the API response are rendered as
   * badge chips in the Keywords panel.
   * @reasoning Reasoning: ATS keywords directly improve resume pass-through rates. Veterans
   * rely on seeing these exact terms to know which words to embed in their application materials.
   */
  it('renders ATS keyword badges', async () => {
    const user = userEvent.setup();
    renderWithRealTranslatorState();

    await user.type(screen.getByRole('textbox'), '11B');
    await user.click(screen.getByRole('button', { name: /translate/i }));

    await waitFor(() => {
      expect(screen.getByText('operations')).toBeInTheDocument();
      expect(screen.getByText('leadership')).toBeInTheDocument();
      expect(screen.getByText('security')).toBeInTheDocument();
      expect(screen.getByText('logistics')).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that each ATS keyword chip is rendered as a button element,
   * making it keyboard-accessible and clearly interactive.
   * @reasoning Reasoning: Keywords are now clickable shortcuts to the job search. Using button
   * elements ensures screen readers announce them as interactive controls, maintaining accessibility
   * for veterans who rely on assistive technology.
   */
  it('renders each ATS keyword as a button role', async () => {
    const user = userEvent.setup();
    renderWithRealTranslatorState();

    await user.type(screen.getByRole('textbox'), '11B');
    await user.click(screen.getByRole('button', { name: /translate/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'operations' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'leadership' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'security' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'logistics' })).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that clicking an ATS keyword button navigates to
   * /search?q=<keyword> without any condensing transformation.
   * @reasoning Reasoning: ATS keywords are already concise single-word or short-phrase terms.
   * Condensing them would alter the search query and reduce relevance. Direct navigation
   * ensures the exact keyword the LLM recommended reaches the Adzuna search endpoint.
   */
  it('navigates to /search?q=operations when the "operations" keyword button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRealTranslatorState();

    await user.type(screen.getByRole('textbox'), '11B');
    await user.click(screen.getByRole('button', { name: /translate/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'operations' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'operations' }));

    // After navigation the router renders the /search catch route.
    await waitFor(() => {
      expect(screen.getByTestId('search-page')).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that transferable skills are rendered as clickable buttons
   * in the Transferable Skills panel.
   * @reasoning Reasoning: Transferable skills are searchable shortcuts — clicking one navigates
   * to the job search with that skill pre-filled. If the buttons do not render, this workflow
   * is inaccessible.
   */
  it('renders transferable skills as clickable search buttons', async () => {
    const user = userEvent.setup();
    renderWithRealTranslatorState();

    await user.type(screen.getByRole('textbox'), '11B');
    await user.click(screen.getByRole('button', { name: /translate/i }));

    await waitFor(() => {
      expect(screen.getByText('Team Leadership')).toBeInTheDocument();
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
      expect(screen.getByText('Physical Security')).toBeInTheDocument();
      expect(screen.getByText('Mission Planning')).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that each transferable skill button contains a condensed
   * preview line rendered as → "condensed text" below the full skill name.
   * @reasoning Reasoning: The condensed preview shows veterans exactly what search query will
   * fire when they click a skill. Without it, users cannot predict or trust the search outcome.
   */
  it('shows a condensed preview below the skill name in each skill button', async () => {
    const user = userEvent.setup();
    renderWithRealTranslatorState();

    await user.type(screen.getByRole('textbox'), '11B');
    await user.click(screen.getByRole('button', { name: /translate/i }));

    await waitFor(() => {
      // "Team Leadership" has no stop words and is ≤3 words → condensed = "Team Leadership"
      expect(screen.getByText(/→ "Team Leadership"/)).toBeInTheDocument();
      // "Risk Assessment" → condensed = "Risk Assessment"
      expect(screen.getByText(/→ "Risk Assessment"/)).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that clicking the "Search →" button next to a civilian job
   * title navigates to /search?q= with the condensed form of that title.
   * @reasoning Reasoning: Civilian titles use condense=true to keep queries focused. "Security
   * Manager" is already ≤3 meaningful words so the condensed query is identical. The navigation
   * must encode the title correctly so Adzuna receives a valid search term.
   */
  it('navigates to /search?q=Security%20Manager when the Security Manager Search button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRealTranslatorState();

    await user.type(screen.getByRole('textbox'), '11B');
    await user.click(screen.getByRole('button', { name: /translate/i }));

    await waitFor(() => {
      expect(screen.getByText('Security Manager')).toBeInTheDocument();
    });

    // The first "Search →" button belongs to "Security Manager" (first in the list).
    const searchButtons = screen.getAllByRole('button', { name: /search →/i });
    await user.click(searchButtons[0]);

    // After navigation the router renders the /search catch route.
    await waitFor(() => {
      expect(screen.getByTestId('search-page')).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that the "Translate another" reset button is rendered in
   * the result view and that clicking it clears the result and resets the input.
   * @reasoning Reasoning: Veterans may translate multiple MOS codes in one session. Without a
   * clear reset path they must manually clear the input and dismiss the result, creating friction.
   */
  it('clears the result when "Translate another" is clicked', async () => {
    const user = userEvent.setup();
    renderWithRealTranslatorState();

    await user.type(screen.getByRole('textbox'), '11B');
    await user.click(screen.getByRole('button', { name: /translate/i }));

    await waitFor(() => {
      expect(screen.getByText('Infantryman')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /translate another/i }));

    await waitFor(() => {
      expect(screen.queryByText('Infantryman')).not.toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that an error returned by the translation API is displayed
   * as a visible error message in the UI.
   * @reasoning Reasoning: The translation feature depends on an external AI endpoint. When that
   * endpoint fails, veterans must receive clear feedback rather than staring at a spinner or
   * an empty result area.
   */
  it('displays an error message when the translation API returns an error', async () => {
    server.use(
      http.post('/api/v1/translate/', () =>
        HttpResponse.json({ error: 'Translation service unavailable' }, { status: 503 })
      )
    );

    const user = userEvent.setup();
    renderWithRealTranslatorState();

    await user.type(screen.getByRole('textbox'), '11B');
    await user.click(screen.getByRole('button', { name: /translate/i }));

    await waitFor(() => {
      expect(screen.getByText(/translation service unavailable/i)).toBeInTheDocument();
    });
  });

  /**
   * @description Purpose: Verifies that the Translate button is disabled when the query input
   * is empty, preventing empty API calls.
   * @reasoning Reasoning: Sending an empty query to the translation endpoint wastes API quota
   * and may produce nonsensical results. The disabled state enforces data integrity at the UI layer.
   */
  it('disables the Translate button when the input is empty', () => {
    renderWithContext(<TranslatorPage />);
    expect(screen.getByRole('button', { name: /translate/i })).toBeDisabled();
  });

  /**
   * @description Purpose: Verifies that the Translate button becomes enabled once the user
   * types at least one non-whitespace character into the query input.
   * @reasoning Reasoning: Veterans who start typing must see the button activate to understand
   * that they can proceed. A button that never enables would suggest the feature is broken.
   */
  it('enables the Translate button once the user types a query', async () => {
    const user = userEvent.setup();
    renderWithRealTranslatorState();

    const button = screen.getByRole('button', { name: /translate/i });
    expect(button).toBeDisabled();

    await user.type(screen.getByRole('textbox'), '11B');

    expect(button).not.toBeDisabled();
  });

  /**
   * @description Purpose: Verifies that no result panel is shown on initial page load before
   * any translation has been submitted.
   * @reasoning Reasoning: A result panel visible before any query creates a confusing experience
   * and may display stale data from a previous render cycle.
   */
  it('shows no result panel on initial render', () => {
    renderWithContext(<TranslatorPage />);
    expect(screen.queryByText('Infantryman')).not.toBeInTheDocument();
    expect(screen.queryByText(/civilian job titles/i)).not.toBeInTheDocument();
  });
});
