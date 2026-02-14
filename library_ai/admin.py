from django.contrib import admin
from .models import Book, UploadedFile, PredictionHistory


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'demand', 'action', 'created_at']
    list_filter = ['category', 'action', 'created_at']
    search_fields = ['title', 'author', 'category']
    list_editable = ['action']
    ordering = ['-demand']


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ['filename', 'records_count', 'processed', 'uploaded_at']
    list_filter = ['processed', 'uploaded_at']
    readonly_fields = ['uploaded_at']


@admin.register(PredictionHistory)
class PredictionHistoryAdmin(admin.ModelAdmin):
    list_display = ['book', 'predicted_demand', 'actual_demand', 'prediction_date', 'model_version']
    list_filter = ['prediction_date', 'model_version']
    readonly_fields = ['prediction_date']