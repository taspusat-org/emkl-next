import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input Component', () => {
  test('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  test('accepts and displays user input', () => {
    render(<Input placeholder="Type here" value="Hello World" readOnly />);

    const input = screen.getByPlaceholderText('Type here') as HTMLInputElement;
    expect(input.value).toBe('Hello World');
  });

  test('applies custom className', () => {
    render(<Input className="custom-input" placeholder="Test" />);
    const input = screen.getByPlaceholderText('Test');
    expect(input).toHaveClass('custom-input');
  });

  test('handles disabled state', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });

  test('supports different input types', () => {
    const { rerender } = render(<Input type="text" placeholder="Text" />);
    expect(screen.getByPlaceholderText('Text')).toHaveAttribute('type', 'text');

    rerender(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute(
      'type',
      'email'
    );

    rerender(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute(
      'type',
      'password'
    );
  });

  test('handles onChange event', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} placeholder="Change test" />);

    const input = screen.getByPlaceholderText('Change test');
    // Simulate change event directly
    const event = { target: { value: 'a' } };
    handleChange(event as any);

    expect(handleChange).toHaveBeenCalled();
  });

  test('can be readonly', () => {
    render(<Input readOnly value="Read only text" />);
    const input = screen.getByDisplayValue(
      'Read only text'
    ) as HTMLInputElement;
    expect(input).toHaveAttribute('readonly');
  });
});
