# Trend Shelf AI

An AI-powered Urban Library Optimization System for demand forecasting and inventory management.

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![Django](https://img.shields.io/badge/Django-4.2-green.svg)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red.svg)
![Transformers](https://img.shields.io/badge/HuggingFace-Transformers-yellow.svg)

## Features

- **Dashboard** - Real-time KPIs and overview of library statistics
- **Data Management** - Upload and manage CSV/JSON data files
- **Demand Forecasting** - AI-powered book demand prediction using Hugging Face models
- **Inventory Management** - Smart recommendations for book acquisition, transfer, and deaccession
- **Real-time Monitoring** - Live monitoring of library operations

## Tech Stack

- **Backend**: Django 4.2, Django REST Framework
- **AI/ML**: PyTorch, Hugging Face Transformers, scikit-learn
- **Frontend**: Tailwind CSS, Chart.js
- **Database**: SQLite (development)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BMABHINAV/trend-shelf-ai.git
   cd trend-shelf-ai
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # or
   source .venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the server**
   ```bash
   python manage.py runserver
   ```

6. **Access the application**
   Open http://127.0.0.1:8000 in your browser

## Project Structure

```
trend-shelf-ai/
├── library_ai/          # Main Django app
│   ├── ai_models.py     # Hugging Face AI models
│   ├── api_views.py     # REST API endpoints
│   ├── models.py        # Database models
│   └── views.py         # View controllers
├── static/              # CSS and JavaScript
├── templates/           # HTML templates
├── sample_data/         # Sample datasets
└── trend_shelf_ai/      # Django project settings
```

## AI Models Used

- **Sentiment Analysis**: `cardiffnlp/twitter-roberta-base-sentiment-latest`
- **Zero-shot Classification**: `facebook/bart-large-mnli`

## Screenshots

The application features a modern glassmorphism UI with dark/light theme support.

## Project By

- ABHINAV B M
- ABHISHEK R
- MANIKANDAN S

**Institution**: Chennai Institute of Technology

## License

This project is for educational purposes.
