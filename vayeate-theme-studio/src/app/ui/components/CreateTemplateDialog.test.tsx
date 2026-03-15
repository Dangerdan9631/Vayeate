import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateTemplateDialog } from './CreateTemplateDialog';

function ControlledWrapper({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (params: { name: string }) => void;
}) {
  const [createFormName, setCreateFormName] = useState('');
  return (
    <CreateTemplateDialog
      createFormName={createFormName}
      setCreateFormName={setCreateFormName}
      onCancel={onCancel}
      onCreate={onCreate}
    />
  );
}

describe('CreateTemplateDialog', () => {
  it('renders with disabled OK button when name is empty', () => {
    render(
      <CreateTemplateDialog
        createFormName=""
        setCreateFormName={() => {}}
        onCancel={() => {}}
        onCreate={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
  });

  it('enables OK button when valid name is entered', () => {
    render(<ControlledWrapper onCancel={() => {}} onCreate={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('my-template'), {
      target: { value: 'test' },
    });
    expect(screen.getByRole('button', { name: 'OK' })).not.toBeDisabled();
  });

  it('shows validation error for invalid name', () => {
    render(<ControlledWrapper onCancel={() => {}} onCreate={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('my-template'), {
      target: { value: 'invalid name!' },
    });
    expect(screen.getByText(/Alphanumeric characters and hyphens only/)).toBeTruthy();
  });

  it('calls onCreate with the name', () => {
    const onCreate = vi.fn();
    render(<ControlledWrapper onCancel={() => {}} onCreate={onCreate} />);
    fireEvent.change(screen.getByPlaceholderText('my-template'), {
      target: { value: 'my-template' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onCreate).toHaveBeenCalledWith({ name: 'my-template' });
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn();
    render(
      <CreateTemplateDialog
        createFormName=""
        setCreateFormName={() => {}}
        onCancel={onCancel}
        onCreate={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
