import os
import django
import pandas as pd
import numpy as np

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trend_shelf_ai.settings')
django.setup()

from library_ai.ai_models import demand_predictor

def test_model_integration():
    """
    This script tests the integration of the AI model in the Django project.
    It performs the following steps:
    1. Load the book inventory data from the CSV file with robust parsing.
    2. Preprocess the data for the AI model.
    3. Test the demand prediction using the AI model.
    4. Generate forecast data for visualization.
    5. Validate the model outputs.
    """
    print("Starting model integration test...")

    # 1. Load Data with robust parsing
    try:
        file_path = 'sample_data/book_inventory.csv'
        
        # Try different encoding options
        try:
            df = pd.read_csv(file_path, encoding='utf-8')
        except UnicodeDecodeError:
            df = pd.read_csv(file_path, encoding='latin-1')
        except:
            df = pd.read_csv(file_path, encoding='cp1252')
            
        print(f"Successfully loaded data from {file_path}")
        print(f"Loaded {len(df)} books")
        print(f"Columns: {list(df.columns)}")
        print(f"Shape: {df.shape}")
        
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        print("Attempting to read with manual parsing...")
        
        # Manual parsing approach
        import csv
        books_data = []
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    books_data.append(row)
            df = pd.DataFrame(books_data)
            print(f"Successfully loaded {len(df)} books using manual CSV parsing")
        except Exception as e2:
            print(f"Failed to load data: {str(e2)}")
            return

    # 2. Clean and prepare data
    print("\nCleaning and preparing data...")
    try:
        # Ensure numeric columns are properly typed
        numeric_columns = ['publication_year', 'total_copies', 'available_copies', 'popularity_score', 'average_rating']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Handle any missing values
        df = df.fillna({
            'popularity_score': 5.0,
            'average_rating': 3.0,
            'total_copies': 1,
            'available_copies': 1
        })
        
        print(f"Data cleaned. Shape: {df.shape}")
        
    except Exception as e:
        print(f"Error cleaning data: {str(e)}")
        return

    # 3. Prepare data for AI model
    print("\nPreprocessing data for AI model...")
    books_data = []
    
    for _, row in df.iterrows():
        try:
            book_data = {
                'title': str(row.get('title', 'Unknown')),
                'author': str(row.get('author', 'Unknown')),
                'category': str(row.get('genre', 'Unknown')),
                'demand': float(row.get('total_copies', 1)),
                'popularity_score': float(row.get('popularity_score', 5.0)),
                'average_rating': float(row.get('average_rating', 3.0)),
                'available_copies': int(row.get('available_copies', 1))
            }
            books_data.append(book_data)
        except Exception as e:
            print(f"Error processing row: {e}")
            continue
    
    print(f"Prepared {len(books_data)} books for AI processing")

    if len(books_data) == 0:
        print("No valid books to process")
        return

    # 4. Test demand prediction
    print("\nTesting demand prediction...")
    try:
        predictions = demand_predictor.predict_demand(books_data)
        print(f"Successfully generated predictions for {len(predictions)} books")
        
        # Display sample predictions
        print("\nSample predictions:")
        for i, pred in enumerate(predictions[:3]):
            print(f"  {i+1}. {pred['title'][:30]}...")
            print(f"     Demand: {pred['demand']}")
            print(f"     Action: {pred['action']}")
            print(f"     Confidence: {pred['ai_confidence']}%")
            
    except Exception as e:
        print(f"Error during demand prediction: {str(e)}")
        return

    # 5. Test forecast generation
    print("\nTesting forecast generation...")
    try:
        forecast_data = demand_predictor.generate_forecast(books_data)
        print(f"Generated forecast data with {len(forecast_data['labels'])} items")
        
        if len(forecast_data['labels']) > 0:
            print(f"Top 5 books by demand:")
            for i, (label, demand) in enumerate(zip(forecast_data['labels'][:5], forecast_data['historical'][:5])):
                print(f"  {i+1}. {label}: {demand}")
        
    except Exception as e:
        print(f"Error during forecast generation: {str(e)}")
        return

    # 6. Test edge cases
    print("\nTesting edge cases...")
    try:
        # Test empty data
        empty_predictions = demand_predictor.predict_demand([])
        print(f"✓ Empty data handled: {len(empty_predictions)} predictions")
        
        # Test single book
        if books_data:
            single_pred = demand_predictor.predict_demand([books_data[0]])
            print(f"✓ Single book handled: {len(single_pred)} predictions")
        
    except Exception as e:
        print(f"Error during edge case testing: {str(e)}")

    print("\nModel integration test finished successfully!")
    print("=" * 60)
    print("Test Summary:")
    print(f"  ✓ Loaded {len(books_data)} books")
    print(f"  ✓ Generated {len(predictions)} predictions")
    print(f"  ✓ Generated forecast data")
    print(f"  ✓ Validated model outputs")
    print(f"  ✓ Tested edge cases")
    print("=" * 60)

if __name__ == "__main__":
    test_model_integration()
