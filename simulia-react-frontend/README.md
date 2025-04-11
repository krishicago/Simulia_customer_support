# Simulia_customer_support

# SIMULIA Subscription Assistant

An interactive knowledge graph visualization and assistant for exploring SIMULIA subscription tiers, features, limitations, and support options.

## Features

- **Interactive Knowledge Graph**: Visualize the relationships between subscription tiers, features, limitations, and support options.
- **Comparison View**: Side-by-side comparison of different subscription tiers.
- **Chat Interface**: Ask questions about subscription details and get instant answers.
- **Tier Filtering**: Focus on specific subscription tiers to understand their offerings better.

## Technologies Used

- React
- Tailwind CSS
- Recharts
- D3.js
- Lucide React (for icons)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/simulia-subscription-assistant.git
   cd simulia-subscription-assistant
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Usage

The application has three main views:

1. **Comparison**: Compare features, limitations, and support across different subscription tiers
2. **Knowledge Graph**: Visualize the relationships between tiers and their components
3. **Chat**: Ask questions about subscription details

### Interacting with the Knowledge Graph

- Click on a tier in the sidebar to filter the graph
- Hover over nodes to see detailed information
- Click on nodes to focus on specific relationships

## Data Structure

The subscription data is structured as follows:

- **Features**: Capabilities included in each tier
- **Limitations**: Constraints of each tier
- **SupportLevels**: Support options available for each tier
- **Relationships**: Connections between tiers and potential upgrade paths

## Customization

You can customize the subscription data by modifying the `subscriptionData` object in `src/components/SimuliaKnowledgeAssistant.js`.


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- SIMULIA for inspiration
- The React and D3.js communities for their excellent documentation
