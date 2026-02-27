import { render, screen, fireEvent } from '@testing-library/react';
import { CreateTemplateDialog } from './CreateTemplateDialog';

describe('CreateTemplateDialog', () => {
  it('renders with disabled OK button when name is empty', () => {
    render(<CreateTemplateDialog onCancel={() => {}} onCreate={() => {}} />);
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
  });

  it('enables OK button when valid name is entered', () => {
    render(<CreateTemplateDialog onCancel={() => {}} onCreate={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('my-template'), {
      target: { value: 'test' },
    });
    expect(screen.getByRole('button', { name: 'OK' })).not.toBeDisabled();
  });

  it('shows validation error for invalid name', () => {
    render(<CreateTemplateDialog onCancel={() => {}} onCreate={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('my-template'), {
      target: { value: 'invalid name!' },
    });
    expect(screen.getByText(/Alphanumeric characters and hyphens only/)).toBeTruthy();
  });

  it('calls onCreate with the name', () => {
    const onCreate = vi.fn();
    render(<CreateTemplateDialog onCancel={() => {}} onCreate={onCreate} />);
    fireEvent.change(screen.getByPlaceholderText('my-template'), {
      target: { value: 'my-template' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onCreate).toHaveBeenCalledWith({ name: 'my-template' });
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn();
    render(<CreateTemplateDialog onCancel={onCancel} onCreate={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
