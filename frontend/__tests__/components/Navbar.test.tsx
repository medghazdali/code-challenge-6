import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { isAuthenticated, getUserEmail, clearTokens } from '@/lib/auth';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth utilities
jest.mock('@/lib/auth', () => ({
  isAuthenticated: jest.fn(),
  getUserEmail: jest.fn(),
  clearTokens: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedIsAuthenticated = isAuthenticated as jest.MockedFunction<typeof isAuthenticated>;
const mockedGetUserEmail = getUserEmail as jest.MockedFunction<typeof getUserEmail>;
const mockedClearTokens = clearTokens as jest.MockedFunction<typeof clearTokens>;

describe('Navbar Component', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    } as any);
  });

  it('should render login and signup links when not authenticated', () => {
    mockedIsAuthenticated.mockReturnValue(false);
    mockedGetUserEmail.mockReturnValue(null);

    render(<Navbar />);

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('should render user email and logout button when authenticated', () => {
    mockedIsAuthenticated.mockReturnValue(true);
    mockedGetUserEmail.mockReturnValue('test@example.com');

    render(<Navbar />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
  });

  it('should display first letter of email in avatar', () => {
    mockedIsAuthenticated.mockReturnValue(true);
    mockedGetUserEmail.mockReturnValue('test@example.com');

    render(<Navbar />);

    const avatar = screen.getByText('T');
    expect(avatar).toBeInTheDocument();
  });

  it('should show Projects link when authenticated', () => {
    mockedIsAuthenticated.mockReturnValue(true);
    mockedGetUserEmail.mockReturnValue('test@example.com');

    render(<Navbar />);

    const projectsLink = screen.getByText('Projects');
    expect(projectsLink).toBeInTheDocument();
    expect(projectsLink.closest('a')).toHaveAttribute('href', '/projects');
  });

  it('should handle logout click', () => {
    mockedIsAuthenticated.mockReturnValue(true);
    mockedGetUserEmail.mockReturnValue('test@example.com');

    render(<Navbar />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockedClearTokens).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should update when authentication state changes', async () => {
    mockedIsAuthenticated.mockReturnValueOnce(false).mockReturnValueOnce(true);
    mockedGetUserEmail.mockReturnValueOnce(null).mockReturnValueOnce('test@example.com');

    const { rerender } = render(<Navbar />);

    expect(screen.getByText('Login')).toBeInTheDocument();

    // Simulate authentication state change
    await waitFor(() => {
      rerender(<Navbar />);
    });
  });
});

