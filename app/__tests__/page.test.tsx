import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScotlandDaysOut from '../page';

// Mock fetch
global.fetch = jest.fn();

describe('ScotlandDaysOut Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders the header with title', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [],
    });

    render(<ScotlandDaysOut />);

    expect(screen.getByText(/Scotland — Family Days Out/i)).toBeInTheDocument();
  });

  it('loads activities data on mount', async () => {
    const mockActivities = [
      {
        id: 'test-1',
        name: 'Test Activity',
        location: 'Test Location',
        description: 'Test Description',
        price: 'FREE',
        cost: 'free' as const,
        weather: ['sunny'],
        dog_friendly: true,
        accessible: true,
        tags: ['🆓', '☀'],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockActivities,
    });

    render(<ScotlandDaysOut />);

    await waitFor(() => {
      expect(screen.getByText('Test Activity')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ScotlandDaysOut />);

    // The component should render without crashing
    expect(screen.getByText(/Scotland — Family Days Out/i)).toBeInTheDocument();
  });

  it('handles fetch errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<ScotlandDaysOut />);

    await waitFor(() => {
      // Should still render the page even if fetch fails
      expect(screen.getByText(/Scotland — Family Days Out/i)).toBeInTheDocument();
    });
  });

  it('filters activities by search query', async () => {
    const mockActivities = [
      {
        id: 'beach-1',
        name: 'Aberdour Beach',
        location: 'Fife',
        description: 'Sandy beach',
        price: 'FREE',
        cost: 'free' as const,
        weather: ['sunny'],
        dog_friendly: true,
        accessible: true,
        tags: ['🆓'],
      },
      {
        id: 'park-1',
        name: 'Central Park',
        location: 'Glasgow',
        description: 'City park',
        price: 'FREE',
        cost: 'free' as const,
        weather: ['sunny'],
        dog_friendly: false,
        accessible: true,
        tags: ['🆓'],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockActivities,
    });

    render(<ScotlandDaysOut />);

    await waitFor(() => {
      expect(screen.getByText('Aberdour Beach')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search name or location/i);
    await userEvent.type(searchInput, 'beach');

    await waitFor(() => {
      expect(screen.getByText('Aberdour Beach')).toBeInTheDocument();
      expect(screen.queryByText('Central Park')).not.toBeInTheDocument();
    });
  });

  it('toggles favorites', async () => {
    const mockActivities = [
      {
        id: 'test-1',
        name: 'Test Activity',
        location: 'Test Location',
        description: 'Test Description',
        price: 'FREE',
        cost: 'free' as const,
        weather: ['sunny'],
        dog_friendly: true,
        accessible: true,
        tags: ['🆓'],
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockActivities,
    });

    render(<ScotlandDaysOut />);

    await waitFor(() => {
      expect(screen.getByText('Test Activity')).toBeInTheDocument();
    });

    const favoriteButton = screen.getByRole('button', { name: /🤍/ });
    await userEvent.click(favoriteButton);

    // After clicking, the heart should be filled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /❤️/ })).toBeInTheDocument();
    });
  });
});

