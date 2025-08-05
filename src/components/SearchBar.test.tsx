import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input with placeholder', () => {
    render(
      <SearchBar
        searchQuery=""
        resultsCount={0}
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByPlaceholderText('Search employees...')).toBeInTheDocument();
  });

  it('shows results count when there are search results', () => {
    render(
      <SearchBar
        searchQuery="john"
        resultsCount={3}
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText('3 results found')).toBeInTheDocument();
  });

  it('shows singular result text for one result', () => {
    render(
      <SearchBar
        searchQuery="jane"
        resultsCount={1}
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText('1 result found')).toBeInTheDocument();
  });

  it('shows clear button when there is a search query', () => {
    render(
      <SearchBar
        searchQuery="test"
        resultsCount={2}
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
  });

  it('calls onSearch with debounced input', async () => {
    render(
      <SearchBar
        searchQuery=""
        resultsCount={0}
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    const input = screen.getByPlaceholderText('Search employees...');
    fireEvent.change(input, { target: { value: 'john' } });

    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Should call after debounce delay
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('john');
    }, { timeout: 500 });
  });

  it('calls onClear when clear button is clicked', () => {
    render(
      <SearchBar
        searchQuery="test"
        resultsCount={1}
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });

  it('calls onClear when Escape key is pressed', () => {
    render(
      <SearchBar
        searchQuery="test"
        resultsCount={1}
        onSearch={mockOnSearch}
        onClear={mockOnClear}
      />
    );

    const input = screen.getByPlaceholderText('Search employees...');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(mockOnClear).toHaveBeenCalled();
  });
});