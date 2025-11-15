import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '@/components/tasks/TaskForm';
import { TaskFormData } from '@/types';

describe('TaskForm Component', () => {
  const mockOnChange = jest.fn();
  const mockOnSubmit = jest.fn((e) => e.preventDefault());
  const mockOnCancel = jest.fn();

  const defaultFormData: TaskFormData = {
    title: '',
    description: '',
    status: 'pending',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields', () => {
    render(
      <TaskForm
        formData={defaultFormData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByPlaceholderText(/enter task title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter task description/i)).toBeInTheDocument();
    // Status select doesn't have accessible name, so find by role or placeholder
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should call onChange when title input changes', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        formData={defaultFormData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByPlaceholderText(/enter task title/i);
    await user.type(titleInput, 'New Task');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should call onChange when status changes', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        formData={defaultFormData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const statusSelect = screen.getByRole('combobox');
    await user.selectOptions(statusSelect, 'completed');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should call onSubmit when form is submitted', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        formData={{ title: 'Test Task', description: 'Test', status: 'pending' }}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Create Task');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        formData={defaultFormData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should display custom submit label', () => {
    render(
      <TaskForm
        formData={defaultFormData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="Update Task"
      />
    );

    expect(screen.getByText('Update Task')).toBeInTheDocument();
    expect(screen.queryByText('Create Task')).not.toBeInTheDocument();
  });

  it('should show loading state when isLoading is true', () => {
    render(
      <TaskForm
        formData={defaultFormData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    expect(screen.getByText('Processing...')).toBeInTheDocument();
    const submitButton = screen.getByText('Processing...').closest('button');
    expect(submitButton).toBeDisabled();
  });

  it('should display form values', () => {
    const formData: TaskFormData = {
      title: 'My Task',
      description: 'My Description',
      status: 'in-progress',
    };

    render(
      <TaskForm
        formData={formData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('My Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('My Description')).toBeInTheDocument();
    // For select, check that the selected option is present
    const statusSelect = screen.getByRole('combobox') as HTMLSelectElement;
    expect(statusSelect.value).toBe('in-progress');
  });
});

