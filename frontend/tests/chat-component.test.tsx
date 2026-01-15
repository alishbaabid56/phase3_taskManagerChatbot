import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatComponent from '../src/components/ChatComponent';

// Mock the useAuth hook
vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    token: 'test-token',
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ChatComponent', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders correctly when user is authenticated', () => {
    render(<ChatComponent />);

    expect(screen.getByText('AI Todo Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('allows user to type and submit a message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'Hello! How can I help you?',
        conversation_id: 'test-conversation-id',
        tool_results: [],
      }),
    });

    render(<ChatComponent />);

    const input = screen.getByPlaceholderText('Type your message here...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Hello, AI!' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/test-user-id\/chat$/),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify({
            message: 'Hello, AI!',
          }),
        })
      );
    });
  });

  it('displays user and AI messages', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: 'Sure, I can help with that.',
        conversation_id: 'test-conversation-id',
        tool_results: [],
      }),
    });

    render(<ChatComponent />);

    const input = screen.getByPlaceholderText('Type your message here...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText('Sure, I can help with that.')).toBeInTheDocument();
    });
  });

  it('shows error message when API call fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ChatComponent />);

    const input = screen.getByPlaceholderText('Type your message here...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to send message. Please try again.')).toBeInTheDocument();
    });
  });
});