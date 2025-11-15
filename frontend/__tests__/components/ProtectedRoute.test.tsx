import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { isAuthenticated } from '@/lib/auth';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth utilities
jest.mock('@/lib/auth', () => ({
  isAuthenticated: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedIsAuthenticated = isAuthenticated as jest.MockedFunction<typeof isAuthenticated>;

describe('ProtectedRoute Component', () => {
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

  it('should render children when authenticated', () => {
    mockedIsAuthenticated.mockReturnValue(true);

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    mockedIsAuthenticated.mockReturnValue(false);

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should return null when not authenticated', () => {
    mockedIsAuthenticated.mockReturnValue(false);

    const { container } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(container.firstChild).toBeNull();
  });
});

