from django.urls import path
from . import api_views

urlpatterns = [
    path('upload-file/', api_views.upload_file, name='upload_file'),
    path('process-data/', api_views.process_data, name='process_data'),
    path('get-books/', api_views.get_books, name='get_books'),
    path('get-dashboard-data/', api_views.get_dashboard_data, name='get_dashboard_data'),
    path('get-demand-forecast/', api_views.get_demand_forecast, name='get_demand_forecast'),
    path('predict-demand/', api_views.predict_demand, name='predict_demand'),
    path('clear-data/', api_views.clear_data, name='clear_data'),
]