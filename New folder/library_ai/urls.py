from django.urls import path
from . import views

app_name = 'library_ai'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('data-management/', views.data_management, name='data_management'),
    path('demand-forecasting/', views.demand_forecasting, name='demand_forecasting'),
    path('inventory-management/', views.inventory_management, name='inventory_management'),
    path('real-time-monitoring/', views.real_time_monitoring, name='real_time_monitoring'),
]