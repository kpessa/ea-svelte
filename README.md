# Electrolyte Advisor

A clinical decision support tool that assists healthcare providers in managing patient electrolyte levels (specifically Magnesium, Potassium, and Phosphate). The application displays patient criteria and recommends appropriate orders based on configured logic.

## Features

- Tab Navigation: Switch between different electrolyte tabs (Magnesium, Potassium, Phosphate)
- Order Selection: Select recommended orders based on patient criteria
- Test Patient Management: Create, edit, and apply test patient data to simulate different scenarios
- Concept Management: View and modify the state of "concepts" (variables that control application behavior)
- Configuration Editor: Edit the JSON configuration that controls the application's behavior
- Debug Mode: Show additional information about concept expressions and their evaluation results

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd electrolyte-advisor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── lib/
│   ├── components/     # Svelte components
│   ├── stores.ts      # Svelte stores for state management
│   └── types.ts       # TypeScript type definitions
├── config/
│   └── config.json    # Application configuration
├── App.svelte         # Main application component
├── app.css           # Global styles
└── main.ts           # Application entry point
```

## Configuration

The application's behavior is controlled by the `config.json` file in the `src/config` directory. This file contains:

- Tab definitions
- Criteria for each tab
- Order sections and their visibility rules
- Test cases for simulating different scenarios

## Development

### Adding New Features

1. Create new components in `src/lib/components/`
2. Add new types in `src/lib/types.ts`
3. Update the configuration in `src/config/config.json`
4. Add new stores in `src/lib/stores.ts` if needed

### Testing

Run the test suite:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
