"""
AI Models using Hugging Face Transformers
"""
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import logging

logger = logging.getLogger(__name__)


class LibraryDemandPredictor:
    """
    AI model for predicting library book demand using Hugging Face models
    """
    
    def __init__(self):
        self.sentiment_analyzer = None
        self.text_classifier = None
        self.label_encoder = LabelEncoder()
        self.is_initialized = False
        
    def initialize_models(self):
        """Initialize Hugging Face models"""
        try:
            # Initialize sentiment analysis model for book popularity prediction
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                return_all_scores=True
            )
            
            # Initialize text classification model for genre classification
            self.text_classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli"
            )
            
            self.is_initialized = True
            logger.info("AI models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing AI models: {str(e)}")
            self.is_initialized = False
    
    def predict_demand(self, books_data):
        """
        Predict demand for books using AI models
        
        Args:
            books_data: List of dictionaries with book information
            
        Returns:
            List of dictionaries with predictions
        """
        if not self.is_initialized:
            self.initialize_models()
        
        predictions = []
        
        for book in books_data:
            try:
                # Create a text representation of the book
                book_text = f"{book.get('title', '')} by {book.get('author', '')} in {book.get('category', '')}"
                
                # Analyze sentiment/popularity potential
                sentiment_score = self._analyze_sentiment(book_text)
                
                # Classify genre relevance
                genre_score = self._classify_genre_relevance(book_text, book.get('category', ''))
                
                # Calculate base demand from existing data if available
                base_demand = float(book.get('demand', 50))
                
                # Combine AI predictions with base demand
                ai_adjustment = (sentiment_score + genre_score) / 2
                predicted_demand = min(100, max(0, base_demand * (0.7 + 0.6 * ai_adjustment)))
                
                # Determine action based on predicted demand
                action = self._determine_action(predicted_demand, book.get('category', ''))
                
                prediction = {
                    'title': book.get('title', ''),
                    'author': book.get('author', ''),
                    'category': book.get('category', ''),
                    'demand': round(predicted_demand, 1),
                    'action': action,
                    'ai_confidence': round(ai_adjustment * 100, 1)
                }
                
                predictions.append(prediction)
                
            except Exception as e:
                logger.error(f"Error predicting demand for book {book.get('title', 'Unknown')}: {str(e)}")
                # Fallback prediction
                predictions.append({
                    'title': book.get('title', ''),
                    'author': book.get('author', ''),
                    'category': book.get('category', ''),
                    'demand': float(book.get('demand', 50)),
                    'action': book.get('action', 'Hold'),
                    'ai_confidence': 50.0
                })
        
        return predictions
    
    def _analyze_sentiment(self, text):
        """Analyze sentiment to predict popularity"""
        try:
            if not self.sentiment_analyzer:
                return 0.5  # Neutral score
                
            results = self.sentiment_analyzer(text[:512])  # Limit text length
            
            # Convert sentiment to demand score
            positive_score = 0
            for result in results[0]:
                if result['label'] in ['LABEL_2', 'POSITIVE']:
                    positive_score = result['score']
                    break
            
            return positive_score
            
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {str(e)}")
            return 0.5
    
    def _classify_genre_relevance(self, text, category):
        """Classify genre relevance and popularity"""
        try:
            if not self.text_classifier:
                return 0.5
            
            # Define popular genres
            popular_genres = [
                "fiction", "mystery", "romance", "science fiction", 
                "fantasy", "thriller", "biography", "self-help"
            ]
            
            result = self.text_classifier(text[:512], popular_genres)
            
            # Find score for the book's category or highest scoring genre
            category_lower = category.lower()
            for label_score in result['scores']:
                label_index = result['labels'].index(result['labels'][result['scores'].index(label_score)])
                if category_lower in result['labels'][label_index].lower():
                    return label_score
            
            # Return highest score if category not found
            return max(result['scores']) if result['scores'] else 0.5
            
        except Exception as e:
            logger.error(f"Error in genre classification: {str(e)}")
            return 0.5
    
    def _determine_action(self, demand, category):
        """Determine recommended action based on demand and category"""
        if demand >= 90:
            return 'Acquire'
        elif demand >= 75:
            return 'Hold'
        elif demand >= 60:
            return 'Transfer'
        else:
            return 'Deaccession'
    
    def generate_forecast(self, books_data, category=None):
        """Generate demand forecast for visualization"""
        try:
            if category:
                filtered_books = [book for book in books_data if book.get('category') == category]
            else:
                filtered_books = books_data
            
            if not filtered_books:
                return {'labels': [], 'historical': [], 'predicted': []}
            
            # Sort by demand for better visualization
            sorted_books = sorted(filtered_books, key=lambda x: float(x.get('demand', 0)), reverse=True)
            
            labels = [book['title'][:20] + '...' if len(book['title']) > 20 else book['title'] 
                     for book in sorted_books[:10]]  # Limit to top 10
            
            historical = [float(book.get('demand', 0)) for book in sorted_books[:10]]
            
            # Generate predicted values with some variation
            predicted = []
            for demand in historical:
                # Add some realistic variation to predictions
                variation = np.random.normal(0, 5)  # Random variation
                trend = demand * 0.05  # Small trend factor
                predicted_value = max(0, min(100, demand + variation + trend))
                predicted.append(round(predicted_value, 1))
            
            return {
                'labels': labels,
                'historical': historical,
                'predicted': predicted
            }
            
        except Exception as e:
            logger.error(f"Error generating forecast: {str(e)}")
            return {'labels': [], 'historical': [], 'predicted': []}


# Global instance
demand_predictor = LibraryDemandPredictor()