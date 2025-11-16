import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectForm from '@/components/projects/ProjectForm';
import { ProjectFormData } from '@/types';

describe('ProjectForm Component', () => {
  const mockOnChange = jest.fn();
  const mockOnSubmit = jest.fn((e) => e.preventDefault());
  const mockOnCancel = jest.fn();

  const defaultFormData: ProjectFormData = {
    name: '',
    description: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields', () => {
    render(
      <ProjectForm
        formData={defaultFormData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByPlaceholderText(/enter project name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter project description/i)).toBeInTheDocument();
    expect(screen.getByText('Create Project')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should call onChange when name input changes', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        formData={defaultFormData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByPlaceholderText(/enter project name/i);
    await user.type(nameInput, 'New Project');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should call onChange when description changes', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        formData={defaultFormData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Find description textarea by placeholder (case insensitive)
    const descriptionInput = screen.getByPlaceholderText(/enter project description/i);
    await user.type(descriptionInput, 'Project description');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should call onSubmit when form is submitted', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        formData={{ name: 'Test Project', description: 'Test' }}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Create Project');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
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
      <ProjectForm
        formData={defaultFormData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="Update Project"
      />
    );

    expect(screen.getByText('Update Project')).toBeInTheDocument();
    expect(screen.queryByText('Create Project')).not.toBeInTheDocument();
  });

  it('should show loading state when isLoading is true', () => {
    render(
      <ProjectForm
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

  it('should disable submit button when loading', () => {
    render(
      <ProjectForm
        formData={defaultFormData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    const submitButton = screen.getByText('Processing...').closest('button');
    expect(submitButton).toBeDisabled();
  });

  it('should display form values', () => {
    const formData: ProjectFormData = {
      name: 'My Project',
      description: 'My Description',
    };

    render(
      <ProjectForm
        formData={formData}
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('My Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('My Description')).toBeInTheDocument();
  });
});

