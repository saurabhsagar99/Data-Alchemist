# 🚀 Data Alchemist: AI-Powered Resource Allocation Configurator

Transform your messy spreadsheets into clean, validated data with AI-powered insights and intelligent resource allocation configuration.

## ✨ Features

### 🎯 Core Features
- **Smart Data Ingestion**: Upload CSV/XLSX files with AI-powered column mapping
- **Comprehensive Validation**: 10+ validation checks with real-time error highlighting
- **Natural Language Search**: Search data using plain English queries
- **AI-Powered Rule Generation**: Convert natural language to business rules
- **Priority Management**: Configure allocation priorities with sliders and presets
- **Clean Export**: Download validated data and configuration files

### 🤖 AI-Powered Features
- **Natural Language Data Retrieval**: "Show me all high priority clients" or "Find workers with JavaScript skills"
- **Intelligent Rule Conversion**: "Tasks T001 and T002 should always run together"
- **AI Rule Recommendations**: Get suggestions based on data patterns
- **Smart Data Validation**: AI-powered error detection and suggestions
- **Priority Suggestions**: AI analyzes data to recommend optimal priorities

### 📊 Data Management
- **Inline Editing**: Edit data directly in the grid with real-time validation
- **Cross-Reference Validation**: Ensure data consistency across entities
- **Visual Feedback**: Color-coded status indicators and progress tracking
- **Export Options**: Multiple export formats (CSV, JSON, complete package)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd data-alchemist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Get your Gemini API key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Sample Data

The `/samples` folder contains example data files:
- `clients.csv` - 10 sample clients with various priorities and requirements
- `workers.csv` - 15 sample workers with different skills and availability
- `tasks.csv` - 15 sample tasks with various requirements and constraints

## 🎯 How to Use

### 1. Data Ingestion
- Upload your CSV/XLSX files for clients, workers, and tasks
- The AI automatically maps columns even with different naming conventions
- View and edit data in the interactive grid

### 2. Validation & Quality Check
- Run comprehensive validation to identify issues
- Get AI-powered suggestions for fixing problems
- View validation summary and error details

### 3. Natural Language Search
- Search your data using plain English
- Examples:
  - "Show me all high priority clients"
  - "Find workers with JavaScript skills"
  - "Tasks with duration more than 2 phases"

### 4. Business Rules
- Create rules using the intuitive UI
- Or use natural language: "Tasks T001 and T002 should always run together"
- Get AI recommendations for additional rules

### 5. Priority Configuration
- Choose from preset profiles (Maximize Fulfillment, Fair Distribution, etc.)
- Or customize weights with interactive sliders
- Get AI suggestions based on your data patterns

### 6. Export
- Download cleaned CSV files for each data type
- Export rules.json with all business rules
- Get validation reports and complete packages

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **AI Integration**: Google Generative AI (Gemini)
- **Data Processing**: Custom validation engine
- **File Handling**: CSV/Excel parsing with XLSX

### Key Components
- `DataIngestion` - File upload and data processing
- `DataValidation` - Comprehensive validation engine
- `NaturalLanguageSearch` - AI-powered search functionality
- `RuleBuilder` - Business rule creation and management
- `PrioritizationPanel` - Priority configuration interface
- `ExportPanel` - Data export functionality

## 🔧 Configuration

### Environment Variables
- `GEMINI_API_KEY` - Your Google Gemini API key

### Validation Rules
The system includes 10+ validation checks:
- Missing required columns
- Duplicate IDs
- Malformed data types
- Out-of-range values
- Cross-reference validation
- Circular dependencies
- Skill coverage analysis
- And more...

### Business Rule Types
- **Co-Run**: Tasks that must run together
- **Slot Restriction**: Limit slots for groups
- **Load Limit**: Maximum load per worker group
- **Phase Window**: Restrict tasks to specific phases
- **Pattern Match**: Rules based on patterns
- **Precedence**: Task ordering rules

## 📊 Data Schema

### Clients
```csv
ClientID,ClientName,PriorityLevel,RequestedTaskIDs,GroupTag,AttributesJSON
```

### Workers
```csv
WorkerID,WorkerName,Skills,AvailableSlots,MaxLoadPerPhase,WorkerGroup,QualificationLevel
```

### Tasks
```csv
TaskID,TaskName,Category,Duration,RequiredSkills,PreferredPhases,MaxConcurrent
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Check the [GEMINI_SETUP.md](GEMINI_SETUP.md) for AI setup instructions
- Review the sample data in `/samples` folder
- Open an issue on GitHub

## 🎯 Roadmap

- [ ] Drag-and-drop priority ranking
- [ ] Advanced AI rule recommendations
- [ ] Real-time collaboration features
- [ ] Integration with external allocation tools
- [ ] Advanced analytics and reporting
- [ ] Mobile-responsive design improvements

---

**Data Alchemist** - Transform chaos into clarity with AI-powered data management 🧪✨ 