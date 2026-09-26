/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomeSearchBar } from './HomeSearchBar';
import { _setMockCatalogForTesting, _resetCatalogCacheForTesting } from './useHomeSearchCatalog';

const mockCatalog = {
  subjects: [
    { slug: 'algorithms', label: 'Algorithms', count: 321, aliases: ['algo', 'algorithms'] },
    { slug: 'os', label: 'Operating System', count: 308, aliases: ['os'] },
  ],
  subtopics: [
    { slug: 'dijkstras-algorithm', label: "Dijkstra's Algorithm", parentSubject: 'algorithms', parentLabel: 'Algorithms', count: 25 },
  ],
  years: [
    { year: 2024, count: 178, yearSetKeys: ['2024-s1', '2024-s2'] },
  ],
  questionNumbers: {
    counts: { '30': 39 },
    maxNumber: 92,
    totalQuestions: 3682,
  },
  tags: [
    { tag: 'time-complexity', count: 124 },
  ],
};

describe('HomeSearchBar component', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    _setMockCatalogForTesting(mockCatalog);
  });

  afterEach(() => {
    vi.useRealTimers();
    _resetCatalogCacheForTesting();
  });

  it('renders input with default placeholder and search icon', () => {
    render(
      <MemoryRouter>
        <HomeSearchBar />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Search topics, subjects, questions...');
    expect(input).toBeTruthy();
  });

  it('shows no dropdown initially when empty', () => {
    render(
      <MemoryRouter>
        <HomeSearchBar />
      </MemoryRouter>
    );

    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('debounces user input and displays matched results', async () => {
    render(
      <MemoryRouter>
        <HomeSearchBar />
      </MemoryRouter>
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'algorithms' } });

    // Advance debounce timer by 200ms
    act(() => {
      vi.advanceTimersByTime(250);
    });

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeTruthy();

    const subjectOption = screen.getByText('Algorithms');
    expect(subjectOption).toBeTruthy();
    expect(screen.getByText('321 questions')).toBeTruthy();
  });

  it('calls onNavigateToExplore when a result item is clicked', async () => {
    const handleNavigate = vi.fn();
    render(
      <MemoryRouter>
        <HomeSearchBar onNavigateToExplore={handleNavigate} />
      </MemoryRouter>
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'os' } });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    const osOption = screen.getByText('Operating System');
    fireEvent.click(osOption);

    expect(handleNavigate).toHaveBeenCalledWith('?subjects=os');
  });

  it('supports keyboard navigation (ArrowDown, Enter)', async () => {
    const handleNavigate = vi.fn();
    render(
      <MemoryRouter>
        <HomeSearchBar onNavigateToExplore={handleNavigate} />
      </MemoryRouter>
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'dijkstra' } });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Arrow down to highlight first item
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // Press Enter to select
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleNavigate).toHaveBeenCalledWith(
      '?subjects=algorithms&search=Dijkstra%27s+Algorithm'
    );
  });

  it('clears query and results on clear button click', async () => {
    render(
      <MemoryRouter>
        <HomeSearchBar />
      </MemoryRouter>
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '2024' } });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    const clearBtn = screen.getByLabelText('Clear search');
    expect(clearBtn).toBeTruthy();

    fireEvent.click(clearBtn);

    expect(input.value).toBe('');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('closes dropdown on Escape key', async () => {
    render(
      <MemoryRouter>
        <HomeSearchBar />
      </MemoryRouter>
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'os' } });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByRole('listbox')).toBeTruthy();

    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
