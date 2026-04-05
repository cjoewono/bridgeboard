/**
 * Purpose: Full-stack functional demo spec for BridgeBoard.
 * Reasoning: Covers all seven feature areas — Login, Register, Dashboard,
 * Job Detail, Contacts, Job Search, and MOS Translator — at a narration-
 * friendly pace using named timing constants and real API calls.
 */

const TYPE_DELAY  = 120
const ACTION_WAIT = 600
const STEP_WAIT   = 1200
const PAGE_WAIT   = 2000
const READ_WAIT   = 1800

// ─── 01 · LOGIN ───────────────────────────────────────────────────────────────
describe('01 · Login Page', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/login')
    cy.wait(PAGE_WAIT)
  })

  it('shows the BridgeBoard brand heading', () => {
    cy.wait(READ_WAIT)
    cy.get('h1').should('be.visible')
    cy.wait(READ_WAIT)
  })

  it('shows an error on wrong credentials', () => {
    cy.wait(READ_WAIT)
    cy.get('input[type="email"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[type="email"]').type('wrong@email.com', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.get('input[type="password"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[type="password"]').type('badpassword', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.get('button[type="submit"]').click()
    cy.wait(READ_WAIT)
    cy.contains(/invalid|incorrect|failed|error/i).should('be.visible')
    cy.wait(READ_WAIT)
  })

  it('logs in successfully and lands on dashboard', () => {
    cy.wait(READ_WAIT)
    cy.get('input[type="email"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[type="email"]').type('test@test.com', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.get('input[type="password"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[type="password"]').type('test', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.get('button[type="submit"]').click()
    cy.wait(PAGE_WAIT)
    cy.url().should('include', '/dashboard')
    cy.wait(READ_WAIT)
  })
})

// ─── 02 · REGISTER ────────────────────────────────────────────────────────────
describe('02 · Register Page', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/register')
    cy.wait(PAGE_WAIT)
  })

  it('shows the registration form', () => {
    cy.wait(READ_WAIT)
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.wait(READ_WAIT)
  })

  it('shows an error when passwords do not match', () => {
    cy.wait(READ_WAIT)
    cy.get('input[type="email"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[type="email"]').type('newuser@test.com', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.get('input[type="password"]').eq(0).click()
    cy.wait(ACTION_WAIT)
    cy.get('input[type="password"]').eq(0).type('password123', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.get('input[type="password"]').eq(1).click()
    cy.wait(ACTION_WAIT)
    cy.get('input[type="password"]').eq(1).type('doesnotmatch', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.get('button[type="submit"]').click()
    cy.wait(READ_WAIT)
    cy.contains(/match|password/i).should('be.visible')
    cy.wait(READ_WAIT)
  })

  it('navigates to login when sign-in link is clicked', () => {
    cy.wait(READ_WAIT)
    cy.contains(/sign in|log in|already have/i).click()
    cy.wait(PAGE_WAIT)
    cy.url().should('include', '/login')
    cy.wait(READ_WAIT)
  })
})

// ─── 03 · DASHBOARD ───────────────────────────────────────────────────────────
describe('03 · Dashboard Page', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.apiLogin()
    cy.visit('/dashboard')
    cy.wait(PAGE_WAIT)
  })

  it('renders heading and stat cards', () => {
    cy.wait(READ_WAIT)
    cy.contains('h1', 'Dashboard').should('be.visible')
    cy.wait(READ_WAIT)
    cy.contains('Total').should('be.visible')
    cy.wait(READ_WAIT)
  })

  it('opens Add Job form and creates a new job', () => {
    cy.wait(READ_WAIT)
    cy.get('input[placeholder="Company"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[placeholder="Company"]').type('Northrop Grumman', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.get('input[placeholder="Job Title"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[placeholder="Job Title"]').type('Software Engineer', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.contains('button', 'Add Job').click()
    cy.wait(PAGE_WAIT)
    cy.contains('Northrop Grumman').should('be.visible')
    cy.wait(READ_WAIT)
  })

  it('deletes the job just created', () => {
    cy.wait(READ_WAIT)
    cy.contains('Northrop Grumman')
      .closest('.flex.justify-between')
      .contains('button', 'Delete')
      .click()
    cy.wait(STEP_WAIT)
    cy.contains('Northrop Grumman').should('not.exist')
    cy.wait(READ_WAIT)
  })
})

// ─── 04 · JOB DETAIL ──────────────────────────────────────────────────────────
describe('04 · Job Detail Page', () => {
  before(() => {
    // Seed a known job so Job Detail tests are self-contained
    cy.clearLocalStorage()
    cy.apiLogin()
    cy.visit('/dashboard')
    cy.wait(PAGE_WAIT)
    cy.get('input[placeholder="Company"]').type('Kaiser Permanente', { delay: TYPE_DELAY })
    cy.get('input[placeholder="Job Title"]').type('Systems Engineer', { delay: TYPE_DELAY })
    cy.contains('button', 'Add Job').click()
    cy.wait(STEP_WAIT)
  })

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.apiLogin()
    cy.visit('/dashboard')
    cy.wait(PAGE_WAIT)
  })

  it('opens Job Detail for Kaiser Permanente', () => {
    cy.wait(READ_WAIT)
    cy.contains('a', 'Kaiser Permanente').first().click()
    cy.wait(PAGE_WAIT)
    cy.contains('Kaiser Permanente').should('be.visible')
    cy.wait(READ_WAIT)
  })

  it('adds a Task', () => {
    cy.contains('a', 'Kaiser Permanente').first().click()
    cy.wait(PAGE_WAIT)
    cy.wait(READ_WAIT)
    cy.get('input[placeholder="Add a task..."]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[placeholder="Add a task..."]').type('Submit resume', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.get('input[placeholder="Add a task..."]').parents('form').contains('button', 'Add').click()
    cy.wait(STEP_WAIT)
    cy.contains('Submit resume').should('be.visible')
    cy.wait(READ_WAIT)
  })

  it('marks the Task as complete', () => {
    cy.contains('a', 'Kaiser Permanente').first().click()
    cy.wait(PAGE_WAIT)
    cy.wait(READ_WAIT)
    cy.contains('Submit resume')
      .closest('.flex.items-center')
      .find('input[type="checkbox"]')
      .click()
    cy.wait(STEP_WAIT)
    cy.contains('Submit resume')
      .closest('.flex.items-center')
      .find('input[type="checkbox"]')
      .should('be.checked')
    cy.wait(READ_WAIT)
  })

  it('adds an Interview Note', () => {
    cy.contains('a', 'Kaiser Permanente').first().click()
    cy.wait(PAGE_WAIT)
    cy.wait(READ_WAIT)
    cy.get('textarea[placeholder="Add a note..."]').click()
    cy.wait(ACTION_WAIT)
    cy.get('textarea[placeholder="Add a note..."]').type('Phone screen went well', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.get('input[type="date"]').type('2026-04-10')
    cy.wait(STEP_WAIT)
    cy.contains('button', 'Add Note').click()
    cy.wait(STEP_WAIT)
    cy.contains('Phone screen went well').should('be.visible')
    cy.wait(READ_WAIT)
  })
})

// ─── 05 · CONTACTS ────────────────────────────────────────────────────────────
describe('05 · Contacts Page', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.apiLogin()
    cy.visit('/contacts')
    cy.wait(PAGE_WAIT)
  })

  it('renders the Contacts heading', () => {
    cy.wait(READ_WAIT)
    cy.contains('h1', 'Contacts').should('be.visible')
    cy.wait(READ_WAIT)
  })

  it('adds Jane Smith at Raytheon', () => {
    cy.wait(READ_WAIT)
    cy.get('input[placeholder="Jane Smith"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[placeholder="Jane Smith"]').type('Jane Smith', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.get('input[placeholder="Google"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[placeholder="Google"]').type('Raytheon', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.get('input[placeholder="jane@example.com"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[placeholder="jane@example.com"]').type('jane@raytheon.com', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.get('textarea[placeholder="Met at FourBlock event..."]').click()
    cy.wait(ACTION_WAIT)
    cy.get('textarea[placeholder="Met at FourBlock event..."]').type('Met at FourBlock event', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.contains('button', 'Add Contact').click()
    cy.wait(STEP_WAIT)
    cy.contains('Jane Smith').should('be.visible')
    cy.wait(READ_WAIT)
  })

  it('deletes the Jane Smith contact', () => {
    cy.wait(READ_WAIT)
    cy.contains('Jane Smith')
      .closest('.flex.justify-between')
      .contains('button', 'Delete')
      .click()
    cy.wait(STEP_WAIT)
    cy.contains('Jane Smith').should('not.exist')
    cy.wait(READ_WAIT)
  })
})

// ─── 06 · JOB SEARCH ──────────────────────────────────────────────────────────
describe('06 · Job Search Page', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.apiLogin()
    cy.visit('/search')
    cy.wait(PAGE_WAIT)
  })

  it('renders the Job Search heading', () => {
    cy.wait(READ_WAIT)
    cy.contains('h1', 'Job Search').should('be.visible')
    cy.wait(READ_WAIT)
  })

  it('searches for logistics jobs and shows results', () => {
    cy.wait(READ_WAIT)
    cy.get('input[placeholder*="Job title"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[placeholder*="Job title"]').type('logistics', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.get('input[placeholder*="Location"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[placeholder*="Location"]').type('Seattle', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.contains('button', 'Search').click()
    cy.wait(PAGE_WAIT * 2)
    cy.contains('button', '+ Save').should('be.visible')
    cy.wait(READ_WAIT)
  })

  it('saves a job from search results to the board', () => {
    cy.wait(READ_WAIT)
    cy.get('input[placeholder*="Job title"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[placeholder*="Job title"]').type('logistics', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.contains('button', 'Search').click()
    cy.wait(PAGE_WAIT * 2)
    cy.on('window:alert', (txt) => { expect(txt).to.include('Saved') })
    cy.contains('button', '+ Save').first().click()
    cy.wait(READ_WAIT)
  })
})

// ─── 07 · TRANSLATOR ──────────────────────────────────────────────────────────
describe('07 · Translator Page', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.apiLogin()
    cy.visit('/translator')
    cy.wait(PAGE_WAIT)
  })

  it('renders the Translator heading', () => {
    cy.wait(READ_WAIT)
    cy.contains('h1', 'MOS Translator').should('be.visible')
    cy.wait(READ_WAIT)
  })

  it('translates MOS 11B and shows civilian titles', () => {
    cy.wait(READ_WAIT)
    cy.contains('button', 'Army').click()
    cy.wait(STEP_WAIT)
    cy.get('input[type="text"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[type="text"]').type('11B', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.contains('button', 'Translate →').click()
    cy.wait(PAGE_WAIT * 3, { timeout: 90000 })
    cy.contains('Infantryman', { timeout: 60000 }).should('be.visible')
    cy.wait(READ_WAIT)
    cy.contains(/Security Manager|Operations Analyst|Logistics Coordinator/i).should('be.visible')
    cy.wait(READ_WAIT)
  })

  it('shows transferable skills and keywords', () => {
    cy.wait(READ_WAIT)
    cy.contains('button', 'Army').click()
    cy.wait(STEP_WAIT)
    cy.get('input[type="text"]').click()
    cy.wait(ACTION_WAIT)
    cy.get('input[type="text"]').type('11B', { delay: TYPE_DELAY })
    cy.wait(STEP_WAIT)
    cy.contains('button', 'Translate →').click()
    cy.wait(PAGE_WAIT * 3, { timeout: 90000 })
    cy.contains(/Team Leadership|Mission Planning|Physical Security/i, { timeout: 60000 }).should('be.visible')
    cy.wait(READ_WAIT)
    cy.contains(/operations|leadership|security|logistics/i).should('be.visible')
    cy.wait(READ_WAIT)
  })
})
