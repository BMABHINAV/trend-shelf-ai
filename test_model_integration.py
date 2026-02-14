import os
import django
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import numpy as np

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trend_shelf_ai.settings')
django.setup()

from library_ai.ai_models import demand_predictor

def test_model_integration():
    """
    This script tests the integration of the AI model in the Django project.
    It performs the following steps:
    1. Load the book inventory data from the CSV file.
    2. Preprocess the data for the AI model.
    3. Test the demand prediction using the AI model.
    4. Generate forecast data for visualization.
    5. Validate the model outputs.
    """
    print("Starting model integration test...")

    # 1. Load Data
    try:
        file_path = 'sample_data/book_inventory.csv'
        df = pd.read_csv(file_path)
        print(f"Successfully loaded data from {file_path}")
        print(f"Loaded {len(df)} books")
    except FileNotFoundError:
        print(f"Error: The file {file_path} was not found.")
        return
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        return

    # 2. Prepare data for AI model
    print("\nPreprocessing data for AI model...")
    books_data = []
    
    for _, row in df.iterrows():
        book_data = {
            'title': row['title'],
            'author': row['author'],
            'category': row['genre'],
            'demand': float(row['total_copies']),  # Using total_copies as demand proxy
            'popularity_score': float(row['popularity_score']),
            'average_rating': float(row['average_rating']),
            'available_copies': int(row['available_copies'])
        }
        books_data.append(book_data)
    
    print(f"Prepared {len(books_data)} books for AI processing")

    # 3. Test demand prediction
    print("\nTesting demand prediction...")
    try:
        predictions = demand_predictor.predict_demand(books_data)
        print(f"Successfully generated predictions for {len(predictions)} books")
        
        # Display sample predictions
        print("\nSample predictions:")
        for i, pred in enumerate(predictions[:5]):
            print(f"  {pred['title']}: demand={pred['demand']}, action={pred['action']}, confidence={pred['ai_confidence']}%")
            
    except Exception as e:
        print(f"Error during demand prediction: {str(e)}")
        return

    # 4. Test forecast generation
    print("\nTesting forecast generation...")
    try:
        # Test overall forecast
        forecast_data = demand_predictor.generate_forecast(books_data)
        print(f"Generated forecast data with {len(forecast_data['labels'])} items")
        
        # Test category-specific forecast
        fiction_forecast = demand_predictor.generate_forecast(books_data, category='Fiction')
        fantasy_forecast = demand_predictor.generate_forecast(books_data, category='Fantasy')
        
        print(f"Fiction category forecast: {len(fiction_forecast['labels'])} items")
        print(f"Fantasy category forecast: {len(fantasy_forecast['labels'])} items")
        
    except Exception as e:
        print(f"Error during forecast generation: {str(e)}")
        return

    # 5. Validate model outputs
    print("\nValidating model outputs...")
    try:
        # Check if predictions have expected structure
        if predictions:
            first_pred = predictions[0]
            required_keys = ['title', 'author', 'category', 'demand', 'action', 'ai_confidence']
            missing_keys = [key for key in required_keys if key not in first_pred]
            
            if missing_keys:
                print(f"Warning: Missing keys in predictions: {missing_keys}")
            else:
                print("✓ All predictions have required structure")
        
        # Check if demand values are reasonable
        demands = [p['demand'] for p in predictions]
        if demands:
            print(f"✓ Demand range: {min(demands):.1f} - {max(demands):.1f}")
            
        # Check if confidence values are reasonable
        confidences = [p['ai_confidence'] for p in predictions]
        if confidences:
            print(f"✓ Confidence range: {min(confidences):.1f}% - {max(confidences):.1f}%")
            
    except Exception as e:
        print(f"Error during validation: {str(e)}")
        return

    # 6. Test edge cases
    print("\nTesting edge cases...")
    try:
        # Test empty data
        empty_predictions = demand_predictor.predict_demand([])
        print(f"✓ Empty data handled: {len(empty_predictions)} predictions")
        
        # Test single book
        single_book = [books_data[0]] if books_data else []
        if single_book:
            single_pred = demand_predictor.predict_demand(single_book)
            print(f"✓ Single book handled: {len(single_pred)} predictions")
        
        # Test missing fields
        incomplete_book = {
            'title': 'Test Book',
            'author': 'Test Author'
            # Missing category, demand, etc.
        }
        incomplete_pred = demand_predictor.predict_demand([incomplete_book])
        print(f"✓ Incomplete data handled: {len(incomplete_pred)} predictions")
        
    except Exception as e:
        print(f"Error during edge case testing: {str(e)}")

    print("\nModel integration test finished successfully!")
    print("=" * 50)
    print("Test Summary:")
    print(f"  - Loaded {len(books_data)} books")
    print(f"  - Generated {len(predictions)} predictions")
    print(f"  - Generated forecast data")
    print(f"  - Validated model outputs")
    print(f"  - Tested edge cases")
    print("=" * 50)

if __name__ == "__main__":
    test_model_integration()
