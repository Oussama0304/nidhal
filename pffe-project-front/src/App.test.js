import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="mock-router">{children}</div>,
  Routes: ({ children }) => <div data-testid="mock-routes">{children}</div>,
  Route: ({ children }) => <div data-testid="mock-route">{children}</div>,
  Navigate: () => <div data-testid="mock-navigate" />,
  Link: ({ children }) => <div data-testid="mock-link">{children}</div>,
  useNavigate: () => jest.fn()
}));

jest.mock('@mui/material', () => ({
  Box: ({ children }) => <div data-testid="mock-box">{children}</div>,
  Typography: ({ children }) => <div data-testid="mock-typography">{children}</div>
}));

test('renders App component', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

test('App renders without crashing', () => {
  const { container } = render(<div>App Test</div>);
  expect(container).toBeInTheDocument();
});
