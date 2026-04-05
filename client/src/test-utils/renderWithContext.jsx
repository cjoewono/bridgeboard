import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';

/**
 * Wraps a component in a MemoryRouter with a fake OutletContext.
 * All pages use useOutletContext() to get token/user/login/logout,
 * translatorState/setTranslatorState, and jobSearchState/setJobSearchState.
 *
 * @param {React.ReactElement} ui - The component under test.
 * @param {object} options - Configuration for context and routing.
 * @param {string|null} options.token - Auth token; pass null to simulate unauthenticated state.
 * @param {string} options.user - Authenticated user email.
 * @param {Function} options.login - Mock login callback.
 * @param {Function} options.logout - Mock logout callback.
 * @param {object} options.translatorState - Initial translator state slice.
 * @param {Function} options.setTranslatorState - Mock setter for translator state.
 * @param {object} options.jobSearchState - Initial job search state slice.
 * @param {Function} options.setJobSearchState - Mock setter for job search state.
 * @param {string[]} options.initialEntries - Initial history entries for MemoryRouter.
 * @param {string} options.path - Route path matching the component under test.
 * @returns {import('@testing-library/react').RenderResult}
 */
export function renderWithContext(ui, {
  token = 'test-token-abc123',
  user = 'test@example.com',
  login = jest.fn(),
  logout = jest.fn(),
  translatorState = { query: '', selectedBranch: '', result: null },
  setTranslatorState = jest.fn(),
  jobSearchState = {
    searchTerm: '',
    location: '',
    results: [],
    totalCount: 0,
    page: 1,
    lastSearch: { what: '', where: '' },
  },
  setJobSearchState = jest.fn(),
  initialEntries = ['/'],
  path = '/',
} = {}) {
  const context = {
    token,
    user,
    login,
    logout,
    translatorState,
    setTranslatorState,
    jobSearchState,
    setJobSearchState,
  };

  function ContextProvider() {
    return <Outlet context={context} />;
  }

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<ContextProvider />}>
          <Route path={path} element={ui} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
