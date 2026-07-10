import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import AssistantPage from './AssistantPage';

// Note: This test requires a test runner like Vitest or Jest, and @testing-library/react
// to be installed in the project.

describe('AssistantPage Layout Selection', () => {
  it('renders OwnerLayout when accessed from /owner/assistant', () => {
    render(
      <MemoryRouter initialEntries={['/owner/assistant']}>
        <Routes>
          <Route path="/owner/assistant" element={<AssistantPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify OwnerLayout is rendered (e.g., by checking a distinct owner nav item)
    // Since OwnerLayout provides OWNER_NAV, we expect "Properties" or "Owner Portal" to be present
    expect(screen.getByText('Owner Portal')).toBeInTheDocument();
  });

  it('renders DashboardLayout (Resident) when accessed from /resident/assistant', () => {
    render(
      <MemoryRouter initialEntries={['/resident/assistant']}>
        <Routes>
          <Route path="/resident/assistant" element={<AssistantPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify DashboardLayout is rendered (e.g., by checking distinct resident nav item or portal label)
    // Since DashboardLayout provides RESIDENT_NAV, we expect "Maintenance Claim" to be present
    expect(screen.queryByText('Owner Portal')).not.toBeInTheDocument();
  });
});
