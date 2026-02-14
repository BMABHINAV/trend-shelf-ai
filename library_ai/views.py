from django.shortcuts import render
from django.http import JsonResponse
from .models import Book, UploadedFile


def dashboard(request):
    """Dashboard view with KPIs and overview"""
    context = {
        'total_books': Book.objects.count(),
        'page_title': 'Dashboard Overview'
    }
    return render(request, 'library_ai/dashboard.html', context)


def data_management(request):
    """Data management view for file uploads"""
    context = {
        'uploaded_files': UploadedFile.objects.all().order_by('-uploaded_at')[:10],
        'page_title': 'Data Management'
    }
    return render(request, 'library_ai/data_management.html', context)


def demand_forecasting(request):
    """Demand forecasting view with charts"""
    categories = Book.objects.values_list('category', flat=True).distinct()
    context = {
        'categories': list(categories),
        'page_title': 'Demand Forecasting'
    }
    return render(request, 'library_ai/demand_forecasting.html', context)


def inventory_management(request):
    """Inventory management view with recommendations"""
    context = {
        'page_title': 'Inventory Management'
    }
    return render(request, 'library_ai/inventory_management.html', context)


def real_time_monitoring(request):
    """Real-time monitoring view"""
    context = {
        'page_title': 'Real-time Monitoring'
    }
    return render(request, 'library_ai/real_time_monitoring.html', context)