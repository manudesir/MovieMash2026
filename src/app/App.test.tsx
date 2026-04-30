import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetDatabase } from '../modules/persistence/db';
import { App } from './App';

describe('main app flow', () => {
  beforeEach(async () => {
    window.location.hash = '';
    await resetDatabase();
  });

  it('starts on the comparison screen and records a choice', async () => {
    const user = userEvent.setup();
    render(<App />);

    const choices = await screen.findAllByRole('button', { name: /^Choose / });
    await user.click(choices[0]);

    await waitFor(() => {
      expect(screen.getByText('1 picks')).toBeInTheDocument();
    });
  });

  it('opens the separate ranking page', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findAllByRole('button', { name: /^Choose / });
    await user.click(screen.getByLabelText('Open ranking'));

    expect(await screen.findByRole('heading', { name: 'Your ranking' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
  });

  it('opens a won fight history from a ranking tile', async () => {
    const user = userEvent.setup();
    render(<App />);

    const choices = await screen.findAllByRole('button', { name: /^Choose / });
    const chosenTitle = choices[0].getAttribute('aria-label')?.replace('Choose ', '') ?? '';
    await user.click(choices[0]);

    await waitFor(() => {
      expect(screen.getByText('1 picks')).toBeInTheDocument();
    });
    await user.click(screen.getByLabelText('Open ranking'));
    await user.click(await screen.findByRole('button', { name: `Open win history for ${chosenTitle}` }));

    expect(await screen.findByRole('dialog', { name: chosenTitle })).toBeInTheDocument();
    expect(screen.getByText((text) => text.startsWith(`${chosenTitle} won against`))).toBeInTheDocument();
    expect(screen.getByText(/\+22 pts/)).toBeInTheDocument();
  });
});
