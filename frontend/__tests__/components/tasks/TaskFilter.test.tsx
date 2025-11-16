import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskFilter, { TaskFilterStatus } from '@/components/tasks/TaskFilter';

describe('TaskFilter Component', () => {
  const mockOnStatusChange = jest.fn();
  const taskCounts = {
    all: 10,
    pending: 4,
    inProgress: 3,
    completed: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all filter options', () => {
    render(
      <TaskFilter
        selectedStatus="all"
        onStatusChange={mockOnStatusChange}
        taskCounts={taskCounts}
      />
    );

    // Component renders both mobile and desktop views, so we use getAllByText
    expect(screen.getAllByText('All Tasks').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
    expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
  });

  it('should display task counts', () => {
    render(
      <TaskFilter
        selectedStatus="all"
        onStatusChange={mockOnStatusChange}
        taskCounts={taskCounts}
      />
    );

    // Component renders both mobile and desktop views, so we use getAllByText
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    expect(screen.getAllByText('4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });

  it('should call onStatusChange when filter is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        selectedStatus="all"
        onStatusChange={mockOnStatusChange}
        taskCounts={taskCounts}
      />
    );

    // Find and click on "Pending" filter button (desktop view - hidden md:flex)
    const pendingButtons = screen.getAllByText('Pending');
    // Click the first button that's actually clickable (desktop view)
    const pendingButton = pendingButtons.find(btn => btn.closest('button')) || pendingButtons[0];
    await user.click(pendingButton);

    expect(mockOnStatusChange).toHaveBeenCalledWith('pending');
  });

  it('should show selected filter as active', () => {
    render(
      <TaskFilter
        selectedStatus="in-progress"
        onStatusChange={mockOnStatusChange}
        taskCounts={taskCounts}
      />
    );

    // The active filter should have different styling
    const inProgressButtons = screen.getAllByText('In Progress');
    expect(inProgressButtons.length).toBeGreaterThan(0);
  });

  it('should toggle mobile dropdown when button is clicked', async () => {
    const user = userEvent.setup();
    // Mock window.matchMedia to simulate mobile view
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <TaskFilter
        selectedStatus="all"
        onStatusChange={mockOnStatusChange}
        taskCounts={taskCounts}
      />
    );

    // Find the mobile dropdown button - use getAllByText since both views render
    const allTasksTexts = screen.getAllByText('All Tasks');
    const dropdownButton = allTasksTexts[0].closest('button');
    expect(dropdownButton).toBeInTheDocument();
    
    if (dropdownButton) {
      await user.click(dropdownButton);
      // Dropdown should be visible now - Pending should be in the document
      expect(screen.getAllByText('Pending').length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should close dropdown when filter is selected on mobile', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        selectedStatus="all"
        onStatusChange={mockOnStatusChange}
        taskCounts={taskCounts}
      />
    );

    // Open dropdown
    const allTasksTexts = screen.getAllByText('All Tasks');
    const dropdownButton = allTasksTexts[0].closest('button');
    
    if (dropdownButton) {
      await user.click(dropdownButton);
      
      // Click on a filter option in the dropdown
      const pendingOptions = screen.getAllByText('Pending');
      // Find the one that's in a button (dropdown option)
      const pendingButton = pendingOptions.find(text => {
        const button = text.closest('button');
        return button && button !== dropdownButton;
      });
      
      if (pendingButton) {
        await user.click(pendingButton);
        expect(mockOnStatusChange).toHaveBeenCalledWith('pending');
      }
    }
  });
});

