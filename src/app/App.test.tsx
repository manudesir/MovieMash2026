import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('opens fight history from both sides of a result', async () => {
    const user = userEvent.setup();
    render(<App />);

    const choices = await screen.findAllByRole('button', { name: /^Choose / });
    const winnerTitle = choices[0].getAttribute('aria-label')?.replace('Choose ', '') ?? '';
    const loserTitle = choices[1].getAttribute('aria-label')?.replace('Choose ', '') ?? '';
    await user.click(choices[0]);

    await waitFor(() => {
      expect(screen.getByText('1 picks')).toBeInTheDocument();
    });
    await user.click(screen.getByLabelText('Open ranking'));
    await user.click(await screen.findByRole('button', { name: `Open fight history for ${winnerTitle}` }));

    expect(await screen.findByRole('dialog', { name: winnerTitle })).toBeInTheDocument();
    expect(screen.getByText(`${winnerTitle} won against ${loserTitle}`)).toBeInTheDocument();
    expect(screen.getByText(/\+22 pts/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close fight history' }));

    await user.click(screen.getByRole('button', { name: `Open fight history for ${loserTitle}` }));

    expect(await screen.findByRole('dialog', { name: loserTitle })).toBeInTheDocument();
    expect(screen.getByText(`${loserTitle} lost to ${winnerTitle}`)).toBeInTheDocument();
    expect(screen.getByText(/-22 pts/)).toBeInTheDocument();
  });

  it('removes a movie from ranking after a swipe', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findAllByRole('button', { name: /^Choose / });
    await user.click(screen.getByLabelText('Open ranking'));

    const beforeCount = screen.getAllByRole('listitem').length;
    const rowButton = (await screen.findAllByRole('button', { name: /Open fight history for / }))[0];

    fireEvent.pointerDown(rowButton, { pointerId: 1, clientX: 10 });
    fireEvent.pointerMove(rowButton, { pointerId: 1, clientX: 140 });
    fireEvent.pointerUp(rowButton, { pointerId: 1, clientX: 140 });

    await waitFor(() => {
      expect(screen.getAllByRole('listitem').length).toBe(beforeCount - 1);
    });
    expect(screen.getByText(/removed$/)).toBeInTheDocument();
  });
});
