const { render, screen } = require('@testing-library/react');
const Navigation = require('../Navigation'); // Adjust the import based on your actual Navigation component path

test('navigation works correctly', () => {
	render(<Navigation />);
	const linkElement = screen.getByText(/expected link text/i); // Replace with actual text
	expect(linkElement).toBeInTheDocument();
});