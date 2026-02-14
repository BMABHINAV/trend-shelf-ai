from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Book(models.Model):
    ACTIONS = [
        ('Acquire', 'Acquire'),
        ('Hold', 'Hold'),
        ('Transfer', 'Transfer'),
        ('Deaccession', 'Deaccession'),
    ]
    
    title = models.CharField(max_length=500)
    author = models.CharField(max_length=300)
    category = models.CharField(max_length=100)
    demand = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Predicted demand percentage (0-100)"
    )
    action = models.CharField(max_length=20, choices=ACTIONS, default='Hold')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-demand', 'title']
    
    def __str__(self):
        return f"{self.title} by {self.author}"


class UploadedFile(models.Model):
    file = models.FileField(upload_to='uploads/')
    filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    records_count = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.filename} - {self.records_count} records"


class PredictionHistory(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    predicted_demand = models.FloatField()
    actual_demand = models.FloatField(null=True, blank=True)
    prediction_date = models.DateTimeField(auto_now_add=True)
    model_version = models.CharField(max_length=50, default='v1.0')
    
    class Meta:
        ordering = ['-prediction_date']